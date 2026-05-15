-- 043: Add estimate line support for inspection-based work orders
-- Allows labor and parts lines to be flagged as estimate items that
-- require customer approval before being included in totals.

-- Labor lines
ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ;

-- Parts lines
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ;

-- Token table for email-based line-level approval
CREATE TABLE IF NOT EXISTS estimate_line_approvals (
  id SERIAL PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id),
  approval_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ela_token ON estimate_line_approvals(approval_token);
CREATE INDEX IF NOT EXISTS idx_ela_record ON estimate_line_approvals(record_id);
