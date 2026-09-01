const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// Marketing calendar. Rolling twelve months, six behind and six ahead.
//
// The ERP is the master. This replaced the marketing-calendar.md file Terri
// rebuilt on the last Monday of each month — the agents now read and write
// these rows through the API, so the calendar and the campaigns it schedules
// live in the same place and the response column can be filled from real data
// instead of retyped.
//
// Mounted with requireAuthOrApiKey: the browser uses a JWT, the marketing
// agents use the cowork API key.
// ---------------------------------------------------------------------------

// These must match the lists in client/src/pages/MarketingCalendar.js. Terri and
// Smile read them from GET /options, so drift here sends the agents bad values.
const CHANNELS = ['Email', 'Facebook', 'Instagram', 'YouTube', 'Google Ads', 'Partner', 'Website', 'Other'];
const STATUSES = ['draft', 'needs_photo', 'approved', 'posted', 'skipped'];
const OWNERS = ['Terri', 'Smile', 'Carol', 'SEO/GEO'];

function monthStart(value) {
  // Accepts '2026-09', '2026-09-01', or a Date. Returns 'YYYY-MM-01'.
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-01`;
}

function shiftMonth(isoMonth, delta) {
  const [y, m] = isoMonth.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function defaultWindow() {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  return { from: shiftMonth(current, -5), to: shiftMonth(current, 6) };
}

// ---------------------------------------------------------------------------
// GET /api/marketing-calendar?from=2026-03&to=2027-02
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const win = defaultWindow();
    const from = monthStart(req.query.from) || win.from;
    const to = monthStart(req.query.to) || win.to;

    const { rows } = await pool.query(
      `SELECT mc.*, c.name AS campaign_name, c.status AS campaign_status,
              r.record_number
       FROM marketing_calendar mc
       LEFT JOIN email_campaigns c ON c.id = mc.campaign_id
       LEFT JOIN records r ON r.id = mc.record_id
       WHERE mc.month BETWEEN $1 AND $2 AND mc.deleted_at IS NULL
       ORDER BY mc.month, mc.scheduled_date NULLS LAST, mc.id`,
      [from, to]
    );

    const { rows: notes } = await pool.query(
      'SELECT month, notes, rebuilt_at FROM marketing_calendar_months WHERE month BETWEEN $1 AND $2',
      [from, to]
    );
    const notesByMonth = {};
    for (const n of notes) notesByMonth[String(n.month).slice(0, 10)] = n;

    // Build every month in the window, empty ones included, so a month with no
    // activity reads as "nothing was planned" instead of silently vanishing.
    const months = [];
    let cursor = from;
    while (cursor <= to) {
      const key = cursor;
      months.push({
        month: key,
        notes: notesByMonth[key]?.notes || '',
        rebuilt_at: notesByMonth[key]?.rebuilt_at || null,
        rows: rows.filter(r => String(r.month).slice(0, 10) === key),
      });
      cursor = shiftMonth(cursor, 1);
    }

    res.json({ from, to, months });
  } catch (err) {
    console.error('Marketing calendar list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketing-calendar/options
// ---------------------------------------------------------------------------
router.get('/options', (req, res) => res.json({ channels: CHANNELS, statuses: STATUSES, owners: OWNERS }));

// ---------------------------------------------------------------------------
// GET /api/marketing-calendar/whoami — key check.
// First call an agent should make. Says which credential got it in, so a 401
// is never confused with a broken endpoint.
// ---------------------------------------------------------------------------
router.get('/whoami', (req, res) => res.json({
  ok: true,
  authenticated_as: req.agentName ? `${req.agentName} agent key` : `signed-in user (${req.user?.email || 'unknown'})`,
  can_write_calendar: true,
  can_approve: !req.isAgent,
}));

// ---------------------------------------------------------------------------
// POST /api/marketing-calendar — one row
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const month = monthStart(b.month) || monthStart(b.scheduled_date);
    if (!month) return res.status(400).json({ error: 'month or scheduled_date is required' });
    if (!b.piece) return res.status(400).json({ error: 'piece is required' });
    if (!b.channel) return res.status(400).json({ error: 'channel is required' });

    const { rows } = await pool.query(
      `INSERT INTO marketing_calendar
         (month, scheduled_date, date_note, channel, piece, owner, status, response,
          notes, campaign_id, record_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        month,
        b.scheduled_date || null,
        b.date_note || null,
        b.channel,
        b.piece,
        b.owner || null,
        b.status || 'planned',
        b.response || null,
        b.notes || null,
        b.campaign_id || null,
        b.record_id || null,
        req.user?.id || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Marketing calendar create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketing-calendar/import — bulk load, used by the agents
// Body: { rows: [...], replace_months: ['2026-09-01', ...] }
// ---------------------------------------------------------------------------
router.post('/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const incoming = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (incoming.length === 0) return res.status(400).json({ error: 'rows is required' });

    await client.query('BEGIN');

    // Optional: soft-clear the months being replaced so a rebuild does not
    // stack duplicates on top of last month's rows.
    const replace = (req.body.replace_months || []).map(monthStart).filter(Boolean);
    for (const m of replace) {
      await client.query('UPDATE marketing_calendar SET deleted_at = NOW() WHERE month = $1 AND deleted_at IS NULL', [m]);
    }

    const inserted = [];
    for (const b of incoming) {
      const month = monthStart(b.month) || monthStart(b.scheduled_date);
      if (!month || !b.piece || !b.channel) continue;
      const { rows } = await client.query(
        `INSERT INTO marketing_calendar
           (month, scheduled_date, date_note, channel, piece, owner, status, response,
            notes, campaign_id, record_id, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [
          month, b.scheduled_date || null, b.date_note || null, b.channel, b.piece,
          b.owner || null, b.status || 'planned', b.response || null, b.notes || null,
          b.campaign_id || null, b.record_id || null, req.user?.id || null,
        ]
      );
      inserted.push(rows[0].id);
    }

    for (const [month, notes] of Object.entries(req.body.month_notes || {})) {
      const m = monthStart(month);
      if (!m) continue;
      await client.query(
        `INSERT INTO marketing_calendar_months (month, notes, rebuilt_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (month) DO UPDATE SET notes = EXCLUDED.notes, rebuilt_at = NOW()`,
        [m, notes]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ inserted: inserted.length, replaced_months: replace });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Marketing calendar import error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/marketing-calendar/:id
// ---------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['month', 'scheduled_date', 'date_note', 'channel', 'piece', 'owner',
      'status', 'response', 'notes', 'campaign_id', 'record_id'];
    const fields = [];
    const params = [];
    let i = 1;
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      const value = key === 'month' ? monthStart(req.body[key]) : req.body[key];
      fields.push(`${key} = $${i++}`);
      params.push(value === '' ? null : value);
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    fields.push('updated_at = NOW()');
    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE marketing_calendar SET ${fields.join(', ')} WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Calendar row not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Marketing calendar update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/marketing-calendar/:id — soft delete, history matters here
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE marketing_calendar SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Calendar row not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/marketing-calendar/month/:month/notes
// ---------------------------------------------------------------------------
router.put('/month/:month/notes', async (req, res) => {
  try {
    const m = monthStart(req.params.month);
    if (!m) return res.status(400).json({ error: 'Bad month' });
    const { rows } = await pool.query(
      `INSERT INTO marketing_calendar_months (month, notes, rebuilt_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (month) DO UPDATE SET notes = EXCLUDED.notes, rebuilt_at = NOW()
       RETURNING *`,
      [m, req.body?.notes || '']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
