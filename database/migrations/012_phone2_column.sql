-- Add phone2 column (phone_secondary already exists in schema but confirm)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(20);

-- Ensure comm_channel_type has all values
ALTER TYPE comm_channel_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE comm_channel_type ADD VALUE IF NOT EXISTS 'in_person';
ALTER TYPE comm_channel_type ADD VALUE IF NOT EXISTS 'sms';
