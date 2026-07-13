-- Migration 053: Purchase Order engine (Phase 2)
-- Turn purchase_orders into the single spine for parts buying:
--   * new lifecycle status set: draft | submitted | partially_received | received | cancelled
--   * order-confirmation tracking (submitted_at, expected_date, order_email_msg_id, po_number)
--   * line-item linkage back to record_parts_lines + partial-receive support
--
-- NOTE (per the reconciliation decisions for this rebuild):
--   * status stays a VARCHAR guarded by a CHECK constraint (the codebase models
--     statuses as varchars, e.g. reorder_status / match_status), NOT a native
--     PG enum.
--   * po_line_items reuses the EXISTING inventory_item_id FK where the spec says
--     "inventory_id"; no duplicate column is added.

-- ---------------------------------------------------------------------------
-- 1. purchase_orders: new tracking columns
-- ---------------------------------------------------------------------------
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS expected_date       DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS submitted_at        TIMESTAMPTZ;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS order_email_msg_id  VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_number           VARCHAR(50);

-- ---------------------------------------------------------------------------
-- 2. Migrate the existing lifecycle values and lock the status set down.
--    Existing rows are 'pending' (-> draft) or 'received' (kept).
-- ---------------------------------------------------------------------------
UPDATE purchase_orders SET status = 'draft' WHERE status = 'pending' OR status IS NULL;

ALTER TABLE purchase_orders ALTER COLUMN status SET DEFAULT 'draft';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_status_chk') THEN
    ALTER TABLE purchase_orders
      ADD CONSTRAINT purchase_orders_status_chk
      CHECK (status IN ('draft', 'submitted', 'partially_received', 'received', 'cancelled'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. po_line_items: record linkage + partial-receive + source
-- ---------------------------------------------------------------------------
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS record_parts_line_id INTEGER;
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS qty_received         NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS source               VARCHAR(20);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'po_line_items_record_parts_line_id_fkey') THEN
    ALTER TABLE po_line_items ADD CONSTRAINT po_line_items_record_parts_line_id_fkey
      FOREIGN KEY (record_parts_line_id) REFERENCES record_parts_lines(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'po_line_items_source_chk') THEN
    ALTER TABLE po_line_items ADD CONSTRAINT po_line_items_source_chk
      CHECK (source IS NULL OR source IN ('record', 'restock', 'manual'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_po_line_items_record_line ON po_line_items (record_parts_line_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders (po_number);
