const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// Auto-create marketing_opt_out column if missing (runs once on first request)
let _colChecked = false;
async function ensureMarketingOptOutColumn() {
  if (_colChecked) return;
  try {
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN NOT NULL DEFAULT false');
  } catch { /* column likely already exists or permissions issue */ }
  _colChecked = true;
}

// ---------------------------------------------------------------------------
// GET /api/customers — CRM list with stats & filters
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const {
    search, limit = 50, page = 1,
    is_storage, has_open_records, last_service_from, last_service_to,
    unit_make, unit_model, city, zip, has_open_estimate,
  } = req.query;

  const conditions = ['c.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(`(
      c.last_name ILIKE $${idx} OR c.first_name ILIKE $${idx} OR
      c.company_name ILIKE $${idx} OR c.account_number ILIKE $${idx} OR
      c.phone_primary ILIKE $${idx} OR c.phone_secondary ILIKE $${idx} OR
      c.email_primary ILIKE $${idx} OR
      (c.first_name || ' ' || c.last_name) ILIKE $${idx}
    )`);
    params.push(`%${search}%`);
    idx++;
  }

  if (is_storage === 'true') {
    conditions.push('c.is_storage_customer = TRUE');
  } else if (is_storage === 'false') {
    conditions.push('c.is_storage_customer = FALSE');
  }

  if (city) {
    conditions.push(`c.address_city ILIKE $${idx}`);
    params.push(`%${city}%`);
    idx++;
  }

  if (zip) {
    conditions.push(`c.address_zip = $${idx}`);
    params.push(zip);
    idx++;
  }

  // Sub-query filters
  let havingClauses = [];

  if (has_open_records === 'true') {
    havingClauses.push("COUNT(CASE WHEN r.status NOT IN ('paid','void') AND r.deleted_at IS NULL THEN 1 END) > 0");
  }

  if (has_open_estimate === 'true') {
    havingClauses.push("COUNT(CASE WHEN r.status = 'estimate' AND r.deleted_at IS NULL THEN 1 END) > 0");
  }

  if (last_service_from) {
    havingClauses.push(`MAX(r.created_at) >= $${idx}`);
    params.push(last_service_from);
    idx++;
  }

  if (last_service_to) {
    havingClauses.push(`(MAX(r.created_at) IS NULL OR MAX(r.created_at) <= $${idx})`);
    params.push(last_service_to);
    idx++;
  }

  if (unit_make) {
    conditions.push(`EXISTS (SELECT 1 FROM units u2 WHERE u2.customer_id = c.id AND u2.make ILIKE $${idx} AND u2.deleted_at IS NULL)`);
    params.push(`%${unit_make}%`);
    idx++;
  }

  if (unit_model) {
    conditions.push(`EXISTS (SELECT 1 FROM units u2 WHERE u2.customer_id = c.id AND u2.model ILIKE $${idx} AND u2.deleted_at IS NULL)`);
    params.push(`%${unit_model}%`);
    idx++;
  }

  const havingSQL = havingClauses.length > 0
    ? `HAVING ${havingClauses.join(' AND ')}`
    : '';

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Count query
    const countSQL = `
      SELECT COUNT(*) FROM (
        SELECT c.id
        FROM customers c
        LEFT JOIN records r ON r.customer_id = c.id
        WHERE ${conditions.join(' AND ')}
        GROUP BY c.id
        ${havingSQL}
      ) sub`;
    const countRes = await pool.query(countSQL, params);
    const total = parseInt(countRes.rows[0].count);

    // Data query
    const dataSQL = `
      SELECT c.id, c.account_number, c.first_name, c.last_name, c.company_name,
             c.phone_primary, c.phone_secondary, c.email_primary, c.address_city, c.address_state,
             c.address_zip, c.is_storage_customer, c.lead_source,
             COUNT(DISTINCT u.id) FILTER (WHERE u.deleted_at IS NULL) AS unit_count,
             COUNT(DISTINCT r.id) FILTER (WHERE r.deleted_at IS NULL) AS record_count,
             MAX(r.created_at) FILTER (WHERE r.deleted_at IS NULL) AS last_service_date,
             COUNT(CASE WHEN r.status NOT IN ('paid','void') AND r.deleted_at IS NULL THEN 1 END) AS open_record_count
      FROM customers c
      LEFT JOIN units u ON u.customer_id = c.id
      LEFT JOIN records r ON r.customer_id = c.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY c.id
      ${havingSQL}
      ORDER BY c.last_name, c.first_name
      LIMIT $${idx++} OFFSET $${idx++}`;

    const { rows } = await pool.query(dataSQL, [...params, parseInt(limit), offset]);

    res.json({ customers: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('GET /api/customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/customers — Create a new customer
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const { first_name, last_name, company_name, phone_primary, phone_secondary, email_primary,
          address_street, address_city, address_state, address_zip } = req.body;

  if (!last_name) {
    return res.status(400).json({ error: 'last_name is required' });
  }

  try {
    // Generate next account number
    const numRes = await pool.query(
      "SELECT account_number FROM customers WHERE account_number ~ '^[0-9]+$' ORDER BY account_number::int DESC LIMIT 1"
    );
    const nextNum = numRes.rows.length > 0 ? parseInt(numRes.rows[0].account_number) + 1 : 1001;
    const accountNumber = String(nextNum);

    const { rows } = await pool.query(
      `INSERT INTO customers (account_number, first_name, last_name, company_name,
         phone_primary, phone_secondary, email_primary, address_street, address_city, address_state, address_zip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [accountNumber, first_name || null, last_name, company_name || null,
       phone_primary || null, phone_secondary || null, email_primary || null, address_street || null,
       address_city || null, address_state || null, address_zip || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id — Full customer detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id/units
// ---------------------------------------------------------------------------
router.get('/:id/units', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY year DESC, make, model',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id/records — All records for a customer
// ---------------------------------------------------------------------------
router.get('/:id/records', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.record_number, r.status, r.amount_due, r.total_sales,
              r.created_at, r.job_description,
              u.year, u.make, u.model
       FROM records r
       JOIN units u ON u.id = r.unit_id
       WHERE r.customer_id = $1 AND r.deleted_at IS NULL
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id/storage — Active storage for a customer
// ---------------------------------------------------------------------------
router.get('/:id/storage', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.*, ss.space_number, ss.space_type,
              u.year, u.make, u.model
       FROM storage_billing sb
       JOIN storage_spaces ss ON ss.id = sb.space_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.customer_id = $1 AND sb.ended_at IS NULL
       ORDER BY ss.space_number`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/customers/:id — Update customer fields
// ---------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  await ensureMarketingOptOutColumn();
  const allowedFields = [
    'first_name', 'last_name', 'company_name', 'phone_primary', 'phone_secondary',
    'email_primary', 'email_secondary', 'address_street', 'address_city',
    'address_state', 'address_zip', 'tax_exempt', 'notes', 'marketing_opt_out',
    'email_invalid', 'sms_opt_out',
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

  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updated = rows[0];

    // If admin re-opts customer into marketing, remove from unsubscribe list
    if (req.body.marketing_opt_out === false && updated.email_primary) {
      try {
        await pool.query('DELETE FROM email_unsubscribes WHERE LOWER(email) = $1', [updated.email_primary.toLowerCase()]);
        await pool.query('UPDATE customers SET email_opt_out_date = NULL WHERE id = $1', [req.params.id]);
      } catch { /* table may not exist */ }
    }
    // If admin sets opt-out, record the date
    if (req.body.marketing_opt_out === true) {
      try {
        await pool.query('UPDATE customers SET email_opt_out_date = NOW() WHERE id = $1', [req.params.id]);
      } catch { /* column may not exist */ }
    }
    // Track SMS opt-out date
    if (req.body.sms_opt_out === true) {
      try { await pool.query('UPDATE customers SET sms_opt_out_date = NOW() WHERE id = $1', [req.params.id]); } catch { /* column may not exist */ }
    }
    if (req.body.sms_opt_out === false) {
      try { await pool.query('UPDATE customers SET sms_opt_out_date = NULL WHERE id = $1', [req.params.id]); } catch { /* column may not exist */ }
    }
    // If admin clears email_invalid, clear the date too
    if (req.body.email_invalid === false) {
      try {
        await pool.query('UPDATE customers SET email_invalid_date = NULL WHERE id = $1', [req.params.id]);
      } catch { /* column may not exist */ }
    }

    // Re-fetch to get updated dates
    const { rows: fresh } = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    res.json(fresh[0] || updated);
  } catch (err) {
    console.error('PATCH /api/customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/customers/:id/merge — Merge duplicate into master
// ---------------------------------------------------------------------------
router.post('/:id/merge', async (req, res) => {
  const masterId = parseInt(req.params.id);
  const { duplicateId, keepFields } = req.body;

  if (!duplicateId) {
    return res.status(400).json({ error: 'duplicateId is required' });
  }
  if (masterId === parseInt(duplicateId)) {
    return res.status(400).json({ error: 'Cannot merge a customer with themselves' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify both customers exist
    const masterRes = await client.query(
      'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL', [masterId]
    );
    if (masterRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Master customer not found' });
    }

    const dupRes = await client.query(
      'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL', [duplicateId]
    );
    if (dupRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Duplicate customer not found' });
    }

    // Step 1: Update master with chosen fields from duplicate
    if (keepFields && Object.keys(keepFields).length > 0) {
      const allowedFields = [
        'first_name', 'last_name', 'company_name', 'phone_primary', 'phone_secondary',
        'email_primary', 'email_secondary', 'address_street', 'address_city',
        'address_state', 'address_zip', 'notes',
      ];
      const updates = [];
      const values = [];
      let idx = 1;
      for (const [field, value] of Object.entries(keepFields)) {
        if (allowedFields.includes(field)) {
          updates.push(`${field} = $${idx++}`);
          values.push(value);
        }
      }
      if (updates.length > 0) {
        values.push(masterId);
        await client.query(
          `UPDATE customers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
          values
        );
      }
    }

    // Step 2: Reassign all related records using SAVEPOINTs
    // (PostgreSQL aborts the whole transaction on any error,
    //  so we use savepoints to isolate optional table updates)
    const reassignTables = [
      'units', 'records', 'appointments', 'storage_billing',
      'communication_log', 'marketing_contacts', 'leads',
      'email_campaign_recipients', 'email_unsubscribes',
      'payments', 'storage_charges',
    ];

    const counts = {};
    for (const table of reassignTables) {
      try {
        await client.query(`SAVEPOINT sp_${table}`);
        const result = await client.query(
          `UPDATE ${table} SET customer_id = $1 WHERE customer_id = $2`,
          [masterId, duplicateId]
        );
        counts[table] = result.rowCount;
        await client.query(`RELEASE SAVEPOINT sp_${table}`);
      } catch (e) {
        await client.query(`ROLLBACK TO SAVEPOINT sp_${table}`);
        counts[table] = 0;
        console.log(`Merge: ${table} skipped (${e.message})`);
      }
    }

    // Deduplicate campaign recipients (keep earliest per campaign+email)
    try {
      await client.query('SAVEPOINT sp_dedup');
      await client.query(
        `DELETE FROM email_campaign_recipients WHERE id NOT IN (
          SELECT MIN(id) FROM email_campaign_recipients GROUP BY campaign_id, email
        )`
      );
      await client.query('RELEASE SAVEPOINT sp_dedup');
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT sp_dedup');
    }

    // Step 2b: Catch any remaining FK references dynamically
    const { rows: fkRefs } = await client.query(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.table_constraints tc2 ON rc.unique_constraint_name = tc2.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc2.table_name = 'customers' AND tc.table_schema = 'public'
    `);
    for (const ref of fkRefs) {
      try {
        await client.query(`SAVEPOINT sp_fk_${ref.table_name}`);
        await client.query(
          `UPDATE ${ref.table_name} SET ${ref.column_name} = $1 WHERE ${ref.column_name} = $2`,
          [masterId, duplicateId]
        );
        await client.query(`RELEASE SAVEPOINT sp_fk_${ref.table_name}`);
      } catch (e) {
        await client.query(`ROLLBACK TO SAVEPOINT sp_fk_${ref.table_name}`);
        console.log(`Merge FK: ${ref.table_name}.${ref.column_name} skipped (${e.message})`);
      }
    }

    // Step 3: Hard delete the duplicate
    await client.query('DELETE FROM customers WHERE id = $1', [duplicateId]);

    await client.query('COMMIT');

    // Step 4: Return updated master
    const updatedRes = await client.query(
      'SELECT * FROM customers WHERE id = $1', [masterId]
    );

    res.json({
      customer: updatedRes.rows[0],
      merged: {
        units: counts.units || 0,
        records: counts.records || 0,
        appointments: counts.appointments || 0,
        storage: counts.storage_billing || 0,
        communications: counts.communication_log || 0,
        marketing: counts.marketing_contacts || 0,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/customers/:id/merge error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/customers/:id — Soft delete customer (admin only)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    // Check for active records
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM records WHERE customer_id = $1 AND deleted_at IS NULL AND status NOT IN ('void', 'paid')`,
      [req.params.id]
    );
    const activeCount = parseInt(countRows[0].count);
    if (activeCount > 0) {
      return res.status(400).json({
        error: `Cannot delete — this customer has ${activeCount} active record${activeCount > 1 ? 's' : ''}. Void or complete all records first.`,
      });
    }

    // Soft delete customer
    const { rows } = await pool.query(
      `UPDATE customers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, first_name, last_name`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Soft delete associated units
    await pool.query(
      'UPDATE units SET deleted_at = NOW() WHERE customer_id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    res.json({ success: true, customer: rows[0] });
  } catch (err) {
    console.error('DELETE /api/customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id/documents — List customer documents (metadata only)
// ---------------------------------------------------------------------------
router.get('/:id/documents', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, doc_type, title, mime_type, file_size, related_id, created_at
       FROM customer_documents WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/customers/:id/documents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/customers/:id/documents/:docId/download — Download a document
// ---------------------------------------------------------------------------
router.get('/:id/documents/:docId/download', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT title, file_data, mime_type FROM customer_documents WHERE id = $1 AND customer_id = $2`,
      [req.params.docId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Document not found' });
    const doc = rows[0];
    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.title.replace(/[^a-zA-Z0-9._\- ]/g, '')}.pdf"`);
    res.send(doc.file_data);
  } catch (err) {
    console.error('GET /api/customers/:id/documents/:docId/download error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
