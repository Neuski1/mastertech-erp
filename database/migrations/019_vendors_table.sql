CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  contact_name VARCHAR(150),
  phone VARCHAR(20),
  email VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed from existing inventory vendor data
INSERT INTO vendors (name)
SELECT DISTINCT UPPER(TRIM(vendor))
FROM inventory
WHERE vendor IS NOT NULL AND TRIM(vendor) != ''
ON CONFLICT (name) DO NOTHING;

-- Also seed from record_parts_lines vendor data
INSERT INTO vendors (name)
SELECT DISTINCT UPPER(TRIM(vendor))
FROM record_parts_lines
WHERE vendor IS NOT NULL AND TRIM(vendor) != ''
ON CONFLICT (name) DO NOTHING;
