// Log any uncaught errors so Railway deploy logs show the real cause
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ quiet: true });

const { requireAuth, requireRole } = require('./middleware/auth');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://mastertech-erp.vercel.app',
  'https://mastertech-erp-production-cb96.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Calendar status — public, right after health check
app.get('/api/calendar/status', async (req, res) => {
  const pool = require('./db/pool');
  try {
    const { rows } = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'google_calendar_tokens'");
    const connected = rows.length > 0 && !!rows[0].setting_value;
    res.json({ connected });
  } catch { res.json({ connected: false }); }
});

// Auth routes (no auth required for login/seed-admin)
app.use('/api/auth', require('./routes/auth'));

// Public routes (no auth)
app.use('/api/records/approve', require('./routes/estimate-approval')); // Customer clicks from email

// Protected API routes — all require authentication
app.use('/api/records', requireAuth, require('./routes/records'));
app.use('/api/records', requireAuth, require('./routes/freight'));
app.use('/api/labor', requireAuth, require('./routes/labor'));
app.use('/api/parts', requireAuth, require('./routes/parts'));
app.use('/api/payments/online', require('./routes/poyntPayments')); // public link routes + admin (auth inside)
app.use('/api/payments', requireAuth, require('./routes/payments'));
app.use('/api/customers', requireAuth, require('./routes/customers'));
app.use('/api/units', requireAuth, require('./routes/units'));
app.use('/api/technicians', requireAuth, require('./routes/technicians'));
app.use('/api/inventory', requireAuth, require('./routes/inventory'));
app.use('/api/inventory-categories', requireAuth, require('./routes/inventoryCategories'));
app.use('/api/vendors', requireAuth, require('./routes/vendors'));
app.use('/api/appointments', requireAuth, require('./routes/appointments'));
app.use('/api/communications', requireAuth, require('./routes/communications'));
app.use('/api/square/pos', require('./routes/square-pos')); // POS checkout — callback is public, other routes use requireRole internally
app.use('/api/square/terminal', requireAuth, require('./routes/square-terminal'));
app.use('/api/square/webhook', require('./routes/square-webhook')); // No auth — Square calls directly
app.use('/api/square', requireAuth, require('./routes/square'));
app.use('/api/quickbooks', requireAuth, require('./routes/quickbooks'));
app.use('/api/storage', requireAuth, require('./routes/storage'));
app.use('/api/estimates', requireAuth, require('./routes/estimates'));
app.use('/api/marketing', requireAuth, require('./routes/marketing'));
app.use('/api/vendors', requireAuth, require('./routes/vendors'));
app.use('/api/records', requireAuth, require('./routes/photos'));
app.use('/api/parts-sales', requireAuth, require('./routes/partsSales'));
app.use('/api/reports', requireAuth, require('./routes/reports'));
app.use('/api/bookkeeper-adjustments', requireAuth, require('./routes/bookkeeperAdjustments'));
app.use('/api/admin', requireAuth, require('./routes/admin'));
app.use('/api/campaigns', require('./routes/campaigns')); // Unsubscribe is public, rest use requireRole internally
app.use('/api/calendar', require('./routes/calendar')); // OAuth callback is public, rest use requireAuth internally
app.use('/api/leads', require('./routes/leads')); // No auth — public endpoint for website webhook
app.use('/api/twilio', require('./routes/twilioWebhook')); // No auth — Twilio calls directly

