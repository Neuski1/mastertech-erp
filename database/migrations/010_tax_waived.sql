-- Migration 010: Add tax_waived flag to records
ALTER TABLE records ADD COLUMN IF NOT EXISTS tax_waived BOOLEAN DEFAULT FALSE;
