#!/usr/bin/env node
/**
 * Database migration runner for Master Tech RV ERP
 * Usage: node server/scripts/migrate.js
 *
 * - Connects using DATABASE_URL
 * - Creates schema_migrations tracking table if needed
 * - Runs numbered .sql files (001_*, 002_*, ...) in order
 * - Skips already-applied migrations
 * - Wraps each migration in a transaction
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app')
    ? { rejectUnauthorized: false }
    : undefined,
});

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');

async function migrate() {
  const client = await pool.connect();

  try {
    // Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of already-applied migrations
    const { rows: applied } = await client.query(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    );
    const appliedSet = new Set(applied.map(r => r.filename));

    // Read all .sql files sorted by name (only numbered ones like 001_*, 002_*)
    const allFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && /^\d{3}_/.test(f))
      .sort();

    const pending = allFiles.filter(f => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log('All migrations are up to date.');
      return;
    }

    console.log(`Found ${pending.length} pending migration(s):\n`);

    for (const filename of pending) {
      const filePath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Running: ${filename} ...`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [filename]
        );
        await client.query('COMMIT');
        console.log(`  ✓ ${filename} applied successfully`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${filename} FAILED:`, err.message);
        process.exit(1);
      }
    }

    console.log(`\nAll ${pending.length} migration(s) applied successfully.`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
