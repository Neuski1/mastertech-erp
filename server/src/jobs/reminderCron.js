const cron = require('node-cron');
const { processAutomaticReminders } = require('../services/paymentReminders');

function startReminderCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[reminderCron] Starting payment reminder run...');
    try {
      const result = await processAutomaticReminders();
      console.log('[reminderCron] Complete:', result);
    } catch (err) {
      console.error('[reminderCron] Fatal error:', err);
    }
  }, { timezone: 'America/Denver' });
  console.log('[reminderCron] Payment reminder cron scheduled (daily 9 AM Mountain)');
}

module.exports = { startReminderCron };
