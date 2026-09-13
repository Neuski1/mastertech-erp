-- Migration 065: why a lead left the box, and hard delete
-- NOTE: In production these run via app.js boot-time auto-migrate. This file
-- exists for parity.
--
-- closed_reason: 'filed' (parked on the customer record, the only thing the
-- Closed Leads list shows) or 'converted' (became a record). There is no
-- 'deleted' value on purpose: deleting a lead is a hard delete, so a deleted
-- lead leaves the database instead of sitting in the archive.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS closed_reason TEXT;

UPDATE leads
   SET closed_reason = CASE
         WHEN record_id IS NOT NULL OR status = 'converted' THEN 'converted'
         ELSE 'filed' END
 WHERE deleted_at IS NOT NULL AND closed_reason IS NULL;

-- Deleting a lead takes its call/note history with it.
DO $$
DECLARE c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'lead_contacts'::regclass AND contype = 'f'
       AND confrelid = 'leads'::regclass
  LOOP
    EXECUTE format('ALTER TABLE lead_contacts DROP CONSTRAINT %I', c);
  END LOOP;
  ALTER TABLE lead_contacts
    ADD CONSTRAINT lead_contacts_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
END $$;
