-- Migration 060: Lead notes
-- Free-text notes share the lead_contacts table with the call/email log and are
-- told apart by entry_type ('call' | 'email' | 'note'). A note never sets
-- leads.contacted_at and never advances the lead's status: writing yourself a
-- reminder is not the same as reaching the customer.
-- NOTE: In production this runs via app.js boot-time auto-migrate. This file
-- exists for parity.

ALTER TABLE lead_contacts ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'call';
