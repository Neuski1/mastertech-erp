// Resend delivery webhook: bounces and spam complaints.
//
// Why this exists: the campaign sender only flags a customer when Resend
// rejects the send call itself. Real bounces arrive minutes later, after the
// API already said "sent", so campaign 18 (Sept 28, 2026) logged 1,225 sent
// while about 50 bounced and nothing in the ERP noticed.
//
// Setup (Carol, once):
//   Resend dashboard > Webhooks > Add endpoint
//   URL:    https://mastertech-erp-production.up.railway.app/api/resend/webhook
//   Events: email.bounced, email.complained
//   Copy the signing secret (whsec_...) into Railway as RESEND_WEBHOOK_SECRET.
//
// What each event does:
//   email.bounced, Permanent  -> customers.email_invalid = TRUE (campaigns,
//                                one-off emails and storage invoice emails
//                                already skip flagged addresses)
//   email.bounced, Transient  -> logged only (mailbox full, greylisting)
//   email.complained          -> marketing_opt_out = TRUE + email_unsubscribes.
//                                The address works, so invoices still go out.
// Every event lands in email_events, keyed on the svix-id, so a retry from
// Resend is a no-op.
//
// Mounted in app.js BEFORE express.json with express.raw, because the
// signature is computed over the exact bytes Resend sent.

const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');

const router = express.Router();
const TOLERANCE_SECONDS = 5 * 60;

// Svix signing scheme, which Resend uses. Signed content is
// "<svix-id>.<svix-timestamp>.<raw body>", HMAC-SHA256 with the base64
// secret after the whsec_ prefix. The header can carry several
// space-separated "v1,<base64>" signatures during a secret rotation.
function verifySvix(rawBody, headers, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const id = headers['svix-id'];
  const timestamp = headers['svix-timestamp'];
  const sigHeader = headers['svix-signature'];
  if (!id || !timestamp || !sigHeader) return { ok: false, reason: 'missing svix headers' };

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: 'timestamp outside tolerance' };
  }

  const key = Buffer.from(String(secret).replace(/^whsec_/, ''), 'base64');
  const expected = crypto
    .createHmac('sha256', key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest();

  const match = String(sigHeader).split(' ').some(part => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const given = Buffer.from(sig, 'base64');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
  return match ? { ok: true } : { ok: false, reason: 'signature mismatch' };
}

function recipientsOf(data) {
  const to = data && data.to;
  const list = Array.isArray(to) ? to : (to ? [to] : []);
  return list
    .map(a => String(a).trim())
    // "Name <addr@x.com>" -> addr@x.com
    .map(a => (a.match(/<([^>]+)>/) || [null, a])[1].trim().toLowerCase())
    .filter(Boolean);
}

async function logToCustomer(client, customerId, triggerEvent, text) {
  await client.query(
    `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content, delivery_status, is_manual)
     VALUES ($1, 'email', $2, $3, 'failed', false)`,
    [customerId, triggerEvent, text]
  );
}

async function handleEvent(client, event) {
  const type = event.type;
  const data = event.data || {};
  const emails = recipientsOf(data);
  const subject = data.subject || '(no subject)';
  const outcome = [];

  for (const email of emails) {
    if (type === 'email.bounced') {
      const bounceType = (data.bounce && data.bounce.type) || '';
      const message = (data.bounce && data.bounce.message) || '';
      // Only a permanent bounce kills the address. An unknown type is treated
      // as permanent: Resend has already suppressed it, so nothing we send
      // there will arrive until someone clears it.
      if (/transient/i.test(bounceType)) {
        outcome.push({ email, action: 'transient_logged' });
        continue;
      }
      const { rows } = await client.query(
        `UPDATE customers
            SET email_invalid = TRUE,
                email_invalid_date = COALESCE(email_invalid_date, NOW()),
                updated_at = NOW()
          WHERE deleted_at IS NULL AND LOWER(TRIM(email_primary)) = $1
        RETURNING id`,
        [email]
      );
      for (const r of rows) {
        await logToCustomer(client, r.id, 'email_bounce',
          `Email bounced (${bounceType || 'bounce'}): ${email}\nSubject: ${subject}${message ? `\nReason: ${message}` : ''}\nAddress flagged as bad email.`);
      }
      outcome.push({ email, action: rows.length ? 'flagged_invalid' : 'no_customer_match', customer_ids: rows.map(r => r.id) });
    } else if (type === 'email.complained') {
      await client.query(
        `INSERT INTO email_unsubscribes (email, reason) VALUES ($1, 'Spam complaint via Resend')
         ON CONFLICT (email) DO NOTHING`,
        [email]
      );
      const { rows } = await client.query(
        `UPDATE customers
            SET marketing_opt_out = TRUE,
                email_opt_out_date = COALESCE(email_opt_out_date, NOW()),
                updated_at = NOW()
          WHERE deleted_at IS NULL AND LOWER(TRIM(email_primary)) = $1
        RETURNING id`,
        [email]
      );
      for (const r of rows) {
        await logToCustomer(client, r.id, 'email_complaint',
          `Spam complaint: ${email}\nSubject: ${subject}\nOpted out of marketing email. Invoices still send.`);
      }
      outcome.push({ email, action: rows.length ? 'opted_out' : 'unsubscribed_no_customer', customer_ids: rows.map(r => r.id) });
    } else {
      outcome.push({ email, action: 'ignored' });
    }
  }
  return outcome;
}

router.post('/', async (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Resend webhook: RESEND_WEBHOOK_SECRET is not set, refusing event');
    return res.status(503).json({ error: 'webhook not configured' });
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  const check = verifySvix(rawBody, req.headers, secret);
  if (!check.ok) {
    console.warn('Resend webhook rejected:', check.reason);
    return res.status(401).json({ error: 'invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'invalid JSON' });
  }

  const svixId = req.headers['svix-id'];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO email_events (svix_id, event_type, email_id, recipients, subject, bounce_type, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (svix_id) DO NOTHING
       RETURNING id`,
      [
        svixId,
        event.type || 'unknown',
        event.data && event.data.email_id,
        recipientsOf(event.data).join(','),
        event.data && event.data.subject,
        event.data && event.data.bounce && event.data.bounce.type,
        event,
      ]
    );
    if (ins.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ ok: true, duplicate: true });
    }
    const outcome = await handleEvent(client, event);
    await client.query('UPDATE email_events SET outcome = $2 WHERE id = $1', [ins.rows[0].id, JSON.stringify(outcome)]);
    await client.query('COMMIT');
    console.log('Resend webhook:', event.type, JSON.stringify(outcome));
    return res.json({ ok: true, outcome });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Resend webhook error:', err.message);
    // 500 so Resend retries; the svix-id guard makes the retry safe.
    return res.status(500).json({ error: 'processing failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
module.exports.verifySvix = verifySvix;
module.exports.recipientsOf = recipientsOf;
