// Daily automatic Plaid transaction sync for all connected institutions
// (Chase + Wells Fargo). Mirrors the manual "Sync" button in the Bookkeeping
// module so the bookkeeper never has to click it. Runs once a day in the
// morning Mountain time, after banks have posted the prior day's activity.
//
// Safe to run repeatedly: syncActiveItems is cursor-based and idempotent — it
// only pulls what's new since the last cursor and upserts, never double-counts.

const cron = require('node-cron');
const pool = require('../db/pool');
const plaidRouter = require('../routes/plaid');

async function runPlaidSync() {
  try {
    const results = await plaidRouter.syncActiveItems();
    const totals = results.reduce(
      (a, r) => ({ added: a.added + r.added, modified: a.modified + r.modified, removed: a.removed + r.removed }),
      { added: 0, modified: 0, removed: 0 }
    );
    console.log('[plaidSyncCron] synced', results.length, 'institution(s):', JSON.stringify(totals));
    try {
      await pool.query(
        `INSERT INTO system_settings (key, value, description)
         VALUES ('plaid_sync_last_run', $1, 'Timestamp of last automatic Plaid sync')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [new Date().toISOString()]
      );
    } catch (e) { /* system_settings optional */ }
    return totals;
  } catch (err) {
    console.error('[plaidSyncCron] sync failed:', err.response?.data || err.message);
  }
}

function startPlaidSyncCron() {
  // Daily at 6:00 AM Mountain — banks have posted overnight by then.
  cron.schedule('0 6 * * *', () => { runPlaidSync(); }, { timezone: 'America/Denver' });
  console.log('[plaidSyncCron] Plaid daily sync scheduled (6 AM Mountain)');
}

module.exports = { startPlaidSyncCron, runPlaidSync };
