-- Migration 009: Add payment_pending, schedule_customer, scheduled statuses
-- Full order: estimate → approved → schedule_customer → scheduled → in_progress →
--   awaiting_parts → awaiting_approval → complete → payment_pending → partial → paid → on_hold → void

ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'schedule_customer' AFTER 'approved';
ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'scheduled' AFTER 'schedule_customer';
ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'payment_pending' AFTER 'complete';
