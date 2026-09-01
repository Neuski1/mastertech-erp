const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// Marketing image library.
//
// Campaign emails need images at a public URL — an email client is not logged
// into the ERP, and a marketing send goes to hundreds of people, so the
// token-per-recipient trick used for estimate photos does not apply.
//
// Nothing is public until it is deliberately put in this library. A work order
// photo stays private; picking one for a campaign COPIES the bytes into
// marketing_images. Deleting the work order photo never breaks a sent email,
// and adding a photo here is an explicit act, not a side effect.
// ---------------------------------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

let sharpLib;
function getSharp() {
  if (!sharpLib) {
    try { sharpLib = require('sharp'); } catch (err) {
      console.error('sharp not available:', err.message);
      return null;
    }
  }
  return sharpLib;
}

// Email bodies are 600px wide. 1200 covers retina without bloating the send.
const EMAIL_WIDTH = 1200;
const THUMB_WIDTH = 400;

function publicBase() {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '');
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return 'https://mastertech-erp-production-cb96.up.railway.app';
}

function withUrls(row) {
  const base = publicBase();
  return {
    ...row,
    public_url: `${base}/api/public/marketing-images/${row.id}`,
    thumb_url: `${base}/api/public/marketing-images/${row.id}/thumb`,
  };
}

// Resize to email width, produce a thumbnail. Falls back to the original
// bytes if sharp is unavailable so an upload never hard-fails on a dep.
async function processImage(buffer, contentType) {
  const sharp = getSharp();
  if (!sharp) {
    return { full: buffer, thumb: null, width: null, height: null, contentType: contentType || 'image/jpeg' };
  }
  const meta = await sharp(buffer).metadata();
  const full = await sharp(buffer)
    .rotate()
    .resize({ width: EMAIL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  const outMeta = await sharp(full).metadata();
  return {
    full,
    thumb,
    width: outMeta.width || meta.width || null,
    height: outMeta.height || meta.height || null,
    contentType: 'image/jpeg',
  };
}

// ---------------------------------------------------------------------------
// GET /api/marketing-images — the library
// ---------------------------------------------------------------------------
router.get('/', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const includeArchived = req.query.archived === '1';
    const { rows } = await pool.query(
      `SELECT i.id, i.title, i.alt_text, i.filename, i.content_type, i.file_size,
              i.width, i.height, i.source, i.source_record_id, i.source_photo_id,
              i.tags, i.created_at, i.archived_at,
              r.record_number, u.name AS created_by_name
       FROM marketing_images i
       LEFT JOIN records r ON r.id = i.source_record_id
       LEFT JOIN users u ON u.id = i.created_by
       WHERE ${includeArchived ? 'TRUE' : 'i.archived_at IS NULL'}
       ORDER BY i.created_at DESC
       LIMIT 500`
    );
    res.json(rows.map(withUrls));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketing-images/record-photos — browse work order photos
// Search by work order number, customer name, or unit.
// ---------------------------------------------------------------------------
router.get('/record-photos', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const params = [];
    let where = 'p.photo_data IS NOT NULL';
    if (q) {
      params.push(`%${q}%`);
      where += ` AND (r.record_number ILIKE $1 OR c.last_name ILIKE $1 OR c.first_name ILIKE $1
                 OR c.company_name ILIKE $1 OR r.job_description ILIKE $1
                 OR u.make ILIKE $1 OR u.model ILIKE $1)`;
    }
    const { rows } = await pool.query(
      `SELECT p.id, p.record_id, p.category, p.label, p.filename, p.created_at,
              r.record_number, r.job_description,
              c.first_name, c.last_name, c.company_name,
              u.year, u.make, u.model
       FROM record_photos p
       JOIN records r ON r.id = p.record_id
       LEFT JOIN customers c ON c.id = r.customer_id
       LEFT JOIN units u ON u.id = r.unit_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT 60`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketing-images/record-photos/:recordId/:photoId/thumb
// Auth'd preview of a work order photo, for the picker only.
// ---------------------------------------------------------------------------
router.get('/record-photos/:recordId/:photoId/thumb', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT thumbnail_data, photo_data, content_type FROM record_photos WHERE id = $1 AND record_id = $2',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    const data = rows[0].thumbnail_data || rows[0].photo_data;
    if (!data) return res.status(404).json({ error: 'Photo has no image data' });
    res.set('Content-Type', rows[0].content_type || 'image/jpeg');
    res.set('Cache-Control', 'private, max-age=3600');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketing-images — upload from computer
// ---------------------------------------------------------------------------
router.post('/', requireRole('admin', 'service_writer'), (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large — max 25MB per image'
        : err.code === 'LIMIT_FILE_COUNT' ? 'Too many files — max 10 at once'
        : err.message || 'Upload error';
      return res.status(400).json({ error: msg });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images uploaded' });
    const { title, alt_text, tags } = req.body;
    const saved = [];
    for (const file of req.files) {
      const img = await processImage(file.buffer, file.mimetype);
      const { rows } = await pool.query(
        `INSERT INTO marketing_images
           (title, alt_text, filename, content_type, file_size, width, height,
            image_data, thumbnail_data, source, tags, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'upload',$10,$11)
         RETURNING id, title, alt_text, filename, content_type, file_size, width, height,
                   source, source_record_id, source_photo_id, tags, created_at, archived_at`,
        [
          title || file.originalname.replace(/\.[^.]+$/, ''),
          alt_text || null,
          file.originalname,
          img.contentType,
          img.full.length,
          img.width,
          img.height,
          img.full,
          img.thumb,
          tags || null,
          req.user?.id || null,
        ]
      );
      saved.push(withUrls(rows[0]));
    }
    res.status(201).json(saved);
  } catch (err) {
    console.error('Marketing image upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketing-images/from-photo — copy a work order photo in
// ---------------------------------------------------------------------------
router.post('/from-photo', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const { record_id, photo_id, title, alt_text, tags } = req.body;
    if (!record_id || !photo_id) return res.status(400).json({ error: 'record_id and photo_id are required' });

    const { rows: photos } = await pool.query(
      `SELECT p.photo_data, p.content_type, p.filename, p.label, r.record_number
       FROM record_photos p JOIN records r ON r.id = p.record_id
       WHERE p.id = $1 AND p.record_id = $2`,
      [photo_id, record_id]
    );
    if (photos.length === 0) return res.status(404).json({ error: 'Photo not found' });
    if (!photos[0].photo_data) return res.status(400).json({ error: 'That photo is an OneDrive link, not a stored image. Upload the file instead.' });

    const img = await processImage(photos[0].photo_data, photos[0].content_type);
    const { rows } = await pool.query(
      `INSERT INTO marketing_images
         (title, alt_text, filename, content_type, file_size, width, height,
          image_data, thumbnail_data, source, source_record_id, source_photo_id, tags, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'record_photo',$10,$11,$12,$13)
       RETURNING id, title, alt_text, filename, content_type, file_size, width, height,
                 source, source_record_id, source_photo_id, tags, created_at, archived_at`,
      [
        title || photos[0].label || `WO ${photos[0].record_number}`,
        alt_text || null,
        photos[0].filename || `wo-${photos[0].record_number}.jpg`,
        img.contentType,
        img.full.length,
        img.width,
        img.height,
        img.full,
        img.thumb,
        record_id,
        photo_id,
        tags || null,
        req.user?.id || null,
      ]
    );
    res.status(201).json(withUrls(rows[0]));
  } catch (err) {
    console.error('Marketing image from-photo error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/marketing-images/:id — title, alt text, tags
// ---------------------------------------------------------------------------
router.patch('/:id', requireRole('admin', 'service_writer'), async (req, res) => {
  try {
    const fields = [];
    const params = [];
    let i = 1;
    for (const key of ['title', 'alt_text', 'tags']) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); params.push(req.body[key]); }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE marketing_images SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, title, alt_text, filename, content_type, file_size, width, height,
                 source, source_record_id, source_photo_id, tags, created_at, archived_at`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    res.json(withUrls(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/marketing-images/:id — archive, never destroy.
// A sent email points at this URL forever.
// ---------------------------------------------------------------------------
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE marketing_images SET archived_at = NOW() WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    res.json({ success: true, archived: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
