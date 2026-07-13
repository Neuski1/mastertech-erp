const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/suppliers — List suppliers (optional supplier_type / active filter)
// Includes inventory item_count and PO count for the list view.
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { supplier_type, active } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (supplier_type) {
      conditions.push(`s.supplier_type = $${idx++}`);
      params.push(supplier_type);
    }
    if (active === 'true') conditions.push('s.is_active = TRUE');
    else if (active === 'false') conditions.push('s.is_active = FALSE');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT s.*, s.name AS vendor_name,
        (SELECT COUNT(*) FROM inventory i
           WHERE i.deleted_at IS NULL
             AND (i.supplier_id = s.id OR LOWER(TRIM(i.vendor)) = LOWER(TRIM(s.name)))
             AND (i.qty_on_hand > 0 OR COALESCE(i.reorder_level, 0) > 0)) AS item_count,
        (SELECT COUNT(*) FROM purchase_orders po
           WHERE po.supplier_id = s.id OR LOWER(TRIM(po.vendor)) = LOWER(TRIM(s.name))) AS po_count
       FROM suppliers s
       ${where}
       ORDER BY s.name`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/suppliers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/suppliers/:id — Single supplier with contact / order-method detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, s.name AS vendor_name FROM suppliers s WHERE s.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/suppliers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/suppliers/:id/purchase-orders — POs for this supplier.
// Returns { open: [...], history: [...] } — open = draft/submitted/partially,
// history = received/cancelled. Matches by supplier_id OR free-text vendor.
// ---------------------------------------------------------------------------
router.get('/:id/purchase-orders', async (req, res) => {
  try {
    const { rows: sup } = await pool.query('SELECT name FROM suppliers WHERE id = $1', [req.params.id]);
    if (!sup.length) return res.status(404).json({ error: 'Supplier not found' });

    const { rows } = await pool.query(
      `SELECT po.*,
        (SELECT COUNT(*) FROM po_line_items li WHERE li.po_id = po.id) AS item_count
       FROM purchase_orders po
       WHERE po.supplier_id = $1 OR LOWER(TRIM(po.vendor)) = LOWER(TRIM($2))
       ORDER BY po.created_at DESC`,
      [req.params.id, sup[0].name]
    );

    const openStatuses = new Set(['draft', 'submitted', 'partially_received', 'pending']);
    const open = rows.filter(r => openStatuses.has(r.status));
    const history = rows.filter(r => !openStatuses.has(r.status));
    res.json({ open, history });
  } catch (err) {
    console.error('GET /api/suppliers/:id/purchase-orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/suppliers/:id/parts — Parts supplied by this supplier.
// Combines active inventory rows and the historical parts_catalog, matched by
// supplier_id OR free-text vendor.
// ---------------------------------------------------------------------------
router.get('/:id/parts', async (req, res) => {
  try {
    const { rows: sup } = await pool.query('SELECT name FROM suppliers WHERE id = $1', [req.params.id]);
    if (!sup.length) return res.status(404).json({ error: 'Supplier not found' });
    const name = sup[0].name;

    const { rows: inventory } = await pool.query(
      `SELECT id, part_number, vendor_part_number, description, qty_on_hand, cost_each, reorder_level
       FROM inventory
       WHERE deleted_at IS NULL
         AND (supplier_id = $1 OR LOWER(TRIM(vendor)) = LOWER(TRIM($2)))
       ORDER BY description
       LIMIT 500`,
      [req.params.id, name]
    );

    const { rows: catalog } = await pool.query(
      `SELECT id, description, vendor_part_number, last_cost, last_sale_price, last_used_date, times_used
       FROM parts_catalog
       WHERE (supplier_id = $1 OR LOWER(TRIM(vendor)) = LOWER(TRIM($2)))
       ORDER BY last_used_date DESC NULLS LAST
       LIMIT 500`,
      [req.params.id, name]
    );

    res.json({ inventory, catalog });
  } catch (err) {
    console.error('GET /api/suppliers/:id/parts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/suppliers/:id — Update supplier fields (contact, order method…)
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const allowed = ['name', 'website', 'contact_name', 'contact_email', 'contact_phone',
      'account_number', 'notes', 'supplier_type', 'subcategory', 'default_ship_days',
      'order_method', 'is_active'];
    const updates = [];
    const params = [];
    let idx = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        params.push(req.body[key] === '' ? null : req.body[key]);
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = NOW()');
    params.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE suppliers SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *, name AS vendor_name`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/suppliers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
