// Nightly database backup, run INSIDE the ERP server on Railway.
//
// Why this lives in the server and not a local PC script:
//   The old backup was a Windows Task Scheduler job that pg_dumped Railway
//   using a hard-coded postgres password. Railway rotates that password
//   (see cowork-admin.js), so the script silently failed for six weeks
//   starting 6/4/2026. Running here means we reuse the app's own pool, whose
//   DATABASE_URL Railway always keeps current -- it can never go stale.
//
// What it produces:
//   A gzipped JSON snapshot of every table, emailed to the office. Large
//   binary columns (photo/document bytea) are omitted to keep the attachment
//   emailable; their rows are still captured (metadata), and the omitted
//   columns are named in the manifest. A periodic full export (including the
//   image bytes) is handled separately.
//
// Self-alerting: on success it emails the backup; on failure it emails a
// clearly-subject-lined alert, so a silent lapse like the last one cannot recur.

const cron = require('node-cron');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');

const BACKUP_TO = 'service@mastertechrvrepair.com';

async function buildBackup() {
  // Every base table in the public schema.
  const { rows: tblRows } = await pool.query(
    `SELECT c.relname AS table
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND n.nspname = 'public'
      ORDER BY c.relname`
  );
  const tables = tblRows.map(r => r.table);

  // Binary columns to skip (kept out of the emailed dump for size). Detected
  // dynamically so a new bytea column is handled without touching this file.
  const { rows: byteaRows } = await pool.query(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND data_type = 'bytea'`
  );
  const omittedByTable = {};
  for (const r of byteaRows) {
    (omittedByTable[r.table_name] = omittedByTable[r.table_name] || []).push(r.column_name);
  }

  const dump = {
    generated_at: new Date().toISOString(),
    source: 'mastertech-erp Railway Postgres (server-side nightly backup)',
    note: 'Binary image/document columns are omitted to keep this emailable; see omitted_binary_columns.',
    omitted_binary_columns: omittedByTable,
    row_counts: {},
    tables: {},
  };

  for (const tbl of tables) {
    const omit = omittedByTable[tbl] || [];
    let selectList = '*';
    if (omit.length) {
      const { rows: colRows } = await pool.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position`, [tbl]
      );
      selectList = colRows
        .map(c => c.column_name)
        .filter(c => !omit.includes(c))
        .map(c => `"${c}"`)
        .join(', ');
    }
    const { rows } = await pool.query(`SELECT ${selectList} FROM "${tbl}"`);
    dump.tables[tbl] = rows;
    dump.row_counts[tbl] = rows.length;
  }

  const json = JSON.stringify(dump);
  const gz = await gzip(Buffer.from(json, 'utf8'));
  return { gz, tableCount: tables.length, rowCounts: dump.row_counts, rawBytes: json.length };
}

async function runDatabaseBackup() {
  const stamp = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }); // YYYY-MM-DD
  console.log('[dbBackupCron] Starting database backup...');
  try {
    const { gz, tableCount, rowCounts, rawBytes } = await buildBackup();
    const sizeMB = (gz.length / 1048576).toFixed(2);
    const filename = `mastertech-erp-backup-${stamp}.json.gz`;

    // Guard against Resend's attachment ceiling. Structured data should be a
    // few MB; if it ever balloons past ~18MB, still alert so it is not silent.
    if (gz.length > 18 * 1048576) {
      await sendEmail({
        to: BACKUP_TO,
        subject: `ERP BACKUP TOO LARGE TO EMAIL (${sizeMB} MB) -- ${stamp}`,
        text: `The nightly ERP backup compressed to ${sizeMB} MB, above the email limit. The backup ran fine but was not attached. Ask Claude to switch to a storage-based delivery.`,
      });
      console.error(`[dbBackupCron] Backup ${sizeMB}MB exceeds email limit; alert sent.`);
      return { ok: false, reason: 'too_large', sizeMB };
    }

    const topTables = Object.entries(rowCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([t, n]) => `  ${t}: ${n}`).join('\n');

    const result = await sendEmail({
      to: BACKUP_TO,
      subject: `ERP nightly backup -- ${stamp} (${sizeMB} MB, ${tableCount} tables)`,
      text:
`Master Tech RV ERP nightly database backup.

Date: ${stamp}
Tables: ${tableCount}
Compressed size: ${sizeMB} MB
Uncompressed JSON: ${(rawBytes / 1048576).toFixed(1)} MB

Attached: ${filename}
Restore: gunzip the file to get one JSON object with every table's rows.
Photos and scanned documents (binary) are excluded from this daily email to
keep it small; keep the periodic full backup for those.

Largest tables:
${topTables}

If this email ever stops arriving, the backup has stopped -- investigate.`,
      attachments: [{ filename, content: gz, contentType: 'application/gzip' }],
    });

    if (!result || result.success === false) {
      console.error('[dbBackupCron] Backup built but email failed:', result && result.error);
      return { ok: false, reason: 'email_failed', error: result && result.error };
    }
    console.log(`[dbBackupCron] Backup emailed: ${filename} (${sizeMB} MB, ${tableCount} tables)`);
    return { ok: true, filename, sizeMB, tableCount };
  } catch (err) {
    console.error('[dbBackupCron] FATAL:', err.message);
    // Never fail silently -- send an alert so the lapse is visible.
    try {
      await sendEmail({
        to: BACKUP_TO,
        subject: `ERP BACKUP FAILED -- ${stamp}`,
        text: `The nightly ERP database backup failed.\n\nError: ${err.message}\n\nThe backup did NOT run. Please look into it.`,
      });
    } catch (alertErr) {
      console.error('[dbBackupCron] Could not send failure alert:', alertErr.message);
    }
    return { ok: false, reason: 'exception', error: err.message };
  }
}

function startDbBackupCron() {
  // Daily at 2:00 AM Mountain, matching the old local job's schedule.
  cron.schedule('0 2 * * *', () => { runDatabaseBackup(); }, { timezone: 'America/Denver' });
  console.log('[dbBackupCron] Database backup cron scheduled (daily 2 AM Mountain)');
}

module.exports = { startDbBackupCron, runDatabaseBackup };
