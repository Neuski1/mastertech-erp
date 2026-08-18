-- Add no_charge flag to parts lines (mirrors 028_labor_no_charge.sql)
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS no_charge BOOLEAN NOT NULL DEFAULT false;
