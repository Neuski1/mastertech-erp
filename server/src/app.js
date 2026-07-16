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

// The Square SDK returns monetary amounts as BigInt, which JSON.stringify
// cannot serialize by default. Make BigInt serialize as a Number app-wide.
BigInt.prototype.toJSON = function () { return Number(this); };

const { requireAuth, requireAuthOrApiKey, requireRole } = require('./middleware/auth');

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
  res.json({
    status: 'ok',
    timestamp: new Date(),
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'unknown',
    branch: process.env.RAILWAY_GIT_BRANCH || 'unknown',
  });
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
app.use('/api/appointments/reschedule', require('./routes/appointmentReschedule')); // Public reschedule-request form from confirmation email
app.use('/api/estimate-lines/approve', require('./routes/estimate-line-approval')); // Line-level approval from email
app.use('/api/public/records', require('./routes/publicPhotos')); // Token-protected photo links in customer emails

// Protected API routes — all require authentication
app.use('/api/records', requireAuth, require('./routes/records'));
app.use('/api/records', requireAuth, require('./routes/freight'));
app.use('/api/labor', requireAuth, require('./routes/labor'));
app.use('/api/parts', requireAuth, require('./routes/parts'));
app.use('/api/parts-on-order', requireAuth, require('./routes/partsOnOrder'));
app.use('/api/payments/online', require('./routes/poyntPayments')); // public link routes + admin (auth inside)
app.use('/api/payments', requireAuth, require('./routes/payments'));
app.use('/api/customers', requireAuth, require('./routes/customers'));
app.use('/api/units', requireAuth, require('./routes/units'));
app.use('/api/technicians', requireAuth, require('./routes/technicians'));
app.use('/api/inventory', requireAuth, require('./routes/inventory'));
app.use('/api/inventory-categories', requireAuth, require('./routes/inventoryCategories'));
app.use('/api/vendors', requireAuth, require('./routes/vendors'));
app.use('/api/suppliers', requireAuth, require('./routes/suppliers'));
app.use('/api/appointments', requireAuth, require('./routes/appointments'));
app.use('/api/communications', requireAuth, require('./routes/communications'));
app.use('/api/square/pos', require('./routes/square-pos')); // POS checkout — callback is public, other routes use requireRole internally
app.use('/api/square/terminal', requireAuth, require('./routes/square-terminal'));
app.use('/api/square/webhook', require('./routes/square-webhook')); // No auth — Square calls directly
app.use('/api/square', requireAuth, require('./routes/square'));
app.use('/api/quickbooks', requireAuth, require('./routes/quickbooks'));
app.use('/api/plaid/webhook', require('./routes/plaid-webhook')); // No auth — Plaid calls webhook directly
app.use('/api/plaid', requireAuth, require('./routes/plaid'));
app.use('/api/storage', requireAuth, require('./routes/storage'));
app.use('/api/storage-contract', require('./routes/storage-contract')); // Public accept/view + auth'd generate/email
app.use('/api/estimates', requireAuth, require('./routes/estimates'));
app.use('/api/marketing', requireAuth, require('./routes/marketing'));
app.use('/api/vendors', requireAuth, require('./routes/vendors'));
app.use('/api/records', requireAuth, require('./routes/photos'));
app.use('/api/records', requireAuth, require('./routes/recordDocuments'));
app.use('/api/parts-sales', requireAuth, require('./routes/partsSales'));
app.use('/api/reports', requireAuth, require('./routes/reports'));
app.use('/api/bookkeeper-adjustments', requireAuth, require('./routes/bookkeeperAdjustments'));
app.use('/api/bookkeeping', requireAuth, require('./routes/bookkeeping'));
app.use('/api/bookkeeping/storage-revenue', (req, res, next) => {
  const ck = req.headers['x-cowork-key'];
  if (ck && process.env.COWORK_API_KEY && ck === process.env.COWORK_API_KEY) return next();
  return requireAuth(req, res, next);
}, require('./routes/storage-revenue'));
app.use('/api/admin', requireAuth, require('./routes/admin'));
app.use('/api/cowork-admin', require('./routes/cowork-admin')); // API-key auth, separate from JWT
app.use('/api/campaigns', require('./routes/campaigns')); // Unsubscribe is public, rest use requireRole internally
app.use('/api/calendar', require('./routes/calendar')); // OAuth callback is public, rest use requireAuth internally
app.use('/api/partners', requireAuth, require('./routes/partners'));
// Automated order import (X-Cowork-Key auth, like cowork-admin). Mounted BEFORE
// the JWT-protected router so /import-parsed uses the agent key; all other
// /api/purchase-orders/* paths fall through unchanged.
app.use('/api/purchase-orders', require('./routes/purchaseOrdersImport'));
app.use('/api/purchase-orders', requireAuthOrApiKey, require('./routes/purchaseOrders'));
app.use('/api/leads', require('./routes/leads')); // No auth — public endpoint for website webhook
app.use('/api/dialpad', require('./routes/dialpadWebhook')); // No auth — Dialpad calls directly

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
    // Reschedule-request flow (customer 'Request a Different Time' button)
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_token UUID DEFAULT gen_random_uuid()');
    await pool.query('UPDATE appointments SET reschedule_token = gen_random_uuid() WHERE reschedule_token IS NULL');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_appt_reschedule_token ON appointments(reschedule_token)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_status VARCHAR(20)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_date DATE');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_requested_time TIME');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_note TEXT');
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
      status VARCHAR(30) NOT NULL DEFAULT 'draft',
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

    // Migration 053 (Phase 2): PO engine columns. The status CHECK constraint,
    // pending->draft migration and FK constraints are authored in
    // 053_po_engine.sql; here we only guarantee the columns exist and the
    // default is 'draft' so the app never boots short a column.
    await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS expected_date DATE`);
    await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ`);
    await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS order_email_msg_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_number VARCHAR(50)`);
    await pool.query(`ALTER TABLE purchase_orders ALTER COLUMN status SET DEFAULT 'draft'`);
    await pool.query(`ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS record_parts_line_id INTEGER`);
    await pool.query(`ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS qty_received NUMERIC(10,2) NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS source VARCHAR(20)`);

    // Migration 052 (Phase 1): suppliers table. Formerly `vendor_details`;
    // renamed and consolidated with `vendors`. The heavy one-time data merge
    // (folding in `vendors`, adding supplier_id FKs, backfilling) lives in the
    // numbered migration 052_suppliers_consolidation.sql. This inline block
    // only guarantees the table + columns exist so the app never boots against
    // a missing/stale schema.
    await pool.query(`DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_details')
           AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
          ALTER TABLE vendor_details RENAME TO suppliers;
        END IF;
      END $$;`);
    await pool.query(`CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      website VARCHAR(500),
      contact_name VARCHAR(255),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      account_number VARCHAR(100),
      notes TEXT,
      supplier_type VARCHAR(20) NOT NULL DEFAULT 'inventory',
      subcategory VARCHAR(100),
      default_ship_days INTEGER,
      order_method VARCHAR(20),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'vendor_name')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'name') THEN
          ALTER TABLE suppliers RENAME COLUMN vendor_name TO name;
        END IF;
      END $$;`);
    await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS supplier_type VARCHAR(20) NOT NULL DEFAULT 'inventory'`);
    await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)`);
    await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS default_ship_days INTEGER`);
    await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS order_method VARCHAR(20)`);
    await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    // supplier_id FKs on the consuming tables (columns only; constraints +
    // backfill are handled in migration 052 so the app stays functional even
    // if the numbered migration hasn't been run yet).
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS supplier_id INTEGER`);
    await pool.query(`ALTER TABLE parts_catalog ADD COLUMN IF NOT EXISTS supplier_id INTEGER`);
    await pool.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS supplier_id INTEGER`);
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS supplier_id INTEGER`);

    // Seed known suppliers
    await pool.query(`INSERT INTO suppliers (name, website) VALUES
      ('NTP/Stag', 'https://www.viantp.com'),
      ('Amazon Business', 'https://www.amazon.com'),
      ('etrailer', 'https://www.etrailer.com')
      ON CONFLICT (name) DO NOTHING`);

    // Migration 048: parts-on-order tracking fields for customer-specific parts
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'not_ordered'`);
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_eta DATE`);
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_supplier VARCHAR(255)`);
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_number VARCHAR(100)`);
    await pool.query(`ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_tracking VARCHAR(255)`);

    // Migration 049 (supplier_type + subcategory) folded into the suppliers
    // block above; the 3 seeded suppliers already default to supplier_type='inventory'.

    // Migration 050: reorder tracking on inventory
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_status VARCHAR(20) DEFAULT NULL`);
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_date DATE DEFAULT NULL`);
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_note TEXT DEFAULT NULL`);
    // Migration 052: per-part pricing notes (used on the Edit Part form to compare supplier prices)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS pricing_notes TEXT DEFAULT NULL`);
    // Migration 053: expand appointment_type enum with the more specific
    // pickup/drop-off and diagnostics/estimate categories so the Schedule
    // dropdown can split out the workflows the shop actually uses.
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'storage_pickup'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'storage_drop_off'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_service_pickup'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_service_drop_off'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_diagnostics'");
    await pool.query("ALTER TYPE appointment_type_type ADD VALUE IF NOT EXISTS 'rv_estimate_build'");
    // Migration 054: customers can have a second email on file (used as an
    // alternate point of contact, surfaced everywhere email_primary is).
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_secondary VARCHAR(255)');
    // Migration 056: snapshot the supplier/mfr part number on the parts line
    // when a part is pulled from inventory. Used only for in-app verification
    // by service writers (so they don't have to bounce to the inventory
    // module). Intentionally never printed on the customer-facing work order.
    await pool.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS vendor_part_number VARCHAR(100)');
    // Migration 059: per-billing custom contract terms. Carol asked for a
    // way to edit the contract before sending; rather than rewrite the
    // boilerplate (legal consistency matters), we add a free-form text
    // block she can fill in. It renders as a clearly labeled callout in
    // the contract view between the lessee/RV fields and the standard
    // terms list. Blank means "use defaults only".
    await pool.query('ALTER TABLE storage_billing ADD COLUMN IF NOT EXISTS special_terms TEXT');
    // Migration 058: backfill customer records (and units) for waitlist
    // entries that were added before the auto-create-on-waitlist change.
    // Old entries stored contact_name/email/phone and rv_* on the waitlist
    // row only, never landing in customers or units. That broke both the
    // customer search and the unit dropdown in the assign-storage flow.
    try {
      const { rows: orphans } = await pool.query(`
        SELECT id, contact_name, contact_phone, contact_email,
               rv_year, rv_make, rv_model, rv_length_feet
          FROM storage_waitlist
         WHERE customer_id IS NULL
           AND contact_name IS NOT NULL
           AND status IN ('waiting', 'notified')
      `);
      for (const w of orphans) {
        const parts = (w.contact_name || '').trim().split(/\s+/);
        const firstName = parts.length > 1 ? parts[0] : '';
        const lastName  = parts.length > 1 ? parts.slice(1).join(' ') : (parts[0] || 'Waitlist');
        const numRes = await pool.query(
          "SELECT account_number FROM customers WHERE account_number ~ '^[0-9]+$' ORDER BY account_number::int DESC LIMIT 1"
        );
        const nextNum = numRes.rows.length > 0 ? parseInt(numRes.rows[0].account_number) + 1 : 1001;
        const { rows: cust } = await pool.query(
          `INSERT INTO customers (account_number, first_name, last_name, phone_primary, email_primary)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [String(nextNum), firstName || null, lastName, w.contact_phone || null, w.contact_email || null]
        );
        const newCustomerId = cust[0].id;
        await pool.query(
          'UPDATE storage_waitlist SET customer_id = $1 WHERE id = $2',
          [newCustomerId, w.id]
        );
        // Backfill unit too, if any RV info on the waitlist row.
        if (w.rv_year || w.rv_make || w.rv_model || w.rv_length_feet) {
          try {
            await pool.query(
              `INSERT INTO units (customer_id, year, make, model, linear_feet)
               VALUES ($1, $2, $3, $4, $5)`,
              [newCustomerId, w.rv_year || null, w.rv_make || null, w.rv_model || null,
               w.rv_length_feet ? parseFloat(w.rv_length_feet) : null]
            );
          } catch (uErr) { console.error('[migration 058] unit backfill error:', uErr.message); }
        }
      }
      if (orphans.length > 0) console.log(`[migration 058] backfilled ${orphans.length} waitlist customer+unit record(s)`);
    } catch (e) { console.error('[migration 058] error:', e.message); }
    // Migration 057: backfill the new vendor_part_number column on existing
    // parts lines from the linked inventory row so older WOs also display
    // the supplier/MPN, not just lines added after migration 056 deployed.
    await pool.query(`
      UPDATE record_parts_lines rpl
         SET vendor_part_number = inv.vendor_part_number
        FROM inventory inv
       WHERE rpl.vendor_part_number IS NULL
         AND rpl.inventory_id = inv.id
         AND inv.vendor_part_number IS NOT NULL
    `);

    // Migration 055: backfill missing storage_payment_status rows for active
    // billings that never got a row in Jan-May 2026. Carol confirmed every
    // active box was paid these months; the rows were missing because Square
    // only syncs boxes with active Square subscriptions, leaving cash/check
    // payers off the grid entirely. Marking source='manual' so a future
    // Square sync can't clobber these. ON CONFLICT keeps existing rows.
    await pool.query(`
      INSERT INTO storage_payment_status
        (storage_billing_id, year, month, status, source, amount)
      VALUES
        (17, 2026, 1, 'paid', 'manual', 132.00),
        (26, 2026, 1, 'paid', 'manual', 660.00),
        (17, 2026, 2, 'paid', 'manual', 132.00),
        (26, 2026, 2, 'paid', 'manual', 660.00),
        (12, 2026, 3, 'paid', 'manual',  96.00),
        (16, 2026, 3, 'paid', 'manual', 120.00),
        (17, 2026, 3, 'paid', 'manual', 132.00),
        (26, 2026, 3, 'paid', 'manual', 660.00),
        (29, 2026, 3, 'paid', 'manual', 418.00),
        (16, 2026, 4, 'paid', 'manual', 120.00),
        (17, 2026, 4, 'paid', 'manual', 132.00),
        (26, 2026, 4, 'paid', 'manual', 660.00),
        (33, 2026, 4, 'paid', 'manual', 150.00),
        (34, 2026, 4, 'paid', 'manual', 150.00),
        (35, 2026, 4, 'paid', 'manual', 150.00),
        (36, 2026, 4, 'paid', 'manual', 150.00),
        (37, 2026, 4, 'paid', 'manual', 132.00),
        (38, 2026, 4, 'paid', 'manual', 150.00),
        (17, 2026, 5, 'paid', 'manual', 132.00),
        (26, 2026, 5, 'paid', 'manual', 660.00)
      ON CONFLICT (storage_billing_id, year, month) DO NOTHING
    `);

    // Migration 056: allow source='auto' on storage_payment_status. The daily
    // backfill cron stubs each active box's current month as unpaid; those
    // stubs must be overwritable by the Square sync, so they can't be 'manual'
    // (which the sync treats as a protected override). 'auto' = system stub.
    await pool.query(`ALTER TABLE storage_payment_status DROP CONSTRAINT IF EXISTS storage_payment_status_source_check`);
    await pool.query(`ALTER TABLE storage_payment_status ADD CONSTRAINT storage_payment_status_source_check CHECK (source IN ('square','manual','auto'))`);

    // Migration 057: make bank-transaction sync idempotent + dedupe-safe. Adds
    // a unique key on raw_transaction_id so re-syncing the same Plaid txn (or a
    // pending txn that later posts) can UPSERT instead of inserting duplicate
    // rows. No existing dupes (verified before ship).
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_raw_transaction_id ON transactions (raw_transaction_id)`);

    // Migration 058: lead call log — a running history of calls/contacts per
    // lead (date + optional note), carried into the customer notes on convert.
    await pool.query(`CREATE TABLE IF NOT EXISTS lead_contacts (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      note TEXT,
      created_by INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_lead_contacts_lead ON lead_contacts (lead_id)`);

    // Migration 051: record_photos — add direct upload columns (table already exists with onedrive_url)
    await pool.query('ALTER TABLE record_photos ALTER COLUMN onedrive_url DROP NOT NULL');
    await pool.query('ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS filename VARCHAR(255)');
    await pool.query('ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS content_type VARCHAR(100) DEFAULT \'image/jpeg\'');
    await pool.query('ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0');
    await pool.query('ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS photo_data BYTEA');
    await pool.query('ALTER TABLE record_photos ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_record_photos_record ON record_photos (record_id)');
    // Migration 059: record_documents — insurance/warranty/other files on a WO.
    await pool.query(`CREATE TABLE IF NOT EXISTS record_documents (
      id SERIAL PRIMARY KEY,
      record_id INTEGER NOT NULL REFERENCES records(id),
      doc_type VARCHAR(30) NOT NULL DEFAULT 'other',
      title VARCHAR(255),
      file_data BYTEA,
      mime_type VARCHAR(100),
      file_size INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_record_documents_record ON record_documents (record_id)');

    // Migration 052: review request tracking (Day-3-after-paid Google review automation)
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE records ADD COLUMN IF NOT EXISTS review_request_sms_sent_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS review_opt_out BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_review_request_at TIMESTAMPTZ');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_records_review_pending ON records (status, paid_at) WHERE review_request_sent_at IS NULL');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_records_review_sms_pending ON records (review_request_sent_at) WHERE review_request_sms_sent_at IS NULL AND review_request_sent_at IS NOT NULL');

    // Migration 059: parts order tracking + email auto-fill (Parts on Order dashboard)
    await pool.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS po_number VARCHAR(50)');
    await pool.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_confirmed_at TIMESTAMPTZ');
    await pool.query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_email_msg_id VARCHAR(255)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parts_po_number ON record_parts_lines (po_number)');
    await pool.query(`CREATE TABLE IF NOT EXISTS order_email_log (
      id SERIAL PRIMARY KEY,
      gmail_msg_id VARCHAR(255) UNIQUE NOT NULL,
      received_at TIMESTAMPTZ,
      from_addr VARCHAR(255),
      subject VARCHAR(500),
      parsed_po VARCHAR(50),
      parsed_json JSONB,
      match_status VARCHAR(20) NOT NULL DEFAULT 'unmatched',
      matched_line_id INTEGER REFERENCES record_parts_lines(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_order_email_log_status ON order_email_log (match_status)');

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

const { startReviewRequestCron } = require('./jobs/reviewRequestCron');
startReviewRequestCron();

const { startStorageStatusBackfillCron } = require('./jobs/storageStatusBackfillCron');
startStorageStatusBackfillCron();

const { startDbBackupCron } = require('./jobs/dbBackupCron');
startDbBackupCron();

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

// Auto-migrate: add 'order_parts' work status (migration 047)
require('./db/pool').query("ALTER TYPE record_status_type ADD VALUE IF NOT EXISTS 'order_parts'")
  .then(() => console.log('order_parts status ready'))
  .catch(err => console.error('order_parts enum migration error:', err.message));

// Auto-migrate: add authorization_number column (migration 049)
require('./db/pool').query('ALTER TABLE records ADD COLUMN IF NOT EXISTS authorization_number VARCHAR(100)')
  .then(() => console.log('records.authorization_number column ready'))
  .catch(err => console.error('authorization_number migration error:', err.message));
require('./db/pool').query('ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS order_date DATE')
  .then(() => console.log('record_parts_lines.order_date column ready'))
  .catch(err => console.error('parts order_date migration error:', err.message));

// Auto-migrate: leads workflow (scheduled status + soft-delete column)
require('./db/pool').query("ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'scheduled'")
  .then(() => console.log('lead scheduled status ready'))
  .catch(err => console.error('lead scheduled enum migration error:', err.message));
require('./db/pool').query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ')
  .then(() => console.log('leads.deleted_at column ready'))
  .catch(err => console.error('leads deleted_at migration error:', err.message));
require('./db/pool').query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ')
  .then(() => console.log('leads.contacted_at column ready'))
  .catch(err => console.error('leads contacted_at migration error:', err.message));


// Migration 043: Estimate line support
require('./db/pool').query(`
  ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE record_labor_lines ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ;
  ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS is_estimate_line BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS customer_approved BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE record_parts_lines ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ;
  CREATE TABLE IF NOT EXISTS estimate_line_approvals (
    id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES records(id),
    approval_token UUID NOT NULL DEFAULT gen_random_uuid(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_ela_token ON estimate_line_approvals(approval_token);
  CREATE INDEX IF NOT EXISTS idx_ela_record ON estimate_line_approvals(record_id);
`).then(() => console.log('Migration 043 (estimate lines) ready'))
  .catch(err => console.error('Migration 043 error:', err.message));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Master Tech ERP API running on port ${PORT}`);
});

module.exports = app;
