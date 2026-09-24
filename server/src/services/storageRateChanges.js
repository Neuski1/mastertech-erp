/**
 * Storage rate changes: when a scheduled increase goes live.
 *
 * Sept 24, 2026 incident: the Rate Increase "Apply" wrote the new monthly_rate
 * straight onto storage_billing, ignoring the effective date. With an 11/1
 * increase applied on 9/24, the 9/30 run (which bills October) would have
 * invoiced and autopay-charged the new rate a month before the letter said.
 *
 * Rule now: a change logged in storage_rate_changes stays pending
 * (rate_live_at IS NULL) until the LAST DAY of the month before its effective
 * month, Denver time. That is the day the invoice and autopay engines bill the
 * effective month, so the first bill at the new rate is exactly the one the
 * notice letter names ("first shows up on the invoice we send on Oct 31").
 * Late catch-up charges for the prior month (days 1-5) and decline retries all
 * happen before that day, so they still use the old rate.
 *
 * promoteDueRateChanges() is idempotent and is called at boot, by the daily
 * autopay cron, and at the top of every invoice and charge run, so the rate is
 * live before anything bills, even if one of those callers never fires.
 */
const pool = require('../db/pool');

function denverToday() {
  const s = new Date().toLocaleString('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' });
  return s.slice(0, 10); // YYYY-MM-DD
}

// The day a change with this effective date goes live: the last day of the
// month before the effective month. '2026-11-01' -> '2026-10-31'.
function goLiveDate(effectiveDate) {
  const iso = effectiveDate instanceof Date ? effectiveDate.toISOString().slice(0, 10) : String(effectiveDate).slice(0, 10);
  const [y, m] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 0)); // day 0 of effective month = last day of prior month
  return d.toISOString().slice(0, 10);
}

function isDue(effectiveDate, today = denverToday()) {
  return goLiveDate(effectiveDate) <= today;
}

/**
 * Switch storage_billing.monthly_rate to new_rate for every pending change that
 * is due. Guarded: the box must still be at previous_rate, so a manual edit
 * made in between is never overwritten (it logs and stays pending instead).
 */
async function promoteDueRateChanges(db = pool) {
  const today = denverToday();
  const { rows } = await db.query(
    `SELECT rc.id, rc.storage_billing_id, rc.previous_rate, rc.new_rate, rc.effective_date::text AS effective_date,
            sb.monthly_rate
       FROM storage_rate_changes rc
       JOIN storage_billing sb ON sb.id = rc.storage_billing_id
      WHERE rc.rate_live_at IS NULL
        AND sb.deleted_at IS NULL
      ORDER BY rc.effective_date, rc.id`
  );
  let promoted = 0, blocked = 0;
  for (const r of rows) {
    if (!isDue(r.effective_date, today)) continue;
    const res = await db.query(
      `UPDATE storage_billing SET monthly_rate = $2::numeric, updated_at = NOW()
        WHERE id = $1 AND monthly_rate = $3::numeric`,
      [r.storage_billing_id, r.new_rate, r.previous_rate]
    );
    if (res.rowCount === 1) {
      await db.query('UPDATE storage_rate_changes SET rate_live_at = NOW() WHERE id = $1', [r.id]);
      promoted++;
    } else {
      blocked++;
      console.warn(`[rateChanges] change ${r.id} not promoted: box ${r.storage_billing_id} is at ${r.monthly_rate}, expected ${r.previous_rate}`);
    }
  }
  if (promoted || blocked) console.log(`[rateChanges] ${promoted} rate change(s) went live, ${blocked} blocked`);
  return { promoted, blocked };
}

module.exports = { promoteDueRateChanges, goLiveDate, isDue, denverToday };
