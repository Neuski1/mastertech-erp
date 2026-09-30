// Storage payment receipts (Migration 071, Sept 30, 2026).
//
// When a Zelle, check or cash box is clicked green on the billing grid, the
// customer gets one "Payment received" email for that month. Card and ACH
// boxes are skipped: Square already sends them its own receipt.
//
// Rules:
//  - Only a manual cell marked 'paid' with a collected amount > 0.
//  - Only boxes whose payment_method is zelle, check or cash.
//  - One receipt per box per month, ever (storage_payment_status.receipt_sent_at).
//    Green, red, green again sends nothing the second time.
//  - No email, or an email flagged bad, means no send.
//  - Gated by system_settings.storage_receipts_enabled ('true' to send).
//    Off by default so the first send waits on Carol's dry-run approval.
//  - Every send is logged to Communication History as storage_payment_receipt.

const pool = require('../db/pool');

const RECEIPT_METHODS = ['zelle', 'check', 'cash'];
const METHOD_LABEL = { zelle: 'Zelle', check: 'check', cash: 'cash' };
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const usd = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const titleCase = (s) => s
  ? s.trim().toLowerCase().replace(/(^|[\s/&-])([a-z])/g, (m, a, b) => a + b.toUpperCase())
  : 'there';

async function installStorageReceipts(db) {
  await db.query(`ALTER TABLE storage_payment_status ADD COLUMN IF NOT EXISTS receipt_sent_at TIMESTAMPTZ`);
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value, description)
     VALUES ('storage_receipts_enabled', 'false',
             'Email a payment receipt when a Zelle, check or cash storage month is marked paid')
     ON CONFLICT (setting_key) DO NOTHING`
  );
}

function receiptFields(r) {
  const y = Number(r.year), m = Number(r.month);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    firstName: titleCase(r.first_name),
    method: METHOD_LABEL[r.payment_method] || r.payment_method,
    amount: usd(r.amount),
    monthName: MONTH_NAMES[m - 1],
    paidThrough: `${MONTH_NAMES[m - 1]} ${lastDay}, ${y}`,
  };
}

function buildReceiptSubject() {
  return 'Payment received, thank you';
}

function buildReceiptText(f) {
  return `Hi ${f.firstName},

We received your ${f.method} payment of ${f.amount} for ${f.monthName} storage. Your space is paid through ${f.paidThrough}.

Thanks for storing with Master Tech. Questions? Call (303) 557-2214.

