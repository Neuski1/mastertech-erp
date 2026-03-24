-- Migration 015: Allow labor lines without technician assigned (for auto-created lines from job description)
-- Also allow hours = 0 explicitly (column is NOT NULL NUMERIC, 0 is already valid)

ALTER TABLE record_labor_lines ALTER COLUMN technician_id DROP NOT NULL;
