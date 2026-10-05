// In-ERP notification center: the bell in the top bar and the Notifications
// page.
//
// Why this exists: every alert used to be a one-off email or text to the shop
// (new leads, estimate approvals, autopay declines, reschedule requests), and
// some things alerted nobody at all (bounced customer email, failed texts,
// customers replying STOP). Once an alert is buried in Gmail it is gone. A
// notification stays open until someone marks it handled.
//
// Rules:
// - notify() NEVER throws and never blocks the caller. A notification problem
//   must not fail a payment, a status change, a webhook or a text.
// - Existing shop emails are unchanged. The bell is in addition to them.
// - dedupe_key: while a notification with the same key is open, a repeat bumps
//   its count and timestamp instead of adding another row. Once it is marked
//   handled, the next occurrence opens a fresh one.

const pool = require('../db/pool');

// type -> label and default severity. Urgent sorts first and shows red.
const TYPES = {
  email_bounce:        { label: 'Email bounced',        severity: 'normal' },
  sms_failed:          { label: 'Text failed',          severity: 'normal' },
  sms_opt_out:         { label: 'Replied STOP',         severity: 'normal' },
  autopay_declined:    { label: 'Autopay declined',     severity: 'urgent' },
  estimate_approved:   { label: 'Estimate approved',    severity: 'normal' },
  reschedule_request:  { label: 'Reschedule request',   severity: 'normal' },
  cancel_request:      { label: 'Cancellation request', severity: 'urgent' },
  new_lead:            { label: 'New lead',             severity: 'urgent' },
};

const INSTALL_SQL = `
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(40) NOT NULL,
    severity VARCHAR(10) NOT NULL DEFAULT 'normal',
    title TEXT NOT NULL,
    body TEXT,
    customer_id INTEGER,
    record_id INTEGER,
    link TEXT,
    dedupe_key VARCHAR(200),
    occurrences INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    handled_at TIMESTAMPTZ,
    handled_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_open ON notifications(last_at DESC) WHERE handled_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_notifications_handled ON notifications(handled_at DESC) WHERE handled_at IS NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_open_dedupe
    ON notifications(dedupe_key) WHERE handled_at IS NULL AND dedupe_key IS NOT NULL;
`;

async function installNotifications(db = pool) {
  await db.query(INSTALL_SQL);
}

function clip(s, n) {
  const t = String(s == null ? '' : s);
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/**
 * Open (or bump) a notification. Never throws. Returns the row id or null.
 * @param {object} n { type, title, body?, customerId?, recordId?, link?, dedupeKey?, severity? }
 */
async function notify(n, db = pool) {
  try {
    if (!n || !n.type || !n.title) return null;
    const def = TYPES[n.type] || { severity: 'normal' };
    const severity = n.severity || def.severity;
    const params = [
      n.type, severity, clip(n.title, 300), n.body ? clip(n.body, 4000) : null,
      n.customerId || null, n.recordId || null, n.link || null,
      n.dedupeKey ? clip(n.dedupeKey, 200) : null,
    ];
    const { rows } = n.dedupeKey
      ? await db.query(
        `INSERT INTO notifications (type, severity, title, body, customer_id, record_id, link, dedupe_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (dedupe_key) WHERE handled_at IS NULL AND dedupe_key IS NOT NULL
         DO UPDATE SET occurrences = notifications.occurrences + 1,
                       last_at = NOW(),
                       title = EXCLUDED.title,
                       body = EXCLUDED.body,
                       severity = EXCLUDED.severity,
                       type = EXCLUDED.type
         RETURNING id`, params)
      : await db.query(
        `INSERT INTO notifications (type, severity, title, body, customer_id, record_id, link, dedupe_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, params);
    return rows[0] ? rows[0].id : null;
  } catch (err) {
    console.error('[notifications] notify failed:', n && n.type, err.message);
    return null;
  }
}

// Fire and forget wrapper for call sites that must not await.
function notifyLater(n) {
  notify(n).catch(() => {});
}

// Customer(s) whose primary or secondary phone ends in these 10 digits.
async function customersByPhone(phone, db = pool) {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return [];
  try {
    const { rows } = await db.query(
      `SELECT id, first_name, last_name FROM customers
        WHERE deleted_at IS NULL
          AND (regexp_replace(COALESCE(phone_primary, ''), '\\D', '', 'g') LIKE $1
            OR regexp_replace(COALESCE(phone_secondary, ''), '\\D', '', 'g') LIKE $1
            OR regexp_replace(COALESCE(phone_mobile, ''), '\\D', '', 'g') LIKE $1)
        ORDER BY id LIMIT 5`,
      [`%${digits}`]
    );
    return rows;
  } catch (err) {
    console.error('[notifications] phone lookup failed:', err.message);
    return [];
  }
}

function fullName(c) {
  return [c && c.first_name, c && c.last_name].filter(Boolean).join(' ').trim();
}

function formatPhone(p) {
  const d = String(p || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(p || '');
}

module.exports = {
  TYPES, installNotifications, notify, notifyLater,
  customersByPhone, fullName, formatPhone,
};
