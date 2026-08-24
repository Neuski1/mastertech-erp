/**
 * Help You Sell — Sales Facilitation Agreements
 *
 * A second, separate contract for storage customers who want Master Tech to
 * help them sell their RV. Deliberately independent of the storage lease:
 * ending one never touches the other.
 *
 * Flow mirrors storage-contract.js:
 *   staff creates draft -> Preview -> Email -> customer opens token link ->
 *   reviews + accepts -> PDF saved to customer_documents + emailed both ways.
 *
 * Public routes (view/accept) are token-protected, everything else requires auth.
 */
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');
const { generateHelpYouSellPDF } = require('../services/helpYouSellContract');

const STAFF = ['admin', 'service_writer'];

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;

const denver = (ts) => new Date(ts).toLocaleString('en-US', { timeZone: 'America/Denver' });

function baseUrlFrom(req) {
  return process.env.BACKEND_URL
    || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `${req.protocol}://${req.get('host')}`);
}

const SELECT_AGREEMENT = `
  SELECT a.*,
         c.first_name, c.last_name, c.company_name,
         c.email_primary, c.phone_primary,
         u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
         s.label AS space_label, s.space_type
    FROM help_you_sell_agreements a
    JOIN customers c ON c.id = a.customer_id
    LEFT JOIN units u ON u.id = a.unit_id
    LEFT JOIN storage_billing sb ON sb.id = a.billing_id
    LEFT JOIN storage_spaces s ON s.id = sb.space_id`;

