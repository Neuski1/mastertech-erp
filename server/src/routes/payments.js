const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Helper: auto-transition record status based on payment balance
// Must be called AFTER recalculateTotals within the same transaction
// ---------------------------------------------------------------------------
async function autoTransitionStatus(recordId, client) {
  const { rows } = await client.query(
    'SELECT status, amount_due, total_collected, total_sales FROM records WHERE id = $1',
    [recordId]
  );
  if (rows.length === 0) return;

  const rec = rows[0];
  const amountDue = parseFloat(rec.amount_due);
  const totalCollected = parseFloat(rec.total_collected);

  // Don't auto-transition from estimate, approved, or void
  if (['estimate', 'approved', 'void'].includes(rec.status)) return;

  if (amountDue <= 0 && totalCollected > 0) {
    // Paid in full → move to 'paid' (closed)
    await client.query(
      "UPDATE records SET status = 'paid', payment_pending_since = NULL, reminder_count = 0, last_reminder_sent_at = NULL WHERE id = $1",
      [recordId]
    );
  } else if (totalCollected > 0 && amountDue > 0 && !['partial', 'in_progress'].includes(rec.status)) {
    await client.query(
      "UPDATE records SET status = 'partial' WHERE id = $1",
      [recordId]
    );
  } else if (totalCollected === 0 && ['partial'].includes(rec.status)) {
    // If all payments removed, revert to payment_pending
    await client.query(
      "UPDATE records SET status = 'payment_pending' WHERE id = $1",
      [recordId]
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/:recordId — Add a payment
// ---------------------------------------------------------------------------
router.post('/:recordId', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId } = req.params;
  const {
    payment_type, payment_method, amount, payment_date,
    check_number, insurance_company, claim_number,
    square_transaction_id, notes
  } = req.body;
  // Auto-set posted_by_user_id from the authenticated user
  const posted_by_user_id = req.user.id;

  if (!payment_type || !payment_method || amount === undefined || !payment_date) {
    return res.status(400).json({
      error: 'payment_type, payment_method, amount, and payment_date are required'
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify record exists and is in a payable status
    const { rows: recRows } = await client.query(
      "SELECT id, status FROM records WHERE id = $1 AND deleted_at IS NULL",
      [recordId]
    );
    if (recRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const payableStatuses = ['complete', 'payment_pending', 'partial', 'approved',
                             'schedule_customer', 'scheduled', 'in_progress',
                             'awaiting_parts', 'awaiting_approval'];
    if (!payableStatuses.includes(recRows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Cannot add payment to a record with status '${recRows[0].status}'`
      });
    }

    const { rows } = await client.query(
      `INSERT INTO payments
         (record_id, payment_type, payment_method, amount, payment_date,
          check_number, insurance_company, claim_number,
          square_transaction_id, posted_by_user_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [recordId, payment_type, payment_method, parsedAmount, payment_date,
       check_number || null, insurance_company || null, claim_number || null,
       square_transaction_id || null, posted_by_user_id || null, notes || null]
    );

    // Recalculate totals and auto-transition status
    await recalculateTotals(recordId, client);
    await autoTransitionStatus(recordId, client);

    await client.query('COMMIT');

    // Refetch the payment (in case triggers updated timestamps)
    const { rows: full } = await pool.query(
      'SELECT * FROM payments WHERE id = $1', [rows[0].id]
    );
    res.status(201).json(full[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// GET /api/payments/:recordId — List payments for a record
// ---------------------------------------------------------------------------
router.get('/:recordId', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  try {
    // Verify record exists
    const { rows: recRows } = await pool.query(
      'SELECT id FROM records WHERE id = $1 AND deleted_at IS NULL',
      [req.params.recordId]
    );
    if (recRows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const { rows } = await pool.query(
      `SELECT p.*, u.name AS posted_by_name
       FROM payments p
       LEFT JOIN users u ON u.id = p.posted_by_user_id
       WHERE p.record_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.payment_date, p.id`,
      [req.params.recordId]
    );

    // Also return summary
    const { rows: recData } = await pool.query(
      'SELECT total_sales, total_collected, amount_due FROM records WHERE id = $1',
      [req.params.recordId]
    );

    res.json({
      payments: rows,
      summary: recData[0]
    });
  } catch (err) {
    console.error('GET payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/payments/:recordId/:paymentId — Edit a payment
// ---------------------------------------------------------------------------
router.patch('/:recordId/:paymentId', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId, paymentId } = req.params;
  const {
    payment_type, payment_method, amount, payment_date,
    check_number, insurance_company, claim_number,
    square_transaction_id, notes
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify payment exists and belongs to record
    const { rows: payRows } = await client.query(
      'SELECT * FROM payments WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL',
      [paymentId, recordId]
    );
    if (payRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify record is not void
    const { rows: recRows } = await client.query(
      'SELECT status FROM records WHERE id = $1 AND deleted_at IS NULL',
      [recordId]
    );
    if (recRows.length === 0 || recRows[0].status === 'void') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot edit payment on a voided record' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (payment_type !== undefined) {
      updates.push(`payment_type = $${idx++}`);
      values.push(payment_type);
    }
    if (payment_method !== undefined) {
      updates.push(`payment_method = $${idx++}`);
      values.push(payment_method);
    }
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'amount must be a positive number' });
      }
      updates.push(`amount = $${idx++}`);
      values.push(parsedAmount);
    }
    if (payment_date !== undefined) {
      updates.push(`payment_date = $${idx++}`);
      values.push(payment_date);
    }
    if (check_number !== undefined) {
      updates.push(`check_number = $${idx++}`);
      values.push(check_number || null);
    }
    if (insurance_company !== undefined) {
      updates.push(`insurance_company = $${idx++}`);
      values.push(insurance_company || null);
    }
    if (claim_number !== undefined) {
      updates.push(`claim_number = $${idx++}`);
      values.push(claim_number || null);
    }
    if (square_transaction_id !== undefined) {
      updates.push(`square_transaction_id = $${idx++}`);
      values.push(square_transaction_id || null);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${idx++}`);
      values.push(notes || null);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(paymentId);
    await client.query(
      `UPDATE payments SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    // Recalculate totals and auto-transition status
    await recalculateTotals(recordId, client);
    await autoTransitionStatus(recordId, client);

    await client.query('COMMIT');

    const { rows: updated } = await pool.query(
      'SELECT * FROM payments WHERE id = $1', [paymentId]
    );
    res.json(updated[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/payments/:recordId/:paymentId — Soft delete a payment
// ---------------------------------------------------------------------------
router.delete('/:recordId/:paymentId', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { recordId, paymentId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify record is not void
    const { rows: recRows } = await client.query(
      'SELECT status FROM records WHERE id = $1 AND deleted_at IS NULL',
      [recordId]
    );
    if (recRows.length === 0 || recRows[0].status === 'void') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot delete payment on a voided record' });
    }

    const { rows } = await client.query(
      `UPDATE payments SET deleted_at = NOW()
       WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL
       RETURNING id, amount, payment_type`,
      [paymentId, recordId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Recalculate totals and auto-transition status
    await recalculateTotals(recordId, client);
    await autoTransitionStatus(recordId, client);

    await client.query('COMMIT');

    res.json({ message: 'Payment deleted', payment: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE payment error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
