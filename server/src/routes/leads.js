const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// POST /api/leads — Website lead intake
// Matches existing customer by email/phone or creates new one, creates stub record
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

    // Create a stub unit (website leads don't always specify a unit)
    const { rows: unitRows } = await client.query(
      `INSERT INTO units (customer_id) VALUES ($1) RETURNING id`,
      [customerId]
    );
    const unitId = unitRows[0].id;

    // Create stub record (estimate)
    const numRes = await client.query(
      'SELECT COALESCE(MAX(record_number), 0) + 1 AS next_num FROM records'
    );
    const recordNumber = numRes.rows[0].next_num;

    const { rows: recRows } = await client.query(
      `INSERT INTO records (record_number, customer_id, unit_id, status, job_description, tax_rate)
       VALUES ($1, $2, $3, 'estimate', $4, 0.0975) RETURNING id`,
      [recordNumber, customerId, unitId, message || 'Website inquiry']
    );
    const recordId = recRows[0].id;

    // Log the lead
    const { rows: leadRows } = await client.query(
      `INSERT INTO leads (customer_id, record_id, name, phone, email, message, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customerId, recordId, name, phone || null, email || null, message || null, source]
    );

    await client.query('COMMIT');

    res.status(201).json({
      lead: leadRows[0],
      customer_id: customerId,
      record_id: recordId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/leads — List leads
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, c.first_name AS customer_first, c.last_name AS customer_last
       FROM leads l
       LEFT JOIN customers c ON c.id = l.customer_id
       ORDER BY l.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
