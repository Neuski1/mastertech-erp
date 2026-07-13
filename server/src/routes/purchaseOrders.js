const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// Helper: when a PO is marked as received, increment qty_on_hand and update
// weighted-average cost on every matched inventory item. Used by both the
// manual /:id/receive endpoint and the auto-receive path inside the importers
// (so an "already delivered" import actually moves stock).
async function applyInventoryReceiving(client, poId) {
  const { rows: lineItems } = await client.query(
    'SELECT * FROM po_line_items WHERE po_id = $1 AND matched = true AND inventory_item_id IS NOT NULL',
    [poId]
  );
  for (const item of lineItems) {
    const { rows: invRows } = await client.query(
      'SELECT qty_on_hand, cost_each FROM inventory WHERE id = $1',
      [item.inventory_item_id]
    );
    const currentQty = parseFloat(invRows[0]?.qty_on_hand || 0);
    const currentCost = parseFloat(invRows[0]?.cost_each || 0);
    const incomingQty = parseFloat(item.qty);
    const incomingCost = parseFloat(item.cost_each || 0);
    const totalQty = currentQty + incomingQty;
    let newCost = currentCost;
    if (totalQty > 0 && incomingCost > 0) {
      newCost = ((currentQty * currentCost) + (incomingQty * incomingCost)) / totalQty;
      newCost = Math.round(newCost * 100) / 100;
    }
    await client.query(
      'UPDATE inventory SET qty_on_hand = qty_on_hand + $1, cost_each = $2 WHERE id = $3',
      [incomingQty, newCost, item.inventory_item_id]
    );
  }
  return lineItems.length;
}

