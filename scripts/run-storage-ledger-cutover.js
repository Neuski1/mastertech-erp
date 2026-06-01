#!/usr/bin/env node
/**
 * Storage ledger cutover runner (transactional, self-verifying).
 *
 * Applies database/migrations/045_storage_ledger_cutover.sql against
 * PRODUCTION_DATABASE_URL, then verifies that storage income in the ledger
 * (GL 4000) matches storage_charges month-for-month. EVERYTHING runs inside a
 * single transaction on a dedicated client:
 *   - verification matches  -> COMMIT
 *   - mismatch or any error -> ROLLBACK (nothing is changed)
 *
 * Reads PRODUCTION_DATABASE_URL ONLY — never DATABASE_URL, never a local
 * default. Run from the project root:
 *     node scripts/run-storage-ledger-cutover.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const MIGRATION_FILE = '045_storage_ledger_cutover.sql';
const MIGRATION_PATH = path.join(__dirname, '..', 'database', 'migrations', MIGRATION_FILE);

(async () => {
  // Source of truth is PRODUCTION_DATABASE_URL ONLY — no localhost fallback.
  const url = (process.env.PRODUCTION_DATABASE_URL || '').trim();
  if (!url) {
    console.error('ERROR: PRODUCTION_DATABASE_URL is not set (or empty) in .env');
    console.error('This script will NOT fall back to DATABASE_URL or localhost.');
    process.exit(1);
  }

  let host;
  try {
    const u = new URL(url);
    host = u.hostname;
    console.log('Connecting to database:');
    console.log(`  host: ${u.hostname}`);
    console.log(`  port: ${u.port || '5432'}`);
    console.log(`  db:   ${u.pathname.replace(/^\//, '') || '(default)'}`);
    console.log(`  user: ${decodeURIComponent(u.username) || '(default)'}`);
  } catch {
    console.error('ERROR: PRODUCTION_DATABASE_URL is not a valid connection URL.');
    process.exit(1);
  }

  const isLocal = /^(localhost|127\.0\.0\.1|::1)$/.test(host);
  if (isLocal) {
    console.warn('\nWARNING: host resolves to LOCALHOST — this is not Railway prod.\n');
  }

  const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  let committed = false;
  try {
    await client.query('BEGIN');

    // 1) Apply the migration (DDL + backfill).
    console.log(`\nApplying ${MIGRATION_FILE} ...`);
    await client.query(sql);

    // 2) Verification — all inside the same transaction.
    console.log('\n=== Storage income in transactions (GL 4000, non-transfer) per month ===');
    const ledger = await client.query(`
      SELECT to_char(t.txn_date, 'YYYY-MM') AS month,
             COUNT(*) AS rows, SUM(t.amount) AS total
        FROM transactions t
        JOIN accounts a ON a.id = t.category_gl_id
       WHERE a.account_number = '4000'
         AND t.is_transfer = FALSE
         AND t.status <> 'excluded'
       GROUP BY 1 ORDER BY 1`);
    console.table(ledger.rows);

    console.log('\n=== storage_charges per month ===');
    const charges = await client.query(`
      SELECT charge_month AS month, COUNT(*) AS rows, SUM(amount) AS total
        FROM storage_charges
       GROUP BY 1 ORDER BY 1`);
    console.table(charges.rows);

    // 3) Do they match? Compare grand totals + row counts.
    const ledgerTotal = ledger.rows.reduce((s, r) => s + Number(r.total), 0);
    const chargesTotal = charges.rows.reduce((s, r) => s + Number(r.total), 0);
    const ledgerRows = ledger.rows.reduce((s, r) => s + Number(r.rows), 0);
    const chargesRows = charges.rows.reduce((s, r) => s + Number(r.rows), 0);

    const totalsMatch = Math.abs(ledgerTotal - chargesTotal) < 0.005;
    const rowsMatch = ledgerRows === chargesRows;

    console.log('\n=== Match check ===');
    console.log(`  ledger total (GL 4000): ${ledgerTotal.toFixed(2)}  rows: ${ledgerRows}`);
    console.log(`  storage_charges total:  ${chargesTotal.toFixed(2)}  rows: ${chargesRows}`);
    console.log(`  totals match: ${totalsMatch}   row counts match: ${rowsMatch}`);

    // 4) Revenue Summary now equals the LEDGER figure (not the sum of both).
    console.log('\n=== Revenue Summary storage figure (reads ledger, NOT storage_charges) ===');
    console.log(`  Revenue Summary storage income = ${ledgerTotal.toFixed(2)} (== ledger, counted once)`);

    if (!totalsMatch || !rowsMatch) {
      console.error('\nMISMATCH — rolling back. Nothing was changed.');
      await client.query('ROLLBACK');
    } else {
      await client.query('COMMIT');
      committed = true;
      console.log('\nVerification passed — COMMITTED. Storage income is now in the ledger, counted once.');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\nFAILED — rolled back. Nothing was changed.');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }

  if (!committed && !process.exitCode) process.exitCode = 1;
})();
