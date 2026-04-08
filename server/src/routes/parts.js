const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/parts/search?q=<term> — Unified search across inventory + parts catalog
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  const term = `%${q}%`;

  try {
    // Query 1: Inventory items
    const invSQL = `
      SELECT id, part_number, description, vendor_part_number, vendor,
             qty_on_hand, cost_each, sale_price_each, location,
             'inventory' AS source
      FROM inventory
      WHERE deleted_at IS NULL AND is_active = TRUE
        AND (description ILIKE $1 OR part_number ILIKE $1 OR vendor_part_number ILIKE $1 OR vendor ILIKE $1)
      ORDER BY description
      LIMIT 20`;

    // Query 2: Parts catalog (non-inventory history)
    const catSQL = `
      SELECT id, description, vendor_part_number, vendor,
             last_cost AS cost_each, last_sale_price AS sale_price_each,
             times_used, last_used_date,
             'catalog' AS source
      FROM parts_catalog
      WHERE description ILIKE $1 OR vendor_part_number ILIKE $1 OR vendor ILIKE $1
      ORDER BY times_used DESC, last_used_date DESC NULLS LAST
      LIMIT 20`;

    const [invRes, catRes] = await Promise.all([
      pool.query(invSQL, [term]),
      pool.query(catSQL, [term]),
    ]);

    // Deduplicate: if a catalog entry matches an inventory description, skip it
    const invDescriptions = new Set(invRes.rows.map(r => r.description.toLowerCase()));
    const filteredCatalog = catRes.rows.filter(r => !invDescriptions.has(r.description.toLowerCase()));

    // Inventory first, then catalog
    const results = [...invRes.rows, ...filteredCatalog];

    res.json(results);
  } catch (err) {
    console.error('GET /api/parts/search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/parts/:recordId — Add parts line
// ---------------------------------------------------------------------------
router.post('/:recordId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId } = req.params;
  const {
    inventory_id, is_inventory_part,
    part_number, description, quantity,
    cost_each, sale_price_each, taxable, vendor
  } = req.body;

  if ((!description && !is_inventory_part) || quantity === undefined) {
    return res.status(400).json({ error: 'description and quantity are required (sale_price_each auto-filled for inventory parts)' });
  }

  const parsedQty = parseFloat(quantity);
  const parsedPrice = parseFloat(sale_price_each);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive number' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify record exists and is editable
    const { rows: recRows } = await client.query(
      "SELECT id, status FROM records WHERE id = $1 AND deleted_at IS NULL",
      [recordId]
    );
    if (recRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }
    if (['paid', 'void'].includes(recRows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot add parts to a paid or voided record' });
    }

    let finalPartNumber = part_number || null;
    let finalDescription = description;
    let finalCostEach = cost_each !== undefined ? parseFloat(cost_each) : null;
    let finalSalePrice = parsedPrice;
    let finalInventoryId = null;
    let isInvPart = false;

    // Inventory part: auto-fill fields and decrement stock
    if (is_inventory_part && inventory_id) {
      const { rows: invRows } = await client.query(
        'SELECT * FROM inventory WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE',
        [inventory_id]
      );
      if (invRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Inventory item not found or inactive' });
      }

      const inv = invRows[0];
      finalInventoryId = inv.id;
      isInvPart = true;
      finalPartNumber = inv.part_number;
      finalDescription = inv.description;
      finalCostEach = parseFloat(inv.cost_each) || null;
      // Use user-provided sale price if given, otherwise fall back to inventory price
      finalSalePrice = (sale_price_each !== undefined && sale_price_each !== null && !isNaN(parseFloat(sale_price_each)))
        ? parseFloat(sale_price_each)
        : parseFloat(inv.sale_price_each);

      // Decrement inventory
      await client.query(
        'UPDATE inventory SET qty_on_hand = qty_on_hand - $1 WHERE id = $2',
        [parsedQty, inv.id]
      );
    }

    const lineTotal = parseFloat((parsedQty * finalSalePrice).toFixed(2));

    // Get next sort_order
    const sortRes = await client.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort FROM record_parts_lines WHERE record_id = $1 AND deleted_at IS NULL',
      [recordId]
    );

    const finalVendor = is_inventory_part ? null : (vendor || null);

    const { rows } = await client.query(
      `INSERT INTO record_parts_lines
         (record_id, inventory_id, is_inventory_part, part_number, description,
          quantity, cost_each, sale_price_each, line_total, taxable, sort_order, vendor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [recordId, finalInventoryId, isInvPart, finalPartNumber, finalDescription,
       parsedQty, finalCostEach, finalSalePrice, lineTotal,
       taxable !== undefined ? taxable : true, sortRes.rows[0].next_sort, finalVendor]
    );

    await recalculateTotals(recordId, client);
    await client.query('COMMIT');

    // Auto-save non-inventory part to inventory + parts_catalog (fire and forget)
    if (!isInvPart && finalDescription) {
      // Save to inventory table (no internal part number)
      (async () => {
        try {
          // Check if already exists by description + vendor match
          const existing = await pool.query(
            `SELECT id FROM inventory WHERE LOWER(description) = LOWER($1) AND deleted_at IS NULL LIMIT 1`,
            [finalDescription]
          );
          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO inventory (part_number, description, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, is_active)
               VALUES ($1, $2, $3, $4, 0, $5, $6, TRUE)`,
              [
                req.body.vendor_part_number || req.body.part_number || null,
                finalDescription,
                finalVendor,
                req.body.vendor_part_number || null,
                finalCostEach,
                finalSalePrice,
              ]
            );
            console.log(`Auto-added to inventory: "${finalDescription}" (no internal part number)`);
          }
        } catch (invErr) {
          console.error('Auto-add to inventory error (non-blocking):', invErr.message);
        }
      })();
      const catalogVendorPart = req.body.vendor_part_number || null;
      const catalogVendor = finalVendor;
      (async () => {
        try {
          // Match on vendor_part_number if provided, else exact description
          let match = null;
          if (catalogVendorPart) {
            const r = await pool.query(
              'SELECT id FROM parts_catalog WHERE vendor_part_number = $1 LIMIT 1',
              [catalogVendorPart]
            );
            if (r.rows.length > 0) match = r.rows[0];
          }
          if (!match) {
            const r = await pool.query(
              'SELECT id FROM parts_catalog WHERE LOWER(description) = LOWER($1) LIMIT 1',
              [finalDescription]
            );
            if (r.rows.length > 0) match = r.rows[0];
          }

          if (match) {
            await pool.query(
              `UPDATE parts_catalog SET
                last_cost = COALESCE($1, last_cost),
                last_sale_price = COALESCE($2, last_sale_price),
                last_used_date = CURRENT_DATE,
                last_used_record_id = $3,
                times_used = times_used + 1,
                vendor = COALESCE($4, vendor),
                vendor_part_number = COALESCE($5, vendor_part_number),
                updated_at = NOW()
              WHERE id = $6`,
              [finalCostEach, finalSalePrice, recordId, catalogVendor, catalogVendorPart, match.id]
            );
          } else {
            await pool.query(
              `INSERT INTO parts_catalog
                (description, vendor_part_number, vendor, last_cost, last_sale_price,
                 last_used_date, last_used_record_id)
              VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)`,
              [finalDescription, catalogVendorPart, catalogVendor, finalCostEach, finalSalePrice, recordId]
            );
          }
        } catch (e) {
          console.error('Parts catalog upsert error (non-blocking):', e.message);
        }
      })();
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST parts error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/parts/:recordId/:lineId — Edit parts line
// ---------------------------------------------------------------------------
router.patch('/:recordId/:lineId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId, lineId } = req.params;
  const { description, quantity, sale_price_each, taxable, cost_each } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: lineRows } = await client.query(
      'SELECT * FROM record_parts_lines WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL',
      [lineId, recordId]
    );
    if (lineRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Parts line not found' });
    }

    const existing = lineRows[0];
    const updates = [];
    const values = [];
    let idx = 1;

    let newQty = parseFloat(existing.quantity);
    let newPrice = parseFloat(existing.sale_price_each);

    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (cost_each !== undefined) {
      const parsedCost = cost_each !== null && cost_each !== '' ? parseFloat(cost_each) : null;
      updates.push(`cost_each = $${idx++}`);
      values.push(parsedCost);

      // Also update inventory cost so it stays current
      if (existing.inventory_id && parsedCost !== null) {
        await client.query(
          'UPDATE inventory SET cost_each = $1 WHERE id = $2',
          [parsedCost, existing.inventory_id]
        );
      }
    }
    if (quantity !== undefined) {
      newQty = parseFloat(quantity);
      if (isNaN(newQty) || newQty <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'quantity must be a positive number' });
      }
      updates.push(`quantity = $${idx++}`);
      values.push(newQty);

      // Adjust inventory if inventory part
      if (existing.is_inventory_part && existing.inventory_id) {
        const qtyDiff = newQty - parseFloat(existing.quantity);
        if (qtyDiff !== 0) {
          await client.query(
            'UPDATE inventory SET qty_on_hand = qty_on_hand - $1 WHERE id = $2',
            [qtyDiff, existing.inventory_id]
          );
        }
      }
    }
    if (sale_price_each !== undefined) {
      newPrice = parseFloat(sale_price_each);
      updates.push(`sale_price_each = $${idx++}`);
      values.push(newPrice);
    }
    if (taxable !== undefined) {
      updates.push(`taxable = $${idx++}`);
      values.push(taxable);
    }

    // Recalc line_total if qty or price changed
    if (quantity !== undefined || sale_price_each !== undefined) {
      const lineTotal = parseFloat((newQty * newPrice).toFixed(2));
      updates.push(`line_total = $${idx++}`);
      values.push(lineTotal);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(lineId);
    await client.query(
      `UPDATE record_parts_lines SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    await recalculateTotals(recordId, client);
    await client.query('COMMIT');

    const { rows: updated } = await pool.query(
      'SELECT * FROM record_parts_lines WHERE id = $1', [lineId]
    );
    res.json(updated[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH parts error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/parts/:recordId/:lineId — Soft delete + restore inventory
// ---------------------------------------------------------------------------
router.delete('/:recordId/:lineId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { recordId, lineId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: lineRows } = await client.query(
      'SELECT * FROM record_parts_lines WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL',
      [lineId, recordId]
    );
    if (lineRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Parts line not found' });
    }

    const line = lineRows[0];

    // Restore inventory if it was an inventory part
    if (line.is_inventory_part && line.inventory_id) {
      await client.query(
        'UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2',
        [parseFloat(line.quantity), line.inventory_id]
      );
    }

    await client.query(
      'UPDATE record_parts_lines SET deleted_at = NOW() WHERE id = $1',
      [lineId]
    );

    await recalculateTotals(recordId, client);
    await client.query('COMMIT');

    res.json({ message: 'Parts line deleted', inventory_restored: line.is_inventory_part });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE parts error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
