-- Add email validity and opt-out tracking columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid_date TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_opt_out_date TIMESTAMPTZ;
