const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST /api/client-errors — capture a frontend render crash for diagnosis.
// Intentionally unauthenticated + best-effort so it always records, even if
// the crash happens before/around auth. Never throws back to the client.
router.post('/', async (req, res) => {
  try {
    const { message, stack, component_stack, url } = req.body || {};
    await pool.query(
      `INSERT INTO client_errors (message, stack, component_stack, url, user_agent)
       VALUES ($1,$2,$3,$4,$5)`,
      [String(message || '').slice(0, 2000), String(stack || '').slice(0, 8000),
       String(component_stack || '').slice(0, 8000), String(url || '').slice(0, 1000),
       String(req.headers['user-agent'] || '').slice(0, 500)]
    );
  } catch (e) {
    // swallow — logging must never break the client
  }
  res.json({ ok: true });
});

module.exports = router;
