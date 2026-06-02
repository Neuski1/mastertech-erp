#!/usr/bin/env node
/**
 * READ-ONLY: list active storage boxes missing a recurring-invoice series id
 * (square_sub_id). These boxes are skipped by the Square payment-grid sync, so
 * fill in each one's series id (from Square's "Recurring series" list) to bring
 * it into the sync.
 *
 * Reads PRODUCTION_DATABASE_URL ONLY (guard if missing, prints host first).
 * Runs a single SELECT inside a READ ONLY transaction and ROLLBACKs — it
 * physically cannot write. Run from the project root:
 *     node scripts/list-boxes-missing-series.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = require('pg');

(async () => {
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
  } catch {
    console.error('ERROR: PRODUCTION_DATABASE_URL is not a valid connection URL.');
    process.exit(1);
  }

  const isLocal = /^(localhost|127\.0\.0\.1|::1)$/.test(host);
  if (isLocal) console.warn('\nWARNING: host resolves to LOCALHOST — this is not Railway prod.\n');

  const pool = new Pool({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET TRANSACTION READ ONLY');

    const { rows } = await client.query(`
      SELECT sb.id AS billing_id,
             s.label AS space_label,
             COALESCE(c.company_name,
                      NULLIF(TRIM(CONCAT_WS(', ', c.last_name, c.first_name)), '')) AS customer
        FROM storage_billing sb
        LEFT JOIN storage_spaces s ON s.id = sb.space_id
        JOIN customers c ON c.id = sb.customer_id
       WHERE sb.deleted_at IS NULL
         AND sb.billing_end_date IS NULL
         AND (sb.square_sub_id IS NULL OR sb.square_sub_id = '')
       ORDER BY s.label
    `);

    console.log(`\nActive boxes missing square_sub_id: ${rows.length}`);
    if (rows.length) console.table(rows);
    else console.log('(none — every active box has a series id)');

    await client.query('ROLLBACK'); // read-only; commit nothing
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
