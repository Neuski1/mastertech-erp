-- Migration 049: Add authorization_number column to records
ALTER TABLE records ADD COLUMN IF NOT EXISTS authorization_number VARCHAR(100);