// Test email endpoint — quick debug, no auth required
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to;
  if (!to) return res.status(400).json({ error: 'Pass ?to=email@example.com' });

  const { sendAppointmentConfirmation } = require('./services/email');
  console.log('Test email to:', to);
  try {
    const result = await sendAppointmentConfirmation({
      customerName: 'Test Customer',
      customerEmail: to,
      appointmentDate: new Date().toLocaleDateString('en-CA'),
      appointmentTime: '10:00',
      appointmentType: 'drop_off',
      durationMinutes: 60,
      notes: 'This is a test email from the debug endpoint.',
    });
    console.log('Test email result:', JSON.stringify(result));
    res.json({ result });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('{*path}', (req, res, next) => {
    // Don't serve index.html for API routes — let them 404 naturally
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// Run pending migrations on startup
const pool = require('./db/pool');
(async () => {
  try {
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS job_description TEXT');
    await pool.query("ALTER TYPE appointment_status_type ADD VALUE IF NOT EXISTS 'arrived'");
    // Migration 025: fix appointment type enum
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'drop_off'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'pick_up'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'storage'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_repair'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_service'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'parts'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'other'");
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00');
    await pool.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS discount_description VARCHAR(255)");
    await pool.query(`CREATE TABLE IF NOT EXISTS inventory_categories (
      id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, prefix VARCHAR(10) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`INSERT INTO inventory_categories (name, prefix) VALUES
      ('Airstream','AS'),('Awning','AWN'),('Battery','BAT'),('Doors/Windows','DOOR'),
      ('Electrical','ELEC'),('Hardware','HDWR'),('HVAC','HVAC'),('Misc/Shop Supplies','MISC'),
      ('Plumbing','PLMB'),('Roofing','ROOF'),('Solar','SOLR'),('Suspension','SUSP'),('Towing/Chassis','TOW')
      ON CONFLICT (prefix) DO NOTHING`);
    // Migration 024: estimate approval + photos
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token UUID DEFAULT gen_random_uuid()');
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS approval_token_expires_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS approved_by_customer_at TIMESTAMPTZ');
    await pool.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS approved_by_customer_ip VARCHAR(50)");
    await pool.query(`CREATE TABLE IF NOT EXISTS record_photos (
      id SERIAL PRIMARY KEY, record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
      category VARCHAR(20), label VARCHAR(255), onedrive_url TEXT NOT NULL,
      created_by INTEGER, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Migration 026: parts sales
    await pool.query(`CREATE TABLE IF NOT EXISTS parts_sales (
      id SERIAL PRIMARY KEY, sale_number VARCHAR(20) UNIQUE, customer_id INTEGER REFERENCES customers(id),
      customer_name VARCHAR(255), sale_date TIMESTAMPTZ DEFAULT NOW(), status VARCHAR(20) DEFAULT 'open',
      subtotal DECIMAL(10,2) DEFAULT 0, tax_amount DECIMAL(10,2) DEFAULT 0, tax_rate DECIMAL(5,4) DEFAULT 0.0975,
      cc_fee_amount DECIMAL(10,2) DEFAULT 0, cc_fee_applied BOOLEAN DEFAULT false,
      discount_amount DECIMAL(10,2) DEFAULT 0, discount_description VARCHAR(255),
      total_amount DECIMAL(10,2) DEFAULT 0, amount_paid DECIMAL(10,2) DEFAULT 0, amount_due DECIMAL(10,2) DEFAULT 0,
      payment_method VARCHAR(50), payment_reference VARCHAR(100), notes TEXT,
      created_by INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS parts_sale_lines (
      id SERIAL PRIMARY KEY, parts_sale_id INTEGER REFERENCES parts_sales(id) ON DELETE CASCADE,
      inventory_item_id INTEGER REFERENCES inventory(id), is_inventory_item BOOLEAN DEFAULT false,
      part_number VARCHAR(100), description TEXT NOT NULL, quantity INTEGER DEFAULT 1,
      unit_price DECIMAL(10,2) DEFAULT 0, line_total DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Migration 027: email campaigns
    await pool.query(`CREATE TABLE IF NOT EXISTS email_campaigns (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, template_type VARCHAR(50) NOT NULL,
      subject VARCHAR(255) NOT NULL, body_html TEXT NOT NULL, status VARCHAR(20) DEFAULT 'draft',
      target_filter JSONB, recipient_count INTEGER DEFAULT 0, sent_count INTEGER DEFAULT 0,
      scheduled_at TIMESTAMPTZ, sent_at TIMESTAMPTZ, created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS email_campaign_recipients (
      id SERIAL PRIMARY KEY, campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
      customer_id INTEGER REFERENCES customers(id), email VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255), status VARCHAR(20) DEFAULT 'pending',
      sent_at TIMESTAMPTZ, error_message TEXT
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS email_unsubscribes (
      id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES customers(id), unsubscribed_at TIMESTAMPTZ DEFAULT NOW(),
      reason VARCHAR(255)
    )`);
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_invalid_date TIMESTAMPTZ');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_opt_out_date TIMESTAMPTZ');
    await pool.query('ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS no_charge BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE units ADD COLUMN IF NOT EXISTS linear_feet DECIMAL(6,1)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255)');
    await pool.query('ALTER TABLE storage_spaces ADD COLUMN IF NOT EXISTS linear_feet DECIMAL(6,1)');
    await pool.query('ALTER TABLE system_settings ALTER COLUMN setting_value TYPE TEXT');
    await pool.query('ALTER TABLE technicians ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(8,2) DEFAULT 0');
    // Migration 036: payment reminders
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS payment_pending_since TIMESTAMPTZ');
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0');
    await pool.query(`INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('payment_reminders_enabled', 'true', 'Enable automatic payment reminder emails and texts'),
      ('payment_reminders_last_run', '', 'Timestamp of last payment reminder cron run'),
      ('payment_reminders_last_run_count', '0', 'Number of reminders sent in last cron run')
      ON CONFLICT (setting_key) DO NOTHING`);
    await pool.query("UPDATE records SET payment_pending_since = updated_at WHERE status = 'payment_pending' AND payment_pending_since IS NULL");
    // Migration 038: add 'filed' to record status enum
    await pool.query("ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'filed'");
    // Migration 039: bookkeeper adjustments
    await pool.query(`CREATE TABLE IF NOT EXISTS bookkeeper_adjustments (
      id SERIAL PRIMARY KEY,
      period_label VARCHAR(100) NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      adjustment_amount NUMERIC(12,2) NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS bookkeeper_adjustments_period_idx ON bookkeeper_adjustments (period_start, period_end)');
    // Migration 040: SMS opt-out + appointment reminder tracking
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT false');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_out_date TIMESTAMPTZ');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_reminder_sent BOOLEAN DEFAULT false');
    // Migration 041: online payments (Poynt / GoDaddy Payments)
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS payment_token UUID');
    await pool.query(`CREATE TABLE IF NOT EXISTS online_payments (
      id SERIAL PRIMARY KEY,
      payment_token UUID UNIQUE NOT NULL,
      record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL,
      payment_type VARCHAR(32) NOT NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'pending',
      customer_email VARCHAR(255),
      transaction_id VARCHAR(128),
      error_message TEXT,
      created_by_user_id INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS online_payments_record_idx ON online_payments (record_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS online_payments_status_idx ON online_payments (status)');
    console.log('Migration check: all pending migrations applied');
  } catch (err) {
    console.error('Migration check error (non-fatal):', err.message);
  }
})();

// Start daily campaign send cron job
const { startDailyCampaignJob } = require('./jobs/dailyCampaignSend');
startDailyCampaignJob();

const { startReminderCron } = require('./jobs/reminderCron');
startReminderCron();

const { startAppointmentReminderCron } = require('./jobs/appointmentReminderCron');
startAppointmentReminderCron();

// Auto-migrate: create storage_waitlist if missing
require('./db/pool').query(`
  CREATE TABLE IF NOT EXISTS storage_waitlist (
    id              SERIAL PRIMARY KEY,
    customer_id     INT REFERENCES customers(id),
    contact_name    VARCHAR(200),
    contact_phone   VARCHAR(30),
    contact_email   VARCHAR(200),
    space_type      VARCHAR(10) NOT NULL CHECK (space_type IN ('indoor', 'outdoor')),
    rv_year         VARCHAR(4),
    rv_make         VARCHAR(100),
    rv_model        VARCHAR(100),
    rv_length_feet  DECIMAL(6,1),
    preferred_start DATE,
    budget_monthly  DECIMAL(10,2),
    notes           TEXT,
    position        INT,
    status          VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'assigned', 'cancelled')),
    notified_at     TIMESTAMPTZ,
    assigned_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_storage_waitlist_type ON storage_waitlist(space_type);
  CREATE INDEX IF NOT EXISTS idx_storage_waitlist_status ON storage_waitlist(status);
  CREATE INDEX IF NOT EXISTS idx_storage_waitlist_customer ON storage_waitlist(customer_id);
`).then(() => console.log('storage_waitlist table ready'))
  .catch(err => console.error('storage_waitlist migration error:', err.message));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Master Tech ERP API running on port ${PORT}`);
});

module.exports = app;
