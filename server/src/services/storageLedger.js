/**
 * Storage → GL ledger bridge.
 *
 * Storage income is recorded in `storage_charges` (one row per box per month).
 * To count that income exactly ONCE in the books, every storage_charges row is
 * mirrored as a single `transactions` ledger row posted to the storage-income
 * GL account (4000). The Revenue Summary then reads storage income from the
 * ledger, NOT from storage_charges (see server/src/routes/reports.js).
 *
 * The mirror row is keyed by `transactions.storage_charge_id` (UNIQUE), so
 * re-running a sync or backfill can never double-insert.
 */

// GL account that storage income posts to. category_gl_id is a FK to
// accounts.id, so we resolve this account_number to its id at runtime.
const STORAGE_GL_ACCOUNT_NUMBER = '4000';

// Marker on the ledger row so storage income is easy to identify and is clearly
// not a Plaid-imported bank transaction.
const STORAGE_CATEGORIZATION_SOURCE = 'storage';

// Storage rows are pre-categorized to account 4000, so they are already
// "done" and must NOT land in the bank-feed review queue (which holds
// freshly imported, still-'pending' Plaid transactions).
const STORAGE_TXN_STATUS = 'cleared';

/**
 * Resolve the storage-income GL account id. Throws (loudly) if account 4000 is
 * missing so we never silently mis-book income to a NULL/wrong account.
 * @param {import('pg').PoolClient} client
 * @returns {Promise<number>}
 */
async function getStorageGlAccountId(client) {
  const { rows } = await client.query(
    'SELECT id FROM accounts WHERE account_number = $1',
    [STORAGE_GL_ACCOUNT_NUMBER]
  );
  if (rows.length === 0) {
    throw new Error(
      `Storage GL account ${STORAGE_GL_ACCOUNT_NUMBER} not found in accounts table. ` +
      'Create it (income/revenue) before posting storage income to the ledger.'
    );
  }
  return rows[0].id;
}

/**
 * Insert or update the single ledger row mirroring one storage charge.
 * Idempotent via the UNIQUE (storage_charge_id) index. MUST be called with a
 * client that is already inside a transaction so it commits/rolls back together
 * with the storage_charges write.
 * @param {import('pg').PoolClient} client
 * @param {number} chargeId  storage_charges.id
 */
async function syncChargeToLedger(client, chargeId) {
  const glId = await getStorageGlAccountId(client);

  const { rows } = await client.query(
    'SELECT id, amount, charge_date, charge_month, notes FROM storage_charges WHERE id = $1',
    [chargeId]
  );
  if (rows.length === 0) return; // charge vanished (e.g. rolled back) — nothing to mirror
  const sc = rows[0];

  const description = sc.notes && sc.notes.trim()
    ? sc.notes.trim()
    : `Storage charge ${sc.charge_month}`;

  // Income is stored as a positive amount, matching SUM(storage_charges.amount).
  // raw_transaction_id / plaid_account_id are NULL (this is not a bank import);
  // is_transfer is FALSE so it counts as real income in the Revenue Summary.
  await client.query(
    `INSERT INTO transactions
       (raw_transaction_id, plaid_account_id, txn_date, posted_date, amount,
        merchant_name, description, category_gl_id, categorization_source,
        status, is_transfer, storage_charge_id)
     VALUES (NULL, NULL, $1, $1, $2, 'Storage', $3, $4, $5, $6, FALSE, $7)
     ON CONFLICT (storage_charge_id) WHERE storage_charge_id IS NOT NULL
     DO UPDATE SET
       amount        = EXCLUDED.amount,
       txn_date      = EXCLUDED.txn_date,
       posted_date   = EXCLUDED.posted_date,
       description   = EXCLUDED.description,
       category_gl_id = EXCLUDED.category_gl_id`,
    [sc.charge_date, sc.amount, description, glId,
     STORAGE_CATEGORIZATION_SOURCE, STORAGE_TXN_STATUS, sc.id]
  );
}

module.exports = {
  STORAGE_GL_ACCOUNT_NUMBER,
  STORAGE_CATEGORIZATION_SOURCE,
  STORAGE_TXN_STATUS,
  getStorageGlAccountId,
  syncChargeToLedger,
};
