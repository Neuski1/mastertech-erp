// End-to-end check of the Business Settings migration and route against a
// REAL Postgres, not a stub. Covers the parts the stubbed harness cannot:
// that the migration is idempotent, that an existing value survives a redeploy,
// that saving writes an audit row, that confirm is actually required, and that
// undo puts the old value back.
//
//   DATABASE_URL=postgres://... node test-settings-db.js

const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Point the app's shared pool at this test database before anything requires it.
const poolPath = require.resolve('./src/db/pool');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: pool };

const { installBusinessSettings } = require('./src/db/installBusinessSettings');
const settings = require('./src/db/settings');
const company = require('./src/db/company');
const { SETTINGS } = require('./src/db/settingsCatalog');

// Drive the route's handlers directly with fake req/res objects. This is the
// real router, with the real validation and the real SQL.
const router = require('./src/routes/settingsAdmin');

const ADMIN = { id: 7, name: 'Carol Neu', email: 'carol@example.com', role: 'admin' };
const STAFF = { id: 8, name: 'Someone Else', email: 'staff@example.com', role: 'service_writer' };

function callRoute(method, url, { body = {}, user = ADMIN, query = {}, params = {} } = {}) {
  return new Promise((resolve) => {
    const layer = router.stack.find(l =>
      l.route && l.route.path === url && l.route.methods[method.toLowerCase()]);
    if (!layer) return resolve({ status: 404, body: { error: `no route ${method} ${url}` } });

    const req = { method: method.toUpperCase(), body, user, query, params, headers: {} };
    let statusCode = 200;
    const res = {
      status(c) { statusCode = c; return this; },
      json(payload) { resolve({ status: statusCode, body: payload }); return this; },
    };

    const handlers = layer.route.stack.map(s => s.handle);
    let i = 0;
    const next = (err) => {
      if (err) return resolve({ status: 500, body: { error: String(err) } });
      const h = handlers[i++];
      if (!h) return resolve({ status: statusCode, body: null });
      try { const r = h(req, res, next); if (r && r.catch) r.catch(e => resolve({ status: 500, body: { error: e.message } })); }
      catch (e) { resolve({ status: 500, body: { error: e.message } }); }
    };
    next();
  });
}

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n         got      ${a}\n         expected ${e}`); }
}
const section = (t) => console.log(`\n${t}`);

(async () => {
try {

// Start from nothing every run, so the harness is repeatable rather than
// passing once and then failing on leftover state.
await pool.query('DROP TABLE IF EXISTS system_settings_audit');
await pool.query('DROP TABLE IF EXISTS system_settings');

section('1. Migration runs on an empty database');
await installBusinessSettings(pool);
{
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM system_settings');
  check('every catalog setting is seeded', rows[0].n, SETTINGS.length);
  const { rows: cols } = await pool.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'system_settings' ORDER BY column_name`);
  const names = cols.map(c => c.column_name);
  check('stamp columns exist',
        ['updated_at', 'updated_by', 'updated_by_name'].every(c => names.includes(c)), true);
  const { rows: audit } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_name = 'system_settings_audit'`);
  check('audit table exists', audit[0].n, 1);
}

section('2. Migration is idempotent and never clobbers a changed value');
{
  await pool.query(
    `UPDATE system_settings SET setting_value = '0.045' WHERE setting_key = 'storage_card_fee_pct'`);
  await installBusinessSettings(pool);   // simulate a redeploy
  await installBusinessSettings(pool);   // and another
  const { rows } = await pool.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = 'storage_card_fee_pct'`);
  check('the owner\'s 4.5% survives two redeploys', rows[0].setting_value, '0.045');
  const { rows: n } = await pool.query('SELECT COUNT(*)::int AS n FROM system_settings');
  check('no duplicate rows', n[0].n, SETTINGS.length);
  // put it back for the rest of the run
  await pool.query(`UPDATE system_settings SET setting_value = '0.035' WHERE setting_key = 'storage_card_fee_pct'`);
  await settings.invalidate();
}

