const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// POST /api/marketing/log-campaign — Log a campaign against multiple customers
// Body: { customer_ids: [1,2,3], campaign_name, channel, notes }
// ---------------------------------------------------------------------------
router.post('/log-campaign', requireRole('admin', 'service_writer'), async (req, res) => {
  const { customer_ids, campaign_name, channel, notes } = req.body;

  if (!customer_ids || !customer_ids.length || !campaign_name) {
    return res.status(400).json({ error: 'customer_ids array and campaign_name are required' });
  }

  const loggedBy = req.user.id;

  try {
    const values = customer_ids.map((cid, i) => {
      const base = i * 5;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    }).join(', ');

    const params = customer_ids.flatMap(cid => [cid, campaign_name, channel || null, notes || null, loggedBy]);

    await pool.query(
      `INSERT INTO marketing_contacts (customer_id, campaign_name, channel, notes, logged_by)
       VALUES ${values}`,
      params
    );

    res.status(201).json({ message: `Campaign logged for ${customer_ids.length} customers` });
  } catch (err) {
    console.error('POST /api/marketing/log-campaign error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketing/customer/:customerId — Get marketing log for a customer
// ---------------------------------------------------------------------------
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mc.*, u.name AS logged_by_name
       FROM marketing_contacts mc
       LEFT JOIN users u ON u.id = mc.logged_by
       WHERE mc.customer_id = $1
       ORDER BY mc.created_at DESC`,
      [req.params.customerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketing/note — Add a single marketing note for a customer
// ---------------------------------------------------------------------------
router.post('/note', requireRole('admin', 'service_writer'), async (req, res) => {
  const { customer_id, channel, notes } = req.body;

  if (!customer_id || !notes) {
    return res.status(400).json({ error: 'customer_id and notes are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO marketing_contacts (customer_id, channel, notes, logged_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_id, channel || 'Note', notes, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
