-- Add missing appointment type enum values
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'drop_off';
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'pick_up';
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'storage';
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_repair';
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'parts';
ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'other';

-- Confirm arrived status exists
ALTER TYPE appointment_status_type ADD VALUE IF NOT EXISTS 'arrived';
