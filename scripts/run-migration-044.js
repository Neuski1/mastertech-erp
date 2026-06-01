#!/usr/bin/env node
/**
 * Migration 044 runner (transactional).
 *
 * Applies database/migrations/044_storage_payment_grid.sql against
 * PRODUCTION_DATABASE_URL on a dedicated client inside ONE transaction:
 *   - table created & verified present -> COMMIT
 *   - any error                        -> ROLLBACK (nothing changed)
 *
 * 044 defines storage_payment_status (the "Sync from Square" payment grid).
 * It was never run against prod, so live syncs fail with
 *   relation "storage_payment_status" does not exist
 *
 * Reads PRODUCTION_DATABASE_URL ONLY — never DATABASE_URL, never a local
 * default. Run from the project root:
 *     node scripts/run-migration-044.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const MIGRATION_FILE = '044_storage_payment_grid.sql';
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

    console.log(`\nApplying ${MIGRATION_FILE} ...`);
    await client.query(sql);

    // Verify the table now exists (to_regclass is NULL if it does not).
    const { rows: [{ exists }] } = await client.query(
      "SELECT to_regclass('public.storage_payment_status') IS NOT NULL AS exists"
    );
    console.log(`\nstorage_payment_status exists: ${exists}`);

    if (!exists) {
      console.error('Table not present after migration — rolling back. Nothing changed.');
      await client.query('ROLLBACK');
    } else {
      await client.query('COMMIT');
      committed = true;
      console.log('\nCOMMITTED — storage_payment_status is now present. "Sync from Square" should work.');
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