// Find-or-create the single open DRAFT purchase order for a supplier. The
// record-driven and restock-driven flows (Phases 3-4) both funnel into this so
// a supplier only ever has one open draft to append to at a time.
async function findOrCreateDraftPO(client, supplierId) {
  const { rows: sup } = await client.query('SELECT id, name FROM suppliers WHERE id = $1', [supplierId]);
  if (!sup.length) throw new Error('Supplier not found');

  const { rows: existing } = await client.query(
    `SELECT * FROM purchase_orders WHERE supplier_id = $1 AND status = 'draft' ORDER BY created_at ASC LIMIT 1`,
    [supplierId]
  );
  if (existing.length) return existing[0];

  const { rows } = await client.query(
    `INSERT INTO purchase_orders (vendor, supplier_id, status, order_date)
     VALUES ($1, $2, 'draft', CURRENT_DATE) RETURNING *`,
    [sup[0].name, supplierId]
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// GET /api/purchase-orders — List all purchase orders (optional filters)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { status, vendor, supplier_id, limit = 50, offset = 0 } = req.query;
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
    if (supplier_id) {
      conditions.push(`po.supplier_id = $${paramIdx++}`);
      params.push(supplier_id);
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
      `SELECT vd.*, vd.name AS vendor_name,
        (SELECT COUNT(*) FROM inventory i WHERE i.deleted_at IS NULL AND LOWER(i.vendor) = LOWER(vd.name)
          AND (i.qty_on_hand > 0 OR COALESCE(i.reorder_level, 0) > 0)) AS item_count,
        (SELECT COALESCE(SUM(i.qty_on_hand * i.cost_each), 0) FROM inventory i WHERE i.deleted_at IS NULL AND LOWER(i.vendor) = LOWER(vd.name)
          AND (i.qty_on_hand > 0 OR COALESCE(i.reorder_level, 0) > 0)) AS total_value,
        (SELECT COUNT(*) FROM purchase_orders po WHERE LOWER(po.vendor) = LOWER(vd.name)) AS po_count
       FROM suppliers vd
       ORDER BY vd.name`
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
    const { website, contact_name, contact_email, contact_phone, account_number, notes, supplier_type, subcategory, order_method, default_ship_days, is_active } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name, website, contact_name, contact_email, contact_phone, account_number, notes, supplier_type, subcategory, order_method, default_ship_days, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, TRUE))
       ON CONFLICT (name) DO UPDATE SET
         website = EXCLUDED.website,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         contact_phone = EXCLUDED.contact_phone,
         account_number = EXCLUDED.account_number,
         notes = EXCLUDED.notes,
         supplier_type = EXCLUDED.supplier_type,
         subcategory = EXCLUDED.subcategory,
         order_method = EXCLUDED.order_method,
         default_ship_days = EXCLUDED.default_ship_days,
         is_active = EXCLUDED.is_active,
         updated_at = NOW()
       RETURNING *, name AS vendor_name`,
      [req.params.name, website || null, contact_name || null, contact_email || null, contact_phone || null, account_number || null, notes || null, supplier_type || 'inventory', subcategory || null, order_method || null, default_ship_days || null, is_active === undefined ? null : !!is_active]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT vendor details error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/purchase-orders/amazon-imported — List already-imported Amazon order numbers
// ---------------------------------------------------------------------------
router.get('/amazon-imported', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT order_number FROM purchase_orders WHERE LOWER(vendor) = 'amazon business' AND order_number IS NOT NULL`
    );
    res.json(rows.map(r => r.order_number));
  } catch (err) {
    console.error('GET /api/purchase-orders/amazon-imported error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/purchase-orders/supplier-imported?vendor=X — List already-imported order numbers for any supplier
// ---------------------------------------------------------------------------
router.get('/supplier-imported', async (req, res) => {
  const { vendor } = req.query;
  if (!vendor) return res.status(400).json({ error: 'vendor query parameter required' });
  try {
    const { rows } = await pool.query(
      `SELECT order_number FROM purchase_orders WHERE LOWER(TRIM(vendor)) = LOWER(TRIM($1)) AND order_number IS NOT NULL`,
      [vendor]
    );
    res.json(rows.map(r => r.order_number));
  } catch (err) {
    console.error('GET /api/purchase-orders/supplier-imported error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/purchase-orders/vendors/subcategories — List distinct subcategories
// ---------------------------------------------------------------------------
router.get('/vendors/subcategories', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT subcategory FROM suppliers WHERE subcategory IS NOT NULL AND subcategory != '' ORDER BY subcategory`
    );
    res.json(rows.map(r => r.subcategory));
  } catch (err) {
    console.error('GET subcategories error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/purchase-orders/vendors/details/:name — Delete a misc supplier
// ---------------------------------------------------------------------------
router.delete('/vendors/details/:name', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM suppliers WHERE name = $1 AND supplier_type = 'misc'`,
      [req.params.name]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Misc supplier not found (inventory suppliers cannot be deleted here)' });
    res.json({ message: 'Misc supplier deleted' });
  } catch (err) {
    console.error('DELETE vendor details error:', err);
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
    const { vendor, supplier_id, order_date, order_number, tracking_number, shipping_cost, notes, line_items } = req.body;

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
        `INSERT INTO purchase_orders (vendor, supplier_id, order_date, order_number, tracking_number, shipping_cost, subtotal, total, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [vendor, supplier_id || null, order_date || new Date(), order_number || null, tracking_number || null, shipping_cost || 0, subtotal, total, notes || null]
      );

      const po = rows[0];

      // Insert line items
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          const lineTotal = (item.qty || 1) * (item.cost_each || 0);
          await client.query(
            `INSERT INTO po_line_items (po_id, inventory_item_id, record_parts_line_id, description, vendor_part_number, qty, cost_each, line_total, matched, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [po.id, item.inventory_item_id || null, item.record_parts_line_id || null, item.description, item.vendor_part_number || null, item.qty || 1, item.cost_each || 0, lineTotal, !!item.inventory_item_id, item.source || 'manual']
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
    const { vendor, supplier_id, order_date, expected_date, order_number, tracking_number, shipping_cost, notes, status } = req.body;
    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (vendor !== undefined) { updates.push(`vendor = $${paramIdx++}`); params.push(vendor); }
    if (supplier_id !== undefined) { updates.push(`supplier_id = $${paramIdx++}`); params.push(supplier_id || null); }
    if (order_date !== undefined) { updates.push(`order_date = $${paramIdx++}`); params.push(order_date); }
    if (expected_date !== undefined) { updates.push(`expected_date = $${paramIdx++}`); params.push(expected_date || null); }
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

// Best-effort audit_log write inside a transaction. Wrapped in a savepoint so a
// missing audit_log table can't abort the surrounding receive/submit.
async function auditLog(client, { table, rowId, action, by, oldValue, newValue }) {
  try {
    await client.query('SAVEPOINT sp_audit');
    await client.query(
      `INSERT INTO audit_log (table_name, row_id, action, changed_by, old_value, new_value, changed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [table, rowId, action, by || null,
       oldValue == null ? null : JSON.stringify(oldValue),
       newValue == null ? null : JSON.stringify(newValue)]
    );
    await client.query('RELEASE SAVEPOINT sp_audit');
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT sp_audit');
  }
}

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/:id/submit — "Mark as Ordered"
// Captures the supplier's order/confirmation number, order_date, expected_date
// and tracking (all optional, editable later), generates a PO number
// (PO-YYYY-<padded id>), and flips the PO to 'submitted'.
// ---------------------------------------------------------------------------
router.post('/:id/submit', async (req, res) => {
  try {
    const { order_number, order_date, expected_date, tracking_number, order_email_msg_id } = req.body || {};
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: poRows } = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
      if (!poRows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      const po = poRows[0];
      if (po.status === 'cancelled') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot submit a cancelled purchase order' });
      }

      // Generate the PO number on first submit only (keep it stable afterwards).
      const poNumber = po.po_number || `PO-${new Date().getFullYear()}-${String(po.id).padStart(5, '0')}`;

      const { rows } = await client.query(
        `UPDATE purchase_orders SET
           status = 'submitted',
           submitted_at = COALESCE(submitted_at, NOW()),
           po_number = $1,
           order_number = COALESCE($2, order_number),
           order_date = COALESCE($3, order_date),
           expected_date = COALESCE($4, expected_date),
           tracking_number = COALESCE($5, tracking_number),
           order_email_msg_id = COALESCE($6, order_email_msg_id),
           updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [poNumber, order_number || null, order_date || null, expected_date || null,
         tracking_number || null, order_email_msg_id || null, req.params.id]
      );

      await auditLog(client, { table: 'purchase_orders', rowId: po.id, action: 'submit',
        by: req.user?.id, oldValue: { status: po.status }, newValue: { status: 'submitted', po_number: poNumber } });

      await client.query('COMMIT');
      res.json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/purchase-orders/:id/submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/:id/receive — Receive a PO (full or partial).
// Body (optional): { lines: [{ line_id, qty_received }] }. If omitted, every
// line's outstanding quantity is received. In ONE transaction this:
//   (a) increments inventory.qty_on_hand (+ weighted-avg cost) for lines with
//       an inventory_item_id, and clears reorder_status once qty > reorder_level;
//   (b) flips linked record_parts_lines.order_status to 'received';
//   (c) sets PO status to 'received' or 'partially_received';
//   (d) writes audit_log entries.
// ---------------------------------------------------------------------------
router.post('/:id/receive', async (req, res) => {
  try {
    const requested = Array.isArray(req.body?.lines) ? req.body.lines : null;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: poRows } = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
      if (!poRows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      const po = poRows[0];
      if (po.status === 'received') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Purchase order already received' });
      }
      if (po.status === 'cancelled') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot receive a cancelled purchase order' });
      }

      const { rows: lineItems } = await client.query(
        'SELECT * FROM po_line_items WHERE po_id = $1 ORDER BY id',
        [req.params.id]
      );

      // Map of line_id -> qty to receive this call.
      const receiveByLine = new Map();
      if (requested) {
        for (const r of requested) {
          const q = parseFloat(r.qty_received);
          if (r.line_id != null && q > 0) receiveByLine.set(Number(r.line_id), q);
        }
      } else {
        // Receive the outstanding quantity on every line.
        for (const li of lineItems) {
          const outstanding = parseFloat(li.qty) - parseFloat(li.qty_received || 0);
          if (outstanding > 0) receiveByLine.set(li.id, outstanding);
        }
      }

      let linesReceived = 0;
      for (const li of lineItems) {
        const recvNow = receiveByLine.get(li.id);
        if (!recvNow || recvNow <= 0) continue;

        const alreadyReceived = parseFloat(li.qty_received || 0);
        const ordered = parseFloat(li.qty);
        const cappedRecv = Math.min(recvNow, ordered - alreadyReceived);
        if (cappedRecv <= 0) continue;
        const newReceived = alreadyReceived + cappedRecv;
        linesReceived++;

        // (a) Move stock for inventory-linked lines (weighted-average cost).
        if (li.inventory_item_id) {
          const { rows: invRows } = await client.query(
            'SELECT qty_on_hand, cost_each, reorder_level, reorder_status FROM inventory WHERE id = $1',
            [li.inventory_item_id]
          );
          if (invRows.length) {
            const currentQty = parseFloat(invRows[0].qty_on_hand || 0);
            const currentCost = parseFloat(invRows[0].cost_each || 0);
            const incomingCost = parseFloat(li.cost_each || 0);
            const totalQty = currentQty + cappedRecv;
            let newCost = currentCost;
            if (totalQty > 0 && incomingCost > 0) {
              newCost = Math.round((((currentQty * currentCost) + (cappedRecv * incomingCost)) / totalQty) * 100) / 100;
            }
            await client.query(
              'UPDATE inventory SET qty_on_hand = qty_on_hand + $1, cost_each = $2 WHERE id = $3',
              [cappedRecv, newCost, li.inventory_item_id]
            );
            // Clear reorder flag once we're back above the reorder level.
            const reorderLevel = parseFloat(invRows[0].reorder_level || 0);
            if (invRows[0].reorder_status && totalQty > reorderLevel) {
              await client.query(
                `UPDATE inventory SET reorder_status = NULL WHERE id = $1`,
                [li.inventory_item_id]
              );
            }
          }
        }

        // (b) Flip the linked customer parts line to received once fully in.
        if (li.record_parts_line_id && newReceived >= ordered) {
          await client.query(
            `UPDATE record_parts_lines
                SET order_status = 'received', order_confirmed_at = COALESCE(order_confirmed_at, NOW())
              WHERE id = $1`,
            [li.record_parts_line_id]
          );
        }

        await client.query('UPDATE po_line_items SET qty_received = $1 WHERE id = $2', [newReceived, li.id]);

        await auditLog(client, { table: 'po_line_items', rowId: li.id, action: 'receive',
          by: req.user?.id, oldValue: { qty_received: alreadyReceived }, newValue: { qty_received: newReceived } });
      }

      // (c) Recompute PO status from the (now updated) line receipts.
      const { rows: fresh } = await client.query(
        'SELECT qty, qty_received FROM po_line_items WHERE po_id = $1',
        [req.params.id]
      );
      const allReceived = fresh.length > 0 && fresh.every(l => parseFloat(l.qty_received || 0) >= parseFloat(l.qty));
      const anyReceived = fresh.some(l => parseFloat(l.qty_received || 0) > 0);
      const newStatus = allReceived ? 'received' : (anyReceived ? 'partially_received' : po.status);

      await client.query(
        `UPDATE purchase_orders
            SET status = $1,
                received_at = CASE WHEN $1 = 'received' THEN NOW() ELSE received_at END,
                updated_at = NOW()
          WHERE id = $2`,
        [newStatus, req.params.id]
      );

      // (d) PO-level audit entry.
      await auditLog(client, { table: 'purchase_orders', rowId: po.id, action: 'receive',
        by: req.user?.id, oldValue: { status: po.status }, newValue: { status: newStatus } });

      await client.query('COMMIT');
      res.json({ message: 'Purchase order received', status: newStatus, lines_received: linesReceived });
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
// POST /api/purchase-orders/draft-for-supplier — find-or-create the open draft
// PO for a supplier_id. Used by the record- and restock-driven flows.
// ---------------------------------------------------------------------------
router.post('/draft-for-supplier', async (req, res) => {
  const { supplier_id } = req.body || {};
  if (!supplier_id) return res.status(400).json({ error: 'supplier_id is required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const po = await findOrCreateDraftPO(client, supplier_id);
    await client.query('COMMIT');
    res.json(po);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/purchase-orders/draft-for-supplier error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/:id/find-confirmation — Ingest an INBOUND order
// confirmation. Master Tech places orders on supplier websites / by phone and a
// confirmation email arrives afterward; this attaches that confirmation to the
// PO and its linked customer parts lines, and logs the match in order_email_log.
//
// TODO: automated Gmail search is not wired server-side yet (inbound Gmail is
// scanned client-side today, and this app has no server-side inbound mailbox
// reader). For now this endpoint accepts manually-entered confirmation details
// as a fallback. When a server-side Gmail reader exists, add: search connected
// Gmail for order confirmation / shipping emails matching the supplier domain +
// order number, auto-fill order_number/tracking/ETA, and store the Gmail
// message id in order_email_msg_id.
// ---------------------------------------------------------------------------
router.post('/:id/find-confirmation', async (req, res) => {
  const { order_number, tracking_number, expected_date, gmail_msg_id, from_addr, subject } = req.body || {};
  if (!order_number && !tracking_number && !expected_date && !gmail_msg_id) {
    return res.status(400).json({
      error: 'Automated Gmail confirmation search is not available server-side yet. ' +
             'Enter the confirmation order number, tracking and/or ETA manually.',
      manual_entry_required: true,
    });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: poRows } = await client.query('SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]);
    if (!poRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const { rows } = await client.query(
      `UPDATE purchase_orders SET
         order_number = COALESCE($1, order_number),
         tracking_number = COALESCE($2, tracking_number),
         expected_date = COALESCE($3, expected_date),
         order_email_msg_id = COALESCE($4, order_email_msg_id),
         updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [order_number || null, tracking_number || null, expected_date || null, gmail_msg_id || null, req.params.id]
    );

    // Sync the confirmation onto linked customer parts lines (ETA + tracking).
    await client.query(
      `UPDATE record_parts_lines rpl SET
         order_eta = COALESCE($1, rpl.order_eta),
         order_tracking = COALESCE($2, rpl.order_tracking),
         order_number = COALESCE($3, rpl.order_number),
         order_email_msg_id = COALESCE($4, rpl.order_email_msg_id)
       FROM po_line_items li
       WHERE li.po_id = $5 AND li.record_parts_line_id = rpl.id`,
      [expected_date || null, tracking_number || null, order_number || null, gmail_msg_id || null, req.params.id]
    );

    // Log the inbound match (order_email_log). gmail_msg_id is UNIQUE.
    if (gmail_msg_id) {
      await client.query(
        `INSERT INTO order_email_log (gmail_msg_id, from_addr, subject, parsed_po, parsed_json, match_status)
         VALUES ($1, $2, $3, $4, $5, 'matched')
         ON CONFLICT (gmail_msg_id) DO UPDATE SET
           parsed_po = EXCLUDED.parsed_po, parsed_json = EXCLUDED.parsed_json, match_status = 'matched'`,
        [gmail_msg_id, from_addr || null, subject || null, rows[0].po_number || String(req.params.id),
         JSON.stringify({ po_id: Number(req.params.id), order_number, tracking_number, expected_date })]
      );
    }

    await auditLog(client, { table: 'purchase_orders', rowId: Number(req.params.id), action: 'find_confirmation',
      by: req.user?.id, newValue: { order_number, tracking_number, expected_date } });

    await client.query('COMMIT');
    res.json({ po: rows[0], source: 'manual' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/purchase-orders/:id/find-confirmation error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
// POST /api/purchase-orders/amazon-import — Import Amazon orders as POs
// Body: { orders: [{ orderId, po, total, date, items: [{description, quantity, price}], trackingNumber, shippingCost, tax, status }] }
// ---------------------------------------------------------------------------
router.post('/amazon-import', async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'orders array is required' });
    }

    const client = await pool.connect();
    const results = { imported: 0, skipped: 0, details: [] };

    try {
      await client.query('BEGIN');

      for (const order of orders) {
        // Check if this Amazon order was already imported (by order_number)
        if (order.orderId) {
          const { rows: existing } = await client.query(
            'SELECT id FROM purchase_orders WHERE order_number = $1',
            [order.orderId]
          );
          if (existing.length > 0) {
            results.skipped++;
            results.details.push({ orderId: order.orderId, status: 'skipped', reason: 'Already imported', poId: existing[0].id });
            continue;
          }
        }

        // Auto-match line items to inventory by description
        const matchedLineItems = [];
        for (const item of (order.items || [])) {
          let inventoryMatch = null;

          // Try to find inventory match by description keywords
          if (item.description) {
            // Extract meaningful keywords (3+ chars) from the description
            const keywords = item.description
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(w => w.length >= 3)
              .slice(0, 4); // Use first 4 keywords

            if (keywords.length > 0) {
              // Search for each keyword and find best match
              const searchTerm = keywords.join(' ');
              const { rows: matches } = await client.query(
                `SELECT id, part_number, description, vendor, cost_each
                 FROM inventory
                 WHERE deleted_at IS NULL AND is_active = TRUE
                   AND LOWER(vendor) = 'amazon business'
                   AND (description ILIKE $1 OR description ILIKE $2)
                 ORDER BY description
                 LIMIT 1`,
                [`%${keywords[0]}%`, keywords.length > 1 ? `%${keywords[1]}%` : `%${keywords[0]}%`]
              );

              if (matches.length > 0) {
                inventoryMatch = matches[0];
              } else {
                // Broader search across all vendors
                const { rows: broadMatches } = await client.query(
                  `SELECT id, part_number, description, vendor, cost_each
                   FROM inventory
                   WHERE deleted_at IS NULL AND is_active = TRUE
                     AND (description ILIKE $1)
                   ORDER BY CASE WHEN LOWER(vendor) = 'amazon business' THEN 0 ELSE 1 END, description
                   LIMIT 1`,
                  [`%${keywords[0]}%`]
                );
                if (broadMatches.length > 0) {
                  inventoryMatch = broadMatches[0];
                }
              }
            }
          }

          matchedLineItems.push({
            description: item.description || 'Amazon item',
            qty: item.quantity || 1,
            cost_each: item.price || 0,
            inventory_item_id: inventoryMatch ? inventoryMatch.id : null,
            matched: !!inventoryMatch,
            match_info: inventoryMatch ? `Matched: ${inventoryMatch.part_number} - ${inventoryMatch.description}` : null
          });
        }

        // Calculate totals
        const subtotal = matchedLineItems.reduce((sum, li) => sum + (li.qty * li.cost_each), 0);
        const total = order.total || subtotal;

        // Create the purchase order
        const poNotes = [
          order.po ? `Amazon PO: ${order.po}` : null,
          order.status ? `Amazon Status: ${order.status}` : null,
          'Imported from Amazon Business via Gmail'
        ].filter(Boolean).join(' | ');

        const { rows: poRows } = await client.query(
          `INSERT INTO purchase_orders (vendor, order_date, order_number, tracking_number, shipping_cost, subtotal, total, notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            'Amazon Business',
            order.date ? new Date(order.date) : new Date(),
            order.orderId || null,
            order.trackingNumber || null,
            0,
            subtotal,
            total,
            poNotes,
            order.status === 'delivered' ? 'received' : 'draft'
          ]
        );

        const po = poRows[0];

        // Insert line items
        for (const li of matchedLineItems) {
          const lineTotal = li.qty * li.cost_each;
          await client.query(
            `INSERT INTO po_line_items (po_id, inventory_item_id, description, qty, cost_each, line_total, matched)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [po.id, li.inventory_item_id, li.description, li.qty, li.cost_each, lineTotal, li.matched]
          );
        }

        // If delivered, mark received_at AND push the matched items into inventory
        if (order.status === 'delivered') {
          await client.query(
            'UPDATE purchase_orders SET received_at = NOW() WHERE id = $1',
            [po.id]
          );
          await applyInventoryReceiving(client, po.id);
        }

        results.imported++;
        results.details.push({
          orderId: order.orderId,
          status: 'imported',
          poId: po.id,
          itemsMatched: matchedLineItems.filter(li => li.matched).length,
          itemsTotal: matchedLineItems.length
        });
      }

      await client.query('COMMIT');
      res.json(results);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/purchase-orders/amazon-import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/supplier-import — Import orders from ANY supplier as POs
// Body: { vendor: string, orders: [{ orderId, date, items: [{description, quantity, price}], trackingNumber, status, notes }] }
// ---------------------------------------------------------------------------
router.post('/supplier-import', async (req, res) => {
  try {
    const { vendor, orders } = req.body;
    if (!vendor || !vendor.trim()) {
      return res.status(400).json({ error: 'vendor is required' });
    }
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'orders array is required' });
    }

    const client = await pool.connect();
    const results = { imported: 0, skipped: 0, details: [] };

    try {
      await client.query('BEGIN');

      for (const order of orders) {
        // Check for duplicates by order_number
        if (order.orderId) {
          const { rows: existing } = await client.query(
            'SELECT id FROM purchase_orders WHERE order_number = $1',
            [order.orderId]
          );
          if (existing.length > 0) {
            results.skipped++;
            results.details.push({ orderId: order.orderId, status: 'skipped', reason: 'Already imported', poId: existing[0].id });
            continue;
          }
        }

        // Auto-match line items to inventory
        const matchedLineItems = [];
        for (const item of (order.items || [])) {
          let inventoryMatch = null;

          if (item.description) {
            const keywords = item.description
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(w => w.length >= 3)
              .slice(0, 4);

            if (keywords.length > 0) {
              // Search vendor-specific inventory first
              const { rows: matches } = await client.query(
                `SELECT id, part_number, description, vendor, cost_each
                 FROM inventory
                 WHERE deleted_at IS NULL AND is_active = TRUE
                   AND LOWER(TRIM(vendor)) = LOWER(TRIM($1))
                   AND (description ILIKE $2 OR description ILIKE $3)
                 ORDER BY description
                 LIMIT 1`,
                [vendor.trim(), `%${keywords[0]}%`, keywords.length > 1 ? `%${keywords[1]}%` : `%${keywords[0]}%`]
              );

              if (matches.length > 0) {
                inventoryMatch = matches[0];
              } else {
                // Broader search across all vendors
                const { rows: broadMatches } = await client.query(
                  `SELECT id, part_number, description, vendor, cost_each
                   FROM inventory
                   WHERE deleted_at IS NULL AND is_active = TRUE
                     AND (description ILIKE $1)
                   ORDER BY CASE WHEN LOWER(TRIM(vendor)) = LOWER(TRIM($2)) THEN 0 ELSE 1 END, description
                   LIMIT 1`,
                  [`%${keywords[0]}%`, vendor.trim()]
                );
                if (broadMatches.length > 0) {
                  inventoryMatch = broadMatches[0];
                }
              }
            }
          }

          matchedLineItems.push({
            description: item.description || `${vendor} item`,
            qty: item.quantity || 1,
            cost_each: item.price || 0,
            inventory_item_id: inventoryMatch ? inventoryMatch.id : null,
            matched: !!inventoryMatch,
            match_info: inventoryMatch ? `Matched: ${inventoryMatch.part_number} - ${inventoryMatch.description}` : null
          });
        }

        const subtotal = matchedLineItems.reduce((sum, li) => sum + (li.qty * li.cost_each), 0);
        const total = order.total || subtotal;

        const poNotes = [
          order.notes || null,
          `Imported from ${vendor.trim()} via email scan`
        ].filter(Boolean).join(' | ');

        const { rows: poRows } = await client.query(
          `INSERT INTO purchase_orders (vendor, order_date, order_number, tracking_number, shipping_cost, subtotal, total, notes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            vendor.trim(),
            order.date ? new Date(order.date) : new Date(),
            order.orderId || null,
            order.trackingNumber || null,
            0,
            subtotal,
            total,
            poNotes,
            (order.status === 'delivered' || order.status === 'shipped') ? 'received' : 'draft'
          ]
        );

        const po = poRows[0];

        for (const li of matchedLineItems) {
          const lineTotal = li.qty * li.cost_each;
          await client.query(
            `INSERT INTO po_line_items (po_id, inventory_item_id, description, qty, cost_each, line_total, matched)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [po.id, li.inventory_item_id, li.description, li.qty, li.cost_each, lineTotal, li.matched]
          );
        }

        if (order.status === 'delivered' || order.status === 'shipped') {
          await client.query(
            'UPDATE purchase_orders SET received_at = NOW() WHERE id = $1',
            [po.id]
          );
          await applyInventoryReceiving(client, po.id);
        }

        results.imported++;
        results.details.push({
          orderId: order.orderId,
          status: 'imported',
          poId: po.id,
          itemsMatched: matchedLineItems.filter(li => li.matched).length,
          itemsTotal: matchedLineItems.length
        });
      }

      await client.query('COMMIT');
      res.json(results);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('POST /api/purchase-orders/supplier-import error:', err);
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
