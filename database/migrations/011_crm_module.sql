-- Migration 011: CRM module — marketing contacts, leads, customer lead_source

-- Marketing contacts / campaign log
CREATE TABLE IF NOT EXISTS marketing_contacts (
    id              SERIAL PRIMARY KEY,
    customer_id     INT NOT NULL REFERENCES customers(id),
    campaign_name   VARCHAR(200),
    channel         VARCHAR(50),   -- Email, Postcard, Phone, SMS, Other
    notes           TEXT,
    logged_by       INT REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_customer ON marketing_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_marketing_contacts_campaign ON marketing_contacts(campaign_name);

-- Leads table
CREATE TYPE lead_status_type AS ENUM ('new', 'contacted', 'converted');

CREATE TABLE IF NOT EXISTS leads (
    id              SERIAL PRIMARY KEY,
    customer_id     INT REFERENCES customers(id),
    record_id       INT REFERENCES records(id),
    name            VARCHAR(200),
    phone           VARCHAR(50),
    email           VARCHAR(200),
    message         TEXT,
    source          VARCHAR(50) DEFAULT 'website',
    status          lead_status_type NOT NULL DEFAULT 'new',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Add lead_source to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50);
