-- Add 'filed' status for parked estimates that may reactivate later
ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'filed';
