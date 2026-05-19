/**
 * Dialpad inbound SMS webhook — handles STOP/START opt-out commands.
 *
 * Setup:
 *   1. Generate a webhook in Dialpad: POST https://dialpad.com/api/v2/webhooks
 *      with hook_url = https://<your-railway-host>/api/dialpad/webhook
 *   2. Create an SMS event subscription with direction='inbound' targeted
 *      at your Dialpad number, requesting message_content_export scope.
 *   3. Store the webhook secret in DIALPAD_WEBHOOK_SECRET so we can verify
 *      the JWT signature. If unset, we decode without verifying (dev only).
 *
 * Docs:
 *   https://developers.dialpad.com/docs/sms-events
 *   https://developers.dialpad.com/reference/webhookscreate
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.use(express.json({ limit: '1mb' }));
router.use(express.text({ type: ['application/jwt', 'text/plain'], limit: '1mb' }));

function decodeJwt(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (err) {
    console.error('[dialpad-webhook] JWT decode failed:', err.message);
    return null;
  }
}

function verifyJwt(token, secret) {
  if (!secret) return decodeJwt(token);
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, secret, { algorithms: ['HS256', 'HS512'] });
  } catch (err) {
    console.error('[dialpad-webhook] JWT verify failed:', err.message);
    return null;
  }
}

router.post('/webhook', async (req, res) => {
  // Dialpad sends JWT-encoded payloads as raw body, or sometimes wrapped in JSON.
  let payload = null;
  const raw = typeof req.body === 'string' ? req.body : (req.body?.payload || req.body?.token || null);

  if (raw && typeof raw === 'string' && raw.split('.').length >= 3) {
    payload = verifyJwt(raw, process.env.DIALPAD_WEBHOOK_SECRET);
  } else if (req.body && typeof req.body === 'object') {
    // Dev/test fallback: plain JSON body
    payload = req.body;
  }

  if (!payload) {
    console.warn('[dialpad-webhook] could not decode payload');
    return res.status(200).json({ ok: false, reason: 'invalid_payload' });
  }

  // Only react to inbound SMS
  if (payload.direction !== 'inbound') {
    return res.status(200).json({ ok: true, ignored: 'not_inbound' });
  }

  const fromRaw = payload.from_number || '';
  const text = String(payload.text || '').trim().toUpperCase();
  const digits = String(fromRaw).replace(/\D/g, '').slice(-10);

  console.log(`[dialpad-webhook] From=${fromRaw} Body="${payload.text || ''}"`);

  const stopKeywords = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
  const startKeywords = ['START', 'YES', 'UNSTOP'];

  try {
    if (digits) {
      if (stopKeywords.includes(text)) {
        const { rowCount } = await pool.query(
          `UPDATE customers
           SET sms_opt_out = true, sms_opt_out_date = NOW()
           WHERE regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
              OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1`,
          [`%${digits}`]
        );
        console.log(`[dialpad-webhook] opted out ${rowCount} customer(s) matching ${digits}`);
      } else if (startKeywords.includes(text)) {
        const { rowCount } = await pool.query(
          `UPDATE customers
           SET sms_opt_out = false, sms_opt_out_date = NULL
           WHERE regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
              OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1`,
          [`%${digits}`]
        );
        console.log(`[dialpad-webhook] opted in ${rowCount} customer(s) matching ${digits}`);
      }
    }
  } catch (err) {
    console.error('[dialpad-webhook] db error:', err.message);
  }

  res.status(200).json({ ok: true });
});

module.exports = router;
