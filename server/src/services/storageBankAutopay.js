/**
 * ACH bank autopay for storage: which month the bank authorization starts, and
 * for exactly how much.
 *
 * Square's recurring bank authorization (Web Payments SDK, intent
 * RECURRING_CHARGE) is for a FIXED amount. Square never debits on its own: our
 * charge engine reuses the BAUTH token each month, and it only does so when
 * that month's rent + ACH fee equals the authorized amount. A different amount
 * (a rate increase, a prorated last month) needs the customer to re-authorize.
 *
 * So the authorization starts at the first month that is:
 *   - after the current month (the engine bills a month ahead),
 *   - not already paid,
 *   - on or after every scheduled-but-not-live rate change for the box,
 * which means a customer who enrolls while an increase is pending authorizes
 * the NEW amount once, instead of once now and again when it goes live.
 * Months before that keep whatever they had (a card on file, or an invoice).
 */
const pool = require('../db/pool');
const settings = require('../db/settings');
const { monthlyCharge } = require('./storageProration');

function achFee(rent) {
  const pct = settings.num('storage_ach_fee_pct', 0.01);
  const min = settings.money('storage_ach_fee_min', 1.00);
  return Math.max(Math.round(rent * pct * 100) / 100, min);
}

function denverNow() {
  const s = new Date().toLocaleString('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

const pad = (n) => String(n).padStart(2, '0');
const monthKey = (y, m) => y * 12 + (m - 1);
const fromKey = (k) => ({ y: Math.floor(k / 12), m: (k % 12) + 1 });

async function bankPlan(billingId, db = pool) {
  const { rows: bRows } = await db.query(
    `SELECT id, monthly_rate, billing_start_date, scheduled_move_out, billing_end_date
       FROM storage_billing WHERE id = $1 AND deleted_at IS NULL`,
    [billingId]
  );
  const b = bRows[0];
  if (!b) return null;

  const now = denverNow();
  let k = monthKey(now.y, now.m) + 1; // next month

  const { rows: pend } = await db.query(
    `SELECT new_rate::numeric AS new_rate, effective_date::text AS eff
       FROM storage_rate_changes
      WHERE storage_billing_id = $1 AND rate_live_at IS NULL
      ORDER BY effective_date, id`,
    [billingId]
  );
  for (const p of pend) {
    const [py, pm] = p.eff.split('-').map(Number);
    k = Math.max(k, monthKey(py, pm));
  }

  const { rows: paid } = await db.query(
    `SELECT year, month FROM storage_payment_status
      WHERE storage_billing_id = $1 AND status IN ('paid','partial')`,
    [billingId]
  );
  const paidKeys = new Set(paid.map(r => monthKey(r.year, r.month)));
  let guard = 0;
  while (paidKeys.has(k) && guard++ < 24) k++;

  const { y, m } = fromKey(k);
  const monthStart = `${y}-${pad(m)}-01`;
  // Rate for that month: the latest pending change effective by then, else the live rate.
  let rate = parseFloat(b.monthly_rate) || 0;
  for (const p of pend) if (p.eff <= monthStart) rate = parseFloat(p.new_rate);

  const c = monthlyCharge(rate, y, m, b.billing_start_date, b.scheduled_move_out || b.billing_end_date);
  const rent = c.billable ? c.amount : rate;
  const fee = achFee(rent);
  const amount = Math.round((rent + fee) * 100) / 100;

  // Charged on the last day of the month before; never a date in the past.
  const last = new Date(Date.UTC(y, m - 1, 0));
  let chargeDate = last.toISOString().slice(0, 10);
  const today = `${now.y}-${pad(now.m)}-${pad(now.d)}`;
  if (chargeDate < today) chargeDate = today;

  return {
    year: y, month: m, periodStart: monthStart,
    monthLabel: new Date(Date.UTC(y, m - 1, 15)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    rent, fee, amount, chargeDate,
    prorated: !!c.prorated,
  };
}

module.exports = { bankPlan, achFee };
