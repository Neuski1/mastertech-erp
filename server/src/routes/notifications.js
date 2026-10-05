// Notification center API. Mounted at /api/notifications behind requireAuth.
// Admin and service writer only: these are office alerts, not shop-floor ones.

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const { TYPES } = require('../services/notifications');

router.use(requireRole('admin', 'service_writer'));

// GET /api/notifications/count -> { open, urgent, latest_at }
// latest_at is the newest last_at among open items. The pop-up compares it to
// what this browser tab last dismissed, so a new or repeated alert pops again.
router.get('/count', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS open,
              COUNT(*) FILTER (WHERE severity = 'urgent')::int AS urgent,
              MAX(last_at) AS latest_at
         FROM notifications WHERE handled_at IS NULL`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /notifications/count error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications?status=open|handled&type=...&limit=...
router.get('/', async (req, res) => {
  try {
    const status = req.query.status === 'handled' ? 'handled' : 'open';
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const params = [];
    let where = status === 'handled' ? 'n.handled_at IS NOT NULL' : 'n.handled_at IS NULL';
    if (req.query.type && TYPES[req.query.type]) {
      params.push(req.query.type);
      where += ` AND n.type = $${params.length}`;
    }
    params.push(limit);
    const order = status === 'handled'
      ? 'n.handled_at DESC'
      : `CASE WHEN n.severity = 'urgent' THEN 0 ELSE 1 END, n.last_at DESC`;
    const { rows } = await pool.query(
      `SELECT n.*,
              NULLIF(TRIM(CONCAT(c.first_name, ' ', c.last_name)), '') AS customer_name,
              r.record_number,
              u.name AS handled_by_name
         FROM notifications n
         LEFT JOIN customers c ON c.id = n.customer_id
         LEFT JOIN records r ON r.id = n.record_id
         LEFT JOIN users u ON u.id = n.handled_by
        WHERE ${where}
        ORDER BY ${order}
        LIMIT $${params.length}`,
      params
    );
    const { rows: counts } = await pool.query(
      `SELECT type, COUNT(*)::int AS n FROM notifications WHERE handled_at IS NULL GROUP BY type`
    );
    res.json({
      status,
      notifications: rows.map(r => ({ ...r, type_label: (TYPES[r.type] || {}).label || r.type })),
      open_by_type: Object.fromEntries(counts.map(c => [c.type, c.n])),
      types: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.label])),
    });
  } catch (err) {
    console.error('GET /notifications error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/handled
router.patch('/:id/handled', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE notifications SET handled_at = NOW(), handled_by = $2
        WHERE id = $1 AND handled_at IS NULL RETURNING id`,
      [req.params.id, req.user.id]
    );
    res.json({ ok: true, updated: rows.length });
  } catch (err) {
    console.error('PATCH /notifications/:id/handled error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/reopen
// If an open one with the same dedupe key exists already, reopening would
// break the one-open-per-key rule, so the old one stays handled.
router.patch('/:id/reopen', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE notifications n SET handled_at = NULL, handled_by = NULL
        WHERE n.id = $1 AND n.handled_at IS NOT NULL
          AND (n.dedupe_key IS NULL OR NOT EXISTS (
                SELECT 1 FROM notifications o
                 WHERE o.dedupe_key = n.dedupe_key AND o.handled_at IS NULL))
        RETURNING id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'A newer open notification already covers this one.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /notifications/:id/reopen error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/handle-all { type? } -> marks every open one handled
router.post('/handle-all', async (req, res) => {
  try {
    const type = req.body && req.body.type && TYPES[req.body.type] ? req.body.type : null;
    const { rowCount } = await pool.query(
      `UPDATE notifications SET handled_at = NOW(), handled_by = $1
        WHERE handled_at IS NULL ${type ? 'AND type = $2' : ''}`,
      type ? [req.user.id, type] : [req.user.id]
    );
    res.json({ ok: true, updated: rowCount });
  } catch (err) {
    console.error('POST /notifications/handle-all error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
