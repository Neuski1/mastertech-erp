const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { client: squareClient } = require('../services/square');

// ---------------------------------------------------------------------------
// Square Webhook Setup:
// 1. Go to developer.squareup.com → Your app → Webhooks → Add endpoint
// 2. URL: https://yourdomain.com/api/square/webhook
//    (for local testing: ngrok http 3001)
// 3. Subscribe to: terminal.checkout.updated
// 4. Copy signature key → SQUARE_WEBHOOK_SIGNATURE_KEY in .env
// ---------------------------------------------------------------------------

// Verify Square webhook signature
function verifySignature(body, signature, signatureKey, notificationUrl) {
  if (!signatureKey) return true; // Skip verification if no key configured
  const hmac = crypto.createHmac('sha256', signatureKey);
  hmac.update(notificationUrl + body);
  const expected = hmac.digest('base64');
  return signature === expected;
}

// Helper: auto-transition status
async function autoTransitionStatus(recordId, dbClient) {
  const { rows } = await dbClient.query(
    'SELECT status, amount_due, total_collected FROM records WHERE id = $1',
    [recordId]
  );
  if (rows.length === 0) return;
  const rec = rows[0];
  const amountDue = parseFloat(rec.amount_due);
  const totalCollected = parseFloat(rec.total_collected);
  if (!['complete', 'payment_pending', 'partial'].includes(rec.status)) return;
  if (amountDue <= 0 && totalCollected > 0) {
    await dbClient.query("UPDATE records SET status = 'paid' WHERE id = $1", [recordId]);
  } else if (totalCollected > 0 && amountDue > 0 && ['complete', 'payment_pending'].includes(rec.status)) {
    await dbClient.query("UPDATE records SET status = 'partial' WHERE id = $1", [recordId]);
  }
}

// ---------------------------------------------------------------------------
// POST /api/square/webhook — Handle Square webhook events
// No auth middleware — Square calls this directly
// ---------------------------------------------------------------------------
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  // Always respond 200 quickly to avoid Square retries
  const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
  const signature = req.headers['x-square-hmacsha256-signature'];
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  if (signatureKey && !verifySignature(rawBody, signature, signatureKey, `${req.protocol}://${req.get('host')}${req.originalUrl}`)) {
    console.warn('Square webhook signature verification failed');
    return res.status(200).send('OK'); // Still 200 to prevent retries
  }

  let event;
  try {
    event = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody);
  } catch (e) {
    console.error('Square webhook: invalid JSON');
    return res.status(200).send('OK');
  }

  res.status(200).send('OK'); // Respond immediately

  // Process asynchronously
  if (event.type === 'terminal.checkout.updated') {
    const checkout = event.data?.object?.checkout;
    if (!checkout || checkout.status !== 'COMPLETED') return;

    const recordId = checkout.reference_id;
    if (!recordId) {
      console.warn('Square webhook: no reference_id on completed checkout');
      return;
    }

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      // Check if already recorded
      const squarePaymentId = checkout.payment_ids?.[0] || checkout.id;
      const { rows: existing } = await dbClient.query(
        "SELECT id FROM payments WHERE square_transaction_id = $1",
        [squarePaymentId]
      );
      if (existing.length > 0) {
        await dbClient.query('ROLLBACK');
        console.log(`Square webhook: payment ${squarePaymentId} already recorded`);
        return;
      }

      const amountDollars = Number(checkout.amount_money.amount) / 100;
      const today = new Date().toISOString().split('T')[0];

      await dbClient.query(
        `INSERT INTO payments
           (record_id, payment_type, payment_method, amount, payment_date,
            square_transaction_id, notes)
         VALUES ($1, 'final_payment', 'credit_card', $2, $3, $4, $5)`,
        [recordId, amountDollars, today, squarePaymentId, `Square Terminal payment (webhook) ${squarePaymentId}`]
      );

      await recalculateTotals(recordId, dbClient);
      await autoTransitionStatus(recordId, dbClient);
      await dbClient.query('COMMIT');

      console.log(`Square webhook: payment of $${amountDollars} recorded for record ${recordId}`);
    } catch (err) {
      await dbClient.query('ROLLBACK');
      console.error('Square webhook processing error:', err);
    } finally {
      dbClient.release();
    }
  }
});

module.exports = router;
