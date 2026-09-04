const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Schedule closures — days the shop is closed (holidays, vacation, weather).
// One row per calendar day. The calendar reads these and paints the day red;
// booking on a closed day is still allowed after a confirmation prompt.
// ---------------------------------------------------------------------------

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// GET /api/schedule-closures?date_from=&date_to=
router.get('/', async (req, res) => {
  const { date_from, date_to } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (isDate(date_from)) { conditions.push(`closure_date >= $${idx++}`); params.push(date_from); }
  if (isDate(date_to)) { conditions.push(`closure_date <= $${idx++}`); params.push(date_to); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await pool.query(
      `SELECT id, to_char(closure_date, 'YYYY-MM-DD') AS closure_date, label, note, created_at
         FROM schedule_closures ${where} ORDER BY closure_date ASC`,
      params
    );
    res.json({ closures: rows });
  } catch (err) {
    console.error('Failed to list schedule closures:', err);
    res.status(500).json({ error: 'Failed to load closures' });
  }
});

// POST /api/schedule-closures
// Body: { date, end_date (optional, inclusive), label, note }
// A date range creates one row per day so every calendar view can key on a
// single date without range math.
router.post('/', requireRole('admin', 'service_writer'), async (req, res) => {
  const { date, end_date, label, note } = req.body || {};
  if (!isDate(date)) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  if (end_date && !isDate(end_date)) return res.status(400).json({ error: 'end_date must be YYYY-MM-DD' });
  const cleanLabel = (label || '').trim();
  if (!cleanLabel) return res.status(400).json({ error: 'label is required (e.g. "Labor Day")' });
  if (cleanLabel.length > 100) return res.status(400).json({ error: 'label must be 100 characters or less' });

  const start = new Date(`${date}T12:00:00`);
  const end = end_date ? new Date(`${end_date}T12:00:00`) : start;
  if (end < start) return res.status(400).json({ error: 'end_date must be on or after date' });
  const spanDays = Math.round((end - start) / 86400000) + 1;
  if (spanDays > 60) return res.status(400).json({ error: 'Closure range cannot exceed 60 days' });

  const dates = [];
  for (let i = 0; i < spanDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO schedule_closures (closure_date, label, note)
       SELECT unnest($1::date[]), $2, $3
       ON CONFLICT (closure_date) DO UPDATE SET label = EXCLUDED.label, note = EXCLUDED.note
       RETURNING id, to_char(closure_date, 'YYYY-MM-DD') AS closure_date, label, note, created_at`,
      [dates, cleanLabel, (note || '').trim() || null]
    );
    res.status(201).json({ closures: rows });
  } catch (err) {
    console.error('Failed to save schedule closure:', err);
    res.status(500).json({ error: 'Failed to save closure' });
  }
});

// DELETE /api/schedule-closures/:id
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM schedule_closures WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Closure not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete schedule closure:', err);
    res.status(500).json({ error: 'Failed to delete closure' });
  }
});

module.exports = router;
