-- 014_description_lines_imported.sql
-- Flag to track if job description bullet points were auto-imported as labor lines
ALTER TABLE records ADD COLUMN IF NOT EXISTS description_lines_imported BOOLEAN DEFAULT false;
