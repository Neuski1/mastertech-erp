// Reconciles Square payments that never registered in the ERP (e.g. a customer
// paid a payment link but the browser redirect back to us was lost). Runs every
// 15 minutes AND is called by the webhook for real-time capture. Fail-safe: it
// dedupes by Square payment id AND only records against a record that still has
// a balance owed, so it can never double-record.
const cron = require('node-cron');
const pool = require('../db/pool');


const { recalculateTotals } = require('../db/calculations');
const { client: squareClient, locationId } = require('../services/square');

async function resolveRecordId(dbClient, payment) {
  const orderId = payment.orderId || payment.order_id;
  if (!orderId) return null;
  let order;
  try {
    const resp = await squareClient.orders.get({ orderId });
    const d = resp?.data || resp?.result || resp || {};
    order = d.order || d;
  } catch (e) {
    return null;
  }
  if (!order) return null;

  // Preferred: an explicit reference_id equal to our record id (terminal + newer links).
  const ref = order.referenceId || order.reference_id;
  if (ref && /^\d+$/.test(String(ref))) {
    const { rows } = await dbClient.query('SELECT id FROM records WHERE id = $1 AND deleted_at IS NULL', [ref]);
    if (rows.length) return rows[0].id;
  }
  // Fallback: parse "WO #<record_number>" from the line item name we set.
  const items = order.lineItems || order.line_items || [];
  for (const it of items) {
    const m = /WO #(\d+)/i.exec(it.name || '');
    if (m) {
      const { rows } = await dbClient.query('SELECT id FROM records WHERE record_number = $1 AND deleted_at IS NULL', [m[1]]);
      if (rows.length) return rows[0].id;
    }
  }
  return null;
}

// Record ONE Square payment into the ERP, with all the fail-safes. Used by both
// the reconcile loop and the webhook. Returns { recorded, recordId, reason }.
async function recordSquarePayment(payment) {
  const payId = payment && payment.id;
  if (!payId) return { recorded: false, reason: 'no id' };
  if (payment.status !== 'COMPLETED' && payment.status !== 'APPROVED') return { recorded: false, reason: 'not completed' };

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const { rows: exist } = await dbClient.query('SELECT id FROM payments WHERE square_transaction_id = $1', [payId]);
    if (exist.length) { await dbClient.query('ROLLBACK'); return { recorded: false, reason: 'already recorded' }; }

    const recordId = await resolveRecordId(dbClient, payment);
    if (!recordId) { await dbClient.query('ROLLBACK'); return { recorded: false, reason: 'no record match' }; }

    const { rows: recRows } = await dbClient.query('SELECT status, amount_due FROM records WHERE id = $1', [recordId]);
    if (!recRows.length || parseFloat(recRows[0].amount_due) <= 0.01) { await dbClient.query('ROLLBACK'); return { recorded: false, reason: 'no balance owed' }; }

    const amount = Number(payment.amountMoney?.amount || payment.amount_money?.amount || 0) / 100;
    if (amount <= 0) { await dbClient.query('ROLLBACK'); return { recorded: false, reason: 'zero amount' }; }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
    await dbClient.query(
      `INSERT INTO payments (record_id, payment_type, payment_method, amount, payment_date, square_transaction_id, notes)
       VALUES ($1, 'final_payment', 'credit_card', $2, $3, $4, $5)`,
      [recordId, amount, today, payId, `Square payment ${payId}`]
    );
    await recalculateTotals(recordId, dbClient);

    const { rows: r2 } = await dbClient.query('SELECT status, amount_due, total_collected FROM records WHERE id = $1', [recordId]);
    const rec = r2[0];
    if (parseFloat(rec.amount_due) <= 0 && parseFloat(rec.total_collected) > 0 && !['estimate', 'approved', 'void'].includes(rec.status)) {
      await dbClient.query("UPDATE records SET status = 'paid', payment_pending_since = NULL, reminder_count = 0, last_reminder_sent_at = NULL WHERE id = $1", [recordId]);
    } else if (parseFloat(rec.total_collected) > 0 && parseFloat(rec.amount_due) > 0 && ['complete', 'payment_pending'].includes(rec.status)) {
      await dbClient.query("UPDATE records SET status = 'partial' WHERE id = $1", [recordId]);
    }
    await dbClient.query('COMMIT');
    console.log(`[squareReconcile] Recorded $${amount} for record ${recordId} (Square payment ${payId})`);
    return { recorded: true, recordId, amount };
  } catch (e) {
    try { await dbClient.query('ROLLBACK'); } catch (_) {}
    console.error('[squareReconcile] error for payment', payId, e.message);
    return { recorded: false, reason: e.message };
  } finally {
    dbClient.release();
  }
}

