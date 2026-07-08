// server/src/routes/plaid.js
// Plaid integration for expense capture module.
// Endpoints: link-token, exchange-token, sync, webhook, items, accounts.
//
// Env vars (Railway):
//   PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV (default: production)
//   PLAID_WEBHOOK_URL (optional, set after first deploy)

const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');
const pool = require('../db/pool');

const router = express.Router();

// ---------------------------------------------------------------------------
// Plaid client
// ---------------------------------------------------------------------------
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'production'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

// ---------------------------------------------------------------------------
// POST /api/plaid/link-token
// Returns a short-lived link_token used by the frontend Plaid Link UI.
// ---------------------------------------------------------------------------
router.post('/link-token', async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId || 'mastertech-owner';
    const redirectUri = req.body?.redirect_uri || process.env.PLAID_REDIRECT_URI;
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: String(userId) },
      client_name: 'Master Tech ERP',
      products: [Products.Transactions, Products.Liabilities],
      country_codes: [CountryCode.Us],
      language: 'en',
      redirect_uri: redirectUri || undefined,
      webhook: process.env.PLAID_WEBHOOK_URL || undefined,
    });
    res.json({ link_token: response.data.link_token, expiration: response.data.expiration });
  } catch (err) {
    console.error('Plaid link-token error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/plaid/exchange-token
// Body: { public_token, institution_name }
// ---------------------------------------------------------------------------
router.post('/exchange-token', async (req, res) => {
  const client = await pool.connect();
  try {
    const { public_token, institution_name } = req.body;
    if (!public_token) return res.status(400).json({ error: 'public_token required' });

    const exchange = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchange.data.access_token;
    const itemId = exchange.data.item_id;

    const accountsResp = await plaidClient.accountsGet({ access_token: accessToken });
    const plaidAccounts = accountsResp.data.accounts;
    const inst = accountsResp.data.item.institution_id;

    await client.query('BEGIN');

    const itemRow = await client.query(
      `INSERT INTO plaid_items (plaid_item_id, access_token, institution_name, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (plaid_item_id) DO UPDATE
         SET access_token = EXCLUDED.access_token, status = 'active'
       RETURNING id`,
      [itemId, accessToken, institution_name || inst || 'Unknown']
    );
    const dbItemId = itemRow.rows[0].id;

    for (const a of plaidAccounts) {
      await client.query(
        `INSERT INTO plaid_accounts
           (plaid_item_id, plaid_account_id, nickname, account_type, account_subtype, mask, current_balance, available_balance, last_balance_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT (plaid_account_id) DO UPDATE
           SET current_balance = EXCLUDED.current_balance,
               available_balance = EXCLUDED.available_balance,
               last_balance_at = NOW()`,
        [dbItemId, a.account_id, a.name || a.official_name, a.type, a.subtype, a.mask,
         a.balances?.current, a.balances?.available]
      );
    }

    await client.query('COMMIT');
    res.json({ item_id: dbItemId, accounts: plaidAccounts.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Plaid exchange-token error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/plaid/sync[/:itemId]  - cursor-based transaction sync
// ---------------------------------------------------------------------------
router.post(['/sync', '/sync/:itemId'], async (req, res) => {
  const client = await pool.connect();
  try {
    const items = req.params.itemId
      ? await client.query(`SELECT id, plaid_item_id, access_token, cursor FROM plaid_items WHERE id = $1 AND status = 'active'`, [req.params.itemId])
      : await client.query(`SELECT id, plaid_item_id, access_token, cursor FROM plaid_items WHERE status = 'active'`);

    const results = [];
    for (const item of items.rows) {
      let cursor = item.cursor;
      let hasMore = true;
      let added = 0, modified = 0, removed = 0;

      while (hasMore) {
        const resp = await plaidClient.transactionsSync({
          access_token: item.access_token,
          cursor: cursor || undefined,
          count: 500,
        });
        for (const t of resp.data.added) { await upsertTransaction(client, t); added++; }
        for (const t of resp.data.modified) { await upsertTransaction(client, t); modified++; }
        for (const t of resp.data.removed) {
          await client.query(
            `UPDATE transactions SET status = 'excluded', notes = COALESCE(notes,'') || ' [removed by Plaid]'
             WHERE raw_transaction_id IN (SELECT id FROM raw_transactions WHERE plaid_transaction_id = $1)`,
            [t.transaction_id]
          );
          removed++;
        }
        cursor = resp.data.next_cursor;
        hasMore = resp.data.has_more;
      }

      await client.query(`UPDATE plaid_items SET cursor = $1, last_synced_at = NOW() WHERE id = $2`, [cursor, item.id]);
      results.push({ item_id: item.id, added, modified, removed });
    }
    res.json({ synced: results });
  } catch (err) {
    console.error('Plaid sync error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  } finally {
    client.release();
  }
});

async function upsertTransaction(client, txn) {
  const acct = await client.query(`SELECT id FROM plaid_accounts WHERE plaid_account_id = $1`, [txn.account_id]);
  if (acct.rows.length === 0) return;
  const plaidAccountDbId = acct.rows[0].id;

  const rawRow = await client.query(
    `INSERT INTO raw_transactions (plaid_transaction_id, plaid_account_id, payload)
     VALUES ($1, $2, $3)
     ON CONFLICT (plaid_transaction_id) DO UPDATE SET payload = EXCLUDED.payload
     RETURNING id`,
    [txn.transaction_id, plaidAccountDbId, JSON.stringify(txn)]
  );
  const rawId = rawRow.rows[0].id;
  const category = await categorize(client, txn);

  // Transfer guard: Square payout deposits move cash already counted as storage
  // income in the ledger. Flag them as transfers so they reconcile the bank
  // balance without being re-counted as revenue (Revenue Summary excludes
  // is_transfer rows).
  const isTransfer = /\bsquare\b/i.test(`${txn.merchant_name || ''} ${txn.name || ''}`);

  // Pending -> posted merge. When a pending transaction posts, Plaid assigns a
  // NEW transaction_id and points back to the old one via pending_transaction_id.
  // Retire the superseded pending row so it is not double-counted, carrying
  // forward any manual categorization / review the bookkeeper applied to it.
  let glId = category.gl_id;
  let catSource = category.source;
  let transfer = isTransfer;
  if (txn.pending_transaction_id) {
    const prior = await client.query(
      `SELECT t.id, t.category_gl_id, t.categorization_source, t.is_transfer
         FROM transactions t
         JOIN raw_transactions r ON r.id = t.raw_transaction_id
        WHERE r.plaid_transaction_id = $1
        ORDER BY t.id DESC
        LIMIT 1`,
      [txn.pending_transaction_id]
    );
    if (prior.rows.length) {
      const prev = prior.rows[0];
      const manual = prev.category_gl_id
        && !String(prev.categorization_source || '').startsWith('rule')
        && prev.categorization_source !== 'unmatched';
      if (manual) { glId = prev.category_gl_id; catSource = prev.categorization_source; }
      if (prev.is_transfer) transfer = true;
      await client.query(
        `UPDATE transactions
            SET status = 'excluded',
                notes = COALESCE(notes, '') || ' [superseded by posted txn ' || $2 || ']'
          WHERE id = $1 AND status <> 'excluded'`,
        [prev.id, txn.transaction_id]
      );
    }
  }

  // Idempotent upsert keyed on raw_transaction_id (unique). Re-syncing a
  // transaction refreshes only the bank-truth fields; it never clobbers a
  // categorization or review a human already made.
  await client.query(
    `INSERT INTO transactions
       (raw_transaction_id, plaid_account_id, txn_date, posted_date, amount,
        merchant_name, description, category_gl_id, categorization_source, status, is_transfer)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)
     ON CONFLICT (raw_transaction_id) DO UPDATE
       SET txn_date = EXCLUDED.txn_date,
           posted_date = EXCLUDED.posted_date,
           amount = EXCLUDED.amount,
           merchant_name = EXCLUDED.merchant_name,
           description = EXCLUDED.description,
           updated_at = NOW()`,
    [rawId, plaidAccountDbId, txn.date, txn.authorized_date, txn.amount,
     txn.merchant_name || txn.name, txn.name, glId, catSource, transfer]
  );
}

async function categorize(client, txn) {
  const merchant = (txn.merchant_name || '').trim();
  const description = (txn.name || '').trim();
  const combined = `${merchant} ${description}`.trim();

  const rules = await client.query(
    `SELECT id, match_type, match_field, match_pattern, gl_account_id
       FROM categorization_rules
      WHERE is_active = TRUE
      ORDER BY priority ASC, id ASC`
  );

  for (const rule of rules.rows) {
    const field =
      rule.match_field === 'merchant_name' ? merchant :
      rule.match_field === 'description' ? description : combined;
    const f = field.toUpperCase();
    const p = String(rule.match_pattern).toUpperCase();
    let match = false;
    if (rule.match_type === 'exact') match = f === p;
    else if (rule.match_type === 'contains') match = f.includes(p);
    else if (rule.match_type === 'starts_with') match = f.startsWith(p);
    else if (rule.match_type === 'regex') {
      try { match = new RegExp(rule.match_pattern, 'i').test(field); } catch (_) {}
    }
    if (match && rule.gl_account_id) {
      await client.query(`UPDATE categorization_rules SET hit_count = hit_count + 1 WHERE id = $1`, [rule.id]);
      return { gl_id: rule.gl_account_id, source: `rule:${rule.id}` };
    }
  }
  return { gl_id: null, source: 'unmatched' };
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/plaid/items - list connected institutions
// ---------------------------------------------------------------------------
router.get('/items', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.id, i.institution_name, i.status, i.last_synced_at,
             COUNT(a.id) AS account_count
        FROM plaid_items i
        LEFT JOIN plaid_accounts a ON a.plaid_item_id = i.id
       GROUP BY i.id
       ORDER BY i.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/plaid/accounts - list every linked bank/card account with GL mapping
// ---------------------------------------------------------------------------
router.get('/accounts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.nickname, a.account_type, a.account_subtype, a.mask,
             a.current_balance, a.last_balance_at,
             i.institution_name,
             g.account_number AS gl_account_number, g.name AS gl_account_name
        FROM plaid_accounts a
        JOIN plaid_items i ON i.id = a.plaid_item_id
        LEFT JOIN accounts g ON g.id = a.gl_account_id
       WHERE a.is_active = TRUE
       ORDER BY i.institution_name, a.nickname`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/plaid/accounts/:id/gl-mapping
// Body: { gl_account_number }
// ---------------------------------------------------------------------------
router.put('/accounts/:id/gl-mapping', async (req, res) => {
  try {
    const { gl_account_number } = req.body;
    if (!gl_account_number) return res.status(400).json({ error: 'gl_account_number required' });
    const gl = await pool.query(`SELECT id FROM accounts WHERE account_number = $1`, [gl_account_number]);
    if (gl.rows.length === 0) return res.status(404).json({ error: 'GL account not found' });
    await pool.query(`UPDATE plaid_accounts SET gl_account_id = $1 WHERE id = $2`,
      [gl.rows[0].id, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// GET /api/plaid/gl-accounts - list chart of accounts for mapping UI
// ---------------------------------------------------------------------------
router.get('/gl-accounts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT account_number, name, statement, account_type, normal_balance
        FROM accounts
       WHERE is_active = TRUE
       ORDER BY account_number`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
