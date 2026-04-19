-- Add 'parts_deposit' to payment_type_type enum for online payment links
ALTER TYPE payment_type_type ADD VALUE IF NOT EXISTS 'parts_deposit';
