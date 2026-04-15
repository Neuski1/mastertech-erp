const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Twilio sends inbound SMS as application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: false }));

// POST /api/twilio/webhook — inbound SMS handler (STOP/START/HELP)
router.post('/webhook', async (req, res) => {
  const fromRaw = req.body.From || '';
  const bodyText = (req.body.Body || '').trim().toUpperCase();
  const digits = String(fromRaw).replace(/\D/g, '').slice(-10);

  console.log(`[twilio-webhook] From=${fromRaw} Body="${req.body.Body || ''}"`);

  const stopKeywords = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
  const startKeywords = ['START', 'YES', 'UNSTOP'];

  try {
    if (digits) {
      if (stopKeywords.includes(bodyText)) {
        const { rowCount } = await pool.query(
          `UPDATE customers
           SET sms_opt_out = true, sms_opt_out_date = NOW()
           WHERE regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
              OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1`,
          [`%${digits}`]
        );
        console.log(`[twilio-webhook] opted out ${rowCount} customer(s) matching ${digits}`);
      } else if (startKeywords.includes(bodyText)) {
        const { rowCount } = await pool.query(
          `UPDATE customers
           SET sms_opt_out = false, sms_opt_out_date = NULL
           WHERE regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
              OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1`,
          [`%${digits}`]
        );
        console.log(`[twilio-webhook] opted in ${rowCount} customer(s) matching ${digits}`);
      }
    }
  } catch (err) {
    console.error('[twilio-webhook] db error:', err.message);
  }

  // Twilio auto-handles STOP/START responses when enabled on the number.
  // Return empty TwiML so we don't double-send.
  res.set('Content-Type', 'text/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
});

module.exports = router;
