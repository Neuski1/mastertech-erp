const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// GET /api/partners — List all partners with optional filtering
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) {
    conditions.push(`status = $${idx++}`);
    params.push(status);
  }

  if (search) {
    conditions.push(`(business_name ILIKE $${idx} OR contact_name ILIKE $${idx} OR email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT * FROM partners ${whereSQL} ORDER BY business_name`,
      params
    );

    const statsRes = await pool.query(
      'SELECT status, COUNT(*)::int as count FROM partners GROUP BY status'
    );
    const funnel_stats = {};
    for (const row of statsRes.rows) {
      funnel_stats[row.status] = row.count;
    }

    res.json({ partners: rows, funnel_stats });
  } catch (err) {
    console.error('GET /api/partners error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/partners/funnel-stats — Return counts per status stage
// ---------------------------------------------------------------------------
router.get('/funnel-stats', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT status, COUNT(*)::int as count FROM partners GROUP BY status'
    );
    const funnel_stats = {};
    for (const row of rows) {
      funnel_stats[row.status] = row.count;
    }
    res.json(funnel_stats);
  } catch (err) {
    console.error('GET /api/partners/funnel-stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/partners — Create new partner
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const {
    business_name, location, contact_phone, website, contact_name, email,
    date_contacted, status, notes,
  } = req.body;

  if (!business_name) {
    return res.status(400).json({ error: 'business_name is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO partners (business_name, location, contact_phone, website, contact_name, email, date_contacted, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [business_name, location || null, contact_phone || null, website || null,
       contact_name || null, email || null, date_contacted || null,
       status || 'new', notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/partners error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/partners/:id — Get single partner by id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM partners WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/partners/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/partners/:id — Update partner
// ---------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  const allowedFields = [
    'business_name', 'location', 'contact_phone', 'website', 'contact_name',
    'email', 'date_contacted', 'status', 'notes',
  ];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push(`updated_at = NOW()`);
  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE partners SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/partners/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/partners/:id — Hard delete partner
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM partners WHERE id = $1 RETURNING id, business_name',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json({ success: true, partner: rows[0] });
  } catch (err) {
    console.error('DELETE /api/partners/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/partners/:id/activities — Get activity log for a partner
// ---------------------------------------------------------------------------
router.get('/:id/activities', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pa.*, u.name AS created_by_name
       FROM partner_activities pa
       LEFT JOIN users u ON u.id = pa.created_by
       WHERE pa.partner_id = $1
       ORDER BY pa.contact_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/partners/:id/activities error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/partners/:id/activities — Add activity log entry
// ---------------------------------------------------------------------------
router.post('/:id/activities', async (req, res) => {
  const { activity_type, contact_date, summary } = req.body;
  if (!summary || !summary.trim()) {
    return res.status(400).json({ error: 'Summary is required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO partner_activities (partner_id, activity_type, contact_date, summary, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, activity_type || 'note', contact_date || new Date(), summary.trim(), req.user?.id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/partners/:id/activities error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/partners/:id/activities/:actId — Delete an activity entry
// ---------------------------------------------------------------------------
router.delete('/:id/activities/:actId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM partner_activities WHERE id = $1 AND partner_id = $2 RETURNING id',
      [req.params.actId, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
