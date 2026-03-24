-- Migration 016: Add unit_type and color columns to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50);
ALTER TABLE units ADD COLUMN IF NOT EXISTS color VARCHAR(50);
