const cron = require('node-cron');
const pool = require('../db/pool');
const { sendAppointmentReminderSMS } = require('../services/sms');

async function processAppointmentReminders() {
  // Find appointments that fall on tomorrow's Mountain Time calendar date
  // (the message says "tomorrow"), that haven't been reminded yet and have a
  // phone number. scheduled_at is TIMESTAMPTZ, so `AT TIME ZONE 'America/Denver'`
  // yields the Mountain wall-clock date regardless of the DB session timezone.
  const { rows } = await pool.query(`
    SELECT a.id, a.scheduled_at, a.customer_phone, a.appointment_type,
           c.first_name, c.phone_primary
    FROM appointments a
    JOIN customers c ON c.id = a.customer_id
    WHERE a.deleted_at IS NULL
      AND a.sms_reminder_sent = false
      AND a.status NOT IN ('cancelled', 'complete', 'no_show')
      AND (a.scheduled_at AT TIME ZONE 'America/Denver')::date
            = ((NOW() AT TIME ZONE 'America/Denver')::date + 1)
  `);

  let sent = 0;
  for (const appt of rows) {
    const phone = appt.customer_phone || appt.phone_primary;
    if (!phone) continue;
    const dt = new Date(appt.scheduled_at);
    // Convert to Mountain Time before passing to the SMS helper (same as the
    // booking confirmation in routes/appointments.js). formatApptTime expects
    // an "HH:MM" 24-hour string.
    const mtTime = dt.toLocaleTimeString('en-US', {
      timeZone: 'America/Denver',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const timeStr = dt.toLocaleTimeString('en-US', {
      timeZone: 'America/Denver',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    try {
      const result = await sendAppointmentReminderSMS(phone, {
        customerFirstName: appt.first_name,
        appointmentTime: mtTime,
        appointmentType: appt.appointment_type,
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
  // Run at :15 each hour from 8 AM through 11 PM Mountain. The 8:15 AM run sends
  // the bulk of next-day reminders; later hourly runs catch appointments booked
  // for tomorrow during the day (sms_reminder_sent dedups, so each is sent once).
  // Nothing fires overnight, so we never text customers in the middle of the night.
  cron.schedule('15 8-23 * * *', async () => {
    console.log('[apptReminderCron] running...');
    try {
      const result = await processAppointmentReminders();
      console.log('[apptReminderCron] complete:', result);
    } catch (err) {
      console.error('[apptReminderCron] fatal:', err);
    }
  }, { timezone: 'America/Denver' });
  console.log('[apptReminderCron] scheduled (:15, 8 AM–11 PM Mountain)');
}

module.exports = { startAppointmentReminderCron, processAppointmentReminders };
