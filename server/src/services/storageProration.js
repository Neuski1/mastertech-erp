/**
 * Storage proration
 *
 * One home for the question "what do we bill this box for this calendar
 * month". A storage lease can start mid-month, end mid-month, or both, and
 * temporary storage does both inside a single month (Todd Lytle: Sep 14 to
 * Sep 28 on a $598 box is 15 of 30 days, $299.00 — not $338.87, which is what
 * the old start-date-only math produced).
 *
 * Everything that bills storage must go through monthlyCharge() so the
 * contract, the invoice cron, and the autopay charge engine can never disagree
 * about what a partial month costs.
 *
 * Convention: both dates are INCLUSIVE. A lease running the 14th through the
 * 28th is billed for 15 days. A month with no start/end inside it bills the
 * full monthly rate.
 */

function round2(n) {
  return Math.round(n * 100) / 100;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Normalize a date to { y, m, d } with no timezone shifting.
 * Accepts 'YYYY-MM-DD', an ISO timestamp, or a Date. Postgres DATE columns come
 * back from node-postgres as a Date at local midnight, so reading the UTC parts
 * of an ISO string is the only way to avoid the classic off-by-one-day bug.
 */
function ymd(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const iso = value.toISOString().split('T')[0];
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m, d };
  }
  const s = String(value).trim();
  const iso = s.includes('T') ? s.split('T')[0] : s;
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    if (y && m && d) return { y, m, d };
  }
  // Fall back to whatever the runtime can parse (e.g. "9/28/26" typed by a
  // customer on the contract page).
  const parsed = new Date(s);
  if (isNaN(parsed.getTime())) return null;
  return { y: parsed.getFullYear(), m: parsed.getMonth() + 1, d: parsed.getDate() };
}

// Compare two { y, m, d } values. Returns <0, 0, >0.
function cmp(a, b) {
  return (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
}

/**
 * What one calendar month costs on this lease.
 *
 * @param {number|string} monthlyRate  full monthly rate for the box
 * @param {number} year                calendar year being billed
 * @param {number} month               calendar month being billed (1-12)
 * @param {*} startDate                lease start (billing_start_date)
 * @param {*} endDate                  lease end (scheduled_move_out / billing_end_date), or null for open
 * @returns {{amount:number, days:number, daysInMonth:number, prorated:boolean,
 *            billable:boolean, firstDay:number, lastDay:number}}
 *
 * amount is 0 and billable false when the lease does not cover any of the
 * month, so a caller can use it as the "should this box be billed" test too.
 */
function monthlyCharge(monthlyRate, year, month, startDate, endDate) {
  const dim = daysInMonth(year, month);
  const rate = parseFloat(monthlyRate) || 0;
  const none = { amount: 0, days: 0, daysInMonth: dim, prorated: false, billable: false, firstDay: 1, lastDay: dim };
  if (rate <= 0) return none;

  const s = ymd(startDate);
  const e = ymd(endDate);
  const monthFirst = { y: year, m: month, d: 1 };
  const monthLast = { y: year, m: month, d: dim };

  // Lease starts after this month ends, or ended before it began.
  if (s && cmp(s, monthLast) > 0) return none;
  if (e && cmp(e, monthFirst) < 0) return none;
  // An end date before the start date is nonsense; bill nothing rather than a
  // negative amount.
  if (s && e && cmp(e, s) < 0) return none;

  const firstDay = (s && s.y === year && s.m === month) ? s.d : 1;
  const lastDay = (e && e.y === year && e.m === month) ? e.d : dim;
  const days = lastDay - firstDay + 1;
  if (days <= 0) return none;

  const prorated = days < dim;
  const amount = prorated ? round2((rate / dim) * days) : round2(rate);
  return { amount, days, daysInMonth: dim, prorated, billable: true, firstDay, lastDay };
}

/**
 * Every billable month between start and end, with the amount for each.
 * Returns null when there is no end date — an open-ended lease has no finite
 * total and the contract should not pretend otherwise.
 *
 * @returns {{total:number, months:Array<{year, month, label, amount, days, daysInMonth, prorated}>}|null}
 */
function termSchedule(monthlyRate, startDate, endDate) {
  const s = ymd(startDate);
  const e = ymd(endDate);
  if (!s || !e) return null;
  if (cmp(e, s) < 0) return null;

  const months = [];
  let y = s.y;
  let m = s.m;
  let total = 0;
  // Hard stop at 10 years of months so a typo in the end date can never spin.
  for (let guard = 0; guard < 120; guard++) {
    if (y > e.y || (y === e.y && m > e.m)) break;
    const c = monthlyCharge(monthlyRate, y, m, startDate, endDate);
    if (c.billable) {
      months.push({
        year: y,
        month: m,
        label: new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        amount: c.amount,
        days: c.days,
        daysInMonth: c.daysInMonth,
        prorated: c.prorated,
      });
      total += c.amount;
    }
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  if (!months.length) return null;
  return { total: round2(total), months };
}

module.exports = { monthlyCharge, termSchedule, daysInMonth, round2, ymd };