// A storage pay-link payment carries the invoice number in its order line item
// ("RV Storage — Invoice S202609-643"). When one completes, mark every space on
// that customer+period paid so the billing grid flips green on its own.
async function recordStoragePayment(payment) {
  const payId = payment && payment.id;
  if (!payId) return { recorded: false };
  if (payment.status !== 'COMPLETED' && payment.status !== 'APPROVED') return { recorded: false };
  // Skip refunded payments (e.g. system tests).
  const refunded = Number(payment.refundedMoney?.amount || payment.refunded_money?.amount || 0);
  if (refunded > 0) return { recorded: false, reason: 'refunded' };

  const orderId = payment.orderId || payment.order_id;
  if (!orderId) return { recorded: false };
  let order;
  try {
    const resp = await squareClient.orders.get({ orderId });
    const d = resp?.data || resp?.result || resp || {};
    order = d.order || d;
  } catch (e) { return { recorded: false }; }
  if (!order) return { recorded: false };

  let m = null;
  for (const it of (order.lineItems || order.line_items || [])) {
    m = /Invoice S(\d{4})(\d{2})-(\d+)/.exec(it.name || '');
    if (m) break;
  }
  if (!m) return { recorded: false };
  const year = parseInt(m[1]), month = parseInt(m[2]), customerId = parseInt(m[3]);

  const dbc = await pool.connect();
  try {
    const { rows } = await dbc.query(
      `SELECT si.storage_billing_id, si.rent
         FROM storage_invoices si
         JOIN storage_billing sb ON sb.id = si.storage_billing_id
        WHERE sb.customer_id = $1 AND si.year = $2 AND si.month = $3`,
      [customerId, year, month]
    );
    if (!rows.length) return { recorded: false };
    // Record what the customer ACTUALLY paid, not the bare rent. The invoice
    // total carries the 3.5% card fee, so writing si.rent understated every
    // card payment (Hadank paid 99.36 and the ERP filed 96.00) and the month
    // would not tie at close. Split the payment across the customer's spaces
    // in proportion to rent when there is more than one.
    const paidTotal = Number(payment.amountMoney?.amount || payment.amount_money?.amount || 0) / 100;
    const rentTotal = rows.reduce((a, r) => a + parseFloat(r.rent || 0), 0);
    const shareFor = (r) => {
      if (!(paidTotal > 0)) return parseFloat(r.rent || 0);
      if (rows.length === 1 || !(rentTotal > 0)) return paidTotal;
      return Math.round(paidTotal * (parseFloat(r.rent || 0) / rentTotal) * 100) / 100;
    };
    for (const r of rows) {
      const share = shareFor(r);
      await dbc.query(
        `INSERT INTO storage_payment_status (storage_billing_id, year, month, status, source, amount)
         VALUES ($1, $2, $3, 'paid', 'square', $4)
         ON CONFLICT (storage_billing_id, year, month)
         DO UPDATE SET status='paid', source='square', amount=EXCLUDED.amount
         -- Protect a manual PAID record, but never let a stale manual 'unpaid'
         -- row block a payment that actually cleared (same bug as the autopay
         -- engine had: Conklin's grid stayed red on a completed charge).
         WHERE NOT (storage_payment_status.source = 'manual'
                    AND storage_payment_status.status = 'paid')`,
        [r.storage_billing_id, year, month, share]
      );
      await dbc.query(
        `UPDATE storage_invoices SET status='paid' WHERE storage_billing_id=$1 AND year=$2 AND month=$3`,
        [r.storage_billing_id, year, month]
      );
      await dbc.query(
        // Every parameter cast explicitly. Without the casts Postgres deduces
        // conflicting types for $3 and rejects the whole statement, which is why
        // online storage payments never wrote a billing-history row.
        `INSERT INTO storage_charges (billing_id, customer_id, space_id, amount, charge_month, notes)
         SELECT $1::int, sb.customer_id, sb.space_id, $2::numeric, $3::varchar, $4::text
           FROM storage_billing sb WHERE sb.id = $1::int
            AND NOT EXISTS (SELECT 1 FROM storage_charges sc
                             WHERE sc.billing_id = $1::int AND sc.charge_month = $3::varchar)`,
        // Rent only. The card convenience fee is taken by Square before the
        // deposit lands, so it is not income we receive. storage_payment_status
        // above still carries the gross the customer actually paid.
        [r.storage_billing_id, parseFloat(r.rent || 0), `${year}-${String(month).padStart(2, '0')}`,
         `Storage paid online (Square ${payId})`]
      );
    }
    console.log(`[squareReconcile] Storage invoice S${m[1]}${m[2]}-${customerId} marked paid (${rows.length} space(s), payment ${payId})`);
    return { recorded: true, spaces: rows.length };
  } finally { dbc.release(); }
}

