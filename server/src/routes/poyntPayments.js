/**
 * Poynt (GoDaddy Payments) online payment routes.
 *
 * Mounted at /api/payments/online. Two groups:
 *   - Public (no auth): GET /:token, POST /:token/charge  — customer-facing pay page
 *   - Admin (requireAuth + requireRole): POST /links, GET /links, GET /  — history + link creation
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { tokenizeCard, chargeToken, isPoyntConfigured } = require('../services/poynt');

const PAYMENT_TYPES = new Set(['parts_deposit', 'final_payment']);

function typeLabel(t) {
  return t === 'parts_deposit' ? 'Parts Deposit' : 'Invoice Payment';
}

// ---------------------------------------------------------------------------
// PUBLIC: GET /:token — customer-facing link info
// ---------------------------------------------------------------------------
router.get('/:token', async (req, res) => {
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
    } catch (err) {
      await client.query(
        `UPDATE online_payments SET status = 'failed', error_message = $2, updated_at = NOW()
           WHERE id = $1`,
        [link.id, `Tokenize failed: ${err.message || err.name || 'unknown'}`]
      );
      await client.query('COMMIT');
      return res.status(400).json({ error: 'Could not tokenize card. The page may have timed out — please refresh and try again.' });
    }

    const cardToken = tokenized && (tokenized.paymentJWT || tokenized.token || tokenized.card_token);
    if (!cardToken) {
      await client.query('ROLLBACK');
      console.error('Poynt tokenize returned no JWT:', tokenized);
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
    } catch (err) {
      const reason = (err && (err.message || err.developerMessage || err.code)) || 'Card declined';
      await client.query(
        `UPDATE online_payments SET status = 'failed', error_message = $2, updated_at = NOW()
           WHERE id = $1`,
        [link.id, `Charge failed: ${reason}`]
      );
      await client.query('COMMIT');
      return res.status(402).json({ error: `Payment declined: ${reason}` });
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
    // recalculateTotals sums rows in payments; this keeps amount_due accurate.
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
              r.record_number,
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

module.exports = router;
