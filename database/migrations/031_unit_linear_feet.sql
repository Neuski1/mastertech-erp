-- Replace color with linear feet on units
ALTER TABLE units ADD COLUMN IF NOT EXISTS linear_feet DECIMAL(6,1);
