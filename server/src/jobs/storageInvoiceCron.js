// Monthly storage invoice engine, formatted to match the Square invoices
// customers are used to receiving. Bills on the last day of the month for the
// coming month. One invoice per CUSTOMER (a customer renting two spaces gets a
// single invoice with a line per space, the way Square did it).
//
// Fee handling: credit card adds 3.5%, ACH adds 1% (Square's $1 minimum),
// Zelle / check / cash add nothing. A month already marked paid on the billing
// grid is never invoiced.
const cron = require('node-cron');
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');
const crypto = require('crypto');
const square = require('../services/square');

const publicBase = () => process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
const logoUrl = () => `${publicBase()}/logo-mark.png`;

// One-time Square checkout link so a card customer can pay this invoice without
// enrolling in autopay. Returns null if Square is not configured.
async function createPayLink({ invoiceNumber, customerName, totalCents }) {
  try {
    if (!square.locationId) return null;
    const resp = await square.client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: `RV Storage — Invoice ${invoiceNumber}`,
        priceMoney: { amount: BigInt(totalCents), currency: 'USD' },
        locationId: square.locationId,
      },
      checkoutOptions: { askForShippingAddress: false },
    });
    const d = resp?.data || resp?.result || resp || {};
    const link = d.paymentLink || d.payment_link || {};
    return link.url || link.longUrl || link.long_url || null;
  } catch (e) {
    console.error('[storageInvoice] pay link failed:', e.message);
    return null;
  }
}

// Make sure the space has an autopay setup token and return its public URL.
async function autopayUrlFor(billingId) {
  const { rows } = await pool.query('SELECT autopay_setup_token FROM storage_billing WHERE id = $1', [billingId]);
  let token = rows.length ? rows[0].autopay_setup_token : null;
  if (!token) {
    const upd = await pool.query(
      'UPDATE storage_billing SET autopay_setup_token = gen_random_uuid() WHERE id = $1 RETURNING autopay_setup_token',
      [billingId]
    );
    token = upd.rows[0].autopay_setup_token;
  }
  return `${publicBase()}/storage-autopay/${token}`;
}

const CARD_SURCHARGE_PCT = 0.035;
const ACH_SURCHARGE_PCT = 0.01;
const ACH_MIN_FEE = 1.00;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function isLastDayOfMonth(d = new Date()) {
  const t = new Date(d); t.setDate(t.getDate() + 1); return t.getDate() === 1;
}
function nextPeriod(d = new Date()) {
  let y = d.getFullYear(); let m = d.getMonth() + 2;
  if (m > 12) { m -= 12; y += 1; }
  return { year: y, month: m };
}
// Storage bills in advance: the invoice for service month M is due the last day
// of month M-1.
function dueDateFor(year, month) {
  const d = new Date(year, month - 1, 1); // first of the service month
  d.setDate(0);                           // back up to last day of prior month
  return d;
}
const longDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

function feeConfig(method, autopayOn) {
  switch (method) {
    case 'credit_card':
      return { pct: CARD_SURCHARGE_PCT, min: 0,
               label: autopayOn ? 'Autopay Convenience Fee' : 'Credit Card Convenience Fee' };
    case 'ach':
      return { pct: ACH_SURCHARGE_PCT, min: ACH_MIN_FEE, label: 'Bank Transfer Fee' };
    default:
      return { pct: 0, min: 0, label: null };
  }
}

function payInstructions(method, autopayOn, brand, last4) {
  switch (method) {
    case 'credit_card':
      return autopayOn
        ? `No action needed. Your ${brand || 'card'}${last4 ? ' ending ' + last4 : ''} on file will be charged automatically on the due date.`
        : 'Use one of the buttons above to set up automatic monthly payment or to pay this invoice now. Prefer to pay by phone? Call us at (303) 557-2214.';
    case 'ach':
      return autopayOn
        ? 'No action needed. Your bank account on file will be debited automatically on the due date.'
        : 'Please contact the office to set up your bank transfer.';
    case 'zelle':  return 'Please send your Zelle payment to carol@mastertechrvrepair.com.';
    case 'check':  return 'Please mail or drop off your check to Master Tech RV Repair and Storage, 6590 E. 49th Ave., Commerce City, CO 80022.';
    case 'cash':   return 'Please drop off your payment at the office, Monday through Friday, 9 to 6.';
    default:       return 'Please contact the office at (303) 557-2214 to arrange payment.';
  }
}
const methodLabel = (m) => ({ credit_card:'Credit card', ach:'Bank transfer (ACH)', zelle:'Zelle', check:'Check', cash:'Cash' }[m] || 'Not set');

