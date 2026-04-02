-- Add Google Calendar event ID to appointments for sync tracking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
