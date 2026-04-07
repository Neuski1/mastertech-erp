const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// POST /api/units — Create unit for a customer
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color, linear_feet } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO units (customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color, linear_feet)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [customer_id, year || null, make || null, model || null,
       vin || null, license_plate || null, unit_notes || null,
       unit_type || null, color || null, linear_feet || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/units/:id — Update unit fields
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const allowedFields = ['year', 'make', 'model', 'vin', 'license_plate', 'unit_notes', 'unit_type', 'color', 'linear_feet'];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      values.push(req.body[field] || null);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE units SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/units/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/units/:id — Soft delete a unit
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    // Check if unit is assigned to an active storage space
    const { rows: activeStorage } = await pool.query(
      'SELECT id FROM storage_billing WHERE unit_id = $1 AND billing_end_date IS NULL AND deleted_at IS NULL',
      [req.params.id]
    );
    if (activeStorage.length > 0) {
      return res.status(409).json({
        error: 'This unit is assigned to an active storage space and cannot be deleted.'
      });
    }

    const { rows } = await pool.query(
      'UPDATE units SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted', id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/units/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
