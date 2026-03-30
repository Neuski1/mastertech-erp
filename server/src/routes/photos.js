const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/records/:recordId/photos
router.get('/:recordId/photos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS created_by_name
       FROM record_photos p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.record_id = $1
       ORDER BY p.category, p.created_at`,
      [req.params.recordId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:recordId/photos
router.post('/:recordId/photos', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { category, label, onedrive_url } = req.body;
  if (!onedrive_url) return res.status(400).json({ error: 'onedrive_url is required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO record_photos (record_id, category, label, onedrive_url, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.recordId, category || 'other', label || null, onedrive_url, req.user?.id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/records/:recordId/photos/:photoId
router.patch('/:recordId/photos/:photoId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const { category, label } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;
  if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
  if (label !== undefined) { updates.push(`label = $${idx++}`); values.push(label); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.photoId, req.params.recordId);
  try {
    const { rows } = await pool.query(
      `UPDATE record_photos SET ${updates.join(', ')} WHERE id = $${idx++} AND record_id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/records/:recordId/photos/:photoId
router.delete('/:recordId/photos/:photoId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM record_photos WHERE id = $1 AND record_id = $2 RETURNING id',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    res.json({ message: 'Photo link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
