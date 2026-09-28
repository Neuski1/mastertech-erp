// ---------------------------------------------------------------------------
// Work order status texts.
//
// The dealership-style "your vehicle is in a bay / parts ordered / ready for
// pickup" texts. A technician picks an update on the work order, the ERP fills
// in the customer's name, the RV and a link, the tech can edit the words, and
// one tap sends it through Dialpad on the shop number.
//
// Every text carries a link to the job's status page (routes/publicStatus.js),
// which shows the progress bar, every update sent so far, the photos the tech
// chose to share, and an Approve button when an estimate is waiting.
//
// One text is automatic: Checked In goes out the first time a work order moves
// into active shop work (autoCheckIn, below; Carol, Sept 28, 2026). Every
// other update waits for a person to press Send. The master switch
// `status_texts_enabled` in Business Settings starts OFF so the wording can be
// approved before the first real customer gets one.
// ---------------------------------------------------------------------------

const pool = require('../db/pool');
const settings = require('../db/settings');
const { sendSMS, normalizePhone, isPhoneOptedOut, isSmsConfigured } = require('./sms');

// Order matters: this is the order the buttons appear in the modal.
// `stage` drives the progress bar on the customer's status page.
const UPDATE_TYPES = [
  { key: 'checked_in',     label: 'Checked in',        stage: 1, needsNote: false,
    fallback: "Hi {first_name}, it's Master Tech RV. Your {rv} is checked in on work order #{wo}. We'll text you as the job moves along. Follow it here: {link}" },
  { key: 'in_bay',         label: 'In a service bay',  stage: 2, needsNote: false,
    fallback: 'Hi {first_name}, your {rv} just rolled into a service bay at Master Tech RV. {link}' },
  { key: 'work_started',   label: 'Work started',      stage: 2, needsNote: false,
    fallback: 'Hi {first_name}, our technician has started work on your {rv}. {link}' },
  { key: 'needs_approval', label: 'Needs your approval', stage: 2, needsNote: false,
    fallback: 'Hi {first_name}, we found something on your {rv} that needs your OK before we go further. Photos and the estimate are here: {link}' },
  { key: 'parts_ordered',  label: 'Parts ordered',     stage: 2, needsNote: false,
    fallback: "Hi {first_name}, parts for your {rv} are on order. {note} We'll text you when they arrive. {link}" },
  { key: 'parts_received', label: 'Parts received',    stage: 2, needsNote: false,
    fallback: 'Hi {first_name}, the parts for your {rv} are in and work is back underway. {link}' },
  { key: 'delayed',        label: 'Work delayed',      stage: 2, needsNote: true,
    fallback: "Hi {first_name}, heads up: your {rv} is taking longer than planned. {note} We'll keep you posted. {link}" },
  { key: 'complete',       label: 'Ready for pickup',  stage: 3, needsNote: false,
    fallback: 'Hi {first_name}, good news. Your {rv} is done and ready for pickup. Call (303) 557-2214 to set a time. {link}' },
  { key: 'custom',         label: 'Custom message',    stage: null, needsNote: false,
    fallback: 'Hi {first_name}, {note} {link}' },
];
const BY_KEY = new Map(UPDATE_TYPES.map(t => [t.key, t]));

// Which update a tech most likely wants, given where the work order sits.
const SUGGEST_BY_STATUS = {
  approved: 'checked_in',
  schedule_customer: 'checked_in',
  scheduled: 'checked_in',
  in_progress: 'work_started',
  order_parts: 'parts_ordered',
  awaiting_parts: 'parts_ordered',
  awaiting_approval: 'needs_approval',
  on_hold: 'delayed',
  complete: 'complete',
  payment_pending: 'complete',
  partial: 'complete',
};

// Appended to every text. Not editable: carriers expect it, and Dialpad's
// inbound webhook already honors STOP by setting customers.sms_opt_out.
const STOP_LINE = 'Reply STOP to opt out.';

