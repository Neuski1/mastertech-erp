/*
 VERCEL PRODUCTION SETUP — REQUIRED ENVIRONMENT VARIABLES:
 Go to: Vercel Dashboard → Settings → Environment Variables
 Required: EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 See .env.example for placeholder values. Never hardcode credentials in code.
*/
const nodemailer = require('nodemailer');
const ics = require('ics');

/*
 Email transport: uses Resend HTTP API if RESEND_API_KEY is set (recommended for Railway),
 otherwise falls back to SMTP (works locally / on hosts that allow outbound SMTP).

 Railway blocks outbound SMTP ports (25, 465, 587). Use Resend (free 100/day):
   1. Sign up at https://resend.com
   2. Add & verify domain mastertechrvrepair.com (or use onboarding@resend.dev for testing)
   3. Create API key → add RESEND_API_KEY to Railway env vars
   4. Set EMAIL_FROM=Master Tech RV <service@mastertechrvrepair.com> (must match verified domain)
*/

let transporter = null;
let useResend = false;

if (process.env.RESEND_API_KEY) {
  // HTTP-based email via Resend — works on Railway (no SMTP ports needed)
  useResend = true;
  console.log('Email transport: Resend HTTP API (RESEND_API_KEY is set)');
} else if (process.env.EMAIL_PASS) {
  // SMTP transport — works locally and on hosts that allow outbound SMTP
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

  console.log('Email transport: SMTP', process.env.EMAIL_HOST || 'smtp.gmail.com');
  transporter.verify(function(error) {
    if (error) {
      console.error('SMTP CONNECTION FAILED:', error.message);
      console.error('If on Railway, set RESEND_API_KEY instead — Railway blocks SMTP ports');
    } else {
      console.log('SMTP CONNECTION OK — ready to send email');
    }
  });
} else {
  console.log('Email transport: NONE — set RESEND_API_KEY or EMAIL_PASS to enable');
}

/**
 * Send email via Resend HTTP API
 */
async function sendViaResend(mailOptions) {
  const payload = {
    from: mailOptions.from,
    to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
    cc: mailOptions.cc ? (Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc]) : undefined,
    subject: mailOptions.subject,
    html: mailOptions.html,
    text: mailOptions.text,
    attachments: mailOptions.attachments?.map(a => ({
      filename: a.filename,
      content: Buffer.from(a.content).toString('base64'),
      content_type: a.contentType,
    })),
  };
  console.log('Resend API request:', { from: payload.from, to: payload.to, cc: payload.cc, subject: payload.subject });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({ error: res.statusText }));
  console.log('Resend API response:', res.status, JSON.stringify(data));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Resend API error: ${res.status}`);
  }
  return data;
}

/**
 * Generate an .ics calendar invite for an appointment
 */
function generateICS({ appointmentDate, appointmentTime, durationMinutes, appointmentType, notes }) {
  const duration = parseInt(durationMinutes) || 60;
  const typeLabel = appointmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Convert Mountain Time to UTC for .ics (which expects UTC when using Z suffix)
  // Build a Date in Mountain Time using Intl to find the correct UTC offset
  const localStr = `${appointmentDate}T${appointmentTime}:00`;
  const mtFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', timeZoneName: 'shortOffset' });
  const parts = mtFormatter.formatToParts(new Date(localStr));
  const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT-6';
  const offsetMatch = tzPart.match(/GMT([+-])(\d+)/);
  const offsetHours = offsetMatch ? parseInt(offsetMatch[1] + offsetMatch[2]) : -6;
  // Create proper UTC date: Mountain Time = UTC + offset (offset is negative, so subtract)
  const utcDate = new Date(`${appointmentDate}T${appointmentTime}:00Z`);
  utcDate.setHours(utcDate.getHours() - offsetHours);

  const event = {
    start: [utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes()],
    startInputType: 'utc',
    startOutputType: 'utc',
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
  if (!useResend && !transporter) {
    console.error('No email transport configured');
    return { success: false, error: 'Email not configured — set RESEND_API_KEY or EMAIL_PASS' };
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

  if (!process.env.EMAIL_PASS && !process.env.RESEND_API_KEY) {
    console.log('No email credentials configured — skipping confirmation email');
    return { success: false, error: 'Set RESEND_API_KEY or EMAIL_PASS to enable email' };
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

  // Build Google Calendar URL — must be UTC (Z suffix) for correct timezone handling
  const pad = (n) => String(n).padStart(2, '0');
  const gcalLocalStr = `${appointmentDate}T${appointmentTime}:00`;
  const gcalMtParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', timeZoneName: 'shortOffset' })
    .formatToParts(new Date(gcalLocalStr));
  const gcalTzPart = gcalMtParts.find(p => p.type === 'timeZoneName')?.value || 'GMT-6';
  const gcalOffsetMatch = gcalTzPart.match(/GMT([+-])(\d+)/);
  const gcalOffsetHours = gcalOffsetMatch ? parseInt(gcalOffsetMatch[1] + gcalOffsetMatch[2]) : -6;
  const gcalUtcStart = new Date(`${appointmentDate}T${appointmentTime}:00Z`);
  gcalUtcStart.setHours(gcalUtcStart.getHours() - gcalOffsetHours);
  const dur = parseInt(durationMinutes) || 60;
  const gcalUtcEnd = new Date(gcalUtcStart.getTime() + dur * 60000);
  const gcalStart = `${gcalUtcStart.getUTCFullYear()}${pad(gcalUtcStart.getUTCMonth()+1)}${pad(gcalUtcStart.getUTCDate())}T${pad(gcalUtcStart.getUTCHours())}${pad(gcalUtcStart.getUTCMinutes())}00Z`;
  const gcalEnd = `${gcalUtcEnd.getUTCFullYear()}${pad(gcalUtcEnd.getUTCMonth()+1)}${pad(gcalUtcEnd.getUTCDate())}T${pad(gcalUtcEnd.getUTCHours())}${pad(gcalUtcEnd.getUTCMinutes())}00Z`;
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
    if (useResend) {
      await sendViaResend(mailOptions);
    } else {
      await transporter.sendMail(mailOptions);
    }
    console.log(`Appointment confirmation email sent to ${customerEmail}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to send appointment confirmation email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendAppointmentConfirmation };
