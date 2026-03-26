-- Add 'arrived' to the appointment status enum
ALTER TYPE appointment_status_type ADD VALUE IF NOT EXISTS 'arrived';
