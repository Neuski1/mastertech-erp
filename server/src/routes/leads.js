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
// Recovers a full email address from free text (used when the inbound lead
// agent truncates the address, e.g. stores "jean.clappier" instead of the
// full "jean.clappier@gmail.com" that appears in the message body).
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

// ---------------------------------------------------------------------------
// Pull the RV out of a website lead message. Mirrors client/src/utils/parseLead
// so the server can fill the unit even when the caller sends nothing.
//   RV: 2024 Nash 17k | Length: 20 ft | Services: ... | Issue: ...
// ---------------------------------------------------------------------------
function parseLeadRv(msg) {
  const out = { year: null, make: null, model: null, linear_feet: null };
  if (!msg) return out;
  const field = (label) => {
    const m = String(msg).match(new RegExp(label + '\\s*:\\s*([^|]*)(?:\\||$)', 'i'));
    return m ? m[1].trim() : '';
  };
  const raw = field('RV');
  const len = (field('Length').match(/\d+(\.\d+)?/) || [null])[0];
  if (len) out.linear_feet = parseFloat(len);
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (/^(19|20)\d{2}$/.test(parts[0] || '')) {
      out.year = parseInt(parts[0], 10);
      out.make = parts[1] || null;
      out.model = parts.slice(2).join(' ') || null;
    } else {
      out.make = parts[0] || null;
      out.model = parts.slice(1).join(' ') || null;
    }
  }
  return out;
}

const norm = (v) => String(v == null ? '' : v).trim().toLowerCase();

// Save the RV from a lead onto the customer record. Never creates a duplicate:
// an existing unit with the same make/model (and a non-conflicting year) is
// backfilled instead, and a bare stub unit is filled in rather than added to.
// Returns { unit_id, unit_action } where action is created | updated | matched.
async function saveLeadUnit(client, customerId, rv) {
  const hasData = rv && (rv.year || rv.make || rv.model || rv.linear_feet);
  if (!customerId || !hasData) return { unit_id: null, unit_action: 'none' };

  const { rows: units } = await client.query(
    'SELECT id, year, make, model, linear_feet FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY id',
    [customerId]
  );

  const match = units.find((u) => {
    if (!norm(u.make) && !norm(u.model)) return false;
    const makeOk = !rv.make || !norm(u.make) || norm(u.make) === norm(rv.make);
    const modelOk = !rv.model || !norm(u.model) || norm(u.model) === norm(rv.model);
    const yearOk = !rv.year || !u.year || Number(u.year) === Number(rv.year);
    return makeOk && modelOk && yearOk;
  });

  // A stub unit is one create-estimate or an earlier lead left behind: no
  // identifying detail at all. Fill it rather than stacking a second RV.
  const stub = units.find((u) => !u.year && !norm(u.make) && !norm(u.model) && !u.linear_feet);

  const target = match || stub;
  if (target) {
    const { rows } = await client.query(
      `UPDATE units
          SET year = COALESCE(year, $1),
              make = COALESCE(NULLIF(make, ''), $2),
              model = COALESCE(NULLIF(model, ''), $3),
              linear_feet = COALESCE(linear_feet, $4)
        WHERE id = $5
        RETURNING id`,
      [rv.year || null, rv.make || null, rv.model || null, rv.linear_feet || null, target.id]
    );
    return { unit_id: rows[0].id, unit_action: match ? 'matched' : 'updated' };
  }

  const { rows } = await client.query(
    'INSERT INTO units (customer_id, year, make, model, linear_feet) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [customerId, rv.year || null, rv.make || null, rv.model || null, rv.linear_feet || null]
  );
  return { unit_id: rows[0].id, unit_action: 'created' };
}

