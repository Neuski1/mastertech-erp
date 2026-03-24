/**
 * Twilio SMS service — sends appointment confirmations via text.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env.
 * If not configured, silently skips without error.
 */

function isTwilioConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

/**
 * Send appointment confirmation SMS
 * @param {string} phone - Customer phone number
 * @param {object} details - { customerFirstName, appointmentDate, appointmentTime, appointmentType }
 */
async function sendAppointmentSMS(phone, { customerFirstName, appointmentDate, appointmentTime, appointmentType }) {
  if (!isTwilioConfigured()) {
    console.log('SMS not configured — skipping');
    return;
  }

  if (!phone) {
    console.log('No customer phone — skipping SMS');
    return;
  }

  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const typeLabel = appointmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const dateFormatted = new Date(appointmentDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const [h, m] = appointmentTime.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  const timeFormatted = `${hour12}:${m} ${ampm}`;

  const firstName = customerFirstName || 'there';
  const body = `Hi ${firstName}, your RV service appt at Master Tech is confirmed for ${dateFormatted} at ${timeFormatted}. Questions? Call (303) 557-2214. Reply STOP to unsubscribe.`;

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone,
    });
    console.log(`Appointment SMS sent to ${phone}`);
  } catch (err) {
    console.error('Failed to send appointment SMS:', err.message);
    // Do not throw — SMS failure should not block appointment creation
  }
}

module.exports = { sendAppointmentSMS };
