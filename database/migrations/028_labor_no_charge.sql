-- Add no_charge flag to labor lines
ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS no_charge BOOLEAN NOT NULL DEFAULT false;
