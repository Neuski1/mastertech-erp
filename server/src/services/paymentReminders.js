/**
 * Payment Reminder Service
 * Sends payment reminders via email and/or SMS based on customer communication preferences.
 */

const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const { getSettingString } = require('../db/calculations');

// ── Nodemailer transporter (same pattern as services/email.js) ──

let transporter = null;
let useResend = false;

if (process.env.RESEND_API_KEY) {
  useResend = true;
} else if (process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// ── Twilio check (same pattern as services/sms.js) ──

function isTwilioConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

// ── Email sending helper ──

async function sendReminderEmail(to, subject, html) {
  if (useResend) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'Master Tech RV <service@mastertechrvrepair.com>';
    const result = await resend.emails.send({ from, to, subject, html });
    return result;
  } else if (transporter) {
    const from = process.env.EMAIL_FROM || 'Master Tech RV <service@mastertechrvrepair.com>';
    const result = await transporter.sendMail({ from, to, subject, html });
    return result;
  } else {
    console.log('[paymentReminders] No email transport configured — skipping email');
    return null;
  }
}

// ── Build branded HTML email ──

function buildReminderEmailHtml({ customerName, amountDue, invoiceNumber, unitInfo, reminderCount }) {
  const countNote = reminderCount >= 2
    ? `<p style="color:#dc2626;font-weight:600;margin:0 0 16px">This is reminder #${reminderCount}.</p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;background:#ffffff">
    <div style="background:#1e3a5f;padding:24px;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:1px">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    </div>
    <div style="padding:24px 32px">
      <p style="margin:0 0 16px;font-size:16px">Hi ${customerName},</p>
      ${countNote}
      <p style="margin:0 0 12px">This is a friendly reminder that you have an outstanding balance:</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 20px">
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1e3a5f">Amount Due: $${amountDue}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151">Invoice #${invoiceNumber}</p>
        ${unitInfo ? `<p style="margin:0;font-size:14px;color:#6b7280">${unitInfo}</p>` : ''}
      </div>
      <p style="margin:0 0 12px;font-weight:600">Payment Options:</p>
      <ul style="margin:0 0 20px;padding-left:20px;line-height:1.8">
        <li><strong>Credit/Debit Card:</strong> <a href="https://pay.mastertechrvrepair.com/" style="color:#2563eb">pay.mastertechrvrepair.com</a></li>
        <li><strong>Zelle:</strong> Carol@mastertechrvrepair.com</li>
        <li><strong>Check:</strong> Mail to our address below</li>
        <li><strong>Cash:</strong> In person at our shop</li>
      </ul>
      <p style="margin:0 0 8px">Questions? Call us at <strong>(303) 557-2214</strong></p>
      <p style="margin:0;font-size:14px;color:#6b7280">Thank you for your business!</p>
    </div>
    <div style="background:#f3f4f6;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">
      <p style="margin:0">Master Tech RV Repair &amp; Storage</p>
      <p style="margin:4px 0 0">7250 W. 52nd Ave Unit H &bull; Arvada, CO 80002</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Build SMS (under 160 chars) ──

function buildReminderSms({ firstName, amountDue, invoiceNumber }) {
  return `Hi ${firstName}, reminder: $${amountDue} due on Invoice #${invoiceNumber} at Master Tech RV. Call (303) 557-2214. Reply STOP to unsubscribe.`;
}

// ── Main: send payment reminder for a single record ──

