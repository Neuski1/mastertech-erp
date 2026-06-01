#!/usr/bin/env node
/**
 * Read-only discovery runner for the storage → bookkeeping investigation.
 *
 * What it does:
 *   1. Loads .env (dotenv) and reads PRODUCTION_DATABASE_URL.
 *   2. Reads scripts/storage_bookkeeping_discovery.sql.
 *   3. Runs every statement inside a `READ ONLY` transaction via the pg Pool,
 *      then ROLLBACKs — so it physically cannot write.
 *   4. Prints each result set, clearly labeled, to the console.
 *
 * It is SELECT-only by construction: any non-SELECT/WITH statement is skipped,
 * and the transaction is READ ONLY, and we ROLLBACK at the end.
 *
 * Run from the project root:
 *     node scripts/run-discovery.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const SQL_PATH = path.join(__dirname, 'storage_bookkeeping_discovery.sql');

// Split the .sql file into an ordered list of { type, text } items.
// `\echo ...` lines (psql meta-commands) become section headers; everything
// else is accumulated into SQL statements terminated by a semicolon.
function parseScript(sql) {
  const items = [];
  let buf = [];
  const flush = () => {
    const text = buf.join('\n');
    buf = [];
    const stripped = text.replace(/--[^\n]*/g, '').trim();
    if (stripped) items.push({ type: 'sql', text });
  };
  for (const line of sql.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith('\\echo')) {
      const m = t.match(/\\echo\s+'?(.*?)'?\s*$/);
      items.push({ type: 'echo', text: m ? m[1] : t.slice(5).trim() });
      continue;
    }
    buf.push(line);
    if (t.endsWith(';')) flush();
  }
  flush(); // any trailing statement without a final newline
  return items;
}

// Allow only SELECT / WITH...SELECT to actually execute.
function isSelectOnly(sql) {
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .trim();
  return /^(select|with)\b/i.test(stripped);
}

// Use the leading `-- ...` comment of a statement as its label.
function labelFor(sql, fallback) {
  for (const line of sql.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith('--')) return t.replace(/^--\s?/, '');
    if (t) break;
  }
  return fallback;
}

(async () => {
  // (1) Source of truth is PRODUCTION_DATABASE_URL ONLY. We never read
  //     DATABASE_URL and never fall back to a local default — that is exactly
  //     how a run can silently hit localhost (user "postgres").
  const url = (process.env.PRODUCTION_DATABASE_URL || '').trim();

  // (2) Guard: missing/empty → exit clearly instead of connecting to localhost.
  if (!url) {
    console.error('ERROR: PRODUCTION_DATABASE_URL is not set (or empty) in .env');
    console.error('Add a line like  PRODUCTION_DATABASE_URL=postgres://...  to .env and retry.');
    console.error('This script will NOT fall back to DATABASE_URL or localhost.');
    process.exit(1);
  }

  // (3) Show the host (and port/db/user) we are about to connect to — never the
  //     password — so it is obvious whether this is Railway prod or localhost.
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
    console.warn('\nWARNING: host resolves to LOCALHOST — this is not Railway prod.');
    console.warn('Check the PRODUCTION_DATABASE_URL value in your .env.\n');
  }

  const pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET TRANSACTION READ ONLY'); // belt-and-suspenders: no writes possible

    const items = parseScript(fs.readFileSync(SQL_PATH, 'utf8'));
    let n = 0;

    for (const item of items) {
      if (item.type === 'echo') {
        console.log('\n' + '#'.repeat(74));
        console.log('# ' + item.text);
        console.log('#'.repeat(74));
        continue;
      }
      if (!isSelectOnly(item.text)) {
        console.log('\n[skipped non-SELECT statement]');
        continue;
      }
      n += 1;
      console.log('\n--- ' + labelFor(item.text, `Query ${n}`) + ' ---');
      try {
        const res = await client.query(item.text);
        if (!res.rows || res.rows.length === 0) {
          console.log('(no rows)');
        } else {
          console.table(res.rows);
          console.log(`(${res.rows.length} row${res.rows.length === 1 ? '' : 's'})`);
        }
      } catch (e) {
        console.log('QUERY ERROR: ' + e.message);
      }
    }

    await client.query('ROLLBACK'); // ensure the connection committed nothing
    console.log('\nDone — read-only, nothing was written.');
  } finally {
    client.release();
    await pool.end();
  }
})().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
