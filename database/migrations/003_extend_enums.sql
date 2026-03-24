-- ============================================================================
-- Migration 003: Extend enums for Phase 6
-- Adds 'phone' and 'in_person' to comm_channel_type
-- Adds 'pending' to delivery_status_type
-- ============================================================================

BEGIN;

ALTER TYPE comm_channel_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE comm_channel_type ADD VALUE IF NOT EXISTS 'in_person';
ALTER TYPE delivery_status_type ADD VALUE IF NOT EXISTS 'pending';

COMMIT;
