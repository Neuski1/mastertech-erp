/*
 VERCEL PRODUCTION SETUP — REQUIRED ENVIRONMENT VARIABLES:
 Go to: Vercel Dashboard → Settings → Environment Variables
 Required: EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 See .env.example for placeholder values. Never hardcode credentials in code.
*/
const nodemailer = require('nodemailer');
const dns = require('dns');
const ics = require('ics');

// Railway IPv6 to Gmail is ENETUNREACH. Resolve IPv4 at startup and connect directly.
const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
let transporter = null;

(async function initSmtp() {
  let connectHost = smtpHost;
  try {
    const addresses = await dns.promises.resolve4(smtpHost);
    connectHost = addresses[0];
    console.log(`Resolved ${smtpHost} → ${connectHost} (IPv4)`);
  } catch (err) {
    console.error(`DNS resolve4 failed for ${smtpHost}:`, err.message, '— falling back to hostname');
  }

  transporter = nodemailer.createTransport({
    host: connectHost,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      servername: smtpHost,
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  console.log('email.js loaded — testing SMTP connection...');
  console.log('SMTP config:', {
    host: connectHost,
    servername: smtpHost,
    port: 465,
    secure: true,
    user: process.env.EMAIL_USER || 'MISSING',
    pass: process.env.EMAIL_PASS ? 'SET' : 'MISSING',
  });

  transporter.verify(function(error) {
    if (error) {
      console.error('SMTP CONNECTION FAILED:', error.message);
    } else {
      console.log('SMTP CONNECTION OK — ready to send email');
    }
  });
})();

/**
 * Generate an .ics calendar invite for an appointment
 */
function generateICS({ appointmentDate, appointmentTime, durationMinutes, appointmentType, notes }) {
  const [year, month, day] = appointmentDate.split('-').map(Number);
  const [hour, minute] = appointmentTime.split(':').map(Number);
  const duration = parseInt(durationMinutes) || 60;

  const typeLabel = appointmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const event = {
    start: [year, month, day, hour, minute],
    duration: { hours: Math.floor(duration / 60), minutes: duration % 60 },
    title: 'RV Service Appointment — Master Tech RV Repair & Storage',
    description: `Appointment Type: ${typeLabel}${notes ? '\\n' + notes : ''}\\n\\nQuestions? Call (303) 557-2214 or email service@mastertechrvrepair.com`,
    location: '6590 East 49th Avenue, Commerce City, CO 80022',
    url: 'https://mastertechrvrepair.com/',
    organizer: { name: 'Master Tech RV Repair & Storage', email: 'service@mastertechrvrepair.com' },
    status: 'CONFIRMED',
  };

  const { error, value } = ics.createEvent(event);
  if (error) {
    console.error('ICS generation error:', error);
    return null;
  }
  return value;
}

/**
 * Send appointment confirmation email with calendar invite.
 * Returns { success: true } or { success: false, error: "reason" }
 */
async function sendAppointmentConfirmation({
  customerName,
  customerEmail,
  appointmentDate,
  appointmentTime,
  appointmentType,
  durationMinutes,
  notes,
}) {
  if (!transporter) {
    console.error('SMTP transporter not initialized yet');
    return { success: false, error: 'SMTP not ready — try again in a moment' };
  }

  if (!customerEmail) {
    console.log('No customer email — skipping confirmation email');
    return { success: false, error: 'No customer email provided' };
  }

  // Log email config status for production debugging
  console.log('Email config check:', {
    host: process.env.EMAIL_HOST || 'MISSING',
    user: process.env.EMAIL_USER || 'MISSING',
    pass: process.env.EMAIL_PASS ? 'SET' : 'MISSING',
    from: process.env.EMAIL_FROM || 'MISSING',
  });

  if (!process.env.EMAIL_PASS) {
    console.log('EMAIL_PASS not configured — skipping confirmation email');
    return { success: false, error: 'EMAIL_PASS not configured on server' };
  }

  const typeLabel = appointmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const dateFormatted = new Date(appointmentDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const [h, m] = appointmentTime.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  const timeFormatted = `${hour12}:${m} ${ampm}`;

  // Build Google Calendar URL
  const pad = (n) => String(n).padStart(2, '0');
  const [yr, mo, dy] = appointmentDate.split('-').map(Number);
  const startH = parseInt(h);
  const startM = parseInt(m);
  const dur = parseInt(durationMinutes) || 60;
  const endTotalMin = startH * 60 + startM + dur;
  const endH = Math.floor(endTotalMin / 60);
  const endM = endTotalMin % 60;
  const gcalStart = `${yr}${pad(mo)}${pad(dy)}T${pad(startH)}${pad(startM)}00`;
  const gcalEnd = `${yr}${pad(mo)}${pad(dy)}T${pad(endH)}${pad(endM)}00`;
  const gcalParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: `RV Service Appointment — Master Tech RV`,
    dates: `${gcalStart}/${gcalEnd}`,
    details: `Appointment type: ${typeLabel}\nQuestions? Call (303) 557-2214 or email service@mastertechrvrepair.com`,
    location: '6590 East 49th Avenue, Commerce City, CO 80022',
  });
  const googleCalUrl = `https://calendar.google.com/calendar/render?${gcalParams.toString()}`;

  // Generate ICS calendar invite
  const icsContent = generateICS({
    appointmentDate,
    appointmentTime,
    durationMinutes,
    appointmentType,
    notes,
  });

  const fromAddr = process.env.EMAIL_FROM || `"Master Tech RV Repair & Storage" <${process.env.EMAIL_USER || 'service@mastertechrvrepair.com'}>`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background-color:#1e3a5f;padding:24px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:0.5px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
      <p style="color:#93c5fd;margin:4px 0 0;font-size:12px;font-style:italic;">Our Service Makes Happy Campers!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:22px;">Your appointment has been confirmed!</h2>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Hello ${customerName || 'valued customer'},</p>

      <!-- Appointment Details Table -->
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;width:120px;">Date</td>
          <td style="padding:12px 16px;color:#111827;border-bottom:1px solid #e5e7eb;font-size:15px;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Time</td>
          <td style="padding:12px 16px;color:#111827;border-bottom:1px solid #e5e7eb;font-size:15px;">${timeFormatted}</td>
        </tr>
        <tr style="background-color:#f9fafb;">
          <td style="padding:12px 16px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Type</td>
          <td style="padding:12px 16px;color:#111827;border-bottom:1px solid #e5e7eb;font-size:15px;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-weight:bold;color:#374151;">Location</td>
          <td style="padding:12px 16px;color:#111827;font-size:15px;">
            6590 East 49th Avenue<br/>Commerce City, CO 80022
          </td>
        </tr>
      </table>

      <!-- Add to Calendar Section -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 12px;font-weight:bold;color:#374151;font-size:14px;">&#128197; Add to Your Calendar:</p>
        <div style="margin:0 0 12px;">
          <a href="${googleCalUrl}" target="_blank" style="display:inline-block;padding:10px 20px;background-color:#ffffff;color:#1a73e8;border:2px solid #dadce0;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
            &#x1F4C5; Add to Google Calendar
          </a>
        </div>
        ${icsContent ? `
        <p style="margin:0;color:#555;font-size:13px;">
          <strong>Apple Calendar / Outlook</strong> — open the attached <em>appointment.ics</em> file to add this event to your calendar.
        </p>
        ` : ''}
      </div>

      <p style="color:#374151;font-size:14px;">
        If you need to reschedule or cancel, please contact us:
      </p>
      <p style="color:#374151;font-size:14px;margin:0;">
        <strong>Phone:</strong> (303) 557-2214<br/>
        <strong>Email:</strong> service@mastertechrvrepair.com<br/>
        <strong>Web:</strong> https://mastertechrvrepair.com/
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;">
        Master Tech RV Repair &amp; Storage<br/>
        6590 East 49th Avenue, Commerce City, CO 80022<br/>
        (303) 557-2214 &nbsp;|&nbsp; service@mastertechrvrepair.com
      </p>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;font-style:italic;">
        Our Service Makes Happy Campers!
      </p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `Your appointment has been confirmed!

Hello ${customerName || 'valued customer'},

Appointment Details:
  Date: ${dateFormatted}
  Time: ${timeFormatted}
  Type: ${typeLabel}
  Location: 6590 East 49th Avenue, Commerce City, CO 80022

Add to Your Calendar:
  Google Calendar: ${googleCalUrl}
  Apple Calendar / Outlook: Open the attached appointment.ics file

If you need to reschedule or cancel, please contact us:
  Phone: (303) 557-2214
  Email: service@mastertechrvrepair.com
  Web: https://mastertechrvrepair.com/

---
Master Tech RV Repair & Storage
Our Service Makes Happy Campers!`;

  const mailOptions = {
    from: fromAddr,
    to: customerEmail,
    cc: 'service@mastertechrvrepair.com',
    bcc: process.env.EMAIL_USER !== 'service@mastertechrvrepair.com' ? process.env.EMAIL_USER : undefined,
    subject: 'Appointment Confirmed — Master Tech RV Repair & Storage',
    html: htmlBody,
    text: textBody,
    attachments: [],
  };

  // Attach ICS calendar invite if generated
  if (icsContent) {
    mailOptions.attachments.push({
      filename: 'appointment.ics',
      content: icsContent,
      contentType: 'text/calendar; method=REQUEST',
    });
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment confirmation email sent to ${customerEmail}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to send appointment confirmation email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendAppointmentConfirmation };
