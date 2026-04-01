const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const DAILY_LIMIT = 100;
const BATCH_SIZE = 2;          // Send 2 at a time (well under Resend's 5/sec limit)
const BATCH_DELAY_MS = 1000;   // 1 second between batches → ~2 emails/sec

// ---------------------------------------------------------------------------
// Email template builders
// ---------------------------------------------------------------------------
function getLogoUrl() {
  const frontend = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
  return `${frontend}/master-rvtech-logo-dark.jpg`;
}

function getHeroImageUrl() {
  const frontend = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
  return `${frontend}/images/rv-mountains.jpg`;
}

// Hero image block used in marketing templates
function heroBlock() {
  return `
  <div style="width:100%;max-width:600px;overflow:hidden;margin:0 auto;">
    <img src="${getHeroImageUrl()}" alt="RV travel trailer heading into the mountains" style="width:100%;height:240px;object-fit:cover;object-position:center;display:block;" />
    <p style="text-align:center;font-size:13px;color:#6b7280;font-style:italic;margin:8px 0 0;padding:0 24px;">Adventure is calling &mdash; is your RV ready? &#x1F3D4;&#xFE0F;</p>
  </div>`;
}

// Shared CTA block used in all marketing templates
const ctaBlock = `
    <div style="text-align:center;margin:32px 0;padding:24px;background:#f8f9fa;border-radius:8px;">
      <p style="font-size:14px;color:#444;margin-bottom:20px;font-weight:bold;">Ready to get started? Contact us today!</p>
      <a href="tel:+13035572214" style="display:inline-block;background:#1a2a4a;color:white;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;margin:8px 12px;">&#x1F4DE; Call (303) 557-2214</a>
      <a href="mailto:service@mastertechrvrepair.com?subject=Service%20Appointment%20Request" style="display:inline-block;background:#ffffff;color:#1a2a4a;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;margin:8px 12px;border:2px solid #1a2a4a;">&#x2709; Email Us to Schedule</a>
      <p style="font-size:12px;color:#888;margin-top:16px;">service@mastertechrvrepair.com &nbsp;|&nbsp; 6590 East 49th Avenue, Commerce City, CO 80022</p>
    </div>`;

function buildSeasonalHtml({ subject, bodyHtml, firstName, unsubscribeUrl }) {
  const logoUrl = getLogoUrl();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 24px;text-align:center;">
    <img src="${logoUrl}" alt="Master Tech RV" style="height:80px;max-width:250px;object-fit:contain;margin-bottom:8px;" />
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;">Our Service Makes Happy Campers!</p>
  </div>
  ${heroBlock()}
  <div style="padding:24px 32px;">
    <p style="font-size:15px;color:#111;">Hello ${firstName || 'Valued Customer'},</p>
    <div style="font-size:14px;color:#333;line-height:1.7;">${bodyHtml}</div>
    <div style="margin:24px 0;padding:16px;background:#eff6ff;border-radius:6px;border-left:4px solid #1e3a5f;">
      <p style="margin:0 0 8px;font-weight:bold;color:#1e3a5f;">Our Services Include:</p>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#333;line-height:1.8;">
        <li>Roof inspections &amp; resealing</li>
        <li>AC &amp; heating service</li>
        <li>Plumbing &amp; water system checks</li>
        <li>Electrical diagnostics</li>
        <li>Full pre-season inspections</li>
      </ul>
    </div>
    ${ctaBlock}
  </div>
  <div style="padding:16px 32px;background:#f9fafb;text-align:center;font-size:11px;color:#9ca3af;">
    <p style="margin:0;">Master Tech RV Repair &amp; Storage</p>
    <p style="margin:4px 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a></p>
  </div>
</div></body></html>`;
}

function buildServiceReminderHtml({ bodyHtml, firstName, unitInfo, unsubscribeUrl }) {
  const logoUrl = getLogoUrl();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 24px;text-align:center;">
    <img src="${logoUrl}" alt="Master Tech RV" style="height:80px;max-width:250px;object-fit:contain;margin-bottom:8px;" />
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;">Our Service Makes Happy Campers!</p>
  </div>
  ${heroBlock()}
  <div style="padding:24px 32px;">
    <p style="font-size:15px;color:#111;">Hello ${firstName || 'Valued Customer'},</p>
    <div style="font-size:14px;color:#333;line-height:1.7;">${bodyHtml}</div>
    ${unitInfo ? `<p style="font-size:14px;color:#1e3a5f;font-weight:600;">Your ${unitInfo} is due for a checkup.</p>` : ''}
    <div style="margin:20px 0;padding:16px;background:#fffbeb;border-radius:6px;border-left:4px solid #f59e0b;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">Annual service helps prevent costly repairs down the road. A quick inspection now can catch small issues before they become big problems.</p>
    </div>
    ${ctaBlock}
  </div>
  <div style="padding:16px 32px;background:#f9fafb;text-align:center;font-size:11px;color:#9ca3af;">
    <p style="margin:0;">Master Tech RV Repair &amp; Storage</p>
    <p style="margin:4px 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a></p>
  </div>
</div></body></html>`;
}

