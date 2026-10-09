// ---------------------------------------------------------------------------
// Public job status page: the link at the end of every status text.
//
// GET /api/public/status/:token   (mounted before auth in app.js)
//
// The token is the record's permanent photo_token, the same one the invoice
// and estimate emails already use for photo links, so no new secret exists.
// The page shows only what the shop chose to send: the progress bar, the texts
// that went out, and the photos a technician attached to one of them. Internal
// photos, notes and prices never appear here.
// ---------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { UPDATE_TYPES, STOP_LINE, rvLabel, niceFirstName } = require('../services/statusUpdates');

const STAGE_BY_TYPE = new Map(UPDATE_TYPES.map(t => [t.key, t.stage]));
const STAGES = ['Checked in', 'In progress', 'Ready for pickup'];

const STAGE_BY_STATUS = {
  in_progress: 2, order_parts: 2, awaiting_parts: 2, awaiting_approval: 2, on_hold: 2,
  complete: 3, payment_pending: 3, partial: 3, paid: 3,
};
const SUBSTATUS = {
  order_parts: 'Ordering parts',
  awaiting_parts: 'Waiting on parts',
  awaiting_approval: 'Waiting on your approval',
  on_hold: 'On hold',
  paid: 'Picked up. Thank you!',
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title, inner) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} | Master Tech RV</title>
<style>
  *{box-sizing:border-box} body{margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827}
  .wrap{max-width:640px;margin:0 auto;background:#fff;min-height:100vh}
  .top{background:#1e3a5f;padding:16px 20px}
  .top span{color:#5FD584;font-weight:700;font-size:15px;letter-spacing:.02em}
  .body{padding:20px}
  h1{font-size:20px;margin:0 0 4px;color:#1e3a5f} .sub{color:#6b7280;font-size:14px;margin:0 0 20px}
  .steps{display:flex;gap:6px;margin:0 0 8px} .step{flex:1;height:8px;border-radius:4px;background:#e5e7eb}
  .step.on{background:#1e3a5f} .step.done{background:#5FD584}
  .labels{display:flex;justify-content:space-between;font-size:12px;color:#6b7280;margin-bottom:6px}
  .labels b{color:#1e3a5f}
  .now{font-size:15px;font-weight:600;margin:14px 0 20px}
  .cta{display:block;text-align:center;background:#1e3a5f;color:#fff;text-decoration:none;font-weight:700;padding:14px;border-radius:8px;margin:0 0 20px}
  h2{font-size:15px;color:#1e3a5f;margin:24px 0 10px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
  .u{border-left:3px solid #1e3a5f;padding:2px 0 2px 12px;margin:0 0 16px}
  .u .t{font-size:12px;color:#6b7280;margin-bottom:4px} .u p{margin:0;font-size:15px;line-height:1.45}
  .ph{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:10px}
  .ph a{display:block} .ph img{width:100%;height:120px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}
  .foot{background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 20px;text-align:center;font-size:12px;color:#6b7280}
  .foot a{color:#1e3a5f;font-weight:700}
</style></head><body><div class="wrap">
<div class="top"><span>MASTER TECH RV REPAIR AND STORAGE</span></div>
<div class="body">${inner}</div>
<div class="foot">Questions? Call or text <a href="tel:+13035572214">(303) 557-2214</a><br>6590 E. 49th Ave., Commerce City, CO 80022</div>
</div></body></html>`;
}

function notFound(res) {
  res.status(404).send(page('Link not found',
    `<h1>We couldn't find that job</h1><p class="sub">This link may be mistyped. Call us at (303) 557-2214 and we'll tell you where things stand.</p>`));
}

// Strip what only makes sense inside a text message: the link back to this
// very page and the STOP line.
function forPage(message, selfUrlTail) {
  return String(message || '')
    .split(STOP_LINE).join('')
    .replace(/https?:\/\/\S*\/api\/public\/status\/\S+/g, '')
    .replace(selfUrlTail, '')
    .replace(/Follow it here:\s*$/i, '')
    .replace(/(Photos and the estimate are here:)\s*$/i, 'Photos and the estimate are on this page.')
    .replace(/\s+/g, ' ')
    .trim();
}

function denverStamp(ts) {
  return new Date(ts).toLocaleString('en-US', {
    timeZone: 'America/Denver', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function backendBase(req) {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// Where the customer approves, if anything is waiting on them.
//   - Inspection findings on a work order (estimate lines): shown while the
//     shop is waiting on the customer, meaning the record sits in Awaiting
//     Approval or the newest text sent was "Needs your approval".
//   - A whole estimate not yet approved: its record-level approval link.
async function pendingApproval(record, base, latestType) {
  if (record.status !== 'estimate' && (record.status === 'awaiting_approval' || latestType === 'needs_approval')) {
    const { rows: pend } = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM record_labor_lines WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL)
           OR EXISTS (SELECT 1 FROM record_parts_lines WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL) AS any`,
      [record.id]
    );
    if (pend[0].any) {
      const { rows } = await pool.query(
        `SELECT approval_token FROM estimate_line_approvals
          WHERE record_id = $1 AND expires_at > NOW()
          ORDER BY created_at DESC LIMIT 1`,
        [record.id]
      );
      if (rows.length) return `${base}/api/estimate-lines/approve/${rows[0].approval_token}`;
    }
  }
  if (record.status === 'estimate' && record.approval_token && !record.approved_by_customer_at
      && (!record.approval_token_expires_at || new Date(record.approval_token_expires_at) > new Date())) {
    return `${base}/api/records/approve/${record.approval_token}`;
  }
  return null;
}

router.get('/:token', async (req, res) => {
  const token = String(req.params.token || '').trim();
  if (!UUID_RE.test(token)) return notFound(res);
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.record_number, r.status, r.approval_token, r.approval_token_expires_at,
              r.approved_by_customer_at, c.first_name, u.year, u.make, u.model,
              to_char(r.expected_completion_date, 'YYYY-MM-DD') AS expected_completion
         FROM records r
         JOIN customers c ON c.id = r.customer_id
         LEFT JOIN units u ON u.id = r.unit_id
        WHERE r.photo_token::text = $1 AND r.deleted_at IS NULL`,
      [token]
    );
    if (!rows.length) return notFound(res);
    const r = rows[0];
    if (r.status === 'void') return notFound(res);

    const { rows: updates } = await pool.query(
      `SELECT update_type, message, photo_ids, created_at
         FROM record_status_updates
        WHERE record_id = $1 AND delivery_status = 'sent'
        ORDER BY created_at DESC`,
      [r.id]
    );

    let stage = STAGE_BY_STATUS[r.status] || 0;
    for (const u of updates) stage = Math.max(stage, STAGE_BY_TYPE.get(u.update_type) || 0);
    if (!stage && updates.length) stage = 1;

    const base = backendBase(req);
    const approveUrl = await pendingApproval(r, base, updates.length ? updates[0].update_type : null);

    const stepHtml = STAGES.map((_, i) => {
      const n = i + 1;
      const cls = n < stage ? 'done' : n === stage ? (stage === 3 ? 'done' : 'on') : '';
      return `<div class="step ${cls}"></div>`;
    }).join('');
    const labelHtml = STAGES.map((l, i) => (i + 1 === stage ? `<b>${esc(l)}</b>` : `<span>${esc(l)}</span>`)).join('');
    const nowText = SUBSTATUS[r.status] || (stage ? STAGES[stage - 1] : 'Scheduled');

    const photoImg = (id) => `${base}/api/public/records/${r.id}/photos/${id}/image?token=${encodeURIComponent(token)}`;
    const updatesHtml = updates.length
      ? updates.map(u => {
          const ids = Array.isArray(u.photo_ids) ? u.photo_ids : [];
          const photos = ids.length
            ? `<div class="ph">${ids.map(id => `<a href="${esc(photoImg(id))}" target="_blank" rel="noopener"><img src="${esc(photoImg(id))}" alt="Photo from your RV" loading="lazy"></a>`).join('')}</div>`
            : '';
          return `<div class="u"><div class="t">${esc(denverStamp(u.created_at))}</div><p>${esc(forPage(u.message, token))}</p>${photos}</div>`;
        }).join('')
      : `<p class="sub">No updates yet. We'll text you as soon as work starts.</p>`;

    // Same rule as the texts: no date, or a date already past, shows nothing.
    const { completionInfo } = require('../services/statusUpdates');
    const ci = stage < 3 && !['complete', 'payment_pending', 'partial', 'paid', 'written_off'].includes(r.status) ? completionInfo(r) : null;
    const expectedHtml = ci && ci.line
      ? `<div class="sub" style="margin-top:-12px">Expected completion: <b style="color:#1e3a5f">${esc(ci.text)}</b></div>`
      : '';

    res.set('Cache-Control', 'no-store');
    res.send(page(`Work order #${r.record_number}`, `
      <h1>Your ${esc(rvLabel(r))}</h1>
      <p class="sub">Work order #${esc(r.record_number)} for ${esc(niceFirstName(r.first_name))}</p>
      <div class="steps">${stepHtml}</div>
      <div class="labels">${labelHtml}</div>
      <div class="now">Right now: ${esc(nowText)}</div>
      ${expectedHtml}
      ${approveUrl ? `<a class="cta" href="${esc(approveUrl)}">Review and approve the estimate</a>` : ''}
      <h2>Updates</h2>
      ${updatesHtml}
    `));
  } catch (err) {
    console.error('Public status page error:', err);
    res.status(500).send(page('Something went wrong',
      `<h1>We hit a snag loading this page</h1><p class="sub">Call us at (303) 557-2214 and we'll tell you where things stand.</p>`));
  }
});

module.exports = router;
