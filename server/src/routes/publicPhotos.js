const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// Public (token-protected) photo access for customer-facing emails.
//
// Estimate and invoice emails include photo View / Download links. Customers
// are not logged into the ERP, so the normal /api/records/... photo routes
// (mounted behind requireAuth) reject them with "Authentication required".
//
// These routes are mounted at /api/public/records (BEFORE the auth middleware
// in app.js) and require a ?token= that matches the record's approval_token
// or payment_token — the same tokens already embedded in the email links the
// customer received. No token, no photo.
// ---------------------------------------------------------------------------

async function validateToken(recordId, token) {
  if (!token || !String(token).trim()) return false;
  const t = String(token).trim();
  const { rows } = await pool.query(
    `SELECT 1 FROM records
       WHERE id = $1 AND (photo_token::text = $2 OR approval_token::text = $2 OR payment_token::text = $2)
     UNION ALL
     SELECT 1 FROM online_payments
       WHERE record_id = $1 AND payment_token::text = $2
     UNION ALL
     SELECT 1 FROM estimate_line_approvals
       WHERE record_id = $1 AND approval_token::text = $2`,
    [recordId, t]
  );
  return rows.length > 0;
}

// GET /api/public/records/:recordId/photos/:photoId/image?token=...&download=1
router.get('/:recordId/photos/:photoId/image', async (req, res) => {
  try {
    const ok = await validateToken(req.params.recordId, req.query.token);
    if (!ok) return res.status(403).json({ error: 'This photo link is invalid or expired. Please use the links from your most recent email, or contact Master Tech RV at (303) 557-2214.' });

    const { rows } = await pool.query(
      'SELECT photo_data, content_type, filename FROM record_photos WHERE id = $1 AND record_id = $2',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0 || !rows[0].photo_data) return res.status(404).json({ error: 'Photo not found' });

    const wantDownload = req.query.download === '1' || req.query.download === 'true';
    const filename = rows[0].filename || 'photo.jpg';
    res.set('Content-Type', rows[0].content_type || 'image/jpeg');
    res.set('Content-Disposition', `${wantDownload ? 'attachment' : 'inline'}; filename="${filename}"`);
    res.set('Cache-Control', 'private, max-age=86400');
    res.send(rows[0].photo_data);
  } catch (err) {
    console.error('Public photo error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/records/:recordId/photos/download-all?token=...
// Every photo on the work order as one .zip, for the "Download all photos"
// link in invoice and estimate emails.
router.get('/:recordId/photos/download-all', async (req, res) => {
  try {
    const ok = await validateToken(req.params.recordId, req.query.token);
    if (!ok) return res.status(403).json({ error: 'This photo link is invalid or expired. Please use the links from your most recent email, or contact Master Tech RV at (303) 557-2214.' });
    const { streamPhotoZip } = require('./photos');
    await streamPhotoZip(req.params.recordId, res);
  } catch (err) {
    console.error('Public photo zip error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// Returns the record's permanent photo token, creating one if missing.
async function ensurePhotoToken(recordId) {
  const { rows } = await pool.query(
    `UPDATE records SET photo_token = COALESCE(photo_token, gen_random_uuid())
      WHERE id = $1 RETURNING photo_token`,
    [recordId]
  );
  return rows[0] ? String(rows[0].photo_token) : '';
}

module.exports = router;
module.exports.ensurePhotoToken = ensurePhotoToken;
