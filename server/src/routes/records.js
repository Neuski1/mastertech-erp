const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getSetting, recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

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
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
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

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

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
// POST /api/records/:id/copy — Copy selected lines to a new record
// ---------------------------------------------------------------------------
router.post('/:id/copy', requireRole('admin', 'service_writer'), async (req, res) => {
  const { customer_id, unit_id, labor_line_ids = [], parts_line_ids = [], freight_line_ids = [] } = req.body;

  if (!customer_id || !unit_id) {
    return res.status(400).json({ error: 'customer_id and unit_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch source record
    const { rows: srcRows } = await client.query(
      'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL', [req.params.id]
    );
    if (srcRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Source record not found' });
    }
    const src = srcRows[0];

    // Generate next record_number
    const numRes = await client.query('SELECT COALESCE(MAX(record_number), 0) + 1 AS next_num FROM records');
    const recordNumber = numRes.rows[0].next_num;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

    // Create new record
    const { rows: newRows } = await client.query(
      `INSERT INTO records (
         record_number, customer_id, unit_id, status, key_number,
         job_description, is_insurance_job,
         internal_notes, customer_notes,
         tax_rate, shop_supplies_exempt, cc_fee_applied, intake_date
       ) VALUES ($1,$2,$3,'estimate',$4,$5,false,$6,$7,$8,$9,true,$10)
       RETURNING *`,
      [recordNumber, customer_id, unit_id,
       src.key_number || null, src.job_description || null,
       src.internal_notes || null, src.customer_notes || null,
       src.tax_rate, src.shop_supplies_exempt, today]
    );
    const newId = newRows[0].id;

    // Copy selected labor lines
    if (labor_line_ids.length > 0) {
      const { rows: laborLines } = await client.query(
        `SELECT * FROM record_labor_lines WHERE id = ANY($1) AND record_id = $2 AND deleted_at IS NULL`,
        [labor_line_ids, req.params.id]
      );
      for (const ll of laborLines) {
        await client.query(
          `INSERT INTO record_labor_lines (record_id, technician_id, line_type, description, hours, rate, line_total, sort_order, no_charge)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [newId, ll.technician_id, ll.line_type, ll.description, ll.hours, ll.rate, ll.line_total, ll.sort_order, ll.no_charge || false]
        );
      }
    }

    // Copy selected parts lines
    if (parts_line_ids.length > 0) {
      const { rows: partsLines } = await client.query(
        `SELECT * FROM record_parts_lines WHERE id = ANY($1) AND record_id = $2 AND deleted_at IS NULL`,
        [parts_line_ids, req.params.id]
      );
      for (const pl of partsLines) {
        await client.query(
          `INSERT INTO record_parts_lines (record_id, inventory_id, is_inventory_part, part_number, description, quantity, cost_each, sale_price_each, line_total, taxable, sort_order, vendor)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [newId, pl.inventory_id, pl.is_inventory_part, pl.part_number, pl.description, pl.quantity, pl.cost_each, pl.sale_price_each, pl.line_total, pl.taxable, pl.sort_order, pl.vendor]
        );
      }
    }

    // Copy selected freight lines
    if (freight_line_ids.length > 0) {
      const { rows: freightLines } = await client.query(
        `SELECT * FROM record_freight_lines WHERE id = ANY($1) AND record_id = $2 AND deleted_at IS NULL`,
        [freight_line_ids, req.params.id]
      );
      for (const fl of freightLines) {
        await client.query(
          `INSERT INTO record_freight_lines (record_id, description, amount) VALUES ($1, $2, $3)`,
          [newId, fl.description, fl.amount]
        );
      }
    }

    // Recalculate totals on the new record
    await recalculateTotals(newId, client);
    await client.query('COMMIT');

    res.status(201).json({ success: true, new_record_id: newId, record_number: recordNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/records/:id/copy error:', err);
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
       LEFT JOIN units u ON u.id = r.unit_id
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
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
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
router.patch('/:id/status', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
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
         WHERE record_id = $1 AND deleted_at IS NULL
         AND (hours IS NULL OR hours = 0)
         AND (no_charge IS NOT TRUE)
         AND (line_total IS NULL OR line_total > 0 OR rate > 0)`,
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
      extraValues.push(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }));
    }

    // When status → payment_pending: stamp payment_pending_since if not already set
    if (newStatus === 'payment_pending' && !record.payment_pending_since) {
      extraUpdates.push(`payment_pending_since = NOW()`);
    }

    // When status → paid or void: clear reminder tracking fields
    if (newStatus === 'paid' || newStatus === 'void') {
      extraUpdates.push(`payment_pending_since = NULL`);
      extraUpdates.push(`reminder_count = 0`);
      extraUpdates.push(`last_reminder_sent_at = NULL`);
    }

    // When estimate → non-estimate: deduct inventory for all inventory parts
    if (record.status === 'estimate' && newStatus !== 'estimate') {
      const { rows: invParts } = await client.query(
        `SELECT inventory_id, quantity FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL AND is_inventory_part = TRUE AND inventory_id IS NOT NULL`,
        [req.params.id]
      );
      for (const p of invParts) {
        await client.query(
          'UPDATE inventory SET qty_on_hand = qty_on_hand - $1 WHERE id = $2',
          [parseFloat(p.quantity), p.inventory_id]
        );
      }
    }

    // When non-estimate → estimate (revert) or → void: restore inventory for all inventory parts
    if ((record.status !== 'estimate' && newStatus === 'estimate') || (record.status !== 'void' && newStatus === 'void')) {
      const { rows: invParts } = await client.query(
        `SELECT inventory_id, quantity FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL AND is_inventory_part = TRUE AND inventory_id IS NOT NULL`,
        [req.params.id]
      );
      for (const p of invParts) {
        await client.query(
          'UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2',
          [parseFloat(p.quantity), p.inventory_id]
        );
      }
    }

    // When status → complete: auto-stamp actual_completion_date, recalculate shop supplies
    if (newStatus === 'complete') {
      if (!record.actual_completion_date) {
        extraUpdates.push(`actual_completion_date = $${paramIdx++}`);
        extraValues.push(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }));
      }
    }

    const setClauses = [`status = $1`, ...extraUpdates];
    await client.query(
      `UPDATE records SET ${setClauses.join(', ')} WHERE id = $2`,
      [newStatus, req.params.id, ...extraValues]
    );

    // When transitioning to 'approved': auto-create labor lines from job description
    let laborLinesCreated = 0;
    if (newStatus === 'approved' && record.job_description) {
      // Only create if no existing labor lines (prevents duplicates)
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
      // Mark as imported
      await client.query(
        'UPDATE records SET description_lines_imported = true WHERE id = $1',
        [req.params.id]
      );
    }

    // Reverse inventory when voiding — restore qty for all inventory parts
    if (newStatus === 'void' && record.status !== 'void') {
      const { rows: invParts } = await client.query(
        `SELECT id, inventory_id, quantity FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL
           AND is_inventory_part = true AND inventory_id IS NOT NULL`,
        [req.params.id]
      );
      for (const part of invParts) {
        await client.query(
          'UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2',
          [parseFloat(part.quantity), part.inventory_id]
        );
        console.log(`Inventory reversal: +${part.quantity} units returned to inventory #${part.inventory_id} from voided record #${record.record_number}`);
      }
      if (invParts.length > 0) {
        console.log(`Total: ${invParts.length} inventory items restored for voided record #${record.record_number}`);
      }
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
// POST /api/records/:id/send-reminder — Send payment reminder
// ---------------------------------------------------------------------------
router.post('/:id/send-reminder', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { sendPaymentReminder } = require('../services/paymentReminders');
    const result = await sendPaymentReminder(req.params.id, { isManual: true, sentByUserId: req.user.id });
    if (!result.success) return res.status(400).json({ error: result.reason });
    res.json(result);
  } catch (err) {
    console.error('POST send-reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/records/:id — Soft delete (set deleted_at, status = void)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE records SET deleted_at = NOW(), status = 'void'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, record_number, status`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    // Reverse inventory for all inventory parts on this record
    const { rows: invParts } = await client.query(
      `SELECT id, inventory_id, quantity FROM record_parts_lines
       WHERE record_id = $1 AND deleted_at IS NULL
         AND is_inventory_part = true AND inventory_id IS NOT NULL`,
      [req.params.id]
    );
    for (const part of invParts) {
      await client.query(
        'UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2',
        [parseFloat(part.quantity), part.inventory_id]
      );
      console.log(`Inventory reversal: +${part.quantity} units returned to inventory #${part.inventory_id} from deleted record #${rows[0].record_number}`);
    }

    await client.query('COMMIT');
    res.json({ message: 'Record voided', record: rows[0], inventory_restored: invParts.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/records/:id error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/records/:id/email-document — Email document to customer
// ---------------------------------------------------------------------------
router.post('/:id/email-document', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { personalMessage } = req.body || {};
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.company_name, c.email_primary, c.phone_primary, c.account_number,
              c.address_street, c.address_city, c.address_state, c.address_zip,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model, u.vin, u.license_plate
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       LEFT JOIN units u ON u.id = r.unit_id
       WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });

    const r = rows[0];
    const email = r.email_primary;
    if (!email) return res.status(400).json({ error: 'No email address on file for this customer.' });

    // Determine document type
    let docType = 'Work Order';
    if (r.status === 'estimate') docType = 'Estimate';
    else if (['complete', 'payment_pending', 'partial', 'paid'].includes(r.status)) docType = 'Invoice';

    // For estimates: generate/refresh approval token
    let approvalUrl = null;
    if (docType === 'Estimate' && r.status === 'estimate') {
      const crypto = require('crypto');
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await pool.query(
        'UPDATE records SET approval_token = $1, approval_token_expires_at = $2 WHERE id = $3',
        [token, expires, r.id]
      );
      const backendUrl = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://mastertech-erp-production-cb96.up.railway.app';
      approvalUrl = `${backendUrl}/api/records/approve/${token}`;
      console.log('Approval URL generated:', approvalUrl);
    }

    // Fetch line items + payments + photos
    const [laborRes, partsRes, freightRes, payRes, photosRes] = await Promise.all([
      pool.query('SELECT * FROM record_labor_lines WHERE record_id = $1 AND deleted_at IS NULL ORDER BY sort_order, id', [r.id]),
      pool.query('SELECT * FROM record_parts_lines WHERE record_id = $1 AND deleted_at IS NULL ORDER BY sort_order, id', [r.id]),
      pool.query('SELECT * FROM record_freight_lines WHERE record_id = $1 AND deleted_at IS NULL ORDER BY id', [r.id]),
      pool.query('SELECT * FROM payments WHERE record_id = $1 AND deleted_at IS NULL ORDER BY payment_date, id', [r.id]),
      pool.query('SELECT * FROM record_photos WHERE record_id = $1 ORDER BY category, created_at', [r.id]),
    ]);

    const fmtCur = (v) => {
      const n = parseFloat(v) || 0;
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };
    const fmtDate = (d) => {
      if (!d) return '';
      const dt = new Date(typeof d === 'string' && !d.includes('T') ? d + 'T12:00:00' : d);
      return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    };

    const customerName = `${r.first_name || ''} ${r.last_name || ''}`.trim();
    const unit = [r.unit_year, r.unit_make, r.unit_model].filter(Boolean).join(' ') || 'N/A';
    const address = [r.address_street, r.address_city, r.address_state, r.address_zip].filter(Boolean).join(', ');

    // Collect distinct technician names for "Serviced By"
    const techNamesRes = await pool.query(
      `SELECT DISTINCT t.name FROM record_labor_lines rll
       LEFT JOIN technicians t ON rll.technician_id = t.id
       WHERE rll.record_id = $1 AND rll.deleted_at IS NULL AND t.name IS NOT NULL
       ORDER BY t.name ASC`,
      [r.id]
    );
    const techNames = techNamesRes.rows.map(row => row.name);
    const isEstimate = r.status === 'estimate';

    // Build labor table rows
    const laborRows = laborRes.rows.map(l =>
      `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${l.description || ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${parseFloat(l.hours||0).toFixed(2)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(l.rate)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(l.line_total)}</td></tr>`
    ).join('');

    const partsRows = partsRes.rows.map(p =>
      `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${p.part_number ? p.part_number + ' — ' : ''}${p.description || ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${parseFloat(p.quantity||0)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(p.sale_price_each)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(p.line_total)}</td></tr>`
    ).join('');

    const freightRows = freightRes.rows.map(f =>
      `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${f.description || ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">1</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(f.amount)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtCur(f.amount)}</td></tr>`
    ).join('');

    const underWarranty = parseFloat(r.under_warranty_amount) || 0;
    const noCharge = parseFloat(r.no_charge_amount) || 0;
    const discount = parseFloat(r.discount_amount) || 0;
    const amountDue = parseFloat(r.amount_due) || 0;

    const methodLabels = { credit_card: 'Card', check: 'Check', cash: 'Cash', zelle: 'Zelle' };
    const payments = payRes.rows;
    const deposit = parseFloat(r.deposit_amount) || 0;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:700px;margin:0 auto;background:#ffffff;">
  <div style="background-color:#1e3a5f;padding:20px 32px;">
    <table style="width:100%"><tr>
      <td style="vertical-align:top;">
        <h1 style="color:#ffffff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
        <p style="color:#93c5fd;margin:2px 0 0;font-size:11px;">6590 East 49th Avenue, Commerce City, CO 80022</p>
        <p style="color:#93c5fd;margin:2px 0 0;font-size:11px;">(303) 557-2214 | service@mastertechrvrepair.com</p>
        <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;">${docType}</h2>
        <p style="color:#93c5fd;margin:2px 0;font-size:13px;">#${r.record_number}</p>
        ${r.intake_date || r.created_at ? `<p style="color:#93c5fd;margin:2px 0;font-size:11px;">Date: ${fmtDate(r.intake_date || r.created_at)}</p>` : ''}
        ${r.expected_completion_date && !['complete', 'payment_pending', 'partial', 'paid'].includes(r.status) ? `<p style="color:#93c5fd;margin:2px 0;font-size:11px;">Due: ${fmtDate(r.expected_completion_date)}</p>` : ''}
        ${r.actual_completion_date ? `<p style="color:#93c5fd;margin:2px 0;font-size:11px;">Completed: ${fmtDate(r.actual_completion_date)}</p>` : ''}
      </td>
    </tr></table>
  </div>
  <div style="padding:24px 32px;">
    <!-- Customer & Unit Info -->
    <table style="width:100%;margin-bottom:16px;font-size:13px;border:1px solid #e5e7eb;border-collapse:collapse;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;border:1px solid #e5e7eb;vertical-align:top;width:50%;">
          <div style="font-size:10px;font-weight:bold;text-transform:uppercase;color:#6b7280;margin-bottom:4px;">Customer</div>
          <div style="font-weight:600;color:#111;">${customerName}${r.company_name ? ' (' + r.company_name + ')' : ''}</div>
          ${address ? `<div style="color:#374151;">${address}</div>` : ''}
          ${r.phone_primary ? `<div style="color:#374151;">${r.phone_primary}</div>` : ''}
          ${r.email_primary ? `<div style="color:#374151;">${r.email_primary}</div>` : ''}
        </td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;vertical-align:top;">
          <div style="font-size:10px;font-weight:bold;text-transform:uppercase;color:#6b7280;margin-bottom:4px;">Unit</div>
          <div style="font-weight:600;color:#111;">${unit}</div>
          ${r.vin ? `<div style="color:#374151;font-size:12px;">VIN: ${r.vin}</div>` : ''}
          ${r.license_plate ? `<div style="color:#374151;font-size:12px;">Plate: ${r.license_plate}</div>` : ''}
          ${r.key_number ? `<div style="color:#374151;font-size:12px;">Key #: ${r.key_number}</div>` : ''}
          ${!isEstimate && techNames.length > 0 ? `<div style="margin-top:6px;"><span style="font-size:10px;font-weight:bold;text-transform:uppercase;color:#6b7280;">Serviced By:</span> <span style="font-size:13px;color:#1e3a5f;font-weight:600;">${techNames.join(', ')}</span></div>` : ''}
        </td>
      </tr>
    </table>
    ${personalMessage ? `
    <div style="margin:16px 0;padding:16px;background:#f0f7ff;border-left:4px solid #1a2a4a;border-radius:4px;">
      <p style="margin:0;font-size:14px;color:#1a2a4a;line-height:1.6;white-space:pre-wrap;">${personalMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>` : ''}
    ${r.insurance_company ? `
    <div style="margin-bottom:12px;padding:8px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;font-size:12px;">
      <strong>Insurance:</strong> ${r.insurance_company}${r.claim_number ? ' &nbsp; <strong>Claim #:</strong> ' + r.claim_number : ''}${r.policy_number ? ' &nbsp; <strong>Policy #:</strong> ' + r.policy_number : ''}
    </div>` : ''}

    ${r.job_description && !['complete', 'payment_pending', 'partial', 'paid'].includes(r.status) ? `
    <div style="margin:0 0 16px;padding:12px 16px;background:#f8f9fa;border-left:4px solid #1e3a5f;border-radius:0 4px 4px 0;">
      <div style="font-size:10px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:4px;">Job Description</div>
      <div style="font-size:13px;color:#1e3a5f;white-space:pre-wrap;">${r.job_description}</div>
    </div>` : ''}

    ${r.customer_notes ? `
    <div style="margin:0 0 16px;padding:12px 16px;background:#fefce8;border-left:4px solid #f59e0b;border-radius:0 4px 4px 0;">
      <div style="font-size:10px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:4px;">Customer Notes</div>
      <div style="font-size:13px;color:#374151;white-space:pre-wrap;">${r.customer_notes}</div>
    </div>` : ''}

    ${laborRows ? `
    <h3 style="color:#1e3a5f;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;">LABOR</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f9fafb;"><th style="padding:6px 8px;text-align:left;">Description</th><th style="padding:6px 8px;text-align:right;">Hours</th><th style="padding:6px 8px;text-align:right;">Rate</th><th style="padding:6px 8px;text-align:right;">Total</th></tr></thead>
      <tbody>${laborRows}</tbody>
    </table>` : ''}

    ${partsRows ? `
    <h3 style="color:#1e3a5f;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;">PARTS</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f9fafb;"><th style="padding:6px 8px;text-align:left;">Description</th><th style="padding:6px 8px;text-align:right;">Qty</th><th style="padding:6px 8px;text-align:right;">Price</th><th style="padding:6px 8px;text-align:right;">Total</th></tr></thead>
      <tbody>${partsRows}</tbody>
    </table>` : ''}

    ${freightRows ? `
    <h3 style="color:#1e3a5f;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;">FREIGHT / MISC</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f9fafb;"><th style="padding:6px 8px;text-align:left;">Description</th><th style="padding:6px 8px;text-align:right;">Qty</th><th style="padding:6px 8px;text-align:right;">Price</th><th style="padding:6px 8px;text-align:right;">Total</th></tr></thead>
      <tbody>${freightRows}</tbody>
    </table>` : ''}

    <div style="margin-top:20px;text-align:right;">
      <table style="margin-left:auto;font-size:13px;">
        <tr><td style="padding:3px 12px;color:#6b7280;">Labor Subtotal</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.labor_subtotal)}</td></tr>
        <tr><td style="padding:3px 12px;color:#6b7280;">Parts Subtotal</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.parts_subtotal)}</td></tr>
        ${parseFloat(r.freight_subtotal) > 0 ? `<tr><td style="padding:3px 12px;color:#6b7280;">Freight/Misc</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.freight_subtotal)}</td></tr>` : ''}
        ${parseFloat(r.shop_supplies_amount) > 0 ? `<tr><td style="padding:3px 12px;color:#6b7280;">Shop Supplies</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.shop_supplies_amount)}</td></tr>` : ''}
        ${parseFloat(r.cc_fee_amount) > 0 ? `<tr><td style="padding:3px 12px;color:#6b7280;">CC Fee</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.cc_fee_amount)}</td></tr>` : ''}
        <tr><td style="padding:3px 12px;color:#6b7280;">Tax</td><td style="padding:3px 12px;text-align:right;">${r.tax_waived ? 'WAIVED' : fmtCur(r.tax_amount)}</td></tr>
        <tr style="border-top:2px solid #1e3a5f;"><td style="padding:6px 12px;font-weight:bold;color:#1e3a5f;">Total Sales</td><td style="padding:6px 12px;text-align:right;font-weight:bold;">${fmtCur(r.total_sales)}</td></tr>
        ${underWarranty > 0 ? `<tr><td style="padding:3px 12px;color:#dc2626;">Under Warranty</td><td style="padding:3px 12px;text-align:right;color:#dc2626;">-${fmtCur(underWarranty)}</td></tr>` : ''}
        ${noCharge > 0 ? `<tr><td style="padding:3px 12px;color:#dc2626;">Not Covered</td><td style="padding:3px 12px;text-align:right;color:#dc2626;">-${fmtCur(noCharge)}</td></tr>` : ''}
        ${discount > 0 ? `<tr><td style="padding:3px 12px;color:#dc2626;">Discount${r.discount_description ? ' — ' + r.discount_description : ''}</td><td style="padding:3px 12px;text-align:right;color:#dc2626;">-${fmtCur(discount)}</td></tr>` : ''}
        <tr><td style="padding:3px 12px;color:#6b7280;">Total Collected</td><td style="padding:3px 12px;text-align:right;">${fmtCur(r.total_collected)}</td></tr>
        <tr style="border-top:2px solid #1e3a5f;"><td style="padding:8px 12px;font-weight:bold;font-size:15px;color:${amountDue > 0 ? '#dc2626' : '#065f46'};">AMOUNT DUE</td><td style="padding:8px 12px;text-align:right;font-weight:bold;font-size:15px;color:${amountDue > 0 ? '#dc2626' : '#065f46'};">${fmtCur(amountDue)}</td></tr>
      </table>
    </div>
    ${(payments.length > 0 || deposit > 0) ? `
    <h3 style="color:#1e3a5f;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;">PAYMENT DETAIL</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f9fafb;"><th style="padding:6px 8px;text-align:left;">Date</th><th style="padding:6px 8px;text-align:left;">Method</th><th style="padding:6px 8px;text-align:left;">Reference</th><th style="padding:6px 8px;text-align:right;">Amount</th></tr></thead>
      <tbody>
        ${deposit > 0 ? `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${fmtDate(r.intake_date || r.created_at)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">Deposit</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">&mdash;</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtCur(deposit)}</td></tr>` : ''}
        ${payments.map(p => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${fmtDate(p.payment_date)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${methodLabels[p.payment_method] || p.payment_method || ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${p.reference_number || p.check_number || '&mdash;'}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmtCur(p.amount)}</td></tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${(() => {
      const photos = photosRes.rows;
      if (photos.length === 0) return '';
      const catLabels = { before: 'Before', during: 'During', after: 'After', damage: 'Damage', other: 'Other' };
      const grouped = {};
      photos.forEach(p => { if (!grouped[p.category]) grouped[p.category] = []; grouped[p.category].push(p); });
      let html = '<h3 style="color:#1e3a5f;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;">PHOTOS</h3>';
      for (const [cat, items] of Object.entries(grouped)) {
        html += `<p style="font-weight:bold;font-size:12px;color:#374151;margin:8px 0 4px;">${catLabels[cat] || cat}</p>`;
        items.forEach(p => {
          html += `<p style="margin:2px 0;font-size:12px;">&bull; ${p.label || 'Photo'} — <a href="${p.onedrive_url}" target="_blank" style="color:#3b82f6;">View Photo &rarr;</a></p>`;
        });
      }
      return html;
    })()}

    ${approvalUrl ? `
    <div style="margin:24px 0;padding:24px;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:8px;text-align:center;">
      <p style="margin:0 0 12px;font-size:15px;font-weight:bold;color:#065f46;">Ready to proceed?</p>
      <a href="${approvalUrl}" target="_blank" style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">&#10003; APPROVE THIS ESTIMATE</a>
      <p style="margin:12px 0 0;font-size:11px;color:#6b7280;">By clicking approve, you authorize Master Tech RV Repair &amp; Storage to proceed with the work described above.</p>
      <p style="margin:8px 0 0;font-size:11px;color:#6b7280;">Questions? Call (303) 557-2214 or reply to this email.</p>
    </div>` : ''}
  </div>
  <div style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">Master Tech RV Repair &amp; Storage<br/>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
    <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;">Questions? Call (303) 557-2214 or reply to this email.</p>
  </div>
</div></body></html>`;

    const subject = `${docType} #${r.record_number} — Master Tech RV Repair & Storage`;
    const result = await sendEmail({
      to: email,
      cc: 'service@mastertechrvrepair.com',
      subject,
      html,
      text: `${docType} #${r.record_number}\nCustomer: ${customerName}\nUnit: ${unit}\n${r.job_description ? 'Job Description: ' + r.job_description + '\n' : ''}Amount Due: ${fmtCur(amountDue)}\n\nFull details in the HTML version of this email.\n\nMaster Tech RV Repair & Storage\n6590 East 49th Avenue, Commerce City, CO 80022\n(303) 557-2214`,
    });

    if (result.success) {
      // Log to communication_log
      try {
        const logResult = await pool.query(
          `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content)
           VALUES ($1, $2, 'email', 'document_emailed', $3)
           RETURNING id`,
          [r.customer_id, r.id, `${docType} #${r.record_number} emailed to ${email}`]
        );
        console.log(`[Record ${r.record_number}] Comm log entry created: #${logResult.rows[0].id}`);
      } catch (logErr) {
        console.error('Comm log error:', logErr.message, logErr.detail || '');
      }
      res.json({ success: true, sentTo: email, docType });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error('POST /api/records/:id/email-document error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
