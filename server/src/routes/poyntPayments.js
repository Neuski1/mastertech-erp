/**
 * Poynt (GoDaddy Payments) online payment routes.
 *
 * Mounted at /api/payments/online.
 *
 * IMPORTANT — route ordering: Express matches routes in definition order, and
 * "/:token" happily captures any single-segment path. Static paths like
 * /config, /links, /history MUST be declared BEFORE the parameterized /:token
 * routes or they'll be intercepted and fail UUID casting in the DB.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { tokenizeCard, chargeToken, isPoyntConfigured } = require('../services/poynt');

const PAYMENT_TYPES = new Set(['parts_deposit', 'final_payment']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function typeLabel(t) {
  return t === 'parts_deposit' ? 'Parts Deposit' : 'Invoice Payment';
}

// =============================================================================
// Static / specific paths — MUST come before the /:token wildcard routes below.
// =============================================================================

// ---------------------------------------------------------------------------
// PUBLIC: GET /config — public IDs needed by the browser to init TokenizeJs
// ---------------------------------------------------------------------------
router.get('/config', (_req, res) => {
  res.json({
    businessId: process.env.POYNT_BUSINESS_ID || null,
    applicationId: process.env.POYNT_APPLICATION_ID || null,
    configured: isPoyntConfigured(),
  });
});

// ---------------------------------------------------------------------------
// ADMIN: POST /links — create a new payment link for a record
// Body: { record_id, amount_cents | amount_dollars, payment_type, customer_email? }
// ---------------------------------------------------------------------------
router.post('/links', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  const { record_id, payment_type, customer_email } = req.body || {};
  let amountCents = req.body.amount_cents;
  if (amountCents == null && req.body.amount_dollars != null) {
    amountCents = Math.round(parseFloat(req.body.amount_dollars) * 100);
  }
  if (!record_id || !payment_type || !Number.isFinite(amountCents) || amountCents <= 0) {
    return res.status(400).json({ error: 'record_id, payment_type, and a positive amount are required' });
  }
  if (!PAYMENT_TYPES.has(payment_type)) {
    return res.status(400).json({ error: `Invalid payment_type — must be one of: ${[...PAYMENT_TYPES].join(', ')}` });
  }

  try {
    const token = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO online_payments
         (payment_token, record_id, amount_cents, payment_type, status, customer_email, created_by_user_id)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)
       RETURNING *`,
      [token, record_id, amountCents, payment_type, customer_email || null, req.user?.id || null]
    );

    const base = process.env.PAYMENT_LINK_BASE_URL
      || process.env.FRONTEND_URL
      || `${req.protocol}://${req.get('host')}`;
    const url = `${base.replace(/\/$/, '')}/pay/${token}`;

    res.status(201).json({ ...rows[0], url });
  } catch (err) {
    console.error('POST /api/payments/online/links error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// ADMIN: GET /links?record_id=... — list links (optionally filtered by record)
// ---------------------------------------------------------------------------
router.get('/links', requireAuth, async (req, res) => {
  const { record_id } = req.query;
  try {
    const params = [];
    let where = '';
    if (record_id) {
      params.push(record_id);
      where = 'WHERE op.record_id = $1';
    }
    const { rows } = await pool.query(
      `SELECT op.*, r.record_number
         FROM online_payments op
         JOIN records r ON r.id = op.record_id
         ${where}
         ORDER BY op.created_at DESC
         LIMIT 200`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/payments/online/links error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// ADMIN: POST /links/:id/reminder — email a reminder for a specific unpaid link
// ---------------------------------------------------------------------------
router.post('/links/:id/reminder', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT op.*, r.record_number,
              c.first_name, c.last_name, c.email_primary, c.company_name
         FROM online_payments op
         JOIN records r ON r.id = op.record_id
         JOIN customers c ON c.id = r.customer_id
        WHERE op.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Payment link not found' });
    const link = rows[0];
    if (link.status === 'paid') return res.status(400).json({ error: 'This link has already been paid.' });

    const email = req.body?.to || link.customer_email || link.email_primary;
    if (!email) return res.status(400).json({ error: 'No email address on file or in request.' });

    const customerName = link.company_name
      || [link.first_name, link.last_name].filter(Boolean).join(' ')
      || 'Customer';
    const amountDollars = (parseInt(link.amount_cents) / 100).toFixed(2);
    const typeLbl = typeLabel(link.payment_type);

    const { linkUrl, buildPayButtonHtml } = require('../services/onlinePaymentLinks');
    const url = linkUrl(link.payment_token, req);

    const firstName = link.first_name || 'there';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:#1e3a5f;padding:20px 28px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
  </div>
  <div style="padding:24px 28px;">
    <p style="margin:0 0 12px;font-size:16px;">Hi ${firstName},</p>
    <p style="margin:0 0 16px;">This is a friendly reminder that there's an outstanding balance on your work order. You can pay securely online using the button below.</p>
    ${buildPayButtonHtml({ url, amountDollars, paymentTypeLabel: typeLbl, recordNumber: link.record_number, customerName })}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Other payment options: Zelle to Carol@mastertechrvrepair.com, check by mail, or cash in person at our shop. Questions? Call (303) 557-2214 or just reply to this email.</p>
  </div>
  <div style="background:#f9fafb;padding:14px 28px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">Master Tech RV Repair &amp; Storage &bull; 6590 East 49th Avenue, Commerce City, CO 80022 &bull; (303) 557-2214</p>
  </div>
</div></body></html>`;

    const { sendEmail } = require('../services/email');
    const subject = `Reminder: Payment Due for WO #${link.record_number}`;
    const result = await sendEmail({
      to: email,
      cc: 'service@mastertechrvrepair.com',
      subject,
      html,
      text: `Hi ${firstName}, reminder: ${typeLbl} of $${amountDollars} on WO #${link.record_number}. Pay online: ${url}\n\nMaster Tech RV Repair & Storage — (303) 557-2214`,
    });
    if (!result.success) return res.status(500).json({ error: result.error || 'Email failed' });

    // Log in communication_log (best-effort — table presence may vary)
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id, sent_at)
         SELECT r.customer_id, $1, 'email', 'payment_link_reminder', $2, 'sent', true, $3, NOW()
           FROM records r WHERE r.id = $4`,
        [link.id, `Payment link reminder — $${amountDollars} ${typeLbl} (WO #${link.record_number})`, req.user?.id || null, link.record_id]
      );
    } catch { /* non-fatal */ }

    res.json({ success: true, sentTo: email });
  } catch (err) {
    console.error('POST /api/payments/online/links/:id/reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// ADMIN: GET /history — full payment history for admin view
// Query: date_from, date_to, payment_type, status
// ---------------------------------------------------------------------------
router.get('/history', requireAuth, async (req, res) => {
  const { date_from, date_to, payment_type, status } = req.query;
  try {
    const conditions = [];
    const params = [];
    let idx = 1;
    if (date_from) { conditions.push(`op.created_at >= $${idx++}`); params.push(date_from); }
    if (date_to)   { conditions.push(`op.created_at < ($${idx++}::date + INTERVAL '1 day')`); params.push(date_to); }
    if (payment_type) { conditions.push(`op.payment_type = $${idx++}`); params.push(payment_type); }
    if (status)       { conditions.push(`op.status = $${idx++}`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT op.id, op.payment_token, op.amount_cents, op.payment_type, op.status,
              op.customer_email, op.transaction_id, op.created_at, op.paid_at,
              r.id AS record_id, r.record_number,
              c.first_name, c.last_name, c.company_name
         FROM online_payments op
         JOIN records r ON r.id = op.record_id
         JOIN customers c ON c.id = r.customer_id
         ${where}
         ORDER BY op.created_at DESC
         LIMIT 500`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/payments/online/history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// Wildcard token routes — declared LAST so they don't swallow /config, /links, etc.
// The UUID regex guard is defense-in-depth in case a new static route is added
// above without being registered before these.
// =============================================================================

// ---------------------------------------------------------------------------
// PUBLIC: GET /:token — customer-facing link info
// ---------------------------------------------------------------------------
router.get('/:token', async (req, res) => {
  if (!UUID_RE.test(req.params.token)) {
    return res.status(404).json({ error: 'Payment link not found' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT op.payment_token, op.amount_cents, op.payment_type, op.status,
              op.customer_email, op.created_at, op.paid_at,
              r.record_number,
              c.first_name, c.last_name, c.company_name
         FROM online_payments op
         JOIN records r ON r.id = op.record_id
         JOIN customers c ON c.id = r.customer_id
        WHERE op.payment_token = $1`,
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Payment link not found' });
    const row = rows[0];
    const customerName = row.company_name
      || [row.first_name, row.last_name].filter(Boolean).join(' ')
      || 'Customer';
    res.json({
      paymentToken: row.payment_token,
      recordNumber: row.record_number,
      customerName,
      customerFirstName: row.first_name || '',
      amountCents: parseInt(row.amount_cents),
      amountDollars: (parseInt(row.amount_cents) / 100).toFixed(2),
      paymentType: row.payment_type,
      paymentTypeLabel: typeLabel(row.payment_type),
      status: row.status,
      alreadyPaid: row.status === 'paid',
      defaultEmail: row.customer_email || '',
    });
  } catch (err) {
    console.error('GET /api/payments/online/:token error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PUBLIC: POST /:token/charge — run the charge
// Body: { nonce, customerEmail }
// ---------------------------------------------------------------------------
router.post('/:token/charge', async (req, res) => {
  if (!UUID_RE.test(req.params.token)) {
    return res.status(404).json({ error: 'Payment link not found' });
  }
  if (!isPoyntConfigured()) {
    return res.status(503).json({ error: 'Payment processor not configured' });
  }
  const { nonce, customerEmail } = req.body || {};
  if (!nonce) return res.status(400).json({ error: 'Missing card nonce' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the row so two concurrent submits can't both charge
    const { rows } = await client.query(
      `SELECT op.*, r.id AS record_id_confirm, r.record_number
         FROM online_payments op
         JOIN records r ON r.id = op.record_id
        WHERE op.payment_token = $1
        FOR UPDATE`,
      [req.params.token]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment link not found' });
    }
    const link = rows[0];
    if (link.status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This invoice has already been paid.' });
    }

    // Step 1: tokenize the nonce
    let tokenized;
    try {
      tokenized = await tokenizeCard({ nonce });
      console.log('[poynt] tokenize OK, response keys:', Object.keys(tokenized || {}));
    } catch (err) {
      const detail = err?.developerMessage || err?.message || err?.code || err?.name || 'unknown';
      console.error('[poynt] tokenize failed — full error:', {
        message: err?.message,
        code: err?.code,
        statusCode: err?.statusCode,
        requestId: err?.requestId,
        developerMessage: err?.developerMessage,
        stack: err?.stack && err.stack.split('\n').slice(0, 5).join('\n'),
      });
      await client.query(
        `UPDATE online_payments SET status = 'failed', error_message = $2, updated_at = NOW()
           WHERE id = $1`,
        [link.id, `Tokenize failed: ${detail}`]
      );
      await client.query('COMMIT');
      return res.status(400).json({
        error: `Could not tokenize card: ${detail}`,
        step: 'tokenize',
      });
    }

    const cardToken = tokenized && (
      tokenized.paymentJWT
      || tokenized.token
      || tokenized.card_token
      || tokenized.cardToken
      || tokenized.data?.paymentJWT
      || tokenized.data?.token
    );
    if (!cardToken) {
      await client.query('ROLLBACK');
      console.error('Poynt tokenize returned no JWT. Keys:', Object.keys(tokenized || {}), 'Full:', JSON.stringify(tokenized));
      return res.status(502).json({ error: 'Tokenization failed — no token returned.' });
    }

    // Step 2: charge
    let charge;
    try {
      charge = await chargeToken({
        cardToken,
        amountCents: parseInt(link.amount_cents),
        customerEmail: customerEmail || link.customer_email || undefined,
        requestId: link.payment_token, // idempotency — one charge per link
      });
      console.log('[poynt] charge OK:', { id: charge?.id, status: charge?.status });
    } catch (err) {
      console.error('[poynt] charge failed — full error:', {
        message: err?.message,
        code: err?.code,
        statusCode: err?.statusCode,
        requestId: err?.requestId,
        developerMessage: err?.developerMessage,
        processorResponse: err?.processorResponse,
      });
      const reason = err?.developerMessage || err?.message || err?.code || 'Card declined';
      await client.query(
        `UPDATE online_payments SET status = 'failed', error_message = $2, updated_at = NOW()
           WHERE id = $1`,
        [link.id, `Charge failed: ${reason}`]
      );
      await client.query('COMMIT');
      return res.status(402).json({
        error: `Payment declined: ${reason}`,
        step: 'charge',
        code: err?.code || null,
      });
    }

    const txnId = charge && (charge.id || charge.transactionId);
    const txnStatus = charge && charge.status;

    // Mark link paid
    await client.query(
      `UPDATE online_payments
         SET status = 'paid', transaction_id = $2, paid_at = NOW(),
             customer_email = COALESCE($3, customer_email), updated_at = NOW(),
             error_message = NULL
       WHERE id = $1`,
      [link.id, txnId, customerEmail || null]
    );

    // Mirror into the main payments table so WO totals update correctly.
    await client.query(
      `INSERT INTO payments
         (record_id, payment_type, payment_method, amount, payment_date,
          square_transaction_id, notes, posted_by_user_id)
       VALUES ($1, $2, 'credit_card', $3, NOW(), $4, $5, NULL)`,
      [
        link.record_id,
        link.payment_type, // 'parts_deposit' or 'final_payment'
        (parseInt(link.amount_cents) / 100).toFixed(2),
        txnId || null,
        `Online payment (GoDaddy/Poynt) — ${typeLabel(link.payment_type)}`,
      ]
    );

    // Recalculate record totals
    const { recalculateTotals } = require('../db/calculations');
    await recalculateTotals(link.record_id, client);

    // Only FINAL payments advance WO status
    if (link.payment_type === 'final_payment') {
      await client.query(
        `UPDATE records SET status = 'paid', payment_pending_since = NULL,
                            reminder_count = 0, last_reminder_sent_at = NULL
           WHERE id = $1`,
        [link.record_id]
      );
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      transactionId: txnId,
      status: txnStatus,
      recordNumber: link.record_number,
      amountPaid: (parseInt(link.amount_cents) / 100).toFixed(2),
      paymentType: link.payment_type,
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('POST /api/payments/online/:token/charge error:', err);
    res.status(500).json({ error: err.message || 'Payment processing failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
