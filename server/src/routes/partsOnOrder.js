const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// Records whose parts we still care about chasing. Excludes closed
// (paid/void), estimate/lead, and "filed" (job parked unless the customer
// brings it back).
const OPEN_RECORD = "r.status NOT IN ('paid','void','estimate','lead','filed')";

// ---------------------------------------------------------------------------
// GET /api/parts-on-order — every part line still on order across open jobs
// ---------------------------------------------------------------------------
router.get('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         pl.id,
         pl.record_id,
         r.record_number,
         r.status AS record_status,
         c.id AS customer_id,
         TRIM(COALESCE(c.first_name,'') || ' ' || COALESCE(c.last_name,'')) AS customer_name,
         c.company_name,
         pl.description,
         pl.part_number,
         pl.quantity,
         pl.order_status,
         pl.po_number,
         pl.order_supplier,
         pl.order_number,
         pl.order_tracking,
         pl.order_eta,
         pl.order_date,
         pl.order_confirmed_at,
         (CURRENT_DATE - pl.order_date) AS days_since_ordered,
         (CURRENT_DATE - COALESCE(pl.order_date, r.intake_date, r.created_at::date)) AS days_waiting
       FROM record_parts_lines pl
       JOIN records r ON r.id = pl.record_id
       JOIN customers c ON c.id = r.customer_id
       WHERE pl.deleted_at IS NULL
         AND pl.is_estimate_line IS NOT TRUE
         AND COALESCE(pl.order_status,
                      CASE WHEN pl.is_inventory_part = TRUE AND pl.inventory_id IS NOT NULL
                           THEN 'inventory' ELSE 'not_ordered' END)
             IN ('ordered','not_ordered','backordered')
         AND r.deleted_at IS NULL
         AND ${OPEN_RECORD}
       ORDER BY days_waiting DESC, r.record_number`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET parts-on-order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/parts-on-order/unmatched-emails — parsed supplier emails that could
// not be auto-matched to a part line (populated by the email cron; safe to
// return empty until that ships).
// ---------------------------------------------------------------------------
router.get('/unmatched-emails', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, gmail_msg_id, received_at, from_addr, subject, parsed_po, parsed_json
         FROM order_email_log
        WHERE match_status = 'unmatched'
        ORDER BY received_at DESC NULLS LAST
        LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    // Table may not exist yet on first boot before the migration runs.
    console.error('GET unmatched-emails error:', err.message);
    res.json([]);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/parts-on-order/emails/:id/dismiss — clear a junk / non-PO email
// so it stops showing in the unmatched list.
// ---------------------------------------------------------------------------
router.patch('/emails/:id/dismiss', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE order_email_log SET match_status = 'dismissed' WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Email not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('dismiss email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/parts-on-order/emails/:id/match — link an order email to a part
// line above. Marks the email matched (clears it from the list) and advances
// the part to "ordered", filling the supplier order # from the email if blank.
// ---------------------------------------------------------------------------
router.post('/emails/:id/match', requireRole('admin', 'service_writer'), async (req, res) => {
  const { line_id } = req.body || {};
  if (!line_id) return res.status(400).json({ error: 'line_id is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const em = await client.query('SELECT id, parsed_po FROM order_email_log WHERE id = $1', [req.params.id]);
    if (!em.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Email not found' }); }
    const line = await client.query('SELECT id FROM record_parts_lines WHERE id = $1 AND deleted_at IS NULL', [line_id]);
    if (!line.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Part line not found' }); }

    const parsedPo = em.rows[0].parsed_po;
    await client.query(
      "UPDATE order_email_log SET match_status = 'matched', matched_line_id = $1 WHERE id = $2",
      [line_id, req.params.id]
    );
    await client.query(
      `UPDATE record_parts_lines
          SET order_status = CASE WHEN order_status = 'received' THEN order_status ELSE 'ordered' END,
              order_confirmed_at = COALESCE(order_confirmed_at, NOW()),
              order_number = COALESCE(NULLIF(order_number, ''), $2),
              updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL`,
      [line_id, parsedPo || null]
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('match email error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
