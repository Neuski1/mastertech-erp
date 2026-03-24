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
      'SELECT id, name, is_active, created_at FROM technicians WHERE deleted_at IS NULL ORDER BY is_active DESC, name'
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

// PATCH /api/technicians/:id — Toggle active status (admin only)
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active (boolean) is required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE technicians SET is_active = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id, name, is_active, created_at',
      [is_active, req.params.id]
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
