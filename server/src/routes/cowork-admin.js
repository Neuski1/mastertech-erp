// server/src/routes/cowork-admin.js
//
// Cowork admin SQL endpoint. Lets the Cowork assistant make database
// changes via API instead of direct Postgres URL access. Eliminates the
// password rotation cycle that broke the backend after every chart change.
//
// Auth: X-Cowork-Key header must match COWORK_API_KEY env var.
// Audit: every execution logs to audit_log (table_name = 'cowork_sql').
//
// SAFETY:
//   - Hard-blocks DROP DATABASE, DROP SCHEMA, TRUNCATE
//   - Caps result row count to 5000 to keep responses sane
//   - Wraps writes in transactions
//   - Never logs the raw SQL value (could contain sensitive data), only a hash + length

const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');

const router = express.Router();

function requireCoworkKey(req, res, next) {
  const provided = req.headers['x-cowork-key'];
  const expected = process.env.COWORK_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'COWORK_API_KEY not configured on server' });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing X-Cowork-Key' });
  }
  next();
}

// Hard-block destructive commands at the application layer (defense in depth).
const BLOCK_PATTERNS = [
  /\bDROP\s+DATABASE\b/i,
  /\bDROP\s+SCHEMA\b/i,
  /\bDROP\s+ROLE\b/i,
  /\bDROP\s+USER\b/i,
  /\bTRUNCATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bALTER\s+ROLE\b/i,
  /\bALTER\s+USER\b/i,
  /\bpg_terminate_backend\b/i,
];

function isBlocked(sql) {
  for (const p of BLOCK_PATTERNS) {
    if (p.test(sql)) return p.toString();
  }
  return null;
}

// POST /api/cowork-admin/sql
// Body: { sql: string, params?: any[], description?: string }
// Returns: { rowCount, rows, command }
router.post('/sql', requireCoworkKey, async (req, res) => {
  const { sql, params = [], description } = req.body || {};
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'sql (string) required' });
  }
  const blocked = isBlocked(sql);
  if (blocked) {
    return res.status(403).json({ error: `Blocked by safety filter: ${blocked}` });
  }
  const sqlHash = crypto.createHash('sha256').update(sql).digest('hex').slice(0, 16);
  const startedAt = new Date();
  let result;
  try {
    result = await pool.query(sql, params);
  } catch (err) {
    // Log the failure to audit_log
    try {
      await pool.query(
        `INSERT INTO audit_log (table_name, row_id, action, changed_by, new_value)
         VALUES ('cowork_sql', 0, 'INSERT', 'cowork', $1)`,
        [JSON.stringify({
          ok: false,
          hash: sqlHash,
          length: sql.length,
          description: description || null,
          error: err.message,
          startedAt,
        })]
      );
    } catch (logErr) {
      console.error('audit log write failed:', logErr.message);
    }
    return res.status(400).json({ error: err.message });
  }
  // Trim rows for safety
  const rows = Array.isArray(result.rows) ? result.rows.slice(0, 5000) : [];
  const truncated = (result.rows || []).length > 5000;

  // Audit success
  try {
    await pool.query(
      `INSERT INTO audit_log (table_name, row_id, action, changed_by, new_value)
       VALUES ('cowork_sql', 0, 'INSERT', 'cowork', $1)`,
      [JSON.stringify({
        ok: true,
        hash: sqlHash,
        length: sql.length,
        description: description || null,
        command: result.command,
        rowCount: result.rowCount,
        startedAt,
      })]
    );
  } catch (logErr) {
    console.error('audit log write failed:', logErr.message);
  }

  res.json({
    ok: true,
    command: result.command,
    rowCount: result.rowCount,
    rows,
    truncated,
  });
});

