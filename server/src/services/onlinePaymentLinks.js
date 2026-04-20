/**
 * Helpers for programmatically creating and embedding Poynt payment links
 * in outbound emails (estimate, invoice, reminder).
 */

const crypto = require('crypto');
const pool = require('../db/pool');

const VALID_TYPES = new Set(['parts_deposit', 'final_payment']);

function linkBase(req) {
  // Prefer explicit PAYMENT_LINK_BASE_URL, then FRONTEND_URL, then the request host.
  const raw = process.env.PAYMENT_LINK_BASE_URL
    || process.env.FRONTEND_URL
    || (req ? `${req.protocol}://${req.get('host')}` : '');
  return (raw || '').replace(/\/$/, '');
}

function linkUrl(token, req) {
  const base = linkBase(req);
  return base ? `${base}/pay/${token}` : `/pay/${token}`;
}

/**
 * Reuse a pending link of the same type+amount if one exists; otherwise create
 * a new one. Prevents spamming the DB with duplicate links when an admin
 * re-sends the same email multiple times.
 */
async function getOrCreateLink({
  recordId,
  paymentType,
  amountCents,
  customerEmail = null,
  createdByUserId = null,
}, client = pool) {
  if (!VALID_TYPES.has(paymentType)) {
    throw new Error(`Invalid paymentType: ${paymentType}`);
  }
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error(`Invalid amountCents: ${amountCents}`);
  }

  // Look for a pending link we can reuse
  const { rows: existing } = await client.query(
    `SELECT * FROM online_payments
      WHERE record_id = $1
        AND payment_type = $2
        AND amount_cents = $3
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1`,
    [recordId, paymentType, amountCents]
  );
  if (existing.length > 0) return existing[0];

  const token = crypto.randomUUID();
  const { rows } = await client.query(
    `INSERT INTO online_payments
       (payment_token, record_id, amount_cents, payment_type, status, customer_email, created_by_user_id)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)
     RETURNING *`,
    [token, recordId, amountCents, paymentType, customerEmail, createdByUserId]
  );
  return rows[0];
}

/**
 * Build an inline HTML "Pay Online" call-to-action block for emails.
 * Styled with inline attributes for email-client compatibility.
 */
function buildPayButtonHtml({
  url,
  amountDollars,
  paymentTypeLabel,
  recordNumber,
  customerName,
}) {
  const label = paymentTypeLabel === 'Parts Deposit' ? 'Pay Parts Deposit' : 'Pay Invoice';
  return `
  <div style="margin:24px 0;padding:24px;background:#eff6ff;border:2px solid #bfdbfe;border-radius:8px;text-align:center;">
    <p style="margin:0 0 6px;font-size:13px;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${paymentTypeLabel}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#374151;">WO #${recordNumber} &mdash; ${customerName}</p>
    <p style="margin:0 0 14px;font-size:28px;font-weight:700;color:#1e3a5f;">$${amountDollars}</p>
    <a href="${url}" target="_blank"
       style="display:inline-block;padding:16px 40px;background:#1e3a5f;color:#ffffff;font-size:17px;font-weight:bold;text-decoration:none;border-radius:8px;min-width:200px;">
      ${label}
    </a>
    <p style="margin:12px 0 0;font-size:11px;color:#6b7280;">Secure payment by GoDaddy Payments. Questions? Call (303) 557-2214.</p>
  </div>`;
}

/**
 * Build plain-text fallback for email clients that render text only.
 */
function buildPayButtonText({ url, amountDollars, paymentTypeLabel, recordNumber }) {
  return `\n\n${paymentTypeLabel} for WO #${recordNumber}: $${amountDollars}\nPay online: ${url}\n`;
}

module.exports = {
  getOrCreateLink,
  linkUrl,
  buildPayButtonHtml,
  buildPayButtonText,
};
