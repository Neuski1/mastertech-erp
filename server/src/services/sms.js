/**
 * SMS service — central sender with customer opt-out awareness.
 * Provider: Dialpad (https://developers.dialpad.com/reference/smssend)
 * Requires DIALPAD_API_KEY and DIALPAD_FROM_NUMBER in env.
 *
 * Function signatures preserved from the prior Twilio implementation so
 * callers (appointmentReminderCron, appointments.js, paymentReminders.js,
 * reviewRequestCron) don't need to change.
 */

const pool = require('../db/pool');
const { sendDialpadSMS, isDialpadConfigured } = require('./dialpad');

// Back-compat alias — older callers may still import isTwilioConfigured.
function isTwilioConfigured() {
  return isDialpadConfigured();
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
  if (!isDialpadConfigured()) {
    console.log('[sms] Dialpad not configured — skipping');
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

  const result = await sendDialpadSMS(to, body);
  if (result.success) {
    console.log(`[sms] sent to ${to} (id=${result.id || 'n/a'})`);
    return { success: true, sid: result.id };
  }
  return { success: false, error: result.error };
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

const APPT_TYPE_LABELS = {
  storage_pickup:      'Storage Pickup',
  storage_drop_off:    'Storage Drop Off',
  rv_service_pickup:   'RV Service Pickup',
  rv_service_drop_off: 'RV Service Drop Off',
  rv_diagnostics:      'RV Diagnostics',
  rv_estimate_build:   'RV Estimate Build',
  rv_repair:           'RV Repair',
  rv_service:          'RV Service',
  parts:               'Parts',
  storage:             'Storage',
  drop_off:            'Drop Off',
  pick_up:             'Pick Up',
  other:               'Appointment',
};
function formatApptTypeLabel(t) {
  if (!t) return 'appointment';
  if (APPT_TYPE_LABELS[t]) return APPT_TYPE_LABELS[t];
  return String(t).replace(/_/g, ' ').replace(/\bRv\b/gi, 'RV').replace(/\b\w/g, c => c.toUpperCase());
}

async function sendAppointmentSMS(phone, { customerFirstName, appointmentDate, appointmentTime, appointmentType }) {
  const firstName = customerFirstName || 'there';
  const dateFormatted = formatApptDate(appointmentDate);
  const timeFormatted = formatApptTime(appointmentTime);
  const typeLabel = formatApptTypeLabel(appointmentType);
  const body = `Hi ${firstName}, your ${typeLabel} appointment at Master Tech is confirmed for ${dateFormatted} at ${timeFormatted}. Directions: https://maps.google.com/?q=6590+E+49th+Ave+Commerce+City+CO+80022 Questions? Call (303) 557-2214. Reply STOP to opt out.`;
  return sendSMS(phone, body);
}

async function sendAppointmentReminderSMS(phone, { customerFirstName, appointmentTime, appointmentType }) {
  const firstName = customerFirstName || 'there';
  const timeFormatted = formatApptTime(appointmentTime);
  const typeLabel = formatApptTypeLabel(appointmentType);
  const body = `Hi ${firstName}, reminder: your ${typeLabel} appointment at Master Tech is tomorrow at ${timeFormatted}. Directions: https://maps.google.com/?q=6590+E+49th+Ave+Commerce+City+CO+80022 Questions? Call (303) 557-2214. Reply STOP to opt out.`;
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
  // Both names exported so legacy and new callers work
  isTwilioConfigured,
  isSmsConfigured: isDialpadConfigured,
  isPhoneOptedOut,
  normalizePhone,
};
