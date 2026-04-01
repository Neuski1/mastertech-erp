-- Add marketing_opt_out column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN NOT NULL DEFAULT false;
