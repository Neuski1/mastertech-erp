-- Widen setting_value to TEXT for Google OAuth tokens (longer than 255 chars)
ALTER TABLE system_settings ALTER COLUMN setting_value TYPE TEXT;
