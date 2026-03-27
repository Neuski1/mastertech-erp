const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getSetting, recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Status transition rules
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS = {
  estimate:           ['approved', 'on_hold', 'void'],
  approved:           ['schedule_customer', 'in_progress', 'on_hold', 'void'],
  schedule_customer:  ['scheduled', 'in_progress', 'on_hold', 'void'],
  scheduled:          ['in_progress', 'on_hold', 'void'],
  in_progress:        ['awaiting_parts', 'awaiting_approval', 'complete', 'on_hold', 'void'],
  awaiting_parts:     ['in_progress', 'on_hold', 'void'],
  awaiting_approval:  ['in_progress', 'approved', 'on_hold', 'void'],
  complete:           ['payment_pending', 'partial', 'paid', 'on_hold', 'void'],
  payment_pending:    ['partial', 'paid', 'on_hold', 'void'],
  partial:            ['paid', 'on_hold', 'void'],
  paid:               ['void'],
  on_hold:            ['estimate', 'approved', 'schedule_customer', 'scheduled', 'in_progress', 'awaiting_parts', 'awaiting_approval', 'complete', 'payment_pending', 'partial', 'void'],
  void:               [],
};

// ---------------------------------------------------------------------------
// POST /api/records — Create new record (starts as estimate)
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer'), async (req, res) => {
  const {
    customer_id, unit_id, key_number, job_description,
    is_insurance_job, insurance_company, insurance_contact_name,
    insurance_phone, insurance_email, claim_number, policy_number,
    estimate_valid_until, internal_notes, customer_notes,
    deposit_amount, mileage_at_intake, expected_completion_date
  } = req.body;

  if (!customer_id || !unit_id) {
    return res.status(400).json({ error: 'customer_id and unit_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate next record_number
    const numRes = await client.query(
      'SELECT COALESCE(MAX(record_number), 0) + 1 AS next_num FROM records'
    );
    const recordNumber = numRes.rows[0].next_num;

    // Snapshot tax rate from system settings
    const taxRate = await getSetting('tax_rate');

    // Shop supplies exempt only if insurance job; CC fee on by default
    const shopSuppliesExempt = is_insurance_job === true;
    const ccFeeApplied = true;

    const today = new Date().toISOString().split('T')[0];

    const { rows } = await client.query(
      `INSERT INTO records (
         record_number, customer_id, unit_id, status, key_number,
         job_description, is_insurance_job, insurance_company,
         insurance_contact_name, insurance_phone, insurance_email,
         claim_number, policy_number, estimate_valid_until,
         internal_notes, customer_notes, deposit_amount,
         mileage_at_intake, tax_rate, shop_supplies_exempt, cc_fee_applied, intake_date,
         expected_completion_date
       ) VALUES ($1,$2,$3,'estimate',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [recordNumber, customer_id, unit_id, key_number || null,
       job_description || null, is_insurance_job || false,
       insurance_company || null, insurance_contact_name || null,
       insurance_phone || null, insurance_email || null,
       claim_number || null, policy_number || null,
       estimate_valid_until || null, internal_notes || null,
       customer_notes || null, deposit_amount || 0,
       mileage_at_intake || null, taxRate, shopSuppliesExempt, ccFeeApplied, today,
       expected_completion_date || null]
    );

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/records error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// GET /api/records — List records with filters
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, customer_id, search, date_from, date_to,
          page = 1, limit = 50, sort = 'record_number', order = 'desc' } = req.query;

  const conditions = ['r.deleted_at IS NULL'];
  const params = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`r.status = $${paramIdx++}`);
    params.push(status);
  }
  if (customer_id) {
    conditions.push(`r.customer_id = $${paramIdx++}`);
    params.push(customer_id);
  }
  if (date_from) {
    conditions.push(`r.created_at >= $${paramIdx++}`);
    params.push(date_from);
  }
  if (date_to) {
    conditions.push(`r.created_at <= $${paramIdx++}`);
    params.push(date_to);
  }
  if (search) {
    conditions.push(`(
      r.record_number::TEXT ILIKE $${paramIdx} OR
      c.last_name ILIKE $${paramIdx} OR
      c.first_name ILIKE $${paramIdx} OR
      c.company_name ILIKE $${paramIdx} OR
      r.job_description ILIKE $${paramIdx}
    )`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  const allowedSorts = ['record_number', 'created_at', 'status', 'amount_due'];
  const sortCol = allowedSorts.includes(sort) ? `r.${sort}` : 'r.record_number';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM records r
       JOIN customers c ON c.id = r.customer_id
       WHERE ${conditions.join(' AND ')}`,
      params
    );

    const { rows } = await pool.query(
      `SELECT r.id, r.record_number, r.status, r.amount_due, r.total_sales,
              r.created_at, r.is_insurance_job, r.job_description,
              r.expected_completion_date,
              c.id AS customer_id, c.last_name, c.first_name, c.company_name,
              u.year, u.make, u.model, u.vin, u.license_plate
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       JOIN units u ON u.id = r.unit_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      records: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/records error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/records/:id — Full record with all related data
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows: recordRows } = await pool.query(
      `SELECT r.*,
              c.last_name, c.first_name, c.company_name, c.account_number,
              c.phone_primary, c.email_primary, c.tax_exempt,
              c.address_street, c.address_city, c.address_state, c.address_zip,
              u.year, u.make, u.model, u.vin, u.license_plate, u.unit_notes
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       JOIN units u ON u.id = r.unit_id
       WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [req.params.id]
    );

    if (recordRows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const record = recordRows[0];

    // Fetch labor lines, parts lines, freight lines, payments in parallel
    const [laborRes, partsRes, freightRes, paymentsRes] = await Promise.all([
      pool.query(
        `SELECT ll.*, t.name AS technician_name
         FROM record_labor_lines ll
         LEFT JOIN technicians t ON t.id = ll.technician_id
         WHERE ll.record_id = $1 AND ll.deleted_at IS NULL
         ORDER BY ll.sort_order`,
        [req.params.id]
      ),
      pool.query(
        `SELECT * FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL
         ORDER BY sort_order`,
        [req.params.id]
      ),
      pool.query(
        `SELECT * FROM record_freight_lines
         WHERE record_id = $1 AND deleted_at IS NULL
         ORDER BY created_at`,
        [req.params.id]
      ),
      pool.query(
        `SELECT * FROM payments
         WHERE record_id = $1 AND deleted_at IS NULL
         ORDER BY payment_date, id`,
        [req.params.id]
      ),
    ]);

    res.json({
      ...record,
      labor_lines: laborRes.rows,
      parts_lines: partsRes.rows,
      freight_lines: freightRes.rows,
      payments: paymentsRes.rows,
    });
  } catch (err) {
    console.error('GET /api/records/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/records/:id — Update record fields
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  const allowedFields = [
    'key_number', 'job_description', 'intake_date', 'start_date',
    'expected_completion_date', 'mileage_at_intake',
    'is_insurance_job', 'insurance_company', 'insurance_contact_name',
    'insurance_phone', 'insurance_email', 'claim_number', 'policy_number',
    'estimate_valid_until', 'authorization_signed_at',
    'internal_notes', 'customer_notes',
    'actual_completion_date',
    'under_warranty_amount', 'no_charge_amount', 'deductible_amount', 'deposit_amount',
    'discount_amount', 'discount_description',
    'cc_fee_applied', 'shop_supplies_exempt', 'tax_waived',
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

  // Auto-set shop_supplies_exempt when is_insurance_job changes
  if (req.body.is_insurance_job !== undefined && req.body.shop_supplies_exempt === undefined) {
    updates.push(`shop_supplies_exempt = $${idx++}`);
    values.push(req.body.is_insurance_job);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE records SET ${updates.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Recalculate totals when any financial toggle/value changes
    const recalcFields = ['cc_fee_applied', 'shop_supplies_exempt', 'is_insurance_job', 'tax_waived', 'under_warranty_amount', 'no_charge_amount', 'deposit_amount', 'discount_amount'];
    if (recalcFields.some(f => req.body[f] !== undefined)) {
      await recalculateTotals(req.params.id);
    }

    // Auto-create labor lines when job_description is added/edited on an already-approved record
    let laborLinesCreated = 0;
    const record = rows[0];
    const postEstimateStatuses = ['approved', 'schedule_customer', 'scheduled', 'in_progress', 'awaiting_parts', 'awaiting_approval', 'complete', 'payment_pending', 'partial'];
    if (req.body.job_description && postEstimateStatuses.includes(record.status) && !record.description_lines_imported) {
      const { rows: existingLabor } = await pool.query(
        'SELECT COUNT(*) FROM record_labor_lines WHERE record_id = $1 AND deleted_at IS NULL',
        [req.params.id]
      );
      if (parseInt(existingLabor[0].count) === 0) {
        const lines = record.job_description.split('\n')
          .map(l => l.trim())
          .map(l => l.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, ''))
          .filter(l => l.length > 0)
          .map(l => l.substring(0, 255));
        if (lines.length > 0) {
          const rateRes = await pool.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'labor_rate'"
          );
          const rate = rateRes.rows[0] ? parseFloat(rateRes.rows[0].setting_value) : 198.00;
          for (let i = 0; i < lines.length; i++) {
            await pool.query(
              `INSERT INTO record_labor_lines
                 (record_id, line_type, description, hours, rate, line_total, sort_order)
               VALUES ($1, 'L', $2, 0, $3, 0, $4)`,
              [req.params.id, lines[i], rate, i + 1]
            );
          }
          laborLinesCreated = lines.length;
        }
      }
      await pool.query(
        'UPDATE records SET description_lines_imported = true WHERE id = $1',
        [req.params.id]
      );
    }

    // Refetch
    const { rows: updated } = await pool.query(
      'SELECT * FROM records WHERE id = $1', [req.params.id]
    );
    res.json({ ...updated[0], labor_lines_created: laborLinesCreated });
  } catch (err) {
    console.error('PATCH /api/records/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/records/:id/status — Change status with validation
// ---------------------------------------------------------------------------
router.patch('/:id/status', requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  const { status: newStatus, manual_override } = req.body;

  if (!newStatus) {
    return res.status(400).json({ error: 'status is required' });
  }

  const ALL_STATUSES = [
    'estimate', 'approved', 'schedule_customer', 'scheduled', 'in_progress',
    'awaiting_parts', 'awaiting_approval', 'complete', 'payment_pending',
    'partial', 'paid', 'on_hold', 'void',
  ];

  if (!ALL_STATUSES.includes(newStatus)) {
    return res.status(400).json({ error: `Invalid status: ${newStatus}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const record = rows[0];

    // For manual override, allow any transition (role checks done client-side)
    if (!manual_override) {
      const allowed = VALID_TRANSITIONS[record.status] || [];
      if (!allowed.includes(newStatus)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Cannot transition from '${record.status}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}`,
        });
      }
    }

    // Block status → complete if any labor lines have hours = 0 or null
    if (newStatus === 'complete') {
      const { rows: zeroHoursLines } = await client.query(
        `SELECT id, description FROM record_labor_lines
         WHERE record_id = $1 AND deleted_at IS NULL AND (hours IS NULL OR hours = 0)`,
        [req.params.id]
      );
      if (zeroHoursLines.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Cannot mark complete — labor lines are missing hours',
          missing_hours_lines: zeroHoursLines.map(l => l.description),
        });
      }
    }

    const extraUpdates = [];
    const extraValues = [];
    let paramIdx = 3; // $1 = newStatus, $2 = id

    // When status → approved: auto-stamp intake_date if not already set
    if (newStatus === 'approved' && !record.intake_date) {
      extraUpdates.push(`intake_date = $${paramIdx++}`);
      extraValues.push(new Date().toISOString().split('T')[0]);
    }

    // When status → complete: auto-stamp actual_completion_date, recalculate shop supplies
    if (newStatus === 'complete') {
      if (!record.actual_completion_date) {
        extraUpdates.push(`actual_completion_date = $${paramIdx++}`);
        extraValues.push(new Date().toISOString().split('T')[0]);
      }
    }

    const setClauses = [`status = $1`, ...extraUpdates];
    await client.query(
      `UPDATE records SET ${setClauses.join(', ')} WHERE id = $2`,
      [newStatus, req.params.id, ...extraValues]
    );

    // When transitioning to 'approved': auto-create labor lines from job description
    let laborLinesCreated = 0;
    if (newStatus === 'approved' && !record.description_lines_imported && record.job_description) {
      // Check no existing labor lines
      const { rows: existingLabor } = await client.query(
        'SELECT COUNT(*) FROM record_labor_lines WHERE record_id = $1 AND deleted_at IS NULL',
        [req.params.id]
      );
      if (parseInt(existingLabor[0].count) === 0) {
        // Parse bullet points from job description
        const lines = record.job_description.split('\n')
          .map(l => l.trim())
          .map(l => l.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, ''))
          .filter(l => l.length > 0)
          .map(l => l.substring(0, 255));

        if (lines.length > 0) {
          // Get labor rate from system settings
          const rateRes = await client.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'labor_rate'"
          );
          const rate = rateRes.rows[0] ? parseFloat(rateRes.rows[0].setting_value) : 198.00;

          for (let i = 0; i < lines.length; i++) {
            await client.query(
              `INSERT INTO record_labor_lines
                 (record_id, line_type, description, hours, rate, line_total, sort_order)
               VALUES ($1, 'L', $2, 0, $3, 0, $4)`,
              [req.params.id, lines[i], rate, i + 1]
            );
          }
          laborLinesCreated = lines.length;
        }
      }
      // Mark as imported regardless (prevent re-running)
      await client.query(
        'UPDATE records SET description_lines_imported = true WHERE id = $1',
        [req.params.id]
      );
    }

    // Recalculate totals on status change (shop supplies calculated at complete)
    await recalculateTotals(req.params.id, client);

    await client.query('COMMIT');

    // Refetch full record
    const { rows: updated } = await pool.query(
      'SELECT * FROM records WHERE id = $1', [req.params.id]
    );
    res.json({ ...updated[0], labor_lines_created: laborLinesCreated });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH /api/records/:id/status error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/records/:id — Soft delete (set deleted_at, status = void)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE records SET deleted_at = NOW(), status = 'void'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, record_number, status`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record voided', record: rows[0] });
  } catch (err) {
    console.error('DELETE /api/records/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
