-- ============================================================================
-- Master Tech RV Repair & Storage — ERP Database Schema
-- Migration 001: Initial Schema
-- Version: 1.1  ·  March 2026
-- PostgreSQL 16+
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE comm_preference_type AS ENUM ('text', 'email', 'both', 'none');

CREATE TYPE record_status_type AS ENUM (
    'estimate', 'approved', 'in_progress', 'awaiting_parts',
    'awaiting_approval', 'complete', 'partial', 'paid', 'void', 'on_hold'
);

CREATE TYPE payment_type_type AS ENUM (
    'deposit', 'insurance_payment', 'partial_payment', 'final_payment', 'overpayment'
);

CREATE TYPE payment_method_type AS ENUM ('credit_card', 'check', 'cash', 'zelle');

CREATE TYPE vendor_type AS ENUM (
    'Amazon', 'NTP', 'Torklift', 'Interstate', 'Lippert', 'Renogy',
    'Iron', 'Woodstream', 'Adfas', 'TMC', 'Home Depot', 'Airstream', 'Other'
);

CREATE TYPE inventory_location_type AS ENUM ('Front Closet', 'Back Room', 'Shop', 'unassigned');

CREATE TYPE appointment_type_type AS ENUM (
    'drop_off', 'pick_up', 'estimate_inspection', 'storage_check_in',
    'storage_check_out', 'mobile_service', 'follow_up_call', 'parts_pickup'
);

CREATE TYPE appointment_status_type AS ENUM (
    'scheduled', 'confirmed', 'in_progress', 'complete', 'cancelled', 'no_show'
);

CREATE TYPE comm_channel_type AS ENUM ('text', 'email');

CREATE TYPE delivery_status_type AS ENUM ('sent', 'delivered', 'failed');

CREATE TYPE user_role_type AS ENUM ('admin', 'service_writer', 'technician', 'bookkeeper');

CREATE TYPE space_type AS ENUM ('indoor', 'outdoor');

-- ============================================================================
-- TRIGGER FUNCTION: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 1: system_settings
-- System-wide configuration values (labor rate, tax rate, etc.)
-- ============================================================================

