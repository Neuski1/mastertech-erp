const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../services/email');
const { sendAppointmentSMS } = require('../services/sms');

// ---------------------------------------------------------------------------
// GET /api/appointments — List with filters (date range, status, technician)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const {
    date_from, date_to, status, technician_id, customer_id,
    page = 1, limit = 100, sort = 'scheduled_at', order = 'asc'
  } = req.query;

  const conditions = ['a.deleted_at IS NULL'];
  const params = [];
  let idx = 1;

  if (date_from) {
    conditions.push(`a.scheduled_at >= $${idx++}`);
    params.push(date_from);
  }
  if (date_to) {
    conditions.push(`a.scheduled_at < ($${idx++}::date + INTERVAL '1 day')`);
    params.push(date_to);
  }
  if (status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(status);
  }
  if (technician_id) {
    conditions.push(`a.technician_id = $${idx++}`);
    params.push(technician_id);
  }
  if (customer_id) {
    conditions.push(`a.customer_id = $${idx++}`);
    params.push(customer_id);
  }

  const allowedSorts = ['scheduled_at', 'appointment_type', 'status'];
  const sortCol = allowedSorts.includes(sort) ? `a.${sort}` : 'a.scheduled_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM appointments a WHERE ${conditions.join(' AND ')}`,
      params
    );

    const { rows } = await pool.query(
      `SELECT a.*,
              c.last_name, c.first_name, c.company_name, c.phone_primary,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
              t.name AS technician_name,
              r.record_number
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       LEFT JOIN units u ON u.id = a.unit_id
       LEFT JOIN technicians t ON t.id = a.technician_id
       LEFT JOIN records r ON r.id = a.record_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      appointments: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/appointments/:id — Single appointment
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
              c.last_name, c.first_name, c.company_name, c.phone_primary, c.email_primary,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model, u.vin,
              t.name AS technician_name,
              r.record_number, r.status AS record_status
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       LEFT JOIN units u ON u.id = a.unit_id
       LEFT JOIN technicians t ON t.id = a.technician_id
       LEFT JOIN records r ON r.id = a.record_id
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/appointments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/appointments — Create appointment
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer'), async (req, res) => {
  const {
    customer_id, unit_id, record_id, appointment_type,
    scheduled_date, scheduled_time, duration_minutes,
    technician_id, dropoff_notes, pickup_notes, internal_notes,
    notify_customer, customer_email, customer_phone
  } = req.body;

  if (!customer_id || !appointment_type || !scheduled_date || !scheduled_time) {
    return res.status(400).json({
      error: 'customer_id, appointment_type, scheduled_date, and scheduled_time are required'
    });
  }

  // Combine date and time into a single timestamp
  const scheduledAt = `${scheduled_date}T${scheduled_time}`;

  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments
         (customer_id, unit_id, record_id, appointment_type, scheduled_at,
          duration_minutes, technician_id, dropoff_notes, pickup_notes, internal_notes,
          notify_customer, customer_email, customer_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        customer_id,
        unit_id || null,
        record_id || null,
        appointment_type,
        scheduledAt,
        duration_minutes || null,
        technician_id || null,
        dropoff_notes || null,
        pickup_notes || null,
        internal_notes || null,
        notify_customer || false,
        customer_email || null,
        customer_phone || null,
      ]
    );

    // Re-fetch with joined data
    const { rows: full } = await pool.query(
      `SELECT a.*,
              c.last_name, c.first_name, c.company_name,
              t.name AS technician_name
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       LEFT JOIN technicians t ON t.id = a.technician_id
       WHERE a.id = $1`,
      [rows[0].id]
    );

    // Send confirmation email + SMS if notify_customer is true
    if (notify_customer) {
      const customerName = `${full[0].first_name || ''} ${full[0].last_name || ''}`.trim();
      const customerFirstName = full[0].first_name || '';
      const emailPayload = {
        customerName,
        appointmentDate: scheduled_date,
        appointmentTime: scheduled_time,
        appointmentType: appointment_type,
        durationMinutes: duration_minutes,
        notes: dropoff_notes,
      };

      // Resolve email address (provided or fallback to customer record)
      const resolveEmail = async () => {
        if (customer_email) return customer_email;
        try {
          const { rows: custRows } = await pool.query('SELECT email_primary FROM customers WHERE id = $1', [customer_id]);
          return custRows[0]?.email_primary || null;
        } catch (err) {
          console.error('Email lookup error:', err.message);
          return null;
        }
      };

      // Fire and forget — don't block response
      resolveEmail().then(emailAddr => {
        if (emailAddr) {
          sendAppointmentConfirmation({ ...emailPayload, customerEmail: emailAddr });
        }
      });

      // SMS — fire and forget
      const smsPhone = customer_phone || null;
      if (smsPhone) {
        sendAppointmentSMS(smsPhone, {
          customerFirstName,
          appointmentDate: scheduled_date,
          appointmentTime: scheduled_time,
          appointmentType: appointment_type,
        }).catch(err => console.error('SMS error:', err.message));
      }
    }

    res.status(201).json(full[0]);
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/appointments/:id — Update appointment
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  const {
    customer_id, unit_id, record_id, appointment_type,
    scheduled_date, scheduled_time, duration_minutes,
    technician_id, status, dropoff_notes, pickup_notes, internal_notes
  } = req.body;

  const updates = [];
  const values = [];
  let idx = 1;

  if (customer_id !== undefined) { updates.push(`customer_id = $${idx++}`); values.push(customer_id); }
  if (unit_id !== undefined) { updates.push(`unit_id = $${idx++}`); values.push(unit_id || null); }
  if (record_id !== undefined) { updates.push(`record_id = $${idx++}`); values.push(record_id || null); }
  if (appointment_type !== undefined) { updates.push(`appointment_type = $${idx++}`); values.push(appointment_type); }
  if (scheduled_date !== undefined && scheduled_time !== undefined) {
    updates.push(`scheduled_at = $${idx++}`);
    values.push(`${scheduled_date}T${scheduled_time}`);
  } else if (scheduled_date !== undefined) {
    // Only date changed, preserve existing time — handled with subquery
    updates.push(`scheduled_at = ($${idx++}::date + scheduled_at::time)`);
    values.push(scheduled_date);
  } else if (scheduled_time !== undefined) {
    updates.push(`scheduled_at = (scheduled_at::date + $${idx++}::time)`);
    values.push(scheduled_time);
  }
  if (duration_minutes !== undefined) { updates.push(`duration_minutes = $${idx++}`); values.push(duration_minutes || null); }
  if (technician_id !== undefined) { updates.push(`technician_id = $${idx++}`); values.push(technician_id || null); }
  if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }
  if (dropoff_notes !== undefined) { updates.push(`dropoff_notes = $${idx++}`); values.push(dropoff_notes || null); }
  if (pickup_notes !== undefined) { updates.push(`pickup_notes = $${idx++}`); values.push(pickup_notes || null); }
  if (internal_notes !== undefined) { updates.push(`internal_notes = $${idx++}`); values.push(internal_notes || null); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE appointments SET ${updates.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/appointments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/appointments/:id — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE appointments SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, appointment_type, scheduled_at`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted', appointment: rows[0] });
  } catch (err) {
    console.error('DELETE /api/appointments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
