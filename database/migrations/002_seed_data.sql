-- ============================================================================
-- Master Tech RV Repair & Storage — ERP Seed Data
-- Migration 002: Initial seed data
-- ============================================================================

BEGIN;

-- ============================================================================
-- System Settings
-- ============================================================================

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('labor_rate',                  '198.00',   'Hourly labor rate in dollars — snapshotted per labor line'),
    ('shop_supplies_rate',          '0.05',     'Shop supplies percentage of labor subtotal (5%)'),
    ('cc_fee_rate',                 '0.03',     'Credit card fee percentage of (labor + parts + shop supplies) (3%)'),
    ('tax_rate',                    '0.0975',   'Sales tax rate on parts only (9.75%)'),
    ('outdoor_storage_daily_rate',  '25.00',    'Daily outdoor storage charge after notice grace period'),
    ('storage_notice_grace_days',   '2',        'Days after completion notice before storage charges begin');

-- ============================================================================
-- Technicians — 3 placeholder technicians
-- ============================================================================

INSERT INTO technicians (name) VALUES
    ('Tech 1'),
    ('Tech 2'),
    ('Tech 3');

-- ============================================================================
-- Storage Spaces — 16 outdoor + 10 indoor = 26 total
-- ============================================================================

INSERT INTO storage_spaces (space_type, label) VALUES
    ('outdoor', 'Outdoor 1'),
    ('outdoor', 'Outdoor 2'),
    ('outdoor', 'Outdoor 3'),
    ('outdoor', 'Outdoor 4'),
    ('outdoor', 'Outdoor 5'),
    ('outdoor', 'Outdoor 6'),
    ('outdoor', 'Outdoor 7'),
    ('outdoor', 'Outdoor 8'),
    ('outdoor', 'Outdoor 9'),
    ('outdoor', 'Outdoor 10'),
    ('outdoor', 'Outdoor 11'),
    ('outdoor', 'Outdoor 12'),
    ('outdoor', 'Outdoor 13'),
    ('outdoor', 'Outdoor 14'),
    ('outdoor', 'Outdoor 15'),
    ('outdoor', 'Outdoor 16'),
    ('indoor', 'Indoor 1'),
    ('indoor', 'Indoor 2'),
    ('indoor', 'Indoor 3'),
    ('indoor', 'Indoor 4'),
    ('indoor', 'Indoor 5'),
    ('indoor', 'Indoor 6'),
    ('indoor', 'Indoor 7'),
    ('indoor', 'Indoor 8'),
    ('indoor', 'Indoor 9'),
    ('indoor', 'Indoor 10');

COMMIT;
