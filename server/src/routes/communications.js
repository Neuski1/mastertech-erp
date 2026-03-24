const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// POST /api/communications — Log a new communication entry (append-only)
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  const {
    customer_id, record_id, channel, trigger_event,
    message_content, delivery_status, is_manual, sent_by_user_id
  } = req.body;

  if (!customer_id || !channel || !trigger_event || !message_content) {
    return res.status(400).json({
      error: 'customer_id, channel, trigger_event, and message_content are required'
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO communication_log
         (customer_id, record_id, channel, trigger_event, message_content,
          delivery_status, is_manual, sent_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        customer_id,
        record_id || null,
        channel,
        trigger_event,
        message_content,
        delivery_status || 'sent',
        is_manual !== undefined ? is_manual : true,
        sent_by_user_id || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/communications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/communications/customer/:customerId — Comm history for a customer
// ---------------------------------------------------------------------------
router.get('/customer/:customerId', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM communication_log WHERE customer_id = $1',
      [req.params.customerId]
    );

    const { rows } = await pool.query(
      `SELECT cl.*,
              r.record_number,
              u.name AS sent_by_name
       FROM communication_log cl
       LEFT JOIN records r ON r.id = cl.record_id
       LEFT JOIN users u ON u.id = cl.sent_by_user_id
       WHERE cl.customer_id = $1
       ORDER BY cl.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.customerId, parseInt(limit), offset]
    );

    res.json({
      entries: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/communications/customer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/communications/record/:recordId — Comm history for a record
// ---------------------------------------------------------------------------
router.get('/record/:recordId', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM communication_log WHERE record_id = $1',
      [req.params.recordId]
    );

    const { rows } = await pool.query(
      `SELECT cl.*,
              c.last_name, c.first_name,
              u.name AS sent_by_name
       FROM communication_log cl
       JOIN customers c ON c.id = cl.customer_id
       LEFT JOIN users u ON u.id = cl.sent_by_user_id
       WHERE cl.record_id = $1
       ORDER BY cl.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.recordId, parseInt(limit), offset]
    );

    res.json({
      entries: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/communications/record error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
