const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/technicians — List active technicians (for dropdowns)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name FROM technicians WHERE is_active = TRUE AND deleted_at IS NULL ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/technicians/all — List all technicians including inactive (admin only)
router.get('/all', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, is_active, hourly_wage, created_at FROM technicians WHERE deleted_at IS NULL ORDER BY is_active DESC, name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/technicians — Add new technician (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Technician name is required' });
  }

  try {
    // Check for duplicate name
    const existing = await pool.query(
      'SELECT id FROM technicians WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL',
      [name.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A technician with that name already exists' });
    }

    const { rows } = await pool.query(
      'INSERT INTO technicians (name, is_active) VALUES ($1, TRUE) RETURNING id, name, is_active, created_at',
      [name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/technicians/:id — Update technician (admin only)
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { is_active, hourly_wage } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;

  if (typeof is_active === 'boolean') {
    updates.push(`is_active = $${idx++}`);
    values.push(is_active);
  }
  if (hourly_wage !== undefined) {
    updates.push(`hourly_wage = $${idx++}`);
    values.push(parseFloat(hourly_wage));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE technicians SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