function makeUnsubscribeUrl(email) {
  const token = Buffer.from(email).toString('base64url');
  const base = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://mastertech-erp-production-cb96.up.railway.app';
  return `${base}/api/campaigns/unsubscribe/${token}`;
}

// ---------------------------------------------------------------------------
// GET /api/campaigns — list all
// ---------------------------------------------------------------------------
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns — create
// ---------------------------------------------------------------------------
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, template_type, subject, body_html, target_filter } = req.body;
  if (!name || !template_type || !subject) {
    return res.status(400).json({ error: 'name, template_type, and subject are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO email_campaigns (name, template_type, subject, body_html, target_filter, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, template_type, subject, body_html || '', target_filter ? JSON.stringify(target_filter) : null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// GET /api/campaigns/:id — detail with recipients
// ---------------------------------------------------------------------------
router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows: campaign } = await pool.query('SELECT * FROM email_campaigns WHERE id = $1', [req.params.id]);
    if (campaign.length === 0) return res.status(404).json({ error: 'Campaign not found' });

    const { rows: recipients } = await pool.query(
      'SELECT * FROM email_campaign_recipients WHERE campaign_id = $1 ORDER BY id',
      [req.params.id]
    );
    res.json({ ...campaign[0], recipients });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// PATCH /api/campaigns/:id — update draft
// ---------------------------------------------------------------------------
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, subject, body_html, target_filter } = req.body;
  const updates = []; const values = []; let idx = 1;
  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
  if (subject !== undefined) { updates.push(`subject = $${idx++}`); values.push(subject); }
  if (body_html !== undefined) { updates.push(`body_html = $${idx++}`); values.push(body_html); }
  if (target_filter !== undefined) { updates.push(`target_filter = $${idx++}`); values.push(JSON.stringify(target_filter)); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE email_campaigns SET ${updates.join(', ')} WHERE id = $${idx} AND status = 'draft' RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Campaign not found or not in draft status' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// DELETE /api/campaigns/:id — delete draft
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM email_campaigns WHERE id = $1 AND status = 'draft' RETURNING id", [req.params.id]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Can only delete draft campaigns' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// GET /api/campaigns/audience-count — count matching customers
// ---------------------------------------------------------------------------
router.get('/audience/count', requireAuth, requireRole('admin'), async (req, res) => {
  const { last_visit_months } = req.query;
  try {
    const months = parseInt(last_visit_months) || 6;
    let customerQuery = `
      SELECT c.id, c.first_name, c.last_name, c.email_primary
      FROM customers c
      WHERE c.deleted_at IS NULL AND c.email_primary IS NOT NULL AND c.email_primary != ''`;

    // Exclude customers who opted out (column may not exist on older schemas)
    try {
      await pool.query('SELECT marketing_opt_out FROM customers LIMIT 1');
      customerQuery += ` AND c.marketing_opt_out IS NOT TRUE`;
    } catch { /* column doesn't exist yet — skip filter */ }

    // Exclude customers currently in storage
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM storage_billing
        WHERE billing_end_date IS NULL AND deleted_at IS NULL
      )`;

    // Exclude customers with active/open work orders
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM records
        WHERE deleted_at IS NULL
        AND status IN ('estimate', 'approved', 'in_progress', 'awaiting_parts', 'awaiting_approval', 'on_hold', 'schedule_customer', 'scheduled')
      )`;

    // Exclude customers serviced (paid) within the last N months
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM records
        WHERE deleted_at IS NULL
        AND status IN ('complete', 'payment_pending', 'partial', 'paid')
        AND COALESCE(actual_completion_date, updated_at) > NOW() - INTERVAL '1 month' * $1
      )`;

    const { rows: customers } = await pool.query(customerQuery, [months]);
    const emails = customers.map(c => c.email_primary.toLowerCase());

    const { rows: unsubs } = await pool.query('SELECT email FROM email_unsubscribes');
    const unsubEmails = new Set(unsubs.map(u => u.email.toLowerCase()));

    const eligible = customers.filter(c => !unsubEmails.has(c.email_primary.toLowerCase()));
    const unsubCount = emails.length - eligible.length;

    const { rows: noEmail } = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL AND (email_primary IS NULL OR email_primary = '')"
    );

    // Get excluded counts for the breakdown
    const { rows: storageCount } = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) AS cnt FROM storage_billing WHERE billing_end_date IS NULL AND deleted_at IS NULL`
    );
    const { rows: openOrderCount } = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) AS cnt FROM records WHERE deleted_at IS NULL
       AND status IN ('estimate', 'approved', 'in_progress', 'awaiting_parts', 'awaiting_approval', 'on_hold', 'schedule_customer', 'scheduled')`
    );
    const { rows: recentServiceCount } = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) AS cnt FROM records WHERE deleted_at IS NULL
       AND status IN ('complete', 'payment_pending', 'partial', 'paid')
       AND COALESCE(actual_completion_date, updated_at) > NOW() - INTERVAL '1 month' * $1`,
      [months]
    );

    const days = Math.ceil(eligible.length / DAILY_LIMIT);

    res.json({
      totalWithEmail: customers.length,
      unsubscribed: unsubCount,
      noEmail: parseInt(noEmail[0].count),
      excludedStorage: parseInt(storageCount[0].cnt),
      excludedOpenOrders: parseInt(openOrderCount[0].cnt),
      excludedRecentService: parseInt(recentServiceCount[0].cnt),
      eligible: eligible.length,
      estimatedDays: days,
      preview: eligible.slice(0, 10).map(c => ({
        id: c.id, name: `${c.first_name || ''} ${c.last_name || ''}`.trim(), email: c.email_primary,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/preview — send test email to admin
// ---------------------------------------------------------------------------
router.post('/:id/preview', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM email_campaigns WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    const campaign = rows[0];
    const unsubUrl = makeUnsubscribeUrl('test@example.com');

    let html;
    if (campaign.template_type === 'service_reminder') {
      html = buildServiceReminderHtml({ bodyHtml: campaign.body_html, firstName: 'Carol', unitInfo: '2020 Airstream Classic', unsubscribeUrl: unsubUrl });
    } else {
      html = buildSeasonalHtml({ subject: campaign.subject, bodyHtml: campaign.body_html, firstName: 'Carol', unsubscribeUrl: unsubUrl });
    }

    const result = await sendEmail({
      to: 'carol@mastertechrvrepair.com',
      subject: `[TEST] ${campaign.subject}`,
      html,
      text: campaign.body_html.replace(/<[^>]*>/g, ''),
    });

    res.json({ success: result.success, error: result.error });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/send — send campaign to all recipients
// ---------------------------------------------------------------------------
router.post('/:id/send', requireAuth, requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: campaigns } = await client.query(
      "SELECT * FROM email_campaigns WHERE id = $1 AND status = 'draft'", [req.params.id]
    );
    if (campaigns.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Campaign not found or already sent' });
    }
    const campaign = campaigns[0];
    const filter = campaign.target_filter || {};

    // Build recipient list
    const months = parseInt(filter.last_visit_months) || 6;
    let customerQuery = `
      SELECT c.id, c.first_name, c.last_name, c.email_primary
      FROM customers c
      WHERE c.deleted_at IS NULL AND c.email_primary IS NOT NULL AND c.email_primary != ''`;

    // Exclude customers who opted out (column may not exist on older schemas)
    try {
      await client.query('SELECT marketing_opt_out FROM customers LIMIT 1');
      customerQuery += ` AND c.marketing_opt_out IS NOT TRUE`;
    } catch { /* column doesn't exist yet — skip filter */ }

    // Exclude customers currently in storage
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM storage_billing
        WHERE billing_end_date IS NULL AND deleted_at IS NULL
      )`;

    // Exclude customers with active/open work orders
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM records
        WHERE deleted_at IS NULL
        AND status IN ('estimate', 'approved', 'in_progress', 'awaiting_parts', 'awaiting_approval', 'on_hold', 'schedule_customer', 'scheduled')
      )`;

    // Exclude customers serviced (paid) within the last N months
    customerQuery += `
      AND c.id NOT IN (
        SELECT DISTINCT customer_id FROM records
        WHERE deleted_at IS NULL
        AND status IN ('complete', 'payment_pending', 'partial', 'paid')
        AND COALESCE(actual_completion_date, updated_at) > NOW() - INTERVAL '1 month' * $1
      )`;

    const { rows: customers } = await client.query(customerQuery, [months]);

    // Exclude unsubscribed
    const { rows: unsubs } = await client.query('SELECT email FROM email_unsubscribes');
    const unsubEmails = new Set(unsubs.map(u => u.email.toLowerCase()));
    const eligible = customers.filter(c => !unsubEmails.has(c.email_primary.toLowerCase()));

    if (eligible.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    // Insert recipients
    for (const c of eligible) {
      await client.query(
        `INSERT INTO email_campaign_recipients (campaign_id, customer_id, email, customer_name, status)
         VALUES ($1, $2, $3, $4, 'queued')`,
        [req.params.id, c.id, c.email_primary, `${c.first_name || ''} ${c.last_name || ''}`.trim()]
      );
    }

    await client.query(
      `UPDATE email_campaigns SET status = 'sending', recipient_count = $2 WHERE id = $1`,
      [req.params.id, eligible.length]
    );
    await client.query('COMMIT');

    // Send first batch immediately (up to DAILY_LIMIT)
    const sentToday = await sendBatchForCampaign(req.params.id, DAILY_LIMIT);

    const remaining = eligible.length - sentToday;
    const daysRemaining = Math.ceil(remaining / DAILY_LIMIT);

    res.json({
      success: true,
      recipientCount: eligible.length,
      sentToday,
      remaining,
      estimatedDaysRemaining: daysRemaining,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Campaign send error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// Send a batch of queued emails for a campaign
// ---------------------------------------------------------------------------
async function sendBatchForCampaign(campaignId, limit) {
  const { rows: campaigns } = await pool.query('SELECT * FROM email_campaigns WHERE id = $1', [campaignId]);
  if (campaigns.length === 0) return 0;
  const campaign = campaigns[0];

  const { rows: queued } = await pool.query(
    `SELECT * FROM email_campaign_recipients WHERE campaign_id = $1 AND status = 'queued' ORDER BY id LIMIT $2`,
    [campaignId, limit]
  );
  if (queued.length === 0) return 0;

  let sentCount = 0;
  for (let i = 0; i < queued.length; i += BATCH_SIZE) {
    const batch = queued.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (recipient) => {
      try {
        const firstName = (recipient.customer_name || '').split(' ')[0] || 'Valued Customer';
        const unsubUrl = makeUnsubscribeUrl(recipient.email);

        // Get unit info for service reminder
        let unitInfo = null;
        if (campaign.template_type === 'service_reminder' && recipient.customer_id) {
          const { rows: units } = await pool.query(
            'SELECT year, make, model FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
            [recipient.customer_id]
          );
          if (units.length > 0) unitInfo = [units[0].year, units[0].make, units[0].model].filter(Boolean).join(' ');
        }

        let html;
        if (campaign.template_type === 'service_reminder') {
          html = buildServiceReminderHtml({ bodyHtml: campaign.body_html, firstName, unitInfo, unsubscribeUrl: unsubUrl });
        } else {
          html = buildSeasonalHtml({ subject: campaign.subject, bodyHtml: campaign.body_html, firstName, unsubscribeUrl: unsubUrl });
        }

        const result = await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          html,
          text: campaign.body_html.replace(/<[^>]*>/g, ''),
        });

        if (result.success) {
          await pool.query(
            "UPDATE email_campaign_recipients SET status = 'sent', sent_at = NOW() WHERE id = $1",
            [recipient.id]
          );
          sentCount++;
        } else {
          await pool.query(
            "UPDATE email_campaign_recipients SET status = 'failed', error_message = $2 WHERE id = $1",
            [recipient.id, result.error]
          );
        }
      } catch (err) {
        await pool.query(
          "UPDATE email_campaign_recipients SET status = 'failed', error_message = $2 WHERE id = $1",
          [recipient.id, err.message]
        );
      }
    }));
    // Delay between batches
    if (i + BATCH_SIZE < queued.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  // Update campaign counts
  const { rows: counts } = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE status = 'sent') AS sent,
            COUNT(*) FILTER (WHERE status = 'queued') AS queued
     FROM email_campaign_recipients WHERE campaign_id = $1`,
    [campaignId]
  );
  const totalSent = parseInt(counts[0].sent);
  const totalQueued = parseInt(counts[0].queued);

  const newStatus = totalQueued === 0 ? 'sent' : 'sending';
  await pool.query(
    `UPDATE email_campaigns SET sent_count = $2, status = $3${newStatus === 'sent' ? ", sent_at = NOW()" : ''} WHERE id = $1`,
    [campaignId, totalSent, newStatus]
  );

  return sentCount;
}

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/retry — Retry all failed recipients
// ---------------------------------------------------------------------------
router.post('/:id/retry', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Reset failed recipients back to queued
    const { rowCount } = await pool.query(
      "UPDATE email_campaign_recipients SET status = 'queued', error_message = NULL WHERE campaign_id = $1 AND status = 'failed'",
      [req.params.id]
    );
    if (rowCount === 0) return res.json({ success: true, retried: 0, message: 'No failed recipients to retry' });

    // Set campaign back to sending
    await pool.query("UPDATE email_campaigns SET status = 'sending' WHERE id = $1", [req.params.id]);

    // Send the retried batch
    const sent = await sendBatchForCampaign(req.params.id, DAILY_LIMIT);

    res.json({ success: true, retried: rowCount, sent });
  } catch (err) {
    console.error('Campaign retry error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/cancel — Cancel a sending campaign
// ---------------------------------------------------------------------------
router.post('/:id/cancel', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE email_campaign_recipients SET status = 'cancelled' WHERE campaign_id = $1 AND status = 'queued'",
      [req.params.id]
    );
    await pool.query(
      "UPDATE email_campaigns SET status = 'cancelled' WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true, cancelledCount: rowCount });
  } catch (err) {
    console.error('Campaign cancel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/campaigns/unsubscribe/:token — handle unsubscribe (PUBLIC)
// ---------------------------------------------------------------------------
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const email = Buffer.from(req.params.token, 'base64url').toString('utf8');
    if (!email || !email.includes('@')) return res.status(400).send('Invalid link');

    await pool.query(
      `INSERT INTO email_unsubscribes (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email.toLowerCase()]
    );

    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:500px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
  <div style="background:#1e3a5f;padding:20px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;">Master Tech RV Repair &amp; Storage</h1>
  </div>
  <div style="padding:32px;text-align:center;">
    <p style="font-size:16px;color:#111;margin:0 0 12px;">You have been unsubscribed.</p>
    <p style="font-size:14px;color:#6b7280;margin:0;">You will no longer receive marketing emails from Master Tech RV Repair &amp; Storage.</p>
    <p style="font-size:13px;color:#9ca3af;margin:16px 0 0;">To resubscribe, contact us at<br/><a href="mailto:service@mastertechrvrepair.com" style="color:#3b82f6;">service@mastertechrvrepair.com</a></p>
  </div>
</div></body></html>`);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send('Error processing unsubscribe');
  }
});

// Export for use by daily cron job
router.sendBatchForCampaign = sendBatchForCampaign;

module.exports = router;
