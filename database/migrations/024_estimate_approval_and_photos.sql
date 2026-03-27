-- Estimate approval columns
ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token UUID DEFAULT gen_random_uuid();
ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token_expires_at TIMESTAMPTZ;
ALTER TABLE records ADD COLUMN IF NOT EXISTS approved_by_customer_at TIMESTAMPTZ;
ALTER TABLE records ADD COLUMN IF NOT EXISTS approved_by_customer_ip VARCHAR(50);

-- Photo links table
CREATE TABLE IF NOT EXISTS record_photos (
  id SERIAL PRIMARY KEY,
  record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  category VARCHAR(20) CHECK (category IN ('before', 'during', 'after', 'damage', 'other')),
  label VARCHAR(255),
  onedrive_url TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_record_photos_record_id ON record_photos(record_id);
