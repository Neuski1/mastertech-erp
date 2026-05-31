-- ============================================================================
-- Storage → Bookkeeping discovery (READ-ONLY — inserts/updates nothing)
-- Run against production:
--     psql "$PRODUCTION_DATABASE_URL" -f scripts/storage_bookkeeping_discovery.sql
-- Paste the output back so we can confirm before coding the transactions insert.
-- ============================================================================

\echo '===== FINDING 1: storage-income GL account ====='

-- 1a. Likely storage-income account(s) by name.
SELECT account_number, name, statement, account_type, normal_balance, is_active
  FROM accounts
 WHERE lower(name) LIKE '%storage%'
    OR lower(name) LIKE '%rent%'
 ORDER BY account_number;

-- 1b. Full income/revenue side of the chart of accounts, to pick the right one
--     if 1a is ambiguous or empty.
SELECT account_number, name, statement, account_type, normal_balance, is_active
  FROM accounts
 WHERE account_type ILIKE '%income%'
    OR account_type ILIKE '%revenue%'
    OR statement   ILIKE '%income%'
 ORDER BY account_number;


\echo '===== FINDING 2: can transactions hold manual / non-Plaid rows? ====='

-- 2a. Column nullability + defaults. We care whether raw_transaction_id and
--     plaid_account_id are NOT NULL (if so, a manual storage row can't be inserted
--     without a Plaid parent and a schema change is required).
SELECT ordinal_position, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_name = 'transactions'
 ORDER BY ordinal_position;

-- 2b. All constraints on transactions (NOT NULL shows above; this catches CHECKs,
--     FKs, UNIQUEs — e.g. any CHECK restricting categorization_source / status).
SELECT con.conname, con.contype, pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
 WHERE rel.relname = 'transactions'
 ORDER BY con.contype, con.conname;

-- 2c. Existing categorization_source / status values actually in use — tells us
--     what a "manual" entry should look like to match conventions.
SELECT categorization_source, status, COUNT(*) AS n
  FROM transactions
 GROUP BY categorization_source, status
 ORDER BY n DESC;


\echo '===== FINDING 3: is storage/Square income ALREADY in the books? (no-double-count) ====='

-- 3a. Are any transactions already categorized to the storage-income account?
--     (category_gl_id references accounts.id.)  If yes, Plaid bank deposits are
--     already booking storage income and a manual row would double-count.
SELECT a.account_number, a.name,
       t.categorization_source, t.status,
       COUNT(*) AS n, SUM(t.amount) AS total,
       MIN(t.txn_date) AS first_txn, MAX(t.txn_date) AS last_txn
  FROM transactions t
  JOIN accounts a ON a.id = t.category_gl_id
 WHERE lower(a.name) LIKE '%storage%' OR lower(a.name) LIKE '%rent%'
 GROUP BY a.account_number, a.name, t.categorization_source, t.status
 ORDER BY a.account_number;

-- 3b. Any transactions whose text mentions Square or storage, regardless of how
--     they were categorized (catches Square payout deposits landing in the bank).
SELECT categorization_source, status,
       COUNT(*) AS n, SUM(amount) AS total,
       MIN(txn_date) AS first_txn, MAX(txn_date) AS last_txn
  FROM transactions
 WHERE merchant_name ILIKE '%square%' OR description ILIKE '%square%'
    OR merchant_name ILIKE '%storage%' OR description ILIKE '%storage%'
 GROUP BY categorization_source, status
 ORDER BY n DESC;

-- 3c. For context: monthly storage revenue ALREADY reported via storage_charges
--     (this is what reports.js Revenue Summary sums today — a separate report,
--     not the transactions ledger).  Helps size the double-count risk.
SELECT charge_month, COUNT(*) AS charges, SUM(amount) AS total
  FROM storage_charges
 GROUP BY charge_month
 ORDER BY charge_month;
