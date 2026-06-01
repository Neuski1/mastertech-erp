-- ============================================================================
-- 045 — Storage ledger cutover
--
-- Posts storage income into the `transactions` GL ledger (account 4000), one
-- row per storage_charges row (per box per month), so storage income is
-- counted exactly once. The Revenue Summary is switched to read storage income
-- from the ledger (see server/src/routes/reports.js).
--
-- Idempotent: safe to run more than once. Backfill uses a UNIQUE idempotency
-- key (transactions.storage_charge_id) so re-runs cannot double-insert.
-- ============================================================================

-- --- Schema: make the transactions ledger able to hold manual storage rows ---

-- Storage rows are not Plaid imports, so these must be nullable.
ALTER TABLE transactions ALTER COLUMN raw_transaction_id DROP NOT NULL;
ALTER TABLE transactions ALTER COLUMN plaid_account_id   DROP NOT NULL;

-- Transfer flag: cash movements (e.g. Square payout deposits) are flagged so
-- they reconcile the bank without being re-counted as income.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_transfer BOOLEAN NOT NULL DEFAULT FALSE;

-- Idempotency key linking a ledger row to its source storage charge.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS storage_charge_id INTEGER;

-- One ledger row per storage charge (partial: Plaid rows keep NULL here).
CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_storage_charge
  ON transactions (storage_charge_id)
  WHERE storage_charge_id IS NOT NULL;

-- Keep the ledger in sync when a storage charge is deleted.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_storage_charge'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT fk_transactions_storage_charge
      FOREIGN KEY (storage_charge_id) REFERENCES storage_charges (id) ON DELETE CASCADE;
  END IF;
END $$;

-- --- Pre-flight: storage-income GL account 4000 must exist -------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '4000') THEN
    RAISE EXCEPTION 'Storage GL account 4000 not found in accounts table — create it before running this migration';
  END IF;
END $$;

-- --- Backfill: one ledger row per existing storage charge --------------------
-- ON CONFLICT on the idempotency key makes re-runs a no-op.
INSERT INTO transactions
  (raw_transaction_id, plaid_account_id, txn_date, posted_date, amount,
   merchant_name, description, category_gl_id, categorization_source,
   status, is_transfer, storage_charge_id)
SELECT
  NULL, NULL, sc.charge_date, sc.charge_date, sc.amount,
  'Storage',
  COALESCE(NULLIF(btrim(sc.notes), ''), 'Storage charge ' || sc.charge_month),
  (SELECT id FROM accounts WHERE account_number = '4000'),
  'storage', 'cleared', FALSE, sc.id
FROM storage_charges sc
ON CONFLICT (storage_charge_id) WHERE storage_charge_id IS NOT NULL DO NOTHING;
