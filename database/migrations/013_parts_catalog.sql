-- 013_parts_catalog.sql — Non-inventory parts catalog
-- Tracks previously used non-inventory parts for quick re-use

CREATE TABLE IF NOT EXISTS parts_catalog (
  id                  SERIAL PRIMARY KEY,
  description         TEXT NOT NULL,
  vendor_part_number  VARCHAR(100),
  vendor              VARCHAR(100),
  last_cost           NUMERIC(10,2),
  last_sale_price     NUMERIC(10,2),
  last_used_date      DATE,
  last_used_record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  times_used          INTEGER DEFAULT 1,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_catalog_description
  ON parts_catalog USING gin(to_tsvector('english', description));
CREATE INDEX idx_parts_catalog_vendor_part
  ON parts_catalog (vendor_part_number);
