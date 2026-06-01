-- ============================================================================
-- Migration 044: Storage monthly payment grid
--
-- Adds the data needed to show a 12-month Paid/Unpaid/Partial grid per storage
-- box, auto-populated from Square invoices, with manual overrides.
--
-- Square is the single source of truth for paid/unpaid. Grid precedence is:
--   manual override > Square status > unpaid.
--
-- NOTE ON THE KEY: the discovery step found there is no "storage_customers"
-- table. A storage "customer box" in the UI corresponds to one active
-- storage_billing row (one customer + one space + one Square subscription).
-- A single customer can rent multiple spaces, each its own subscription/rate,
-- so the correct grain for the grid is storage_billing_id (NOT customer_id).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Persisted per-month status (square cache + manual overrides).
-- One row per (storage_billing_id, year, month). The "source" column says
-- where the persisted status came from. Manual overrides are protected from
-- being clobbered by a Square sync (enforced in the route's upsert).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_payment_status (
    id                  SERIAL PRIMARY KEY,
    storage_billing_id  INT             NOT NULL REFERENCES storage_billing(id),
    year                INT             NOT NULL,
    month               INT             NOT NULL CHECK (month BETWEEN 1 AND 12),
    status              VARCHAR(10)     NOT NULL CHECK (status IN ('paid', 'unpaid', 'partial')),
    source              VARCHAR(10)     NOT NULL CHECK (source IN ('square', 'manual')),
    square_invoice_id   VARCHAR(200),
    amount              DECIMAL(10,2),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (storage_billing_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_sps_billing ON storage_payment_status (storage_billing_id);

CREATE TRIGGER trg_sps_updated_at
    BEFORE UPDATE ON storage_payment_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