function buildInvoiceHtml(inv) {
  const rows = inv.items.map(it => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #eee;color:#111;">${it.name}${it.sub ? `<div style="color:#6b7280;font-size:11.5px;margin-top:2px;">${it.sub}</div>` : ''}</td>
        <td style="padding:9px 0;border-bottom:1px solid #eee;text-align:center;color:#374151;">1</td>
        <td style="padding:9px 0;border-bottom:1px solid #eee;text-align:right;color:#374151;">${money(it.amount)}</td>
        <td style="padding:9px 0;border-bottom:1px solid #eee;text-align:right;color:#111;">${money(it.amount)}</td>
      </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:640px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 32px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;">
          <table style="border-collapse:collapse;"><tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img src="${logoUrl()}" alt="Master Tech RV" style="height:54px;width:auto;display:block;" />
            </td>
            <td style="vertical-align:middle;">
              <span style="color:#5FD584;font-size:17px;font-weight:bold;letter-spacing:.02em;">MASTER TECH RV<br/>REPAIR AND STORAGE</span>
            </td>
          </tr></table>
        </td>
        <td style="text-align:right;color:#cbd5e1;font-size:12px;vertical-align:middle;">Invoice ${inv.number}</td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:6px;">
      <tr>
        <td style="color:#e2e8f0;font-size:11px;vertical-align:top;">6590 E. 49th Ave., Commerce City, CO 80022<br/><span style="color:#ffffff;">service@mastertechrvrepair.com</span> | (303) 557-2214</td>
        <td style="text-align:right;color:#cbd5e1;font-size:11px;vertical-align:top;">Issue date<br/><span style="color:#fff;">${inv.issueDate}</span></td>
      </tr>
    </table>
  </div>

  <div style="padding:24px 32px 8px;">
    <h2 style="margin:0;font-size:16px;color:#1e3a5f;">${inv.title}</h2>
    ${inv.subtitle ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${inv.subtitle}</p>` : ''}
  </div>

  <div style="padding:12px 32px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <tr>
        <td style="vertical-align:top;padding-right:12px;">
          <div style="color:#6b7280;text-transform:uppercase;font-size:10px;letter-spacing:.05em;margin-bottom:3px;">Customer</div>
          <div style="color:#111;font-weight:bold;">${inv.customerName}</div>
          <div style="color:#374151;">${inv.customerEmail || ''}</div>
          ${inv.customerPhone ? `<div style="color:#374151;">${inv.customerPhone}</div>` : ''}
        </td>
        <td style="vertical-align:top;padding-right:12px;">
          <div style="color:#6b7280;text-transform:uppercase;font-size:10px;letter-spacing:.05em;margin-bottom:3px;">Invoice Details</div>
          <div style="color:#374151;">PDF created ${inv.createdDate}</div>
          <div style="color:#111;font-weight:bold;">${money(inv.total)}</div>
          <div style="color:#374151;">Storage for ${inv.storageMonth}</div>
        </td>
        <td style="vertical-align:top;">
          <div style="color:#6b7280;text-transform:uppercase;font-size:10px;letter-spacing:.05em;margin-bottom:3px;">Payment</div>
          <div style="color:#374151;">Due ${inv.dueDate}</div>
          <div style="color:#111;font-weight:bold;">${money(inv.total)}</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding:18px 32px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 0;border-bottom:2px solid #1e3a5f;color:#1e3a5f;font-size:11px;text-transform:uppercase;letter-spacing:.04em;">Items</th>
          <th style="text-align:center;padding:6px 0;border-bottom:2px solid #1e3a5f;color:#1e3a5f;font-size:11px;text-transform:uppercase;width:60px;">Qty</th>
          <th style="text-align:right;padding:6px 0;border-bottom:2px solid #1e3a5f;color:#1e3a5f;font-size:11px;text-transform:uppercase;width:80px;">Price</th>
          <th style="text-align:right;padding:6px 0;border-bottom:2px solid #1e3a5f;color:#1e3a5f;font-size:11px;text-transform:uppercase;width:90px;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}
        <tr>
          <td colspan="2"></td>
          <td style="padding:9px 0;text-align:right;color:#374151;">Subtotal</td>
          <td style="padding:9px 0;text-align:right;color:#374151;">${money(inv.total)}</td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td style="padding:9px 0;text-align:right;color:#111;font-weight:bold;font-size:14px;border-top:2px solid #1e3a5f;">Total Due</td>
          <td style="padding:9px 0;text-align:right;color:#111;font-weight:bold;font-size:14px;border-top:2px solid #1e3a5f;">${money(inv.total)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${(inv.payUrl || inv.autopayUrl) ? `
  <div style="padding:20px 32px 0;">
    <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:8px;padding:18px 20px;text-align:center;">
      <p style="margin:0 0 14px;font-size:13.5px;color:#1e3a5f;font-weight:bold;">Choose how you would like to pay</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          ${inv.autopayUrl ? `<td style="text-align:center;padding:4px 6px;">
            <a href="${inv.autopayUrl}" style="display:inline-block;padding:13px 20px;background:#1e3a5f;color:#fff;font-size:13.5px;font-weight:bold;text-decoration:none;border-radius:6px;">Set Up Automatic Payment</a>
            <div style="font-size:11px;color:#475569;margin-top:6px;">Save your card once. Billed automatically each month.</div>
          </td>` : ''}
          ${inv.payUrl ? `<td style="text-align:center;padding:4px 6px;">
            <a href="${inv.payUrl}" style="display:inline-block;padding:13px 20px;background:#fff;color:#1e3a5f;border:2px solid #1e3a5f;font-size:13.5px;font-weight:bold;text-decoration:none;border-radius:6px;">Pay This Invoice</a>
            <div style="font-size:11px;color:#475569;margin-top:6px;">One-time payment for this month only.</div>
          </td>` : ''}
        </tr>
      </table>
    </div>
  </div>` : ''}

  <div style="padding:18px 32px 0;">
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;">
      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Payment method: ${inv.methodLabel}</div>
      <div style="font-size:13px;color:#374151;line-height:1.55;">${inv.instructions}</div>
    </div>
    <p style="font-size:11.5px;color:#6b7280;margin:12px 0 0;">Recurring monthly on the last day of the month.</p>
  </div>

  ${inv.achNote ? `
  <div style="padding:18px 32px 0;">
    <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:6px;padding:13px 16px;">
      <p style="margin:0;font-size:12.5px;color:#065f46;line-height:1.6;">
        <strong>Don't want to pay the credit card convenience fee?</strong> We offer other payment options
        such as Zelle, check and ACH bank transfer. Just reply to this email or call us at (303) 557-2214
        and we will switch you over.
      </p>
    </div>
  </div>` : ''}

  <div style="padding:20px 32px 4px;">
    <div style="border:1px solid #fed7aa;background:#fff7ed;border-radius:6px;padding:14px 16px;">
      <p style="margin:0 0 8px;font-size:11px;color:#c2410c;text-transform:uppercase;letter-spacing:.05em;font-weight:bold;">Pickup &amp; Drop-Off Hours</p>
      <p style="margin:0 0 6px;font-size:12.5px;color:#111;font-weight:bold;">Monday through Friday, 9:00 AM to 6:00 PM. Closed Saturday, Sunday and major holidays.</p>
      <ul style="margin:6px 0 0;padding-left:18px;color:#374151;font-size:12px;line-height:1.65;">
        <li>Give us at least <strong>2 hours notice</strong> by call or text to have your unit pulled out.</li>
        <li>Drop off at least <strong>30 minutes before we close</strong> so we have time to put it away.</li>
        <li>Dropping off on <strong>Sunday</strong>? Let us know, park in front of the building and drop the keys in the mail slot. We will move it inside Monday morning.</li>
      </ul>
    </div>
  </div>

  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">Master Tech RV Repair and Storage<br/>6590 E. 49th Ave., Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

async function eligibleRows(dbc, year, month, billingIds = null) {
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const { rows } = await dbc.query(
    `SELECT sb.id AS billing_id, sb.monthly_rate, sb.payment_method, sb.autopay_enabled,
            sb.autopay_card_brand, sb.autopay_card_last4,
            sp.label AS space_label, sp.space_type,
            u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
            c.id AS customer_id, c.first_name, c.last_name, c.email_primary, c.phone_primary
       FROM storage_billing sb
       LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
       LEFT JOIN units u ON u.id = sb.unit_id
       LEFT JOIN customers c ON c.id = sb.customer_id
      WHERE sb.deleted_at IS NULL
        AND (sb.billing_end_date IS NULL OR sb.billing_end_date >= $1::date)
        AND (sb.scheduled_move_out IS NULL OR sb.scheduled_move_out >= $1::date)
        AND COALESCE(sb.monthly_rate, 0) > 0
        AND NOT EXISTS (
          SELECT 1 FROM storage_invoices si
           WHERE si.storage_billing_id = sb.id AND si.year = $2 AND si.month = $3 AND si.status = 'sent')
        AND NOT EXISTS (
          SELECT 1 FROM storage_payment_status ps
           WHERE ps.storage_billing_id = sb.id AND ps.year = $2 AND ps.month = $3 AND ps.status = 'paid')
        ${billingIds && billingIds.length ? 'AND sb.id = ANY($4::int[])' : ''}
      ORDER BY c.id, sp.label`,
    billingIds && billingIds.length ? [periodStart, year, month, billingIds] : [periodStart, year, month]
  );
  return rows;
}

async function runInvoices({ year, month, dryRun = true, billingIds = null } = {}) {
  const p = (year && month) ? { year, month } : nextPeriod();
  const dbc = await pool.connect();
  let rows, prepaid = [];
  try {
    rows = await eligibleRows(dbc, p.year, p.month, billingIds);
    const { rows: pp } = await dbc.query(
      `SELECT sp.label AS space, c.last_name
         FROM storage_payment_status ps
         JOIN storage_billing sb ON sb.id = ps.storage_billing_id
         LEFT JOIN storage_spaces sp ON sp.id = sb.space_id
         LEFT JOIN customers c ON c.id = sb.customer_id
        WHERE ps.year = $1 AND ps.month = $2 AND ps.status = 'paid'
          AND sb.deleted_at IS NULL AND sb.billing_end_date IS NULL`,
      [p.year, p.month]
    );
    prepaid = pp.map(r => `${r.space} (${r.last_name || ''})`.trim());
  } finally { dbc.release(); }

  // One invoice per customer.
  const byCustomer = new Map();
  for (const r of rows) {
    if (!byCustomer.has(r.customer_id)) byCustomer.set(r.customer_id, []);
    byCustomer.get(r.customer_id).push(r);
  }

  const due = dueDateFor(p.year, p.month);
  const results = [];
  let sent = 0, skipped = 0, failed = 0;

  for (const [customerId, spaces] of byCustomer) {
    const first = spaces[0];
    const items = [];
    let total = 0;

    for (const s of spaces) {
      const rent = parseFloat(s.monthly_rate);
      const rv = [s.unit_year, s.unit_make, s.unit_model].filter(Boolean).join(' ');
      const typeName = (s.space_type === 'indoor' ? 'Indoor' : 'Outdoor') + ' RV Storage';
      items.push({ name: typeName, sub: rv || null, amount: rent });
      total += rent;
    }
    // Fee is driven by how this customer pays; charge it on the rent total.
    const cfg = feeConfig(first.payment_method, first.autopay_enabled);
    const fee = cfg.pct > 0 ? Math.max(Math.round(total * cfg.pct * 100) / 100, cfg.min || 0) : 0;
    if (fee > 0) {
      items.push({ name: cfg.label, sub: cfg.pct === CARD_SURCHARGE_PCT ? '3.5% of storage total' : '1% of storage total', amount: fee });
      total += fee;
    }
    total = Math.round(total * 100) / 100;

    const rvList = spaces.map(s => [s.unit_year, s.unit_make, s.unit_model].filter(Boolean).join(' ')).filter(Boolean);
    const allIndoor = spaces.every(s => s.space_type === 'indoor');
    const allOutdoor = spaces.every(s => s.space_type === 'outdoor');
    const inv = {
      number: `S${p.year}${String(p.month).padStart(2, '0')}-${customerId}`,
      title: (allIndoor ? 'Indoor RV Storage Invoice' : allOutdoor ? 'Outdoor RV Storage Invoice' : 'RV Storage Invoice'),
      subtitle: rvList.join(' and '),
      customerName: [first.first_name, first.last_name].filter(Boolean).join(' '),
      customerEmail: first.email_primary,
      customerPhone: first.phone_primary || null,
      createdDate: longDate(new Date()),
      issueDate: longDate(due),
      storageMonth: `${MONTHS[p.month - 1]} ${p.year}`,
      dueDate: longDate(due),
      items, total,
      methodLabel: methodLabel(first.payment_method),
      instructions: payInstructions(first.payment_method, first.autopay_enabled, first.autopay_card_brand, first.autopay_card_last4),
    };

    // Card customer with no card on file: give them both options right on the
    // invoice - enroll in autopay, or pay this one invoice.
    const needsAction = first.payment_method === 'credit_card' && !first.autopay_enabled;
    if (needsAction && !dryRun) {
      inv.autopayUrl = await autopayUrlFor(first.billing_id);
      inv.payUrl = await createPayLink({
        invoiceNumber: inv.number,
        customerName: inv.customerName,
        totalCents: Math.round(total * 100),
      });
    }

    // Offer ACH to card payers, showing what they would actually save.
    if (first.payment_method === 'credit_card' && fee > 0) {
      const rentOnly = Math.round((total - fee) * 100) / 100;
      const achFee = Math.max(Math.round(rentOnly * ACH_SURCHARGE_PCT * 100) / 100, ACH_MIN_FEE);
      const saving = Math.round((fee - achFee) * 100) / 100;
      inv.achNote = true;
      inv.achSavings = saving > 0 ? saving : null;
    }

    const row = { customer_id: customerId, customer: inv.customerName, email: first.email_primary || null,
                  spaces: spaces.map(s => s.space_label), method: first.payment_method || 'not set',
                  rent: Math.round((total - fee) * 100) / 100, fee, total, invoice: inv.number,
                  needs_action: needsAction };

    if (!first.email_primary) { row.result = 'no email on file'; skipped++; results.push(row); continue; }
    if (dryRun) { row.result = 'would send'; results.push(row); continue; }

    const html = buildInvoiceHtml(inv);
    const text = `${inv.title}\nInvoice ${inv.number}\n\n${inv.customerName}\nDue ${inv.dueDate}\n\n`
      + items.map(i => `${i.name}: ${money(i.amount)}`).join('\n')
      + `\n\nTotal Due: ${money(total)}\n\nPayment method: ${inv.methodLabel}\n${inv.instructions}`
      + (inv.achNote ? `\n\nDon't want to pay the credit card convenience fee? We offer other payment options such as Zelle, check and ACH bank transfer. Reply to this email or call (303) 557-2214 and we will switch you over.` : '')
      + `\n\nPICKUP & DROP-OFF HOURS\nMonday through Friday, 9:00 AM to 6:00 PM. Closed Saturday, Sunday and major holidays.\n`
      + `Give us at least 2 hours notice to have your unit pulled out. Drop off at least 30 minutes before close.\n`
      + `\nMaster Tech RV Repair and Storage | 6590 E. 49th Ave., Commerce City, CO 80022 | (303) 557-2214`;

    try {
      const res = await sendEmail({
        to: first.email_primary,
        subject: `Master Tech RV storage invoice — ${MONTHS[p.month - 1]} ${p.year}`,
        html, text,
      });
      if (res && res.success) {
        for (const s of spaces) {
          const share = parseFloat(s.monthly_rate);
          await pool.query(
            `INSERT INTO storage_invoices (storage_billing_id, year, month, rent, surcharge, total, payment_method, status, sent_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'sent',NOW())
             ON CONFLICT (storage_billing_id, year, month)
             DO UPDATE SET rent=EXCLUDED.rent, surcharge=EXCLUDED.surcharge, total=EXCLUDED.total,
                           payment_method=EXCLUDED.payment_method, status='sent', sent_at=NOW()`,
            [s.billing_id, p.year, p.month, share, spaces.length === 1 ? fee : 0, spaces.length === 1 ? total : share, s.payment_method || null]
          );
        }
        row.result = 'sent'; sent++;
      } else { row.result = 'send failed: ' + (res?.error || 'unknown'); failed++; }
    } catch (e) { row.result = 'error: ' + e.message; failed++; }
    results.push(row);
  }

  const totals = results.reduce((a, r) => ({ rent: a.rent + r.rent, fee: a.fee + r.fee, total: a.total + r.total }), { rent: 0, fee: 0, total: 0 });
  console.log(`[storageInvoice] ${p.year}-${p.month} ${dryRun ? '(dry run) ' : ''}${results.length} invoices, sent ${sent}, skipped ${skipped}, failed ${failed}`);
  return { period: p, dryRun, due_date: longDate(due), count: results.length, sent, skipped, failed, totals, results, already_paid_skipped: prepaid };
}

async function runRetriesNoop() { return {}; }

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