function templateKey(type) { return `status_text_${type}`; }

function templateFor(type) {
  const def = BY_KEY.get(type);
  if (!def) return null;
  return settings.str(templateKey(type), def.fallback);
}

function isEnabled() {
  return settings.bool('status_texts_enabled', false);
}

function backendUrl() {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '');
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return 'https://mastertech-erp-production.up.railway.app';
}

function statusPageUrl(photoToken) {
  return `${backendUrl()}/api/public/status/${photoToken}`;
}

// "2019 Grand Design Imagine" / "RV" when the unit is blank.
function rvLabel(r) {
  const parts = [r.year, r.make, r.model].map(v => (v == null ? '' : String(v).trim())).filter(Boolean);
  return parts.length ? parts.join(' ') : 'RV';
}

// Title-case a first name the way it was typed in all caps or all lower
// ("GARY" -> "Gary"); leave mixed case ("McDonald") alone.
function niceFirstName(name) {
  const s = String(name || '').trim();
  if (!s) return 'there';
  if (s === s.toUpperCase() || s === s.toLowerCase()) {
    return s.toLowerCase().replace(/(^|[\s-])\S/g, c => c.toUpperCase());
  }
  return s;
}

// Fill {tokens}, then tidy the gaps an empty {note} leaves behind.
function render(template, vars) {
  let out = String(template || '');
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(v == null ? '' : String(v));
  }
  return out
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([.,!?])/g, '$1')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function withStopLine(body) {
  const b = String(body || '').trim();
  if (/reply stop/i.test(b)) return b;
  return `${b} ${STOP_LINE}`;
}

async function loadRecord(recordId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.record_number, r.status, r.customer_id, r.photo_token,
            c.first_name, c.last_name, c.phone_primary, c.phone_secondary,
            COALESCE(c.sms_opt_out, FALSE) AS sms_opt_out,
            u.year, u.make, u.model
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       LEFT JOIN units u ON u.id = r.unit_id
      WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [recordId]
  );
  if (!rows.length) return null;
  const r = rows[0];
  if (!r.photo_token) {
    const { ensurePhotoToken } = require('../routes/publicPhotos');
    r.photo_token = await ensurePhotoToken(r.id);
  }
  return r;
}

// Everything the modal needs to draw itself: the buttons, a filled-in draft
// for each, who it goes to, and any reason it cannot go.
async function composeOptions(recordId) {
  const r = await loadRecord(recordId);
  if (!r) return null;
  const link = statusPageUrl(r.photo_token);
  const baseVars = { first_name: niceFirstName(r.first_name), rv: rvLabel(r), wo: r.record_number, link };

  const phone = normalizePhone(r.phone_primary) || normalizePhone(r.phone_secondary);
  const optedOut = r.sms_opt_out || (phone ? await isPhoneOptedOut(phone) : false);

  const blockers = [];
  if (!isEnabled()) blockers.push('Status texts are switched off in Settings > Business Settings > Status Texts.');
  if (!isSmsConfigured()) blockers.push('Dialpad texting is not configured on the server.');
  if (!phone) blockers.push('This customer has no valid mobile number on file.');
  if (optedOut) blockers.push('This customer has opted out of texts (replied STOP).');

  return {
    record_id: r.id,
    record_number: r.record_number,
    record_status: r.status,
    customer_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
    to: phone,
    link,
    enabled: isEnabled(),
    can_send: blockers.length === 0,
    blockers,
    suggested: SUGGEST_BY_STATUS[r.status] || 'custom',
    stop_line: STOP_LINE,
    types: UPDATE_TYPES.map(t => ({
      key: t.key,
      label: t.label,
      needs_note: t.needsNote,
      template: templateFor(t.key),
      // Draft with {note} left for the modal to fill as the tech types.
      draft: render(templateFor(t.key).split('{note}').join('\u0000NOTE\u0000'), baseVars)
        .split('\u0000NOTE\u0000').join('{note}'),
    })),
  };
}

