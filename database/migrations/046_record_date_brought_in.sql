-- Migration 046: (reverted) date_brought_in column is not used.
-- Carol opted to reuse the existing records.intake_date column as the
-- "Date Brought Into Shop" field instead of adding a new column.
-- This migration is a no-op kept only to preserve the migration sequence.
-- It drops date_brought_in if a prior run created it.
ALTER TABLE records DROP COLUMN IF EXISTS date_brought_in;
