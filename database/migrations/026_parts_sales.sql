-- Quick Parts Sale tables
CREATE TABLE IF NOT EXISTS parts_sales (
  id SERIAL PRIMARY KEY,
  sale_number VARCHAR(20) UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(255),
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'open',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0.0975,
  cc_fee_amount DECIMAL(10,2) DEFAULT 0,
  cc_fee_applied BOOLEAN DEFAULT false,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_description VARCHAR(255),
  total_amount DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_due DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts_sale_lines (
  id SERIAL PRIMARY KEY,
  parts_sale_id INTEGER REFERENCES parts_sales(id) ON DELETE CASCADE,
  inventory_item_id INTEGER REFERENCES inventory(id),
  is_inventory_item BOOLEAN DEFAULT false,
  part_number VARCHAR(100),
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
