const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// POST /api/communications — Log a new communication entry (append-only)
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const {
    customer_id, record_id, channel, trigger_event,
    message_content, delivery_status, is_manual, sent_by_user_id
  } = req.body;

  if (!customer_id || !channel || !trigger_event || !message_content) {
    return res.status(400).json({
      error: 'customer_id, channel, trigger_event, and message_content are required'
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO communication_log
         (customer_id, record_id, channel, trigger_event, message_content,
          delivery_status, is_manual, sent_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        customer_id,
        record_id || null,
        channel,
        trigger_event,
        message_content,
        delivery_status || 'sent',
        is_manual !== undefined ? is_manual : true,
        sent_by_user_id || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/communications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/communications/send — Write and send an email to a customer, and
// log it to their Communication History in the same step. This is the plain
// "email this customer" path used by the Email button on a storage box; the
// automated senders (invoices, reminders, review requests) have their own.
//
// Body: { customer_id, subject, body, to? }
// `to` overrides the address only when the customer has more than one on file.
// ---------------------------------------------------------------------------
router.post('/send', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { customer_id, subject, body, to } = req.body || {};
  if (!customer_id || !subject || !body) {
    return res.status(400).json({ error: 'customer_id, subject and body are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT first_name, last_name, email_primary, email_secondary, email_invalid FROM customers WHERE id = $1 AND deleted_at IS NULL',
      [customer_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    const cust = rows[0];

    const allowed = [cust.email_primary, cust.email_secondary].filter(Boolean);
    const address = to && allowed.includes(to) ? to : cust.email_primary;
    if (!address) return res.status(400).json({ error: 'No email address on file for this customer' });
    if (cust.email_invalid) return res.status(400).json({ error: 'This customer is flagged as having a bad email address' });

    // Plain text in, simple HTML out. Blank lines become paragraph breaks so a
    // note typed in the box reads the way it was typed.
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:16px 28px;">
    <span style="color:#5FD584;font-size:15px;font-weight:bold;letter-spacing:.02em;">MASTER TECH RV REPAIR AND STORAGE</span>
  </div>
  <div style="padding:24px 28px;font-size:14px;color:#111;line-height:1.6;">
    ${esc(body).split(/\n{2,}/).map(p => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br/>')}</p>`).join('')}
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 28px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">Master Tech RV Repair and Storage<br/>6590 E. 49th Ave., Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;

    const { sendEmail } = require('../services/email');
    const result = await sendEmail({ to: address, subject, html, text: body });
    if (!(result && result.success)) {
      return res.status(502).json({ error: result?.error || 'Email failed to send' });
    }

    const { rows: logged } = await pool.query(
      `INSERT INTO communication_log
         (customer_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id)
       VALUES ($1,'email','manual_email',$2,'sent',TRUE,$3)
       RETURNING *`,
      [customer_id, `To: ${address}\nSubject: ${subject}\n\n${body}`, req.user?.id || null]
    );

    res.status(201).json({ ok: true, to: address, communication: logged[0] });
  } catch (err) {
    console.error('POST /api/communications/send error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/communications/customer/:customerId — Comm history for a customer
// ---------------------------------------------------------------------------
router.get('/customer/:customerId', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM communication_log WHERE customer_id = $1',
      [req.params.customerId]
    );

    const { rows } = await pool.query(
      `SELECT cl.*,
              r.record_number,
              u.name AS sent_by_name
       FROM communication_log cl
       LEFT JOIN records r ON r.id = cl.record_id
       LEFT JOIN users u ON u.id = cl.sent_by_user_id
       WHERE cl.customer_id = $1
       ORDER BY cl.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.customerId, parseInt(limit), offset]
    );

    res.json({
      entries: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/communications/customer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/communications/record/:recordId — Comm history for a record
// ---------------------------------------------------------------------------
router.get('/record/:recordId', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM communication_log WHERE record_id = $1',
      [req.params.recordId]
    );

    const { rows } = await pool.query(
      `SELECT cl.*,
              c.last_name, c.first_name,
              u.name AS sent_by_name
       FROM communication_log cl
       JOIN customers c ON c.id = cl.customer_id
       LEFT JOIN users u ON u.id = cl.sent_by_user_id
       WHERE cl.record_id = $1
       ORDER BY cl.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.recordId, parseInt(limit), offset]
    );

    res.json({
      entries: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/communications/record error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/communications/review-requests — who received a review request
router.get('/review-requests', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 500, 2000);
    const { rows } = await pool.query(
      `SELECT cl.id, cl.created_at, cl.channel, cl.message_content,
              cl.customer_id, cl.record_id,
              c.first_name, c.last_name, c.email_primary, c.phone_primary,
              COALESCE(c.review_opt_out, FALSE) AS review_opt_out,
              r.record_number
         FROM communication_log cl
         LEFT JOIN customers c ON c.id = cl.customer_id
         LEFT JOIN records r ON r.id = cl.record_id
        WHERE cl.trigger_event = 'review_request_sent'
        ORDER BY cl.created_at DESC
        LIMIT $1`,
      [limit]
    );
    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
