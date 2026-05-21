const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { client: squareClient, locationId } = require('../services/square');
const { requireRole } = require('../middleware/auth');

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

  if (['estimate', 'approved', 'void'].includes(rec.status)) return;

  if (amountDue <= 0 && totalCollected > 0) {
    await dbClient.query("UPDATE records SET status = 'paid', payment_pending_since = NULL, reminder_count = 0, last_reminder_sent_at = NULL WHERE id = $1", [recordId]);
  } else if (totalCollected > 0 && amountDue > 0 && !['partial', 'in_progress'].includes(rec.status)) {
    await dbClient.query("UPDATE records SET status = 'partial' WHERE id = $1", [recordId]);
  }
}

// ---------------------------------------------------------------------------
// GET /api/square/terminal/config — Check if Terminal is configured
// ---------------------------------------------------------------------------
router.get('/config', (req, res) => {
  const deviceId = process.env.SQUARE_TERMINAL_DEVICE_ID;
  res.json({
    configured: !!deviceId,
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  });
});

// ---------------------------------------------------------------------------
// POST /api/square/terminal/pair — Create a Terminal API device code for pairing
// ---------------------------------------------------------------------------
router.post('/pair', requireRole('admin', 'service_writer'), async (req, res) => {
  if (!locationId) {
    return res.status(400).json({ error: 'SQUARE_LOCATION_ID is not configured.' });
  }
  try {
    const response = await squareClient.devices.codes.create({
      idempotencyKey: crypto.randomUUID(),
      deviceCode: {
        name: 'Master Tech ERP',
        productType: 'TERMINAL_API',
        locationId: locationId,
      },
    });
    const dc = response.deviceCode;
    res.status(201).json({
      codeId: dc.id,
      code: dc.code,
      status: dc.status,
      pairBy: dc.pairBy || null,
    });
  } catch (err) {
    console.error('POST /api/square/terminal/pair error:', err);
    const detail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Failed to create device code';
    res.status(502).json({ error: `Square: ${detail}` });
  }
});

// ---------------------------------------------------------------------------
// GET /api/square/terminal/pair/:codeId — Poll device code pairing status
// ---------------------------------------------------------------------------
router.get('/pair/:codeId', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const response = await squareClient.devices.codes.get({ id: req.params.codeId });
    const dc = response.deviceCode;
    res.json({
      status: dc.status,
      deviceId: dc.deviceId || null,
      code: dc.code,
    });
  } catch (err) {
    console.error('GET /api/square/terminal/pair status error:', err);
    const detail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Failed to check pairing status';
    res.status(502).json({ error: `Square: ${detail}` });
  }
});

// ---------------------------------------------------------------------------
// POST /api/square/terminal/checkout — Create Terminal checkout
// Body: { recordId, amount, paymentType, notes }
// ---------------------------------------------------------------------------
router.post('/checkout', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId, saleType, saleId, amount, paymentType, notes } = req.body;
  const deviceId = process.env.SQUARE_TERMINAL_DEVICE_ID;
  const isPartsSale = saleType === 'parts_sale';
  const entityId = isPartsSale ? saleId : recordId;

  if (!deviceId) {
    return res.status(400).json({ error: 'Square Terminal device not configured. Add SQUARE_TERMINAL_DEVICE_ID to .env.' });
  }

  if (!entityId || !amount) {
    return res.status(400).json({ error: 'A record/sale id and amount are required' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    // Verify the record or parts sale exists, and build the Terminal note
    let referenceId, note;
    if (isPartsSale) {
      const { rows: psRows } = await pool.query(
        'SELECT id, sale_number, customer_id, customer_name FROM parts_sales WHERE id = $1',
        [entityId]
      );
      if (psRows.length === 0) {
        return res.status(404).json({ error: 'Parts sale not found' });
      }
      let custName = psRows[0].customer_name || 'Customer';
      if (psRows[0].customer_id) {
        const { rows: cr } = await pool.query(
          'SELECT first_name, last_name FROM customers WHERE id = $1',
          [psRows[0].customer_id]
        );
        if (cr.length > 0) {
          custName = `${cr[0].first_name || ''} ${cr[0].last_name || ''}`.trim() || custName;
        }
      }
      referenceId = `ps:${entityId}`;
      note = `Parts Sale ${psRows[0].sale_number} - ${custName}${notes ? ' - ' + notes : ''}`;
    } else {
      const { rows: recRows } = await pool.query(
        'SELECT id, record_number, customer_id FROM records WHERE id = $1 AND deleted_at IS NULL',
        [entityId]
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
      referenceId = String(entityId);
      note = `WO #${recRows[0].record_number} - ${customerName}${notes ? ' - ' + notes : ''}`;
    }

    const amountCents = Math.round(parsedAmount * 100);

    const response = await squareClient.terminal.checkouts.create({
      idempotencyKey: crypto.randomUUID(),
      checkout: {
        amountMoney: {
          amount: BigInt(amountCents),
          currency: 'USD',
        },
        deviceOptions: {
          deviceId: deviceId,
          skipReceiptScreen: false,
          tipSettings: { allowTipping: true, separateTipScreen: true },
        },
        referenceId: referenceId,
        note: note,
        paymentType: 'CARD_PRESENT',
      },
    });

    const checkout = response.checkout;

    res.status(201).json({
      checkoutId: checkout.id,
      status: checkout.status,
      amountMoney: checkout.amountMoney,
    });
  } catch (err) {
    console.error('POST /api/square/terminal/checkout error:', err);
    const errorDetail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Square Terminal checkout failed';
    res.status(502).json({ error: `Square: ${errorDetail}` });
  }
});

// ---------------------------------------------------------------------------
// GET /api/square/terminal/checkout/:checkoutId/status — Poll checkout status
// ---------------------------------------------------------------------------
router.get('/checkout/:checkoutId/status', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  try {
    const response = await squareClient.terminal.checkouts.get({ checkoutId: req.params.checkoutId });
    const checkout = response.checkout;

    res.json({
      status: checkout.status,
      paymentIds: checkout.paymentIds || [],
      amountMoney: checkout.amountMoney,
      referenceId: checkout.referenceId,
    });
  } catch (err) {
    console.error('GET /api/square/terminal/checkout status error:', err);
    const errorDetail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Square status check failed';
    res.status(502).json({ error: `Square: ${errorDetail}` });
  }
});

