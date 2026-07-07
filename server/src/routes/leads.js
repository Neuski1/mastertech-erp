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
        'SELECT id FROM customers WHERE LOWER(email_primary) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
        [email]
      );
      if (rows.length > 0) customerId = rows[0].id;
    }
    if (!customerId && phone) {
      const { rows } = await client.query(
        "SELECT id FROM customers WHERE regexp_replace(COALESCE(phone_primary,''), '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g') AND regexp_replace($1,'[^0-9]','','g') <> '' AND deleted_at IS NULL LIMIT 1",
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

    // Document the request on the customer record immediately, so it is never
    // lost even if the lead is later converted and that record is deleted.
    if (message && message.trim() && customerId) {
      const when = new Date().toLocaleDateString('en-US', { timeZone: 'America/Denver' });
      const contact = [phone, email].filter(Boolean).join(', ');
      const note = `[Lead ${when} via ${source}] ${message.trim()}` + (contact ? ` | Contact: ${contact}` : '');
      await client.query(
        "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 WHEN position($1 in notes) > 0 THEN notes ELSE notes || CHR(10) || $1 END WHERE id = $2",
        [note, customerId]
      );
    }

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
    const archived = req.query.archived === 'true' || req.query.archived === '1';
    const { rows } = await pool.query(
      `SELECT l.*, c.first_name AS customer_first, c.last_name AS customer_last,
              r.record_number AS record_number, r.status AS record_status,
              (r.id IS NOT NULL AND r.deleted_at IS NULL) AS record_open,
              COALESCE(lc.contacts, '[]'::json) AS contacts
       FROM leads l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN records r ON r.id = l.record_id
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object('id', x.id, 'contacted_at', x.contacted_at, 'note', x.note)
                         ORDER BY x.contacted_at DESC) AS contacts
           FROM lead_contacts x WHERE x.lead_id = l.id
       ) lc ON true
       WHERE l.deleted_at IS ${archived ? 'NOT NULL' : 'NULL'}
       ORDER BY ${archived ? 'l.deleted_at' : 'l.created_at'} DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — Update lead status and/or contacted_at (staff only)
router.patch('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { status } = req.body;
  const hasStatus = status !== undefined;
  const hasContactedAt = Object.prototype.hasOwnProperty.call(req.body, 'contacted_at');

  if (!hasStatus && !hasContactedAt) {
    return res.status(400).json({ error: 'status or contacted_at is required' });
  }
  if (hasStatus && !VALID_LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_LEAD_STATUSES.join(', ')}` });
  }

  const sets = [];
  const params = [];
  if (hasStatus) {
    params.push(status);
    sets.push(`status = $${params.length}`);
  }
  if (hasContactedAt) {
    params.push(req.body.contacted_at);
    sets.push(`contacted_at = $${params.length}`);
  }
  params.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE leads SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/contact — Log a call/contact with an optional note (staff only).
// Appends to lead_contacts (a running history) and refreshes the lead summary.
router.post('/:id/contact', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { contacted_at, note } = req.body || {};
  try {
    const when = contacted_at || new Date().toISOString();
    const { rows } = await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, created_by)
       VALUES ($1, $2, $3, $4) RETURNING id, contacted_at, note`,
      [req.params.id, when, (note || '').trim() || null, req.user.id]
    );
    await pool.query(
      `UPDATE leads
          SET contacted_at = $1,
              status = CASE WHEN status = 'new' THEN 'contacted'::lead_status_type ELSE status END
        WHERE id = $2`,
      [when, req.params.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/leads/:id/contact error:', err);
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

    // Carry the lead's call history into the customer record so it isn't lost.
    if (lead.customer_id) {
      const { rows: cts } = await client.query(
        'SELECT contacted_at, note FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at',
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          return `[Call ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, lead.customer_id]
        );
      }
    }

    await client.query(
      "UPDATE leads SET record_id = $1, status = 'converted', deleted_at = NOW() WHERE id = $2",
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

// POST /api/leads/:id/file — File a lead's info onto the customer record and remove from the box (staff only)
router.post('/:id/file', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
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

    // The staff member may have picked an existing customer to file under.
    const chosenCustomerId = req.body && req.body.customer_id ? req.body.customer_id : null;
    const targetCustomerId = chosenCustomerId || lead.customer_id;

    const when = new Date(lead.created_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    const contact = [lead.phone, lead.email].filter(Boolean).join(', ');
    const note = `[Lead ${when} via ${lead.source || 'website'}]` + (lead.message ? ` ${lead.message}` : '') + (contact ? ` | Contact: ${contact}` : '');

    if (targetCustomerId) {
      await client.query(
        "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 WHEN position($1 in notes) > 0 THEN notes ELSE notes || CHR(10) || $1 END WHERE id = $2",
        [note, targetCustomerId]
      );
      const { rows: cts } = await client.query(
        'SELECT contacted_at, note FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at',
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          return `[Call ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, targetCustomerId]
        );
      }
    }

    await client.query(
      'UPDATE leads SET deleted_at = NOW() WHERE id = $1',
      [lead.id]
    );

    // DEDUPE: if the lead was filed under a different (existing) customer than
    // the one it was auto-attached to, and the original attached customer is a
    // bare auto-created stub (created from a website lead, with no records,
    // units, or other live leads), soft-delete that stub.
    if (
      chosenCustomerId &&
      lead.customer_id &&
      String(chosenCustomerId) !== String(lead.customer_id)
    ) {
      const { rows: stubRows } = await client.query(
        'SELECT id, lead_source FROM customers WHERE id = $1 AND deleted_at IS NULL',
        [lead.customer_id]
      );
      if (stubRows.length > 0 && stubRows[0].lead_source !== null) {
        const { rows: recCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM records WHERE customer_id = $1 AND deleted_at IS NULL',
          [lead.customer_id]
        );
        const { rows: unitCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM units WHERE customer_id = $1 AND deleted_at IS NULL',
          [lead.customer_id]
        );
        const { rows: leadCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM leads WHERE customer_id = $1 AND id <> $2 AND deleted_at IS NULL',
          [lead.customer_id, lead.id]
        );
        if (recCount[0].n === 0 && unitCount[0].n === 0 && leadCount[0].n === 0) {
          await client.query(
            'UPDATE customers SET deleted_at = NOW() WHERE id = $1',
            [lead.customer_id]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ filed: true, customer_id: targetCustomerId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads/:id/file error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
