const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'mastertech-erp-secret-change-me';
const JWT_EXPIRY = '7d';

// ---------------------------------------------------------------------------
// requireAuth — Verify JWT and attach req.user
// ---------------------------------------------------------------------------
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Allow ?token= query param for <img> tags that can't send headers
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------------------------------------------------------------------------
// requireRole(...roles) — Check that req.user.role is in the allowed list
// Must be used AFTER requireAuth
// ---------------------------------------------------------------------------
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// requireAuthOrApiKey — Allow either a valid JWT (browser users) OR a valid
// IMPORT_API_KEY header (X-API-Key) for automated jobs like the daily Gmail
// order import. Falls through to JWT if no API key header is present.
// ---------------------------------------------------------------------------
function requireAuthOrApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expected = process.env.IMPORT_API_KEY;
  if (apiKey && expected && apiKey === expected) {
    req.user = { id: 0, email: 'import-bot@mastertechrvrepair.com', name: 'Import Bot', role: 'admin' };
    return next();
  }
  return requireAuth(req, res, next);
}

module.exports = { requireAuth, requireAuthOrApiKey, requireRole, JWT_SECRET, JWT_EXPIRY };
