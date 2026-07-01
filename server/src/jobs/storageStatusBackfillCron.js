const cron = require('node-cron');
const pool = require('../db/pool');

/**
 * Ensure every active storage_billing has a storage_payment_status row for the
 * current month. New rows default to 'unpaid' (source='auto') so the Square
 * sync can later flip them to 'paid' when an invoice closes. Existing rows
 * are never touched (ON CONFLICT DO NOTHING).
 *
 * This closes the gap where boxes paid by cash/check (no Square subscription)
 * never showed up in the payment grid or rolled into storage revenue.
 */
async function ensureCurrentMonthStorageStatus() {
  const { rows: [stamp] } = await pool.query(`
    SELECT EXTRACT(YEAR  FROM (NOW() AT TIME ZONE 'America/Denver'))::int AS y,
           EXTRACT(MONTH FROM (NOW() AT TIME ZONE 'America/Denver'))::int AS m
  `);
  const result = await pool.query(`
    INSERT INTO storage_payment_status
      (storage_billing_id, year, month, status, source, amount)
    SELECT sb.id, $1, $2, 'unpaid', 'auto', sb.monthly_rate
      FROM storage_billing sb
     WHERE sb.deleted_at IS NULL
       AND sb.billing_start_date <= (NOW() AT TIME ZONE 'America/Denver')::date
       AND (sb.billing_end_date IS NULL
            OR sb.billing_end_date >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Denver'))
    ON CONFLICT (storage_billing_id, year, month) DO NOTHING
  `, [stamp.y, stamp.m]);
  return { year: stamp.y, month: stamp.m, inserted: result.rowCount };
}

function startStorageStatusBackfillCron() {
  // Run on app boot so a fresh deploy immediately backfills the current month.
  ensureCurrentMonthStorageStatus()
    .then(r => console.log(`[storageStatusBackfill] boot ${r.year}-${String(r.month).padStart(2,'0')}: ${r.inserted} stub row(s) created`))
    .catch(err => console.error('[storageStatusBackfill] boot error:', err.message));

  // Then every day at 00:05 Mountain. The first run of a new month picks up
  // any boxes added late the prior day; subsequent daily runs are no-ops.
  cron.schedule('5 0 * * *', async () => {
    try {
      const r = await ensureCurrentMonthStorageStatus();
      console.log(`[storageStatusBackfill] daily ${r.year}-${String(r.month).padStart(2,'0')}: ${r.inserted} stub row(s) created`);
    } catch (err) {
      console.error('[storageStatusBackfill] daily error:', err.message);
    }
  }, { timezone: 'America/Denver' });
  console.log('[storageStatusBackfill] scheduled (00:05 Mountain, plus boot)');
}

module.exports = { startStorageStatusBackfillCron, ensureCurrentMonthStorageStatus };
