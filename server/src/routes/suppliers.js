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

    const name = sup[0].name;

    const { rows } = await pool.query(
      `SELECT po.*,
        (SELECT COUNT(*) FROM po_line_items li WHERE li.po_id = po.id) AS item_count
       FROM purchase_orders po
       WHERE po.supplier_id = $1 OR LOWER(TRIM(po.vendor)) = LOWER(TRIM($2))
       ORDER BY po.created_at DESC`,
      [req.params.id, name]
    );

    // Real ordering history also lives on record_parts_lines (years of it),
    // matched by supplier_id or a case-insensitive order_supplier/vendor text
    // match. Include lines that were actually ordered/received or carry an
    // order number/date.
    const { rows: lines } = await pool.query(
      `SELECT rpl.id, rpl.record_id, rpl.order_number, rpl.order_date, rpl.order_eta,
              rpl.order_status, rpl.description, rpl.quantity, rpl.line_total, rpl.po_number
         FROM record_parts_lines rpl
        WHERE rpl.deleted_at IS NULL
          AND (rpl.supplier_id = $1
               OR LOWER(TRIM(rpl.order_supplier)) = LOWER(TRIM($2))
               OR LOWER(TRIM(rpl.vendor)) = LOWER(TRIM($2)))
          AND (rpl.order_status IN ('ordered', 'received')
               OR rpl.order_number IS NOT NULL
               OR rpl.order_date IS NOT NULL)
        ORDER BY COALESCE(rpl.order_date, rpl.order_eta) DESC NULLS LAST`,
      [req.params.id, name]
    );

    // IDs of record lines already tracked by a purchase order — exclude these
    // from the standalone "On Order (Work Order)" bucket to avoid double-count.
    const { rows: linkedRows } = await pool.query(
      `SELECT DISTINCT record_parts_line_id FROM po_line_items WHERE record_parts_line_id IS NOT NULL`
    );
    const linkedLineIds = new Set(linkedRows.map(r => r.record_parts_line_id));

    const poItems = rows.map(po => ({ ...po, source: 'po', sort_date: po.order_date || po.created_at }));
    const lineItems = lines.map(l => ({
      source: 'work_order',
      id: l.id,
      record_id: l.record_id,
      order_number: l.order_number,
      order_date: l.order_date || l.order_eta,
      status: l.order_status,
      description: l.description,
      quantity: l.quantity,
      line_total: l.line_total,
      po_number: l.po_number,
      sort_date: l.order_date || l.order_eta,
    }));

    const byDateDesc = (a, b) => {
      const da = a.sort_date ? new Date(a.sort_date).getTime() : 0;
      const db = b.sort_date ? new Date(b.sort_date).getTime() : 0;
      return db - da;
    };

    const openStatuses = new Set(['draft', 'submitted', 'partially_received', 'pending']);

    // Open: open POs + still-on-order work-order lines that have no PO of their own.
    const openWorkOrderLines = lineItems.filter(l =>
      l.status === 'ordered' && !l.po_number && !linkedLineIds.has(l.id));
    const open = [...poItems.filter(p => openStatuses.has(p.status)), ...openWorkOrderLines].sort(byDateDesc);

    // History: received/cancelled POs + every matched work-order line.
    const history = [...poItems.filter(p => !openStatuses.has(p.status)), ...lineItems].sort(byDateDesc);

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
