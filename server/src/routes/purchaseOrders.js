const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/purchase-orders — List all purchase orders (optional filters)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { status, vendor, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      conditions.push(`po.status = $${paramIdx++}`);
      params.push(status);
    }
    if (vendor) {
      conditions.push(`LOWER(po.vendor) = LOWER($${paramIdx++})`);
      params.push(vendor);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT po.*,
        (SELECT COUNT(*) FROM po_line_items li WHERE li.po_id = po.id) AS item_count,
        (SELECT COUNT(*) FROM po_line_items li WHERE li.po_id = po.id AND li.matched = true) AS matched_count
       FROM purchase_orders po
       ${where}
       ORDER BY po.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM purchase_orders po ${where}`,
      params
    );

    res.json({ orders: rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('GET /api/purchase-orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/purchase-orders/vendors/details — Get vendor details with websites
// NOTE: Must be above /:id to avoid route conflict
// ---------------------------------------------------------------------------
router.get('/vendors/details', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT vd.*,
        (SELECT COUNT(*) FROM inventory i WHERE i.deleted_at IS NULL AND LOWER(i.vendor) = LOWER(vd.vendor_name)) AS item_count,
        (SELECT COALESCE(SUM(i.qty_on_hand * i.cost_each), 0) FROM inventory i WHERE i.deleted_at IS NULL AND LOWER(i.vendor) = LOWER(vd.vendor_name)) AS total_value,
        (SELECT COUNT(*) FROM purchase_orders po WHERE LOWER(po.vendor) = LOWER(vd.vendor_name)) AS po_count
       FROM vendor_details vd
       ORDER BY vd.vendor_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/purchase-orders/vendors/details error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/purchase-orders/vendors/details/:name — Update vendor details
// ---------------------------------------------------------------------------
router.put('/vendors/details/:name', async (req, res) => {
  try {
    const { website, contact_name, contact_email, contact_phone, account_number, notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO vendor_details (vendor_name, website, contact_name, contact_email, contact_phone, account_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (vendor_name) DO UPDATE SET
         website = EXCLUDED.website,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         contact_phone = EXCLUDED.contact_phone,
         account_number = EXCLUDED.account_number,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING *`,
      [req.params.name, website || null, contact_name || null, contact_email || null, contact_phone || null, account_number || null, notes || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT vendor details error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/purchase-orders/:id — Get single PO with line items
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows: poRows } = await pool.query(
      'SELECT * FROM purchase_orders WHERE id = $1',
      [req.params.id]
    );
    if (!poRows.length) return res.status(404).json({ error: 'Purchase order not found' });

    const { rows: lineItems } = await pool.query(
      `SELECT li.*, i.part_number, i.description AS inv_description, i.qty_on_hand
       FROM po_line_items li
       LEFT JOIN inventory i ON li.inventory_item_id = i.id
       WHERE li.po_id = $1
       ORDER BY li.id`,
      [req.params.id]
    );

    res.json({ ...poRows[0], line_items: lineItems });
  } catch (err) {
    console.error('GET /api/purchase-orders/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders — Create a new purchase order
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { vendor, order_date, order_number, tracking_number, shipping_cost, notes, line_items } = req.body;

    if (!vendor) return res.status(400).json({ error: 'Vendor is required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate subtotal from line items
      let subtotal = 0;
      if (line_items && line_items.length > 0) {
        subtotal = line_items.reduce((sum, item) => sum + (item.qty * item.cost_each), 0);
      }
      const total = subtotal + (parseFloat(shipping_cost) || 0);

      const { rows } = await client.query(
        `INSERT INTO purchase_orders (vendor, order_date, order_number, tracking_number, shipping_cost, subtotal, total, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [vendor, order_date || new Date(), order_number || null, tracking_number || null, shipping_cost || 0, subtotal, total, notes || null]
      );

      const po = rows[0];

      // Insert line items
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          const lineTotal = (item.qty || 1) * (item.cost_each || 0);
          await client.query(
            `INSERT INTO po_line_items (po_id, inventory_item_id, description, vendor_part_number, qty, cost_each, line_total, matched)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [po.id, item.inventory_item_id || null, item.description, item.vendor_part_number || null, item.qty || 1, item.cost_each || 0, lineTotal, !!item.inventory_item_id]
          );
        }
      }

      await client.query('COMMIT');

      // Return the full PO
      const { rows: fullPo } = await pool.query(
        `SELECT po.*,
          (SELECT COUNT(*) FROM po_line_items li WHERE li.po_id = po.id) AS item_count
         FROM purchase_orders po WHERE po.id = $1`,
        [po.id]
      );
      res.status(201).json(fullPo[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/purchase-orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/purchase-orders/:id — Update PO fields
// ---------------------------------------------------------------------------
router.patch('/:id', async (req, res) => {
  try {
    const { vendor, order_date, order_number, tracking_number, shipping_cost, notes, status } = req.body;
    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (vendor !== undefined) { updates.push(`vendor = $${paramIdx++}`); params.push(vendor); }
    if (order_date !== undefined) { updates.push(`order_date = $${paramIdx++}`); params.push(order_date); }
    if (order_number !== undefined) { updates.push(`order_number = $${paramIdx++}`); params.push(order_number); }
    if (tracking_number !== undefined) { updates.push(`tracking_number = $${paramIdx++}`); params.push(tracking_number); }
    if (shipping_cost !== undefined) { updates.push(`shipping_cost = $${paramIdx++}`); params.push(shipping_cost); }
    if (notes !== undefined) { updates.push(`notes = $${paramIdx++}`); params.push(notes); }
    if (status !== undefined) { updates.push(`status = $${paramIdx++}`); params.push(status); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = NOW()`);
    params.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE purchase_orders SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );

    if (!rows.length) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/purchase-orders/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/:id/receive — Mark PO as received, update inventory
// ---------------------------------------------------------------------------
router.post('/:id/receive', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the PO
      const { rows: poRows } = await client.query(
        'SELECT * FROM purchase_orders WHERE id = $1',
        [req.params.id]
      );
      if (!poRows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      if (poRows[0].status === 'received') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Purchase order already received' });
      }

      // Get matched line items
      const { rows: lineItems } = await client.query(
        'SELECT * FROM po_line_items WHERE po_id = $1 AND matched = true AND inventory_item_id IS NOT NULL',
        [req.params.id]
      );

      // Update inventory quantities for matched items
      for (const item of lineItems) {
        await client.query(
          'UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2',
          [item.qty, item.inventory_item_id]
        );
      }

      // Mark PO as received
      await client.query(
        'UPDATE purchase_orders SET status = $1, received_at = NOW(), updated_at = NOW() WHERE id = $2',
        ['received', req.params.id]
      );

      await client.query('COMMIT');
      res.json({ message: 'Purchase order received', items_updated: lineItems.length });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/purchase-orders/:id/receive error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/:id/items — Add line item to PO
// ---------------------------------------------------------------------------
router.post('/:id/items', async (req, res) => {
  try {
    const { inventory_item_id, description, vendor_part_number, qty, cost_each } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const lineTotal = (qty || 1) * (cost_each || 0);
    const { rows } = await pool.query(
      `INSERT INTO po_line_items (po_id, inventory_item_id, description, vendor_part_number, qty, cost_each, line_total, matched)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.id, inventory_item_id || null, description, vendor_part_number || null, qty || 1, cost_each || 0, lineTotal, !!inventory_item_id]
    );

    // Recalculate PO totals
    await pool.query(
      `UPDATE purchase_orders SET
        subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM po_line_items WHERE po_id = $1),
        total = (SELECT COALESCE(SUM(line_total), 0) FROM po_line_items WHERE po_id = $1) + COALESCE(shipping_cost, 0),
        updated_at = NOW()
       WHERE id = $1`,
      [req.params.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/purchase-orders/:id/items error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/purchase-orders/:poId/items/:itemId/match — Match line item to inventory
// ---------------------------------------------------------------------------
router.patch('/:poId/items/:itemId/match', async (req, res) => {
  try {
    const { inventory_item_id } = req.body;

    const { rows } = await pool.query(
      `UPDATE po_line_items SET inventory_item_id = $1, matched = $2 WHERE po_id = $3 AND id = $4 RETURNING *`,
      [inventory_item_id || null, !!inventory_item_id, req.params.poId, req.params.itemId]
    );

    if (!rows.length) return res.status(404).json({ error: 'Line item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH match error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/purchase-orders/:poId/items/:itemId — Remove line item
// ---------------------------------------------------------------------------
router.delete('/:poId/items/:itemId', async (req, res) => {
  try {
    await pool.query('DELETE FROM po_line_items WHERE po_id = $1 AND id = $2', [req.params.poId, req.params.itemId]);

    // Recalculate PO totals
    await pool.query(
      `UPDATE purchase_orders SET
        subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM po_line_items WHERE po_id = $1),
        total = (SELECT COALESCE(SUM(line_total), 0) FROM po_line_items WHERE po_id = $1) + COALESCE(shipping_cost, 0),
        updated_at = NOW()
       WHERE id = $1`,
      [req.params.poId]
    );

    res.json({ message: 'Line item removed' });
  } catch (err) {
    console.error('DELETE line item error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/purchase-orders/:id — Delete a PO (only if pending)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT status FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Purchase order not found' });
    if (rows[0].status === 'received') return res.status(400).json({ error: 'Cannot delete a received purchase order' });

    await pool.query('DELETE FROM purchase_orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    console.error('DELETE /api/purchase-orders/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
