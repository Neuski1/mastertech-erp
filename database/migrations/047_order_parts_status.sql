-- Migration 047: Add 'order_parts' work status
-- Workflow: approved (Not Started) -> order_parts -> awaiting_parts -> in_progress
ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'order_parts';
