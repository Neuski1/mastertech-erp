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
app.use('/api/storage-contract', require('./routes/storage-contract')); // Public accept/view + auth'd generate/email
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
app.use('/api/partners', requireAuth, require('./routes/partners'));
app.use('/api/purchase-orders', requireAuth, require('./routes/purchaseOrders'));
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
    // Migration 042: storage contract fields on storage_billing
    await pool.query('ALTER TABLE storage_billing ADD COLUMN IF NOT EXISTS contract_token UUID');
    await pool.query('ALTER TABLE storage_billing ADD COLUMN IF NOT EXISTS contract_sent_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE storage_billing ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE storage_billing ADD COLUMN IF NOT EXISTS contract_accepted_ip VARCHAR(50)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_storage_billing_contract_token ON storage_billing (contract_token) WHERE contract_token IS NOT NULL');
    // Migration 043: partners CRM table
    await pool.query(`CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      business_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      contact_phone VARCHAR(100),
      website VARCHAR(255),
      contact_name VARCHAR(255),
      email VARCHAR(255),
      date_contacted DATE,
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_partners_status ON partners (status)');
    // Migration 044: partner activity log
    await pool.query(`CREATE TABLE IF NOT EXISTS partner_activities (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      activity_type VARCHAR(30) NOT NULL DEFAULT 'note',
      contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      summary TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_partner_activities_partner ON partner_activities (partner_id)');
    // One-time: clear old partner seed if it ran (A-Discount Storage was in old list but not new)
    const hasOld = await pool.query("SELECT 1 FROM partners WHERE business_name = 'A-Discount Storage' LIMIT 1");
    if (hasOld.rows.length > 0) { await pool.query('TRUNCATE partners RESTART IDENTITY'); }
    // Seed partner data from Carol's updated spreadsheet (only if table is empty)
    const partnerCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM partners');
    if (partnerCount.rows[0].cnt === 0) {
      const seedResult = await pool.query(`
        INSERT INTO partners (business_name, location, contact_phone, website, contact_name, email, notes, status) VALUES
        ('Ralston Valley RV & Boat Storage', 'Arvada, CO 80007', '720-362-1000 / 720-315-3228', 'https://www.rentrvstorage.com', 'Allison D. Farr (Owner) and Chris Farr', NULL, 'They offer service and maintenance on site', 'new'),
        ('Recreational Storage Solutions', 'Erie, CO', '303-727-0242', 'https://www.rvstorage-denver.com', 'Don Eyman (President)', 'info@rsscolorado.com', 'Locally owned 34-acre RV/boat storage facility. Premium amenities.', 'new'),
        ('Aspen RV & Boat Storage', 'Aurora, CO 80011', '303-344-2776', 'https://www.aspenrvandboat.com', 'Ken Allen (Manager)', NULL, 'Class A RV & boat storage, centrally located in Denver metro.', 'new'),
        ('Henderson Mini Storage', 'Henderson, CO 80640 (11905 E 124th Ave)', '303-905-1714 / 720-512-7962', 'https://rockportstoragecolorado.com', 'Joseph G. Harrington (Owner)', 'rockportstorage2@gmail.com', 'Local facility offering RV storage, outside units, dump station.', 'new'),
        ('Dodos RV Storage', '6325 W 56th Ave, Arvada', '303-881-1921 / 303-239-6789', 'https://dodostorage.com', 'Janet Marie Acree (Owner)', 'janddprimmer@gmail.com', NULL, 'new'),
        ('RV There Storage', '2905 Co Rd 41, Hudson', '303-536-0614', 'rvtherestorage.com', 'Glenda Woodward & Mark Woodward', NULL, NULL, 'new'),
        ('ATS RV Park / Co Signal', '5650 W 60th Ave, Arvada', '303-431-4297', 'https://atsrvpark.com', NULL, NULL, NULL, 'new'),
        ('Colorado Signal Co/Adults Toy Storage', '3800 E 64th Ave, Commerce City', '720-520-6300', 'https://atsrvpark.com', 'Debra Kay Purcella (Registered Agent)', NULL, 'Two locations - Commerce City and Arvada. Adults Toy Storage (ATS)', 'new'),
        ('IN RV Storage', '7500 Washington St, Denver', '303-287-1152', 'https://inselfstorage.com', 'Sheila Mae (Site Manager)', NULL, NULL, 'new'),
        ('Pink Door Storage', '5775 Tennyson St, Arvada', '720-204-5458', 'https://pinkdoorstorage.com', 'Mandy McBride (Manager)', NULL, 'Self Storage Consulting Group, LLC 844-879-7724 Based in Gilbert, AZ', 'new'),
        ('Arvada Boat & RV Storage', '8850 Indiana St, Arvada', '720-399-6214', 'https://arvadarvboatstorage.com', 'Gerald Pickelo Nunez (Registered Agent)', NULL, NULL, 'new'),
        ('Chambers Road RV Storage', '2700 Chambers Rd, Aurora', '303-360-0808', 'https://www.chambersroadrv.com', 'Ronald Pietrafeso (Owner/Manager)', NULL, 'lane@johnstowinginc.org', 'new'),
        ('Clary RV Storage', '15555 E Colfax, Aurora', '303-364-1693', NULL, 'Vicki Reavis (Owner)', NULL, 'Jeanie might be at front desk', 'new'),
        ('Honey Bee RV Storage', '2360 S. Rome Way', '970-699-3252', 'https://honeybeerv.com', 'Jason local contact', NULL, 'Macritchie Group in Illinois owns them', 'new'),
        ('RV Vault', '2151 S Rome Way, Aurora', '720-903-2119', 'https://rvvaultstorage.com', NULL, NULL, NULL, 'new'),
        ('Ridge Valley Storage', '5300 Gray Ct, Arvada', '303-786-7348', 'https://ridgevalleystorage.com', NULL, NULL, NULL, 'new'),
        ('Main St. Storage', '728 S Main St, Brighton', '720-980-1444', 'https://www.mainstreetrvstorage.com', 'Sarah K. Mihalcin (Registered Agent)', NULL, NULL, 'new'),
        ('A Toy Box Storage', '8021 E 100th Ave, Henderson', '303-288-6622', NULL, 'Robin Hackett, Owner', NULL, NULL, 'new'),
        ('Skyline RV & Boat Storage', '13546 County Road 8', '720-400-3922', 'skylinervboatstorage.com', NULL, NULL, NULL, 'new')
      `);
      console.log('Seeded', seedResult.rowCount, 'partner records');
    }
    // Migration 045: customer documents table (stores signed contracts, etc.)
    await pool.query(`CREATE TABLE IF NOT EXISTS customer_documents (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      doc_type VARCHAR(50) NOT NULL DEFAULT 'contract',
      title VARCHAR(255) NOT NULL,
      file_data BYTEA NOT NULL,
      mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
      file_size INTEGER,
      related_id INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customer_documents_customer ON customer_documents (customer_id)');

    // Migration 046: purchase orders and line items (Supplier Module)
    await pool.query(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      vendor VARCHAR(255) NOT NULL,
      order_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      subtotal NUMERIC(10,2) DEFAULT 0,
      shipping_cost NUMERIC(10,2) DEFAULT 0,
      total NUMERIC(10,2) DEFAULT 0,
      order_number VARCHAR(100),
      tracking_number VARCHAR(255),
      notes TEXT,
      received_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders (vendor)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders (status)');

    await pool.query(`CREATE TABLE IF NOT EXISTS po_line_items (
      id SERIAL PRIMARY KEY,
      po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      inventory_item_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
      description VARCHAR(500) NOT NULL,
      vendor_part_number VARCHAR(100),
      qty INTEGER NOT NULL DEFAULT 1,
      cost_each NUMERIC(10,2) NOT NULL DEFAULT 0,
      line_total NUMERIC(10,2) NOT NULL DEFAULT 0,
      matched BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_po_line_items_po ON po_line_items (po_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_po_line_items_inventory ON po_line_items (inventory_item_id)');

    // Migration 047: vendor_details table (website URLs, contact info for suppliers)
    await pool.query(`CREATE TABLE IF NOT EXISTS vendor_details (
      id SERIAL PRIMARY KEY,
      vendor_name VARCHAR(255) NOT NULL UNIQUE,
      website VARCHAR(500),
      contact_name VARCHAR(255),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      account_number VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    // Seed known suppliers
    await pool.query(`INSERT INTO vendor_details (vendor_name, website) VALUES
      ('NTP/Stag', 'https://www.viantp.com'),
      ('Amazon Business', 'https://www.amazon.com'),
      ('etrailer', 'https://www.etrailer.com')
      ON CONFLICT (vendor_name) DO NOTHING`);

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
`).then(() => {
  console.log('storage_waitlist table ready');
  // Seed initial waitlist entries from Carol's spreadsheet (only if table is empty)
  require('./db/pool').query(`
    INSERT INTO storage_waitlist (contact_name, space_type, rv_length_feet, position, status)
    SELECT v.contact_name, v.space_type, v.rv_length_feet, v.position, 'waiting'
    FROM (VALUES
      ('Mark Cohen',   'indoor',  22.0, 1),
      ('Alexis Byler', 'indoor',  19.0, 2),
      ('Adam Smith',   'indoor',  24.0, 3),
      ('Jay Phelps',   'outdoor', 20.0, 4),
      ('Mark Nichols',  'indoor',  33.0, 5)
    ) AS v(contact_name, space_type, rv_length_feet, position)
    WHERE NOT EXISTS (SELECT 1 FROM storage_waitlist LIMIT 1)
  `).then(r => { if (r.rowCount > 0) console.log('Seeded', r.rowCount, 'waitlist entries'); })
    .catch(err => console.error('waitlist seed error:', err.message));
}).catch(err => console.error('storage_waitlist migration error:', err.message));


const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Master Tech ERP API running on port ${PORT}`);
});

module.exports = app;
