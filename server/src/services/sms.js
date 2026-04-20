/**
 * Twilio SMS service — central sender with customer opt-out awareness.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in env.
 */

const pool = require('../db/pool');

function isTwilioConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

// Normalize US phone number to E.164
function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (String(raw).trim().startsWith('+')) return String(raw).trim();
  return null;
}

// Check whether a phone belongs to a customer who has opted out
async function isPhoneOptedOut(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (!digits) return false;
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM customers
       WHERE sms_opt_out = true
         AND (
           regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
           OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1
         )
       LIMIT 1`,
      [`%${digits}`]
    );
    return rows.length > 0;
  } catch (err) {
    console.error('[sms] opt-out lookup failed:', err.message);
    return false;
  }
}

/**
 * Core SMS sender with opt-out check. Silently skips if unconfigured or opted out.
 * Returns { success, skipped?, error? }
 */
async function sendSMS(rawPhone, body) {
  if (!isTwilioConfigured()) {
    console.log('[sms] Twilio not configured — skipping');
    return { success: false, skipped: 'not_configured' };
  }
  const to = normalizePhone(rawPhone);
  if (!to) {
    console.log('[sms] invalid phone — skipping:', rawPhone);
    return { success: false, skipped: 'invalid_phone' };
  }
  if (await isPhoneOptedOut(to)) {
    console.log(`[sms] ${to} has opted out — skipping`);
    return { success: false, skipped: 'opted_out' };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });
    console.log(`[sms] sent to ${to} (sid=${msg.sid})`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`[sms] send to ${to} failed:`, err.message);
    return { success: false, error: err.message };
  }
}

// Format date/time helpers
function formatApptDate(appointmentDate) {
  return new Date(appointmentDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatApptTime(appointmentTime) {
  const [h, m] = appointmentTime.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

async function sendAppointmentSMS(phone, { customerFirstName, appointmentDate, appointmentTime }) {
  const firstName = customerFirstName || 'there';
  const dateFormatted = formatApptDate(appointmentDate);
  const timeFormatted = formatApptTime(appointmentTime);
  const body = `Hi ${firstName}, your RV service appt at Master Tech is confirmed for ${dateFormatted} at ${timeFormatted}. Questions? Call (303) 557-2214. Reply STOP to opt out.`;
  return sendSMS(phone, body);
}

async function sendAppointmentReminderSMS(phone, { customerFirstName, appointmentTime }) {
  const firstName = customerFirstName || 'there';
  const timeFormatted = formatApptTime(appointmentTime);
  const body = `Hi ${firstName}, reminder: your RV service appt at Master Tech is tomorrow at ${timeFormatted}. Questions? Call (303) 557-2214. Reply STOP to opt out.`;
  return sendSMS(phone, body);
}

async function sendPaymentReminderSMS(phone, { customerFirstName, amountDue }) {
  const firstName = customerFirstName || 'there';
  const body = `Hi ${firstName}, your Master Tech RV invoice of $${amountDue} is due. Pay online: https://pay.mastertechrvrepair.com/ Questions? Call (303) 557-2214. Reply STOP to opt out.`;
  return sendSMS(phone, body);
}

module.exports = {
  sendSMS,
  sendAppointmentSMS,
  sendAppointmentReminderSMS,
  sendPaymentReminderSMS,
  isTwilioConfigured,
  isPhoneOptedOut,
  normalizePhone,
};