async function sendPaymentReminder(recordId, { isManual = false, sentByUserId = null } = {}) {
  // Fetch record + customer + unit
  const { rows } = await pool.query(
    `SELECT r.*, c.first_name, c.last_name, c.email_primary, c.phone_primary,
            c.comm_preference,
            u.year AS unit_year, u.make AS unit_make, u.model AS unit_model
     FROM records r
     JOIN customers c ON c.id = r.customer_id
     LEFT JOIN units u ON u.id = r.unit_id
     WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [recordId]
  );

  if (rows.length === 0) {
    return { success: false, reason: 'Record not found' };
  }

  const rec = rows[0];
  const amountDue = parseFloat(rec.amount_due) || 0;

  // Validate status and amount
  if (!['payment_pending', 'partial'].includes(rec.status)) {
    return { success: false, reason: `Record status is "${rec.status}" — must be payment_pending or partial` };
  }
  if (amountDue <= 0) {
    return { success: false, reason: 'No amount due on this record' };
  }

  const commPref = (rec.comm_preference || 'both').toLowerCase();
  if (commPref === 'none') {
    return { success: false, reason: 'Customer communication preference is set to "none"' };
  }

  const customerName = [rec.first_name, rec.last_name].filter(Boolean).join(' ') || 'Customer';
  const firstName = rec.first_name || 'there';
  const invoiceNumber = rec.record_number;
  const unitParts = [rec.unit_year, rec.unit_make, rec.unit_model].filter(Boolean);
  const unitInfo = unitParts.length > 0 ? unitParts.join(' ') : '';
  const newReminderCount = (parseInt(rec.reminder_count) || 0) + 1;

  let emailSent = false;
  let smsSent = false;

  // Send email if preference allows
  if (['email', 'both'].includes(commPref) && rec.email_primary) {
    try {
      const subject = `Payment Reminder — Invoice #${invoiceNumber} — $${amountDue.toFixed(2)} Due`;
      const html = buildReminderEmailHtml({
        customerName,
        amountDue: amountDue.toFixed(2),
        invoiceNumber,
        unitInfo,
        reminderCount: newReminderCount,
      });
      await sendReminderEmail(rec.email_primary, subject, html);
      emailSent = true;
      console.log(`[paymentReminders] Email sent to ${rec.email_primary} for record #${invoiceNumber}`);
    } catch (err) {
      console.error(`[paymentReminders] Email failed for record #${invoiceNumber}:`, err.message);
    }
  }

  // Send SMS if preference allows
  if (['text', 'both'].includes(commPref) && rec.phone_primary && isTwilioConfigured()) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const body = buildReminderSms({
        firstName,
        amountDue: amountDue.toFixed(2),
        invoiceNumber,
      });
      await client.messages.create({
        body,
        from: process.env.TWILIO_FROM_NUMBER,
        to: rec.phone_primary,
      });
      smsSent = true;
      console.log(`[paymentReminders] SMS sent to ${rec.phone_primary} for record #${invoiceNumber}`);
    } catch (err) {
      console.error(`[paymentReminders] SMS failed for record #${invoiceNumber}:`, err.message);
    }
  }

  // Update record: last_reminder_sent_at, reminder_count
  await pool.query(
    `UPDATE records SET last_reminder_sent_at = NOW(), reminder_count = $2 WHERE id = $1`,
    [recordId, newReminderCount]
  );

  // Log to communication_log
  const channels = [];
  if (emailSent) channels.push('email');
  if (smsSent) channels.push('sms');

  if (channels.length > 0) {
    await pool.query(
      `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id, sent_at)
       VALUES ($1, $2, $3, 'payment_reminder', $4, 'sent', $5, $6, NOW())`,
      [
        rec.customer_id,
        recordId,
        channels.join(','),
        `Payment reminder #${newReminderCount} — $${amountDue.toFixed(2)} due on Invoice #${invoiceNumber}`,
        isManual,
        sentByUserId,
      ]
    );
  }

  return {
    success: true,
    emailSent,
    smsSent,
    reminderCount: newReminderCount,
    amountDue: amountDue.toFixed(2),
  };
}

// ── Process automatic reminders (called by cron) ──

async function processAutomaticReminders() {
  // Check if reminders are enabled
  const enabled = await getSettingString('payment_reminders_enabled');
  if (enabled !== 'true') {
    console.log('[paymentReminders] Automatic reminders are disabled');
    return { sent: 0, skipped: 'disabled' };
  }

  // Find eligible records: payment_pending or partial, amount_due > 0,
  // payment_pending_since is set, and either never reminded or last reminded 3+ days ago
  const { rows: eligible } = await pool.query(`
    SELECT r.id, r.record_number
    FROM records r
    WHERE r.deleted_at IS NULL
      AND r.status IN ('payment_pending', 'partial')
      AND r.amount_due > 0
      AND r.payment_pending_since IS NOT NULL
      AND (
        r.last_reminder_sent_at IS NULL
        OR r.last_reminder_sent_at < NOW() - INTERVAL '3 days'
      )
    ORDER BY r.payment_pending_since ASC
  `);

  console.log(`[paymentReminders] Found ${eligible.length} eligible records`);

  let sentCount = 0;
  for (const rec of eligible) {
    try {
      const result = await sendPaymentReminder(rec.id, { isManual: false });
      if (result.success) {
        sentCount++;
        console.log(`[paymentReminders] Sent reminder for record #${rec.record_number}`);
      } else {
        console.log(`[paymentReminders] Skipped record #${rec.record_number}: ${result.reason}`);
      }
    } catch (err) {
      console.error(`[paymentReminders] Error on record #${rec.record_number}:`, err.message);
    }
  }

  // Update last run settings
  await pool.query(
    `UPDATE system_settings SET setting_value = $1 WHERE setting_key = 'payment_reminders_last_run'`,
    [new Date().toISOString()]
  );
  await pool.query(
    `UPDATE system_settings SET setting_value = $1 WHERE setting_key = 'payment_reminders_last_run_count'`,
    [String(sentCount)]
  );

  return { sent: sentCount, eligible: eligible.length };
}

module.exports = { sendPaymentReminder, processAutomaticReminders };
