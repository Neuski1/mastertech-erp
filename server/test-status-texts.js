// End-to-end check of work order status texts against a REAL Postgres built
// from database/migrations, with Dialpad stubbed so nothing is sent.
//
//   DATABASE_URL=postgres://... node test-status-texts.js
//
// Covers: templates render, the master switch blocks a live send, dry run
// writes nothing, a live send logs to communication_log AND
// record_status_updates, opt-out and missing phone are refused, only this
// record's photos can be attached, "needs approval" mints a line-approval
// token, and the public status page shows what was sent, the approved work by
// name and every photo, never prices or unapproved findings.

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const poolPath = require.resolve('./src/db/pool');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: pool };

// Stub Dialpad before sms.js loads it.
const sent = [];
const dialpadPath = require.resolve('./src/services/dialpad');
require.cache[dialpadPath] = {
  id: dialpadPath, filename: dialpadPath, loaded: true,
  exports: {
    isDialpadConfigured: () => true,
    sendDialpadSMS: async (to, text) => { sent.push({ to, text }); return { success: true, id: 'dp-' + sent.length }; },
  },
};

const settings = require('./src/db/settings');
const { installBusinessSettings } = require('./src/db/installBusinessSettings');
const svc = require('./src/services/statusUpdates');
const publicStatus = require('./src/routes/publicStatus');

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`}`);
}
function truthy(name, v) { check(name, !!v, true); }

async function setSetting(key, value) {
  await pool.query('UPDATE system_settings SET setting_value = $2 WHERE setting_key = $1', [key, String(value)]);
  settings.invalidate && settings.invalidate();
  await settings.load();
}

function getPage(token) {
  return new Promise((resolve) => {
    const layer = publicStatus.stack.find(l => l.route && l.route.path === '/:token');
    const req = { params: { token }, protocol: 'https', get: () => 'erp.test' };
    let code = 200;
    const res = {
      status(c) { code = c; return this; },
      set() { return this; },
      send(html) { resolve({ status: code, html }); return this; },
    };
    layer.route.stack[0].handle(req, res, () => resolve({ status: 500, html: '' }));
  });
}

