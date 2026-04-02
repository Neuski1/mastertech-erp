-- Add hourly wage to technicians table
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(8,2) DEFAULT 0;
