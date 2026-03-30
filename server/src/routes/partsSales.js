const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const { getSetting } = require('../db/calculations');

// ---------------------------------------------------------------------------
// Recalculate totals for a parts sale
// ---------------------------------------------------------------------------
async function recalcPartsSale(saleId, db) {
  const conn = db || pool;

  const linesRes = await conn.query(
    `SELECT COALESCE(SUM(line_total), 0) AS subtotal
     FROM parts_sale_lines WHERE parts_sale_id = $1`,
    [saleId]
  );
  const subtotal = parseFloat(linesRes.rows[0].subtotal);

  const saleRes = await conn.query(
    `SELECT tax_rate, cc_fee_applied, discount_amount, amount_paid FROM parts_sales WHERE id = $1`,
    [saleId]
  );
  const sale = saleRes.rows[0];
  const taxRate = parseFloat(sale.tax_rate) || 0.0975;
  const discountAmount = parseFloat(sale.discount_amount) || 0;
  const amountPaid = parseFloat(sale.amount_paid) || 0;

  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));

  const ccFeeRate = (await getSetting('cc_fee_rate')) || 0.03;
  const ccFeeAmount = sale.cc_fee_applied
    ? parseFloat(((subtotal + taxAmount) * ccFeeRate).toFixed(2))
    : 0;

  const totalAmount = parseFloat((subtotal + taxAmount + ccFeeAmount - discountAmount).toFixed(2));
  const amountDue = parseFloat((totalAmount - amountPaid).toFixed(2));

  await conn.query(
    `UPDATE parts_sales SET
       subtotal = $2, tax_amount = $3, cc_fee_amount = $4,
       total_amount = $5, amount_due = $6
     WHERE id = $1`,
    [saleId, subtotal, taxAmount, ccFeeAmount, totalAmount, amountDue]
  );

  return { subtotal, taxAmount, ccFeeAmount, totalAmount, amountDue };
}

