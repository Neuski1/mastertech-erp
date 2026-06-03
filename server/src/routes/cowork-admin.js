// server/src/routes/cowork-admin.js
//
// Cowork admin SQL endpoint. Lets the Cowork assistant make database
// changes via API instead of direct Postgres URL access. Eliminates the
// password rotation cycle that broke the backend after every chart change.
//
// Auth: X-Cowork-Key header must match COWORK_API_KEY env var.
// Audit: every execution logs to audit_log (table_name = 'cowork_sql').
//
// SAFETY:
//   - Hard-blocks DROP DATABASE, DROP SCHEMA, TRUNCATE
//   - Caps result row count to 5000 to keep responses sane
//   - Wraps writes in transactions
//   - Never logs the raw SQL value (could contain sensitive data), only a hash + length

const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');

const router = express.Router();

function requireCoworkKey(req, res, next) {
  const provided = req.headers['x-cowork-key'];
  const expected = process.env.COWORK_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'COWORK_API_KEY not configured on server' });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing X-Cowork-Key' });
  }
  next();
}

// Hard-block destructive commands at the application layer (defense in depth).
const BLOCK_PATTERNS = [
  /\bDROP\s+DATABASE\b/i,
  /\bDROP\s+SCHEMA\b/i,
  /\bDROP\s+ROLE\b/i,
  /\bDROP\s+USER\b/i,
  /\bTRUNCATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bALTER\s+ROLE\b/i,
  /\bALTER\s+USER\b/i,
  /\bpg_terminate_backend\b/i,
];

function isBlocked(sql) {
  for (const p of BLOCK_PATTERNS) {
    if (p.test(sql)) return p.toString();
  }
  return null;
}

// POST /api/cowork-admin/sql
// Body: { sql: string, params?: any[], description?: string }
// Returns: { rowCount, rows, command }
router.post('/sql', requireCoworkKey, async (req, res) => {
  const { sql, params = [], description } = req.body || {};
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'sql (string) required' });
  }
  const blocked = isBlocked(sql);
  if (blocked) {
    return res.status(403).json({ error: `Blocked by safety filter: ${blocked}` });
  }
  const sqlHash = crypto.createHash('sha256').update(sql).digest('hex').slice(0, 16);
  const startedAt = new Date();
  let result;
  try {
    result = await pool.query(sql, params);
  } catch (err) {
    // Log the failure to audit_log
    try {
      await pool.query(
        `INSERT INTO audit_log (table_name, row_id, action, changed_by, new_value)
         VALUES ('cowork_sql', 0, 'INSERT', 'cowork', $1)`,
        [JSON.stringify({
          ok: false,
          hash: sqlHash,
          length: sql.length,
          description: description || null,
          error: err.message,
          startedAt,
        })]
      );
    } catch (logErr) {
      console.error('audit log write failed:', logErr.message);
    }
    return res.status(400).json({ error: err.message });
  }
  // Trim rows for safety
  const rows = Array.isArray(result.rows) ? result.rows.slice(0, 5000) : [];
  const truncated = (result.rows || []).length > 5000;

  // Audit success
  try {
    await pool.query(
      `INSERT INTO audit_log (table_name, row_id, action, changed_by, new_value)
       VALUES ('cowork_sql', 0, 'INSERT', 'cowork', $1)`,
      [JSON.stringify({
        ok: true,
        hash: sqlHash,
        length: sql.length,
        description: description || null,
        command: result.command,
        rowCount: result.rowCount,
        startedAt,
      })]
    );
  } catch (logErr) {
    console.error('audit log write failed:', logErr.message);
  }

  res.json({
    ok: true,
    command: result.command,
    rowCount: result.rowCount,
    rows,
    truncated,
  });
});

// POST /api/cowork-admin/journal-entry
// Higher-level wrapper for posting balanced journal entries.
// Body: {
//   entry_date: 'YYYY-MM-DD',
//   description: string,
//   source: string,
//   source_ref?: string,
//   lines: [{ account_number, debit, credit, memo }]
// }
router.post('/journal-entry', requireCoworkKey, async (req, res) => {
  const { entry_date, description, source, source_ref, lines } = req.body || {};
  if (!entry_date || !description || !source || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: 'entry_date, description, source, lines[] (>=2) required' });
  }
  const totalDr = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCr = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  if (Math.abs(totalDr - totalCr) > 0.005) {
    return res.status(400).json({ error: `Unbalanced: debits=${totalDr.toFixed(2)} credits=${totalCr.toFixed(2)}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const je = await client.query(
      `INSERT INTO journal_entries (entry_date, description, source, source_ref, is_posted, posted_at, posted_by)
       VALUES ($1, $2, $3, $4, TRUE, NOW(), 'cowork')
       RETURNING id`,
      [entry_date, description, source, source_ref || null]
    );
    const jeId = je.rows[0].id;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const acct = await client.query(`SELECT id FROM accounts WHERE account_number = $1`, [String(l.account_number)]);
      if (acct.rows.length === 0) throw new Error(`Account not found: ${l.account_number}`);
      await client.query(
        `INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit, memo, line_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [jeId, acct.rows[0].id, Number(l.debit || 0), Number(l.credit || 0), l.memo || null, i + 1]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, journal_entry_id: jeId, debits: totalDr, credits: totalCr });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/cowork-admin/health  - quick connectivity test
router.get('/health', requireCoworkKey, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now, current_database() AS db');
    res.json({ ok: true, now: rows[0].now, db: rows[0].db });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
