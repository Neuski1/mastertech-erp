const { google } = require('googleapis');
const pool = require('../db/pool');

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function getStoredTokens() {
  try {
    const { rows } = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'google_calendar_tokens'"
    );
    return rows[0] ? JSON.parse(rows[0].setting_value) : null;
  } catch { return null; }
}

async function storeTokens(tokens) {
  await pool.query(
    `INSERT INTO system_settings (setting_key, setting_value)
     VALUES ('google_calendar_tokens', $1)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1`,
    [JSON.stringify(tokens)]
  );
}

async function clearTokens() {
  await pool.query("DELETE FROM system_settings WHERE setting_key = 'google_calendar_tokens'");
  await pool.query("DELETE FROM system_settings WHERE setting_key = 'google_calendar_id'");
}

async function getCalendarId() {
  const { rows } = await pool.query(
    "SELECT setting_value FROM system_settings WHERE setting_key = 'google_calendar_id'"
  );
  return rows[0]?.setting_value || 'primary';
}

async function getAuthedClient() {
  const tokens = await getStoredTokens();
  if (!tokens) return null;
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(tokens);
  // Auto-refresh if expired
  oauth2.on('tokens', async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await storeTokens(merged);
  });
  return oauth2;
}

async function syncAppointmentToCalendar(appointment, action = 'create') {
  const auth = await getAuthedClient();
  if (!auth) return null; // Not connected

  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = await getCalendarId();

  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(startTime.getTime() + (appointment.duration_minutes || 60) * 60000);

  const customerName = [appointment.last_name, appointment.first_name].filter(Boolean).join(', ');
  const unitInfo = [appointment.unit_year, appointment.unit_make, appointment.unit_model].filter(Boolean).join(' ');
  const typeLabel = (appointment.appointment_type || '').replace(/_/g, ' ').toUpperCase();

  const event = {
    summary: `${typeLabel} — ${customerName}`,
    description: [
      unitInfo && `Unit: ${unitInfo}`,
      appointment.job_description && `Job: ${appointment.job_description}`,
      appointment.dropoff_notes && `Drop-off Notes: ${appointment.dropoff_notes}`,
      appointment.internal_notes && `Internal Notes: ${appointment.internal_notes}`,
    ].filter(Boolean).join('\n'),
    start: { dateTime: startTime.toISOString(), timeZone: 'America/Denver' },
    end: { dateTime: endTime.toISOString(), timeZone: 'America/Denver' },
  };

  try {
    if (action === 'create') {
      const res = await calendar.events.insert({ calendarId, resource: event });
      return res.data.id;
    } else if (action === 'update' && appointment.google_event_id) {
      await calendar.events.update({ calendarId, eventId: appointment.google_event_id, resource: event });
      return appointment.google_event_id;
    } else if (action === 'delete' && appointment.google_event_id) {
      await calendar.events.delete({ calendarId, eventId: appointment.google_event_id });
      return null;
    }
  } catch (err) {
    console.error(`Google Calendar ${action} error:`, err.message);
    return undefined; // Signal error but don't crash
  }
}

module.exports = { getOAuth2Client, getStoredTokens, storeTokens, clearTokens, getCalendarId, getAuthedClient, syncAppointmentToCalendar };
