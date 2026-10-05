// End-to-end check of the notification center against a REAL Postgres built
// from database/migrations. Dialpad and email are stubbed, so nothing is sent.
//
//   DATABASE_URL=postgres://... node server/test-notifications.js
//
// Covers: install is idempotent; notify() inserts, de-dupes while open, opens a
// fresh one after handled, and never throws; the Resend webhook notifies on a
// customer-facing bounce but not on a marketing campaign bounce (by tag or by
// subject) and not twice on a retried delivery; failed and invalid-number texts
// notify, opted-out ones do not; a STOP reply notifies; autopay decline,
// new lead, reschedule then cancel; the API counts, lists, marks handled,
// refuses to reopen over a newer open one, handles all, and keeps
// technicians out.

const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const poolPath = require.resolve('./src/db/pool');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: pool };

const sms = [];
let dialpadFails = false;
const dialpadPath = require.resolve('./src/services/dialpad');
require.cache[dialpadPath] = {
  id: dialpadPath, filename: dialpadPath, loaded: true,
  exports: {
    isDialpadConfigured: () => true,
    sendDialpadSMS: async (to, text) => {
      sms.push({ to, text });
      return dialpadFails ? { success: false, error: 'carrier rejected: landline' } : { success: true, id: 'dp' };
    },
  },
};
const emails = [];
const emailPath = require.resolve('./src/services/email');
require.cache[emailPath] = {
  id: emailPath, filename: emailPath, loaded: true,
  exports: { sendEmail: async (m) => { emails.push(m); return { success: true }; }, sendAppointmentConfirmation: async () => ({}) },
};

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.RESEND_WEBHOOK_SECRET = 'whsec_' + Buffer.from('notif-test-secret').toString('base64');
process.env.SHOP_SMS_NUMBERS = '';

const svc = require('./src/services/notifications');
const { sendSMS } = require('./src/services/sms');

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`}`);
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const open = async (type) => (await pool.query(
  `SELECT * FROM notifications WHERE handled_at IS NULL ${type ? 'AND type = $1' : ''} ORDER BY id`, type ? [type] : [])).rows;

function sign(id, ts, body) {
  const key = Buffer.from(process.env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/, ''), 'base64');
  return 'v1,' + crypto.createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
}

