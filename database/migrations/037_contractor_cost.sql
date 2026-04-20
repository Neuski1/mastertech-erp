-- Migration 037: Contractor cost tracking

-- Add contractor cost to labor lines
ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS contractor_cost DECIMAL(10,2);

-- Add contractor flag to technicians
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS is_contractor BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark employees
UPDATE technicians SET is_contractor = FALSE WHERE name IN ('Mark', 'Brett', 'Chris');

-- Mark contractors
UPDATE technicians SET is_contractor = TRUE WHERE name = 'Jeremy';

-- Add Demi Ash as contractor
INSERT INTO technicians (name, is_contractor, hourly_wage, is_active)
SELECT 'Demi Ash', TRUE, 50.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM technicians WHERE LOWER(name) = 'demi ash');
