// server/src/routes/storage-autopay.js
//
// Storage AUTOPAY — Phase 1: capture + vault a customer's card on file via
// Square, with explicit authorization. NOTHING is charged here. The monthly
// auto-charge job (Phase 2) is separate, so cards can be collected and reviewed
// before any money moves.
//
// Public (token-based, no auth):
//   GET  /api/storage-autopay/config           -> Square appId + locationId + env for the Web Payments SDK
//   GET  /api/storage-autopay/setup/:token      -> billing/space/customer summary for the setup page
//   POST /api/storage-autopay/setup/:token      -> { sourceId } tokenized card -> vault it, enable autopay
//
// Staff (auth):
//   POST   /api/storage-autopay/:billingId/link  -> ensure a setup token, return the setup URL
//   DELETE /api/storage-autopay/:billingId       -> turn autopay off (forget the card)

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const square = require('../services/square');

function publicBase(req) {
  return process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
}

async function loadBillingByToken(token) {
  const { rows } = await pool.query(
    `SELECT sb.*, s.label AS space_label, s.space_type,
            c.id AS customer_id, c.first_name, c.last_name, c.company_name,
            c.email_primary, c.phone_primary, c.square_customer_id AS cust_square_id
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
      WHERE sb.autopay_setup_token = $1 AND sb.deleted_at IS NULL AND sb.billing_end_date IS NULL`,
    [token]
  );
  return rows[0] || null;
}

// --- Square SDK config for the browser Web Payments SDK -------------------
router.get('/config', (req, res) => {
  res.json({
    applicationId: square.applicationId || null,
    locationId: square.locationId || null,
    environment: square.environment,
  });
});

// --- Public: setup page data ----------------------------------------------
router.get('/setup/:token', async (req, res) => {
  try {
    const b = await loadBillingByToken(req.params.token);
    if (!b) return res.status(404).json({ error: 'This autopay link is no longer valid. Please contact us.' });
    const name = b.company_name || `${b.first_name || ''} ${b.last_name || ''}`.trim();
    res.json({
      customer_name: name,
      space_label: b.space_label,
      space_type: b.space_type,
      monthly_rate: parseFloat(b.monthly_rate),
      due_day: b.due_day || 1,
      already_enrolled: !!b.autopay_enabled,
      card_last4: b.autopay_card_last4 || null,
      card_brand: b.autopay_card_brand || null,
    });
  } catch (err) {
    console.error('GET storage-autopay/setup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Public: vault the card + enable autopay (NO charge) -------------------
router.post('/setup/:token', express.json(), async (req, res) => {
  const { sourceId } = req.body || {};
  if (!sourceId) return res.status(400).json({ error: 'Missing card token' });

  const dbc = await pool.connect();
  try {
    const b = await loadBillingByToken(req.params.token);
    if (!b) { dbc.release(); return res.status(404).json({ error: 'This autopay link is no longer valid.' }); }

    // 1) Ensure a Square customer exists for this ERP customer.
    let squareCustomerId = b.cust_square_id;
    if (!squareCustomerId) {
      const cResp = await square.client.customers.create({
        idempotencyKey: crypto.randomUUID(),
        givenName: b.first_name || undefined,
        familyName: b.last_name || undefined,
        companyName: b.company_name || undefined,
        emailAddress: b.email_primary || undefined,
        phoneNumber: b.phone_primary || undefined,
        referenceId: String(b.customer_id),
      });
      squareCustomerId = cResp.customer.id;
      await dbc.query('UPDATE customers SET square_customer_id = $1 WHERE id = $2', [squareCustomerId, b.customer_id]);
    }

    // 2) Vault the card on file (Cards API). This stores nothing sensitive on
    //    our side — only Square's opaque card id + brand/last4.
    const cardResp = await square.client.cards.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      card: {
        customerId: squareCustomerId,
        referenceId: `storage-billing-${b.id}`,
      },
    });
    const card = cardResp.card;

    // 3) Record consent + card metadata on the billing. Autopay ON.
    await dbc.query(
      `UPDATE storage_billing
          SET square_customer_id = $1,
              autopay_card_id = $2,
              autopay_card_brand = $3,
              autopay_card_last4 = $4,
              autopay_card_exp = $5,
              autopay_enabled = TRUE,
              autopay_authorized_at = NOW(),
              autopay_authorized_ip = $6
        WHERE id = $7`,
      [
        squareCustomerId,
        card.id,
        card.cardBrand || null,
        card.last4 || null,
        card.expMonth && card.expYear ? `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}` : null,
        req.ip,
        b.id,
      ]
    );

    res.json({ ok: true, card_brand: card.cardBrand || null, card_last4: card.last4 || null });
  } catch (err) {
    const detail = err.errors ? err.errors.map(e => e.detail).join('; ') : (err.message || 'Card could not be saved');
    console.error('POST storage-autopay/setup error:', detail);
    res.status(502).json({ error: `Could not save card: ${detail}` });
  } finally {
    dbc.release();
  }
});

// --- Staff: create/return the autopay setup link for a billing ------------
router.post('/:billingId/link', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, autopay_setup_token FROM storage_billing WHERE id = $1 AND deleted_at IS NULL AND billing_end_date IS NULL',
      [req.params.billingId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Active storage billing not found' });
    let token = rows[0].autopay_setup_token;
    if (!token) {
      const upd = await pool.query(
        'UPDATE storage_billing SET autopay_setup_token = gen_random_uuid() WHERE id = $1 RETURNING autopay_setup_token',
        [req.params.billingId]
      );
      token = upd.rows[0].autopay_setup_token;
    }
    res.json({ token, url: `${publicBase(req)}/storage-autopay/${token}` });
  } catch (err) {
    console.error('POST storage-autopay/:id/link error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Staff: disable autopay (forget the card) -----------------------------
router.delete('/:billingId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT autopay_card_id FROM storage_billing WHERE id = $1', [req.params.billingId]);
    if (rows.length && rows[0].autopay_card_id) {
      try { await square.client.cards.disable({ cardId: rows[0].autopay_card_id }); } catch (e) { /* best effort */ }
    }
    await pool.query(
      `UPDATE storage_billing
          SET autopay_enabled = FALSE, autopay_card_id = NULL, autopay_card_brand = NULL,
              autopay_card_last4 = NULL, autopay_card_exp = NULL, autopay_authorized_at = NULL
        WHERE id = $1`,
      [req.params.billingId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE storage-autopay/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Staff: run (or preview) the monthly autopay charge on demand ----------
// Body: { dryRun: true|false, year?, month? }. dryRun lists who would be charged
// and how much, charging no one. Defaults to next month.
router.post('/run', requireRole('admin'), async (req, res) => {
  try {
    const { runCharges } = require('../jobs/storageAutopayCron');
    const dryRun = req.body?.dryRun !== false; // default to a safe preview
    const year = req.body?.year ? parseInt(req.body.year) : undefined;
    const month = req.body?.month ? parseInt(req.body.month) : undefined;
    const result = await runCharges({ year, month, dryRun });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
