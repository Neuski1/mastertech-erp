const cron = require('node-cron');
const pool = require('../db/pool');
const { sendEmail } = require('../services/email');

const REVIEW_URL = 'https://g.page/r/CcdbSyhGUgf6EBM/review';
const QR_URL = 'https://quickchart.io/qr?text=https%3A%2F%2Fg.page%2Fr%2FCcdbSyhGUgf6EBM%2Freview&size=160&margin=2&dark=1e3a5f';

function buildReviewRequestHtml({ firstName, unitDescription }) {
  const safeName = firstName || 'there';
  const unitLine = unitDescription ? ` for your <strong>${unitDescription}</strong>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1e3a5f;padding:20px 32px;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:15px;color:#111;margin:0 0 14px;">Hi ${safeName},</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 14px;">
      Mark and Carol here from Master Tech RV. Thanks for trusting us with the service${unitLine}.
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 18px;">
      If we earned it, would you take 60 seconds to leave us a Google review? It genuinely helps our small family shop stay visible to other RV owners in Denver.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${REVIEW_URL}" target="_blank" style="display:inline-block;padding:14px 32px;background:#1e3a5f;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;">Leave a Google Review</a>
    </div>
    <div style="text-align:center;margin:18px 0;">
      <p style="font-size:11px;color:#6b7280;margin:0 0 8px;">Or scan with your phone:</p>
      <img src="${QR_URL}" alt="Scan to leave a Google review" width="140" height="140" style="display:inline-block;border:1px solid #e5e7eb;border-radius:4px;background:#fff;"/>
    </div>
    <p style="font-size:13px;color:#374151;line-height:1.6;margin:24px 0 0;">
      If something didn't go right, hit reply and tell us directly. We'd rather fix it than read about it online.
    </p>
    <p style="font-size:14px;color:#111;margin:20px 0 0;">Thanks,<br/>Carol and Mark</p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
    <p style="margin:0;color:#6b7280;font-size:11px;">Master Tech RV Repair &amp; Storage<br/>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

async function processReviewRequests() {
  // Find paid records >= 3 days old that haven't had a review request,
  // for customers who have not opted out and have not been asked in last 365 days.
  const { rows } = await pool.query(`
    SELECT r.id           AS record_id,
           r.record_number,
           r.customer_id,
           c.first_name,
           c.email_primary,
           u.year         AS unit_year,
           u.make         AS unit_make,
           u.model        AS unit_model
    FROM records r
    JOIN customers c ON c.id = r.customer_id
    LEFT JOIN units u ON u.id = r.unit_id
    WHERE r.status = 'paid'
      AND r.deleted_at IS NULL
      AND r.review_request_sent_at IS NULL
      AND r.paid_at IS NOT NULL
      AND r.paid_at <= NOW() - INTERVAL '3 days'
      AND COALESCE(c.review_opt_out, FALSE) = FALSE
      AND c.email_primary IS NOT NULL
      AND c.email_primary <> ''
      AND (c.last_review_request_at IS NULL
           OR c.last_review_request_at < NOW() - INTERVAL '365 days')
    ORDER BY r.paid_at ASC
    LIMIT 50
  `);

  if (rows.length === 0) {
    console.log('[reviewRequestCron] No records eligible for review request.');
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const unitDescription = [row.unit_year, row.unit_make, row.unit_model].filter(Boolean).join(' ') || '';
    const html = buildReviewRequestHtml({
      firstName: row.first_name,
      unitDescription,
    });
    const text = `Hi ${row.first_name || 'there'},\n\nMark and Carol here from Master Tech RV. Thanks for trusting us with the service${unitDescription ? ' for your ' + unitDescription : ''}.\n\nIf we earned it, would you take 60 seconds to leave us a Google review? It genuinely helps our small family shop stay visible to other RV owners in Denver.\n\nLeave a review: ${REVIEW_URL}\n\nIf something didn't go right, hit reply and tell us directly. We'd rather fix it than read about it online.\n\nThanks,\nCarol and Mark\nMaster Tech RV Repair & Storage\n(303) 557-2214`;

    try {
      const result = await sendEmail({
        to: row.email_primary,
        subject: `How'd we do, ${row.first_name || 'there'}?`,
        html,
        text,
      });

      if (result && result.success) {
        const now = new Date();
        await pool.query('UPDATE records SET review_request_sent_at = $1 WHERE id = $2', [now, row.record_id]);
        await pool.query('UPDATE customers SET last_review_request_at = $1 WHERE id = $2', [now, row.customer_id]);
        await pool.query(
          `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content)
           VALUES ($1, $2, 'email', 'review_request_sent', $3)`,
          [row.customer_id, row.record_id, `Review request emailed to ${row.email_primary} for invoice #${row.record_number}`]
        );
        sent++;
      } else {
        failed++;
        console.error('[reviewRequestCron] Send failed for record', row.record_number, result?.error);
      }
    } catch (err) {
      failed++;
      console.error('[reviewRequestCron] Error sending for record', row.record_number, err.message);
    }
  }

  console.log(`[reviewRequestCron] Sent ${sent}, failed ${failed}, total candidates ${rows.length}`);
  return { sent, failed, total: rows.length };
}

function startReviewRequestCron() {
  // Daily at 10:00 AM America/Denver
  cron.schedule('0 10 * * *', async () => {
    console.log('[reviewRequestCron] Starting daily review request run...');
    try {
      const result = await processReviewRequests();
      console.log('[reviewRequestCron] Complete:', result);
    } catch (err) {
      console.error('[reviewRequestCron] Fatal error:', err);
    }
  }, { timezone: 'America/Denver' });
  console.log('[reviewRequestCron] Review request cron scheduled (daily 10 AM Mountain)');
}

module.exports = { startReviewRequestCron, processReviewRequests };
