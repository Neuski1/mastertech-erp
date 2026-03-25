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

// Auth routes (no auth required for login/seed-admin)
app.use('/api/auth', require('./routes/auth'));

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
app.use('/api/appointments', requireAuth, require('./routes/appointments'));
app.use('/api/communications', requireAuth, require('./routes/communications'));
app.use('/api/square', requireAuth, require('./routes/square'));
app.use('/api/square/terminal', requireAuth, require('./routes/square-terminal'));
app.use('/api/square/webhook', require('./routes/square-webhook')); // No auth — Square calls directly
app.use('/api/quickbooks', requireAuth, require('./routes/quickbooks'));
app.use('/api/storage', requireAuth, require('./routes/storage'));
app.use('/api/estimates', requireAuth, require('./routes/estimates'));
app.use('/api/marketing', requireAuth, require('./routes/marketing'));
app.use('/api/vendors', requireAuth, require('./routes/vendors'));
app.use('/api/leads', require('./routes/leads')); // No auth — public endpoint for website webhook

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Master Tech ERP API running on port ${PORT}`);
});

module.exports = app;
