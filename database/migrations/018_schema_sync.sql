-- Schema sync: columns and tables added locally but missing from migrations

ALTER TABLE records ADD COLUMN IF NOT EXISTS deductible_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE records ADD COLUMN IF NOT EXISTS freight_subtotal NUMERIC(12,2) DEFAULT 0;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notify_customer BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS vendor VARCHAR(255);

CREATE TABLE IF NOT EXISTS record_freight_lines (
  id SERIAL PRIMARY KEY,
  record_id INTEGER NOT NULL REFERENCES records(id),
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add missing enum value for appointment types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'storage' AND enumtypid = 'appointment_type_type'::regtype) THEN
    ALTER TYPE appointment_type_type ADD VALUE 'storage';
  END IF;
END $$;

-- Customer account number sequence
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'customer_account_seq') THEN
    CREATE SEQUENCE customer_account_seq START WITH 1412;
  END IF;
END $$;
