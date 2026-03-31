const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../services/email');
const { sendAppointmentSMS } = require('../services/sms');

// Build a timestamp string with Mountain Time offset for a given date+time
function toMountainTimestamp(date, time) {
  const dt = new Date(`${date}T${time}:00`);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', timeZoneName: 'shortOffset' })
    .formatToParts(dt);
  const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT-6';
  const m = tzPart.match(/GMT([+-])(\d+)/);
  const offset = m ? `${m[1]}${m[2].padStart(2, '0')}:00` : '-06:00';
  return `${date}T${time}:00${offset}`;
}

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
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const {
    customer_id, unit_id, record_id, appointment_type,
    scheduled_date, scheduled_time, duration_minutes,
    technician_id, dropoff_notes, pickup_notes, internal_notes,
    notify_customer, customer_email, customer_phone, job_description
  } = req.body;

  if (!customer_id || !appointment_type || !scheduled_date || !scheduled_time) {
    return res.status(400).json({
      error: 'customer_id, appointment_type, scheduled_date, and scheduled_time are required'
    });
  }

  // Combine date and time in Mountain Time (handles MST/MDT automatically)
  const scheduledAt = toMountainTimestamp(scheduled_date, scheduled_time);

  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments
         (customer_id, unit_id, record_id, appointment_type, scheduled_at,
          duration_minutes, technician_id, dropoff_notes, pickup_notes, internal_notes,
          notify_customer, customer_email, customer_phone, job_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
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
        job_description || null,
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

    // Send confirmation email + SMS
    const apptId = rows[0].id;
    console.log(`[Appt ${apptId}] Created — notify_customer: ${notify_customer}, customer_email: ${customer_email}`);
    let emailWarning = null;

    // Resolve email address (provided or fallback to customer record)
    let emailAddr = customer_email;
    if (!emailAddr) {
      try {
        const { rows: custRows } = await pool.query('SELECT email_primary FROM customers WHERE id = $1', [customer_id]);
        emailAddr = custRows[0]?.email_primary || null;
      } catch (lookupErr) {
        console.error(`[Appt ${apptId}] Email lookup error:`, lookupErr.message);
      }
    }

    // Always attempt email if customer has an email and notify is checked
    if (notify_customer && emailAddr) {
      const customerName = `${full[0].first_name || ''} ${full[0].last_name || ''}`.trim();
      const customerFirstName = full[0].first_name || '';
      const emailPayload = {
        customerName,
        customerEmail: emailAddr,
        appointmentDate: scheduled_date,
        appointmentTime: scheduled_time,
        appointmentType: appointment_type,
        durationMinutes: duration_minutes,
        notes: dropoff_notes,
      };

      console.log(`[Appt ${apptId}] Sending email to: ${emailAddr}`);
      try {
        let emailResult = await sendAppointmentConfirmation(emailPayload);
        console.log(`[Appt ${apptId}] Email result:`, JSON.stringify(emailResult));

        // Retry once on failure after 2 seconds
        if (!emailResult.success) {
          console.log(`[Appt ${apptId}] First attempt failed, retrying in 2s...`);
          await new Promise(r => setTimeout(r, 2000));
          emailResult = await sendAppointmentConfirmation(emailPayload);
          console.log(`[Appt ${apptId}] Retry result:`, JSON.stringify(emailResult));
        }

        if (!emailResult.success) {
          emailWarning = `Email failed: ${emailResult.error}`;
        }
      } catch (emailErr) {
        console.error(`[Appt ${apptId}] Email exception:`, emailErr.message);
        emailWarning = `Email failed: ${emailErr.message}`;
      }
    } else if (notify_customer && !emailAddr) {
      emailWarning = 'No customer email address available';
      console.log(`[Appt ${apptId}] No email address — skipping`);
    } else {
      console.log(`[Appt ${apptId}] notify_customer is false — skipping email`);
    }

    if (notify_customer) {
      // SMS — fire and forget
      const smsPhone = customer_phone || null;
      const smsFirstName = full[0].first_name || '';
      if (smsPhone) {
        sendAppointmentSMS(smsPhone, {
          customerFirstName: smsFirstName,
          appointmentDate: scheduled_date,
          appointmentTime: scheduled_time,
          appointmentType: appointment_type,
        }).catch(err => console.error('SMS error:', err.message));
      }
    }

    const response = { ...full[0] };
    if (emailWarning) response.emailWarning = emailWarning;
    res.status(201).json(response);
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/appointments/:id — Update appointment
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const {
    customer_id, unit_id, record_id, appointment_type,
    scheduled_date, scheduled_time, duration_minutes,
    technician_id, status, dropoff_notes, pickup_notes, internal_notes, job_description
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
    values.push(toMountainTimestamp(scheduled_date, scheduled_time));
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
  if (job_description !== undefined) { updates.push(`job_description = $${idx++}`); values.push(job_description || null); }

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
// POST /api/appointments/:id/resend-confirmation — Resend confirmation email
// ---------------------------------------------------------------------------
router.post('/:id/resend-confirmation', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
              c.last_name, c.first_name, c.email_primary,
              t.name AS technician_name
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       LEFT JOIN technicians t ON t.id = a.technician_id
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = rows[0];
    const emailAddr = appt.customer_email || appt.email_primary;

    if (!emailAddr) {
      return res.status(400).json({ error: 'No email address on file for this customer.' });
    }

    const dt = new Date(appt.scheduled_at);
    const scheduled_date = dt.toLocaleDateString('en-CA');
    const scheduled_time = dt.toTimeString().slice(0, 5);
    const customerName = `${appt.first_name || ''} ${appt.last_name || ''}`.trim();

    const result = await sendAppointmentConfirmation({
      customerName,
      customerEmail: emailAddr,
      appointmentDate: scheduled_date,
      appointmentTime: scheduled_time,
      appointmentType: appt.appointment_type,
      durationMinutes: appt.duration_minutes,
      notes: appt.dropoff_notes,
    });

    if (result.success) {
      res.json({ success: true, email: emailAddr });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error('POST /api/appointments/:id/resend-confirmation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/appointments/bulk-resend — Resend confirmations for all upcoming
// ---------------------------------------------------------------------------
router.post('/bulk-resend', requireRole('admin'), async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const { rows } = await pool.query(
      `SELECT a.*,
              c.last_name, c.first_name, c.email_primary
       FROM appointments a
       JOIN customers c ON c.id = a.customer_id
       WHERE a.deleted_at IS NULL
         AND a.status NOT IN ('cancelled', 'complete', 'no_show')
         AND a.scheduled_at >= $1::date
         AND (a.customer_email IS NOT NULL OR c.email_primary IS NOT NULL)
       ORDER BY a.scheduled_at`,
      [today]
    );

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const appt of rows) {
      const emailAddr = appt.customer_email || appt.email_primary;
      const dt = new Date(appt.scheduled_at);
      const scheduled_date = dt.toLocaleDateString('en-CA');
      const scheduled_time = dt.toTimeString().slice(0, 5);
      const customerName = `${appt.first_name || ''} ${appt.last_name || ''}`.trim();

      try {
        const result = await sendAppointmentConfirmation({
          customerName,
          customerEmail: emailAddr,
          appointmentDate: scheduled_date,
          appointmentTime: scheduled_time,
          appointmentType: appt.appointment_type,
          durationMinutes: appt.duration_minutes,
          notes: appt.dropoff_notes,
        });
        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${customerName}: ${result.error}`);
        }
      } catch (emailErr) {
        failed++;
        errors.push(`${customerName}: ${emailErr.message}`);
      }
    }

    res.json({ total: rows.length, sent, failed, errors: errors.slice(0, 10) });
  } catch (err) {
    console.error('POST /api/appointments/bulk-resend error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/appointments/:id — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { send_cancellation_email, cancellation_reason } = req.body || {};

  try {
    // Fetch full appointment + customer info before deleting
    const { rows: apptRows } = await pool.query(
      `SELECT a.*, c.first_name, c.last_name, c.email_primary
       FROM appointments a
       LEFT JOIN customers c ON c.id = a.customer_id
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [req.params.id]
    );

    if (apptRows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = apptRows[0];

    // Soft delete
    await pool.query(
      'UPDATE appointments SET deleted_at = NOW() WHERE id = $1',
      [req.params.id]
    );

    // Send cancellation email if requested
    let emailSent = false;
    let emailError = null;

    if (send_cancellation_email && appt.email_primary) {
      try {
        const { sendEmail } = require('../services/email');
        const scheduledDate = appt.scheduled_at
          ? new Date(appt.scheduled_at).toLocaleDateString('en-US', { timeZone: 'America/Denver', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : '—';
        const scheduledTime = appt.scheduled_at
          ? new Date(appt.scheduled_at).toLocaleTimeString('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit' })
          : '';
        const typeLabel = (appt.appointment_type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const firstName = appt.first_name || 'Valued Customer';

        const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1e3a5f;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:18px">Master Tech RV Repair &amp; Storage</h1>
  </div>
  <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 16px">Hello ${firstName},</p>
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#dc2626">Your appointment has been cancelled.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 16px">
      <table style="width:100%;font-size:14px">
        <tr><td style="padding:4px 0;color:#6b7280;width:80px"><strong>Date:</strong></td><td>${scheduledDate}${scheduledTime ? ' at ' + scheduledTime : ''}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280"><strong>Type:</strong></td><td>${typeLabel}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280"><strong>Location:</strong></td><td>6590 East 49th Avenue, Commerce City, CO 80022</td></tr>
      </table>
    </div>
    ${cancellation_reason ? `<p style="margin:0 0 16px"><strong>Reason:</strong> ${cancellation_reason}</p>` : ''}
    <p style="margin:0 0 16px">Please contact us to reschedule at your convenience.</p>
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px;font-size:13px;color:#6b7280">
      <p style="margin:0 0 4px"><strong>Phone:</strong> (303) 557-2214</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> service@mastertechrvrepair.com</p>
      <p style="margin:0 0 4px"><strong>Website:</strong> mastertechrvrepair.com</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center">Thank you for choosing Master Tech RV Repair &amp; Storage</p>
  </div>
</div>`;

        const result = await sendEmail({
          to: appt.email_primary,
          cc: 'service@mastertechrvrepair.com',
          subject: 'Appointment Cancelled — Master Tech RV Repair & Storage',
          html,
          text: `Hello ${firstName},\n\nYour appointment has been cancelled.\n\nDate: ${scheduledDate}${scheduledTime ? ' at ' + scheduledTime : ''}\nType: ${typeLabel}\nLocation: 6590 East 49th Avenue, Commerce City, CO 80022\n${cancellation_reason ? 'Reason: ' + cancellation_reason + '\n' : ''}\nPlease contact us to reschedule at your convenience.\n\nPhone: (303) 557-2214\nEmail: service@mastertechrvrepair.com\n\nMaster Tech RV Repair & Storage`,
        });

        emailSent = result.success;
        if (!result.success) emailError = result.error;

        // Log communication
        if (appt.customer_id) {
          await pool.query(
            `INSERT INTO communications (customer_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id)
             VALUES ($1, 'email', 'appointment_cancelled', $2, $3, false, $4)`,
            [appt.customer_id, `Cancellation email sent to ${appt.email_primary} for appointment on ${scheduledDate}`, result.success ? 'delivered' : 'failed', req.user?.id]
          );
        }
      } catch (e) {
        emailError = e.message;
        console.error('Cancellation email error:', e);
      }
    }

    res.json({
      message: 'Appointment deleted',
      appointment: { id: appt.id, appointment_type: appt.appointment_type, scheduled_at: appt.scheduled_at },
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error('DELETE /api/appointments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
