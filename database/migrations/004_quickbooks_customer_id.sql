-- ============================================================================
-- Migration 004: Add quickbooks_customer_id to customers table
-- ============================================================================

BEGIN;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS quickbooks_customer_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_customers_qb_id ON customers (quickbooks_customer_id)
    WHERE quickbooks_customer_id IS NOT NULL;

COMMIT;
