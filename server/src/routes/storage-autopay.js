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
const settings = require('../db/settings');
const company = require('../db/company');
const { bankPlan } = require('../services/storageBankAutopay');

// "5th", "1st", "22nd". The late-fee day is owner-editable, so the reminder
// cannot hardcode the suffix the way it did when the day was always the 5th.
function ordinal(n) {
  const v = Math.abs(Math.round(n)) % 100;
  const suffix = (v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th');
  return `${n}${suffix}`;
}

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
      payment_method: b.payment_method || null,
      // ACH boxes get the bank flow instead of the card form.
      bank: b.payment_method === 'ach' ? {
        connected: !!b.autopay_bank_account_id,
        bank_account_id: b.autopay_bank_account_id || null,
        bank_name: b.autopay_bank_name || null,
        last4: b.autopay_bank_last4 || null,
        authorized: !!b.autopay_bank_auth_token,
        auth_amount: b.autopay_bank_auth_amount != null ? parseFloat(b.autopay_bank_auth_amount) : null,
        auth_start: b.autopay_bank_auth_start ? String(b.autopay_bank_auth_start instanceof Date ? b.autopay_bank_auth_start.toISOString() : b.autopay_bank_auth_start).slice(0, 10) : null,
        plan: await bankPlan(b.id),
      } : null,
    });
  } catch (err) {
    console.error('GET storage-autopay/setup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Public: vault the card, enable autopay, catch up the current month ----
// A customer who enrols AFTER this month's invoice has already gone out would
// otherwise never be charged for it. The cron only ever bills NEXT month, so
// the current month sits unpaid forever with no job that will ever pick it up
// (this is exactly what happened to Laura Lunde, September 2026). So the moment
// a card is saved, charge the current month if it is still owed.
//
// Runs through the same tested charge engine as the monthly cron, which skips
// any month already marked paid or partial, so this can never double-bill.
const ENROL_CATCHUP_DELAY_MS = 120000;

async function chargeCurrentMonthOnEnrol(billingId) {
  const nowDenver = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  const year = nowDenver.getFullYear();
  const month = nowDenver.getMonth() + 1;
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;

  // A box whose billing has not started by the end of this month is not owed
  // yet, so a customer enrolling ahead of their move-in is never charged early.
  const { rows } = await pool.query(
    `SELECT 1 FROM storage_billing
      WHERE id = $1 AND deleted_at IS NULL
        AND (billing_start_date IS NULL
             OR billing_start_date <= ($2::date + INTERVAL '1 month' - INTERVAL '1 day'))`,
    [billingId, periodStart]
  );
  if (!rows.length) return { skipped: 'billing has not started yet' };

  const { runCharges } = require('../jobs/storageAutopayCron');
  return runCharges({ year, month, dryRun: false, billingIds: [billingId] });
}

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

    // Catch up the current month, AFTER the response so a card that saved fine
    // never looks like a failure to the customer because the charge had
    // trouble. The delay lets a Square payment webhook land first, so a
    // customer who pays this month's invoice and THEN enrols is already marked
    // paid by the time the engine looks. Success emails a Square receipt and a
    // decline emails both the customer and the office, same as the monthly run.
    setTimeout(() => {
      chargeCurrentMonthOnEnrol(b.id)
        .then(r => console.log(`[storageAutopay] enrol catch-up billing ${b.id}:`, JSON.stringify(r)))
        .catch(e => console.error(`[storageAutopay] enrol catch-up failed billing ${b.id}:`, e.message));
    }, ENROL_CATCHUP_DELAY_MS).unref?.();
  } catch (err) {
    const detail = err.errors ? err.errors.map(e => e.detail).join('; ') : (err.message || 'Card could not be saved');
    console.error('POST storage-autopay/setup error:', detail);
    res.status(502).json({ error: `Could not save card: ${detail}` });
  } finally {
    dbc.release();
  }
});

