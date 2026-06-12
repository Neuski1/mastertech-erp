const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// POST /api/units — Create unit for a customer
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color, linear_feet } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO units (customer_id, year, make, model, vin, license_plate, unit_notes, unit_type, color, linear_feet)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [customer_id, year || null, make || null, model || null,
       vin || null, license_plate || null, unit_notes || null,
       unit_type || null, color || null, linear_feet || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/units/:id — Update unit fields
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const allowedFields = ['year', 'make', 'model', 'vin', 'license_plate', 'unit_notes', 'unit_type', 'color', 'linear_feet'];
  const updates = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      values.push(req.body[field] || null);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE units SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/units/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/units/:id/merge — Merge duplicate unit into keeper
// Reassigns records, appointments, and storage to the keeper, fills empty
// keeper fields from the duplicate (or uses caller-supplied finalFields),
// combines notes, then soft-deletes the duplicate.
// ---------------------------------------------------------------------------
router.post('/:id/merge', requireRole('admin', 'service_writer'), async (req, res) => {
  const keeperId = parseInt(req.params.id);
  const { duplicateId, finalFields } = req.body;

  if (!duplicateId) {
    return res.status(400).json({ error: 'duplicateId is required' });
  }
  if (keeperId === parseInt(duplicateId)) {
    return res.status(400).json({ error: 'Cannot merge a unit with itself' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const keeperRes = await client.query(
      'SELECT * FROM units WHERE id = $1 AND deleted_at IS NULL', [keeperId]
    );
    if (keeperRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Keeper unit not found' });
    }
    const dupRes = await client.query(
      'SELECT * FROM units WHERE id = $1 AND deleted_at IS NULL', [duplicateId]
    );
    if (dupRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Duplicate unit not found' });
    }
    const keeper = keeperRes.rows[0];
    const dup = dupRes.rows[0];
    if (keeper.customer_id !== dup.customer_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Units belong to different customers. Merge the customers first.' });
    }

    // Step 1: Update keeper fields.
    // If finalFields supplied, those win. Otherwise fill empty keeper fields
    // from the duplicate and combine unit_notes.
    const mergeableFields = ['year', 'make', 'model', 'vin', 'license_plate', 'unit_type', 'color', 'linear_feet', 'unit_notes'];
    const updates = [];
    const values = [];
    let idx = 1;
    if (finalFields && Object.keys(finalFields).length > 0) {
      for (const [field, value] of Object.entries(finalFields)) {
        if (mergeableFields.includes(field)) {
          updates.push(`${field} = $${idx++}`);
          values.push(value === '' ? null : value);
        }
      }
    } else {
      for (const field of mergeableFields) {
        if (field === 'unit_notes') continue;
        if ((keeper[field] === null || keeper[field] === '') && dup[field] !== null && dup[field] !== '') {
          updates.push(`${field} = $${idx++}`);
          values.push(dup[field]);
        }
      }
      if (dup.unit_notes && dup.unit_notes !== keeper.unit_notes) {
        updates.push(`unit_notes = $${idx++}`);
        values.push([keeper.unit_notes, dup.unit_notes].filter(Boolean).join(' | '));
      }
    }
    if (updates.length > 0) {
      values.push(keeperId);
      await client.query(
        `UPDATE units SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
        values
      );
    }

    // Step 2: Reassign related rows (savepoints isolate optional tables)
    const reassignTables = ['records', 'appointments', 'storage_billing'];
    const counts = {};
    for (const table of reassignTables) {
      try {
        await client.query(`SAVEPOINT sp_${table}`);
        const result = await client.query(
          `UPDATE ${table} SET unit_id = $1 WHERE unit_id = $2`,
          [keeperId, duplicateId]
        );
        counts[table] = result.rowCount;
        await client.query(`RELEASE SAVEPOINT sp_${table}`);
      } catch (e) {
        await client.query(`ROLLBACK TO SAVEPOINT sp_${table}`);
        counts[table] = 0;
        console.log(`Unit merge: ${table} skipped (${e.message})`);
      }
    }

    // Step 3: Audit trail (best effort)
    try {
      await client.query('SAVEPOINT sp_audit');
      await client.query(
        `INSERT INTO audit_log (table_name, row_id, action, old_value, new_value, changed_at)
         VALUES ('units', $1, 'merge', $2, $3, NOW())`,
        [keeperId, JSON.stringify({ merged_from: duplicateId }), JSON.stringify({ counts })]
      );
      await client.query('RELEASE SAVEPOINT sp_audit');
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT sp_audit');
    }

    // Step 4: Soft delete the duplicate
    await client.query('UPDATE units SET deleted_at = NOW() WHERE id = $1', [duplicateId]);

    await client.query('COMMIT');

    const updatedRes = await client.query('SELECT * FROM units WHERE id = $1', [keeperId]);
    res.json({
      unit: updatedRes.rows[0],
      merged: {
        records: counts.records || 0,
        appointments: counts.appointments || 0,
        storage: counts.storage_billing || 0,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/units/:id/merge error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/units/:id — Soft delete a unit
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    // Check if unit is assigned to an active storage space
    const { rows: activeStorage } = await pool.query(
      'SELECT id FROM storage_billing WHERE unit_id = $1 AND billing_end_date IS NULL AND deleted_at IS NULL',
      [req.params.id]
    );
    if (activeStorage.length > 0) {
      return res.status(409).json({
        error: 'This unit is assigned to an active storage space and cannot be deleted.'
      });
    }

    const { rows } = await pool.query(
      'UPDATE units SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted', id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/units/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
