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

// Convenience fee passed through on autopay charges, matching the invoice.
// A stored-card charge carries the 3.5% card-on-file fee; ACH (when built)
// carries 1% with Square's $1 minimum. Falls back to the card fee when no
// payment method is set, since the charge itself runs on a card.
function chargeFee(method, rent) {
  if (method === 'ach') return Math.max(Math.round(rent * 0.01 * 100) / 100, 1.00);
  return Math.round(rent * 0.035 * 100) / 100;
}

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
    `SELECT sb.id AS billing_id, sb.customer_id, sb.space_id, sb.monthly_rate, sb.payment_method,
            sb.autopay_card_id, sb.square_customer_id,
            sb.autopay_card_brand, sb.autopay_card_last4,
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
  const rent = parseFloat(b.monthly_rate);
  const fee = chargeFee(b.payment_method, rent);
  const amountCents = Math.round((rent + fee) * 100);
  const label = `${b.space_label || 'Storage'} ${year}-${String(month).padStart(2, '0')}`;
  if (dryRun) {
    return { billing_id: b.billing_id, space: b.space_label, rent, fee, amount: amountCents / 100, would_charge: true };
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

    // Idempotency key. Attempt 1 keeps the original deterministic key, which is
    // what makes a re-run of a stalled charge return the existing payment
    // instead of charging the card twice (it is why Coover was not billed twice
    // on Aug 31 2026). Attempt 2 onward must use a FRESH key: Square replays the
    // stored result for a key it has already seen, so the 3-day retry was
    // handing back the original decline without ever asking the bank again.
    const attemptNo = (row.attempts || 0) + 1;
    const period = `${year}-${String(month).padStart(2, '0')}`;
    const idempotencyKey = attemptNo <= 1
      ? `sap-${b.billing_id}-${period}`
      : `sap-${b.billing_id}-${period}-a${attemptNo}`;

    let payment, error;
    try {
      const resp = await square.client.payments.create({
        idempotencyKey,
        sourceId: b.autopay_card_id,
        customerId: b.square_customer_id,
        amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
        locationId: square.locationId,
        referenceId: `storage-billing-${b.billing_id}`,
        note: `Storage autopay - ${label} (rent ${rent.toFixed(2)} + fee ${fee.toFixed(2)})`,
        // Square emails its own receipt whenever a buyer email is supplied.
        // Without this the customer's card is charged in total silence, which
        // is how the Aug 31 2026 run went out.
        ...(b.email_primary ? { buyerEmailAddress: b.email_primary } : {}),
      });
      payment = pickPayment(resp);
    } catch (e) {
      error = e.errors ? e.errors.map(x => x.detail).join('; ') : (e.message || 'charge failed');
    }

    const ok = payment && (payment.status === 'COMPLETED' || payment.status === 'APPROVED');
    if (ok) {
      // The card has already been charged at this point. Record what we can and
      // never let a bookkeeping error make a completed charge look unpaid, so
      // each statement is guarded on its own instead of sharing a transaction.
      // (A shared transaction is what broke the Aug 31 2026 go-live: one bad
      // INSERT aborted it, the client was released without a ROLLBACK, and
      // node-pg handed that same poisoned client to every charge behind it.)
      const rec = async (sql, params, what) => {
        try { await dbc.query(sql, params); }
        catch (e) { console.error(`[storageAutopay] record ${what} failed for billing ${b.billing_id}:`, e.message); }
      };
      await rec(
        `UPDATE storage_autopay_charges SET status='paid', attempts=attempts+1,
                square_payment_id=$2, last_error=NULL, last_attempt_at=NOW(), updated_at=NOW()
           WHERE storage_billing_id=$1 AND year=$3 AND month=$4`,
        [b.billing_id, payment.id, year, month], 'charge row'
      );
      await rec(
        `INSERT INTO storage_payment_status (storage_billing_id, year, month, status, source, amount)
         VALUES ($1, $2, $3, 'paid', 'auto', $4)
         ON CONFLICT (storage_billing_id, year, month)
         DO UPDATE SET status='paid', source='auto', amount=EXCLUDED.amount
         -- Protect a manual PAID record (Carol's green click wins), but never
         -- let a stale manual 'unpaid' row block a charge that just cleared.
         WHERE NOT (storage_payment_status.source = 'manual'
                    AND storage_payment_status.status = 'paid')`,
        [b.billing_id, year, month, amountCents / 100], 'payment status'
      );
      // Customer-record billing history (same table the manual billing run used).
      // Every parameter is cast explicitly: without the casts Postgres deduces
      // conflicting types for $3 in an INSERT ... SELECT and rejects the whole
      // statement.
      // The books record RENT ONLY. Square deducts its processing fee before
      // the money ever reaches the bank, so the 3.5% convenience fee is not
      // income we receive. The customer is still charged rent + fee; only what
      // we keep is booked. Owner decision, Aug 31 2026.
      //
      // Update first, then insert. The old insert-if-absent alone meant a
      // re-charge after a refund or a correction silently recorded nothing,
      // because a row for that month already existed.
      const chargeMonth = `${year}-${String(month).padStart(2, '0')}`;
      const chargeNote = `Storage autopay - ${b.space_label || ''} (Square ${payment.id})`;
      await rec(
        `UPDATE storage_charges SET amount = $2::numeric, notes = $4::text
          WHERE billing_id = $1::int AND charge_month = $3::varchar`,
        [b.billing_id, rent, chargeMonth, chargeNote], 'billing history update'
      );
      await rec(
        `INSERT INTO storage_charges (billing_id, customer_id, space_id, amount, charge_month, notes)
         SELECT $1::int, sb.customer_id, sb.space_id, $2::numeric, $3::varchar, $4::text
           FROM storage_billing sb WHERE sb.id = $1::int
            AND NOT EXISTS (SELECT 1 FROM storage_charges sc
                             WHERE sc.billing_id = $1::int AND sc.charge_month = $3::varchar)`,
        [b.billing_id, rent, chargeMonth, chargeNote], 'billing history'
      );
      console.log(`[storageAutopay] Charged $${amountCents / 100} for billing ${b.billing_id} (${label})`);
      dbc.release();
      return { billing_id: b.billing_id, charged: amountCents / 100, payment_id: payment.id };
    } else {
      const attempts = (row.attempts || 0) + 1;
      const finalFail = attempts >= 2;
      await dbc.query(
        // Every parameter must appear in the SQL. The stray unused $4 here made
        // Postgres reject this statement, so real declines were recorded with a
        // SQL error instead of the card's actual decline reason.
        `UPDATE storage_autopay_charges SET status=$4, attempts=$2, last_error=$3, last_attempt_at=NOW(), updated_at=NOW()
           WHERE storage_billing_id=$1 AND year=$5 AND month=$6`,
        [b.billing_id, attempts, String(error || 'declined').slice(0, 500), finalFail ? 'failed_final' : 'failed', year, month]
      );
      dbc.release();
      // Both notices go out on the first decline. Carol asked not to wait for
      // the 3-day retry to find out, and neither should the customer.
      await notifyCustomerDecline(b, year, month, error, amountCents / 100, finalFail);
      await notifyOwnerFailure(b, year, month, error, finalFail);
      return { billing_id: b.billing_id, failed: error || 'declined', attempts, final: finalFail };
    }
  } catch (e) {
    // Roll back before releasing. A client returned to the pool mid-transaction
    // is reused (node-pg hands back the most recently released client first) and
    // takes down every charge behind it.
    try { await dbc.query('ROLLBACK'); } catch (_) {}
    try { dbc.release(); } catch (_) {}
    console.error('[storageAutopay] chargeOne error', b.billing_id, e.message);
    try {
      await pool.query(
        `UPDATE storage_autopay_charges SET status='failed', attempts=GREATEST(attempts, 1),
                last_error=$2, last_attempt_at=NOW(), updated_at=NOW()
           WHERE storage_billing_id=$1 AND year=$3 AND month=$4 AND status='pending'`,
        [b.billing_id, String(e.message).slice(0, 500), year, month]
      );
    } catch (_) {}
    return { billing_id: b.billing_id, failed: e.message };
  }
}

// Tell the customer the moment their card is refused, with the two buttons
// that actually fix it. Waiting for the 3-day retry meant a decline sat silent
// while the space showed unpaid and nobody knew.
async function notifyCustomerDecline(b, year, month, error, amount, finalAttempt) {
  if (!b.email_primary) return;
  const name = b.first_name || 'there';
  const space = b.space_label || 'your storage space';
  const period = `${MONTH_NAMES[month - 1]} ${year}`;
  const card = b.autopay_card_last4
    ? `${b.autopay_card_brand || 'card'} ending ${b.autopay_card_last4}`
    : 'card on file';
  const expired = /EXPIRED/i.test(error || '');

  let autopayUrl = null, payUrl = null;
  try {
    const invoiceCron = require('./storageInvoiceCron');
    autopayUrl = await invoiceCron.autopayUrlFor(b.billing_id);
    payUrl = await invoiceCron.createPayLink({
      invoiceNumber: `S${year}${String(month).padStart(2, '0')}-${b.customer_id}`,
      customerName: [b.first_name, b.last_name].filter(Boolean).join(' '),
      totalCents: Math.round(amount * 100),
    });
  } catch (e) {
    console.error('[storageAutopay] decline email links failed:', e.message);
  }

  const reason = expired
    ? `Your ${card} has expired.`
    : `Your ${card} was declined by the bank.`;
  const next = finalAttempt
    ? 'We have stopped retrying, so the space stays unpaid until you take care of it.'
    : 'We will try once more in about three days, but updating the card now saves the wait.';
  const btn = (href, text, bg) => href
    ? `<a href="${href}" style="display:inline-block;padding:12px 22px;margin:6px 8px 6px 0;background:${bg};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:0.95rem">${text}</a>`
    : '';

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#1f2937;line-height:1.5">
    <p>Hi ${name},</p>
    <p>${reason} We were not able to collect <strong>$${amount.toFixed(2)}</strong> for ${period} storage on ${space}.</p>
    <p>${next}</p>
    <p>${btn(autopayUrl, 'Update Card on File', '#1e3a5f')}${btn(payUrl, 'Pay This Invoice', '#0f766e')}</p>
    <p>Prefer not to pay the credit card convenience fee? We also take Zelle, check and bank transfer. Reply to this email or call us and we will switch you over.</p>
    <p style="margin-top:22px;color:#6b7280;font-size:0.85rem">
      Master Tech RV Repair and Storage<br/>
      6590 E. 49th Ave., Commerce City, CO 80022<br/>
      (303) 557-2214
    </p>
  </div>`;

  const text = `Hi ${name},\n\n${reason} We were not able to collect $${amount.toFixed(2)} for ${period} storage on ${space}.\n\n${next}\n\n`
    + (autopayUrl ? `Update your card: ${autopayUrl}\n` : '')
    + (payUrl ? `Pay this invoice: ${payUrl}\n` : '')
    + `\nPrefer not to pay the credit card convenience fee? We also take Zelle, check and bank transfer. Reply to this email or call (303) 557-2214.\n\n`
    + `Master Tech RV Repair and Storage | 6590 E. 49th Ave., Commerce City, CO 80022 | (303) 557-2214`;

  try {
    await sendEmail({
      to: b.email_primary,
      subject: `Your ${period} storage payment did not go through`,
      html, text,
    });
    console.log(`[storageAutopay] Decline notice emailed to ${b.email_primary} (billing ${b.billing_id})`);
  } catch (e) {
    console.error('[storageAutopay] decline email failed:', e.message);
  }
}

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