// Build the exact text that will go out. The modal sends back the message the
// tech saw (possibly edited); if it did not, render from the template.
async function buildMessage(recordId, { type, note, message }) {
  const r = await loadRecord(recordId);
  if (!r) return { error: 'Record not found', status: 404 };
  const def = BY_KEY.get(type);
  if (!def) return { error: `Unknown update type "${type}"`, status: 400 };
  const cleanNote = String(note || '').trim();
  if (def.needsNote && !cleanNote && !String(message || '').trim()) {
    return { error: `"${def.label}" needs a short reason or new date for the customer.`, status: 400 };
  }
  const link = statusPageUrl(r.photo_token);
  let body = String(message || '').trim();
  if (!body) {
    body = render(templateFor(type), {
      first_name: niceFirstName(r.first_name), rv: rvLabel(r), wo: r.record_number, link, note: cleanNote,
    });
  } else {
    body = render(body, { note: cleanNote, link });
  }
  if (type === 'custom' && !body.replace(link, '').replace(/^Hi \S+,?/i, '').trim()) {
    return { error: 'Type the message you want to send.', status: 400 };
  }
  return { record: r, body: withStopLine(body), link };
}

// Send one update. dryRun returns the exact text and recipient, sends nothing
// and writes nothing.
async function sendStatusUpdate(recordId, { type, note, message, photoIds, userId, dryRun }) {
  const built = await buildMessage(recordId, { type, note, message });
  if (built.error) return { ok: false, status: built.status, error: built.error };
  const { record: r, body } = built;

  const phone = normalizePhone(r.phone_primary) || normalizePhone(r.phone_secondary);
  const ids = Array.isArray(photoIds) ? photoIds.map(n => parseInt(n, 10)).filter(Number.isInteger) : [];

  // Only photos that belong to this work order can be shared on its page.
  let photos = [];
  if (ids.length) {
    const { rows } = await pool.query(
      'SELECT id FROM record_photos WHERE record_id = $1 AND id = ANY($2::int[])',
      [r.id, ids]
    );
    photos = rows.map(p => p.id);
  }

  if (dryRun) {
    return { ok: true, dryRun: true, to: phone, body, length: body.length, photo_ids: photos };
  }

  // "Needs your approval" points the customer at the status page, whose
  // Approve button needs a live line-approval token. Make one if the findings
  // were never emailed. Creating a token sends nothing and changes no lines.
  if (type === 'needs_approval') await ensureLineApprovalToken(r.id);

  if (!isEnabled()) return { ok: false, status: 409, error: 'Status texts are switched off in Business Settings.' };
  if (!phone) return { ok: false, status: 400, error: 'This customer has no valid mobile number on file.' };

  const result = await sendSMS(phone, body);
  if (!result.success) {
    const why = result.skipped === 'opted_out' ? 'This customer has opted out of texts.'
      : result.skipped === 'not_configured' ? 'Dialpad texting is not configured on the server.'
      : result.skipped === 'invalid_phone' ? 'The phone number on file is not a valid mobile number.'
      : (result.error || 'Dialpad did not accept the text.');
    // A failed send is still history: log it so nobody assumes the customer knows.
    await logUpdate(r, { type, body, photos, userId, delivery: 'failed', error: why, providerId: null });
    return { ok: false, status: 502, error: why };
  }

  const row = await logUpdate(r, { type, body, photos, userId, delivery: 'sent', error: null, providerId: result.sid || null });
  return { ok: true, to: phone, body, update: row };
}

