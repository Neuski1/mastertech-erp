-- Migration 007: Add authorization signature storage
-- Stores the drawn signature as base64 for estimate sign-off

ALTER TABLE records
  ADD COLUMN IF NOT EXISTS authorization_signature TEXT;

-- Add comment
COMMENT ON COLUMN records.authorization_signature IS 'Base64 PNG of customer drawn signature for estimate authorization';
