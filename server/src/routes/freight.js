const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');

// GET /api/records/:id/freight — List freight lines for a record
router.get('/:id/freight', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM record_freight_lines
       WHERE record_id = $1 AND deleted_at IS NULL
       ORDER BY created_at`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:id/freight — Add a freight line
router.post('/:id/freight', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { description, amount } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  try {
    const parsedAmount = amount !== undefined && amount !== null && amount !== '' ? parseFloat(amount) : 0;
    const { rows } = await pool.query(
      `INSERT INTO record_freight_lines (record_id, description, amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, description, parsedAmount]
    );

    await recalculateTotals(req.params.id);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/records/:id/freight/:fid — Update a freight line
router.patch('/:id/freight/:fid', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { description, amount } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;

  if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
  if (amount !== undefined) { updates.push(`amount = $${idx++}`); values.push(parseFloat(amount)); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.fid, req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE record_freight_lines SET ${updates.join(', ')}
       WHERE id = $${idx++} AND record_id = $${idx} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Freight line not found' });
    }

    await recalculateTotals(req.params.id);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/records/:id/freight/:fid — Soft delete a freight line
router.delete('/:id/freight/:fid', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE record_freight_lines SET deleted_at = NOW()
       WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [req.params.fid, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Freight line not found' });
    }

    await recalculateTotals(req.params.id);
    res.json({ message: 'Freight line deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
