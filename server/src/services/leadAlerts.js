/**
 * Lead alerts — what replaces the formsubmit.co relay.
 *
 * Two sends on every accepted lead, both best effort. Neither can fail the
 * lead: the row is already committed before any of this runs, and every path
 * here swallows its own errors and logs them.
 *
 *   1. SMS to the shop (Carol and Mark), with a tap-to-call number and a link
 *      straight to that lead in the ERP so a reply is two taps away.
 *   2. Email to the shop with Reply-To set to the CUSTOMER, so hitting reply
 *      in Gmail writes to them rather than to service@.
 *
 * The customer autoresponder lives here too and is sent separately, so the
 * shop alert still goes out if the customer's address bounces.
 */

const pool = require('../db/pool');
const { sendEmail } = require('./email');
const { sendSMS } = require('./sms');

const SHOP_PHONE = '(303) 557-2214';
const SHOP_ADDRESS = '6590 E 49th Ave, Commerce City, CO 80022';
const SHOP_HOURS = 'Monday through Friday, 9 to 6';

function appBase() {
  return (process.env.APP_BASE_URL || 'https://mastertech-erp.vercel.app').replace(/\/$/, '');
}

// Shop recipients. SHOP_SMS_NUMBERS is a comma separated list; anything
// unparseable is skipped rather than throwing.
function shopNumbers() {
  return String(process.env.SHOP_SMS_NUMBERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function shopEmail() {
  return process.env.SHOP_ALERT_EMAIL || 'service@mastertechrvrepair.com';
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const firstName = (full) => String(full || '').trim().split(/\s+/)[0] || 'there';

// The website packs the RV and services into the message as
// "RV: 2024 Nash 17k | Length: 20 ft | Services: ... | Issue: ...".
// Pull the pieces back out for a readable alert.
function leadParts(message) {
  const field = (label) => {
    const m = String(message || '').match(new RegExp(label + '\\s*:\\s*([^|]*)(?:\\||$)', 'i'));
    return m ? m[1].trim() : '';
  };
  return {
    rv: field('RV'),
    length: field('Length'),
    services: field('Services'),
    issue: field('Issue') || field('Notes'),
  };
}

// ---------------------------------------------------------------------------
// Shop SMS. Kept short on purpose: this is read one-handed, standing next to
// an RV. Name and number first, link last so it is the easiest thing to tap.
// ---------------------------------------------------------------------------
function buildShopSms(lead, { photoCount = 0 } = {}) {
  const p = leadParts(lead.message);
  const isWaitList = /wait[\s-]?list|storage/i.test(lead.source || '') ||
                     /storage|wait list/i.test(lead.message || '');

  const lines = [];
  lines.push(isWaitList ? 'STORAGE WAIT LIST' : 'NEW LEAD');
  lines.push(`${lead.name || 'No name'} ${lead.phone || ''}`.trim());
  if (p.rv) lines.push(p.rv + (p.length ? `, ${p.length}` : ''));
  if (p.services) lines.push(p.services);
  if (p.issue) lines.push(p.issue.length > 90 ? p.issue.slice(0, 87) + '...' : p.issue);
  if (photoCount) lines.push(`${photoCount} photo${photoCount === 1 ? '' : 's'}`);
  lines.push(`${appBase()}/leads/${lead.id}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Shop email. Reply-To is the customer, so Reply in Gmail writes to them.
// ---------------------------------------------------------------------------
function buildShopEmail(lead, { photoCount = 0 } = {}) {
  const p = leadParts(lead.message);
  const link = `${appBase()}/leads/${lead.id}`;
  const row = (label, value) => value
    ? `<tr><td style="padding:4px 12px 4px 0;color:#667;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:4px 0;">${esc(value)}</td></tr>`
    : '';

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;color:#111;max-width:600px;">
      <p style="margin:0 0 4px;font-size:13px;letter-spacing:.06em;color:#667;">NEW WEBSITE LEAD</p>
      <h2 style="margin:0 0 16px;font-size:22px;">${esc(lead.name || 'No name given')}</h2>
      <table style="border-collapse:collapse;font-size:15px;margin-bottom:20px;">
        ${row('Phone', lead.phone)}
        ${row('Email', lead.email)}
        ${row('RV', [p.rv, p.length].filter(Boolean).join(', '))}
        ${row('Services', p.services)}
        ${row('Source', lead.source)}
        ${row('Photos', photoCount ? String(photoCount) : '')}
      </table>
      ${p.issue ? `<p style="margin:0 0 20px;padding:12px 14px;background:#f5f6f8;border-radius:6px;white-space:pre-wrap;">${esc(p.issue)}</p>` : ''}
      <p style="margin:0 0 20px;">
        <a href="${link}" style="background:#12355b;color:#fff;text-decoration:none;padding:11px 20px;border-radius:6px;display:inline-block;">Open this lead</a>
      </p>
      <p style="margin:0;color:#667;font-size:13px;">Reply to this email and it goes to ${esc(lead.name || 'the customer')}, not to the shop inbox.</p>
    </div>`;

  const text = [
    'NEW WEBSITE LEAD',
    lead.name || 'No name given',
    lead.phone ? `Phone: ${lead.phone}` : '',
    lead.email ? `Email: ${lead.email}` : '',
    p.rv ? `RV: ${[p.rv, p.length].filter(Boolean).join(', ')}` : '',
    p.services ? `Services: ${p.services}` : '',
    photoCount ? `Photos: ${photoCount}` : '',
    '',
    p.issue || '',
    '',
    link,
  ].filter((l) => l !== undefined).join('\n');

  return { subject: `New lead: ${lead.name || 'website form'}`, html, text };
}

// ---------------------------------------------------------------------------
// Customer autoresponder. Promises a call within one business day, which is
// the only promise the shop makes here, so keep it that way.
// ---------------------------------------------------------------------------
function buildCustomerEmail(lead) {
  const p = leadParts(lead.message);
  const name = firstName(lead.name);
  const summary = [p.rv && `RV: ${p.rv}${p.length ? `, ${p.length}` : ''}`, p.services && `Services: ${p.services}`]
    .filter(Boolean).join('<br>');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;color:#111;max-width:600px;line-height:1.5;">
      <p style="margin:0 0 16px;">Thanks for reaching out to Master Tech RV Repair &amp; Storage. We have your request and someone will call you within one business day.</p>
      ${summary ? `<p style="margin:0 0 16px;padding:12px 14px;background:#f5f6f8;border-radius:6px;">${summary}</p>` : ''}
      <p style="margin:0 0 16px;">If it is urgent, call the shop at ${SHOP_PHONE}, ${SHOP_HOURS}.</p>
      <p style="margin:0;color:#444;">Master Tech RV Repair &amp; Storage<br>${SHOP_ADDRESS}<br>${SHOP_PHONE}</p>
    </div>`;

  const text = `Thanks for reaching out to Master Tech RV Repair & Storage. We have your request and someone will call you within one business day.

${[p.rv && `RV: ${p.rv}${p.length ? `, ${p.length}` : ''}`, p.services && `Services: ${p.services}`].filter(Boolean).join('\n')}

If it is urgent, call the shop at ${SHOP_PHONE}, ${SHOP_HOURS}.

Master Tech RV Repair & Storage
${SHOP_ADDRESS}
${SHOP_PHONE}`;

  return { subject: `We got your request, ${name}`, html, text };
}

// ---------------------------------------------------------------------------
// sendLeadAlerts — fire and forget. Never throws. Returns what happened so the
// intake log can record it, and so a dry run can inspect it without sending.
// ---------------------------------------------------------------------------
async function sendLeadAlerts(lead, { photoCount = 0, dryRun = false } = {}) {
  const shopSms = buildShopSms(lead, { photoCount });
  const shopMail = buildShopEmail(lead, { photoCount });
  const custMail = buildCustomerEmail(lead);
  const numbers = shopNumbers();

  const out = {
    dryRun,
    shop_sms: { to: numbers, body: shopSms, results: [] },
    shop_email: { to: shopEmail(), replyTo: lead.email || null, subject: shopMail.subject, html: shopMail.html, result: null },
    customer_email: { to: lead.email || null, subject: custMail.subject, html: custMail.html, result: null },
  };

  if (dryRun) return out;

  // 1. Shop SMS. sendSMS already normalizes, checks opt-out and logs.
  for (const n of numbers) {
    try {
      const r = await sendSMS(n, shopSms);
      out.shop_sms.results.push({ to: n, ...r });
    } catch (err) {
      console.error('[leadAlerts] shop sms failed:', n, err.message);
      out.shop_sms.results.push({ to: n, success: false, error: err.message });
    }
  }
  if (!numbers.length) console.warn('[leadAlerts] SHOP_SMS_NUMBERS is not set, no shop text sent');

  // 2. Shop email, reply-to the customer.
  try {
    out.shop_email.result = await sendEmail({
      to: shopEmail(), subject: shopMail.subject, html: shopMail.html,
      text: shopMail.text, replyTo: lead.email || undefined,
    });
  } catch (err) {
    console.error('[leadAlerts] shop email failed:', err.message);
    out.shop_email.result = { success: false, error: err.message };
  }

  // 3. Customer autoresponder, separately so a bad address cannot take the
  // shop alert down with it.
  //
  // Gated ON PURPOSE. Shop alerts go to Carol and Mark and are safe to run
  // immediately, but this one lands in a customer's inbox, and the standing
  // rule is that nothing customer-facing sends for the first time until Carol
  // has seen the dry run. Set LEAD_AUTORESPONDER_ENABLED=true to turn it on.
  if (process.env.LEAD_AUTORESPONDER_ENABLED !== 'true') {
    out.customer_email.result = { success: false, skipped: 'autoresponder not enabled yet' };
    console.log('[leadAlerts] customer autoresponder is gated off (LEAD_AUTORESPONDER_ENABLED)');
  } else if (lead.email) {
    try {
      out.customer_email.result = await sendEmail({
        to: lead.email, subject: custMail.subject, html: custMail.html, text: custMail.text,
      });
    } catch (err) {
      console.error('[leadAlerts] customer email failed:', err.message);
      out.customer_email.result = { success: false, error: err.message };
    }
  }

  // Record the touch on the customer so the history is complete.
  if (lead.customer_id && out.customer_email.result && !out.customer_email.result.skipped) {
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content, sent_at, delivery_status, is_manual)
         VALUES ($1, 'email', 'lead_autoresponse', $2, NOW(), $3, false)`,
        [lead.customer_id, custMail.subject, out.customer_email.result?.success ? 'sent' : 'failed']
      );
    } catch (err) {
      console.error('[leadAlerts] communication_log insert failed:', err.message);
    }
  }

  return out;
}

module.exports = {
  sendLeadAlerts, buildShopSms, buildShopEmail, buildCustomerEmail, leadParts,
};
