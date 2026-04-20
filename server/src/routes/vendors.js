const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/vendors — List all distinct vendors from inventory
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT vendor AS name, COUNT(*) AS item_count
       FROM inventory
       WHERE deleted_at IS NULL AND vendor IS NOT NULL AND vendor != ''
       GROUP BY vendor
       ORDER BY vendor`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/vendors error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/vendors — Create a new vendor (adds to first inventory item or no-op)
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }
    // Just return the name — vendors are derived from inventory.vendor column
    res.json({ name: name.trim() });
  } catch (err) {
    console.error('POST /api/vendors error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/vendors/:name/parts — List inventory items for a vendor
// ---------------------------------------------------------------------------
router.get('/:name/parts', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, part_number, description, qty_on_hand
       FROM inventory
       WHERE deleted_at IS NULL AND vendor = $1
       ORDER BY description`,
      [req.params.name]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/vendors/:name/parts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/vendors/:name — Delete vendor (only if no inventory items use it)
// ---------------------------------------------------------------------------
router.delete('/:name', requireRole('admin'), async (req, res) => {
  const vendorName = req.params.name;

  try {
    const { rows } = await pool.query(
      `SELECT id, part_number, description, qty_on_hand
       FROM inventory
       WHERE deleted_at IS NULL AND vendor = $1
       ORDER BY description`,
      [vendorName]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        error: 'Vendor in use',
        count: rows.length,
        parts: rows,
      });
    }

    res.json({ message: `Vendor "${vendorName}" deleted.` });
  } catch (err) {
    console.error('DELETE /api/vendors/:name error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/vendors/bulk-update — Bulk reassign vendor on inventory items
// ---------------------------------------------------------------------------
router.patch('/bulk-update', requireRole('admin'), async (req, res) => {
  const { parts } = req.body;

  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    return res.status(400).json({ error: 'parts array is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const part of parts) {
      await client.query(
        `UPDATE inventory SET vendor = $1 WHERE id = $2 AND deleted_at IS NULL`,
        [part.vendor || null, part.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Updated vendor on ${parts.length} items.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH /api/vendors/bulk-update error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PUT /api/vendors/:name/rename — Rename a vendor across all inventory items
// ---------------------------------------------------------------------------
router.put('/:name/rename', requireRole('admin'), async (req, res) => {
  const oldName = req.params.name;
  const { newName } = req.body || {};
  if (!newName || !String(newName).trim()) {
    return res.status(400).json({ error: 'newName is required' });
  }
  try {
    const { rowCount } = await pool.query(
      'UPDATE inventory SET vendor = $1 WHERE deleted_at IS NULL AND vendor = $2',
      [String(newName).trim(), oldName]
    );
    res.json({ updated: rowCount });
  } catch (err) {
    console.error('PUT /api/vendors/:name/rename error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/vendors/merge — Merge multiple vendors into a single canonical name
// Body: { vendors: string[], mergeInto: string }
// ---------------------------------------------------------------------------
router.post('/merge', requireRole('admin'), async (req, res) => {
  const { vendors, mergeInto } = req.body || {};
  if (!Array.isArray(vendors) || vendors.length < 2) {
    return res.status(400).json({ error: 'vendors must be an array of at least 2 names' });
  }
  if (!mergeInto || !String(mergeInto).trim()) {
    return res.status(400).json({ error: 'mergeInto is required' });
  }
  try {
    const { rowCount } = await pool.query(
      'UPDATE inventory SET vendor = $1 WHERE deleted_at IS NULL AND vendor = ANY($2::text[])',
      [String(mergeInto).trim(), vendors]
    );
    res.json({ updated: rowCount });
  } catch (err) {
    console.error('POST /api/vendors/merge error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
