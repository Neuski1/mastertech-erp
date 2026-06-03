// server/src/routes/bookkeeping.js
// Bookkeeping module reports: chart of accounts, journal entries, P&L, Balance Sheet.

const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/bookkeeping/chart-of-accounts
// Returns all GL accounts with current balance computed from journal_lines.
// ---------------------------------------------------------------------------
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.account_number, a.name, a.statement, a.account_type,
             a.normal_balance, a.notes, a.is_active,
             COALESCE(SUM(
               CASE WHEN a.normal_balance = 'debit'
                    THEN jl.debit - jl.credit
                    ELSE jl.credit - jl.debit END
             ), 0) AS balance
        FROM accounts a
        LEFT JOIN journal_lines jl ON jl.account_id = a.id
        LEFT JOIN journal_entries je ON je.id = jl.journal_entry_id AND je.is_posted = TRUE
       GROUP BY a.id
       ORDER BY a.account_number`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookkeeping/journal-entries?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns posted journal entries with their lines.
// ---------------------------------------------------------------------------
router.get('/journal-entries', async (req, res) => {
  try {
    const { start, end, source } = req.query;
    const where = ['je.is_posted = TRUE'];
    const params = [];
    if (start) { params.push(start); where.push(`je.entry_date >= $${params.length}`); }
    if (end) { params.push(end); where.push(`je.entry_date <= $${params.length}`); }
    if (source) { params.push(source); where.push(`je.source = $${params.length}`); }

    const entries = await pool.query(
      `SELECT je.id, je.entry_date, je.description, je.source, je.source_ref,
              je.posted_at, je.posted_by,
              COALESCE(SUM(jl.debit), 0) AS total_debit,
              COALESCE(SUM(jl.credit), 0) AS total_credit
         FROM journal_entries je
         LEFT JOIN journal_lines jl ON jl.journal_entry_id = je.id
        WHERE ${where.join(' AND ')}
        GROUP BY je.id
        ORDER BY je.entry_date DESC, je.id DESC
        LIMIT 200`,
      params
    );

    const ids = entries.rows.map(r => r.id);
    let linesByEntry = {};
    if (ids.length > 0) {
      const lines = await pool.query(
        `SELECT jl.journal_entry_id, jl.line_order, jl.debit, jl.credit, jl.memo,
                a.account_number, a.name AS account_name
           FROM journal_lines jl
           JOIN accounts a ON a.id = jl.account_id
          WHERE jl.journal_entry_id = ANY($1::int[])
          ORDER BY jl.journal_entry_id, jl.line_order`,
        [ids]
      );
      for (const l of lines.rows) {
        (linesByEntry[l.journal_entry_id] = linesByEntry[l.journal_entry_id] || []).push(l);
      }
    }

    res.json(entries.rows.map(e => ({ ...e, lines: linesByEntry[e.id] || [] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookkeeping/reports/pnl?year=YYYY
// Returns P&L by month for a full calendar year.
// Shape: { accounts: [{account_number, name, account_type, months: [12 values]}], totals: {...} }
// ---------------------------------------------------------------------------
router.get('/reports/pnl', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { rows } = await pool.query(
      `SELECT a.account_number, a.name, a.account_type,
              EXTRACT(MONTH FROM je.entry_date)::int AS month,
              SUM(CASE WHEN a.normal_balance = 'credit'
                       THEN jl.credit - jl.debit
                       ELSE jl.debit - jl.credit END) AS amount
         FROM journal_lines jl
         JOIN journal_entries je ON je.id = jl.journal_entry_id
         JOIN accounts a ON a.id = jl.account_id
        WHERE je.is_posted = TRUE
          AND a.statement = 'P&L'
          AND EXTRACT(YEAR FROM je.entry_date) = $1
        GROUP BY a.account_number, a.name, a.account_type, month
        ORDER BY a.account_number, month`,
      [year]
    );

    // Pivot into account x months
    const map = {};
    for (const r of rows) {
      const key = r.account_number;
      if (!map[key]) {
        map[key] = {
          account_number: r.account_number,
          name: r.name,
          account_type: r.account_type,
          months: Array(12).fill(0),
        };
      }
      map[key].months[r.month - 1] = Number(r.amount);
    }
    const accounts = Object.values(map);
    res.json({ year, accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookkeeping/reports/balance-sheet?as_of=YYYY-MM-DD
// Returns Balance Sheet aggregated by account.
// ---------------------------------------------------------------------------
router.get('/reports/balance-sheet', async (req, res) => {
  try {
    const asOf = req.query.as_of || new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      `SELECT a.account_number, a.name, a.account_type, a.normal_balance,
              COALESCE(SUM(
                CASE WHEN a.normal_balance = 'debit'
                     THEN jl.debit - jl.credit
                     ELSE jl.credit - jl.debit END
              ), 0) AS balance
         FROM accounts a
         LEFT JOIN journal_lines jl ON jl.account_id = a.id
         LEFT JOIN journal_entries je ON je.id = jl.journal_entry_id
                                     AND je.is_posted = TRUE
                                     AND je.entry_date <= $1
        WHERE a.statement = 'Balance Sheet'
          AND a.is_active = TRUE
        GROUP BY a.id
        ORDER BY a.account_number`,
      [asOf]
    );
    res.json({ as_of: asOf, accounts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