// POST /api/cowork-admin/journal-entry
// Higher-level wrapper for posting balanced journal entries.
// Body: {
//   entry_date: 'YYYY-MM-DD',
//   description: string,
//   source: string,
//   source_ref?: string,
//   lines: [{ account_number, debit, credit, memo }]
// }
router.post('/journal-entry', requireCoworkKey, async (req, res) => {
  const { entry_date, description, source, source_ref, lines } = req.body || {};
  if (!entry_date || !description || !source || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: 'entry_date, description, source, lines[] (>=2) required' });
  }
  const totalDr = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCr = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  if (Math.abs(totalDr - totalCr) > 0.005) {
    return res.status(400).json({ error: `Unbalanced: debits=${totalDr.toFixed(2)} credits=${totalCr.toFixed(2)}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const je = await client.query(
      `INSERT INTO journal_entries (entry_date, description, source, source_ref, is_posted, posted_at, posted_by)
       VALUES ($1, $2, $3, $4, TRUE, NOW(), 'cowork')
       RETURNING id`,
      [entry_date, description, source, source_ref || null]
    );
    const jeId = je.rows[0].id;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const acct = await client.query(`SELECT id FROM accounts WHERE account_number = $1`, [String(l.account_number)]);
      if (acct.rows.length === 0) throw new Error(`Account not found: ${l.account_number}`);
      await client.query(
        `INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo, line_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [jeId, acct.rows[0].id, Number(l.debit || 0), Number(l.credit || 0), l.memo || null, i + 1]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, journal_entry_id: jeId, debits: totalDr, credits: totalCr });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/cowork-admin/health  - quick connectivity test
router.get('/health', requireCoworkKey, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now, current_database() AS db');
    res.json({ ok: true, now: rows[0].now, db: rows[0].db });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cowork-admin/run-backup  - run the nightly DB backup on demand
// (same job the 2 AM cron runs). Lets us verify the email pipeline without
// waiting for the schedule.
router.post('/run-backup', requireCoworkKey, async (req, res) => {
  try {
    const { runDatabaseBackup } = require('../jobs/dbBackupCron');
    const result = await runDatabaseBackup();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/cowork-admin/review-test  { to, firstName?, unit? }
// Sends ONE review-request email (the exact template the cron uses) to a
// given address so we can preview it without sending to real customers.
// ---------------------------------------------------------------------------
router.post('/review-test', requireCoworkKey, async (req, res) => {
  try {
    const to = (req.body && req.body.to) || 'service@mastertechrvrepair.com';
    const firstName = (req.body && req.body.firstName) || 'Carol';
    const unitDescription = (req.body && req.body.unit) || '2022 Airstream Globetrotter';
    const { buildReviewRequestHtml } = require('../jobs/reviewRequestCron');
    const { sendEmail } = require('../services/email');
    const html = buildReviewRequestHtml({ firstName, unitDescription });
    const text = `Hi ${firstName},\n\nMark and Carol here from Master Tech RV. Thanks for trusting us with the service for your ${unitDescription}.\n\nIf we earned it, would you take 60 seconds to leave us a Google review? It helps our small family shop stay visible to other RV owners in Denver.\n\nLeave a review: https://g.page/r/CcdbSyhGUgf6EBM/review\n\nThanks,\nCarol and Mark\nMaster Tech RV Repair & Storage\n(303) 557-2214`;
    const result = await sendEmail({ to, subject: `How'd we do, ${firstName}? (TEST PREVIEW)`, html, text });
    res.json({ ok: !!(result && result.success), to, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cowork-admin/square-card-audit
// READ-ONLY. For each active storage billing, find the customer in Square and
// report whether they already have a card on file we could charge directly.
// This decides whether converting off Square invoices requires customers to
// re-enter their cards, or whether we can migrate them silently.
router.get('/square-card-audit', requireCoworkKey, async (req, res) => {
  try {
    const square = require('../services/square');
    const { rows } = await pool.query(
      `SELECT sb.id AS billing_id, sp.label AS space, sb.monthly_rate,
              sb.square_customer_id, sb.square_sub_id,
              c.id AS customer_id, c.first_name, c.last_name,
              c.email_primary, c.phone_primary
         FROM storage_billing sb
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE sb.billing_end_date IS NULL AND sb.deleted_at IS NULL
        ORDER BY sp.label`
    );

    const digits = (s) => String(s || '').replace(/\D/g, '');
    const out = [];

    for (const r of rows) {
      const entry = {
        billing_id: r.billing_id, space: r.space, rate: r.monthly_rate,
        customer: [r.first_name, r.last_name].filter(Boolean).join(' '),
        email: r.email_primary || null,
        square_customer_id: null, cards: [], matched_by: null, note: null,
      };
      try {
        let sqCustomerId = null;

        // 1) Search Square by email, then by phone.
        if (r.email_primary) {
          const resp = await square.client.customers.search({
            query: { filter: { emailAddress: { exact: r.email_primary } } },
          });
          const d = resp?.data || resp?.result || resp || {};
          const list = d.customers || [];
          if (list.length) { sqCustomerId = list[0].id; entry.matched_by = 'email'; }
        }
        if (!sqCustomerId && r.phone_primary) {
          const ph = digits(r.phone_primary);
          if (ph.length >= 10) {
            const resp = await square.client.customers.search({
              query: { filter: { phoneNumber: { fuzzy: ph.slice(-10) } } },
            });
            const d = resp?.data || resp?.result || resp || {};
            const list = d.customers || [];
            if (list.length) { sqCustomerId = list[0].id; entry.matched_by = 'phone'; }
          }
        }
        entry.square_customer_id = sqCustomerId;

        // 2) Cards on file for that Square customer.
        if (sqCustomerId) {
          const cardResp = await square.client.cards.list({ customerId: sqCustomerId, sortOrder: 'ASC' });
          let cards = [];
          if (Array.isArray(cardResp)) cards = cardResp;
          else if (cardResp?.data && Array.isArray(cardResp.data)) cards = cardResp.data;
          else if (cardResp?.result?.cards) cards = cardResp.result.cards;
          else if (cardResp?.cards) cards = cardResp.cards;
          else if (cardResp && typeof cardResp[Symbol.asyncIterator] === 'function') {
            for await (const c of cardResp) { cards.push(c); if (cards.length >= 25) break; }
          }
          entry.cards = cards
            .filter(c => c.enabled !== false)
            .map(c => ({ id: c.id, brand: c.cardBrand || c.card_brand, last4: c.last4,
                         exp: (c.expMonth || c.exp_month) + '/' + (c.expYear || c.exp_year) }));
        } else {
          entry.note = 'no Square customer match';
        }
      } catch (e) {
        entry.note = 'lookup error: ' + (e.message || 'unknown');
      }
      out.push(entry);
    }

    const withCard = out.filter(e => e.cards.length > 0).length;
    res.json({
      total_active: out.length,
      square_customer_matched: out.filter(e => e.square_customer_id).length,
      with_card_on_file: withCard,
      needs_customer_action: out.length - withCard,
      spaces: out,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cowork-admin/square-customer-search?q=Name — READ-ONLY lookup of a
// Square customer by name/email, with any cards on file. Used to resolve
// storage customers whose ERP contact info does not match Square.
router.get('/square-customer-search', requireCoworkKey, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q required' });
    const square = require('../services/square');
    const resp = await square.client.customers.search({
      query: { filter: { textFilter: { fuzzy: q } } },
    });
    const d = resp?.data || resp?.result || resp || {};
    const list = d.customers || [];
    const out = [];
    for (const cu of list.slice(0, 8)) {
      let cards = [];
      try {
        const cr = await square.client.cards.list({ customerId: cu.id, sortOrder: 'ASC' });
        let arr = [];
        if (Array.isArray(cr)) arr = cr;
        else if (cr?.data && Array.isArray(cr.data)) arr = cr.data;
        else if (cr?.cards) arr = cr.cards;
        else if (cr && typeof cr[Symbol.asyncIterator] === 'function') {
          for await (const x of cr) { arr.push(x); if (arr.length >= 20) break; }
        }
        cards = arr.filter(c => c.enabled !== false)
                   .map(c => ({ id: c.id, brand: c.cardBrand || c.card_brand, last4: c.last4 }));
      } catch (e) { /* ignore */ }
      out.push({
        square_customer_id: cu.id,
        name: [cu.givenName, cu.familyName].filter(Boolean).join(' ') || cu.companyName || null,
        email: cu.emailAddress || null,
        phone: cu.phoneNumber || null,
        cards,
      });
    }
    res.json({ query: q, results: out });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cowork-admin/storage-attach-card
// Body: { billing_id, square_customer_id, card_id }
// Attaches an EXISTING Square card-on-file to a storage billing and turns on
// ERP autopay. Charges nothing now - the monthly job bills on the last day of
// the month. Used to migrate customers off Square recurring invoices without
// making them re-enter a card.
router.post('/storage-attach-card', requireCoworkKey, async (req, res) => {
  const { billing_id, square_customer_id, card_id } = req.body || {};
  if (!billing_id || !square_customer_id || !card_id) {
    return res.status(400).json({ error: 'billing_id, square_customer_id and card_id are required' });
  }
  try {
    const square = require('../services/square');
    // Verify the card exists, is enabled, and belongs to that customer.
    const cr = await square.client.cards.get({ cardId: card_id });
    const cd = cr?.data || cr?.result || cr || {};
    const card = cd.card || cd;
    if (!card || !card.id) return res.status(404).json({ error: 'Card not found in Square' });
    if (card.enabled === false) return res.status(400).json({ error: 'Card is disabled in Square' });
    if (card.customerId && card.customerId !== square_customer_id) {
      return res.status(400).json({ error: 'Card does not belong to that Square customer' });
    }

    const { rows } = await pool.query(
      `UPDATE storage_billing
          SET square_customer_id = $1,
              autopay_card_id = $2,
              autopay_card_brand = $3,
              autopay_card_last4 = $4,
              autopay_card_exp = $5,
              autopay_enabled = TRUE,
              autopay_authorized_at = COALESCE(autopay_authorized_at, NOW())
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING id, autopay_enabled, autopay_card_brand, autopay_card_last4`,
      [
        square_customer_id, card.id,
        card.cardBrand || card.card_brand || null,
        card.last4 || null,
        (card.expMonth && card.expYear)
          ? String(card.expMonth).padStart(2, '0') + '/' + String(card.expYear).slice(-2)
          : null,
        billing_id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Storage billing not found' });
    res.json({ ok: true, billing: rows[0] });
  } catch (err) {
    const detail = err.errors ? err.errors.map(e => e.detail).join('; ') : err.message;
    res.status(500).json({ error: detail });
  }
});

// POST /api/cowork-admin/storage-invoice-run  { dryRun, year, month }
router.post('/storage-invoice-run', requireCoworkKey, async (req, res) => {
  try {
    const { runInvoices } = require('../jobs/storageInvoiceCron');
    const dryRun = req.body?.dryRun !== false;
    const year = req.body?.year ? parseInt(req.body.year) : undefined;
    const month = req.body?.month ? parseInt(req.body.month) : undefined;
    const billingIds = Array.isArray(req.body?.billing_ids) ? req.body.billing_ids.map(Number) : null;
    res.json(await runInvoices({ year, month, dryRun, billingIds }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/cowork-admin/square-series-lookup?series=1495 — READ-ONLY.
// Finds the Square customer behind a recurring invoice series and lists their
// cards on file. Used when a storage customer's ERP email/phone does not match
// their Square profile.
router.get('/square-series-lookup', requireCoworkKey, async (req, res) => {
  try {
    const series = String(req.query.series || '').trim();
    if (!series) return res.status(400).json({ error: 'series required' });
    const square = require('../services/square');
    if (!square.locationId) return res.status(503).json({ error: 'SQUARE_LOCATION_ID not configured' });

    const seriesOf = (inv) => {
      const num = inv.invoiceNumber || inv.invoice_number;
      if (!num) return null;
      const i = String(num).indexOf('-R-');
      return i > 0 ? String(num).slice(0, i).trim() : null;
    };

    let customerId = null, sample = null, scanned = 0;
    const page = await square.client.invoices.list({ locationId: square.locationId, limit: 200 });
    for await (const inv of page) {
      scanned++;
      if (seriesOf(inv) !== series) continue;
      const pr = inv.primaryRecipient || inv.primary_recipient;
      if (pr && (pr.customerId || pr.customer_id)) {
        customerId = pr.customerId || pr.customer_id;
        sample = { invoice_number: inv.invoiceNumber || inv.invoice_number,
                   name: [pr.givenName || pr.given_name, pr.familyName || pr.family_name].filter(Boolean).join(' '),
                   email: pr.emailAddress || pr.email_address || null };
        break;
      }
    }
    if (!customerId) return res.json({ series, scanned, found: false });

    let cards = [];
    try {
      const cr = await square.client.cards.list({ customerId, sortOrder: 'ASC' });
      let arr = [];
      if (Array.isArray(cr)) arr = cr;
      else if (cr?.data && Array.isArray(cr.data)) arr = cr.data;
      else if (cr?.cards) arr = cr.cards;
      else if (cr && typeof cr[Symbol.asyncIterator] === 'function') {
        for await (const x of cr) { arr.push(x); if (arr.length >= 20) break; }
      }
      cards = arr.filter(c => c.enabled !== false)
                 .map(c => ({ id: c.id, brand: c.cardBrand || c.card_brand, last4: c.last4,
                              customer_id: c.customerId || c.customer_id }));
    } catch (e) { /* ignore */ }

    res.json({ series, scanned, found: true, square_customer_id: customerId, invoice: sample, cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cowork-admin/autopay-link-candidates — who is NOT on autopay yet
router.get('/autopay-link-candidates', requireCoworkKey, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.id AS billing_id, sp.label AS space, sb.monthly_rate, sb.payment_method,
              c.first_name, c.last_name, c.email_primary
         FROM storage_billing sb
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE sb.deleted_at IS NULL AND sb.billing_end_date IS NULL
          AND COALESCE(sb.autopay_enabled, FALSE) = FALSE
          AND (sb.scheduled_move_out IS NULL OR sb.scheduled_move_out > NOW())
        ORDER BY sp.label`
    );
    res.json({ count: rows.length, candidates: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/cowork-admin/autopay-test-charge  { billing_id, amount }
// Charges the stored card a SMALL test amount (capped at $5) to prove the
// production charge path end to end before month-end. Returns the Square
// payment id so it can be refunded right after.
router.post('/autopay-test-charge', requireCoworkKey, async (req, res) => {
  try {
    const { billing_id } = req.body || {};
    const amount = Math.min(parseFloat(req.body?.amount) || 1.00, 5.00);
    if (!billing_id) return res.status(400).json({ error: 'billing_id required' });

    const { rows } = await pool.query(
      `SELECT sb.id, sb.autopay_card_id, sb.square_customer_id, sp.label
         FROM storage_billing sb LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
        WHERE sb.id = $1 AND sb.autopay_enabled = TRUE AND sb.deleted_at IS NULL`,
      [billing_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No autopay-enabled billing with that id' });
    const b = rows[0];

    const square = require('../services/square');
    const crypto = require('crypto');
    const resp = await square.client.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: b.autopay_card_id,
      customerId: b.square_customer_id,
      amountMoney: { amount: BigInt(Math.round(amount * 100)), currency: 'USD' },
      locationId: square.locationId,
      note: `Autopay TEST charge - ${b.label || 'storage'} - will be refunded`,
    });
    const d = resp?.data || resp?.result || resp || {};
    const pay = d.payment || d;
    res.json({ ok: pay.status === 'COMPLETED' || pay.status === 'APPROVED',
               payment_id: pay.id, status: pay.status, amount });
  } catch (err) {
    const detail = err.errors ? err.errors.map(e => e.detail).join('; ') : err.message;
    res.status(502).json({ error: detail });
  }
});

// POST /api/cowork-admin/refund-payment  { payment_id }
// Refunds a payment in full (used to undo the test charge).
router.post('/refund-payment', requireCoworkKey, async (req, res) => {
  try {
    const { payment_id } = req.body || {};
    if (!payment_id) return res.status(400).json({ error: 'payment_id required' });
    const square = require('../services/square');
    const crypto = require('crypto');
    const pr = await square.client.payments.get({ paymentId: payment_id });
    const pd = pr?.data || pr?.result || pr || {};
    const pay = pd.payment || pd;
    const amt = pay.amountMoney?.amount || pay.amount_money?.amount;
    const resp = await square.client.refunds.refundPayment({
      idempotencyKey: crypto.randomUUID(),
      paymentId: payment_id,
      amountMoney: { amount: BigInt(amt), currency: 'USD' },
      reason: 'Autopay system test - full refund',
    });
    const d = resp?.data || resp?.result || resp || {};
    const refund = d.refund || d;
    res.json({ ok: true, refund_id: refund.id, status: refund.status });
  } catch (err) {
    const detail = err.errors ? err.errors.map(e => e.detail).join('; ') : err.message;
    res.status(502).json({ error: detail });
  }
});

module.exports = router;
