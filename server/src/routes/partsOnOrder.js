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
         AND pl.order_status IN ('ordered','not_ordered','backordered')
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

module.exports = router;
