/**
 * Storage Contract Routes
 * - Generate contract PDF (download or email)
 * - Digital acceptance (public, token-based)
 * - Send storage guidelines email
 */
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateContractPDF, getGuidelinesHTML } = require('../services/storageContract');
const { sendEmail } = require('../services/email');

// ──────────────────────────────────────────────────────
// POST /api/storage-contract/generate — Generate + return PDF
//   body: { billing_id } or { waitlist_data: {...} }
// ──────────────────────────────────────────────────────
router.post('/generate', requireAuth, requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    let data = {};

    if (req.body.billing_id) {
      // Pull from existing storage billing record
      const { rows } = await pool.query(
        `SELECT sb.*, s.space_type, s.label, s.linear_feet AS space_linear_feet,
                c.first_name, c.last_name, c.phone_primary, c.email_primary,
                c.company_name,
                u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
                u.license_plate, u.vin, u.linear_feet AS unit_linear_feet
         FROM storage_billing sb
         JOIN storage_spaces s ON s.id = sb.space_id
         JOIN customers c ON c.id = sb.customer_id
         LEFT JOIN units u ON u.id = sb.unit_id
         WHERE sb.id = $1 AND sb.deleted_at IS NULL`,
        [req.body.billing_id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Billing record not found' });
      const r = rows[0];
      const linearFeet = r.unit_linear_feet || r.space_linear_feet || '';
      const monthlyRate = parseFloat(r.monthly_rate) || 0;

      data = {
        lessee_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.company_name || '',
        lessee_phone: r.phone_primary || '',
        lessee_email: r.email_primary || '',
        rv_year: r.unit_year || '',
        rv_make: r.unit_make || '',
        rv_model: r.unit_model || '',
        rv_length_feet: linearFeet ? `${linearFeet} ft` : '',
        license_plate: r.license_plate || '',
        vin: r.vin || '',
        space_type: r.space_type,
        start_date: r.billing_start_date ? new Date(r.billing_start_date).toLocaleDateString('en-US') : '',
        monthly_amount: monthlyRate.toFixed(2),
        lease_date: new Date().toLocaleDateString('en-US'),
        // Digital acceptance info if already accepted
        accepted_at: r.contract_accepted_at ? new Date(r.contract_accepted_at).toLocaleString('en-US', { timeZone: 'America/Denver' }) : null,
        accepted_ip: r.contract_accepted_ip || null,
      };
    } else if (req.body.waitlist_data) {
      // Pre-fill from waitlist data (before formal assignment)
      const w = req.body.waitlist_data;
      data = {
        lessee_name: w.contact_name || '',
        lessee_phone: w.contact_phone || '',
        lessee_email: w.contact_email || '',
        rv_year: w.rv_year || '',
        rv_make: w.rv_make || '',
        rv_model: w.rv_model || '',
        rv_length_feet: w.rv_length_feet ? `${w.rv_length_feet} ft` : '',
        space_type: w.space_type || 'indoor',
        lease_date: new Date().toLocaleDateString('en-US'),
      };
    } else {
      return res.status(400).json({ error: 'Provide billing_id or waitlist_data' });
    }

    // Merge any overrides from body
    if (req.body.overrides) Object.assign(data, req.body.overrides);

    const pdfBuffer = await generateContractPDF(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Storage_Contract_${(data.lessee_name || 'blank').replace(/\s/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('POST /api/storage-contract/generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────
// POST /api/storage-contract/email — Email contract to customer with accept link
//   body: { billing_id }
// ──────────────────────────────────────────────────────
router.post('/email', requireAuth, requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { billing_id } = req.body;
    if (!billing_id) return res.status(400).json({ error: 'billing_id required' });

    const { rows } = await pool.query(
      `SELECT sb.*, s.space_type, s.label, s.linear_feet AS space_linear_feet,
              c.first_name, c.last_name, c.phone_primary, c.email_primary,
              c.company_name,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
              u.license_plate, u.vin, u.linear_feet AS unit_linear_feet
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.id = $1 AND sb.deleted_at IS NULL`,
      [billing_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Billing record not found' });
    const r = rows[0];

    const email = r.email_primary;
    if (!email) return res.status(400).json({ error: 'Customer has no email on file' });

    // Generate or reuse contract token
    let token = r.contract_token;
    if (!token) {
      const tokenRes = await pool.query(
        `UPDATE storage_billing SET contract_token = gen_random_uuid(), contract_sent_at = NOW()
         WHERE id = $1 RETURNING contract_token`,
        [billing_id]
      );
      token = tokenRes.rows[0].contract_token;
    } else {
      await pool.query('UPDATE storage_billing SET contract_sent_at = NOW() WHERE id = $1', [billing_id]);
    }

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const acceptUrl = `${baseUrl}/api/storage-contract/accept/${token}`;
    const viewUrl = `${baseUrl}/api/storage-contract/view/${token}`;

    const customerName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.company_name || 'Valued Customer';
    const spaceLabel = r.label || r.space_type;

    await sendEmail({
      to: email,
      subject: `Your Storage Lease Agreement — Master Tech RV (Space ${spaceLabel})`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR & STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
    <p style="color:#374151;font-size:15px;">Hello ${customerName},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      We're pleased to welcome you to Master Tech RV Storage! Attached below is your <strong>Storage Lease Agreement</strong> for Space <strong>${spaceLabel}</strong>.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      Please review the contract and click the button below to accept the terms:
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${viewUrl}" style="display:inline-block;padding:16px 40px;background:#1e3a5f;color:#fff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">
        Review & Accept Contract
      </a>
    </div>

    <p style="color:#6b7280;font-size:12px;line-height:1.5;">
      If you have any questions about the agreement, please don't hesitate to call us at <strong>(303) 557-2214</strong> or reply to this email.
    </p>
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;padding:16px 32px;text-align:center;border-radius:0 0 12px 12px;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div>`,
      text: `Hello ${customerName}, please review and accept your Storage Lease Agreement for Space ${spaceLabel} at: ${viewUrl}`,
    });

    // Log
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content)
         VALUES ($1, 'email', 'storage_contract_sent', $2)`,
        [r.customer_id, `Storage contract emailed to ${email} for space ${spaceLabel}`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    res.json({ success: true, message: `Contract emailed to ${email}` });
  } catch (err) {
    console.error('POST /api/storage-contract/email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────
// GET /api/storage-contract/view/:token — Public: view contract + accept button
// ──────────────────────────────────────────────────────
function brandedPage(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Master Tech RV</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:700px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR & STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:32px;">${body}</div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

router.get('/view/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.*, s.space_type, s.label, s.linear_feet AS space_linear_feet,
              c.first_name, c.last_name, c.phone_primary, c.email_primary, c.company_name,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
              u.license_plate, u.vin, u.linear_feet AS unit_linear_feet
       FROM storage_billing sb
       JOIN storage_spaces s ON s.id = sb.space_id
       JOIN customers c ON c.id = sb.customer_id
       LEFT JOIN units u ON u.id = sb.unit_id
       WHERE sb.contract_token = $1 AND sb.deleted_at IS NULL`,
      [req.params.token]
    );
    if (!rows.length) {
      return res.send(brandedPage('Invalid Link',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
          <h2 style="color:#dc2626;">Invalid or Expired Link</h2>
          <p style="color:#6b7280;">This contract link is no longer valid. Please contact Master Tech RV.</p>
          <p><strong>(303) 557-2214</strong></p>
        </div>`
      ));
    }
    const r = rows[0];

    // Already accepted
    if (r.contract_accepted_at) {
      return res.send(brandedPage('Contract Accepted',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#9989;</div>
          <h2 style="color:#065f46;">Contract Already Accepted</h2>
          <p style="color:#6b7280;">Thank you — this storage lease agreement was accepted on ${new Date(r.contract_accepted_at).toLocaleString('en-US', { timeZone: 'America/Denver' })}.</p>
        </div>`
      ));
    }

    const customerName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.company_name || '';
    const linearFeet = r.unit_linear_feet || r.space_linear_feet || '';
    const monthlyRate = parseFloat(r.monthly_rate) || 0;
    const rvInfo = [r.unit_year, r.unit_make, r.unit_model].filter(Boolean).join(' ') || 'N/A';
    const startDate = r.billing_start_date ? new Date(r.billing_start_date).toLocaleDateString('en-US') : 'TBD';

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const acceptUrl = `${baseUrl}/api/storage-contract/accept/${req.params.token}`;

    // Show contract summary + accept button
    res.send(brandedPage('Storage Lease Agreement', `
      <h2 style="color:#1e3a5f;margin:0 0 20px;text-align:center;">RV Storage Lease Agreement</h2>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-weight:600;width:140px;">Lessee:</td><td>${customerName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Space:</td><td>${r.label} (${r.space_type})</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">RV:</td><td>${rvInfo}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">RV Length:</td><td>${linearFeet ? linearFeet + ' ft' : 'N/A'}</td></tr>
          ${r.license_plate ? `<tr><td style="padding:6px 0;font-weight:600;">License Plate:</td><td>${r.license_plate}</td></tr>` : ''}
          <tr><td style="padding:6px 0;font-weight:600;">Start Date:</td><td>${startDate}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Monthly Rate:</td><td>$${monthlyRate.toFixed(2)}</td></tr>
        </table>
      </div>

      <div style="font-size:13px;color:#374151;line-height:1.7;margin-bottom:24px;">
        <p><strong>By accepting below, you agree to the following terms:</strong></p>
        <ul style="padding-left:20px;">
          <li>Pay rent as it becomes due, in advance of the period without notice.</li>
          <li>No subletting of the space or assignment of this lease.</li>
          <li>RV insurance on your stored unit is required. Your property is covered by your insurance only; Lessor has no financial liability.</li>
          <li>Lessee will not hold the Lessor responsible for any damage to the property for any reason.</li>
          <li>Lessee cannot access the unit during any period that rent is past due.</li>
          <li>Contract renews automatically unless 30 days written notice is given.</li>
        </ul>
        <p><strong>Late Payment:</strong> 5 days late = $25 fee; 10 days = additional $50; 14+ days = $20/day up to 30 days. After 30 days unpaid, Lessor may take possession and sell said property.</p>
      </div>

      <div style="text-align:center;margin:32px 0 16px;">
        <a href="${acceptUrl}" style="display:inline-block;padding:18px 50px;background:#065f46;color:#fff;font-size:17px;font-weight:bold;text-decoration:none;border-radius:8px;">
          I Accept This Agreement
        </a>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:11px;">By clicking "I Accept", you are electronically signing this lease agreement.</p>
    `));
  } catch (err) {
    console.error('GET /api/storage-contract/view error:', err);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────────────────────
// GET /api/storage-contract/accept/:token — Public: accept contract
// ──────────────────────────────────────────────────────
router.get('/accept/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.*, c.first_name, c.last_name, c.email_primary, s.label
       FROM storage_billing sb
       JOIN customers c ON c.id = sb.customer_id
       JOIN storage_spaces s ON s.id = sb.space_id
       WHERE sb.contract_token = $1 AND sb.deleted_at IS NULL`,
      [req.params.token]
    );
    if (!rows.length) {
      return res.send(brandedPage('Invalid Link',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
          <h2 style="color:#dc2626;">Invalid or Expired Link</h2>
          <p style="color:#6b7280;">Please contact Master Tech RV.</p>
        </div>`
      ));
    }
    const r = rows[0];

    if (r.contract_accepted_at) {
      return res.send(brandedPage('Already Accepted',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#9989;</div>
          <h2 style="color:#065f46;">Already Accepted</h2>
          <p style="color:#6b7280;">This agreement was accepted on ${new Date(r.contract_accepted_at).toLocaleString('en-US', { timeZone: 'America/Denver' })}.</p>
        </div>`
      ));
    }

    // Mark as accepted
    await pool.query(
      `UPDATE storage_billing SET
        contract_accepted_at = NOW(),
        contract_accepted_ip = $1
       WHERE id = $2`,
      [req.ip, r.id]
    );

    // Notify staff
    const customerName = `${r.first_name || ''} ${r.last_name || ''}`.trim();
    const frontendUrl = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    sendEmail({
      to: 'service@mastertechrvrepair.com',
      subject: `Storage Contract Accepted — ${customerName} (Space ${r.label})`,
      html: `<p><strong>${customerName}</strong> digitally accepted the storage lease for Space <strong>${r.label}</strong> at ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}.</p>
             <p><a href="${frontendUrl}/storage">View Storage Module</a></p>`,
    }).catch(e => console.error('Contract acceptance notification error:', e.message));

    // Log
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content)
         VALUES ($1, 'email', 'storage_contract_accepted', $2)`,
        [r.customer_id, `Customer digitally accepted storage contract for space ${r.label}`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    res.send(brandedPage('Contract Accepted',
      `<div style="text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">&#9989;</div>
        <h2 style="color:#065f46;">Storage Agreement Accepted!</h2>
        <p style="color:#374151;font-size:15px;">Thank you${r.first_name ? ' ' + r.first_name : ''}, your storage lease for Space <strong>${r.label}</strong> is confirmed.</p>
        <p style="color:#6b7280;">We look forward to serving you!</p>
        <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;">
          <p style="margin:0;color:#374151;"><strong>(303) 557-2214</strong></p>
          <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
        </div>
      </div>`
    ));
  } catch (err) {
    console.error('GET /api/storage-contract/accept error:', err);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────────────────────
// POST /api/storage-contract/send-guidelines — Email guidelines to customer
//   body: { customer_id, email (optional override) }
// ──────────────────────────────────────────────────────
router.post('/send-guidelines', requireAuth, requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { customer_id, email: emailOverride, billing_id } = req.body;

    let toEmail, customerName;

    if (billing_id) {
      const { rows } = await pool.query(
        `SELECT c.first_name, c.last_name, c.email_primary, c.company_name
         FROM storage_billing sb JOIN customers c ON c.id = sb.customer_id
         WHERE sb.id = $1`, [billing_id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      toEmail = emailOverride || rows[0].email_primary;
      customerName = `${rows[0].first_name || ''} ${rows[0].last_name || ''}`.trim() || rows[0].company_name;
    } else if (customer_id) {
      const { rows } = await pool.query('SELECT first_name, last_name, email_primary, company_name FROM customers WHERE id = $1', [customer_id]);
      if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
      toEmail = emailOverride || rows[0].email_primary;
      customerName = `${rows[0].first_name || ''} ${rows[0].last_name || ''}`.trim() || rows[0].company_name;
    } else if (emailOverride) {
      toEmail = emailOverride;
      customerName = 'Valued Customer';
    } else {
      return res.status(400).json({ error: 'Provide billing_id, customer_id, or email' });
    }

    if (!toEmail) return res.status(400).json({ error: 'No email address available' });

    const guidelinesHTML = getGuidelinesHTML();
    await sendEmail({
      to: toEmail,
      subject: 'Storage Guidelines — Master Tech RV Repair & Storage',
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <p style="color:#374151;font-size:14px;margin-bottom:20px;">Hello ${customerName},</p>
  <p style="color:#374151;font-size:14px;margin-bottom:20px;">
    Welcome to Master Tech RV Storage! Below are our storage guidelines for your reference. Please keep these handy.
  </p>
  ${guidelinesHTML}
</div>`,
      text: `Hello ${customerName}, here are the Master Tech RV Storage Guidelines. Call (303) 557-2214 with any questions.`,
    });

    // Log
    try {
      const custId = customer_id || null;
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content)
         VALUES ($1, 'email', 'storage_guidelines_sent', $2)`,
        [custId, `Storage guidelines emailed to ${toEmail}`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    res.json({ success: true, message: `Guidelines emailed to ${toEmail}` });
  } catch (err) {
    console.error('POST /api/storage-contract/send-guidelines error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
