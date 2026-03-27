const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');

function brandedPage(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Master Tech RV</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:40px 32px;text-align:center;">${body}</div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

// GET /api/records/approve/:token — Public, no auth
router.get('/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, c.first_name, c.last_name, c.email_primary
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.approval_token = $1 AND r.deleted_at IS NULL`,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.send(brandedPage('Invalid Link',
        `<div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
         <h2 style="color:#dc2626;margin:0 0 12px;">Invalid or Expired Link</h2>
         <p style="color:#6b7280;">This approval link is invalid or has expired.<br/>Please contact Master Tech RV Repair &amp; Storage.</p>
         <p style="margin-top:20px;"><strong>(303) 557-2214</strong><br/>service@mastertechrvrepair.com</p>`
      ));
    }

    const record = rows[0];

    // Already approved
    if (record.approved_by_customer_at || record.status !== 'estimate') {
      return res.send(brandedPage('Already Approved',
        `<div style="font-size:48px;margin-bottom:16px;">&#9989;</div>
         <h2 style="color:#065f46;margin:0 0 12px;">Estimate #${record.record_number} Already Approved</h2>
         <p style="color:#6b7280;">Thank you — this estimate has already been approved.<br/>We will be in touch shortly.</p>`
      ));
    }

    // Check expiration
    if (record.approval_token_expires_at && new Date(record.approval_token_expires_at) < new Date()) {
      return res.send(brandedPage('Link Expired',
        `<div style="font-size:48px;margin-bottom:16px;">&#9200;</div>
         <h2 style="color:#92400e;margin:0 0 12px;">Approval Link Expired</h2>
         <p style="color:#6b7280;">This approval link has expired.<br/>Please contact us to approve your estimate.</p>
         <p style="margin-top:20px;"><strong>(303) 557-2214</strong><br/>service@mastertechrvrepair.com</p>`
      ));
    }

    // Approve the estimate
    await pool.query(
      `UPDATE records SET
         status = 'approved',
         approved_by_customer_at = NOW(),
         approved_by_customer_ip = $1,
         approval_token = NULL,
         intake_date = COALESCE(intake_date, CURRENT_DATE)
       WHERE id = $2`,
      [req.ip, record.id]
    );

    // Log to communication_log
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content)
         VALUES ($1, $2, 'email', 'estimate_approved_by_customer', $3)`,
        [record.customer_id, record.id, `Customer approved estimate #${record.record_number} via email link`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    // Notify staff
    const customerName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
    const backendUrl = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    sendEmail({
      to: 'service@mastertechrvrepair.com',
      subject: `Estimate #${record.record_number} Approved by Customer — ${customerName}`,
      html: `<p><strong>${customerName}</strong> approved Estimate #${record.record_number} online at ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}.</p>
             <p>The record has been updated to <strong>Approved</strong> status.</p>
             <p><a href="${backendUrl}/records/${record.id}">View Record #${record.record_number}</a></p>`,
      text: `${customerName} approved Estimate #${record.record_number}. View at ${backendUrl}/records/${record.id}`,
    }).catch(e => console.error('Staff notification error:', e.message));

    // Show confirmation page
    res.send(brandedPage('Estimate Approved',
      `<div style="font-size:64px;margin-bottom:16px;">&#9989;</div>
       <h2 style="color:#065f46;margin:0 0 12px;">Estimate Approved!</h2>
       <p style="color:#374151;font-size:15px;">Thank you${record.first_name ? ' ' + record.first_name : ''}, your estimate <strong>#${record.record_number}</strong> has been approved.</p>
       <p style="color:#6b7280;">We will contact you shortly to schedule your service.</p>
       <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;">
         <p style="margin:0;color:#374151;"><strong>(303) 557-2214</strong></p>
         <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
       </div>`
    ));
  } catch (err) {
    console.error('Estimate approval error:', err);
    res.status(500).send(brandedPage('Error', '<h2 style="color:#dc2626;">Something went wrong</h2><p>Please contact us directly.</p>'));
  }
});

module.exports = router;
