const cron = require('node-cron');
const pool = require('../db/pool');
const { sendAppointmentReminderSMS } = require('../services/sms');

async function processAppointmentReminders() {
  // Find upcoming appointments scheduled between 24 and 25 hours from now
  // that haven't been reminded yet and have a phone number.
  const { rows } = await pool.query(`
    SELECT a.id, a.scheduled_at, a.customer_phone,
           c.first_name, c.phone_primary
    FROM appointments a
    JOIN customers c ON c.id = a.customer_id
    WHERE a.deleted_at IS NULL
      AND a.sms_reminder_sent = false
      AND a.status NOT IN ('cancelled', 'complete', 'no_show')
      AND a.scheduled_at >= NOW() + INTERVAL '24 hours'
      AND a.scheduled_at <  NOW() + INTERVAL '25 hours'
  `);

  let sent = 0;
  for (const appt of rows) {
    const phone = appt.customer_phone || appt.phone_primary;
    if (!phone) continue;
    const dt = new Date(appt.scheduled_at);
    // Format time in Mountain Time
    const timeStr = dt.toLocaleTimeString('en-US', {
      timeZone: 'America/Denver',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    try {
      const result = await sendAppointmentReminderSMS(phone, {
        customerFirstName: appt.first_name,
        // pass already-formatted string via the time slot: keep original helper compatibility
        appointmentTime: dt.toTimeString().slice(0, 5),
      });
      if (result.success) {
        await pool.query('UPDATE appointments SET sms_reminder_sent = true WHERE id = $1', [appt.id]);
        sent++;
        console.log(`[apptReminderCron] sent reminder for appt ${appt.id} at ${timeStr}`);
      } else if (result.skipped === 'opted_out') {
        // Mark sent anyway so we don't retry every hour
        await pool.query('UPDATE appointments SET sms_reminder_sent = true WHERE id = $1', [appt.id]);
      }
    } catch (err) {
      console.error(`[apptReminderCron] appt ${appt.id} error:`, err.message);
    }
  }
  return { eligible: rows.length, sent };
}

function startAppointmentReminderCron() {
  // Run hourly at :15
  cron.schedule('15 * * * *', async () => {
    console.log('[apptReminderCron] running...');
    try {
      const result = await processAppointmentReminders();
      console.log('[apptReminderCron] complete:', result);
    } catch (err) {
      console.error('[apptReminderCron] fatal:', err);
    }
  }, { timezone: 'America/Denver' });
  console.log('[apptReminderCron] scheduled (hourly at :15 Mountain)');
}

module.exports = { startAppointmentReminderCron, processAppointmentReminders };
