const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { getSetting } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');
// Square billing removed — Square handles recurring billing automatically

// ---------------------------------------------------------------------------
// GET /api/storage — List all spaces with occupancy status
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { rows: spaces } = await pool.query(
      `SELECT s.id, s.space_type, s.label, s.is_active, s.notes AS space_notes,
              s.linear_feet AS space_linear_feet,
              sb.id AS billing_id, sb.customer_id, sb.unit_id,
              sb.monthly_rate, sb.billing_start_date, sb.billing_end_date,
              sb.due_day, sb.square_customer_id, sb.square_sub_id,
              sb.notes AS billing_notes,
              c.last_name, c.first_name, c.company_name, c.account_number,
              c.phone_primary,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
              u.license_plate, u.linear_feet AS unit_linear_feet
       FROM storage_spaces s
       LEFT JOIN storage_billing sb ON sb.space_id = s.id
         AND sb.billing_end_date IS NULL
         AND sb.deleted_at IS NULL
       LEFT JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE s.deleted_at IS NULL AND s.is_active = TRUE
       ORDER BY s.space_type, s.label`
    );

    // Fetch rates from system settings
    const outdoorRate = await getSetting('outdoor_monthly_rate') || '150.00';
    const indoorRate = await getSetting('indoor_monthly_rate') || '250.00';

    const outdoor = spaces.filter(s => s.space_type === 'outdoor');
    const indoor = spaces.filter(s => s.space_type === 'indoor');

    res.json({
      spaces,
      summary: {
        total: spaces.length,
        outdoor: { total: outdoor.length, occupied: outdoor.filter(s => s.billing_id).length },
        indoor: { total: indoor.length, occupied: indoor.filter(s => s.billing_id).length },
      },
      rates: {
        outdoor_monthly: parseFloat(outdoorRate),
        indoor_monthly: parseFloat(indoorRate),
      },
    });
  } catch (err) {
    console.error('GET /api/storage error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/storage/billing-report — Monthly billing summary
// Query params: month (YYYY-MM), defaults to current month
// ---------------------------------------------------------------------------
router.get('/billing-report', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { month } = req.query;
  const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    // All active billings that overlap with the target month
    const { rows } = await pool.query(
      `SELECT sb.*,
              s.space_type, s.label AS space_label,
              c.last_name, c.first_name, c.company_name, c.account_number,
              c.phone_primary, c.email_primary,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.deleted_at IS NULL
         AND sb.billing_start_date <= ($1 || '-01')::date + INTERVAL '1 month' - INTERVAL '1 day'
         AND (sb.billing_end_date IS NULL OR sb.billing_end_date >= ($1 || '-01')::date)
       ORDER BY s.space_type, s.label`,
      [targetMonth]
    );

    const totalMonthly = rows.reduce((sum, r) => sum + parseFloat(r.monthly_rate), 0);

    res.json({
      month: targetMonth,
      billings: rows,
      total_active: rows.length,
      total_monthly_revenue: parseFloat(totalMonthly.toFixed(2)),
    });
  } catch (err) {
    console.error('GET /api/storage/billing-report error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/storage/customer/:customerId — Billing history for a customer
// ---------------------------------------------------------------------------
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.*,
              s.space_type, s.label AS space_label,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.customer_id = $1 AND sb.deleted_at IS NULL
       ORDER BY sb.billing_start_date DESC`,
      [req.params.customerId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /api/storage/customer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/storage/spaces — Add a new storage space (admin only)
// ---------------------------------------------------------------------------
router.post('/spaces', requireRole('admin'), async (req, res) => {
  const { space_number, space_type, notes, linear_feet } = req.body;

  if (!space_number || !space_type) {
    return res.status(400).json({ error: 'space_number and space_type are required' });
  }

  if (!['outdoor', 'indoor'].includes(space_type)) {
    return res.status(400).json({ error: 'space_type must be outdoor or indoor' });
  }

  try {
    // Generate label from type + number
    const label = `${space_type.charAt(0).toUpperCase() + space_type.slice(1)} ${space_number}`;

    const { rows } = await pool.query(
      `INSERT INTO storage_spaces (space_type, label, notes, is_active, linear_feet)
       VALUES ($1, $2, $3, TRUE, $4) RETURNING *`,
      [space_type, label, notes || null, linear_feet || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/storage/spaces error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/storage/assign — Assign customer/unit to a storage space
// Body: { space_id, customer_id, unit_id?, monthly_rate?, due_day?,
//         square_customer_id?, square_sub_id? }
// ---------------------------------------------------------------------------
router.post('/assign', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const {
    space_id, customer_id, unit_id,
    monthly_rate, due_day,
    square_customer_id, square_sub_id,
    billing_start_date, notes
  } = req.body;

  if (!space_id || !customer_id) {
    return res.status(400).json({ error: 'space_id and customer_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify space exists and is active
    const { rows: spaceRows } = await client.query(
      'SELECT * FROM storage_spaces WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL',
      [space_id]
    );
    if (spaceRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Storage space not found or inactive' });
    }

    const space = spaceRows[0];

    // Check space is not already occupied
    const { rows: existing } = await client.query(
      `SELECT id FROM storage_billing
       WHERE space_id = $1 AND billing_end_date IS NULL AND deleted_at IS NULL`,
      [space_id]
    );
    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Space is already occupied' });
    }

    // Verify customer exists
    const { rows: custRows } = await client.query(
      'SELECT id FROM customers WHERE id = $1 AND deleted_at IS NULL',
      [customer_id]
    );
    if (custRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Determine rate: explicit, or from system settings based on space type
    let rate = monthly_rate;
    if (rate === undefined || rate === null || rate === '') {
      const settingKey = space.space_type === 'indoor' ? 'indoor_monthly_rate' : 'outdoor_monthly_rate';
      rate = await getSetting(settingKey) || (space.space_type === 'indoor' ? '250.00' : '150.00');
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

    const { rows } = await client.query(
      `INSERT INTO storage_billing
         (customer_id, unit_id, space_id, monthly_rate, billing_start_date,
          due_day, square_customer_id, square_sub_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        customer_id,
        unit_id || null,
        space_id,
        parseFloat(rate),
        billing_start_date || today,
        due_day || 1,
        square_customer_id || null,
        square_sub_id || null,
        notes || null,
      ]
    );

    // Flag customer as storage customer
    await client.query(
      'UPDATE customers SET is_storage_customer = TRUE WHERE id = $1',
      [customer_id]
    );

    await client.query('COMMIT');

    // Re-fetch with joined data
    const { rows: full } = await pool.query(
      `SELECT sb.*,
              s.space_type, s.label AS space_label,
              c.last_name, c.first_name, c.company_name,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.id = $1`,
      [rows[0].id]
    );

    res.status(201).json(full[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/storage/assign error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/storage/:id — Update a storage billing record
// Allowed: monthly_rate, due_day, unit_id, square_customer_id, square_sub_id, notes
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { monthly_rate, due_day, unit_id, square_customer_id, square_sub_id, notes, billing_start_date, space_type } = req.body;

  const updates = [];
  const values = [];
  let idx = 1;

  if (monthly_rate !== undefined) {
    updates.push(`monthly_rate = $${idx++}`);
    values.push(parseFloat(monthly_rate));
  }
  if (due_day !== undefined) {
    updates.push(`due_day = $${idx++}`);
    values.push(parseInt(due_day));
  }
  if (unit_id !== undefined) {
    updates.push(`unit_id = $${idx++}`);
    values.push(unit_id || null);
  }
  if (square_customer_id !== undefined) {
    updates.push(`square_customer_id = $${idx++}`);
    values.push(square_customer_id || null);
  }
  if (square_sub_id !== undefined) {
    updates.push(`square_sub_id = $${idx++}`);
    values.push(square_sub_id || null);
  }
  if (notes !== undefined) {
    updates.push(`notes = $${idx++}`);
    values.push(notes || null);
  }
  if (billing_start_date !== undefined) {
    updates.push(`billing_start_date = $${idx++}`);
    values.push(billing_start_date);
  }

  if (updates.length === 0 && !space_type) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    let billing;
    if (updates.length > 0) {
      const { rows } = await pool.query(
        `UPDATE storage_billing SET ${updates.join(', ')}
         WHERE id = $${idx} AND deleted_at IS NULL AND billing_end_date IS NULL
         RETURNING *`,
        values
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Active storage billing record not found' });
      }
      billing = rows[0];
    } else {
      const { rows } = await pool.query(
        'SELECT * FROM storage_billing WHERE id = $1 AND deleted_at IS NULL AND billing_end_date IS NULL',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Active storage billing record not found' });
      }
      billing = rows[0];
    }

    // Update storage_spaces fields if provided
    if (space_type && ['indoor', 'outdoor'].includes(space_type)) {
      await pool.query(
        'UPDATE storage_spaces SET space_type = $1 WHERE id = $2',
        [space_type, billing.space_id]
      );
    }
    if (req.body.space_linear_feet !== undefined && billing.space_id) {
      try {
        await pool.query(
          'UPDATE storage_spaces SET linear_feet = $1 WHERE id = $2',
          [req.body.space_linear_feet || null, billing.space_id]
        );
      } catch { /* column may not exist */ }
    }

    res.json(billing);
  } catch (err) {
    console.error('PATCH /api/storage/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/storage/:id — End storage (set billing_end_date)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const endDate = req.body?.end_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

  try {
    const { rows } = await pool.query(
      `UPDATE storage_billing SET billing_end_date = $1, deleted_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL AND billing_end_date IS NULL
       RETURNING *`,
      [endDate, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Active storage billing record not found' });
    }

    // is_storage_customer stays TRUE as a historical marker — do not unset

    res.json({ message: 'Storage ended', billing: rows[0] });
  } catch (err) {
    console.error('DELETE /api/storage/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/storage/billing-preview — Preview monthly billing run
// Returns active billings and total for confirmation before running
// ---------------------------------------------------------------------------
router.get('/billing-preview', requireRole('admin'), async (req, res) => {
  try {
    const { rows: billings } = await pool.query(
      `SELECT sb.id AS billing_id, sb.customer_id, sb.monthly_rate, sb.space_id,
              s.label AS space_label, s.space_type,
              c.last_name, c.first_name, c.company_name
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       WHERE sb.deleted_at IS NULL AND sb.billing_end_date IS NULL
       ORDER BY s.label`
    );

    const total = billings.reduce((sum, b) => sum + parseFloat(b.monthly_rate), 0);

    res.json({
      count: billings.length,
      total_amount: parseFloat(total.toFixed(2)),
      billings: billings.map(b => ({
        billing_id: b.billing_id,
        space: b.space_label,
        customer: b.company_name || `${b.last_name}${b.first_name ? ', ' + b.first_name : ''}`,
        amount: parseFloat(b.monthly_rate),
      })),
    });
  } catch (err) {
    console.error('GET /api/storage/billing-preview error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/storage/run-billing — Record monthly billing run internally
// No Square API calls — inserts into storage_charges table
// ---------------------------------------------------------------------------
router.post('/run-billing', requireRole('admin'), async (req, res) => {
  const { charge_month } = req.body;
  const month = charge_month || new Date().toISOString().slice(0, 7);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check for duplicate run in same month
    const { rows: existing } = await client.query(
      'SELECT COUNT(*) FROM storage_charges WHERE charge_month = $1',
      [month]
    );
    if (parseInt(existing[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Billing already recorded for ${month}. Found ${existing[0].count} existing charge(s).`,
      });
    }

    // Get all active billings
    const { rows: billings } = await client.query(
      `SELECT sb.id AS billing_id, sb.customer_id, sb.monthly_rate, sb.space_id,
              s.label AS space_label,
              c.last_name, c.first_name, c.company_name
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       WHERE sb.deleted_at IS NULL AND sb.billing_end_date IS NULL
       ORDER BY s.label`
    );

    if (billings.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No active storage billings to charge' });
    }

    const results = [];
    let totalAmount = 0;

    for (const billing of billings) {
      const amount = parseFloat(billing.monthly_rate);
      const customerName = billing.company_name
        || `${billing.last_name}${billing.first_name ? ', ' + billing.first_name : ''}`;

      await client.query(
        `INSERT INTO storage_charges (billing_id, customer_id, space_id, amount, charge_month, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [billing.billing_id, billing.customer_id, billing.space_id, amount, month,
         `Storage: ${billing.space_label} — ${customerName}`, req.user?.id || null]
      );

      totalAmount += amount;
      results.push({
        billing_id: billing.billing_id,
        space: billing.space_label,
        customer: customerName,
        status: 'recorded',
        amount,
      });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Billing run recorded',
      charge_month: month,
      total: billings.length,
      recorded: billings.length,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      results,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/storage/run-billing error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// POST /api/storage/charges — Manually add a storage charge
// ---------------------------------------------------------------------------
router.post('/charges', requireRole('admin'), async (req, res) => {
  const { customer_id, space_id, amount, charge_month, charge_date, notes } = req.body;

  if (!customer_id || !amount || !charge_month) {
    return res.status(400).json({ error: 'customer_id, amount, and charge_month are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO storage_charges (billing_id, customer_id, space_id, amount, charge_month, charge_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        null,
        parseInt(customer_id),
        space_id ? parseInt(space_id) : null,
        parseFloat(amount),
        charge_month,
        charge_date || charge_month + '-01',
        notes || null,
        req.user?.id || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/storage/charges error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storage/charges — List charge history by month
// ---------------------------------------------------------------------------
router.get('/charges', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { month, customer_id } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (month) {
    conditions.push(`sc.charge_month = $${idx++}`);
    params.push(month);
  }

  if (customer_id) {
    conditions.push(`sc.customer_id = $${idx++}`);
    params.push(parseInt(customer_id));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT sc.*, s.label AS space_label, s.space_type,
              c.last_name, c.first_name, c.company_name
       FROM storage_charges sc
       LEFT JOIN storage_spaces s ON s.id = sc.space_id
       JOIN customers c ON c.id = sc.customer_id
       ${where}
       ORDER BY sc.charge_month DESC, s.label`,
      params
    );

    res.json({ charges: rows });
  } catch (err) {
    console.error('GET /api/storage/charges error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/storage/charges/:id — Delete a storage charge
// ---------------------------------------------------------------------------
router.delete('/charges/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM storage_charges WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/storage/charges/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/storage/charges/:id — Edit a storage charge
// ---------------------------------------------------------------------------
router.patch('/charges/:id', requireRole('admin'), async (req, res) => {
  const { amount, charge_date, notes } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;

  if (amount !== undefined) { updates.push(`amount = $${idx++}`); values.push(parseFloat(amount)); }
  if (charge_date !== undefined) { updates.push(`charge_date = $${idx++}`); values.push(charge_date); }
  if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE storage_charges SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/storage/charges/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================================================
// WAITLIST ROUTES
// ===========================================================================

// GET /api/storage/waitlist — List waitlist entries
router.get('/waitlist', async (req, res) => {
  try {
    const { space_type, status } = req.query;
    let sql = `
      SELECT w.*,
             c.first_name AS cust_first, c.last_name AS cust_last,
             c.phone AS cust_phone, c.email AS cust_email
        FROM storage_waitlist w
        LEFT JOIN customers c ON c.id = w.customer_id
       WHERE 1=1`;
    const params = [];
    if (space_type) {
      params.push(space_type);
      sql += ` AND w.space_type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND w.status = $${params.length}`;
    } else {
      sql += ` AND w.status IN ('waiting', 'notified')`;
    }
    sql += ` ORDER BY w.space_type, w.position ASC NULLS LAST, w.created_at ASC`;
    const { rows } = await pool.query(sql, params);
    // Return counts by type
    const countRes = await pool.query(
      `SELECT space_type, COUNT(*) AS cnt
         FROM storage_waitlist WHERE status IN ('waiting','notified')
        GROUP BY space_type`
    );
    const counts = { indoor: 0, outdoor: 0 };
    countRes.rows.forEach(r => { counts[r.space_type] = parseInt(r.cnt); });
    res.json({ entries: rows, counts });
  } catch (err) {
    console.error('GET /api/storage/waitlist error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/storage/waitlist — Add to waitlist
router.post('/waitlist', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const {
      customer_id, contact_name, contact_phone, contact_email,
      space_type, rv_year, rv_make, rv_model, rv_length_feet,
      preferred_start, budget_monthly, notes
    } = req.body;
    if (!space_type || !['indoor', 'outdoor'].includes(space_type)) {
      return res.status(400).json({ error: 'space_type must be indoor or outdoor' });
    }
    if (!customer_id && !contact_name) {
      return res.status(400).json({ error: 'Either customer_id or contact_name is required' });
    }
    // Auto-assign position (next in line for this type)
    const posRes = await pool.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_pos
         FROM storage_waitlist
        WHERE space_type = $1 AND status IN ('waiting', 'notified')`,
      [space_type]
    );
    const position = posRes.rows[0].next_pos;
    const { rows } = await pool.query(
      `INSERT INTO storage_waitlist
         (customer_id, contact_name, contact_phone, contact_email,
          space_type, rv_year, rv_make, rv_model, rv_length_feet,
          preferred_start, budget_monthly, notes, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [customer_id || null, contact_name || null, contact_phone || null, contact_email || null,
       space_type, rv_year || null, rv_make || null, rv_model || null, rv_length_feet || null,
       preferred_start || null, budget_monthly || null, notes || null, position]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/storage/waitlist error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/storage/waitlist/:id — Update waitlist entry
router.patch('/waitlist/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['contact_name', 'contact_phone', 'contact_email', 'space_type',
                    'rv_year', 'rv_make', 'rv_model', 'rv_length_feet',
                    'preferred_start', 'budget_monthly', 'notes', 'status', 'position', 'customer_id'];
    const sets = [];
    const params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        params.push(req.body[f] === '' ? null : req.body[f]);
        sets.push(`${f} = $${params.length}`);
      }
    });
    if (req.body.status === 'notified') {
      sets.push(`notified_at = NOW()`);
    } else if (req.body.status === 'assigned') {
      sets.push(`assigned_at = NOW()`);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    sets.push('updated_at = NOW()');
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE storage_waitlist SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/storage/waitlist/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/storage/waitlist/:id — Remove from waitlist (sets status to cancelled)
router.delete('/waitlist/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE storage_waitlist SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/storage/waitlist/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/storage/waitlist/:id/notify — Notify customer of availability
router.post('/waitlist/:id/notify', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT w.*, c.first_name, c.last_name, c.phone, c.email
         FROM storage_waitlist w LEFT JOIN customers c ON c.id = w.customer_id
        WHERE w.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const entry = rows[0];
    const name = entry.first_name || entry.contact_name || 'Customer';
    const email = entry.email || entry.contact_email;
    const phone = entry.phone || entry.contact_phone;
    const typeLabel = entry.space_type === 'indoor' ? 'indoor' : 'outdoor';

    const results = { email: null, sms: null };

    // Send email notification
    if (email) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Master Tech RV <service@mastertechrvrepair.com>',
          to: email,
          subject: `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Storage Space Available — Master Tech RV`,
          html: `<p>Hi ${name},</p>
<p>Great news! An <strong>${typeLabel} storage</strong> space has become available at Master Tech RV Repair & Storage.</p>
<p>Since you're on our waitlist, we wanted to give you first opportunity to reserve this spot.</p>
<p>Please call us at <strong>(303) 557-2214</strong> or reply to this email as soon as possible to secure your space. Spots fill up quickly!</p>
<p>Thank you,<br/>Master Tech RV Repair & Storage</p>`
        });
        results.email = 'sent';
      } catch (emailErr) {
        console.error('Waitlist email error:', emailErr);
        results.email = 'failed: ' + emailErr.message;
      }
    }

    // Send SMS notification (if Twilio is configured)
    if (phone && process.env.TWILIO_ACCOUNT_SID) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const cleanPhone = phone.replace(/\D/g, '');
        const toPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;
        await twilio.messages.create({
          body: `Hi ${name}! An ${typeLabel} storage space is now available at Master Tech RV. Call us at (303) 557-2214 to reserve your spot before it's taken!`,
          from: process.env.TWILIO_FROM_NUMBER,
          to: toPhone
        });
        results.sms = 'sent';
      } catch (smsErr) {
        console.error('Waitlist SMS error:', smsErr);
        results.sms = 'failed: ' + smsErr.message;
      }
    }

    // Mark as notified
    await pool.query(
      `UPDATE storage_waitlist SET status = 'notified', notified_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    res.json({ success: true, results });
  } catch (err) {
    console.error('POST /api/storage/waitlist/:id/notify error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
