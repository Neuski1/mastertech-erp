CREATE TABLE IF NOT EXISTS inventory_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prefix VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO inventory_categories (name, prefix) VALUES
  ('Airstream', 'AS'),
  ('Awning', 'AWN'),
  ('Battery', 'BAT'),
  ('Doors/Windows', 'DOOR'),
  ('Electrical', 'ELEC'),
  ('Hardware', 'HDWR'),
  ('HVAC', 'HVAC'),
  ('Misc/Shop Supplies', 'MISC'),
  ('Plumbing', 'PLMB'),
  ('Roofing', 'ROOF'),
  ('Solar', 'SOLR'),
  ('Suspension', 'SUSP'),
  ('Towing/Chassis', 'TOW')
ON CONFLICT (prefix) DO NOTHING;
