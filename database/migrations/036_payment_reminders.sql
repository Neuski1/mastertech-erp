ALTER TABLE records ADD COLUMN IF NOT EXISTS payment_pending_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE records ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE records ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_records_payment_pending_since ON records (payment_pending_since) WHERE payment_pending_since IS NOT NULL;
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('payment_reminders_enabled', 'true', 'Enable automatic payment reminder emails and texts'),
  ('payment_reminders_last_run', '', 'Timestamp of last payment reminder cron run'),
  ('payment_reminders_last_run_count', '0', 'Number of reminders sent in last cron run')
ON CONFLICT (setting_key) DO NOTHING;
UPDATE records SET payment_pending_since = updated_at WHERE status = 'payment_pending' AND payment_pending_since IS NULL;
