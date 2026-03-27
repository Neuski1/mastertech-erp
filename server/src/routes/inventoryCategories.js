const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/inventory-categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM inventory_categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory-categories
router.post('/', requireRole('admin', 'service_writer'), async (req, res) => {
  const { name, prefix } = req.body;
  if (!name || !prefix) return res.status(400).json({ error: 'name and prefix are required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO inventory_categories (name, prefix) VALUES ($1, $2) RETURNING *',
      [name.trim(), prefix.trim().toUpperCase()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Prefix already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/inventory-categories/:id
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  const { name, prefix } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name.trim()); }
  if (prefix !== undefined) { updates.push(`prefix = $${idx++}`); values.push(prefix.trim().toUpperCase()); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE inventory_categories SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Prefix already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory-categories/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    // Check if any inventory items use this category
    const cat = await pool.query('SELECT * FROM inventory_categories WHERE id = $1', [req.params.id]);
    if (cat.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    const prefix = cat.rows[0].prefix;
    const usage = await pool.query(
      "SELECT COUNT(*) FROM inventory WHERE deleted_at IS NULL AND (category = $1 OR part_number LIKE $2)",
      [cat.rows[0].name, `${prefix}-%`]
    );
    const count = parseInt(usage.rows[0].count);
    if (count > 0) {
      return res.status(400).json({ error: `Cannot delete — ${count} inventory items use this category.` });
    }
    await pool.query('DELETE FROM inventory_categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
