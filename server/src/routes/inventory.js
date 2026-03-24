const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/inventory/next-part-number?category=XX — Generate next part number
// ---------------------------------------------------------------------------
router.get('/next-part-number', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'category prefix required' });

  try {
    // Extract numeric suffix and find the max, handling both zero-padded and non-padded numbers
    const { rows } = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(part_number FROM '-([0-9]+)$') AS INTEGER)) AS max_num
       FROM inventory
       WHERE part_number LIKE $1 AND deleted_at IS NULL`,
      [`${category}-%`]
    );

    const nextNum = (rows[0].max_num || 0) + 1;
    const partNumber = `${category}-${String(nextNum).padStart(3, '0')}`;
    res.json({ part_number: partNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inventory/search?q=... — Quick search for parts line selection
// (Must be BEFORE /:id to avoid route collision)
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, part_number, description, vendor, location,
              qty_on_hand, cost_each, sale_price_each
       FROM inventory
       WHERE deleted_at IS NULL AND is_active = TRUE
         AND (description ILIKE $1 OR part_number ILIKE $1)
       ORDER BY description
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inventory/reorder-alerts — Items at or below reorder level
// ---------------------------------------------------------------------------
router.get('/reorder-alerts', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, part_number, description, vendor, location,
              qty_on_hand, reorder_level, cost_each, sale_price_each
       FROM inventory
       WHERE deleted_at IS NULL AND is_active = TRUE
         AND reorder_level IS NOT NULL AND reorder_level > 0
         AND qty_on_hand <= reorder_level
       ORDER BY (qty_on_hand - reorder_level) ASC, description`
    );
    res.json({ count: rows.length, items: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inventory — List all inventory with search/filter/pagination
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const {
    search, vendor, category, location, low_stock,
    page = 1, limit = 50, sort = 'description', order = 'asc'
  } = req.query;

  const conditions = ['i.deleted_at IS NULL'];
  const params = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(i.description ILIKE $${paramIdx} OR i.part_number ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (vendor) {
    conditions.push(`i.vendor = $${paramIdx++}`);
    params.push(vendor);
  }
  if (category) {
    conditions.push(`i.category = $${paramIdx++}`);
    params.push(category);
  }
  if (location) {
    conditions.push(`i.location = $${paramIdx++}`);
    params.push(location);
  }
  if (low_stock === 'true') {
    conditions.push('i.reorder_level IS NOT NULL AND i.reorder_level > 0 AND i.qty_on_hand <= i.reorder_level');
  }

  const allowedSorts = ['part_number', 'description', 'vendor_part_number', 'vendor', 'category', 'location', 'qty_on_hand', 'cost_each', 'sale_price_each'];
  const sortCol = allowedSorts.includes(sort) ? `i.${sort}` : 'i.qty_on_hand';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM inventory i WHERE ${conditions.join(' AND ')}`,
      params
    );

    const { rows } = await pool.query(
      `SELECT i.id, i.part_number, i.description, i.vendor, i.vendor_part_number, i.category, i.location,
              i.qty_on_hand, i.reorder_level, i.cost_each, i.sale_price_each,
              i.is_active, i.created_at,
              CASE WHEN i.reorder_level IS NOT NULL AND i.reorder_level > 0 AND i.qty_on_hand <= i.reorder_level
                   THEN TRUE ELSE FALSE END AS low_stock
       FROM inventory i
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      items: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/inventory error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inventory/:id — Single inventory item
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *,
              CASE WHEN reorder_level IS NOT NULL AND reorder_level > 0 AND qty_on_hand <= reorder_level
                   THEN TRUE ELSE FALSE END AS low_stock
       FROM inventory
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/inventory/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/inventory — Create new inventory item
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer'), async (req, res) => {
  const {
    part_number, description, vendor, vendor_part_number, category, location,
    qty_on_hand, reorder_level, cost_each, sale_price_each
  } = req.body;

  if (!description || sale_price_each === undefined) {
    return res.status(400).json({ error: 'description and sale_price_each are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO inventory
         (part_number, description, vendor, vendor_part_number, category, location,
          qty_on_hand, reorder_level, cost_each, sale_price_each)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        part_number || null,
        description,
        vendor || null,
        vendor_part_number || null,
        category || null,
        location || 'unassigned',
        qty_on_hand !== undefined ? parseFloat(qty_on_hand) : 0,
        reorder_level !== undefined && reorder_level !== '' ? parseFloat(reorder_level) : null,
        cost_each !== undefined && cost_each !== '' ? parseFloat(cost_each) : null,
        parseFloat(sale_price_each),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/inventory error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/inventory/:id — Update inventory item
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  const allowedFields = [
    'part_number', 'description', 'vendor', 'vendor_part_number', 'category', 'location',
    'qty_on_hand', 'reorder_level', 'cost_each', 'sale_price_each', 'is_active',
  ];

  const updates = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = $${idx++}`);
      // Handle nullable numeric fields
      if (['reorder_level', 'cost_each'].includes(field) && req.body[field] === '') {
        values.push(null);
      } else if (['qty_on_hand', 'reorder_level', 'cost_each', 'sale_price_each'].includes(field)) {
        values.push(req.body[field] !== null && req.body[field] !== '' ? parseFloat(req.body[field]) : null);
      } else {
        values.push(req.body[field]);
      }
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE inventory SET ${updates.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/inventory/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/inventory/:id — Soft delete
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE inventory SET deleted_at = NOW(), is_active = FALSE
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, part_number, description`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted', item: rows[0] });
  } catch (err) {
    console.error('DELETE /api/inventory/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
