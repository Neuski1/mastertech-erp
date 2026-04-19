-- Storage waitlist table
CREATE TABLE IF NOT EXISTS storage_waitlist (
    id              SERIAL PRIMARY KEY,
    customer_id     INT REFERENCES customers(id),
    -- Allow non-customer entries (walk-in inquiries)
    contact_name    VARCHAR(200),
    contact_phone   VARCHAR(30),
    contact_email   VARCHAR(200),
    space_type      VARCHAR(10) NOT NULL CHECK (space_type IN ('indoor', 'outdoor')),
    -- RV details
    rv_year         VARCHAR(4),
    rv_make         VARCHAR(100),
    rv_model        VARCHAR(100),
    rv_length_feet  DECIMAL(6,1),
    -- Preferences
    preferred_start DATE,
    budget_monthly  DECIMAL(10,2),
    notes           TEXT,
    -- Tracking
    position        INT,
    status          VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'assigned', 'cancelled')),
    notified_at     TIMESTAMPTZ,
    assigned_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_storage_waitlist_type ON storage_waitlist(space_type);
CREATE INDEX idx_storage_waitlist_status ON storage_waitlist(status);
CREATE INDEX idx_storage_waitlist_customer ON storage_waitlist(customer_id);
