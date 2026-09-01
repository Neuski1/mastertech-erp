-- Migration 060/061: marketing image library + marketing calendar.
-- Also applied idempotently as boot migrations in server/src/app.js.

CREATE TABLE IF NOT EXISTS marketing_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  alt_text VARCHAR(255),
  filename VARCHAR(255),
  content_type VARCHAR(100) DEFAULT 'image/jpeg',
  file_size INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  image_data BYTEA NOT NULL,
  thumbnail_data BYTEA,
  source VARCHAR(30) DEFAULT 'upload',      -- upload | record_photo
  source_record_id INTEGER,
  source_photo_id INTEGER,
  tags TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_marketing_images_created ON marketing_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_images_source ON marketing_images(source_record_id);

ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS hero_alt VARCHAR(255);
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS hero_caption TEXT;
-- Social posts live in the same table as email campaigns; campaign_type splits them.
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(20) DEFAULT 'email';  -- email | social
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS platforms TEXT;          -- 'Facebook,Instagram'
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS post_caption TEXT;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS scheduled_for DATE;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS image_urls TEXT;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS calendar_row_id INTEGER;
-- Approval is a record, not an email reply.
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'draft'; -- draft | needs_photo | approved | rejected | posted
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS approval_note TEXT;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS marketing_calendar (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  scheduled_date DATE,
  date_note VARCHAR(40),
  channel VARCHAR(30) NOT NULL,             -- Email | Instagram | Facebook | YouTube | Partner | Website | Ads | Other
  piece TEXT NOT NULL,
  owner VARCHAR(40),                        -- Terri | Smile | Carol | SEO/GEO
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | needs_photo | approved | posted | skipped
  response TEXT,
  notes TEXT,
  campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE SET NULL,
  record_id INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_month ON marketing_calendar(month);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_owner ON marketing_calendar(owner);

CREATE TABLE IF NOT EXISTS marketing_calendar_months (
  month DATE PRIMARY KEY,
  notes TEXT,
  rebuilt_at TIMESTAMPTZ
);
