// Storage autopay charge engine (Phase 2). Charges the card on file for each
// autopay-enabled storage space on the LAST DAY of the month, for the UPCOMING
// month, matching Carol's invoice timing. Safety rails:
//   * Deterministic Square idempotency key per (billing, period) => a card can
//     never be double-charged, even if the job runs twice.
//   * Skips any space already paid for that period, moved out, or ended.
//   * On decline: retries ONCE ~3 days later, then emails Carol and stops.
//   * dryRun mode reports who WOULD be charged without charging anyone.
const cron = require('node-cron');
const pool = require('../db/pool');
const square = require('../services/square');
const { sendEmail } = require('../services/email');

const OWNER_EMAIL = process.env.OWNER_ALERT_EMAIL || 'service@mastertechrvrepair.com';

function isLastDayOfMonth(d = new Date()) {
  const t = new Date(d);
  t.setDate(t.getDate() + 1);
  return t.getDate() === 1;
}

// The period we bill for on the last day of month = next calendar month.
function nextPeriod(d = new Date()) {
  let y = d.getFullYear();
  let m = d.getMonth() + 2; // getMonth() 0-11 -> current is +1, next is +2
  if (m > 12) { m -= 12; y += 1; }
  return { year: y, month: m };
}

async function eligibleBillings(dbc, year, month) {
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const { rows } = await dbc.query(
    `SELECT sb.id AS billing_id, sb.customer_id, sb.space_id, sb.monthly_rate,
            sb.autopay_card_id, sb.square_customer_id,
            sp.label AS space_label,
            c.first_name, c.last_name, c.email_primary
       FROM storage_billing sb
       LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
       LEFT JOIN customers c ON c.id = sb.customer_id
      WHERE sb.autopay_enabled = TRUE
        AND sb.deleted_at IS NULL
        AND sb.autopay_card_id IS NOT NULL
        AND sb.square_customer_id IS NOT NULL
        AND (sb.billing_end_date IS NULL OR sb.billing_end_date >= $1::date)
        AND (sb.scheduled_move_out IS NULL OR sb.scheduled_move_out >= $1::date)
        AND COALESCE(sb.monthly_rate, 0) > 0
        AND NOT EXISTS (
          SELECT 1 FROM storage_payment_status ps
           WHERE ps.storage_billing_id = sb.id AND ps.year = $2 AND ps.month = $3
             AND ps.status IN ('paid', 'partial')
        )`,
    [periodStart, year, month]
  );
  return rows;
}

function pickPayment(resp) {
  const d = resp?.data || resp?.result || resp || {};
  return d.payment || d;
}

async function chargeOne(b, year, month, { dryRun }) {
  const amountCents = Math.round(parseFloat(b.monthly_rate) * 100);
  const label = `${b.space_label || 'Storage'} ${year}-${String(month).padStart(2, '0')}`;
  if (dryRun) {
    return { billing_id: b.billing_id, space: b.space_label, amount: amountCents / 100, would_charge: true };
  }

  const dbc = await pool.connect();
  try {
    // Record/lock the attempt row first.
    const { rows: cur } = await dbc.query(
      `INSERT INTO storage_autopay_charges (storage_billing_id, year, month, status, attempts, amount)
       VALUES ($1, $2, $3, 'pending', 0, $4)
       ON CONFLICT (storage_billing_id, year, month) DO UPDATE SET updated_at = NOW()
       RETURNING id, status, attempts`,
      [b.billing_id, year, month, amountCents / 100]
    );
    const row = cur[0];
    if (row.status === 'paid' || row.status === 'failed_final') { dbc.release(); return { billing_id: b.billing_id, skipped: row.status }; }

    let payment, error;
    try {
      const resp = await square.client.payments.create({
        idempotencyKey: `sap-${b.billing_id}-${year}-${String(month).padStart(2, '0')}`, // deterministic: no double charge
        sourceId: b.autopay_card_id,
        customerId: b.square_customer_id,
        amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
        locationId: square.locationId,
        referenceId: `storage-billing-${b.billing_id}`,
        note: `Storage autopay - ${label}`,
      });
      payment = pickPayment(resp);
    } catch (e) {
      error = e.errors ? e.errors.map(x => x.detail).join('; ') : (e.message || 'charge failed');
    }

    const ok = payment && (payment.status === 'COMPLETED' || payment.status === 'APPROVED');
    if (ok) {
      await dbc.query('BEGIN');
      await dbc.query(
        `UPDATE storage_autopay_charges SET status='paid', attempts=attempts+1,
                square_payment_id=$2, last_error=NULL, last_attempt_at=NOW(), updated_at=NOW()
           WHERE storage_billing_id=$1 AND year=$3 AND month=$4`,
        [b.billing_id, payment.id, year, month]
      );
      await dbc.query(
        `INSERT INTO storage_payment_status (storage_billing_id, year, month, status, source, amount)
         VALUES ($1, $2, $3, 'paid', 'auto', $4)
         ON CONFLICT (storage_billing_id, year, month)
         DO UPDATE SET status='paid', source='auto', amount=EXCLUDED.amount
         WHERE storage_payment_status.source <> 'manual'`,
        [b.billing_id, year, month, amountCents / 100]
      );
      await dbc.query('COMMIT');
      console.log(`[storageAutopay] Charged $${amountCents / 100} for billing ${b.billing_id} (${label})`);
      dbc.release();
      return { billing_id: b.billing_id, charged: amountCents / 100, payment_id: payment.id };
    } else {
      const attempts = (row.attempts || 0) + 1;
      const finalFail = attempts >= 2;
      await dbc.query(
        `UPDATE storage_autopay_charges SET status=$5, attempts=$2, last_error=$3, last_attempt_at=NOW(), updated_at=NOW()
           WHERE storage_billing_id=$1 AND year=$6 AND month=$7`,
        [b.billing_id, attempts, error || 'declined', null, finalFail ? 'failed_final' : 'failed', year, month]
      );
      dbc.release();
      if (finalFail) await notifyOwnerFailure(b, year, month, error);
      return { billing_id: b.billing_id, failed: error || 'declined', attempts, final: finalFail };
    }
  } catch (e) {
    try { dbc.release(); } catch (_) {}
    console.error('[storageAutopay] chargeOne error', b.billing_id, e.message);
    return { billing_id: b.billing_id, failed: e.message };
  }
}

