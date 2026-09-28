/**
 * Boxes billed by a Square recurring invoice ("billed_by_square").
 *
 * Square only offers automatic bank (ACH) debits through its OWN Invoices
 * product: a seller sets up a recurring invoice in the Square Dashboard and the
 * customer saves their bank on the invoice page. Developers cannot: the
 * Invoices API refuses BANK_ON_FILE ("cannot be set using the Invoices API.
 * This payment method applies only to invoices that sellers create in Square
 * products"), and Web Payments SDK recurring bank authorization is not enabled
 * on the Master Tech account (tested Sept 28, 2026). That Dashboard route is
 * how Carol's earlier ACH customers paid every month.
 *
 * So a box can be flagged billed_by_square. The ERP then sends it no invoice
 * and never charges it (invoice cron and autopay engine skip it), and this
 * sync reads the customer's PAID Square invoices and marks the matching months
 * paid on the billing grid, with a billing-history row, so the books and the
 * grid stay whole without Carol clicking cells green.
 *
 * Month matching: a Square storage invoice is due at the start of the month it
 * covers. A due date on or after the 20th counts toward the NEXT month, which
 * covers a series set to go out at the end of the month for the month ahead.
 */
const pool = require('../db/pool');
const square = require('./square');

function monthFor(dueDate) {
  const [y, m, d] = String(dueDate).slice(0, 10).split('-').map(Number);
  if (!y || !m) return null;
  if (d >= 20) return m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 };
  return { year: y, month: m };
}

async function searchPaidInvoices(customerId) {
  const out = [];
  let cursor;
  for (let page = 0; page < 5; page++) {
    const resp = await square.client.invoices.search({
      query: { filter: { locationIds: [square.locationId], customerIds: [customerId] },
               sort: { field: 'INVOICE_SORT_DATE', order: 'DESC' } },
      limit: 100,
      ...(cursor ? { cursor } : {}),
    });
    const d = resp?.data || resp?.result || resp || {};
    for (const inv of (d.invoices || [])) out.push(inv);
    cursor = d.cursor;
    if (!cursor) break;
  }
  return out.filter(inv => inv.status === 'PAID');
}

async function syncSquareBilledStorage({ dryRun = false } = {}) {
  if (!square.locationId) return { error: 'Square not configured' };
  const { rows: boxes } = await pool.query(
    `SELECT sb.id AS billing_id, sb.customer_id, sb.space_id, sb.monthly_rate,
            COALESCE(sb.square_customer_id, c.square_customer_id) AS sq_customer,
            sb.billing_start_date::text AS start_date, sp.label AS space_label
       FROM storage_billing sb
       JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
      WHERE sb.billed_by_square = TRUE AND sb.deleted_at IS NULL AND sb.billing_end_date IS NULL`
  );
  const results = [];
  for (const b of boxes) {
    if (!b.sq_customer) { results.push({ billing_id: b.billing_id, skipped: 'no Square customer id' }); continue; }
    let invoices;
    try { invoices = await searchPaidInvoices(b.sq_customer); }
    catch (e) { results.push({ billing_id: b.billing_id, error: e.message }); continue; }
    for (const inv of invoices) {
      const pr = (inv.paymentRequests || [])[0] || {};
      const period = monthFor(pr.dueDate);
      if (!period) continue;
      // Never reach back before this box started billing.
      const periodStart = `${period.year}-${String(period.month).padStart(2, '0')}-01`;
      if (b.start_date && periodStart < b.start_date.slice(0, 7) + '-01') continue;
      const paid = Number(pr.totalCompletedAmountMoney?.amount || pr.computedAmountMoney?.amount || 0) / 100;
      const item = { billing_id: b.billing_id, space: b.space_label, invoice: inv.invoiceNumber,
                     period: `${period.year}-${String(period.month).padStart(2, '0')}`, paid };
      if (dryRun) { results.push({ ...item, would_mark: true }); continue; }
      const up = await pool.query(
        `INSERT INTO storage_payment_status (storage_billing_id, year, month, status, source, amount, square_invoice_id)
         VALUES ($1, $2, $3, 'paid', 'square', $4, $5)
         ON CONFLICT (storage_billing_id, year, month)
         DO UPDATE SET status='paid', source='square', amount=EXCLUDED.amount, square_invoice_id=EXCLUDED.square_invoice_id
         WHERE storage_payment_status.status <> 'paid'
         RETURNING storage_billing_id`,
        [b.billing_id, period.year, period.month, paid || null, inv.id]
      );
      if (up.rows.length) {
        // Billing history records rent only; Square keeps its fee before the deposit.
        await pool.query(
          `INSERT INTO storage_charges (billing_id, customer_id, space_id, amount, charge_month, notes)
           SELECT $1::int, $2::int, $3::int, $4::numeric, $5::varchar, $6::text
            WHERE NOT EXISTS (SELECT 1 FROM storage_charges WHERE billing_id = $1::int AND charge_month = $5::varchar)`,
          [b.billing_id, b.customer_id, b.space_id, parseFloat(b.monthly_rate), item.period,
           `Storage paid by Square recurring invoice ${inv.invoiceNumber || inv.id}`]
        );
        results.push({ ...item, marked: true });
      }
    }
  }
  const marked = results.filter(r => r.marked).length;
  if (marked) console.log(`[squareBilled] marked ${marked} month(s) paid from Square invoices`);
  return { boxes: boxes.length, marked, results };
}

module.exports = { syncSquareBilledStorage, monthFor };
