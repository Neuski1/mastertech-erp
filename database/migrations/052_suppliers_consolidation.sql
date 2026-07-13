-- Migration 052: Suppliers consolidation (Phase 1)
-- Merge the duplicated `vendors` (45 rows) + `vendor_details` (35 rows) supplier
-- concepts into a single `suppliers` table. vendor_details is the richer table
-- (website, account_number, supplier_type, subcategory), so we RENAME it to
-- `suppliers`, rename vendor_name -> name, add the new columns, then fold any
-- `vendors` rows that have no name match into it.
--
-- Then add nullable supplier_id FKs to inventory, parts_catalog,
-- purchase_orders and record_parts_lines and backfill them from the existing
-- free-text vendor columns. The free-text columns are intentionally kept for
-- now (dropped in a later migration once the FK is verified in production).

-- ---------------------------------------------------------------------------
-- 1. Rename vendor_details -> suppliers (guarded so re-runs are safe)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'vendor_details')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables
                     WHERE table_name = 'suppliers') THEN
    ALTER TABLE vendor_details RENAME TO suppliers;
  END IF;
END $$;

-- Fresh installs that never had vendor_details: create suppliers from scratch.
CREATE TABLE IF NOT EXISTS suppliers (
  id            SERIAL PRIMARY KEY,
  vendor_name   VARCHAR(255) NOT NULL UNIQUE,
  website       VARCHAR(500),
  contact_name  VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  account_number VARCHAR(100),
  notes         TEXT,
  supplier_type VARCHAR(20) NOT NULL DEFAULT 'inventory',
  subcategory   VARCHAR(100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Rename vendor_name -> name (guarded)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'suppliers' AND column_name = 'vendor_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'suppliers' AND column_name = 'name') THEN
    ALTER TABLE suppliers RENAME COLUMN vendor_name TO name;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Add the new supplier columns from the spec
-- ---------------------------------------------------------------------------
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS default_ship_days INTEGER;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS order_method VARCHAR(20);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- order_method may only be 'website' or 'phone' (NULL = unknown)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_order_method_chk') THEN
    ALTER TABLE suppliers
      ADD CONSTRAINT suppliers_order_method_chk
      CHECK (order_method IS NULL OR order_method IN ('website', 'phone'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Merge `vendors` rows that have no matching supplier name
--    (case-insensitive, trimmed). vendors columns: name, contact_name,
--    phone, email, notes.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    INSERT INTO suppliers (name, contact_name, contact_phone, contact_email, notes, supplier_type)
    SELECT TRIM(v.name), v.contact_name, v.phone, v.email, v.notes, 'inventory'
      FROM vendors v
     WHERE TRIM(v.name) <> ''
       AND NOT EXISTS (
         SELECT 1 FROM suppliers s
          WHERE LOWER(TRIM(s.name)) = LOWER(TRIM(v.name))
       )
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Add nullable supplier_id FKs to the four consuming tables
-- ---------------------------------------------------------------------------
ALTER TABLE inventory          ADD COLUMN IF NOT EXISTS supplier_id INTEGER;
ALTER TABLE parts_catalog      ADD COLUMN IF NOT EXISTS supplier_id INTEGER;
ALTER TABLE purchase_orders    ADD COLUMN IF NOT EXISTS supplier_id INTEGER;
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS supplier_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_supplier_id_fkey') THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parts_catalog_supplier_id_fkey') THEN
    ALTER TABLE parts_catalog ADD CONSTRAINT parts_catalog_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_supplier_id_fkey') THEN
    ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'record_parts_lines_supplier_id_fkey') THEN
    ALTER TABLE record_parts_lines ADD CONSTRAINT record_parts_lines_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. Backfill supplier_id from the existing free-text vendor columns
--    (case-insensitive, trimmed match on suppliers.name)
-- ---------------------------------------------------------------------------
UPDATE inventory i SET supplier_id = s.id
  FROM suppliers s
 WHERE i.supplier_id IS NULL
   AND i.vendor IS NOT NULL
   AND LOWER(TRIM(i.vendor)) = LOWER(TRIM(s.name));

UPDATE parts_catalog pc SET supplier_id = s.id
  FROM suppliers s
 WHERE pc.supplier_id IS NULL
   AND pc.vendor IS NOT NULL
   AND LOWER(TRIM(pc.vendor)) = LOWER(TRIM(s.name));

UPDATE purchase_orders po SET supplier_id = s.id
  FROM suppliers s
 WHERE po.supplier_id IS NULL
   AND po.vendor IS NOT NULL
   AND LOWER(TRIM(po.vendor)) = LOWER(TRIM(s.name));

-- record_parts_lines: match on `vendor` first, then fall back to order_supplier
UPDATE record_parts_lines rpl SET supplier_id = s.id
  FROM suppliers s
 WHERE rpl.supplier_id IS NULL
   AND rpl.vendor IS NOT NULL
   AND LOWER(TRIM(rpl.vendor)) = LOWER(TRIM(s.name));

UPDATE record_parts_lines rpl SET supplier_id = s.id
  FROM suppliers s
 WHERE rpl.supplier_id IS NULL
   AND rpl.order_supplier IS NOT NULL
   AND LOWER(TRIM(rpl.order_supplier)) = LOWER(TRIM(s.name));

-- ---------------------------------------------------------------------------
-- 7. Indexes for the new FK columns
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inventory_supplier          ON inventory (supplier_id);
CREATE INDEX IF NOT EXISTS idx_parts_catalog_supplier      ON parts_catalog (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier    ON purchase_orders (supplier_id);
CREATE INDEX IF NOT EXISTS idx_record_parts_lines_supplier ON record_parts_lines (supplier_id);
