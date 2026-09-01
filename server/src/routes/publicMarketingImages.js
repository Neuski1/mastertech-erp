const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// Public image serving for campaign emails.
//
// Mounted at /api/public/marketing-images BEFORE the auth middleware. No token:
// an email goes to hundreds of inboxes and every mail client fetches the image
// anonymously. Only images deliberately added to the marketing library are
// reachable here — work order photos stay behind the token-protected route in
// publicPhotos.js.
// ---------------------------------------------------------------------------

async function serve(req, res, column) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(404).json({ error: 'Image not found' });
    const { rows } = await pool.query(
      `SELECT ${column} AS data, image_data, content_type, filename
       FROM marketing_images WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    const data = rows[0].data || rows[0].image_data;
    if (!data) return res.status(404).json({ error: 'Image not found' });
    res.set('Content-Type', rows[0].content_type || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="${rows[0].filename || 'image.jpg'}"`);
    // Immutable: the bytes for an id never change, and mail clients and image
    // proxies (Gmail's especially) will cache hard either way.
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(data);
  } catch (err) {
    console.error('Public marketing image error:', err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/public/marketing-images/:id
router.get('/:id', (req, res) => serve(req, res, 'image_data'));

// GET /api/public/marketing-images/:id/thumb
router.get('/:id/thumb', (req, res) => serve(req, res, 'thumbnail_data'));

module.exports = router;
