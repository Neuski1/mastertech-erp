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
       JOIN storage_spaces s ON s.id = sc.space_id
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

module.exports = router;
