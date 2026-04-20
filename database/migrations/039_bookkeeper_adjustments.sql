-- Bookkeeper adjustments — manual reconciliation line items for the Revenue Summary report.
-- Allows an admin to record a signed adjustment for a period so the report's Adjusted Total
-- matches the bookkeeper's verified figure.
CREATE TABLE IF NOT EXISTS bookkeeper_adjustments (
    id                SERIAL PRIMARY KEY,
    period_label      VARCHAR(100) NOT NULL,
    period_start      DATE NOT NULL,
    period_end        DATE NOT NULL,
    adjustment_amount NUMERIC(12,2) NOT NULL,
    note              TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookkeeper_adjustments_period_idx
    ON bookkeeper_adjustments (period_start, period_end);
