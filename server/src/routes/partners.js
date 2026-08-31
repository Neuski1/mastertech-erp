const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Fields a partner record carries beyond the original contact columns.
// partner_type drives the priority order; next_step and next_step_due are
// what make a record answerable without reading its notes.
const PARTNER_FIELDS = [
  'business_name', 'location', 'contact_phone', 'website', 'contact_name',
  'email', 'date_contacted', 'status', 'notes',
  'partner_type', 'next_step', 'next_step_due', 'do_not_pitch',
  'do_not_pitch_reason', 'referral_terms', 'owner_agent',
];

// ---------------------------------------------------------------------------
// GET /api/partners — List all partners with optional filtering
// ?due=true returns the partners_due view instead: everything with no next
// step, never contacted, past its due date, or untouched for 14 days, already
// sorted by priority. This is what the weekly sweep calls.
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, search, due } = req.query;

  if (due === 'true' || due === '1') {
    try {
      const { rows } = await pool.query('SELECT * FROM partners_due');
      return res.json({ partners: rows, due_count: rows.length });
    } catch (err) {
      console.error('GET /api/partners?due=true error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

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
// GET /api/partners/due-count — Just the number, for the nav badge.
// Must stay above GET /:id or Express matches it as an id.
// ---------------------------------------------------------------------------
router.get('/due-count', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM partners_due');
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('GET /api/partners/due-count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/partners — Create new partner
// partner_type and next_step are required: a record with nothing to do next
// is how the first 20 sat untouched from April to August.
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const {
    business_name, location, contact_phone, website, contact_name, email,
    date_contacted, status, notes,
    partner_type, next_step, next_step_due, do_not_pitch, do_not_pitch_reason,
    referral_terms, owner_agent,
  } = req.body;

  if (!business_name) {
    return res.status(400).json({ error: 'business_name is required' });
  }
  if (!partner_type) {
    return res.status(400).json({ error: 'partner_type is required' });
  }
  const dnp = do_not_pitch === true || do_not_pitch === 'true';
  // Dealers and mobile techs are never pitched, so they are allowed in
  // without a next step as long as they are flagged do_not_pitch.
  if (!dnp && (!next_step || !next_step.trim())) {
    return res.status(400).json({ error: 'next_step is required (or mark the record do_not_pitch)' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO partners (business_name, location, contact_phone, website, contact_name, email,
                             date_contacted, status, notes, partner_type, next_step, next_step_due,
                             do_not_pitch, do_not_pitch_reason, referral_terms, owner_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, COALESCE($16, 'Terri'))
       RETURNING *`,
      [business_name, location || null, contact_phone || null, website || null,
       contact_name || null, email || null, date_contacted || null,
       status || 'new', notes || null, partner_type,
       next_step ? next_step.trim() : null, next_step_due || null,
       dnp, do_not_pitch_reason || null, referral_terms || null, owner_agent || null]
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
  const allowedFields = PARTNER_FIELDS;
  const updates = [];
  const values = [];
  let idx = 1;

  const NULLABLE_ON_BLANK = ['date_contacted', 'next_step_due', 'partner_type'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      let v = req.body[field];
      // An empty date or type input from the UI means "clear it", not ''.
      if (v === '' && NULLABLE_ON_BLANK.includes(field)) v = null;
      updates.push(`${field} = $${idx++}`);
      values.push(v);
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
// POST /api/partners/:id/activities — Log a contact.
// Rejects with 400 unless next_step and next_step_due are both present. That
// single rule is the whole fix: you cannot log a contact and walk away without
// saying what happens next. The partner_activities_sync trigger then moves the
// partner record forward on its own — date_contacted, next step, and status.
// /:id/activity is accepted as an alias.
// ---------------------------------------------------------------------------
async function logActivity(req, res) {
  const {
    activity_type, contact_date, summary, direction, outcome,
    next_step, next_step_due,
  } = req.body;

  if (!summary || !summary.trim()) {
    return res.status(400).json({ error: 'Summary is required' });
  }
  if (!next_step || !next_step.trim()) {
    return res.status(400).json({ error: 'next_step is required — say what happens next' });
  }
  if (!next_step_due) {
    return res.status(400).json({ error: 'next_step_due is required — say when it is due' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO partner_activities
         (partner_id, activity_type, contact_date, summary, created_by,
          direction, outcome, next_step, next_step_due)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.params.id, activity_type || 'note', contact_date || new Date(),
       summary.trim(), req.user?.id || null,
       direction || 'outbound', outcome || null,
       next_step.trim(), next_step_due]
    );
    // Return the partner too so the UI can repaint the header without refetching.
    const partner = await pool.query('SELECT * FROM partners WHERE id = $1', [req.params.id]);
    res.status(201).json({ activity: rows[0], partner: partner.rows[0] || null });
  } catch (err) {
    console.error('POST /api/partners/:id/activities error:', err);
    res.status(500).json({ error: err.message });
  }
}

router.post('/:id/activities', logActivity);
router.post('/:id/activity', logActivity);

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
