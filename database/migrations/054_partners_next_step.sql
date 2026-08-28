-- Migration 054: Partners module — next step tracking
--
-- Terri (marketing) handoff 2026-08-28. The Partners module had 20 records,
-- all status='new', all date_contacted NULL, zero activities, and no way to
-- express "what happens next and when". Next steps were living in the free
-- text notes column, which is not queryable.
--
-- Adds: partner_type, next_step, next_step_due, do_not_pitch, referral_terms,
-- owner_agent on partners; direction, outcome, next_step, next_step_due on
-- partner_activities; a trigger that pulls the partner record forward when a
-- contact is logged; and the partners_due view the weekly sweep reads.
--
-- Idempotent. Safe to run twice. Mirrored as a boot migration in server/src/app.js.

-- ---------- partners ----------

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS partner_type        varchar(32),
  ADD COLUMN IF NOT EXISTS next_step           text,
  ADD COLUMN IF NOT EXISTS next_step_due       date,
  ADD COLUMN IF NOT EXISTS do_not_pitch        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS do_not_pitch_reason text,
  ADD COLUMN IF NOT EXISTS referral_terms      text,
  ADD COLUMN IF NOT EXISTS owner_agent         varchar(32) NOT NULL DEFAULT 'Terri';

-- partner_type: what the record is. Drives priority order in partners_due.
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_partner_type_chk;
ALTER TABLE partners ADD CONSTRAINT partners_partner_type_chk
  CHECK (partner_type IS NULL OR partner_type IN
    ('storage_facility','campground','rv_club','dealer','mobile_tech','other'));

-- status: the pipeline stage. The old UI vocabulary (sent_email, left_vm,
-- no_response, met_live, agreed, not_interested) is replaced here and in
-- client/src/pages/Partners.js in the same change. All 20 rows were 'new'
-- and partner_activities was empty, so no data conversion was needed.
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_status_chk;
ALTER TABLE partners ADD CONSTRAINT partners_status_chk
  CHECK (status IN
    ('new','attempted','contacted','in_conversation','active','declined','not_a_fit','dormant'));

CREATE INDEX IF NOT EXISTS partners_next_step_due_idx ON partners (next_step_due);
CREATE INDEX IF NOT EXISTS partners_status_idx        ON partners (status);
CREATE INDEX IF NOT EXISTS partners_type_idx          ON partners (partner_type);

-- ---------- partner_activities ----------

ALTER TABLE partner_activities
  ADD COLUMN IF NOT EXISTS direction     varchar(16) NOT NULL DEFAULT 'outbound',
  ADD COLUMN IF NOT EXISTS outcome       varchar(32),
  ADD COLUMN IF NOT EXISTS next_step     text,
  ADD COLUMN IF NOT EXISTS next_step_due date;

ALTER TABLE partner_activities DROP CONSTRAINT IF EXISTS partner_activities_type_chk;
ALTER TABLE partner_activities ADD CONSTRAINT partner_activities_type_chk
  CHECK (activity_type IN
    ('email_sent','email_reply','call','voicemail','visit','meeting','referral_received','note'));

ALTER TABLE partner_activities DROP CONSTRAINT IF EXISTS partner_activities_outcome_chk;
ALTER TABLE partner_activities ADD CONSTRAINT partner_activities_outcome_chk
  CHECK (outcome IS NULL OR outcome IN
    ('no_answer','left_message','spoke','interested','not_interested','asked_to_follow_up','agreed'));

ALTER TABLE partner_activities DROP CONSTRAINT IF EXISTS partner_activities_direction_chk;
ALTER TABLE partner_activities ADD CONSTRAINT partner_activities_direction_chk
  CHECK (direction IN ('outbound','inbound'));

CREATE INDEX IF NOT EXISTS partner_activities_partner_idx
  ON partner_activities (partner_id, contact_date DESC);

-- ---------- trigger: logging a contact moves the partner record ----------
-- Without this, someone can log an activity and leave the partner record
-- still saying it was never touched. date_contacted is now derived, not typed.
-- contact_date is timestamptz and the server runs UTC, so cast in Denver time
-- or an evening entry stamps tomorrow's date.

CREATE OR REPLACE FUNCTION partners_sync_from_activity() RETURNS trigger AS $fn$
DECLARE
  act_date date := (NEW.contact_date AT TIME ZONE 'America/Denver')::date;
BEGIN
  UPDATE partners p SET
    date_contacted = GREATEST(COALESCE(p.date_contacted, act_date), act_date),
    next_step      = COALESCE(NEW.next_step, p.next_step),
    next_step_due  = COALESCE(NEW.next_step_due, p.next_step_due),
    status         = CASE
                       WHEN p.status IN ('new','attempted') AND NEW.outcome IN
                            ('spoke','interested','asked_to_follow_up') THEN 'contacted'
                       WHEN NEW.outcome = 'agreed'         THEN 'active'
                       WHEN NEW.outcome = 'not_interested' THEN 'declined'
                       WHEN p.status = 'new' AND NEW.outcome IN ('no_answer','left_message')
                            THEN 'attempted'
                       ELSE p.status
                     END,
    updated_at     = NOW()
  WHERE p.id = NEW.partner_id;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partner_activities_sync ON partner_activities;
CREATE TRIGGER partner_activities_sync
  AFTER INSERT ON partner_activities
  FOR EACH ROW EXECUTE FUNCTION partners_sync_from_activity();

-- ---------- the view the weekly sweep reads ----------

CREATE OR REPLACE VIEW partners_due AS
SELECT
  p.id,
  p.business_name,
  p.partner_type,
  p.status,
  p.contact_name,
  p.email,
  p.contact_phone,
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