async function ensureLineApprovalToken(recordId) {
  try {
    const { rows } = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM record_labor_lines WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL)
           OR EXISTS (SELECT 1 FROM record_parts_lines WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL) AS any,
              EXISTS (SELECT 1 FROM estimate_line_approvals WHERE record_id = $1 AND expires_at > NOW()) AS live`,
      [recordId]
    );
    if (rows[0].any && !rows[0].live) {
      await pool.query('INSERT INTO estimate_line_approvals (record_id) VALUES ($1)', [recordId]);
    }
  } catch (err) {
    console.error('[statusUpdates] approval token check failed:', err.message);
  }
}

async function logUpdate(r, { type, body, photos, userId, delivery, error, providerId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: comm } = await client.query(
      `INSERT INTO communication_log
         (customer_id, record_id, channel, trigger_event, message_content, delivery_status, is_manual, sent_by_user_id)
       VALUES ($1, $2, 'sms', $3, $4, $5, TRUE, $6)
       RETURNING id`,
      [r.customer_id, r.id, `status_update_${type}`, body, delivery, userId || null]
    );
    const { rows } = await client.query(
      `INSERT INTO record_status_updates
         (record_id, customer_id, update_type, message, photo_ids, delivery_status, error, provider_message_id,
          communication_log_id, sent_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [r.id, r.customer_id, type, body, photos, delivery, error, providerId, comm[0].id, userId || null]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[statusUpdates] log failed:', err.message);
    return null;
  } finally {
    client.release();
  }
}

// Statuses that mean the RV is physically in the shop and work is active.
// Approved (Not Started), Schedule Customer and Scheduled are deliberately
// absent: the customer has said yes but the RV is not on the lot yet.
const CHECKIN_STATUSES = ['in_progress', 'order_parts', 'awaiting_parts', 'awaiting_approval'];

// Called by PATCH /api/records/:id/status after the change commits. Sends the
// Checked In text the first time a work order enters active work, and never
// again once one has gone out. Returns what happened so the screen can say so.
async function autoCheckIn(recordId, { from, to, userId }) {
  if (!CHECKIN_STATUSES.includes(to) || CHECKIN_STATUSES.includes(from)) return null;
  if (!isEnabled()) return { sent: false, reason: 'switched_off' };
  if (!settings.bool('status_text_auto_checkin', true)) return { sent: false, reason: 'auto_off' };

  const { rows } = await pool.query(
    `SELECT 1 FROM record_status_updates
      WHERE record_id = $1 AND update_type = 'checked_in' AND delivery_status = 'sent' LIMIT 1`,
    [recordId]
  );
  if (rows.length) return { sent: false, reason: 'already_sent' };

  const out = await sendStatusUpdate(recordId, { type: 'checked_in', userId, dryRun: false });
  if (out.ok) return { sent: true, to: out.to, body: out.body };
  return { sent: false, reason: 'blocked', error: out.error };
}

async function listUpdates(recordId) {
  const { rows } = await pool.query(
    `SELECT s.*, u.name AS sent_by_name
       FROM record_status_updates s
       LEFT JOIN users u ON u.id = s.sent_by_user_id
      WHERE s.record_id = $1
      ORDER BY s.created_at DESC`,
    [recordId]
  );
  return rows;
}

async function installStatusUpdates(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS record_status_updates (
      id SERIAL PRIMARY KEY,
      record_id INTEGER NOT NULL REFERENCES records(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      update_type VARCHAR(40) NOT NULL,
      message TEXT NOT NULL,
      photo_ids INTEGER[] NOT NULL DEFAULT '{}',
      delivery_status VARCHAR(20) NOT NULL DEFAULT 'sent',
      error TEXT,
      provider_message_id TEXT,
      communication_log_id INTEGER,
      sent_by_user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_record_status_updates_record
      ON record_status_updates(record_id, created_at DESC);
  `);
}

module.exports = {
  UPDATE_TYPES,
  SUGGEST_BY_STATUS,
  STOP_LINE,
  templateKey,
  composeOptions,
  buildMessage,
  sendStatusUpdate,
  autoCheckIn,
  CHECKIN_STATUSES,
  listUpdates,
  statusPageUrl,
  installStatusUpdates,
  // exported for tests
  render,
  rvLabel,
  niceFirstName,
  withStopLine,
};