async function notifyOwnerFailure(b, year, month, error) {
  const name = [b.first_name, b.last_name].filter(Boolean).join(' ') || `customer ${b.customer_id}`;
  try {
    await sendEmail({
      to: OWNER_EMAIL,
      subject: `Autopay declined: ${name} (${b.space_label || 'space'})`,
      html: `<p>The autopay card for <strong>${name}</strong> (${b.space_label || 'space'}) was declined for ${year}-${String(month).padStart(2, '0')} after a retry.</p>
             <p>Amount: $${parseFloat(b.monthly_rate).toFixed(2)}<br/>Reason: ${error || 'declined'}</p>
             <p>The space is still marked unpaid. Follow up with the customer for another payment method.</p>`,
      text: `Autopay declined for ${name} (${b.space_label || 'space'}) ${year}-${String(month).padStart(2, '0')}. Amount $${parseFloat(b.monthly_rate).toFixed(2)}. Reason: ${error || 'declined'}. Space still unpaid.`,
    });
  } catch (e) {
    console.error('[storageAutopay] owner notify failed:', e.message);
  }
}

// Charge pass for a specific period (defaults to next month). dryRun previews.
async function runCharges({ year, month, dryRun = false } = {}) {
  if (!square.locationId || !process.env.SQUARE_ACCESS_TOKEN) {
    return { error: 'Square not configured', charged: 0 };
  }
  const p = (year && month) ? { year, month } : nextPeriod();
  const dbc = await pool.connect();
  let billings;
  try { billings = await eligibleBillings(dbc, p.year, p.month); }
  finally { dbc.release(); }

  const results = [];
  for (const b of billings) results.push(await chargeOne(b, p.year, p.month, { dryRun }));
  const charged = results.filter(r => r.charged).length;
  const failed = results.filter(r => r.failed).length;
  console.log(`[storageAutopay] Period ${p.year}-${p.month} ${dryRun ? '(dry run) ' : ''}: ${billings.length} eligible, ${charged} charged, ${failed} failed`);
  return { period: p, dryRun, eligible: billings.length, charged, failed, results };
}

// Retry pass: one retry ~3 days after the first failure, then stop.
async function runRetries() {
  if (!square.locationId || !process.env.SQUARE_ACCESS_TOKEN) return { retried: 0 };
  const dbc = await pool.connect();
  let due;
  try {
    const { rows } = await dbc.query(
      `SELECT ac.storage_billing_id AS billing_id, ac.year, ac.month, sb.monthly_rate,
              sb.autopay_card_id, sb.square_customer_id, sp.label AS space_label,
              c.first_name, c.last_name, c.customer_id
         FROM storage_autopay_charges ac
         JOIN storage_billing sb ON sb.id = ac.storage_billing_id
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE ac.status = 'failed' AND ac.attempts = 1
          AND ac.last_attempt_at <= NOW() - INTERVAL '3 days'
          AND sb.autopay_enabled = TRUE AND sb.autopay_card_id IS NOT NULL`
    );
    due = rows;
  } finally { dbc.release(); }

  let retried = 0;
  for (const b of due) { await chargeOne(b, b.year, b.month, { dryRun: false }); retried++; }
  if (retried) console.log(`[storageAutopay] Retried ${retried} declined charge(s).`);
  return { retried };
}

function startStorageAutopayCron() {
  // Daily 06:00 America/Denver. Charge on the last day of the month; retry any day.
  cron.schedule('0 6 * * *', async () => {
    try {
      if (isLastDayOfMonth()) await runCharges({});
      await runRetries();
    } catch (e) {
      console.error('[storageAutopay] fatal:', e.message);
    }
  }, { timezone: 'America/Denver' });
  console.log('[storageAutopay] Storage autopay cron scheduled (charges last day of month, retries daily)');
}

module.exports = { startStorageAutopayCron, runCharges, runRetries };