// ---------------------------------------------------------------------------
// GET /api/parts-sales — List all parts sales
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  let where = [];
  let params = [];
  let idx = 1;

  if (status) {
    where.push(`ps.status = $${idx++}`);
    params.push(status);
  }
  if (search) {
    where.push(`(ps.sale_number ILIKE $${idx} OR ps.customer_name ILIKE $${idx} OR c.last_name ILIKE $${idx} OR c.first_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT ps.*,
              c.first_name, c.last_name, c.company_name, c.phone_primary, c.email_primary
       FROM parts_sales ps
       LEFT JOIN customers c ON c.id = ps.customer_id
       ${whereClause}
       ORDER BY ps.created_at DESC
       LIMIT 200`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/parts-sales — Create new parts sale
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id, customer_name, notes } = req.body;

  try {
    // Generate next sale number
    const numRes = await pool.query(
      `SELECT sale_number FROM parts_sales ORDER BY id DESC LIMIT 1`
    );
    let nextNum = 1;
    if (numRes.rows.length > 0) {
      const last = numRes.rows[0].sale_number;
      const match = last.match(/PS-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const saleNumber = `PS-${String(nextNum).padStart(4, '0')}`;

    const taxRate = (await getSetting('tax_rate')) || 0.0975;

    const { rows } = await pool.query(
      `INSERT INTO parts_sales (sale_number, customer_id, customer_name, notes, tax_rate, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [saleNumber, customer_id || null, customer_name || null, notes || null, taxRate, req.user.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/parts-sales error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/parts-sales/:id — Get single parts sale with lines
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { rows: saleRows } = await pool.query(
      `SELECT ps.*,
              c.first_name, c.last_name, c.company_name, c.phone_primary, c.email_primary,
              c.address_street, c.address_city, c.address_state, c.address_zip
       FROM parts_sales ps
       LEFT JOIN customers c ON c.id = ps.customer_id
       WHERE ps.id = $1`,
      [req.params.id]
    );

    if (saleRows.length === 0) {
      return res.status(404).json({ error: 'Parts sale not found' });
    }

    const { rows: lines } = await pool.query(
      `SELECT psl.*, i.part_number AS inv_part_number, i.qty_on_hand
       FROM parts_sale_lines psl
       LEFT JOIN inventory i ON i.id = psl.inventory_item_id
       WHERE psl.parts_sale_id = $1
       ORDER BY psl.id`,
      [req.params.id]
    );

    res.json({ ...saleRows[0], lines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/parts-sales/:id — Update sale fields
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { customer_id, customer_name, notes, cc_fee_applied, discount_amount, discount_description } = req.body;

  const updates = [];
  const values = [];
  let idx = 1;

  if (customer_id !== undefined) { updates.push(`customer_id = $${idx++}`); values.push(customer_id); }
  if (customer_name !== undefined) { updates.push(`customer_name = $${idx++}`); values.push(customer_name); }
  if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
  if (cc_fee_applied !== undefined) { updates.push(`cc_fee_applied = $${idx++}`); values.push(cc_fee_applied); }
  if (discount_amount !== undefined) { updates.push(`discount_amount = $${idx++}`); values.push(parseFloat(discount_amount) || 0); }
  if (discount_description !== undefined) { updates.push(`discount_description = $${idx++}`); values.push(discount_description); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    await pool.query(
      `UPDATE parts_sales SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    // Recalculate totals (cc_fee or discount may have changed)
    await recalcPartsSale(req.params.id);

    const { rows } = await pool.query('SELECT * FROM parts_sales WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/parts-sales/:id — Void sale (restore all inventory)
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Restore inventory for all lines with inventory items
    const { rows: lines } = await client.query(
      `SELECT * FROM parts_sale_lines WHERE parts_sale_id = $1 AND is_inventory_item = TRUE`,
      [req.params.id]
    );

    for (const line of lines) {
      if (line.inventory_item_id) {
        await client.query(
          `UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2`,
          [line.quantity, line.inventory_item_id]
        );
      }
    }

    await client.query(
      `UPDATE parts_sales SET status = 'void', amount_due = 0 WHERE id = $1`,
      [req.params.id]
    );

    await client.query('COMMIT');

    const { rows } = await client.query('SELECT * FROM parts_sales WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/parts-sales/:id/lines — Add line item
// ---------------------------------------------------------------------------
router.post('/:id/lines', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { inventory_item_id, is_inventory_item, part_number, description, quantity, unit_price } = req.body;

  if (!description || !quantity || !unit_price) {
    return res.status(400).json({ error: 'description, quantity, and unit_price are required' });
  }

  const qty = parseInt(quantity);
  const price = parseFloat(unit_price);
  const lineTotal = parseFloat((qty * price).toFixed(2));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check sale is open
    const { rows: saleCheck } = await client.query(
      `SELECT status FROM parts_sales WHERE id = $1`, [req.params.id]
    );
    if (saleCheck.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Sale not found' }); }
    if (saleCheck[0].status !== 'open') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Cannot add lines to a ' + saleCheck[0].status + ' sale' }); }

    // Decrement inventory if applicable
    if (is_inventory_item && inventory_item_id) {
      await client.query(
        `UPDATE inventory SET qty_on_hand = qty_on_hand - $1 WHERE id = $2`,
        [qty, inventory_item_id]
      );
    }

    const { rows } = await client.query(
      `INSERT INTO parts_sale_lines (parts_sale_id, inventory_item_id, is_inventory_item, part_number, description, quantity, unit_price, line_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.params.id, inventory_item_id || null, !!is_inventory_item, part_number || null, description, qty, price, lineTotal]
    );

    await recalcPartsSale(req.params.id, client);
    await client.query('COMMIT');

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/parts-sales/:id/lines/:lid — Edit line
// ---------------------------------------------------------------------------
router.patch('/:id/lines/:lid', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { description, quantity, unit_price } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      `SELECT * FROM parts_sale_lines WHERE id = $1 AND parts_sale_id = $2`,
      [req.params.lid, req.params.id]
    );
    if (existing.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Line not found' }); }

    const line = existing[0];
    const newQty = quantity !== undefined ? parseInt(quantity) : line.quantity;
    const newPrice = unit_price !== undefined ? parseFloat(unit_price) : parseFloat(line.unit_price);
    const newDesc = description !== undefined ? description : line.description;
    const newTotal = parseFloat((newQty * newPrice).toFixed(2));

    // Adjust inventory if quantity changed
    if (line.is_inventory_item && line.inventory_item_id && quantity !== undefined) {
      const diff = line.quantity - newQty; // positive = restore, negative = take more
      if (diff !== 0) {
        await client.query(
          `UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2`,
          [diff, line.inventory_item_id]
        );
      }
    }

    await client.query(
      `UPDATE parts_sale_lines SET description = $1, quantity = $2, unit_price = $3, line_total = $4
       WHERE id = $5`,
      [newDesc, newQty, newPrice, newTotal, req.params.lid]
    );

    await recalcPartsSale(req.params.id, client);
    await client.query('COMMIT');

    const { rows } = await client.query('SELECT * FROM parts_sale_lines WHERE id = $1', [req.params.lid]);
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/parts-sales/:id/lines/:lid — Remove line (restore inventory)
// ---------------------------------------------------------------------------
router.delete('/:id/lines/:lid', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      `SELECT * FROM parts_sale_lines WHERE id = $1 AND parts_sale_id = $2`,
      [req.params.lid, req.params.id]
    );
    if (existing.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Line not found' }); }

    const line = existing[0];

    // Restore inventory
    if (line.is_inventory_item && line.inventory_item_id) {
      await client.query(
        `UPDATE inventory SET qty_on_hand = qty_on_hand + $1 WHERE id = $2`,
        [line.quantity, line.inventory_item_id]
      );
    }

    await client.query('DELETE FROM parts_sale_lines WHERE id = $1', [req.params.lid]);

    await recalcPartsSale(req.params.id, client);
    await client.query('COMMIT');

    res.json({ message: 'Line deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/parts-sales/:id/payment — Record payment
// ---------------------------------------------------------------------------
router.post('/:id/payment', requireRole('admin', 'service_writer', 'bookkeeper', 'technician'), async (req, res) => {
  const { payment_method, payment_reference, amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'amount is required' });
  }

  try {
    const { rows: saleRows } = await pool.query('SELECT * FROM parts_sales WHERE id = $1', [req.params.id]);
    if (saleRows.length === 0) return res.status(404).json({ error: 'Sale not found' });

    const newPaid = parseFloat(saleRows[0].amount_paid) + parseFloat(amount);
    const newDue = parseFloat(saleRows[0].total_amount) - newPaid;
    const newStatus = newDue <= 0.005 ? 'paid' : 'open';

    await pool.query(
      `UPDATE parts_sales SET
         amount_paid = $2, amount_due = $3, status = $4,
         payment_method = $5, payment_reference = $6
       WHERE id = $1`,
      [req.params.id, newPaid.toFixed(2), newDue.toFixed(2), newStatus, payment_method || null, payment_reference || null]
    );

    const { rows } = await pool.query('SELECT * FROM parts_sales WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
