const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');

const STAFF_ROLES = ['admin', 'service_writer', 'bookkeeper', 'technician'];
const VALID_LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'converted'];

// ---------------------------------------------------------------------------
// POST /api/leads — Website lead intake (PUBLIC, no auth)
// Matches existing customer by email/phone or creates new one, then logs the
// lead with record_id = NULL. No stub unit/record is created anymore; staff
// decide what to do with the lead from the Records page.
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const { name, phone, email, message, source = 'website' } = req.body;

  if (!name && !email && !phone) {
    return res.status(400).json({ error: 'At least name, email, or phone is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Try to match existing customer by email or phone
    let customerId = null;
    if (email) {
      const { rows } = await client.query(
        'SELECT id FROM customers WHERE email_primary = $1 AND deleted_at IS NULL LIMIT 1',
        [email]
      );
      if (rows.length > 0) customerId = rows[0].id;
    }
    if (!customerId && phone) {
      const { rows } = await client.query(
        'SELECT id FROM customers WHERE phone_primary = $1 AND deleted_at IS NULL LIMIT 1',
        [phone]
      );
      if (rows.length > 0) customerId = rows[0].id;
    }

    // Create new customer if no match
    if (!customerId) {
      const nameParts = (name || '').trim().split(/\s+/);
      const lastName = nameParts.pop() || 'Unknown';
      const firstName = nameParts.join(' ') || null;

      // Generate account number
      const acctRes = await client.query(
        "SELECT COALESCE(MAX(CAST(account_number AS INTEGER)), 0) + 1 AS next FROM customers WHERE account_number ~ '^[0-9]+$'"
      );
      const accountNumber = String(acctRes.rows[0].next);

      const { rows } = await client.query(
        `INSERT INTO customers (account_number, first_name, last_name, phone_primary, email_primary, lead_source)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [accountNumber, firstName, lastName, phone || null, email || null, source]
      );
      customerId = rows[0].id;
    }

    // Log the lead — no stub unit/record; record_id stays NULL until staff act.
    const { rows: leadRows } = await client.query(
      `INSERT INTO leads (customer_id, record_id, name, phone, email, message, source)
       VALUES ($1, NULL, $2, $3, $4, $5, $6) RETURNING *`,
      [customerId, name, phone || null, email || null, message || null, source]
    );

    await client.query('COMMIT');

    res.status(201).json({
      lead: leadRows[0],
      customer_id: customerId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/leads — List non-deleted leads (staff only)
router.get('/', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, c.first_name AS customer_first, c.last_name AS customer_last,
              r.record_number AS record_number, r.status AS record_status
       FROM leads l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN records r ON r.id = l.record_id
       WHERE l.deleted_at IS NULL
       ORDER BY l.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — Update lead status (staff only)
router.patch('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { status } = req.body;
  if (!VALID_LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_LEAD_STATUSES.join(', ')}` });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Soft-delete a lead (staff only)
router.delete('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE leads SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/create-estimate — Build an estimate record from a lead (staff only)
router.post('/:id/create-estimate', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: leadRows } = await client.query(
      'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (leadRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = leadRows[0];

    // Find an existing unit for the customer, else create a stub unit.
    let unitId = null;
    const { rows: unitRows } = await client.query(
      'SELECT id FROM units WHERE customer_id = $1 ORDER BY id LIMIT 1',
      [lead.customer_id]
    );
    if (unitRows.length > 0) {
      unitId = unitRows[0].id;
    } else {
      const { rows: newUnit } = await client.query(
        'INSERT INTO units (customer_id) VALUES ($1) RETURNING id',
        [lead.customer_id]
      );
      unitId = newUnit[0].id;
    }

    // Next record number
    const numRes = await client.query(
      'SELECT COALESCE(MAX(record_number), 0) + 1 AS next_num FROM records'
    );
    const recordNumber = numRes.rows[0].next_num;

    const { rows: recRows } = await client.query(
      `INSERT INTO records (record_number, customer_id, unit_id, status, job_description, tax_rate)
       VALUES ($1, $2, $3, 'estimate', $4, 0.0975) RETURNING id`,
      [recordNumber, lead.customer_id, unitId, lead.message || 'Website inquiry']
    );
    const recordId = recRows[0].id;

    await client.query(
      "UPDATE leads SET record_id = $1, status = 'converted' WHERE id = $2",
      [recordId, lead.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ record_id: recordId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads/:id/create-estimate error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
