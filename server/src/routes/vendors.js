const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app')
    ? { rejectUnauthorized: false }
    : undefined,
});

// GET /api/vendors — list all vendors
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name FROM vendors ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/vendors error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vendors — create a new vendor
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO vendors (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name',
      [name.trim().toUpperCase()]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/vendors error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
