-- ============================================================================
-- Migration 006: Add monthly storage rates to system_settings
-- ============================================================================

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('outdoor_monthly_rate', '150.00', 'Monthly outdoor storage rate per space'),
    ('indoor_monthly_rate',  '250.00', 'Monthly indoor storage rate per space')
ON CONFLICT (setting_key) DO NOTHING;