// ---------------------------------------------------------------------------
// POST /api/square/terminal/checkout/:checkoutId/cancel — Cancel checkout
// ---------------------------------------------------------------------------
router.post('/checkout/:checkoutId/cancel', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  try {
    await squareClient.terminal.checkouts.cancel({ checkoutId: req.params.checkoutId });
    res.json({ status: 'CANCELED' });
  } catch (err) {
    console.error('Cancel terminal checkout error:', err);
    const errorDetail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Cancel failed';
    res.status(502).json({ error: `Square: ${errorDetail}` });
  }
});

// ---------------------------------------------------------------------------
// POST /api/square/terminal/complete-payment — Record a completed Terminal payment
// Called by frontend after polling confirms COMPLETED, or by webhook
// Body: { checkoutId, recordId, paymentType }
// ---------------------------------------------------------------------------
router.post('/complete-payment', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { checkoutId, recordId, paymentType } = req.body;

  if (!checkoutId || !recordId) {
    return res.status(400).json({ error: 'checkoutId and recordId are required' });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Check if payment already recorded for this checkout
    const { rows: existing } = await dbClient.query(
      "SELECT id FROM payments WHERE square_transaction_id = $1",
      [checkoutId]
    );
    if (existing.length > 0) {
      await dbClient.query('ROLLBACK');
      return res.json({ message: 'Payment already recorded', paymentId: existing[0].id });
    }

    // Get checkout details from Square
    const response = await squareClient.terminal.checkouts.get({ checkoutId });
    const checkout = response.checkout;

    if (checkout.status !== 'COMPLETED') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: `Checkout not completed (status: ${checkout.status})` });
    }

    const amountDollars = Number(checkout.amountMoney.amount) / 100;
    const squarePaymentId = checkout.paymentIds && checkout.paymentIds.length > 0
      ? checkout.paymentIds[0]
      : checkoutId;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

    const { rows: paymentRows } = await dbClient.query(
      `INSERT INTO payments
         (record_id, payment_type, payment_method, amount, payment_date,
          square_transaction_id, notes)
       VALUES ($1, $2, 'credit_card', $3, $4, $5, $6)
       RETURNING *`,
      [
        recordId,
        paymentType || 'final_payment',
        amountDollars,
        today,
        squarePaymentId,
        `Square Terminal payment ${squarePaymentId}`,
      ]
    );

    await recalculateTotals(recordId, dbClient);
    await autoTransitionStatus(recordId, dbClient);
    await dbClient.query('COMMIT');

    res.status(201).json({
      payment: paymentRows[0],
      square_payment_id: squarePaymentId,
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('POST /api/square/terminal/complete-payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    dbClient.release();
  }
});

module.exports = router;