async function notifyOwnerFailure(b, year, month, error, finalFail) {
  const name = [b.first_name, b.last_name].filter(Boolean).join(' ') || `customer ${b.customer_id}`;
  const stage = finalFail ? 'after the retry, no further attempts' : 'first attempt, one retry left';
  try {
    await sendEmail({
      to: OWNER_EMAIL,
      subject: `Autopay declined: ${name} (${b.space_label || 'space'})`,
      html: `<p>The autopay card for <strong>${name}</strong> (${b.space_label || 'space'}) was declined for ${year}-${String(month).padStart(2, '0')} (${stage}).</p>
             <p>Amount: $${parseFloat(b.monthly_rate).toFixed(2)}<br/>Reason: ${error || 'declined'}</p>
             <p>The customer has already been emailed with a link to update the card and a link to pay this invoice. The space stays unpaid until one of those happens.</p>`,
      text: `Autopay declined for ${name} (${b.space_label || 'space'}) ${year}-${String(month).padStart(2, '0')} (${stage}). Amount $${parseFloat(b.monthly_rate).toFixed(2)}. Reason: ${error || 'declined'}. Customer emailed with update-card and pay-now links. Space still unpaid.`,
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
      `SELECT ac.storage_billing_id AS billing_id, ac.year, ac.month, sb.monthly_rate, sb.payment_method,
              sb.autopay_card_id, sb.square_customer_id, sp.label AS space_label,
              sb.autopay_card_brand, sb.autopay_card_last4,
              c.first_name, c.last_name, c.email_primary, sb.customer_id
         FROM storage_autopay_charges ac
         JOIN storage_billing sb ON sb.id = ac.storage_billing_id
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE (
                (ac.status = 'failed' AND ac.attempts = 1
                 AND ac.last_attempt_at <= NOW() - INTERVAL '3 days')
             OR (ac.status = 'pending' AND ac.created_at <= NOW() - INTERVAL '1 hour')
              )
          AND sb.deleted_at IS NULL
          AND sb.autopay_enabled = TRUE AND sb.autopay_card_id IS NOT NULL`
    );
    due = rows;
  } finally { dbc.release(); }

  let retried = 0;
  for (const b of due) { await chargeOne(b, b.year, b.month, { dryRun: false }); retried++; }
  if (retried) console.log(`[storageAutopay] Retried ${retried} declined charge(s).`);
  return { retried };
}

// Catch-up pass. If the last-day run dies partway through, or the server
// restarts during it, nothing else would retry until the end of the NEXT month.
// On the first five days of a month, re-run charges for the month we are now in.
// Everything downstream is idempotent: spaces already marked paid are filtered
// out, and Square's deterministic key returns the original payment rather than
// charging a card a second time.
async function runCatchUp(d = new Date()) {
  if (d.getDate() > 5) return { skipped: 'outside catch-up window' };
  const period = { year: d.getFullYear(), month: d.getMonth() + 1 };
  const res = await runCharges(period);
  if (res.charged || res.failed) console.log(`[storageAutopay] Catch-up: ${res.charged} charged, ${res.failed} failed.`);
  return res;
}

function startStorageAutopayCron() {
  // Daily 06:00 America/Denver. Charge on the last day of the month; catch up on
  // the first five days of a month; retry declines and stalled rows any day.
  cron.schedule('0 6 * * *', async () => {
    try {
      if (isLastDayOfMonth()) await runCharges({});
      else await runCatchUp();
      await runRetries();
    } catch (e) {
      console.error('[storageAutopay] fatal:', e.message);
    }
  }, { timezone: 'America/Denver' });
  console.log('[storageAutopay] Storage autopay cron scheduled (charges last day of month, retries daily)');
}

module.exports = { startStorageAutopayCron, runCharges, runRetries, runCatchUp };
