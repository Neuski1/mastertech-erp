-- Add reorder tracking fields to inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_status VARCHAR(20) DEFAULT NULL;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_date DATE DEFAULT NULL;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_note TEXT DEFAULT NULL;
-- reorder_status values: NULL (not tracked), 'ordered', 'received'