// --- Public: ACH bank autopay -------------------------------------------------
// Two steps, both on the same token link:
//   1) POST /setup/:token/bank            { sourceId: bnon token, holderName }
//      Plaid (inside Square's SDK) verified the account; store it on file
//      through the Bank Accounts API and keep only Square's BACT id + bank
//      name + last 4.
//   2) POST /setup/:token/bank-authorize  { sourceId: BAUTH token, amount, startDate }
//      The customer approved a RECURRING_CHARGE for the amount bankPlan()
//      quoted. Store the reusable BAUTH token, the amount and the start month,
//      and turn autopay on. Nothing is debited here; the monthly engine does it.
async function ensureSquareCustomer(b, db = pool) {
  if (b.square_customer_id) return b.square_customer_id;
  if (b.cust_square_id) return b.cust_square_id;
  const cResp = await square.client.customers.create({
    idempotencyKey: crypto.randomUUID(),
    givenName: b.first_name || undefined,
    familyName: b.last_name || undefined,
    companyName: b.company_name || undefined,
    emailAddress: b.email_primary || undefined,
    phoneNumber: b.phone_primary || undefined,
    referenceId: String(b.customer_id),
  });
  const id = cResp.customer.id;
  await db.query('UPDATE customers SET square_customer_id = $1 WHERE id = $2', [id, b.customer_id]);
  return id;
}

const squareErr = (err, fallback) => (err && err.errors ? err.errors.map(e => e.detail).join('; ') : (err && err.message) || fallback);

router.post('/setup/:token/bank', express.json(), async (req, res) => {
  const { sourceId } = req.body || {};
  if (!sourceId) return res.status(400).json({ error: 'Missing bank token' });
  try {
    const b = await loadBillingByToken(req.params.token);
    if (!b) return res.status(404).json({ error: 'This autopay link is no longer valid.' });
    if (b.payment_method !== 'ach') return res.status(409).json({ error: 'This space is not set up for bank payments. Please call us.' });

    const squareCustomerId = await ensureSquareCustomer(b);
    const resp = await square.client.bankAccounts.createBankAccount({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      customerId: squareCustomerId,
    });
    const acct = (resp && (resp.bankAccount || (resp.data && resp.data.bankAccount))) || {};
    if (!acct.id) throw new Error('Square did not return a bank account');

    await pool.query(
      `UPDATE storage_billing
          SET square_customer_id = $1, autopay_bank_account_id = $2, autopay_bank_name = $3,
              autopay_bank_last4 = $4,
              -- a new account voids any authorization tied to the old one
              autopay_bank_auth_token = NULL, autopay_bank_auth_amount = NULL, autopay_bank_auth_start = NULL
        WHERE id = $5`,
      [squareCustomerId, acct.id, acct.bankName || null, acct.accountNumberSuffix || null, b.id]
    );
    res.json({ ok: true, bank_account_id: acct.id, bank_name: acct.bankName || null,
               last4: acct.accountNumberSuffix || null, status: acct.status || null,
               plan: await bankPlan(b.id) });
  } catch (err) {
    const detail = squareErr(err, 'Bank account could not be saved');
    console.error('POST storage-autopay/setup/bank error:', detail);
    res.status(502).json({ error: `Could not connect the bank account: ${detail}` });
  }
});

