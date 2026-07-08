-- Migration 051: date a customer part was ordered
ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_date DATE;