section('3. Non-admins are refused');
{
  const r = await callRoute('get', '/', { user: STAFF });
  check('service_writer cannot read the settings', r.status, 403);
  const w = await callRoute('put', '/', {
    user: STAFF, body: { changes: [{ key: 'storage_card_fee_pct', value: '0.09' }], confirm: true } });
  check('service_writer cannot write them', w.status, 403);
  const { rows } = await pool.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = 'storage_card_fee_pct'`);
  check('and nothing changed', rows[0].setting_value, '0.035');
}

section('4. GET returns the catalog with live values');
{
  const r = await callRoute('get', '/');
  check('status', r.status, 200);
  check('every setting is returned', r.body.settings.length, SETTINGS.length);
  const card = r.body.settings.find(s => s.key === 'storage_card_fee_pct');
  check('card fee value', card.value, '0.035');
  check('card fee carries its effect note', !!card.effect_note, true);
  check('categories are present', r.body.categories.length > 0, true);
}

section('5. Saving without confirm writes nothing');
{
  const r = await callRoute('put', '/', {
    body: { changes: [{ key: 'storage_card_fee_pct', value: '0.04' }] } });   // no confirm
  check('returns 409 asking for confirmation', r.status, 409);
  check('and hands back the diff to show', r.body.diff.length, 1);
  check('old value in the diff', r.body.diff[0].old_value, '0.035');
  check('new value in the diff', r.body.diff[0].new_value, '0.04');
  const { rows } = await pool.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = 'storage_card_fee_pct'`);
  check('the table is untouched', rows[0].setting_value, '0.035');
  const { rows: a } = await pool.query('SELECT COUNT(*)::int AS n FROM system_settings_audit');
  check('no audit row written', a[0].n, 0);
}

