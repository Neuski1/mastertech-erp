-- Add discount/credit fields to records
ALTER TABLE records ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE records ADD COLUMN IF NOT EXISTS discount_description VARCHAR(255);
