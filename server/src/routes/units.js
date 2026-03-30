const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// POST /api/units — Create unit for a customer
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO units (customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [customer_id, year || null, make || null, model || null,
       vin || null, license_plate || null, unit_notes || null,
       unit_type || null, color || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/units/:id — Update unit fields
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const allowedFields = ['year', 'make', 'model', 'vin', 'license_plate', 'unit_notes', 'unit_type', 'color'];
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

module.exports = router;