router.post('/', async (req, res) => {
  const { name, phone, message, source = 'website' } = req.body;
  let email = (req.body.email || '').trim();
  // If the provided email is missing or not a full address, try to pull a
  // valid one out of the message body before we store or match on it.
  if (!email || !email.includes('@')) {
    const m = (message || '').match(EMAIL_RE);
    if (m) email = m[0];
  }

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
         SELECT json_agg(json_build_object('id', x.id, 'contacted_at', x.contacted_at, 'note', x.note,
                                           'entry_type', COALESCE(x.entry_type, 'call'), 'author', u.name)
                         ORDER BY x.contacted_at DESC) AS contacts
           FROM lead_contacts x
           LEFT JOIN users u ON u.id = x.created_by
          WHERE x.lead_id = l.id
       ) lc ON true
       WHERE ${archived ? "l.deleted_at IS NOT NULL AND l.closed_reason = 'filed'" : 'l.deleted_at IS NULL'}
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
  const entryType = (req.body || {}).entry_type === 'email' ? 'email' : 'call';
  try {
    const when = contacted_at || new Date().toISOString();
    const { rows } = await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, created_by, entry_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, contacted_at, note, entry_type`,
      [req.params.id, when, (note || '').trim() || null, req.user.id, entryType]
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

// POST /api/leads/:id/note — Add a free-text note against a lead (staff only).
// Notes live in lead_contacts beside the call log, separated by entry_type.
// Unlike a logged call, a note never sets contacted_at and never advances the
// lead's status: writing yourself a reminder is not the same as reaching the
// customer.
router.post('/:id/note', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const note = ((req.body || {}).note || '').trim();
  if (!note) return res.status(400).json({ error: 'note is required' });
  try {
    const { rows: leadRows } = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (leadRows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    const { rows } = await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, created_by, entry_type)
       VALUES ($1, NOW(), $2, $3, 'note')
       RETURNING id, contacted_at, note, entry_type`,
      [req.params.id, note, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/leads/:id/note error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id/note/:noteId — Remove a note (staff only). Only notes
// can be deleted; the call/email log is a record of what was actually done.
router.delete('/:id/note/:noteId', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM lead_contacts WHERE id = $1 AND lead_id = $2 AND entry_type = 'note' RETURNING id",
      [req.params.noteId, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/leads/:id/note/:noteId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Permanently delete a lead (staff only).
// Delete means gone: the row and its call/note history leave the database, so
// a deleted lead can never reappear in the Closed Leads list. Works on an open
// lead and on one already sitting in Closed. Filing or converting a lead is
// what keeps it (see /file and /create-estimate) — nothing here is recoverable.
router.delete('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Explicit, so the delete does not depend on the FK cascade being in place.
    await client.query('DELETE FROM lead_contacts WHERE lead_id = $1', [req.params.id]);
    const { rows } = await client.query(
      'DELETE FROM leads WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    await client.query('COMMIT');
    res.json({ id: rows[0].id, deleted: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/leads/:id error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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

    // Put the RV from the lead on the customer record, matching or backfilling
    // an existing unit rather than duplicating one. Falls back to the old
    // behaviour (first unit, else a bare stub) when the message has no RV.
    let unitId = null;
    const rvFromLead = parseLeadRv(lead.message);
    const saved = await saveLeadUnit(client, lead.customer_id, rvFromLead);
    unitId = saved.unit_id;

    if (!unitId) {
      const { rows: unitRows } = await client.query(
        'SELECT id FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY id LIMIT 1',
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
        "SELECT contacted_at, note, COALESCE(entry_type, 'call') AS entry_type FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at",
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          const kind = ct.entry_type === 'note' ? 'Note' : (ct.entry_type === 'email' ? 'Email' : 'Call');
          return `[${kind} ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, lead.customer_id]
        );
      }
    }

    await client.query(
      "UPDATE leads SET record_id = $1, status = 'converted', deleted_at = NOW(), closed_reason = 'converted' WHERE id = $2",
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
        "SELECT contacted_at, note, COALESCE(entry_type, 'call') AS entry_type FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at",
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          const kind = ct.entry_type === 'note' ? 'Note' : (ct.entry_type === 'email' ? 'Email' : 'Call');
          return `[${kind} ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, targetCustomerId]
        );
      }
    }

    // Put the RV on the customer record. The caller may send an edited unit
    // (the File Lead modal prefills it from the message and lets staff fix it);
    // if it sends nothing, fall back to parsing the message here. save_unit
    // false means the staff member deliberately unticked it.
    let unitResult = { unit_id: null, unit_action: 'none' };
    const body = req.body || {};
    if (body.save_unit !== false && targetCustomerId) {
      let rv;
      if (body.unit) {
        // An explicit payload wins outright, so a field the staff member
        // cleared stays cleared instead of being re-parsed from the message.
        const sent = body.unit;
        rv = {
          year: String(sent.year || '').trim() ? parseInt(sent.year, 10) || null : null,
          make: String(sent.make || '').trim() || null,
          model: String(sent.model || '').trim() || null,
          linear_feet: String(sent.linear_feet || '').trim() ? parseFloat(sent.linear_feet) || null : null,
        };
      } else {
        rv = parseLeadRv(lead.message);
      }
      unitResult = await saveLeadUnit(client, targetCustomerId, rv);
    }

    await client.query(
      "UPDATE leads SET deleted_at = NOW(), closed_reason = 'filed' WHERE id = $1",
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
    res.json({
      filed: true,
      customer_id: targetCustomerId,
      unit_id: unitResult.unit_id,
      unit_action: unitResult.unit_action,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads/:id/file error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