function displayName(r) {
  return `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.company_name || '';
}

function rvLabel(r) {
  return r.rv_description
    || [r.unit_year, r.unit_make, r.unit_model].filter(Boolean).join(' ')
    || '';
}

// Shape a DB row into the object the PDF generator wants.
function toPdfData(r, overrides = {}) {
  return {
    client_name: displayName(r),
    client_email: r.email_primary || '',
    client_phone: r.phone_primary || '',
    rv_description: rvLabel(r),
    monthly_storage_rate: r.monthly_storage_rate,
    commission_pct: r.commission_pct,
    cancellation_fee_pct: r.cancellation_fee_pct,
    notice_days: r.notice_days,
    payment_days: r.payment_days,
    special_terms: r.special_terms,
    agreement_date: r.agreement_date
      ? new Date(r.agreement_date).toLocaleDateString('en-US', { timeZone: 'UTC' })
      : new Date().toLocaleDateString('en-US'),
    accepted_at: r.accepted_at ? denver(r.accepted_at) : null,
    accepted_ip: r.accepted_ip || null,
    signature_name: r.signature_name || null,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// STAFF ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/help-you-sell — list all agreements
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${SELECT_AGREEMENT} WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC`
    );
    res.json({
      agreements: rows.map(r => ({
        ...r,
        customer_name: displayName(r),
        rv_label: rvLabel(r),
        has_signed_pdf: !!r.accepted_at,
      })),
    });
  } catch (err) {
    console.error('GET /api/help-you-sell error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/help-you-sell/candidates — active storage boxes without an open agreement
router.get('/candidates', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sb.id AS billing_id, sb.customer_id, sb.unit_id, sb.monthly_rate,
              s.label AS space_label, s.space_type,
              c.first_name, c.last_name, c.company_name, c.email_primary, c.phone_primary,
              u.year AS unit_year, u.make AS unit_make, u.model AS unit_model,
              EXISTS (SELECT 1 FROM help_you_sell_agreements a
                       WHERE a.billing_id = sb.id AND a.deleted_at IS NULL
                         AND a.status NOT IN ('cancelled', 'sold')) AS has_agreement
         FROM storage_billing sb
         JOIN storage_spaces s ON s.id = sb.space_id
         JOIN customers c ON c.id = sb.customer_id
         LEFT JOIN units u ON u.id = sb.unit_id
        WHERE sb.deleted_at IS NULL AND sb.billing_end_date IS NULL
        ORDER BY c.last_name, c.first_name`
    );
    res.json({
      candidates: rows.map(r => ({
        billing_id: r.billing_id,
        customer_id: r.customer_id,
        unit_id: r.unit_id,
        monthly_rate: r.monthly_rate,
        space_label: r.space_label,
        space_type: r.space_type,
        email_primary: r.email_primary,
        phone_primary: r.phone_primary,
        customer_name: displayName(r),
        rv_label: [r.unit_year, r.unit_make, r.unit_model].filter(Boolean).join(' '),
        has_agreement: r.has_agreement,
      })),
    });
  } catch (err) {
    console.error('GET /api/help-you-sell/candidates error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/help-you-sell — create a draft agreement
router.post('/', requireAuth, requireRole(...STAFF), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.customer_id) return res.status(400).json({ error: 'customer_id required' });

    const { rows } = await pool.query(
      `INSERT INTO help_you_sell_agreements
         (customer_id, billing_id, unit_id, rv_description, asking_price,
          monthly_storage_rate, commission_pct, cancellation_fee_pct,
          notice_days, payment_days, special_terms, agreement_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,
               COALESCE($7, 5.00), COALESCE($8, 1.00),
               COALESCE($9, 30), COALESCE($10, 5),
               $11, COALESCE($12, CURRENT_DATE), $13)
       RETURNING *`,
      [
        b.customer_id, b.billing_id || null, b.unit_id || null,
        b.rv_description || null,
        b.asking_price === '' || b.asking_price == null ? null : b.asking_price,
        b.monthly_storage_rate === '' || b.monthly_storage_rate == null ? null : b.monthly_storage_rate,
        b.commission_pct === '' ? null : b.commission_pct,
        b.cancellation_fee_pct === '' ? null : b.cancellation_fee_pct,
        b.notice_days === '' ? null : b.notice_days,
        b.payment_days === '' ? null : b.payment_days,
        b.special_terms || null,
        b.agreement_date || null,
        req.user && req.user.id ? req.user.id : null,
      ]
    );
    res.status(201).json({ agreement: rows[0] });
  } catch (err) {
    console.error('POST /api/help-you-sell error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/help-you-sell/:id — edit terms (locked once accepted, except sale tracking)
const EDITABLE = [
  'rv_description', 'asking_price', 'monthly_storage_rate', 'commission_pct',
  'cancellation_fee_pct', 'notice_days', 'payment_days', 'special_terms',
  'agreement_date', 'unit_id', 'billing_id',
];
const POST_SIGN_EDITABLE = ['status', 'sale_price', 'sold_at', 'commission_collected_at', 'staff_notes'];

router.patch('/:id', requireAuth, requireRole(...STAFF), async (req, res) => {
  try {
    const { rows: cur } = await pool.query(
      'SELECT * FROM help_you_sell_agreements WHERE id = $1 AND deleted_at IS NULL', [req.params.id]
    );
    if (!cur.length) return res.status(404).json({ error: 'Agreement not found' });
    const signed = !!cur[0].accepted_at;

    const allowed = signed
      ? POST_SIGN_EDITABLE
      : EDITABLE.concat(POST_SIGN_EDITABLE);

    const sets = [];
    const params = [];
    for (const key of allowed) {
      if (!(key in req.body)) continue;
      let v = req.body[key];
      if (v === '') v = null;
      params.push(v);
      sets.push(`${key} = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    // Terms changed on an unsigned agreement -> the old token/send is stale.
    const termsTouched = !signed && Object.keys(req.body).some(k => EDITABLE.includes(k));
    if (termsTouched && cur[0].status === 'sent') sets.push(`status = 'draft'`);

    sets.push('updated_at = NOW()');
    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE help_you_sell_agreements SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json({ agreement: rows[0] });
  } catch (err) {
    console.error('PATCH /api/help-you-sell error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/help-you-sell/:id — soft delete. A signed agreement is never
// destroyed; the PDF stays in customer_documents either way.
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE help_you_sell_agreements SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Agreement not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/help-you-sell error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/help-you-sell/:id/preview-link — staff preview, does not email or mark sent
router.post('/:id/preview-link', requireAuth, requireRole(...STAFF), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, token FROM help_you_sell_agreements WHERE id = $1 AND deleted_at IS NULL', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Agreement not found' });
    let token = rows[0].token;
    if (!token) {
      const t = await pool.query(
        'UPDATE help_you_sell_agreements SET token = gen_random_uuid() WHERE id = $1 RETURNING token', [req.params.id]
      );
      token = t.rows[0].token;
    }
    res.json({ viewUrl: `${baseUrlFrom(req)}/api/help-you-sell/view/${token}` });
  } catch (err) {
    console.error('POST /api/help-you-sell/preview-link error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/help-you-sell/:id/pdf — download the current agreement as PDF
router.get('/:id/pdf', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_AGREEMENT} WHERE a.id = $1 AND a.deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Agreement not found' });
    const buf = await generateHelpYouSellPDF(toPdfData(rows[0]));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `inline; filename="Help_You_Sell_${displayName(rows[0]).replace(/\s/g, '_') || 'agreement'}.pdf"`);
    res.send(buf);
  } catch (err) {
    console.error('GET /api/help-you-sell/pdf error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/help-you-sell/:id/email — send the agreement to the customer
router.post('/:id/email', requireAuth, requireRole(...STAFF), async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_AGREEMENT} WHERE a.id = $1 AND a.deleted_at IS NULL`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Agreement not found' });
    const r = rows[0];

    const to = (req.body && req.body.email) || r.email_primary;
    if (!to) return res.status(400).json({ error: 'Customer has no email on file' });

    let token = r.token;
    if (!token) {
      const t = await pool.query(
        'UPDATE help_you_sell_agreements SET token = gen_random_uuid() WHERE id = $1 RETURNING token', [r.id]
      );
      token = t.rows[0].token;
    }

    const viewUrl = `${baseUrlFrom(req)}/api/help-you-sell/view/${token}`;
    const name = displayName(r) || 'Valued Customer';
    const rv = rvLabel(r) || 'your RV';

    const emailResult = await sendEmail({
      to,
      cc: 'service@mastertechrvrepair.com',
      subject: `Help You Sell Agreement — Master Tech RV (${rv})`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
    <p style="color:#374151;font-size:15px;">Hello ${esc(name)},</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      Here is your <strong>Help You Sell Agreement</strong> for your ${esc(rv)}. It covers the sales-support
      services we provide while your RV is on our lot &mdash; showings, walkthroughs, photos, advertising help,
      and a private space to close the deal.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      Please review it and click below to sign online:
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${viewUrl}" style="display:inline-block;padding:16px 40px;background:#1e3a5f;color:#fff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">
        Review &amp; Sign Agreement
      </a>
    </div>
    <p style="color:#6b7280;font-size:12px;line-height:1.5;">
      This is separate from your storage lease &mdash; your storage agreement is unchanged.
      Questions? Call <strong>(303) 557-2214</strong> or reply to this email.
    </p>
  </div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;padding:16px 32px;text-align:center;border-radius:0 0 12px 12px;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div>`,
      text: `Hello ${name}, please review and sign your Help You Sell Agreement for your ${rv}: ${viewUrl}`,
    });

    if (!emailResult || emailResult.success === false) {
      return res.status(502).json({ error: 'Email failed to send: ' + ((emailResult && emailResult.error) || 'unknown error') });
    }

    await pool.query(
      `UPDATE help_you_sell_agreements
          SET sent_at = NOW(), updated_at = NOW(),
              status = CASE WHEN accepted_at IS NULL THEN 'sent' ELSE status END
        WHERE id = $1`, [r.id]
    );

    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content)
         VALUES ($1, 'email', 'help_you_sell_sent', $2)`,
        [r.customer_id, `Help You Sell agreement emailed to ${to} for ${rv}`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    res.json({ success: true, message: `Agreement emailed to ${to}` });
  } catch (err) {
    console.error('POST /api/help-you-sell/email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// PUBLIC (token) ROUTES
// ═══════════════════════════════════════════════════════════

function brandedPage(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Master Tech RV</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:700px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:32px;">${body}</div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

const invalidLinkPage = brandedPage('Invalid Link',
  `<div style="text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
    <h2 style="color:#dc2626;">Invalid or Expired Link</h2>
    <p style="color:#6b7280;">This agreement link is no longer valid. Please contact Master Tech RV.</p>
    <p><strong>(303) 557-2214</strong></p>
  </div>`);

// The contract body, rendered identically on the review page and (as static
// text) on the accepted read-only copy. Single source so the two never drift.
function agreementBodyHtml(r, editable) {
  const inputBase = 'width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;box-sizing:border-box;';
  const filled = inputBase + 'background:#fff;';
  const empty = inputBase + 'background:#fefce8;border-color:#facc15;';
  const ro = 'background:#f0f0f0;border:1px solid #d1d5db;padding:8px 10px;border-radius:6px;font-size:14px;color:#374151;';

  const field = (label, value, name, placeholder) => {
    const v = value == null ? '' : String(value);
    if (!editable) {
      return `<tr><td style="padding:8px 0;font-weight:600;width:150px;vertical-align:top;">${label}:</td>
              <td style="padding:8px 0;"><div style="${ro}">${esc(v) || '&mdash;'}</div></td></tr>`;
    }
    return `<tr><td style="padding:8px 0;font-weight:600;width:150px;vertical-align:top;">${label}:</td>
            <td style="padding:8px 0;"><input type="text" name="${name}" value="${esc(v)}" placeholder="${esc(placeholder)}" style="${v ? filled : empty}"/></td></tr>`;
  };
  const fixed = (label, value) =>
    `<tr><td style="padding:8px 0;font-weight:600;width:150px;vertical-align:top;">${label}:</td>
     <td style="padding:8px 0;"><div style="${ro}">${value}</div></td></tr>`;

  const commission = parseFloat(r.commission_pct);
  const cancelPct = parseFloat(r.cancellation_fee_pct);
  const noticeDays = parseInt(r.notice_days, 10) || 30;
  const payDays = parseInt(r.payment_days, 10) || 5;
  const agreementDate = r.agreement_date
    ? new Date(r.agreement_date).toLocaleDateString('en-US', { timeZone: 'UTC' })
    : new Date().toLocaleDateString('en-US');

  return `
  <p style="text-align:center;color:#6b7280;font-size:13px;margin:0 0 20px;">Date: ${esc(agreementDate)}</p>

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px;">
    <h3 style="color:#1e3a5f;margin:0 0 12px;font-size:15px;">1. Parties</h3>
    <p style="font-size:13px;color:#374151;line-height:1.6;margin:0 0 14px;">
      <strong>Business:</strong> Master Tech RV Repair and Storage<br/>
      6590 E. 49th Ave., Commerce City, CO 80022<br/>
      Phone: (303) 557-2214 &nbsp;&nbsp; Email: service@mastertechrvrepair.com
    </p>
    <p style="font-size:13px;color:#374151;margin:0 0 6px;"><strong>Client:</strong></p>
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
      ${field('Name', displayName(r), 'client_name', 'Your full name')}
      ${field('Email', r.email_primary || '', 'client_email', 'name@example.com')}
      ${field('Phone', r.phone_primary || '', 'client_phone', '(303) 555-1234')}
    </table>
  </div>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-bottom:20px;">
    <h3 style="color:#1e3a5f;margin:0 0 12px;font-size:15px;">2. Recitals</h3>
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
      ${field('The RV', rvLabel(r), 'rv_description', 'e.g. 2006 Airstream Safari')}
    </table>
    <p style="font-size:13px;color:#374151;line-height:1.6;margin:12px 0 0;">
      The Client owns the RV described above (the &ldquo;RV&rdquo;). The Business agrees to provide
      sales-support services to help the Client sell the RV.
    </p>
  </div>

  <div style="font-size:13px;color:#374151;line-height:1.7;">
    <h3 style="color:#1e3a5f;margin:20px 0 8px;font-size:15px;">3. Services</h3>
    <p style="margin:0 0 6px;">The Business will, using its best efforts:</p>
    <ul style="padding-left:20px;margin:0;">
      <li>Schedule and coordinate viewing appointments.</li>
      <li>Conduct guided walkthroughs to highlight the RV&rsquo;s features, functions and benefits.</li>
      <li>Photograph the RV for use in online and in-shop advertising.</li>
      <li>Advise and assist in drafting social-media posts and in-shop flyers.</li>
      <li>Provide a private office or meeting space for negotiation and closing.</li>
    </ul>

    <h3 style="color:#1e3a5f;margin:20px 0 8px;font-size:15px;">4. Client Obligations</h3>
    <p style="margin:0 0 6px;">The Client will:</p>
    <ul style="padding-left:20px;margin:0;">
      <li>Maintain the RV in presentable condition for all showings. (By request, we can arrange cleaning the RV, inside and/or out.)</li>
      <li>Include Business&rsquo;s phone number (303-557-2214) in all online ads and prospect communications.</li>
      <li>Direct all inquiries through the Business to ensure smooth scheduling.</li>
      <li>Pay the monthly outdoor storage rate of <strong>${money(r.monthly_storage_rate)}/month</strong> until the RV sells and/or the Client removes the RV from the lot.</li>
    </ul>

    <h3 style="color:#1e3a5f;margin:20px 0 8px;font-size:15px;">5. Commission &amp; Payment</h3>
    <p style="margin:0;"><strong>Fee:</strong> ${isFinite(commission) ? commission : 5}% of the gross sale price (i.e., the total amount paid by the buyer, before taxes and fees).</p>
    <p style="margin:6px 0 0;"><strong>Due Date:</strong> Payable to the Business at closing or within ${payDays} business days thereafter &mdash; by cash, check or credit card.</p>

    <h3 style="color:#1e3a5f;margin:20px 0 8px;font-size:15px;">6. Term &amp; Termination</h3>
    <p style="margin:0;"><strong>Term:</strong> This Agreement commences on the date above and continues until the earlier of (a) closing of the RV sale, or (b) ${noticeDays} days written notice by either party.</p>
    <p style="margin:6px 0 0;"><strong>Early Termination:</strong> If Client terminates early without cause, Client owes Business a &ldquo;good-faith&rdquo; cancellation fee equal to ${isFinite(cancelPct) ? cancelPct : 1}% of the last listed asking price.</p>

    <h3 style="color:#1e3a5f;margin:20px 0 8px;font-size:15px;">7. Indemnification</h3>
    <p style="margin:0;">Client will indemnify and hold harmless Business from any third-party claims arising out of the RV&rsquo;s condition or misrepresentation of its features.</p>
  </div>

  ${r.special_terms && String(r.special_terms).trim() ? `
  <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:16px 18px;margin:20px 0;">
    <h3 style="color:#92400e;margin:0 0 8px;font-size:15px;">8. Special Terms for This Agreement</h3>
    <p style="margin:0;font-size:13px;color:#1a2a4a;line-height:1.6;white-space:pre-wrap;">${esc(r.special_terms)}</p>
  </div>` : ''}

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
    <h3 style="color:#1e3a5f;margin:0 0 12px;font-size:15px;">Master Tech RV Repair and Storage</h3>
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
      ${fixed('Signature', '<span style="font-family:Georgia,serif;font-style:italic;font-size:22px;color:#1e3a5f;">Carol Neu</span>')}
      ${fixed('Title', 'Co-Owner')}
      ${fixed('Date', esc(agreementDate))}
    </table>
  </div>`;
}

// GET /api/help-you-sell/view/:token — public review + sign page
router.get('/view/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_AGREEMENT} WHERE a.token = $1 AND a.deleted_at IS NULL`, [req.params.token]);
    if (!rows.length) return res.send(invalidLinkPage);
    const r = rows[0];
    const signed = !!r.accepted_at;

    const acceptUrl = `${baseUrlFrom(req)}/api/help-you-sell/accept/${req.params.token}`;

    const banner = signed ? `
      <div style="background:#f0fdf4;border:2px solid #065f46;border-radius:8px;padding:14px 18px;margin-bottom:20px;text-align:center;">
        <div style="font-size:32px;margin-bottom:4px;">&#9989;</div>
        <strong style="color:#065f46;">Agreement signed on ${esc(denver(r.accepted_at))}</strong>
        <div style="color:#065f46;font-size:13px;margin-top:4px;">Read-only copy below.</div>
      </div>` : '';

    const signBlock = signed ? '' : `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
        <h3 style="color:#1e3a5f;margin:0 0 12px;font-size:15px;">Client Signature</h3>
        <label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px;">Type your full legal name to sign:</label>
        <input type="text" name="signature_name" required placeholder="Type your full name"
               style="width:100%;padding:10px 12px;border:1px solid #facc15;background:#fefce8;border-radius:6px;font-size:18px;font-family:Georgia,serif;font-style:italic;box-sizing:border-box;"/>
      </div>

      <div style="text-align:center;margin:28px 0 12px;">
        <button type="submit" style="display:inline-block;padding:18px 50px;background:#065f46;color:#fff;font-size:17px;font-weight:bold;border:none;border-radius:8px;cursor:pointer;">
          I Agree &amp; Sign
        </button>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:11px;">
        By typing your name and clicking &ldquo;I Agree &amp; Sign&rdquo;, you are electronically signing this
        agreement and intend it to have the same effect as a handwritten signature. Today&rsquo;s date and your
        IP address will be recorded.
      </p>`;

    res.send(brandedPage('Help You Sell Agreement', `
      ${banner}
      <h2 style="color:#1e3a5f;margin:0 0 6px;text-align:center;">Sales Facilitation Agreement</h2>
      <p style="text-align:center;color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Help You Sell</p>
      ${signed ? '' : `<p style="text-align:center;color:#6b7280;font-size:13px;margin:14px 0 20px;">Please review and complete the information below. Fields highlighted in <span style="background:#fefce8;padding:2px 6px;border:1px solid #facc15;border-radius:4px;">yellow</span> need to be filled in.</p>`}
      <form method="POST" action="${acceptUrl}" ${signed ? 'onsubmit="return false"' : ''}>
        ${agreementBodyHtml(r, !signed)}
        ${signBlock}
      </form>
    `));
  } catch (err) {
    console.error('GET /api/help-you-sell/view error:', err);
    res.status(500).send(brandedPage('Error',
      `<div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">&#9888;</div>
        <h2 style="color:#dc2626;">Something Went Wrong</h2>
        <p style="color:#6b7280;">Please contact Master Tech RV at <strong>(303) 557-2214</strong>.</p>
      </div>`));
  }
});

