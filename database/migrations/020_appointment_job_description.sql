-- Add job_description column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS job_description TEXT;
