-- Migration 056: Partners — check-in cadence for active partners
--
-- Carol, 2026-09-02: "Once they are an active partner, they don't need to be
-- pitched but they need to stay on my radar to check in with them."
--
-- Do Not Pitch was the only tool for "stop pitching this one", and it drops the
-- record off the work list entirely. That is right for dealers and mobile techs
-- and wrong for a partner who is actively sending business. The other half of
-- the problem: the 14-day stale rule is a prospecting cadence. Nobody calls
-- their storage partner every two weeks, so active partners would have sat in
-- the Due tab permanently as noise.
--
-- Adds `check_in_days` (default 90 on active partners) and splits the two
-- cadences: active partners get a check_in_due reason on their own interval,
-- and the 14-day stale rule now applies only to records still in the pipeline.
--
-- Idempotent. Safe to run twice. Mirrored as a boot migration in server/src/app.js.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS check_in_days integer;

ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_check_in_days_chk;
ALTER TABLE partners ADD CONSTRAINT partners_check_in_days_chk
  CHECK (check_in_days IS NULL OR (check_in_days >= 7 AND check_in_days <= 365));

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
  p.referral_terms,
  p.check_in_days,
  p.owner_agent,
  -- Order matters and must mirror the WHERE clause below, or a row gets in
  -- with a NULL reason and lands in no group in the UI.
  CASE
    WHEN p.next_step IS NULL OR p.next_step = ''  THEN 'no_next_step'
    WHEN p.next_step_due < CURRENT_DATE           THEN 'overdue'
    WHEN p.status = 'active'                      THEN 'check_in_due'
    WHEN p.date_contacted IS NULL                 THEN 'never_contacted'
    ELSE 'stale_14_day'
  END AS due_reason,
  -- Active partners outrank cold prospects: an existing relationship is worth
  -- more than a first call. Below that, Terri's order stands.
  CASE
    WHEN p.status = 'active' THEN 0
    ELSE CASE p.partner_type
      WHEN 'storage_facility' THEN 1
      WHEN 'campground'       THEN 2
      WHEN 'rv_club'          THEN 3
      ELSE 9
    END
  END AS priority_rank,
  CURRENT_DATE - p.date_contacted AS days_since_contact
FROM partners p
WHERE p.do_not_pitch = false
  AND p.status NOT IN ('declined','not_a_fit')
  AND (
        p.next_step IS NULL OR p.next_step = ''
     OR p.next_step_due < CURRENT_DATE
     -- Active: their own check-in interval, 90 days unless set otherwise.
     OR (p.status = 'active'
         AND (p.date_contacted IS NULL
              OR p.date_contacted < CURRENT_DATE - COALESCE(p.check_in_days, 90)))
     -- Still in the pipeline: the 14-day prospecting cadence.
     OR (p.status <> 'active' AND p.date_contacted IS NULL)
     OR (p.status <> 'active' AND p.date_contacted < CURRENT_DATE - 14)
  )
ORDER BY priority_rank, p.next_step_due NULLS FIRST, p.date_contacted NULLS FIRST;
