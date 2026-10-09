// ---------------------------------------------------------------------------
// Public parts feed for the website's Parts page.
//
// GET /api/public/parts   (mounted before auth in app.js)
//
// Read-only. Returns ONLY part number, display name and category for parts
// that are in stock, active, categorized, and not flagged hide_from_website.
// Never returns price, cost, quantity, vendor, supplier, location, notes, or
// anything tied to a customer or work order. The column list is hard-coded in
// the SELECT on purpose: adding a column to inventory can never leak it here.
//
// Customers call the shop to buy; the website shows "In stock", not a count.
// Results are cached in memory for 15 minutes, and a simple per-IP limiter
// keeps scrapers from hammering the database.
// ---------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

const CACHE_MS = 15 * 60 * 1000;
let cache = null; // { at, body }

// Per-IP limiter: 60 requests per 10 minutes. Cached responses still count.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 60;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.start > WINDOW_MS) { hits.set(ip, { start: now, n: 1 }); return false; }
  h.n += 1;
  if (hits.size > 5000) { for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k); }
  return h.n > MAX_HITS;
}

// "VENTLINE NON POWERED ROOF VENT" -> "Ventline Non Powered Roof Vent".
// Only touches text typed entirely in capitals; short tokens and tokens with
// digits (LP, CO2, 4/0, 30AMP) stay as typed.
function tidyName(raw) {
  let s = String(raw || '').replace(/\s+/g, ' ').replace(/[;,\s]+$/, '').trim();
  if (/[a-z]/.test(s) || !/[A-Z]{4,}/.test(s)) return s;
  return s.split(' ').map(w => (w.length <= 3 || /\d/.test(w)) ? w : w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

const SQL = `
  SELECT i.part_number,
         i.description,
         COALESCE(c.name, INITCAP(i.category)) AS category
  FROM inventory i
  LEFT JOIN LATERAL (
    SELECT name FROM inventory_categories ic
    WHERE UPPER(ic.prefix) = UPPER(i.category) OR UPPER(ic.name) = UPPER(i.category)
    ORDER BY (UPPER(ic.prefix) = UPPER(i.category)) DESC
    LIMIT 1
  ) c ON TRUE
  WHERE i.deleted_at IS NULL
    AND i.is_active = TRUE
    AND i.qty_on_hand > 0
    AND i.hide_from_website = FALSE
    AND NULLIF(TRIM(i.category), '') IS NOT NULL
    AND UPPER(i.category) <> 'MISC'          -- shop supplies and fees, not retail parts
  ORDER BY 3, 2`;

router.get('/', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  if (limited(ip)) return res.status(429).json({ error: 'Too many requests' });

  res.set('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600');
  if (cache && Date.now() - cache.at < CACHE_MS) return res.json(cache.body);

  try {
    const { rows } = await pool.query(SQL);
    // Catalog-style descriptions ("Propane Regulator; Two Stage; 225000 BTU...")
    // split into a short name and a details line at the first semicolon.
    const parts = rows.map(r => {
      const [head, ...rest] = String(r.description || '').split(';');
      return {
        part_number: r.part_number || null,
        name: tidyName(head),
        details: tidyName(rest.join(';').replace(/;\s*/g, ', ')) || null,
        category: r.category,
      };
    }).filter(p => p.name);
    const categories = [...new Set(parts.map(p => p.category))].sort();
    const body = { updated_at: new Date().toISOString(), count: parts.length, categories, parts };
    cache = { at: Date.now(), body };
    res.json(body);
  } catch (err) {
    console.error('[publicParts]', err.message);
    if (cache) return res.json(cache.body); // serve stale rather than break the page
    res.status(500).json({ error: 'Parts list unavailable' });
  }
});

module.exports = router;
module.exports._tidyName = tidyName;