section('6. An out-of-range value is refused outright');
{
  const r = await callRoute('put', '/', {
    body: { changes: [{ key: 'storage_card_fee_pct', value: '0.35' }], confirm: true } });
  check('status 400', r.status, 400);
  check('names the field and the reason',
        r.body.errors[0], { key: 'storage_card_fee_pct', label: 'Credit card convenience fee',
                            error: 'cannot be above 10%' });
  const { rows } = await pool.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = 'storage_card_fee_pct'`);
  check('still 3.5%', rows[0].setting_value, '0.035');
}

section('7. A confirmed save writes the value, the audit row and the stamp');
{
  const r = await callRoute('put', '/', {
    body: { changes: [
      { key: 'storage_card_fee_pct', value: '0.04' },
      { key: 'zelle_email', value: 'billing@mastertechrvrepair.com' },
    ], confirm: true } });
  check('status 200', r.status, 200);
  check('two changes saved', r.body.saved, 2);

  const { rows } = await pool.query(
    `SELECT setting_key, setting_value, updated_by_name FROM system_settings
      WHERE setting_key IN ('storage_card_fee_pct','zelle_email') ORDER BY setting_key`);
  check('card fee written', rows[0].setting_value, '0.04');
  check('stamped with who changed it', rows[0].updated_by_name, 'Carol Neu');
  check('zelle written', rows[1].setting_value, 'billing@mastertechrvrepair.com');

  const { rows: a } = await pool.query(
    `SELECT setting_key, old_value, new_value, changed_by_name, source
       FROM system_settings_audit ORDER BY setting_key`);
  check('two audit rows', a.length, 2);
  check('audit records the old value', a[0].old_value, '0.035');
  check('audit records the new value', a[0].new_value, '0.04');
  check('audit records who', a[0].changed_by_name, 'Carol Neu');
  check('audit source is an edit', a[0].source, 'edit');
}

section('8. The running code sees the new values immediately');
{
  await settings.invalidate();
  check('fee engine now reads 4%', settings.num('storage_card_fee_pct', 0.035), 0.04);
  check('$598 rent now carries a $23.92 fee',
        Math.round(598 * settings.num('storage_card_fee_pct', 0.035) * 100) / 100, 23.92);
  check('invoice wording follows the setting', company.zelleEmail(), 'billing@mastertechrvrepair.com');
}

section('9. Saving the same value again is a no-op');
{
  const r = await callRoute('put', '/', {
    body: { changes: [{ key: 'storage_card_fee_pct', value: '0.04' }], confirm: true } });
  check('reports nothing changed', r.body.saved, 0);
  const { rows: a } = await pool.query('SELECT COUNT(*)::int AS n FROM system_settings_audit');
  check('no extra audit row', a[0].n, 2);
}

section('10. Undo puts the old value back and is itself recorded');
{
  const list = await callRoute('get', '/audit');
  const cardEntry = list.body.find(e => e.setting_key === 'storage_card_fee_pct');
  check('the latest change is offered for undo', cardEntry.can_revert, true);

  const r = await callRoute('post', '/audit/:id/revert', { params: { id: String(cardEntry.id) } });
  check('undo succeeds', r.status, 200);
  check('restored to 3.5%', r.body.restored_to, '0.035');

  const { rows } = await pool.query(
    `SELECT setting_value FROM system_settings WHERE setting_key = 'storage_card_fee_pct'`);
  check('the table is back to 3.5%', rows[0].setting_value, '0.035');

  await settings.invalidate();
  check('and so is the fee engine', settings.num('storage_card_fee_pct', 0.035), 0.035);

  const { rows: a } = await pool.query(
    `SELECT source FROM system_settings_audit ORDER BY id DESC LIMIT 1`);
  check('the undo is recorded as its own entry, history is not erased', a[0].source, 'revert');

  const again = await callRoute('post', '/audit/:id/revert', { params: { id: String(cardEntry.id) } });
  check('the same entry cannot be undone twice', again.status, 400);
}

section('11. An undo is refused once a newer change exists');
{
  await callRoute('put', '/', {
    body: { changes: [{ key: 'storage_late_fee', value: '30' }], confirm: true } });
  const first = (await callRoute('get', '/audit')).body.find(e => e.setting_key === 'storage_late_fee');
  await callRoute('put', '/', {
    body: { changes: [{ key: 'storage_late_fee', value: '35' }], confirm: true } });

  const r = await callRoute('post', '/audit/:id/revert', { params: { id: String(first.id) } });
  check('undoing the older change is blocked', r.status, 409);
  check('with an explanation that says what to do',
        /most recent change first/i.test(r.body.error), true);

  const list = (await callRoute('get', '/audit')).body.filter(e => e.setting_key === 'storage_late_fee');
  check('only the newest entry offers undo',
        list.map(e => e.can_revert), [true, false]);
}

section('12. A boolean and a paragraph round-trip');
{
  await callRoute('put', '/', {
    body: { changes: [
      { key: 'payment_reminders_enabled', value: false },
      { key: 'storage_late_fee_schedule', value: 'After 7 days late — $40 late fee\nAfter 20 days late — $20/day' },
    ], confirm: true } });
  await settings.invalidate();
  check('reminders switched off', settings.bool('payment_reminders_enabled', true), false);
  const lines = settings.str('storage_late_fee_schedule', '').split('\n').filter(Boolean);
  check('the multi-line schedule survives', lines.length, 2);
  check('first step', lines[0], 'After 7 days late — $40 late fee');
}

section('13. The unknown-key guard');
{
  const r = await callRoute('put', '/', {
    body: { changes: [{ key: 'DROP TABLE records', value: 'x' }], confirm: true } });
  check('an invented key is refused', r.status, 400);
  check('by name', r.body.errors[0].error, 'not a known setting');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

} catch (err) {
  console.error('\nHARNESS ERROR:', err);
  process.exit(1);
}
})();
