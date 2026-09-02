-- Migration 055: Partners — street address, and address on partners_due
--
-- Carol, 2026-09-02: the Add Partner form had no address line. `location` was
-- doing double duty as city/state and sometimes street (partner 4 held
-- "Henderson, CO 80640 (11905 E 124th Ave)"). Split them: `address` is the
-- street, `location` stays city/state.
--
-- Idempotent. Safe to run twice. Mirrored as a boot migration in server/src/app.js.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS address varchar(255);

-- Recreate partners_due with address included. CREATE OR REPLACE VIEW cannot
-- add a column in the middle, so drop first.
DROP VIEW IF EXISTS partners_due;

CREATE VIEW partners_due AS
SELECT
  p.id,
  p.business_name,
  p.partner_type,
  p.status,
  p.contact_name,
  p.email,
  p.contact_phone,
  p.address,
  p.location,
  p.date_contacted,
  p.next_step,
  p.next_step_due,
  p.owner_agent,
  CASE
    WHEN p.next_step IS NULL OR p.next_step = ''      THEN 'no_next_step'
    WHEN p.date_contacted IS NULL                     THEN 'never_contacted'
    WHEN p.next_step_due < CURRENT_DATE               THEN 'overdue'
    WHEN p.date_contacted < CURRENT_DATE - 14         THEN 'stale_14_day'
  END AS due_reason,
  CASE p.partner_type
    WHEN 'storage_facility' THEN 1
    WHEN 'campground'       THEN 2
    WHEN 'rv_club'          THEN 3
    ELSE 9
  END AS priority_rank,
  CURRENT_DATE - p.date_contacted AS days_since_contact
FROM partners p
WHERE p.do_not_pitch = false
  AND p.status NOT IN ('declined','not_a_fit')
  AND (
        p.next_step IS NULL OR p.next_step = ''
     OR p.date_contacted IS NULL
     OR p.next_step_due < CURRENT_DATE
     OR p.date_contacted < CURRENT_DATE - 14
  )
ORDER BY priority_rank, p.next_step_due NULLS FIRST, p.date_contacted NULLS FIRST;
