-- Migration 017: Storage charges table to record monthly billing runs internally
CREATE TABLE IF NOT EXISTS storage_charges (
    id              SERIAL PRIMARY KEY,
    billing_id      INT             NOT NULL REFERENCES storage_billing(id),
    customer_id     INT             NOT NULL REFERENCES customers(id),
    space_id        INT             NOT NULL REFERENCES storage_spaces(id),
    amount          DECIMAL(10,2)   NOT NULL,
    charge_month    VARCHAR(7)      NOT NULL,  -- YYYY-MM
    charge_date     DATE            NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_by      INT             REFERENCES users(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_storage_charges_billing ON storage_charges (billing_id);
CREATE INDEX idx_storage_charges_month ON storage_charges (charge_month);
CREATE INDEX idx_storage_charges_customer ON storage_charges (customer_id);
