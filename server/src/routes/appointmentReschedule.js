// Public, no-auth reschedule-request flow reached from the appointment
// confirmation email's "Request a Different Time" button.
//
//   GET  /api/appointments/reschedule/:token  -> branded form with the current
//        appointment time and inputs for the customer's preferred day/time/note.
//   POST /api/appointments/reschedule/:token  -> stores the request on the
//        appointment, emails the shop, and shows a "request received" page.
//
// The shop still approves/adjusts in the Schedule module; nothing on the
// customer's calendar changes automatically.

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');

function page(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Master Tech RV</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:36px 32px;">${body}</div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

const invalid = () => page('Invalid Link',
  `<div style="text-align:center"><div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
   <h2 style="color:#dc2626;margin:0 0 12px;">Link Not Found</h2>
   <p style="color:#6b7280;">This reschedule link is invalid or the appointment is no longer active.<br/>Please call us and we'll be glad to help.</p>
   <p style="margin-top:20px;"><strong>(303) 557-2214</strong></p></div>`);

const fmtLabel = (t) => ({
  storage_pickup:'Storage Pickup', storage_drop_off:'Storage Drop Off',
  rv_service_pickup:'RV Service Pickup', rv_service_drop_off:'RV Service Drop Off',
  rv_diagnostics:'RV Diagnostics', rv_estimate_build:'RV Estimate Build',
  rv_repair:'RV Repair', rv_service:'RV Service', parts:'Parts', storage:'Storage',
  drop_off:'Drop Off', pick_up:'Pick Up', other:'Appointment',
}[t] || (t ? String(t).replace(/_/g,' ').replace(/\bRv\b/gi,'RV').replace(/\b\w/g,c=>c.toUpperCase()) : 'Appointment'));

async function loadByToken(token) {
  const { rows } = await pool.query(
    `SELECT a.*, c.first_name, c.last_name, c.email_primary
       FROM appointments a JOIN customers c ON c.id = a.customer_id
      WHERE a.reschedule_token = $1 AND a.deleted_at IS NULL`, [token]);
  return rows[0] || null;
}

// GET — show the request form
router.get('/:token', async (req, res) => {
  try {
    const appt = await loadByToken(req.params.token);
    if (!appt || appt.status === 'cancelled') return res.send(invalid());

    const curDate = appt.scheduled_at
      ? new Date(appt.scheduled_at).toLocaleDateString('en-US', { timeZone:'America/Denver', weekday:'long', month:'long', day:'numeric', year:'numeric' }) : '—';
    const curTime = appt.scheduled_at
      ? new Date(appt.scheduled_at).toLocaleTimeString('en-US', { timeZone:'America/Denver', hour:'numeric', minute:'2-digit' }) : '';
    const greet = appt.first_name ? ' ' + appt.first_name : '';

    const already = appt.reschedule_status === 'requested'
      ? `<div style="margin:0 0 18px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;color:#92400e;font-size:13px;">You already have a reschedule request on file for this appointment. Submitting again will replace it.</div>` : '';

    res.send(page('Request a Different Time',
      `<h2 style="color:#1e3a5f;margin:0 0 6px;font-size:20px;">Request a Different Time</h2>
       <p style="color:#374151;font-size:14px;margin:0 0 18px;">Hi${greet}, your <strong>${fmtLabel(appt.appointment_type)}</strong> is currently scheduled for:</p>
       <div style="padding:12px 14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin:0 0 20px;">
         <div style="font-weight:bold;color:#1e3a5f;font-size:15px;">${curDate}</div>
         <div style="color:#374151;">${curTime} — Mountain Time</div>
       </div>
       ${already}
       <p style="color:#374151;font-size:14px;margin:0 0 16px;">Tell us what works better and we'll confirm by phone or email. All times are Mountain Time.</p>
       <form method="POST" action="/api/appointments/reschedule/${appt.reschedule_token}">
         <label style="display:block;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin:0 0 4px;">Preferred Date</label>
         <input type="date" name="requested_date" required style="width:100%;padding:11px;font-size:16px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;margin:0 0 16px;" />
         <label style="display:block;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin:0 0 4px;">Preferred Time</label>
         <input type="time" name="requested_time" required style="width:100%;padding:11px;font-size:16px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;margin:0 0 16px;" />
         <label style="display:block;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin:0 0 4px;">Note (optional)</label>
         <textarea name="note" rows="3" placeholder="Anything we should know?" style="width:100%;padding:11px;font-size:15px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;margin:0 0 20px;font-family:inherit;resize:vertical;"></textarea>
         <button type="submit" style="width:100%;padding:15px;background:#1e3a5f;color:#fff;font-size:16px;font-weight:bold;border:none;border-radius:8px;cursor:pointer;">Send My Request</button>
       </form>
       <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;text-align:center;">Prefer to talk? Call (303) 557-2214.</p>`
    ));
  } catch (err) {
    console.error('Reschedule GET error:', err);
    res.status(500).send(invalid());
  }
});

// POST — record the request + notify the shop
router.post('/:token', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const appt = await loadByToken(req.params.token);
    if (!appt || appt.status === 'cancelled') return res.send(invalid());

    const { requested_date, requested_time, note } = req.body || {};
    if (!requested_date || !requested_time) {
      return res.send(page('Missing Info',
        `<div style="text-align:center"><h2 style="color:#92400e;">Please pick a date and time</h2>
         <p style="color:#6b7280;">Go back and choose your preferred day and time.</p></div>`));
    }

    await pool.query(
      `UPDATE appointments
          SET reschedule_status = 'requested',
              reschedule_requested_at = NOW(),
              reschedule_requested_date = $1,
              reschedule_requested_time = $2,
              reschedule_note = $3,
              updated_at = NOW()
        WHERE id = $4`,
      [requested_date, requested_time, (note || '').trim() || null, appt.id]
    );

    const name = `${appt.first_name || ''} ${appt.last_name || ''}`.trim() || 'Customer';
    const curStr = appt.scheduled_at
      ? new Date(appt.scheduled_at).toLocaleString('en-US', { timeZone:'America/Denver', dateStyle:'medium', timeStyle:'short' }) : '—';
    const reqPretty = (() => {
      try { return new Date(`${requested_date}T${requested_time}:00`).toLocaleString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }); }
      catch { return `${requested_date} ${requested_time}`; }
    })();
    const backendUrl = process.env.BACKEND_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://mastertech-erp-production-cb96.up.railway.app');
    const frontendUrl = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';

    sendEmail({
      to: 'service@mastertechrvrepair.com',
      subject: `Reschedule request — ${name} (${fmtLabel(appt.appointment_type)})`,
      html: `<p><strong>${name}</strong> requested a different time for their <strong>${fmtLabel(appt.appointment_type)}</strong> appointment.</p>
             <table style="border-collapse:collapse;font-size:14px;">
               <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Currently scheduled:</td><td style="padding:4px 0;"><strong>${curStr}</strong></td></tr>
               <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Requested:</td><td style="padding:4px 0;color:#1e3a5f;"><strong>${reqPretty} (Mountain)</strong></td></tr>
               ${(note||'').trim() ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;">Note:</td><td style="padding:4px 0;">${(note||'').trim().replace(/</g,'&lt;')}</td></tr>` : ''}
             </table>
             <p style="margin-top:14px;">Open the Schedule module to confirm or adjust, then re-send the confirmation.</p>
             <p><a href="${frontendUrl}/schedule">Go to Schedule</a></p>`,
      text: `${name} requested a different time.\nAppointment: ${fmtLabel(appt.appointment_type)}\nCurrently: ${curStr}\nRequested: ${reqPretty} (Mountain)\n${(note||'').trim() ? 'Note: ' + note.trim() + '\n' : ''}\nOpen Schedule: ${frontendUrl}/schedule`,
    }).catch(e => console.error('Reschedule notify error:', e.message));

    res.send(page('Request Received',
      `<div style="text-align:center"><div style="font-size:60px;margin-bottom:12px;">&#9989;</div>
       <h2 style="color:#065f46;margin:0 0 12px;">Request Received</h2>
       <p style="color:#374151;font-size:15px;">Thanks${appt.first_name ? ' ' + appt.first_name : ''}! We got your request for:</p>
       <div style="padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:14px 0;color:#065f46;font-weight:bold;">${reqPretty} — Mountain Time</div>
       <p style="color:#6b7280;font-size:14px;">Your current appointment stays booked until we confirm the change. We'll reach out shortly by phone or email.</p>
       <p style="margin-top:18px;color:#374151;"><strong>(303) 557-2214</strong></p></div>`
    ));
  } catch (err) {
    console.error('Reschedule POST error:', err);
    res.status(500).send(invalid());
  }
});

module.exports = router;
