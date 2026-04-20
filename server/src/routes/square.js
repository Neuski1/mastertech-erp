const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { client: squareClient, locationId, applicationId, environment } = require('../services/square');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Helper: auto-transition record status after payment
// (duplicated from payments.js to keep routes self-contained within txn)
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
// GET /api/square/config — Return public Square config for frontend SDK
// ---------------------------------------------------------------------------
router.get('/config', (req, res) => {
  if (!applicationId || !locationId) {
    return res.status(500).json({ error: 'Square configuration missing' });
  }

  res.json({
    applicationId,
    locationId,
    environment,
  });
});

// ---------------------------------------------------------------------------
// POST /api/square/create-payment — Process a card charge via Square
// Body: { record_id, source_id (nonce), amount, payment_type, notes }
// ---------------------------------------------------------------------------
router.post('/create-payment', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { record_id, source_id, amount, payment_type, notes } = req.body;

  if (!record_id || !source_id || !amount) {
    return res.status(400).json({
      error: 'record_id, source_id (card nonce), and amount are required'
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  // Square amounts are in cents (smallest currency unit)
  const amountCents = Math.round(parsedAmount * 100);
  const idempotencyKey = crypto.randomUUID();

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Verify record exists and is payable
    const { rows: recRows } = await dbClient.query(
      "SELECT id, status, record_number FROM records WHERE id = $1 AND deleted_at IS NULL",
      [record_id]
    );
    if (recRows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const payableStatuses = ['complete', 'partial', 'approved', 'in_progress',
                             'awaiting_parts', 'awaiting_approval'];
    if (!payableStatuses.includes(recRows[0].status)) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot add payment to a record with status '${recRows[0].status}'`
      });
    }

    // Call Square Payments API
    let squarePayment;
    try {
      const response = await squareClient.payments.create({
        sourceId: source_id,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amountCents),
          currency: 'USD',
        },
        locationId,
        note: `WO #${recRows[0].record_number}${notes ? ' - ' + notes : ''}`,
      });

      squarePayment = response.data.payment;
    } catch (squareErr) {
      await dbClient.query('ROLLBACK');
      console.error('Square API error:', squareErr);

      // Extract meaningful error from Square response
      const errorDetail = squareErr.errors
        ? squareErr.errors.map(e => e.detail).join('; ')
        : squareErr.message || 'Square payment failed';

      return res.status(502).json({ error: `Square: ${errorDetail}` });
    }

    // Square charge succeeded — create ERP payment record
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

    const { rows: paymentRows } = await dbClient.query(
      `INSERT INTO payments
         (record_id, payment_type, payment_method, amount, payment_date,
          square_transaction_id, notes)
       VALUES ($1, $2, 'credit_card', $3, $4, $5, $6)
       RETURNING *`,
      [
        record_id,
        payment_type || 'final_payment',
        parsedAmount,
        today,
        squarePayment.id,
        notes || `Square payment ${squarePayment.id}`,
      ]
    );

    // Recalculate totals and auto-transition status
    await recalculateTotals(record_id, dbClient);
    await autoTransitionStatus(record_id, dbClient);

    await dbClient.query('COMMIT');

    res.status(201).json({
      payment: paymentRows[0],
      square_payment_id: squarePayment.id,
      square_status: squarePayment.status,
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('POST /api/square/create-payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    dbClient.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/square/create-customer — Sync an ERP customer to Square
// Body: { customer_id }
// ---------------------------------------------------------------------------
router.post('/create-customer', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  try {
    // Fetch ERP customer
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL',
      [customer_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const cust = rows[0];

    const response = await squareClient.customers.create({
      idempotencyKey: crypto.randomUUID(),
      givenName: cust.first_name || undefined,
      familyName: cust.last_name,
      companyName: cust.company_name || undefined,
      emailAddress: cust.email_primary || undefined,
      phoneNumber: cust.phone_primary || undefined,
      referenceId: String(cust.id),
      address: cust.address_street ? {
        addressLine1: cust.address_street,
        locality: cust.address_city || undefined,
        administrativeDistrictLevel1: cust.address_state || undefined,
        postalCode: cust.address_zip || undefined,
      } : undefined,
    });

    const squareCustomer = response.data.customer;

    res.status(201).json({
      square_customer_id: squareCustomer.id,
      erp_customer_id: cust.id,
    });
  } catch (err) {
    console.error('POST /api/square/create-customer error:', err);

    const errorDetail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Square customer creation failed';

    res.status(502).json({ error: `Square: ${errorDetail}` });
  }
});

// ---------------------------------------------------------------------------
// GET /api/square/payment/:id — Look up a Square transaction
// ---------------------------------------------------------------------------
router.get('/payment/:id', async (req, res) => {
  try {
    const response = await squareClient.payments.get(req.params.id);
    const payment = response.data.payment;

    res.json({
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amountMoney.amount) / 100,
      currency: payment.amountMoney.currency,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
      card_brand: payment.cardDetails?.card?.cardBrand || null,
      last_4: payment.cardDetails?.card?.last4 || null,
      receipt_url: payment.receiptUrl || null,
    });
  } catch (err) {
    console.error('GET /api/square/payment error:', err);

    const errorDetail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message || 'Square lookup failed';

    res.status(err.statusCode === 404 ? 404 : 502).json({
      error: `Square: ${errorDetail}`
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/square/devices — List Square devices (admin only, for Terminal setup)
// ---------------------------------------------------------------------------
router.get('/devices', requireRole('admin'), async (req, res) => {
  const baseUrl = environment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
  try {
    const response = await fetch(`${baseUrl}/v2/devices`, {
      headers: { 'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}` },
    });
    const data = await response.json();
    if (data.errors) {
      return res.status(400).json({ errors: data.errors });
    }
    const devices = (data.devices || []).map(d => ({
      id: d.id,
      name: d.attributes?.name || d.name || 'Unnamed',
      type: d.attributes?.type || '',
      model: d.attributes?.model || '',
      status: d.status?.category || '',
      locationId: d.location_id || '',
    }));
    res.json({ environment, devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