Carol Neu
Master Tech RV Repair & Storage
6590 E. 49th Ave., Commerce City, CO 80022`;
}

function buildReceiptHtml(f) {
  const logo = `${process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app'}/logo-mark.png?v=2`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:18px 28px;">
    <table style="border-collapse:collapse;"><tr>
      <td style="vertical-align:middle;padding-right:12px;">
        <img src="${logo}" alt="Master Tech RV" style="height:46px;width:auto;display:block;" />
      </td>
      <td style="vertical-align:middle;">
        <span style="color:#5FD584;font-size:15px;font-weight:bold;letter-spacing:.02em;">MASTER TECH RV<br/>REPAIR AND STORAGE</span>
      </td>
    </tr></table>
  </div>
  <div style="padding:26px 28px;font-size:14px;color:#111;line-height:1.6;">
    <p style="margin:0 0 14px;">Hi ${f.firstName},</p>
    <p style="margin:0 0 14px;">We received your ${f.method} payment of <strong>${f.amount}</strong> for ${f.monthName} storage. Your space is paid through <strong>${f.paidThrough}</strong>.</p>
    <p style="margin:0 0 14px;">Thanks for storing with Master Tech. Questions? Call (303) 557-2214.</p>
    <p style="margin:0 0 2px;">Carol Neu</p>
    <p style="margin:0;color:#374151;">Master Tech RV Repair &amp; Storage</p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 28px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">6590 E. 49th Ave., Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

// Returns { result, ... }. result is one of: sent, would send, test sent,
// skipped (with reason), failed.
//   dryRun  - render only, send nothing, claim nothing.
//   testTo  - send the real rendered email to this address instead of the
//             customer. Claims nothing, logs nothing. For previews.
async function sendStorageReceipt({ billingId, year, month, userId = null, dryRun = false, testTo = null }) {
  const { rows } = await pool.query(
    `SELECT ps.status, ps.source, ps.amount, ps.receipt_sent_at, ps.year, ps.month,
            sb.id AS billing_id, sb.payment_method, sb.deleted_at,
            c.id AS customer_id, c.first_name, c.last_name, c.email_primary, c.email_invalid
       FROM storage_payment_status ps
       JOIN storage_billing sb ON sb.id = ps.storage_billing_id
       JOIN customers c ON c.id = sb.customer_id
      WHERE ps.storage_billing_id = $1 AND ps.year = $2 AND ps.month = $3`,
    [billingId, year, month]
  );
  const r = rows[0];
  const out = { billing_id: billingId, year, month };
  if (!r) return { ...out, result: 'skipped', reason: 'no status row for that month' };
  out.customer = [r.first_name, r.last_name].filter(Boolean).join(' ');
  out.email = r.email_primary || null;
  out.payment_method = r.payment_method;

  if (r.status !== 'paid') return { ...out, result: 'skipped', reason: `month is ${r.status}` };
  if (r.source !== 'manual') return { ...out, result: 'skipped', reason: `paid by ${r.source}, not marked manually` };
  if (!RECEIPT_METHODS.includes(r.payment_method)) return { ...out, result: 'skipped', reason: `box pays by ${r.payment_method || 'unset'}` };
  if (!(Number(r.amount) > 0)) return { ...out, result: 'skipped', reason: 'no amount entered yet' };
  // Cleaning up old cells on the grid must not email anyone about April.
  // Last month, this month and anything ahead are fair game.
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  const cur = now.getFullYear() * 12 + now.getMonth();
  if (Number(year) * 12 + (Number(month) - 1) < cur - 1) {
    return { ...out, result: 'skipped', reason: 'month is older than last month' };
  }
  if (!testTo && r.receipt_sent_at) return { ...out, result: 'skipped', reason: `receipt already sent ${new Date(r.receipt_sent_at).toISOString()}` };
  if (!testTo && (!r.email_primary || r.email_invalid)) {
    return { ...out, result: 'skipped', reason: r.email_invalid ? 'email flagged bad' : 'no email on file' };
  }

  const f = receiptFields(r);
  const subject = buildReceiptSubject();
  const html = buildReceiptHtml(f);
  const text = buildReceiptText(f);
  out.amount = Number(r.amount);
  out.subject = subject;

  if (dryRun) return { ...out, result: 'would send', html, text };

  const { sendEmail } = require('./email');
  if (testTo) {
    const resp = await sendEmail({ to: testTo, subject: `[TEST] ${subject}`, html, text });
    return { ...out, result: resp && resp.success ? 'test sent' : 'failed', to: testTo, error: resp?.error };
  }

  const { getSettingString } = require('../db/calculations');
  if ((await getSettingString('storage_receipts_enabled')) !== 'true') {
    return { ...out, result: 'skipped', reason: 'storage receipts switched off' };
  }

  // Claim first, so two quick clicks can never send two receipts.
  const claim = await pool.query(
    `UPDATE storage_payment_status SET receipt_sent_at = NOW()
      WHERE storage_billing_id = $1 AND year = $2 AND month = $3 AND receipt_sent_at IS NULL
      RETURNING id`,
    [billingId, year, month]
  );
  if (!claim.rows.length) return { ...out, result: 'skipped', reason: 'receipt already sent' };

  try {
    const resp = await sendEmail({ to: r.email_primary, subject, html, text });
    if (!resp || !resp.success) throw new Error(resp?.error || 'send failed');
    await pool.query(
      `INSERT INTO communication_log
         (customer_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id)
       VALUES ($1,'email','storage_payment_receipt',$2,'sent',FALSE,$3)`,
      [r.customer_id, `To: ${r.email_primary}\nSubject: ${subject}\n\n${text}`, userId]
    );
    return { ...out, result: 'sent' };
  } catch (e) {
    // Release the claim so a later click can try again.
    await pool.query(
      `UPDATE storage_payment_status SET receipt_sent_at = NULL
        WHERE storage_billing_id = $1 AND year = $2 AND month = $3`,
      [billingId, year, month]
    );
    return { ...out, result: 'failed', error: e.message };
  }
}

module.exports = { installStorageReceipts, sendStorageReceipt, RECEIPT_METHODS };
