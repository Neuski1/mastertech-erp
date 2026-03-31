const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { client: squareClient, locationId } = require('../services/square');
const { requireAuth, requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Helper: auto-transition record status after payment
// ---------------------------------------------------------------------------
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
// POST /api/square/pos/checkout — Create a Square Payment Link
// Body: { recordId, amount, paymentType, notes }
// Returns: { checkoutUrl, orderId }
// ---------------------------------------------------------------------------
router.post('/checkout', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId, amount, paymentType, notes } = req.body;

  if (!recordId || !amount) {
    return res.status(400).json({ error: 'recordId and amount are required' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    const { rows: recRows } = await pool.query(
      'SELECT id, record_number, customer_id FROM records WHERE id = $1 AND deleted_at IS NULL',
      [recordId]
    );
    if (recRows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const { rows: custRows } = await pool.query(
      'SELECT first_name, last_name FROM customers WHERE id = $1',
      [recRows[0].customer_id]
    );
    const customerName = custRows.length > 0
      ? `${custRows[0].first_name || ''} ${custRows[0].last_name || ''}`.trim()
      : 'Customer';

    const amountCents = Math.round(parsedAmount * 100);
    const description = `WO #${recRows[0].record_number} — ${customerName}`;

    const baseUrl = process.env.FRONTEND_URL
      || 'https://mastertech-erp-production-cb96.up.railway.app';

    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(amountCents),
          currency: 'USD',
        },
        locationId: locationId,
      },
      checkoutOptions: {
        redirectUrl: `${baseUrl}/api/square/pos/callback?recordId=${recordId}&paymentType=${paymentType || 'final_payment'}`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: null,
      },
    });

    const paymentLink = response.data.paymentLink;
    const orderId = response.data.relatedResources?.orders?.[0]?.id
      || paymentLink.orderId
      || null;

    res.status(201).json({
      checkoutUrl: paymentLink.url || paymentLink.longUrl,
      orderId: orderId,
      paymentLinkId: paymentLink.id,
    });
  } catch (err) {
    console.error('POST /api/square/pos/checkout error:', err);
    const errorDetail = err.errors
      ? err.errors.map(e => `${e.code}: ${e.detail}`).join('; ')
      : err.message || 'Square checkout creation failed';
    res.status(502).json({ error: `Square: ${errorDetail}` });
  }
});

// ---------------------------------------------------------------------------
// GET /api/square/pos/callback — Redirect after Square payment
// Query: recordId, paymentType, transactionId (from Square)
// ---------------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const { recordId, paymentType, transactionId } = req.query;
  const frontendUrl = process.env.FRONTEND_URL
    || 'https://mastertech-erp-production-cb96.up.railway.app';

  if (!recordId) {
    return res.redirect(`${frontendUrl}/records?square=error&message=Missing+record+ID`);
  }

  // If transactionId present, Square is telling us it succeeded
  if (transactionId) {
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      // Check if already recorded
      const { rows: existing } = await dbClient.query(
        'SELECT id FROM payments WHERE square_transaction_id = $1',
        [transactionId]
      );

      if (existing.length === 0) {
        // Fetch payment amount from Square
        let amountDollars = 0;
        try {
          const paymentResponse = await squareClient.payments.get(transactionId);
          amountDollars = Number(paymentResponse.data.payment.amountMoney.amount) / 100;
        } catch (e) {
          // If we can't fetch amount, get it from amount_due
          const { rows: recRows } = await dbClient.query(
            'SELECT amount_due FROM records WHERE id = $1', [recordId]
          );
          amountDollars = parseFloat(recRows[0]?.amount_due) || 0;
        }

        if (amountDollars > 0) {
          const today = new Date().toISOString().split('T')[0];
          await dbClient.query(
            `INSERT INTO payments (record_id, payment_type, payment_method, amount, payment_date, square_transaction_id, notes)
             VALUES ($1, $2, 'credit_card', $3, $4, $5, $6)`,
            [recordId, paymentType || 'final_payment', amountDollars, today, transactionId, `Square payment ${transactionId}`]
          );
          await recalculateTotals(recordId, dbClient);
          await autoTransitionStatus(recordId, dbClient);
        }
      }

      await dbClient.query('COMMIT');
    } catch (err) {
      await dbClient.query('ROLLBACK');
      console.error('Square POS callback error:', err);
    } finally {
      dbClient.release();
    }
  }

  // Redirect back to record detail
  res.redirect(`${frontendUrl}/records/${recordId}?square=success`);
});

// ---------------------------------------------------------------------------
// GET /api/square/pos/status/:orderId — Poll order status
// ---------------------------------------------------------------------------
router.get('/status/:orderId', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  try {
    const response = await squareClient.orders.get({
      orderId: req.params.orderId,
    });
    const order = response.data.order;
    const isPaid = order.state === 'COMPLETED';
    const tenders = order.tenders || [];
    const transactionId = tenders.length > 0 ? tenders[0].paymentId : null;

    res.json({
      state: order.state,
      isPaid,
      transactionId,
      totalMoney: order.totalMoney,
    });
  } catch (err) {
    // Order may not exist yet if payment link hasn't been used
    if (err.statusCode === 404) {
      return res.json({ state: 'PENDING', isPaid: false });
    }
    console.error('Square POS status error:', err);
    res.status(502).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/square/pos/record-payment — Manually record after poll confirms paid
// Body: { recordId, orderId, paymentType }
// ---------------------------------------------------------------------------
router.post('/record-payment', requireAuth, requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId, orderId, paymentType } = req.body;

  if (!recordId || !orderId) {
    return res.status(400).json({ error: 'recordId and orderId are required' });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Get order from Square
    const orderResponse = await squareClient.orders.get({ orderId });
    const order = orderResponse.data.order;

    if (order.state !== 'COMPLETED') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: `Order not completed (state: ${order.state})` });
    }

    const tenders = order.tenders || [];
    const transactionId = tenders.length > 0 ? tenders[0].paymentId : orderId;
    const amountDollars = Number(order.totalMoney.amount) / 100;

    // Check if already recorded
    const { rows: existing } = await dbClient.query(
      'SELECT id FROM payments WHERE square_transaction_id = $1',
      [transactionId]
    );

    if (existing.length > 0) {
      await dbClient.query('ROLLBACK');
      return res.json({ message: 'Payment already recorded', paymentId: existing[0].id });
    }

    const today = new Date().toISOString().split('T')[0];
    const { rows: paymentRows } = await dbClient.query(
      `INSERT INTO payments (record_id, payment_type, payment_method, amount, payment_date, square_transaction_id, notes)
       VALUES ($1, $2, 'credit_card', $3, $4, $5, $6)
       RETURNING *`,
      [recordId, paymentType || 'final_payment', amountDollars, today, transactionId, `Square payment ${transactionId}`]
    );

    await recalculateTotals(recordId, dbClient);
    await autoTransitionStatus(recordId, dbClient);
    await dbClient.query('COMMIT');

    res.status(201).json({ payment: paymentRows[0] });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('Square POS record-payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    dbClient.release();
  }
});

module.exports = router;
