const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/bookkeeper-adjustments?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns adjustments whose [period_start, period_end] overlaps the given range.
router.get('/', requireRole('admin', 'bookkeeper'), async (req, res) => {
  const { start, end } = req.query;
  try {
    let sql = 'SELECT * FROM bookkeeper_adjustments';
    const params = [];
    if (start && end) {
      sql += ' WHERE period_start <= $2 AND period_end >= $1';
      params.push(start, end);
    }
    sql += ' ORDER BY period_start DESC, id DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/bookkeeper-adjustments error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    console.error('POST /api/bookkeeper-adjustments — missing/invalid body:', req.body);
    return res.status(400).json({ error: 'Request body missing or not JSON' });
  }
  const { period_label, period_start, period_end, adjustment_amount, note } = req.body;
  const missing = [];
  if (!period_label) missing.push('period_label');
  if (!period_start) missing.push('period_start');
  if (!period_end) missing.push('period_end');
  if (adjustment_amount === undefined || adjustment_amount === null || adjustment_amount === '') missing.push('adjustment_amount');
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO bookkeeper_adjustments (period_label, period_start, period_end, adjustment_amount, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [period_label, period_start, period_end, adjustment_amount, note || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/bookkeeper-adjustments DB error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      table: err.table,
      column: err.column,
      constraint: err.constraint,
      payload: { period_label, period_start, period_end, adjustment_amount, note },
    });
    const detail = [err.message, err.detail].filter(Boolean).join(' — ');
    res.status(500).json({ error: `DB error${err.code ? ' (' + err.code + ')' : ''}: ${detail}` });
  }
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  const { period_label, period_start, period_end, adjustment_amount, note } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE bookkeeper_adjustments
         SET period_label = COALESCE($1, period_label),
             period_start = COALESCE($2, period_start),
             period_end = COALESCE($3, period_end),
             adjustment_amount = COALESCE($4, adjustment_amount),
             note = $5,
             updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [period_label, period_start, period_end, adjustment_amount, note ?? null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Adjustment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/bookkeeper-adjustments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM bookkeeper_adjustments WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Adjustment not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/bookkeeper-adjustments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
