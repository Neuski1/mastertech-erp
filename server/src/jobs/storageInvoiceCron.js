// Monthly storage invoice engine. Emails every active storage customer an
// invoice for the coming month on the last day of the current month, matching
// how Carol has always billed. Records what was sent in storage_invoices so an
// invoice is never emailed twice for the same space and period.
//
// Payment-method aware: when a space is set to 'credit_card' the invoice shows
// the card processing fee as its own line. Zelle / check / cash / ACH show no
// fee and get pay-by instructions instead.
const cron = require('node-cron');
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');

const CARD_SURCHARGE_PCT = 0.035;   // Square: manual entry / card on file
const ACH_SURCHARGE_PCT = 0.01;     // Square: ACH bank transfer
const ACH_MIN_FEE = 1.00;           // Square bills a $1 minimum on ACH

function isLastDayOfMonth(d = new Date()) {
  const t = new Date(d);
  t.setDate(t.getDate() + 1);
  return t.getDate() === 1;
}

function nextPeriod(d = new Date()) {
  let y = d.getFullYear();
  let m = d.getMonth() + 2;
  if (m > 12) { m -= 12; y += 1; }
  return { year: y, month: m };
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// How each payment type is described and whether it carries the card fee.
function methodInfo(method, autopayOn, cardBrand, cardLast4) {
  switch (method) {
    case 'credit_card':
      return {
        feePct: CARD_SURCHARGE_PCT, feeMin: 0, feeLabel: 'Card processing fee (3.5%)',
        label: 'Credit card',
        instructions: autopayOn
          ? `No action needed. Your ${cardBrand || 'card'}${cardLast4 ? ' ending ' + cardLast4 : ''} on file will be charged automatically.`
          : 'Please call the office to pay by card, or ask us to send you a secure payment link.',
      };
    case 'ach':
      return { feePct: ACH_SURCHARGE_PCT, feeMin: ACH_MIN_FEE, feeLabel: 'Bank transfer fee (1%)',
        label: 'Bank transfer (ACH)',
        instructions: autopayOn
          ? 'No action needed. Your bank account on file will be debited automatically.'
          : 'Please contact the office to set up your bank transfer.' };
    case 'zelle':
      return { feePct: 0, feeMin: 0, feeLabel: null, label: 'Zelle',
        instructions: 'Please send your Zelle payment to carol@mastertechrvrepair.com.' };
    case 'check':
      return { feePct: 0, feeMin: 0, feeLabel: null, label: 'Check',
        instructions: 'Please mail or drop off your check to Master Tech RV, 6590 East 49th Avenue, Commerce City, CO 80022.' };
    case 'cash':
      return { feePct: 0, feeMin: 0, feeLabel: null, label: 'Cash',
        instructions: 'Please drop off your payment at the office during business hours, Monday through Friday 9 to 6.' };
    default:
      return { feePct: 0, feeMin: 0, feeLabel: null, label: 'Not set',
        instructions: 'Please contact the office to arrange payment.' };
  }
}

function buildInvoiceHtml({ firstName, spaceLabel, year, month, rent, surcharge, total, methodLabel, instructions, feeLabel }) {
  const period = `${MONTHS[month - 1]} ${year}`;
  const feeRow = (surcharge > 0 && feeLabel)
    ? `<tr><td style="padding:6px 0;color:#374151;">${feeLabel}</td><td style="padding:6px 0;text-align:right;color:#374151;">${money(surcharge)}</td></tr>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 32px;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:15px;color:#111;margin:0 0 6px;">Hi ${firstName || 'there'},</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 18px;">
      Here is your storage invoice for <strong>${period}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
      <tr><td style="padding:6px 0;color:#374151;">Space</td><td style="padding:6px 0;text-align:right;color:#111;font-weight:bold;">${spaceLabel || ''}</td></tr>
      <tr><td style="padding:6px 0;color:#374151;">Monthly rent</td><td style="padding:6px 0;text-align:right;color:#374151;">${money(rent)}</td></tr>
      ${feeRow}
      <tr><td style="padding:10px 0 0;border-top:2px solid #1e3a5f;color:#111;font-weight:bold;font-size:15px;">Total due</td>
          <td style="padding:10px 0 0;border-top:2px solid #1e3a5f;text-align:right;color:#111;font-weight:bold;font-size:15px;">${money(total)}</td></tr>
    </table>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;margin-top:18px;">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Payment method: ${methodLabel}</p>
      <p style="margin:0;font-size:13.5px;color:#374151;line-height:1.55;">${instructions}</p>
    </div>
    <p style="font-size:13px;color:#374151;line-height:1.6;margin:20px 0 0;">
      Questions about your bill? Just reply to this email or call us at (303) 557-2214.
    </p>
    <p style="font-size:14px;color:#111;margin:18px 0 0;">Thanks,<br/>Carol and Mark</p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">Master Tech RV Repair &amp; Storage<br/>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

async function eligible(dbc, year, month) {
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const { rows } = await dbc.query(
    `SELECT sb.id AS billing_id, sb.monthly_rate, sb.payment_method, sb.autopay_enabled,
            sb.autopay_card_brand, sb.autopay_card_last4,
            sp.label AS space_label,
            c.id AS customer_id, c.first_name, c.email_primary
       FROM storage_billing sb
       LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
       LEFT JOIN customers c ON c.id = sb.customer_id
      WHERE sb.deleted_at IS NULL
        AND (sb.billing_end_date IS NULL OR sb.billing_end_date >= $1::date)
        AND (sb.scheduled_move_out IS NULL OR sb.scheduled_move_out >= $1::date)
        AND COALESCE(sb.monthly_rate, 0) > 0
        AND NOT EXISTS (
          SELECT 1 FROM storage_invoices si
           WHERE si.storage_billing_id = sb.id AND si.year = $2 AND si.month = $3
             AND si.status = 'sent'
        )
        -- Already paid for that month (green on the billing grid, e.g. someone
        -- who prepaid several months by check). Never invoice a paid month.
        AND NOT EXISTS (
          SELECT 1 FROM storage_payment_status ps
           WHERE ps.storage_billing_id = sb.id AND ps.year = $2 AND ps.month = $3
             AND ps.status = 'paid'
        )
      ORDER BY sp.label`,
    [periodStart, year, month]
  );
  return rows;
}

async function runInvoices({ year, month, dryRun = true } = {}) {
  const p = (year && month) ? { year, month } : nextPeriod();
  const dbc = await pool.connect();
  let list;
  try { list = await eligible(dbc, p.year, p.month); }
  finally { dbc.release(); }

  // Report which spaces were held back because that month is already paid.
  const dbc2 = await pool.connect();
  let prepaid = [];
  try {
    const { rows } = await dbc2.query(
      `SELECT sp.label AS space, c.last_name
         FROM storage_payment_status ps
         JOIN storage_billing sb ON sb.id = ps.storage_billing_id
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE ps.year = $1 AND ps.month = $2 AND ps.status = 'paid'
          AND sb.deleted_at IS NULL AND sb.billing_end_date IS NULL`,
      [p.year, p.month]
    );
    prepaid = rows.map(r => `${r.space} (${r.last_name || ''})`.trim());
  } finally { dbc2.release(); }

  const results = [];
  let sent = 0, skipped = 0, failed = 0;

  for (const r of list) {
    const rent = parseFloat(r.monthly_rate);
    const info = methodInfo(r.payment_method, r.autopay_enabled, r.autopay_card_brand, r.autopay_card_last4);
    // Pass through what Square actually charges, including the ACH $1 minimum.
    const surcharge = info.feePct > 0
      ? Math.max(Math.round(rent * info.feePct * 100) / 100, info.feeMin || 0)
      : 0;
    const total = Math.round((rent + surcharge) * 100) / 100;
    const row = {
      billing_id: r.billing_id, space: r.space_label, customer: r.first_name,
      email: r.email_primary || null, method: r.payment_method || 'not set',
      rent, surcharge, total,
    };

    if (!r.email_primary) { row.result = 'no email on file'; skipped++; results.push(row); continue; }
    if (dryRun) { row.result = 'would send'; results.push(row); continue; }

    const html = buildInvoiceHtml({
      firstName: r.first_name, spaceLabel: r.space_label, year: p.year, month: p.month,
      rent, surcharge, total, methodLabel: info.label, instructions: info.instructions,
      feeLabel: info.feeLabel,
    });
    const text = `Hi ${r.first_name || 'there'},\n\nYour storage invoice for ${MONTHS[p.month - 1]} ${p.year}.\n\nSpace: ${r.space_label}\nMonthly rent: ${money(rent)}\n${surcharge > 0 && info.feeLabel ? `${info.feeLabel}: ${money(surcharge)}\n` : ''}Total due: ${money(total)}\n\nPayment method: ${info.label}\n${info.instructions}\n\nQuestions? Reply to this email or call (303) 557-2214.\n\nThanks,\nCarol and Mark\nMaster Tech RV Repair & Storage`;

    try {
      const res = await sendEmail({
        to: r.email_primary,
        subject: `Master Tech RV storage invoice - ${MONTHS[p.month - 1]} ${p.year} - ${r.space_label || ''}`.trim(),
        html, text,
      });
      if (res && res.success) {
        await pool.query(
          `INSERT INTO storage_invoices (storage_billing_id, year, month, rent, surcharge, total, payment_method, status, sent_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'sent',NOW())
           ON CONFLICT (storage_billing_id, year, month)
           DO UPDATE SET rent=EXCLUDED.rent, surcharge=EXCLUDED.surcharge, total=EXCLUDED.total,
                         payment_method=EXCLUDED.payment_method, status='sent', sent_at=NOW()`,
          [r.billing_id, p.year, p.month, rent, surcharge, total, r.payment_method || null]
        );
        row.result = 'sent'; sent++;
      } else {
        row.result = 'send failed: ' + (res?.error || 'unknown'); failed++;
      }
    } catch (e) {
      row.result = 'error: ' + e.message; failed++;
    }
    results.push(row);
  }

  const totals = results.reduce((a, r) => ({ rent: a.rent + r.rent, surcharge: a.surcharge + r.surcharge, total: a.total + r.total }), { rent: 0, surcharge: 0, total: 0 });
  console.log(`[storageInvoice] ${p.year}-${p.month} ${dryRun ? '(dry run) ' : ''}${results.length} invoices, sent ${sent}, skipped ${skipped}, failed ${failed}`);
  return { period: p, dryRun, count: results.length, sent, skipped, failed, totals, results, already_paid_skipped: prepaid };
}

// Disabled by default. Enable by setting STORAGE_INVOICE_CRON=on once the
// owner has reviewed a dry run and is ready for invoices to go out on their own.
function startStorageInvoiceCron() {
  if (String(process.env.STORAGE_INVOICE_CRON || '').toLowerCase() !== 'on') {
    console.log('[storageInvoice] cron NOT enabled (set STORAGE_INVOICE_CRON=on to turn it on)');
    return;
  }
  cron.schedule('0 7 * * *', async () => {
    try { if (isLastDayOfMonth()) await runInvoices({ dryRun: false }); }
    catch (e) { console.error('[storageInvoice] fatal:', e.message); }
  }, { timezone: 'America/Denver' });
  console.log('[storageInvoice] Monthly storage invoice cron scheduled (last day of month, 7 AM Mountain)');
}

module.exports = { startStorageInvoiceCron, runInvoices, buildInvoiceHtml };
