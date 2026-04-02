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

// One-time: check status of specific recipients
app.get('/debug/check-recipients', async (req, res) => {
  const pool = require('./db/pool');
  try {
    const emails = [
      'jeffscottherman@icloud.com','chuck.gunning@gmail.com','john.e.bobzien@gmail.com',
      'd.schlotzhauer@comcast.net','rapiland@comcast.net','sthompson@shocooil.com',
      'kellycshelton@comcast.net','claudiamy12@gmail.com','penlynwilson@gmail.com',
      'anne.schmuck@web.de','lindaschofieldmph@gmail.com','jacob.miller@indiecampers.com',
      'rolls3126@comcast.net','jdbobble60@gmail.com','glj@med.unc.edu',
      'davidatchleylamb@gmail.com','bidogrooter01@gmail.com','tomohalloran303@gmail.com',
      'kratish4@gmail.com','olivia.pinon@gmail.com','nginerd2000@yahoo.com',
      'bson702@gmail.com','permits@plumbersv.com','linda.shisler@gmail.com',
      'dapuryear23@gmail.com','ktroxler@aspire-tours.com','busav8r@gmail.com',
      'tgray@aol.com','dj.barajas@southwire.com','davepenajr@outlook.com',
      'service@mastertechrvrepair.com','brecklodging@gmail.com','samuel.rotbart@gmail.com',
      'info@creeksideequestrianco.com','terri.brindley@me.com','alisonroman74@gmail.com',
      'pjdunsuw@gmail.com','ccconcrete84@gmail.com','meleanie@msn.com',
      'markphillips1313@gmail.com','pcallanhome@outlook.com','babur_s@hotmail.com'
    ];
    const placeholders = emails.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await pool.query(
      `SELECT ecr.email, ecr.status, ecr.campaign_id, ec.name AS campaign_name
       FROM email_campaign_recipients ecr
       JOIN email_campaigns ec ON ecr.campaign_id = ec.id
       WHERE LOWER(ecr.email) IN (${placeholders})
       ORDER BY ecr.email, ecr.campaign_id`,
      emails
    );
    const sent = rows.filter(r => r.status === 'sent');
    res.json({ total_matches: rows.length, already_sent: sent.length, sent_list: sent.map(r => r.email), all: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/debug/remove-recipients', async (req, res) => {
  const pool = require('./db/pool');
  try {
    const emails = [
      'jeffscottherman@icloud.com','chuck.gunning@gmail.com','john.e.bobzien@gmail.com',
      'd.schlotzhauer@comcast.net','rapiland@comcast.net','sthompson@shocooil.com',
      'kellycshelton@comcast.net','claudiamy12@gmail.com','penlynwilson@gmail.com',
      'anne.schmuck@web.de','lindaschofieldmph@gmail.com','jacob.miller@indiecampers.com',
      'rolls3126@comcast.net','jdbobble60@gmail.com','glj@med.unc.edu',
      'davidatchleylamb@gmail.com','bidogrooter01@gmail.com','tomohalloran303@gmail.com',
      'kratish4@gmail.com','olivia.pinon@gmail.com','nginerd2000@yahoo.com',
      'bson702@gmail.com','permits@plumbersv.com','linda.shisler@gmail.com',
      'dapuryear23@gmail.com','ktroxler@aspire-tours.com','busav8r@gmail.com',
      'tgray@aol.com','dj.barajas@southwire.com','davepenajr@outlook.com',
      'service@mastertechrvrepair.com','brecklodging@gmail.com','samuel.rotbart@gmail.com',
      'info@creeksideequestrianco.com','terri.brindley@me.com','alisonroman74@gmail.com',
      'pjdunsuw@gmail.com','ccconcrete84@gmail.com','meleanie@msn.com',
      'markphillips1313@gmail.com','pcallanhome@outlook.com','babur_s@hotmail.com'
    ];
    const placeholders = emails.map((_, i) => `$${i + 1}`).join(',');
    // Cancel these from ANY campaign — queued, pending, OR already sent
    const r1 = await pool.query(
      `UPDATE email_campaign_recipients SET status = 'cancelled'
       WHERE LOWER(email) IN (${placeholders}) AND status IN ('queued', 'pending')`,
      emails
    );
    // Show latest campaigns and their statuses
    const { rows: latest } = await pool.query("SELECT id, name, status FROM email_campaigns ORDER BY id DESC LIMIT 5");
    const { rows: statuses } = await pool.query(
      `SELECT campaign_id, status, COUNT(*) AS cnt FROM email_campaign_recipients
       WHERE campaign_id IN (SELECT id FROM email_campaigns ORDER BY id DESC LIMIT 5)
       GROUP BY campaign_id, status ORDER BY campaign_id, status`
    );
    // Show status of each of the 42 emails across all campaigns
    const { rows: detail } = await pool.query(
      `SELECT email, status, campaign_id FROM email_campaign_recipients
       WHERE LOWER(email) IN (${placeholders}) ORDER BY campaign_id, email`,
      emails
    );
    res.json({ removed: r1.rowCount, latest_campaigns: latest, campaign_statuses: statuses, these_42: detail });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// One-time: auto-exclude 42 from campaign 10
app.get('/debug/exclude-42-from-10', async (req, res) => {
  const pool = require('./db/pool');
  try {
    const emails = [
      'jeffscottherman@icloud.com','chuck.gunning@gmail.com','john.e.bobzien@gmail.com',
      'd.schlotzhauer@comcast.net','rapiland@comcast.net','sthompson@shocooil.com',
      'kellycshelton@comcast.net','claudiamy12@gmail.com','penlynwilson@gmail.com',
      'anne.schmuck@web.de','lindaschofieldmph@gmail.com','jacob.miller@indiecampers.com',
      'rolls3126@comcast.net','jdbobble60@gmail.com','glj@med.unc.edu',
      'davidatchleylamb@gmail.com','bidogrooter01@gmail.com','tomohalloran303@gmail.com',
      'kratish4@gmail.com','olivia.pinon@gmail.com','nginerd2000@yahoo.com',
      'bson702@gmail.com','permits@plumbersv.com','linda.shisler@gmail.com',
      'dapuryear23@gmail.com','ktroxler@aspire-tours.com','busav8r@gmail.com',
      'tgray@aol.com','dj.barajas@southwire.com','davepenajr@outlook.com',
      'service@mastertechrvrepair.com','brecklodging@gmail.com','samuel.rotbart@gmail.com',
      'info@creeksideequestrianco.com','terri.brindley@me.com','alisonroman74@gmail.com',
      'pjdunsuw@gmail.com','ccconcrete84@gmail.com','meleanie@msn.com',
      'markphillips1313@gmail.com','pcallanhome@outlook.com','babur_s@hotmail.com'
    ];
    // Find customer IDs for these emails
    const placeholders = emails.map((_, i) => `$${i + 1}`).join(',');
    const { rows: customers } = await pool.query(
      `SELECT id, email_primary FROM customers WHERE LOWER(email_primary) IN (${placeholders})`,
      emails.map(e => e.toLowerCase())
    );
    // Pre-insert as manually_excluded into campaign 10
    let inserted = 0;
    for (const c of customers) {
      try {
        await pool.query(
          `INSERT INTO email_campaign_recipients (campaign_id, customer_id, email, customer_name, status)
           SELECT 10, $1, $2, COALESCE(last_name,'') || COALESCE(', ' || first_name, ''), 'manually_excluded'
           FROM customers WHERE id = $1
           ON CONFLICT DO NOTHING`,
          [c.id, c.email_primary]
        );
        inserted++;
      } catch { /* duplicate or constraint */ }
    }
    res.json({ success: true, matched_customers: customers.length, inserted_exclusions: inserted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// One-time: cancel campaign 9
app.get('/debug/cancel-campaign-9', async (req, res) => {
  const pool = require('./db/pool');
  try {
    const r1 = await pool.query("UPDATE email_campaign_recipients SET status = 'cancelled' WHERE campaign_id = 9 AND status IN ('queued', 'pending')");
    const r2 = await pool.query("UPDATE email_campaigns SET status = 'cancelled' WHERE id = 9");
    const { rows } = await pool.query("SELECT status, COUNT(*) AS cnt FROM email_campaign_recipients WHERE campaign_id = 9 GROUP BY status ORDER BY status");
    res.json({ queued_cancelled: r1.rowCount, campaign_updated: r2.rowCount, final_status: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Campaign debug — right after health check, before any other routes
app.get('/debug/campaigns', async (req, res) => {
  const pool = require('./db/pool');
  const r = {};
  try {
    r.total_customers = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL")).rows[0].c;
    r.have_email = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND email_primary IS NOT NULL AND email_primary != ''")).rows[0].c;
    try { r.opted_out = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND marketing_opt_out = TRUE")).rows[0].c; } catch { r.opted_out = 'col missing'; }
    try { r.email_invalid = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND email_invalid = TRUE")).rows[0].c; } catch { r.email_invalid = 'col missing'; }
    r.active_storage = (await pool.query("SELECT COUNT(DISTINCT customer_id) AS c FROM storage_billing WHERE billing_end_date IS NULL AND deleted_at IS NULL")).rows[0].c;
    r.open_work_orders = (await pool.query("SELECT COUNT(DISTINCT customer_id) AS c FROM records WHERE deleted_at IS NULL AND status NOT IN ('paid','void')")).rows[0].c;
    try {
      r.campaigns = (await pool.query("SELECT id, name, template_type, status, recipient_count, sent_count FROM email_campaigns ORDER BY id")).rows;
      r.recipients_by_status = (await pool.query("SELECT ec.id, ec.name, ecr.status, COUNT(*) AS cnt FROM email_campaigns ec JOIN email_campaign_recipients ecr ON ec.id = ecr.campaign_id GROUP BY ec.id, ec.name, ecr.status ORDER BY ec.id")).rows;
      r.total_sent = (await pool.query("SELECT COUNT(*) AS c FROM email_campaign_recipients WHERE status = 'sent'")).rows[0].c;
    } catch (e) { r.campaign_tables = 'error: ' + e.message; }
    try { r.unsubscribes = (await pool.query("SELECT COUNT(*) AS c FROM email_unsubscribes")).rows[0].c; } catch { r.unsubscribes = 'table missing'; }
    let q = "SELECT COUNT(*) AS c FROM customers c WHERE c.deleted_at IS NULL AND c.email_primary IS NOT NULL AND c.email_primary != ''";
    try { await pool.query('SELECT marketing_opt_out FROM customers LIMIT 1'); q += " AND c.marketing_opt_out IS NOT TRUE AND c.email_invalid IS NOT TRUE"; } catch {}
    q += " AND c.id NOT IN (SELECT DISTINCT customer_id FROM storage_billing WHERE billing_end_date IS NULL AND deleted_at IS NULL)";
    q += " AND c.id NOT IN (SELECT DISTINCT customer_id FROM records WHERE deleted_at IS NULL AND status NOT IN ('paid','void'))";
    r.audience_before_sent_exclusion = (await pool.query(q)).rows[0].c;
    try {
      r.audience_after_seasonal_exclusion = (await pool.query(q + " AND LOWER(c.email_primary) NOT IN (SELECT LOWER(ecr.email) FROM email_campaign_recipients ecr JOIN email_campaigns ec ON ecr.campaign_id = ec.id WHERE ecr.status = 'sent' AND ec.template_type = 'seasonal')")).rows[0].c;
    } catch (e) { r.seasonal_exclusion_error = e.message; }
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message, partial: r }); }
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
app.use('/api/campaigns', require('./routes/campaigns')); // Unsubscribe is public, rest use requireRole internally
app.use('/api/leads', require('./routes/leads')); // No auth — public endpoint for website webhook

// Debug endpoint — campaign recipient diagnostics (no auth, temporary)
app.get('/api/debug/campaign-counts', async (req, res) => {
  const r = {};
  try {
    r.total_customers = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL")).rows[0].c;
    r.have_email = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND email_primary IS NOT NULL AND email_primary != ''")).rows[0].c;
    try { r.opted_out = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND marketing_opt_out = TRUE")).rows[0].c; } catch { r.opted_out = 'column missing'; }
    try { r.email_invalid = (await pool.query("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL AND email_invalid = TRUE")).rows[0].c; } catch { r.email_invalid = 'column missing'; }
    r.active_storage = (await pool.query("SELECT COUNT(DISTINCT customer_id) AS c FROM storage_billing WHERE billing_end_date IS NULL AND deleted_at IS NULL")).rows[0].c;
    r.open_work_orders = (await pool.query("SELECT COUNT(DISTINCT customer_id) AS c FROM records WHERE deleted_at IS NULL AND status NOT IN ('paid','void')")).rows[0].c;
    try {
      r.campaigns = (await pool.query("SELECT id, name, template_type, status, recipient_count, sent_count FROM email_campaigns ORDER BY id")).rows;
      r.recipients_by_status = (await pool.query("SELECT ec.id, ec.name, ecr.status, COUNT(*) AS cnt FROM email_campaigns ec JOIN email_campaign_recipients ecr ON ec.id = ecr.campaign_id GROUP BY ec.id, ec.name, ecr.status ORDER BY ec.id")).rows;
      r.total_sent = (await pool.query("SELECT COUNT(*) AS c FROM email_campaign_recipients WHERE status = 'sent'")).rows[0].c;
      r.sent_emails_match_customers = (await pool.query("SELECT COUNT(DISTINCT c.id) AS c FROM customers c WHERE LOWER(c.email_primary) IN (SELECT LOWER(ecr.email) FROM email_campaign_recipients ecr WHERE ecr.status = 'sent')")).rows[0].c;
    } catch (e) { r.campaign_tables = 'missing: ' + e.message; }
    try { r.unsubscribes = (await pool.query("SELECT COUNT(*) AS c FROM email_unsubscribes")).rows[0].c; } catch { r.unsubscribes = 'table missing'; }

    // Run the actual audience query
    let q = `SELECT COUNT(*) AS c FROM customers c WHERE c.deleted_at IS NULL AND c.email_primary IS NOT NULL AND c.email_primary != ''`;
    try { await pool.query('SELECT marketing_opt_out FROM customers LIMIT 1'); q += ` AND c.marketing_opt_out IS NOT TRUE AND c.email_invalid IS NOT TRUE`; } catch {}
    q += ` AND c.id NOT IN (SELECT DISTINCT customer_id FROM storage_billing WHERE billing_end_date IS NULL AND deleted_at IS NULL)`;
    q += ` AND c.id NOT IN (SELECT DISTINCT customer_id FROM records WHERE deleted_at IS NULL AND status NOT IN ('paid','void'))`;
    r.audience_before_sent_exclusion = (await pool.query(q)).rows[0].c;

    // With sent exclusion for 'seasonal'
    try {
      const q2 = q + ` AND LOWER(c.email_primary) NOT IN (SELECT LOWER(ecr.email) FROM email_campaign_recipients ecr JOIN email_campaigns ec ON ecr.campaign_id = ec.id WHERE ecr.status = 'sent' AND ec.template_type = 'seasonal')`;
      r.audience_after_seasonal_exclusion = (await pool.query(q2)).rows[0].c;
    } catch (e) { r.audience_after_seasonal_exclusion = 'error: ' + e.message; }

    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message, partial: r }); }
});

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
    console.log('Migration check: all pending migrations applied');
  } catch (err) {
    console.error('Migration check error (non-fatal):', err.message);
  }
})();

// Start daily campaign send cron job
const { startDailyCampaignJob } = require('./jobs/dailyCampaignSend');
startDailyCampaignJob();

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Master Tech ERP API running on port ${PORT}`);
});

module.exports = app;