(async () => {
  // Boot-migration pieces this feature leans on (mirrors app.js).
  await pool.query(`
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT false;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_out_date TIMESTAMPTZ;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_mobile VARCHAR(30);
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid BOOLEAN DEFAULT false;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid_date TIMESTAMPTZ;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_opt_out_date TIMESTAMPTZ;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN DEFAULT false;
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_token UUID DEFAULT gen_random_uuid();
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_status VARCHAR(30);
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ;
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_date DATE;
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_time VARCHAR(10);
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_note TEXT;
    CREATE TABLE IF NOT EXISTS email_events (
      id SERIAL PRIMARY KEY, svix_id VARCHAR(100) NOT NULL UNIQUE, event_type VARCHAR(40) NOT NULL,
      email_id VARCHAR(100), recipients TEXT, subject TEXT, bounce_type VARCHAR(40),
      payload JSONB, outcome JSONB, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS email_unsubscribes (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE, reason TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
    DROP TABLE IF EXISTS notifications;
    TRUNCATE appointments, email_campaigns, users, email_events, email_unsubscribes CASCADE;
    TRUNCATE customers CASCADE;
  `);

  // Install twice: must be idempotent.
  await svc.installNotifications(pool);
  await svc.installNotifications(pool);
  check('install is idempotent', (await pool.query(`SELECT to_regclass('notifications') IS NOT NULL AS ok`)).rows[0].ok, true);

  // Fixtures
  const cust = async (first, last, email, phone) => (await pool.query(
    `INSERT INTO customers (account_number, first_name, last_name, email_primary, phone_primary)
     VALUES ('T' || (floor(random() * 1e9))::text, $1, $2, $3, $4) RETURNING id`,
    [first, last, email, phone])).rows[0].id;
  const fran = await cust('FRANCISCO', 'RODRIGUEZ', 'fran@example.com', '303-555-0101');
  const tom = await cust('TOM', 'STAUFFER', 'tom@example.com', '(303) 555-0102');
  const optd = await cust('OPTED', 'OUT', 'o@example.com', '3035550103');
  await pool.query('UPDATE customers SET sms_opt_out = TRUE WHERE id = $1', [optd]);
  await pool.query(`INSERT INTO email_campaigns (name, template_type, subject, body_html) VALUES ('Roof', 'seasonal', 'Free roof inspection this fall', '<p>x</p>')`);

  // ---- notify() core ----
  const id1 = await svc.notify({ type: 'new_lead', title: 'Lead A', dedupeKey: 'k1' });
  const id2 = await svc.notify({ type: 'new_lead', title: 'Lead A again', dedupeKey: 'k1' });
  check('dedupe: same open key bumps instead of inserting', [id1 === id2, (await open('new_lead'))[0].occurrences, (await open('new_lead'))[0].title], [true, 2, 'Lead A again']);
  await pool.query('UPDATE notifications SET handled_at = NOW() WHERE id = $1', [id1]);
  const id3 = await svc.notify({ type: 'new_lead', title: 'Lead A third', dedupeKey: 'k1' });
  check('after handled, same key opens a fresh one', id3 !== id1 && !!id3, true);
  check('urgent default severity for new_lead', (await open('new_lead'))[0].severity, 'urgent');
  check('notify without title returns null, no throw', await svc.notify({ type: 'new_lead' }), null);
  check('notify with bad customer id type returns null, no throw', await svc.notify({ type: 'new_lead', title: 'x', customerId: 'abc' }), null);
  await pool.query('DELETE FROM notifications');

  // ---- Resend webhook ----
  const app = express();
  app.use('/api/resend/webhook', express.raw({ type: '*/*' }), require('./src/routes/resendWebhook'));
  const server = app.listen(0);
  const port = server.address().port;
  const post = async (id, event) => {
    const body = JSON.stringify(event);
    const ts = Math.floor(Date.now() / 1000);
    const r = await fetch(`http://127.0.0.1:${port}/api/resend/webhook`, {
      method: 'POST', body,
      headers: { 'content-type': 'application/json', 'svix-id': id, 'svix-timestamp': String(ts), 'svix-signature': sign(id, ts, body) },
    });
    return r.status;
  };
  const bounce = (to, subject, extra = {}) => ({ type: 'email.bounced', data: { to: [to], subject, bounce: { type: 'Permanent', message: 'mailbox does not exist' }, ...extra } });

  check('customer-facing bounce -> 200', await post('m1', bounce('FRAN@example.com', 'Your appointment is confirmed')), 200);
  let b = await open('email_bounce');
  check('customer-facing bounce opens one notification for the customer', [b.length, b[0] && b[0].customer_id, b[0] && b[0].link], [1, fran, `/customers/${fran}`]);
  check('customer flagged invalid', (await pool.query('SELECT email_invalid FROM customers WHERE id=$1', [fran])).rows[0].email_invalid, true);
  await post('m1', bounce('fran@example.com', 'Your appointment is confirmed'));
  check('retried delivery (same svix-id) does not bump', (await open('email_bounce'))[0].occurrences, 1);
  await post('m2', bounce('tom@example.com', 'Free roof inspection this fall', { tags: { category: 'marketing' } }));
  await post('m3', bounce('tom@example.com', 'Free roof inspection this fall'));
  await post('m4', bounce('tom@example.com', 'Spring special', { tags: [{ name: 'category', value: 'marketing' }] }));
  check('campaign bounces (object tag, subject match, array tag) do not notify', (await open('email_bounce')).length, 1);
  check('...but still flag the address', (await pool.query('SELECT email_invalid FROM customers WHERE id=$1', [tom])).rows[0].email_invalid, true);
  await post('m5', { type: 'email.bounced', data: { to: ['tom@example.com'], subject: 'Invoice', bounce: { type: 'Transient' } } });
  check('transient bounce does not notify', (await open('email_bounce')).length, 1);
  await post('m6', bounce('nobody@example.com', 'Your invoice'));
  b = await open('email_bounce');
  check('unmatched address still notifies, no customer link', [b.length, b[1] && b[1].customer_id, b[1] && b[1].link], [2, null, null]);
  server.close();

  // ---- Texts ----
  sms.length = 0;
  check('opted-out text is skipped', (await sendSMS('3035550103', 'hi')).skipped, 'opted_out');
  dialpadFails = true;
  await sendSMS('303-555-0102', 'Hi Tom, your appointment is confirmed for Tue Oct 6 at 9:00 AM.');
  await sendSMS('303-555-0102', 'Second try');
  dialpadFails = false;
  await sendSMS('12345', 'bad number text');
  await wait(300);
  const sf = await open('sms_failed');
  check('failed text notifies once per number, bumped on repeat', [sf.length, sf[0].customer_id, sf[0].occurrences, sf[0].title], [2, tom, 2, 'Text to TOM STAUFFER failed']);
  check('invalid number notifies with no customer', [sf[1].customer_id, /not a valid US number/.test(sf[1].body)], [null, true]);
  check('opted-out skip did not notify', sf.some(n => /0103/.test(n.dedupe_key)), false);

  // ---- STOP reply ----
  const dApp = express(); dApp.use(express.json()); dApp.use('/api/dialpad', require('./src/routes/dialpadWebhook'));
  const dSrv = dApp.listen(0);
  await fetch(`http://127.0.0.1:${dSrv.address().port}/api/dialpad/webhook`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ direction: 'inbound', from_number: '+13035550101', text: 'stop' }),
  });
  dSrv.close();
  const so = await open('sms_opt_out');
  check('STOP reply opts out and notifies', [so.length, so[0] && so[0].customer_id, (await pool.query('SELECT sms_opt_out FROM customers WHERE id=$1', [fran])).rows[0].sms_opt_out], [1, fran, true]);

  // ---- Autopay decline ----
  const { notifyOwnerFailure } = require('./src/jobs/storageAutopayCron');
  const bill = { billing_id: 77, customer_id: tom, first_name: 'TOM', last_name: 'STAUFFER', space_label: 'B-12', monthly_rate: '185.00' };
  await notifyOwnerFailure(bill, 2026, 11, 'CARD_DECLINED', false);
  await notifyOwnerFailure(bill, 2026, 11, 'CARD_DECLINED', true);
  const ad = await open('autopay_declined');
  check('autopay decline: one per space per month, retry bumps, urgent', [ad.length, ad[0].occurrences, ad[0].severity, /no further attempts/.test(ad[0].body)], [1, 2, 'urgent', true]);
  check('autopay owner email still sent', emails.filter(e => /Autopay declined/.test(e.subject)).length, 2);

  // ---- New lead ----
  const { sendLeadAlerts } = require('./src/services/leadAlerts');
  await sendLeadAlerts({ id: 501, name: 'Pat Camper', phone: '720-555-0199', email: 'pat@example.com', customer_id: null,
    message: 'RV: 2021 Airstream Basecamp | Services: Roof reseal | Issue: leak over door', source: 'website' });
  const nl = await open('new_lead');
  check('new lead notifies with link and detail', [nl.length, nl[0].link, /Roof reseal/.test(nl[0].body)], [1, '/leads/501', true]);
  check('shop lead email still sent', emails.some(e => /Pat Camper/.test(e.subject || '') || /Pat Camper/.test(e.html || '')), true);
  const dry = await sendLeadAlerts({ id: 502, name: 'Dry Run' }, { dryRun: true });
  check('dry run does not notify', [(await open('new_lead')).length, !!dry.dryRun], [1, true]);

  // ---- Reschedule then cancel (same appointment, one notification) ----
  const appt = (await pool.query(
    `INSERT INTO appointments (customer_id, appointment_type, scheduled_at, status)
     VALUES ($1, 'drop_off', NOW() + INTERVAL '3 days', 'scheduled') RETURNING id, reschedule_token`, [tom])).rows[0];
  const rApp = express(); rApp.use('/api/appointments/reschedule', require('./src/routes/appointmentReschedule'));
  const rSrv = rApp.listen(0); const rp = rSrv.address().port;
  await fetch(`http://127.0.0.1:${rp}/api/appointments/reschedule/${appt.reschedule_token}`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'requested_date=2026-10-20&requested_time=09:00&note=Out+of+town',
  });
  await wait(200);
  let rr = await open();
  rr = rr.filter(n => n.dedupe_key === `appointment_request:${appt.id}`);
  check('reschedule request notifies', [rr.length, rr[0] && rr[0].type, rr[0] && rr[0].link], [1, 'reschedule_request', `/schedule/${appt.id}`]);
  await fetch(`http://127.0.0.1:${rp}/api/appointments/reschedule/${appt.reschedule_token}/cancel`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'reason=Sold+the+RV',
  });
  await wait(200);
  rSrv.close();
  rr = (await open()).filter(n => n.dedupe_key === `appointment_request:${appt.id}`);
  check('cancel after reschedule updates the same notification to cancel + urgent', [rr.length, rr[0].type, rr[0].severity, rr[0].occurrences], [1, 'cancel_request', 'urgent', 2]);

  // ---- API ----
  const users = (await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES
       ('Carol', 'carol@test', 'x', 'admin'), ('Tech', 'tech@test', 'x', 'technician') RETURNING id, role`)).rows;
  const tokenFor = (u) => jwt.sign({ id: u.id, role: u.role, email: 'x', name: 'x' }, process.env.JWT_SECRET);
  const { requireAuth } = require('./src/middleware/auth');
  const aApp = express(); aApp.use(express.json());
  aApp.use('/api/notifications', requireAuth, require('./src/routes/notifications'));
  const aSrv = aApp.listen(0); const ap = aSrv.address().port;
  const call = async (u, path, method = 'GET', body) => {
    const r = await fetch(`http://127.0.0.1:${ap}/api/notifications${path}`, {
      method, headers: { 'content-type': 'application/json', authorization: `Bearer ${tokenFor(u)}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, json: await r.json().catch(() => null) };
  };
  const admin = users.find(u => u.role === 'admin'), tech = users.find(u => u.role === 'technician');
  const total = (await open()).length;
  const cnt = await call(admin, '/count');
  check('count matches open rows', cnt.json.open, total);
  check('urgent count = autopay + lead + cancel', cnt.json.urgent, 3);
  check('technician is refused', (await call(tech, '/count')).status, 403);
  const list = await call(admin, '/');
  check('list puts urgent first', list.json.notifications.slice(0, 3).every(n => n.severity === 'urgent'), true);
  check('list joins customer name', list.json.notifications.some(n => n.customer_name === 'TOM STAUFFER'), true);
  const target = list.json.notifications.find(n => n.type === 'sms_failed' && n.customer_id === tom);
  await call(admin, `/${target.id}/handled`, 'PATCH');
  check('mark handled drops the count', (await call(admin, '/count')).json.open, total - 1);
  const handled = await call(admin, '/?status=handled');
  check('handled list shows who handled it', handled.json.notifications[0].handled_by_name, 'Carol');
  dialpadFails = true; await sendSMS('303-555-0102', 'again'); dialpadFails = false; await wait(300);
  check('reopen refused when a newer open one has the same key', (await call(admin, `/${target.id}/reopen`, 'PATCH')).status, 409);
  const filtered = await call(admin, '/?type=email_bounce');
  check('type filter', filtered.json.notifications.every(n => n.type === 'email_bounce') && filtered.json.notifications.length === 2, true);
  await call(admin, '/handle-all', 'POST', { type: 'email_bounce' });
  check('handle-all by type', (await open('email_bounce')).length, 0);
  await call(admin, '/handle-all', 'POST', {});
  check('handle-all clears everything', (await call(admin, '/count')).json.open, 0);
  aSrv.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(async (err) => {
  console.error('TEST CRASH:', err);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
});
