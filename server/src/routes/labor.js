const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals, getSetting } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');

// Helper: fetch system labor rate
async function getLaborRate() {
  const { rows } = await pool.query(
    "SELECT setting_value FROM system_settings WHERE setting_key = 'labor_rate'"
  );
  return rows[0] ? parseFloat(rows[0].setting_value) : 198.00;
}

// ---------------------------------------------------------------------------
// POST /api/labor/:recordId — Add labor line
// ---------------------------------------------------------------------------
router.post('/:recordId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId } = req.params;
  const { technician_id, description, hours, no_charge } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  const parsedHours = parseFloat(hours || 0);
  if (isNaN(parsedHours) || parsedHours < 0) {
    return res.status(400).json({ error: 'hours cannot be negative' });
  }

  const isNoCharge = !!no_charge;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify record exists and is not void/paid
    const { rows: recRows } = await client.query(
      "SELECT id, status FROM records WHERE id = $1 AND deleted_at IS NULL",
      [recordId]
    );
    if (recRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }
    if (['paid', 'void'].includes(recRows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot add labor to a paid or voided record' });
    }

    // Get rate from system settings — NOT editable per line
    const rate = await getLaborRate();
    const lineTotal = isNoCharge ? 0 : parseFloat((parsedHours * rate).toFixed(2));

    // Get next sort_order
    const sortRes = await client.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort FROM record_labor_lines WHERE record_id = $1 AND deleted_at IS NULL',
      [recordId]
    );

    const { rows } = await client.query(
      `INSERT INTO record_labor_lines
         (record_id, technician_id, line_type, description, hours, rate, line_total, sort_order, no_charge)
       VALUES ($1, $2, 'L', $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [recordId, technician_id || null, description, parsedHours, rate, lineTotal, sortRes.rows[0].next_sort, isNoCharge]
    );

    // Recalculate record totals
    await recalculateTotals(recordId, client);

    await client.query('COMMIT');

    // Fetch with technician name
    const { rows: full } = await pool.query(
      `SELECT ll.*, t.name AS technician_name
       FROM record_labor_lines ll
       LEFT JOIN technicians t ON t.id = ll.technician_id
       WHERE ll.id = $1`,
      [rows[0].id]
    );

    res.status(201).json(full[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST labor error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/labor/:recordId/:lineId — Edit labor line
// ---------------------------------------------------------------------------
router.patch('/:recordId/:lineId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId, lineId } = req.params;
  const { technician_id, description, hours, no_charge } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: lineRows } = await client.query(
      'SELECT * FROM record_labor_lines WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL',
      [lineId, recordId]
    );
    if (lineRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Labor line not found' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (technician_id !== undefined) {
      updates.push(`technician_id = $${idx++}`);
      values.push(technician_id);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (no_charge !== undefined) {
      updates.push(`no_charge = $${idx++}`);
      values.push(!!no_charge);
    }

    // Determine effective no_charge state for line_total calculation
    const effectiveNoCharge = no_charge !== undefined ? !!no_charge : !!lineRows[0].no_charge;

    if (hours !== undefined) {
      const parsedHours = parseFloat(hours);
      if (isNaN(parsedHours) || parsedHours < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'hours cannot be negative' });
      }
      const rate = parseFloat(lineRows[0].rate);
      const lineTotal = effectiveNoCharge ? 0 : parseFloat((parsedHours * rate).toFixed(2));
      updates.push(`hours = $${idx++}`);
      values.push(parsedHours);
      updates.push(`line_total = $${idx++}`);
      values.push(lineTotal);
    } else if (no_charge !== undefined) {
      // no_charge toggled but hours not sent — recalculate line_total from existing hours
      const currentHours = parseFloat(lineRows[0].hours);
      const rate = parseFloat(lineRows[0].rate);
      const lineTotal = effectiveNoCharge ? 0 : parseFloat((currentHours * rate).toFixed(2));
      updates.push(`line_total = $${idx++}`);
      values.push(lineTotal);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(lineId);
    await client.query(
      `UPDATE record_labor_lines SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    await recalculateTotals(recordId, client);
    await client.query('COMMIT');

    const { rows: full } = await pool.query(
      `SELECT ll.*, t.name AS technician_name
       FROM record_labor_lines ll
       LEFT JOIN technicians t ON t.id = ll.technician_id
       WHERE ll.id = $1`,
      [lineId]
    );

    res.json(full[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH labor error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/labor/:recordId/:lineId — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:recordId/:lineId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId, lineId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE record_labor_lines SET deleted_at = NOW()
       WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [lineId, recordId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Labor line not found' });
    }

    await recalculateTotals(recordId, client);
    await client.query('COMMIT');

    res.json({ message: 'Labor line deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE labor error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
