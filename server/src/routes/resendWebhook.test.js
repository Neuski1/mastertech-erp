// Stub harness for the Resend webhook. No database, no network.
// Run: node server/src/routes/resendWebhook.test.js
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

// Fake pool: records every query, answers the few shapes the route uses.
const state = { queries: [], svixSeen: new Set(), customers: { 'bad@x.com': [101], 'mad@x.com': [102] } };
const fakeClient = {
  async query(sql, params = []) {
    state.queries.push({ sql, params });
    if (/INSERT INTO email_events/.test(sql)) {
      if (state.svixSeen.has(params[0])) return { rows: [] };
      state.svixSeen.add(params[0]);
      return { rows: [{ id: state.svixSeen.size }] };
    }
    if (/UPDATE customers/.test(sql)) return { rows: (state.customers[params[0]] || []).map(id => ({ id })) };
    return { rows: [] };
  },
  release() {},
};
require.cache[path.resolve(__dirname, '../db/pool.js')] = {
  id: 'pool', filename: 'pool', loaded: true,
  exports: { connect: async () => fakeClient, query: fakeClient.query },
};

const express = require('express');
const SECRET = 'whsec_' + Buffer.from('test-secret-bytes-1234567890').toString('base64');
process.env.RESEND_WEBHOOK_SECRET = SECRET;

const app = express();
app.use('/api/resend/webhook', express.raw({ type: '*/*', limit: '1mb' }), require('./resendWebhook'));
app.use(express.json());

function sign(id, ts, body, secret = SECRET) {
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  return 'v1,' + crypto.createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
}

async function post(port, bodyObj, { id = 'msg_' + Math.random(), ts = Math.floor(Date.now() / 1000), sig, secret } = {}) {
  const body = JSON.stringify(bodyObj);
  const headers = { 'content-type': 'application/json', 'svix-id': id, 'svix-timestamp': String(ts) };
  headers['svix-signature'] = sig !== undefined ? sig : sign(id, ts, body, secret);
  const r = await fetch(`http://127.0.0.1:${port}/api/resend/webhook`, { method: 'POST', headers, body });
  return { status: r.status, json: await r.json() };
}

const bounce = (to, type = 'Permanent') => ({ type: 'email.bounced', data: { email_id: 'e1', to: [to], subject: 'Free roof inspection', bounce: { type, message: 'mailbox does not exist' } } });

(async () => {
  const server = app.listen(0);
  const port = server.address().port;
  let pass = 0;
  const t = async (name, fn) => { await fn(); pass++; console.log('ok  ', name); };
  try {
    await t('no signature header -> 401', async () => {
      const r = await post(port, bounce('bad@x.com'), { sig: '' });
      assert.strictEqual(r.status, 401);
    });
    await t('wrong secret -> 401, nothing written', async () => {
      const before = state.queries.length;
      const r = await post(port, bounce('bad@x.com'), { secret: 'whsec_' + Buffer.from('other').toString('base64') });
      assert.strictEqual(r.status, 401);
      assert.strictEqual(state.queries.length, before);
    });
    await t('stale timestamp -> 401', async () => {
      const r = await post(port, bounce('bad@x.com'), { ts: Math.floor(Date.now() / 1000) - 3600 });
      assert.strictEqual(r.status, 401);
    });
    await t('permanent bounce flags the customer', async () => {
      const r = await post(port, bounce('Bad@X.com'), { id: 'msg_perm' });
      assert.strictEqual(r.status, 200);
      assert.deepStrictEqual(r.json.outcome, [{ email: 'bad@x.com', action: 'flagged_invalid', customer_ids: [101] }]);
      assert(state.queries.some(q => /email_invalid = TRUE/.test(q.sql)));
      assert(state.queries.some(q => /communication_log/.test(q.sql) && q.params[1] === 'email_bounce'));
    });
    await t('retry of same svix-id is a no-op', async () => {
      const before = state.queries.filter(q => /UPDATE customers/.test(q.sql)).length;
      const r = await post(port, bounce('bad@x.com'), { id: 'msg_perm' });
      assert.strictEqual(r.json.duplicate, true);
      assert.strictEqual(state.queries.filter(q => /UPDATE customers/.test(q.sql)).length, before);
    });
    await t('transient bounce does not flag', async () => {
      const before = state.queries.filter(q => /UPDATE customers/.test(q.sql)).length;
      const r = await post(port, bounce('bad@x.com', 'Transient'));
      assert.strictEqual(r.json.outcome[0].action, 'transient_logged');
      assert.strictEqual(state.queries.filter(q => /UPDATE customers/.test(q.sql)).length, before);
    });
    await t('"Name <addr>" recipient is parsed', async () => {
      const r = await post(port, bounce('Dale W <bad@x.com>'));
      assert.strictEqual(r.json.outcome[0].email, 'bad@x.com');
    });
    await t('complaint opts out and unsubscribes, does not mark invalid', async () => {
      const mark = state.queries.length;
      const r = await post(port, { type: 'email.complained', data: { to: ['mad@x.com'], subject: 'Promo' } });
      assert.strictEqual(r.json.outcome[0].action, 'opted_out');
      const qs = state.queries.slice(mark).map(q => q.sql).join('\n');
      assert(/email_unsubscribes/.test(qs));
      assert(/marketing_opt_out = TRUE/.test(qs));
      assert(!/email_invalid = TRUE/.test(qs));
    });
    await t('bounce with no matching customer is recorded, not an error', async () => {
      const r = await post(port, bounce('stranger@x.com'));
      assert.strictEqual(r.status, 200);
      assert.strictEqual(r.json.outcome[0].action, 'no_customer_match');
    });
    await t('other event types are ignored', async () => {
      const r = await post(port, { type: 'email.delivered', data: { to: ['bad@x.com'] } });
      assert.strictEqual(r.json.outcome[0].action, 'ignored');
    });
    await t('missing secret -> 503', async () => {
      delete process.env.RESEND_WEBHOOK_SECRET;
      const r = await post(port, bounce('bad@x.com'));
      assert.strictEqual(r.status, 503);
      process.env.RESEND_WEBHOOK_SECRET = SECRET;
    });
    console.log(`\n${pass} of 11 pass`);
  } catch (e) {
    console.error('FAIL', e);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