(async () => {
  // Boot-migration pieces this feature leans on (mirrors app.js).
  await pool.query(`
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT false;
    ALTER TABLE records ADD COLUMN IF NOT EXISTS photo_token UUID DEFAULT gen_random_uuid();
    ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token UUID DEFAULT gen_random_uuid();
    ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token_expires_at TIMESTAMPTZ;
    ALTER TABLE records ADD COLUMN IF NOT EXISTS approved_by_customer_at TIMESTAMPTZ;
    ALTER TABLE record_photos ALTER COLUMN onedrive_url DROP NOT NULL;
    ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS photo_data BYTEA;
    ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA;
    ALTER TABLE records ADD COLUMN IF NOT EXISTS deadline_type VARCHAR(10) NOT NULL DEFAULT 'flexible';
    ALTER TABLE records ADD COLUMN IF NOT EXISTS deadline_reason TEXT;
    ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
    CREATE TABLE IF NOT EXISTS estimate_line_approvals (
      id SERIAL PRIMARY KEY, record_id INTEGER NOT NULL REFERENCES records(id),
      approval_token UUID NOT NULL DEFAULT gen_random_uuid(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    DROP TABLE IF EXISTS record_status_updates;
  `);
  await installBusinessSettings(pool);
  await svc.installStatusUpdates(pool);
  await svc.installStatusUpdates(pool); // idempotent
  // The seed never overwrites a value, so a rerun against the same database
  // would inherit the switch from last time. Start from OFF.
  await setSetting('status_texts_enabled', 'false');
  await setSetting('status_text_auto_checkin', 'true');

  // Fixtures.
  const cols = async (t) => (await pool.query(
    `SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1`, [t])).rows;
  void cols;
  const { rows: [cust] } = await pool.query(
    `INSERT INTO customers (account_number, last_name, first_name, phone_primary) VALUES ('T-1','Tester','GARY','(303) 555-0142') RETURNING id`);
  const { rows: [unit] } = await pool.query(
    `INSERT INTO units (customer_id, year, make, model) VALUES ($1, 2019, 'Grand Design', 'Imagine') RETURNING id`, [cust.id]);
  const { rows: [rec] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4801,$1,$2,'in_progress') RETURNING id, record_number, photo_token`,
    [cust.id, unit.id]);
  const { rows: [photo] } = await pool.query(
    `INSERT INTO record_photos (record_id, label) VALUES ($1,'Roof seam') RETURNING id`, [rec.id]);

  // Pure helpers.
  check('render drops empty note gap', svc.render('Hi {a}. {note} Bye.', { a: 'X', note: '' }), 'Hi X. Bye.');
  check('title-cases an all-caps first name', svc.niceFirstName('GARY'), 'Gary');
  check('leaves McDonald alone', svc.niceFirstName('McDonald'), 'McDonald');
  check('rv label', svc.rvLabel({ year: 2019, make: 'Grand Design', model: 'Imagine' }), '2019 Grand Design Imagine');
  check('STOP line appended once', svc.withStopLine('Hi. Reply STOP to opt out.'), 'Hi. Reply STOP to opt out.');

  // Compose.
  const opts = await svc.composeOptions(rec.id);
  check('switch starts OFF', opts.enabled, false);
  check('blocked while OFF', opts.can_send, false);
  check('suggests Work started for in_progress', opts.suggested, 'work_started');
  check('recipient normalized', opts.to, '+13035550142');
  const ws = opts.types.find(t => t.key === 'work_started');
  truthy('draft has name, RV and link', ws.draft.includes('Hi Gary,') && ws.draft.includes('2019 Grand Design Imagine') && ws.draft.includes(`/api/public/status/${rec.photo_token}`));
  truthy('parts_ordered draft keeps {note} slot', opts.types.find(t => t.key === 'parts_ordered').draft.includes('{note}'));

  // Dry run while OFF: allowed, writes nothing.
  const dry = await svc.sendStatusUpdate(rec.id, { type: 'parts_ordered', note: 'ETA Thursday.', dryRun: true });
  check('dry run ok', dry.ok, true);
  truthy('dry run text has note and STOP', dry.body.includes('on order. ETA Thursday. We') && dry.body.endsWith('Reply STOP to opt out.'));
  check('dry run sent nothing', sent.length, 0);

  // Live while OFF: refused.
  const off = await svc.sendStatusUpdate(rec.id, { type: 'work_started' });
  check('live send refused while OFF', [off.ok, off.status], [false, 409]);
  check('still nothing sent', sent.length, 0);

  await setSetting('status_texts_enabled', 'true');

  // Delayed needs a note.
  const noNote = await svc.sendStatusUpdate(rec.id, { type: 'delayed' });
  check('delayed without a reason refused', noNote.status, 400);

  // Custom with nothing typed refused.
  const emptyCustom = await svc.sendStatusUpdate(rec.id, { type: 'custom', note: '' });
  check('empty custom refused', emptyCustom.status, 400);

  // Live send with a foreign photo id mixed in.
  const { rows: [otherRec] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4802,$1,$2,'in_progress') RETURNING id`, [cust.id, unit.id]);
  const { rows: [foreign] } = await pool.query(
    `INSERT INTO record_photos (record_id, label) VALUES ($1,'Not yours') RETURNING id`, [otherRec.id]);
  const live = await svc.sendStatusUpdate(rec.id, { type: 'work_started', photoIds: [photo.id, foreign.id], userId: null });
  check('live send ok', live.ok, true);
  check('one text went to Dialpad', sent.length, 1);
  check('to the right number', sent[0].to, '+13035550142');
  check('only this record\'s photo attached', live.update.photo_ids, [photo.id]);
  const { rows: comm } = await pool.query(
    `SELECT channel, trigger_event, delivery_status, is_manual FROM communication_log WHERE record_id = $1`, [rec.id]);
  check('logged to Communication History', comm, [{ channel: 'sms', trigger_event: 'status_update_work_started', delivery_status: 'sent', is_manual: true }]);

  // Edited message is what goes out.
  const edited = await svc.sendStatusUpdate(rec.id, { type: 'parts_ordered', message: 'Hi Gary, parts ordered from Lippert. {note}', note: 'ETA Oct 3.' });
  check('edited text sent verbatim with note filled', sent[1].text, 'Hi Gary, parts ordered from Lippert. ETA Oct 3. Reply STOP to opt out.');
  check('edited send ok', edited.ok, true);

  // Needs approval mints a line-approval token when findings exist.
  await pool.query(
    `INSERT INTO record_labor_lines (record_id, description, hours, rate, line_total, is_estimate_line)
     VALUES ($1, 'Reseal roof', 2, 198, 396, TRUE)`, [rec.id]).catch(e => console.log('labor insert:', e.message));
  await svc.sendStatusUpdate(rec.id, { type: 'needs_approval' });
  const { rows: ela } = await pool.query('SELECT COUNT(*)::int AS n FROM estimate_line_approvals WHERE record_id = $1', [rec.id]);
  check('needs_approval created a line-approval token', ela[0].n, 1);
  await svc.sendStatusUpdate(rec.id, { type: 'needs_approval' });
  const { rows: ela2 } = await pool.query('SELECT COUNT(*)::int AS n FROM estimate_line_approvals WHERE record_id = $1', [rec.id]);
  check('and does not pile up tokens', ela2[0].n, 1);

  // Public page.
  const pg = await getPage(String(rec.photo_token));
  check('status page 200', pg.status, 200);
  truthy('page shows the RV', pg.html.includes('Your 2019 Grand Design Imagine'));
  truthy('page shows sent update text', pg.html.includes('our technician has started work'));
  truthy('page hides STOP line', !pg.html.includes('Reply STOP'));
  truthy('page shows Approve button', pg.html.includes('/api/estimate-lines/approve/'));
  truthy('page shows the shared photo', pg.html.includes(`/photos/${photo.id}/image?token=`));
  truthy('page never shows the other record\'s photo', !pg.html.includes(`/photos/${foreign.id}/image`));
  truthy('page has no prices', !pg.html.includes('$396') && !pg.html.includes('396.00'));

  // Work order details (Oct 22, 2026): job description, approved lines by
  // name, every photo on the record. Never prices, never unapproved findings.
  const { rows: [tech] } = await pool.query(
    `SELECT id FROM technicians LIMIT 1`).catch(() => ({ rows: [] }));
  const techId = tech ? tech.id : (await pool.query(
    `INSERT INTO technicians (name) VALUES ('Mark') RETURNING id`).catch(() => ({ rows: [{ id: null }] }))).rows[0].id;
  await pool.query(`UPDATE records SET job_description = 'Water leak at front cap. Check and reseal.' WHERE id = $1`, [rec.id]);
  await pool.query(
    `INSERT INTO record_labor_lines (record_id, technician_id, description, hours, rate, line_total, sort_order)
     VALUES ($1, $2, 'Diagnose front cap leak', 1.5, 198, 297, 1)`, [rec.id, techId]);
  await pool.query(
    `INSERT INTO record_labor_lines (record_id, technician_id, description, hours, rate, line_total, sort_order, deleted_at)
     VALUES ($1, $2, 'Deleted line text', 1, 198, 198, 2, NOW())`, [rec.id, techId]);
  await pool.query(
    `INSERT INTO record_parts_lines (record_id, description, quantity, sale_price_each, line_total, cost_each)
     VALUES ($1, 'Dicor lap sealant', 3, 17.85, 53.55, 11.20), ($1, 'Front cap trim', 1, 88.40, 88.40, 50.00)`, [rec.id]);
  await pool.query(
    `INSERT INTO record_parts_lines (record_id, description, quantity, sale_price_each, line_total, is_estimate_line)
     VALUES ($1, 'Unapproved awning motor', 1, 412.77, 412.77, TRUE)`, [rec.id]);
  const { rows: [img] } = await pool.query(
    `INSERT INTO record_photos (record_id, label, photo_data, thumbnail_data) VALUES ($1, 'Front cap', 'x'::bytea, 'y'::bytea) RETURNING id`, [rec.id]);
  const pw = await getPage(String(rec.photo_token));
  truthy('page shows job description', pw.html.includes('Water leak at front cap. Check and reseal.'));
  truthy('page shows labor line by name', pw.html.includes('Diagnose front cap leak'));
  truthy('page hides deleted line', !pw.html.includes('Deleted line text'));
  truthy('page shows parts with qty', pw.html.includes('Dicor lap sealant<span class="q">Qty 3</span>'));
  truthy('qty 1 shows no qty tag', pw.html.includes('Front cap trim</li>'));
  truthy('page hides unapproved finding', !pw.html.includes('Unapproved awning motor'));
  truthy('page hides unapproved labor finding', !pw.html.includes('Reseal roof'));
  truthy('page shows every record photo as a thumbnail', pw.html.includes(`/photos/${img.id}/image?token=${rec.photo_token}&amp;thumb=1`));
  truthy('photo links to the full image', pw.html.includes(`href="https://erp.test/api/public/records/${rec.id}/photos/${img.id}/image?token=${rec.photo_token}"`));
  truthy('details page has no prices or costs', !/(\$|17\.85|53\.55|88\.40|11\.20|297|412\.77)/.test(pw.html.replace(/\$\{/g, '')));
  truthy('work section titled for a work order', pw.html.includes('<h2>Your work order</h2>'));
  await pool.query(`UPDATE records SET status = 'estimate' WHERE id = $1`, [rec.id]);
  const pe = await getPage(String(rec.photo_token));
  truthy('estimate titles it Proposed work', pe.html.includes('<h2>Proposed work</h2>'));
  await pool.query(`UPDATE records SET status = 'in_progress' WHERE id = $1`, [rec.id]);

  const bad = await getPage('not-a-uuid');
  check('garbage token 404', bad.status, 404);
  const miss = await getPage('00000000-0000-0000-0000-000000000000');
  check('unknown token 404', miss.status, 404);

  // Opt-out and no phone.
  await pool.query('UPDATE customers SET sms_opt_out = TRUE WHERE id = $1', [cust.id]);
  const n = sent.length;
  const opted = await svc.sendStatusUpdate(rec.id, { type: 'complete' });
  check('opted-out customer refused', opted.ok, false);
  check('nothing sent to opted-out customer', sent.length, n);
  const { rows: failed } = await pool.query(
    `SELECT delivery_status FROM record_status_updates WHERE record_id = $1 AND update_type = 'complete'`, [rec.id]);
  check('failed attempt is still logged', failed.map(f => f.delivery_status), ['failed']);
  const pg2 = await getPage(String(rec.photo_token));
  truthy('failed text does not appear on customer page', !pg2.html.includes('ready for pickup. Call'));

  await pool.query('UPDATE customers SET sms_opt_out = FALSE, phone_primary = NULL WHERE id = $1', [cust.id]);
  const nophone = await svc.sendStatusUpdate(rec.id, { type: 'complete' });
  check('no phone refused', [nophone.ok, nophone.status], [false, 400]);

  // Automatic Checked In on the first move into active work.
  await pool.query("UPDATE customers SET phone_primary = '(303) 555-0142' WHERE id = $1", [cust.id]);
  const { rows: [rec3] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4803,$1,$2,'estimate') RETURNING id`, [cust.id, unit.id]);
  const before = sent.length;
  check('estimate -> scheduled sends nothing', await svc.autoCheckIn(rec3.id, { from: 'estimate', to: 'scheduled' }), null);
  for (const st of ['order_parts', 'awaiting_parts', 'awaiting_approval', 'on_hold', 'complete', 'payment_pending']) {
    check(`estimate -> ${st} sends nothing`, await svc.autoCheckIn(rec3.id, { from: 'estimate', to: st }), null);
  }
  check('schedule_customer sends nothing', await svc.autoCheckIn(rec3.id, { from: 'approved', to: 'schedule_customer' }), null);
  check('no texts yet', sent.length, before);
  check('estimate -> awaiting_approval sends nothing', await svc.autoCheckIn(rec3.id, { from: 'estimate', to: 'awaiting_approval' }), null);
  check('scheduled -> awaiting_approval sends nothing', await svc.autoCheckIn(rec3.id, { from: 'scheduled', to: 'awaiting_approval' }), null);
  check('still no texts', sent.length, before);
  const first = await svc.autoCheckIn(rec3.id, { from: 'scheduled', to: 'in_progress' });
  check('scheduled -> in_progress sends Checked In', first.sent, true);
  truthy('it is the Checked In wording', sent[sent.length - 1].text.startsWith("Hi Gary, it's Master Tech RV. Your 2019 Grand Design Imagine is checked in on work order #4803."));
  check('moving between active statuses sends nothing', await svc.autoCheckIn(rec3.id, { from: 'in_progress', to: 'awaiting_parts' }), null);
  const again = await svc.autoCheckIn(rec3.id, { from: 'on_hold', to: 'in_progress' });
  check('never twice on one work order', again, { sent: false, reason: 'already_sent' });
  const { rows: [rec4] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4804,$1,$2,'estimate') RETURNING id`, [cust.id, unit.id]);
  const direct = await svc.autoCheckIn(rec4.id, { from: 'estimate', to: 'in_progress' });
  check('estimate straight to in_progress sends', direct.sent, true);
  const { rows: [rec6] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4806,$1,$2,'estimate') RETURNING id`, [cust.id, unit.id]);
  // Oct 22, 2026: Not Started no longer sends Checked In; In Progress does.
  check('estimate -> Not Started sends nothing', await svc.autoCheckIn(rec6.id, { from: 'estimate', to: 'approved' }), null);
  const ns = await svc.autoCheckIn(rec6.id, { from: 'approved', to: 'in_progress' });
  check('Not Started -> In Progress sends Checked In', ns.sent, true);
  await setSetting('status_text_auto_checkin', 'false');
  const { rows: [rec5] } = await pool.query(
    `INSERT INTO records (record_number, customer_id, unit_id, status) VALUES (4805,$1,$2,'estimate') RETURNING id`, [cust.id, unit.id]);
  check('auto switch off stops it', await svc.autoCheckIn(rec5.id, { from: 'estimate', to: 'in_progress' }), { sent: false, reason: 'auto_off' });
  await setSetting('status_text_auto_checkin', 'true');
  await setSetting('status_texts_enabled', 'false');
  check('master switch off stops it', await svc.autoCheckIn(rec5.id, { from: 'estimate', to: 'in_progress' }), { sent: false, reason: 'switched_off' });
  await setSetting('status_texts_enabled', 'true');
  await pool.query('UPDATE customers SET phone_primary = NULL WHERE id = $1', [cust.id]);

  // Expected completion line.
  await pool.query("UPDATE customers SET phone_primary = '(303) 555-0142' WHERE id = $1", [cust.id]);
  check('date format', svc.longCompletionDate('2026-10-03'), 'Saturday, October 3');
  const H = { deadline_type: 'hard' };
  check('flexible date: no line, notes why', [svc.completionInfo({ expected_completion: '2030-10-03' }, '2026-09-28').line, !!svc.completionInfo({ expected_completion: '2030-10-03' }, '2026-09-28').warning], [null, true]);
  check('no date: no line, warns', [svc.completionInfo({ ...H, expected_completion: null }).line, !!svc.completionInfo({ ...H, expected_completion: null }).warning], [null, true]);
  check('past date: no line, warns', [svc.completionInfo({ ...H, expected_completion: '2026-09-01' }, '2026-09-28').line, !!svc.completionInfo({ ...H, expected_completion: '2026-09-01' }, '2026-09-28').warning], [null, true]);
  check('today reads today', svc.completionInfo({ ...H, expected_completion: '2026-09-28' }, '2026-09-28').line, 'Expected completion date: today.');
  check('future date line', svc.completionInfo({ ...H, expected_completion: '2030-10-03' }, '2026-09-28').line, 'Expected completion date: Thursday, October 3.');
  await pool.query("UPDATE records SET expected_completion_date = '2030-10-03', deadline_type = 'flexible' WHERE id = $1", [rec.id]);
  const of = await svc.composeOptions(rec.id);
  truthy('flexible: draft has no date line', !of.types.find(t => t.key === 'work_started').draft.includes('Expected completion'));
  const pgf = await getPage(String(rec.photo_token));
  truthy('status page hides a flexible date', !pgf.html.includes('Expected completion:'));
  await pool.query("UPDATE records SET deadline_type = 'hard', deadline_reason = 'Leaving for Moab' WHERE id = $1", [rec.id]);
  const o2 = await svc.composeOptions(rec.id);
  const d = (k) => o2.types.find(t => t.key === k).draft;
  truthy('work_started draft ends with the date', d('work_started').endsWith('Expected completion date: Thursday, October 3.'));
  truthy('checked_in draft ends with the date', d('checked_in').endsWith('Expected completion date: Thursday, October 3.'));
  truthy('parts_ordered draft ends with the date', d('parts_ordered').endsWith('Expected completion date: Thursday, October 3.'));
  truthy('delayed draft has no date line', !d('delayed').includes('Expected completion'));
  truthy('ready for pickup has no date line', !d('complete').includes('Expected completion'));
  check('no warning when date is good', o2.completion.warning, null);
  const dr = await svc.sendStatusUpdate(rec.id, { type: 'in_bay', dryRun: true });
  truthy('template send: link, then date, then STOP', /\/api\/public\/status\/\S+ Expected completion date: Thursday, October 3\. Reply STOP to opt out\.$/.test(dr.body));
  const dd = await svc.sendStatusUpdate(rec.id, { type: 'delayed', note: 'Awning arm backordered to Oct 10.', dryRun: true });
  truthy('delayed send has no date line', !dd.body.includes('Expected completion'));
  const pgc = await getPage(String(rec.photo_token));
  truthy('status page shows expected completion', pgc.html.includes('Expected completion: <b style="color:#1e3a5f">Thursday, October 3</b>'));
  await pool.query("UPDATE records SET expected_completion_date = '2020-01-01' WHERE id = $1", [rec.id]);
  const o3 = await svc.composeOptions(rec.id);
  truthy('past date: draft has no line and a warning', !o3.types.find(t => t.key === 'work_started').draft.includes('Expected completion') && !!o3.completion.warning);
  const pgp = await getPage(String(rec.photo_token));
  truthy('status page hides a past date', !pgp.html.includes('Expected completion:'));
  await pool.query("UPDATE records SET expected_completion_date = NULL, deadline_type = 'flexible', deadline_reason = NULL WHERE id = $1", [rec.id]);
  await pool.query('UPDATE customers SET phone_primary = NULL WHERE id = $1', [cust.id]);

  // Ready for pickup promises the invoice email and exposes what the modal needs.
  const oi = await svc.composeOptions(rec.id);
  truthy('pickup text says the invoice is being emailed', oi.types.find(t => t.key === 'complete').draft.includes("We're emailing your final invoice now."));
  check('in_progress is not an invoice yet', oi.invoice.is_invoice, false);
  await pool.query("UPDATE records SET status = 'complete' WHERE id = $1", [rec.id]);
  const oc = await svc.composeOptions(rec.id);
  check('complete is an invoice', oc.invoice.is_invoice, true);
  await pool.query("UPDATE records SET status = 'in_progress' WHERE id = $1", [rec.id]);

  // History.
  const hist = await svc.listUpdates(rec.id);
  check('history newest first, all attempts', hist.map(h => h.update_type), ['complete', 'needs_approval', 'needs_approval', 'parts_ordered', 'work_started']);

  console.log(`\n${pass} passed, ${fail} failed`);
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(async (err) => { console.error(err); await pool.end(); process.exit(1); });
