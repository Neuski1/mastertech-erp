-- Add linear_feet to storage spaces
ALTER TABLE storage_spaces ADD COLUMN IF NOT EXISTS linear_feet DECIMAL(6,1);