async function listRecentPayments(beginTime) {
  const resp = await squareClient.payments.list({ locationId, beginTime, sortField: 'CREATED_AT', sortOrder: 'DESC' });
  if (Array.isArray(resp)) return resp;
  if (resp?.data && Array.isArray(resp.data)) return resp.data;
  if (resp?.result?.payments) return resp.result.payments;
  if (resp?.payments) return resp.payments;
  if (resp && typeof resp[Symbol.asyncIterator] === 'function') {
    const out = [];
    for await (const item of resp) { out.push(item); if (out.length >= 200) break; }
    return out;
  }
  return [];
}

async function reconcileSquarePayments({ hoursBack = 72 } = {}) {
  if (!locationId) return { checked: 0, recorded: 0, error: 'no location' };
  const beginTime = new Date(Date.now() - hoursBack * 3600 * 1000).toISOString();

  let payments = [];
  try {
    payments = await listRecentPayments(beginTime);
  } catch (e) {
    console.error('[squareReconcile] list payments failed:', e.message);
    return { checked: 0, recorded: 0, error: e.message };
  }

  let checked = 0, recorded = 0, storageMarked = 0;
  for (const p of payments) {
    if (p.status !== 'COMPLETED' && p.status !== 'APPROVED') continue;
    checked++;
    const r = await recordSquarePayment(p);
    if (r.recorded) { recorded++; continue; }
    // Not a work-order payment: check whether it settles a storage invoice.
    try {
      const s = await recordStoragePayment(p);
      if (s.recorded) storageMarked++;
    } catch (e) { /* non-fatal */ }
  }
  if (storageMarked) console.log(`[squareReconcile] Marked ${storageMarked} storage invoice payment(s) paid.`);
  if (recorded) console.log(`[squareReconcile] Recorded ${recorded} missed payment(s) of ${checked} checked.`);
  return { checked, recorded };
}

function startSquareReconcileCron() {
  cron.schedule('*/15 * * * *', async () => {
    try { await reconcileSquarePayments({ hoursBack: 72 }); }
    catch (e) { console.error('[squareReconcile] fatal:', e.message); }
  });
  console.log('[squareReconcile] Square payment reconcile cron scheduled (every 15 min)');
}

module.exports = { startSquareReconcileCron, reconcileSquarePayments, recordSquarePayment, recordStoragePayment };