// POST /api/help-you-sell/accept/:token — public signature capture
router.post('/accept/:token', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_AGREEMENT} WHERE a.token = $1 AND a.deleted_at IS NULL`, [req.params.token]);
    if (!rows.length) return res.send(invalidLinkPage);
    const r = rows[0];

    if (r.accepted_at) {
      return res.send(brandedPage('Already Signed',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#9989;</div>
          <h2 style="color:#065f46;">Already Signed</h2>
          <p style="color:#6b7280;">This agreement was signed on ${esc(denver(r.accepted_at))}.</p>
        </div>`));
    }

    const form = req.body || {};
    const signatureName = String(form.signature_name || '').trim();
    if (!signatureName) {
      return res.send(brandedPage('Signature Required',
        `<div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#9997;</div>
          <h2 style="color:#b45309;">Signature Required</h2>
          <p style="color:#6b7280;">Please go back and type your full name in the signature box, then click &ldquo;I Agree &amp; Sign&rdquo;.</p>
        </div>`));
    }

    const clientName = String(form.client_name || '').trim() || displayName(r);
    const clientEmail = String(form.client_email || '').trim() || r.email_primary || '';
    const clientPhone = String(form.client_phone || '').trim() || r.phone_primary || '';
    const rvDescription = String(form.rv_description || '').trim() || rvLabel(r);

    const acceptedAtIso = new Date();

    await pool.query(
      `UPDATE help_you_sell_agreements
          SET accepted_at = NOW(), accepted_ip = $1, signature_name = $2,
              rv_description = COALESCE(NULLIF($3, ''), rv_description),
              status = 'accepted', updated_at = NOW()
        WHERE id = $4`,
      [req.ip, signatureName, rvDescription, r.id]
    );

    // Update customer contact info if the client corrected it on the form.
    try {
      const sets = [];
      const params = [];
      if (clientPhone && clientPhone !== (r.phone_primary || '')) { params.push(clientPhone); sets.push(`phone_primary = $${params.length}`); }
      if (clientEmail && clientEmail !== (r.email_primary || '')) { params.push(clientEmail); sets.push(`email_primary = $${params.length}`); }
      if (sets.length) {
        params.push(r.customer_id);
        await pool.query(`UPDATE customers SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
      }
    } catch (e) { console.error('Customer update error (non-fatal):', e.message); }

    const pdfData = toPdfData(r, {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      rv_description: rvDescription,
      accepted_at: denver(acceptedAtIso),
      accepted_ip: req.ip,
      signature_name: signatureName,
    });
    const pdfBuffer = await generateHelpYouSellPDF(pdfData);

    // Save the signed PDF to the customer's documents.
    try {
      await pool.query(
        `INSERT INTO customer_documents (customer_id, doc_type, title, file_data, mime_type, file_size, related_id)
         VALUES ($1, 'help_you_sell', $2, $3, 'application/pdf', $4, $5)`,
        [r.customer_id,
         `Help You Sell Agreement — ${rvDescription || 'RV'} (Signed ${acceptedAtIso.toLocaleDateString('en-US')})`,
         pdfBuffer, pdfBuffer.length, r.id]
      );
    } catch (e) { console.error('Document save error (non-fatal):', e.message); }

    // Copy to the customer.
    if (clientEmail) {
      sendEmail({
        to: clientEmail,
        subject: `Your Signed Help You Sell Agreement — Master Tech RV`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1e3a5f;padding:20px 32px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
            <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <p style="color:#374151;">Hello ${esc(r.first_name || clientName)},</p>
            <p style="color:#374151;">Thank you for signing the Help You Sell Agreement for your ${esc(rvDescription || 'RV')}. A copy of the signed agreement is attached for your records.</p>
            <p style="color:#374151;">We will start scheduling showings and get photos taken. Send any online listings our way so we can make sure our phone number is on them.</p>
            <p style="color:#374151;">Questions? Call <strong>(303) 557-2214</strong>.</p>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;padding:16px 32px;text-align:center;border-radius:0 0 12px 12px;">
            <p style="margin:0;color:#6b7280;font-size:12px;">6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
          </div>
        </div>`,
        attachments: [{
          filename: `Help_You_Sell_Agreement_${clientName.replace(/\s/g, '_') || 'signed'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }],
      }).catch(e => console.error('HYS customer copy email error:', e.message));
    }

    // Notify the shop.
    const frontendUrl = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    sendEmail({
      to: 'service@mastertechrvrepair.com',
      subject: `Help You Sell Agreement Signed — ${clientName}`,
      html: `<p><strong>${esc(clientName)}</strong> signed the Help You Sell agreement for <strong>${esc(rvDescription || 'their RV')}</strong> at ${esc(denver(acceptedAtIso))}.</p>
             <p>Commission: ${parseFloat(r.commission_pct) || 5}% of gross sale price. Storage rate: ${money(r.monthly_storage_rate)}/month.</p>
             <p><a href="${frontendUrl}/storage">Open the Storage module &rarr; Help You Sell</a></p>`,
      attachments: [{
        filename: `Help_You_Sell_Agreement_${clientName.replace(/\s/g, '_') || 'signed'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    }).catch(e => console.error('HYS staff notification error:', e.message));

    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content)
         VALUES ($1, 'email', 'help_you_sell_signed', $2)`,
        [r.customer_id, `Customer electronically signed the Help You Sell agreement for ${rvDescription || 'their RV'}. Signature: "${signatureName}". Copy emailed to ${clientEmail || 'N/A'}.`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    res.send(brandedPage('Agreement Signed',
      `<div style="text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">&#9989;</div>
        <h2 style="color:#065f46;">Agreement Signed!</h2>
        <p style="color:#374151;font-size:15px;">Thank you${r.first_name ? ' ' + esc(r.first_name) : ''}. Your Help You Sell agreement for your ${esc(rvDescription || 'RV')} is in place.</p>
        <p style="color:#6b7280;">A signed copy has been emailed to <strong>${esc(clientEmail || 'your email on file')}</strong>.</p>
        <p style="color:#6b7280;">We will be in touch to schedule photos and showings.</p>
        <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;">
          <p style="margin:0;color:#374151;"><strong>(303) 557-2214</strong></p>
          <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
        </div>
      </div>`));
  } catch (err) {
    console.error('POST /api/help-you-sell/accept error:', err);
    res.status(500).send(brandedPage('Error',
      `<div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">&#9888;</div>
        <h2 style="color:#dc2626;">Something Went Wrong</h2>
        <p style="color:#6b7280;">Your signature may not have been recorded. Please call Master Tech RV at <strong>(303) 557-2214</strong>.</p>
      </div>`));
  }
});

// GET /api/help-you-sell/:id/signed — the stored signed PDF
router.get('/:id/signed', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT file_data, title FROM customer_documents
        WHERE doc_type = 'help_you_sell' AND related_id = $1
        ORDER BY id DESC LIMIT 1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No signed agreement on file' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${(rows[0].title || 'signed').replace(/[^\w.-]+/g, '_')}.pdf"`);
    res.send(rows[0].file_data);
  } catch (err) {
    console.error('GET /api/help-you-sell/signed error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