CREATE TABLE system_settings (
    id              SERIAL PRIMARY KEY,
    setting_key     VARCHAR(100)    NOT NULL UNIQUE,
    setting_value   VARCHAR(255)    NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 2: customers
-- CRM — contact info, comm preferences, tax exempt, storage flag
-- Account numbers preserved from Summit (101–1406); new start at 1407
-- ============================================================================

CREATE TABLE customers (
    id                      SERIAL PRIMARY KEY,
    account_number          VARCHAR(20)     NOT NULL UNIQUE,
    last_name               VARCHAR(100)    NOT NULL,
    first_name              VARCHAR(100),
    company_name            VARCHAR(150),
    address_street          VARCHAR(200),
    address_city            VARCHAR(100),
    address_state           VARCHAR(2),
    address_zip             VARCHAR(10),
    phone_primary           VARCHAR(20),
    phone_secondary         VARCHAR(20),
    email_primary           VARCHAR(150),
    email_secondary         VARCHAR(150),
    comm_preference         comm_preference_type NOT NULL DEFAULT 'email',
    phone_mobile            VARCHAR(20),
    tax_exempt              BOOLEAN         NOT NULL DEFAULT FALSE,
    is_storage_customer     BOOLEAN         NOT NULL DEFAULT FALSE,
    marketing_followup      BOOLEAN         NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    imported_from_summit    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_customers_last_name ON customers (last_name);
CREATE INDEX idx_customers_email_primary ON customers (email_primary);
CREATE INDEX idx_customers_phone_primary ON customers (phone_primary);
CREATE INDEX idx_customers_deleted_at ON customers (deleted_at);
CREATE INDEX idx_customers_is_storage ON customers (is_storage_customer) WHERE is_storage_customer = TRUE;

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 3: users
-- System users with role-based access control
-- ============================================================================

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role_type  NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_deleted_at ON users (deleted_at);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 4: technicians
-- Technician roster — 3 active at go-live
-- ============================================================================

CREATE TABLE technicians (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_technicians_is_active ON technicians (is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 5: storage_spaces
-- Physical storage locations — 16 outdoor + 10 indoor = 26 total
-- ============================================================================

CREATE TABLE storage_spaces (
    id              SERIAL PRIMARY KEY,
    space_type      space_type      NOT NULL,
    label           VARCHAR(50),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    notes           VARCHAR(255),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_storage_spaces_type ON storage_spaces (space_type);
CREATE INDEX idx_storage_spaces_is_active ON storage_spaces (is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_storage_spaces_updated_at
    BEFORE UPDATE ON storage_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 6: units
-- RV/trailer/vehicle records linked to customers
-- Mileage is per-record (at intake), NOT stored on unit
-- ============================================================================

CREATE TABLE units (
    id                      SERIAL PRIMARY KEY,
    customer_id             INT             NOT NULL REFERENCES customers(id),
    year                    SMALLINT,
    make                    VARCHAR(100),
    model                   VARCHAR(150),
    vin                     VARCHAR(50),
    license_plate           VARCHAR(30),
    unit_notes              TEXT,
    imported_from_summit    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_units_customer_id ON units (customer_id);
CREATE INDEX idx_units_vin ON units (vin);
CREATE INDEX idx_units_license_plate ON units (license_plate);
CREATE INDEX idx_units_deleted_at ON units (deleted_at);

CREATE TRIGGER trg_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 7: inventory
-- Parts catalog — vendors, locations, stock tracking, reorder alerts
-- 247 parts at January 2026 baseline
-- ============================================================================

CREATE TABLE inventory (
    id                  SERIAL PRIMARY KEY,
    part_number         VARCHAR(100),
    description         VARCHAR(255)    NOT NULL,
    vendor              vendor_type,
    location            inventory_location_type,
    qty_on_hand         DECIMAL(8,2)    NOT NULL DEFAULT 0,
    reorder_level       DECIMAL(8,2),
    cost_each           DECIMAL(10,2),
    sale_price_each     DECIMAL(10,2)   NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_inventory_part_number ON inventory (part_number);
CREATE INDEX idx_inventory_vendor ON inventory (vendor);
CREATE INDEX idx_inventory_location ON inventory (location);
CREATE INDEX idx_inventory_is_active ON inventory (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_inventory_reorder ON inventory (qty_on_hand, reorder_level)
    WHERE reorder_level IS NOT NULL AND is_active = TRUE;
CREATE INDEX idx_inventory_deleted_at ON inventory (deleted_at);

CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 8: records (Estimate / Work Order / Invoice)
-- Central table — one row = one job from estimate through paid
-- Status drives document label, active fields, and triggers
-- record_number is the human-facing WO/Invoice number (never changes)
-- ============================================================================

CREATE TABLE records (
    id                          SERIAL PRIMARY KEY,
    record_number               INT             NOT NULL UNIQUE,
    customer_id                 INT             NOT NULL REFERENCES customers(id),
    unit_id                     INT             NOT NULL REFERENCES units(id),
    status                      record_status_type NOT NULL DEFAULT 'estimate',
    key_number                  VARCHAR(20),
    job_description             TEXT,

    -- Dates
    intake_date                 DATE,
    start_date                  DATE,
    expected_completion_date    DATE,
    actual_completion_date      DATE,
    mileage_at_intake           INT,

    -- Insurance / Warranty
    is_insurance_job            BOOLEAN         NOT NULL DEFAULT FALSE,
    insurance_company           VARCHAR(150),
    insurance_contact_name      VARCHAR(150),
    insurance_phone             VARCHAR(30),
    insurance_email             VARCHAR(150),
    claim_number                VARCHAR(100),
    policy_number               VARCHAR(100),

    -- Estimate fields
    estimate_valid_until        DATE,
    authorization_signed_at     TIMESTAMPTZ,

    -- Notes
    internal_notes              TEXT,
    customer_notes              TEXT,

    -- Financial adjustments
    under_warranty_amount       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    no_charge_amount            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    deposit_amount              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,

    -- Calculated totals
    labor_subtotal              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    total_hours                 DECIMAL(6,2)    NOT NULL DEFAULT 0.00,
    shop_supplies_exempt        BOOLEAN         NOT NULL DEFAULT FALSE,
    shop_supplies_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    parts_subtotal              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    tax_rate                    DECIMAL(5,4)    NOT NULL DEFAULT 0.0975,
    tax_amount                  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    cc_fee_applied              BOOLEAN         NOT NULL DEFAULT FALSE,
    cc_fee_amount               DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    subtotal_others             DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    total_sales                 DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    total_collected             DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    amount_due                  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,

    -- QuickBooks integration
    quickbooks_synced_at        TIMESTAMPTZ,
    quickbooks_invoice_id       VARCHAR(100),

    -- Metadata
    imported_from_summit        BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by_user_id          INT             REFERENCES users(id),
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

CREATE INDEX idx_records_record_number ON records (record_number);
CREATE INDEX idx_records_customer_id ON records (customer_id);
CREATE INDEX idx_records_unit_id ON records (unit_id);
CREATE INDEX idx_records_status ON records (status);
CREATE INDEX idx_records_is_insurance ON records (is_insurance_job) WHERE is_insurance_job = TRUE;
CREATE INDEX idx_records_created_by ON records (created_by_user_id);
CREATE INDEX idx_records_deleted_at ON records (deleted_at);
CREATE INDEX idx_records_qb_sync ON records (quickbooks_synced_at) WHERE quickbooks_synced_at IS NULL;

CREATE TRIGGER trg_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 9: record_labor_lines
-- Labor entries per record — rate snapshotted at $198/hr
-- Each line attributed to one technician
-- ============================================================================

CREATE TABLE record_labor_lines (
    id              SERIAL PRIMARY KEY,
    record_id       INT             NOT NULL REFERENCES records(id),
    technician_id   INT             NOT NULL REFERENCES technicians(id),
    line_type       VARCHAR(5)      NOT NULL DEFAULT 'L',
    description     TEXT            NOT NULL,
    hours           DECIMAL(6,2)    NOT NULL,
    rate            DECIMAL(8,2)    NOT NULL,
    line_total      DECIMAL(10,2)   NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_labor_lines_record_id ON record_labor_lines (record_id);
CREATE INDEX idx_labor_lines_technician_id ON record_labor_lines (technician_id);
CREATE INDEX idx_labor_lines_deleted_at ON record_labor_lines (deleted_at);

CREATE TRIGGER trg_labor_lines_updated_at
    BEFORE UPDATE ON record_labor_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 10: record_parts_lines
-- Parts per record — supports inventory and non-inventory parts
-- inventory_id = NULL for non-inventory parts
-- ============================================================================

CREATE TABLE record_parts_lines (
    id                  SERIAL PRIMARY KEY,
    record_id           INT             NOT NULL REFERENCES records(id),
    inventory_id        INT             REFERENCES inventory(id),
    is_inventory_part   BOOLEAN         NOT NULL DEFAULT FALSE,
    part_number         VARCHAR(100),
    description         VARCHAR(255)    NOT NULL,
    quantity            DECIMAL(8,2)    NOT NULL,
    cost_each           DECIMAL(10,2),
    sale_price_each     DECIMAL(10,2)   NOT NULL,
    line_total          DECIMAL(10,2)   NOT NULL,
    taxable             BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order          INT             NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_parts_lines_record_id ON record_parts_lines (record_id);
CREATE INDEX idx_parts_lines_inventory_id ON record_parts_lines (inventory_id);
CREATE INDEX idx_parts_lines_deleted_at ON record_parts_lines (deleted_at);

CREATE TRIGGER trg_parts_lines_updated_at
    BEFORE UPDATE ON record_parts_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 11: payments
-- Multi-line payment ledger per record
-- Each payment auto-updates records.total_collected and records.amount_due
-- ============================================================================

CREATE TABLE payments (
    id                      SERIAL PRIMARY KEY,
    record_id               INT                 NOT NULL REFERENCES records(id),
    payment_type            payment_type_type    NOT NULL,
    payment_method          payment_method_type  NOT NULL,
    amount                  DECIMAL(10,2)       NOT NULL,
    payment_date            DATE                NOT NULL,
    check_number            VARCHAR(50),
    insurance_company       VARCHAR(150),
    claim_number            VARCHAR(100),
    square_transaction_id   VARCHAR(200),
    posted_by_user_id       INT                 REFERENCES users(id),
    notes                   TEXT,
    created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_payments_record_id ON payments (record_id);
CREATE INDEX idx_payments_payment_date ON payments (payment_date);
CREATE INDEX idx_payments_posted_by ON payments (posted_by_user_id);
CREATE INDEX idx_payments_deleted_at ON payments (deleted_at);
CREATE INDEX idx_payments_square_txn ON payments (square_transaction_id) WHERE square_transaction_id IS NOT NULL;

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 12: appointments
-- Scheduling — 8 appointment types, technician assignment
-- record_id nullable (appointment can precede record creation)
-- ============================================================================

CREATE TABLE appointments (
    id                  SERIAL PRIMARY KEY,
    customer_id         INT                     NOT NULL REFERENCES customers(id),
    unit_id             INT                     REFERENCES units(id),
    record_id           INT                     REFERENCES records(id),
    appointment_type    appointment_type_type   NOT NULL,
    scheduled_at        TIMESTAMPTZ             NOT NULL,
    duration_minutes    INT,
    technician_id       INT                     REFERENCES technicians(id),
    status              appointment_status_type NOT NULL DEFAULT 'scheduled',
    dropoff_notes       TEXT,
    pickup_notes        TEXT,
    internal_notes      TEXT,
    reminder_sent       BOOLEAN                 NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_appointments_customer_id ON appointments (customer_id);
CREATE INDEX idx_appointments_unit_id ON appointments (unit_id);
CREATE INDEX idx_appointments_record_id ON appointments (record_id);
CREATE INDEX idx_appointments_technician_id ON appointments (technician_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments (scheduled_at);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_deleted_at ON appointments (deleted_at);

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 13: communication_log
-- Append-only log of all outbound text/email messages
-- No updates or deletes — full message history preserved
-- ============================================================================

CREATE TABLE communication_log (
    id                  SERIAL PRIMARY KEY,
    customer_id         INT                     NOT NULL REFERENCES customers(id),
    record_id           INT                     REFERENCES records(id),
    channel             comm_channel_type       NOT NULL,
    trigger_event       VARCHAR(100)            NOT NULL,
    message_content     TEXT                    NOT NULL,
    sent_at             TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    delivery_status     delivery_status_type    NOT NULL DEFAULT 'sent',
    is_manual           BOOLEAN                 NOT NULL DEFAULT FALSE,
    sent_by_user_id     INT                     REFERENCES users(id),
    created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_comm_log_customer_id ON communication_log (customer_id);
CREATE INDEX idx_comm_log_record_id ON communication_log (record_id);
CREATE INDEX idx_comm_log_sent_at ON communication_log (sent_at);
CREATE INDEX idx_comm_log_trigger_event ON communication_log (trigger_event);
CREATE INDEX idx_comm_log_delivery_status ON communication_log (delivery_status);

CREATE TRIGGER trg_comm_log_updated_at
    BEFORE UPDATE ON communication_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 14: storage_billing
-- Recurring storage billing per customer/space
-- Billing managed via Square; ERP holds reference data
-- ============================================================================

CREATE TABLE storage_billing (
    id                      SERIAL PRIMARY KEY,
    customer_id             INT             NOT NULL REFERENCES customers(id),
    unit_id                 INT             REFERENCES units(id),
    space_id                INT             REFERENCES storage_spaces(id),
    monthly_rate            DECIMAL(10,2)   NOT NULL,
    billing_start_date      DATE            NOT NULL,
    billing_end_date        DATE,
    due_day                 INT             NOT NULL DEFAULT 1,
    square_customer_id      VARCHAR(200),
    square_sub_id           VARCHAR(200),
    notes                   TEXT,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_storage_billing_customer_id ON storage_billing (customer_id);
CREATE INDEX idx_storage_billing_unit_id ON storage_billing (unit_id);
CREATE INDEX idx_storage_billing_space_id ON storage_billing (space_id);
CREATE INDEX idx_storage_billing_active ON storage_billing (billing_end_date) WHERE billing_end_date IS NULL;
CREATE INDEX idx_storage_billing_deleted_at ON storage_billing (deleted_at);

CREATE TRIGGER trg_storage_billing_updated_at
    BEFORE UPDATE ON storage_billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
