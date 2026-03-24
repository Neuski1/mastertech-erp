-- Migration 008: Extend inventory table for import compatibility
-- Adds vendor_part_number, category, and converts vendor to VARCHAR for flexibility

-- Add new columns
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS vendor_part_number VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Convert vendor from enum to VARCHAR to support diverse supplier names
ALTER TABLE inventory ALTER COLUMN vendor TYPE VARCHAR(50) USING vendor::TEXT;

-- Drop the old enum type if no longer in use
DROP TYPE IF EXISTS vendor_type;
