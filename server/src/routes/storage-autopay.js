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
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');
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
router.post('/:billingId/link', requireAuth, requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
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
router.delete('/:billingId', requireAuth, requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
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
router.post('/run', requireAuth, requireRole('admin'), async (req, res) => {
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

// --- Staff: preview or send the monthly storage invoices ------------------
// Body: { dryRun: true|false, year?, month? }. Defaults to a safe preview of
// next month. dryRun lists every invoice and total without emailing anyone.
router.post('/invoices/run', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { runInvoices } = require('../jobs/storageInvoiceCron');
    const dryRun = req.body?.dryRun !== false;
    const year = req.body?.year ? parseInt(req.body.year) : undefined;
    const month = req.body?.month ? parseInt(req.body.month) : undefined;
    res.json(await runInvoices({ year, month, dryRun }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Staff: email autopay setup links in bulk -----------------------------
// Body: { dryRun: true|false, billing_ids?: [] }
// Targets every ACTIVE space that is not already on autopay and has an email.
// dryRun (the default) lists who would be emailed without sending anything.
router.post('/send-links', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const dryRun = req.body?.dryRun !== false;
    const only = Array.isArray(req.body?.billing_ids) && req.body.billing_ids.length
      ? req.body.billing_ids.map(Number) : null;

    const { rows } = await pool.query(
      `SELECT sb.id AS billing_id, sb.monthly_rate, sb.autopay_setup_token, sb.payment_method,
              sp.label AS space_label, c.first_name, c.email_primary
         FROM storage_billing sb
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE sb.deleted_at IS NULL AND sb.billing_end_date IS NULL
          AND COALESCE(sb.autopay_enabled, FALSE) = FALSE
          AND (sb.scheduled_move_out IS NULL OR sb.scheduled_move_out > NOW())
        ORDER BY sp.label`
    );
    const targets = only ? rows.filter(r => only.includes(r.billing_id)) : rows;

    const base = publicBase(req);
    const out = [];
    let sent = 0, skipped = 0, failed = 0;

    for (const r of targets) {
      const item = { billing_id: r.billing_id, space: r.space_label,
                     customer: r.first_name, email: r.email_primary || null,
                     method: r.payment_method || 'not set', rate: r.monthly_rate };
      if (!r.email_primary) { item.result = 'no email on file'; skipped++; out.push(item); continue; }
      if (dryRun) { item.result = 'would send'; out.push(item); continue; }

      let token = r.autopay_setup_token;
      if (!token) {
        const upd = await pool.query(
          'UPDATE storage_billing SET autopay_setup_token = gen_random_uuid() WHERE id = $1 RETURNING autopay_setup_token',
          [r.billing_id]
        );
        token = upd.rows[0].autopay_setup_token;
      }
      const url = `${base}/storage-autopay/${token}`;
      const name = r.first_name || 'there';
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 32px;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:15px;color:#111;margin:0 0 14px;">Hi ${name},</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 14px;">
      We are moving our storage billing in house, and you can now put your monthly rent for
      <strong>${r.space_label || 'your space'}</strong> on automatic payment.
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 18px;">
      It takes about a minute. Your card is stored securely with Square, and we never see the number.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;background:#1e3a5f;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;">Set Up Automatic Payment</a>
    </div>
    <p style="font-size:12.5px;color:#6b7280;line-height:1.5;margin:16px 0 0;">
      Prefer to keep paying the way you do now? No problem, just ignore this email and nothing changes.
    </p>
    <p style="font-size:14px;color:#111;margin:20px 0 0;">Thanks,<br/>Carol and Mark</p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">Master Tech RV Repair &amp; Storage<br/>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
      const text = `Hi ${name},\n\nWe are moving our storage billing in house, and you can now put your monthly rent for ${r.space_label || 'your space'} on automatic payment.\n\nSet it up here: ${url}\n\nIt takes about a minute. Your card is stored securely with Square and we never see the number.\n\nPrefer to keep paying the way you do now? Just ignore this email and nothing changes.\n\nThanks,\nCarol and Mark\nMaster Tech RV Repair & Storage\n(303) 557-2214`;

      try {
        const r2 = await sendEmail({ to: r.email_primary, subject: 'Set up automatic payment for your RV storage', html, text });
        if (r2 && r2.success) { item.result = 'sent'; sent++; }
        else { item.result = 'failed: ' + (r2?.error || 'unknown'); failed++; }
      } catch (e) { item.result = 'error: ' + e.message; failed++; }
      out.push(item);
    }

    res.json({ dryRun, count: out.length, sent, skipped, failed, results: out });
  } catch (err) {
    console.error('POST storage-autopay/send-links error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