router.post('/setup/:token/bank-authorize', express.json(), async (req, res) => {
  const { sourceId, amount, startDate } = req.body || {};
  if (!sourceId) return res.status(400).json({ error: 'Missing authorization token' });
  try {
    const b = await loadBillingByToken(req.params.token);
    if (!b) return res.status(404).json({ error: 'This autopay link is no longer valid.' });
    if (b.payment_method !== 'ach' || !b.autopay_bank_account_id) {
      return res.status(409).json({ error: 'Connect a bank account first.' });
    }
    // The amount the customer approved must be the amount we will debit.
    const plan = await bankPlan(b.id);
    if (!plan || Math.round(parseFloat(amount) * 100) !== Math.round(plan.amount * 100)) {
      return res.status(409).json({ error: 'The amount changed while this page was open. Please reload and approve again.' });
    }
    await pool.query(
      `UPDATE storage_billing
          SET autopay_bank_auth_token = $1, autopay_bank_auth_amount = $2, autopay_bank_auth_start = $3::date,
              autopay_bank_authorized_at = NOW(), autopay_bank_authorized_ip = $4, autopay_enabled = TRUE
        WHERE id = $5`,
      [sourceId, plan.amount, plan.periodStart, req.ip, b.id]
    );
    // A month that was blocked waiting for re-authorization can run again.
    await pool.query(
      `DELETE FROM storage_autopay_charges
        WHERE storage_billing_id = $1 AND status = 'failed_final'
          AND last_error LIKE 'Bank authorization is for%'`,
      [b.id]
    );
    // Optional one-time debit for the month before the recurring one starts.
    let bridgeResult = null;
    const { bridgeSourceId, bridgeAmount } = req.body || {};
    if (bridgeSourceId && plan.bridge) {
      if (Math.round(parseFloat(bridgeAmount) * 100) !== Math.round(plan.bridge.amount * 100)) {
        bridgeResult = { error: 'amount changed; not charged' };
      } else {
        const { chargeBankOnce } = require('../jobs/storageAutopayCron');
        const r = await chargeBankOnce(b.id, plan.bridge.year, plan.bridge.month, bridgeSourceId, plan.bridge.amount);
        bridgeResult = r.charged ? { charged: r.charged, month_label: plan.bridge.monthLabel }
                                 : { error: r.failed || r.skipped || 'not charged' };
      }
    }
    res.json({ ok: true, amount: plan.amount, month_label: plan.monthLabel, charge_date: plan.chargeDate,
               bank_name: b.autopay_bank_name, last4: b.autopay_bank_last4, bridge: bridgeResult });
  } catch (err) {
    const detail = squareErr(err, 'Authorization could not be saved');
    console.error('POST storage-autopay/setup/bank-authorize error:', detail);
    res.status(500).json({ error: detail });
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
              autopay_card_last4 = NULL, autopay_card_exp = NULL, autopay_authorized_at = NULL,
              autopay_bank_auth_token = NULL, autopay_bank_auth_amount = NULL, autopay_bank_auth_start = NULL
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

// --- Staff: resend one month's invoice to one storage customer ------------
// Body: { billing_id, year?, month?, dryRun? }
// Defaults to the CURRENT calendar month, which is the month a customer who
// says "I never got my invoice" is asking about. Sends the normal invoice at
// the box's own rate and keeps the original invoice number, so the customer
// does not think it is a second bill. Refuses if the month is already marked
// paid on the billing grid.
router.post('/invoices/resend', requireAuth, requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { sendAdhocInvoice } = require('../jobs/storageInvoiceCron');
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
    const result = await sendAdhocInvoice({
      billingId: req.body?.billing_id,
      year: req.body?.year ? parseInt(req.body.year) : now.getFullYear(),
      month: req.body?.month ? parseInt(req.body.month) : now.getMonth() + 1,
      dryRun: req.body?.dryRun === true,
      force: true,
    });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
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
    <p style="margin:0;color:#6b7280;font-size:11px;">${company.name()}<br/>${company.fullAddress()}<br/>${company.phone()} | ${company.email()}</p>
  </div>
</div></body></html>`;
      const text = `Hi ${name},\n\nWe are moving our storage billing in house, and you can now put your monthly rent for ${r.space_label || 'your space'} on automatic payment.\n\nSet it up here: ${url}\n\nIt takes about a minute. Your card is stored securely with Square and we never see the number.\n\nPrefer to keep paying the way you do now? Just ignore this email and nothing changes.\n\nThanks,\nCarol and Mark\n${company.name()}\n${company.phone()}`;

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

// --- Staff: payment reminder for the current month ------------------------
// POST /:billingId/remind — emails the customer that rent is due by the late-fee
// day or a late fee applies, with the same two payment buttons as the invoice.
// The day, the fee amount, the fee percentages and the shop's contact details
// all come from Business Settings; the literals here are only the fallback for
// when the settings table cannot be read.
router.post('/:billingId/remind', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const { rows } = await pool.query(
      `SELECT sb.id, sb.monthly_rate, sb.payment_method, sb.autopay_enabled, sb.autopay_setup_token,
              sp.label AS space_label, c.first_name, c.email_primary,
              (SELECT si.total FROM storage_invoices si WHERE si.storage_billing_id = sb.id AND si.year = $2 AND si.month = $3) AS invoice_total,
              (SELECT ps.status FROM storage_payment_status ps WHERE ps.storage_billing_id = sb.id AND ps.year = $2 AND ps.month = $3) AS pay_status
         FROM storage_billing sb
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE sb.id = $1 AND sb.deleted_at IS NULL`,
      [req.params.billingId, year, month]
    );
    if (!rows.length) return res.status(404).json({ error: 'Billing not found' });
    const b = rows[0];
    if (!b.email_primary) return res.status(400).json({ error: 'Customer has no email on file' });
    if (b.pay_status === 'paid') return res.status(400).json({ error: `${MONTHS[month-1]} is already marked paid` });

    const rent = parseFloat(b.monthly_rate);
    const isCard = b.payment_method === 'credit_card';
    const fee = isCard ? Math.round(rent * settings.num('storage_card_fee_pct', 0.035) * 100) / 100
              : b.payment_method === 'ach'
                ? Math.max(Math.round(rent * settings.num('storage_ach_fee_pct', 0.01) * 100) / 100,
                           settings.money('storage_ach_fee_min', 1.00))
                : 0;
    const lateFee = settings.money('storage_late_fee', 25.00);
    const lateDay = settings.int('storage_late_fee_day', 5);
    const lateDayOrdinal = ordinal(lateDay);
    const total = Number(b.invoice_total) || Math.round((rent + fee) * 100) / 100;

    // Autopay setup link
    let token = b.autopay_setup_token;
    if (!token) {
      const upd = await pool.query('UPDATE storage_billing SET autopay_setup_token = gen_random_uuid() WHERE id = $1 RETURNING autopay_setup_token', [b.id]);
      token = upd.rows[0].autopay_setup_token;
    }
    const autopayUrl = `${publicBase(req)}/storage-autopay/${token}`;

    // One-time pay link for card payers
    let payUrl = null;
    if (isCard && square.locationId) {
      try {
        const resp = await square.client.checkout.paymentLinks.create({
          idempotencyKey: crypto.randomUUID(),
          quickPay: {
            name: `RV Storage — Invoice S${year}${String(month).padStart(2, '0')}-reminder-${b.id}`,
            priceMoney: { amount: BigInt(Math.round(total * 100)), currency: 'USD' },
            locationId: square.locationId,
          },
          checkoutOptions: { askForShippingAddress: false },
        });
        const d = resp?.data || resp?.result || resp || {};
        const link = d.paymentLink || d.payment_link || {};
        payUrl = link.url || link.longUrl || link.long_url || null;
      } catch (e) { /* reminder still goes without the link */ }
    }

    const monthName = `${MONTHS[month-1]} ${year}`;
    const name = b.first_name || 'there';
    const payHow = b.payment_method === 'zelle' ? `Send your Zelle payment to ${company.zelleEmail()}.`
      : b.payment_method === 'check' ? `Mail or drop off your check to ${company.fullAddress()}.`
      : b.payment_method === 'cash' ? `Drop off your payment at the office, ${company.pickupHours()}.`
      : 'Use one of the buttons below.';
    const buttons = (isCard) ? `
      <div style="text-align:center;margin:22px 0;">
        ${payUrl ? `<a href="${payUrl}" style="display:inline-block;margin:4px 8px;padding:13px 22px;background:#1e3a5f;color:#fff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">Pay ${'$'}${total.toFixed(2)} Now</a>` : ''}
        <a href="${autopayUrl}" style="display:inline-block;margin:4px 8px;padding:13px 22px;background:#fff;color:#1e3a5f;border:2px solid #1e3a5f;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">Set Up Autopay</a>
      </div>` : '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:18px 32px;">
    <span style="color:#5FD584;font-size:16px;font-weight:bold;">${company.name().toUpperCase()}</span>
  </div>
  <div style="padding:26px 32px;">
    <p style="font-size:15px;color:#111;margin:0 0 12px;">Hi ${name},</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 12px;">
      A friendly reminder that your <strong>${monthName}</strong> storage rent of
      <strong>${'$'}${total.toFixed(2)}</strong> is due.
    </p>
    <p style="font-size:14px;color:#991b1b;line-height:1.6;margin:0 0 12px;">
      <strong>Please pay by the ${lateDayOrdinal} to avoid a ${'$'}${lateFee.toFixed(2)} late fee.</strong>
    </p>
    <p style="font-size:13.5px;color:#374151;line-height:1.6;margin:0 0 6px;">${payHow}</p>
    ${buttons}
    <p style="font-size:13px;color:#374151;margin:14px 0 0;">Questions? Reply to this email or call ${company.phone()}.</p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:12px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">${company.plainTextFooter()}</p>
  </div>
</div></body></html>`;
    const text = `Hi ${name},\n\nA friendly reminder that your ${monthName} storage rent of ${'$'}${total.toFixed(2)} is due.\n\nPlease pay by the ${lateDayOrdinal} to avoid a ${'$'}${lateFee.toFixed(2)} late fee.\n\n${payHow}${payUrl ? `\n\nPay now: ${payUrl}` : ''}\nSet up autopay: ${autopayUrl}\n\nQuestions? Reply or call ${company.phone()}.\n\n${company.name()}`;

    const result = await sendEmail({ to: b.email_primary, subject: `Payment reminder — ${monthName} RV storage`, html, text });
    if (!result || !result.success) return res.status(502).json({ error: result?.error || 'Email failed' });
    res.json({ ok: true, sent_to: b.email_primary, total });
  } catch (err) {
    console.error('POST storage-autopay/:id/remind error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
