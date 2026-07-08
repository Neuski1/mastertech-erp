-- Migration 048: Leads workflow
-- Adds 'scheduled' lead status and a soft-delete column on leads.
-- NOTE: In production these run via app.js boot-time auto-migrate. This file
-- exists for parity. ALTER TYPE ... ADD VALUE cannot run inside a transaction
-- block alongside use of the new value, so run these as standalone statements.

ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'scheduled';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
