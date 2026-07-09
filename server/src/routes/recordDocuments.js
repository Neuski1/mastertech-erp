const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// Store uploads in memory, then persist the buffer to Postgres (BYTEA),
// mirroring the record photos flow. Accept PDFs and images.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    cb(ok ? null : new Error('Only PDF or image files are allowed'), ok);
  },
});

// GET /api/records/:recordId/documents — list (metadata only, no binary)
router.get('/:recordId/documents', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, record_id, doc_type, title, mime_type, file_size, created_by, created_at
         FROM record_documents
        WHERE record_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC`,
      [req.params.recordId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET record documents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:recordId/documents — upload a document (multipart: document, doc_type, title)
router.post('/:recordId/documents',
  requireRole('admin', 'service_writer', 'technician', 'bookkeeper'),
  (req, res, next) => {
    upload.single('document')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const allowed = ['insurance', 'warranty', 'other'];
      let docType = String(req.body.doc_type || 'other').toLowerCase();
      if (!allowed.includes(docType)) docType = 'other';
      const title = String(req.body.title || req.file.originalname || 'Document').slice(0, 255);
      const { rows } = await pool.query(
        `INSERT INTO record_documents (record_id, doc_type, title, file_data, mime_type, file_size, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, record_id, doc_type, title, mime_type, file_size, created_by, created_at`,
        [req.params.recordId, docType, title, req.file.buffer, req.file.mimetype, req.file.size, req.user?.id || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Document upload error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/records/:recordId/documents/:docId/download — stream the file
router.get('/:recordId/documents/:docId/download', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT title, file_data, mime_type FROM record_documents
        WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL`,
      [req.params.docId, req.params.recordId]
    );
    if (!rows.length || !rows[0].file_data) return res.status(404).json({ error: 'Document not found' });
    const doc = rows[0];
    let name = (doc.title || 'document').replace(/"/g, '');
    if (doc.mime_type === 'application/pdf' && !/\.pdf$/i.test(name)) name += '.pdf';
    res.set('Content-Type', doc.mime_type || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${name}"`);
    res.set('Cache-Control', 'private, max-age=3600');
    res.send(doc.file_data);
  } catch (err) {
    console.error('Document download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/records/:recordId/documents/:docId — soft delete
router.delete('/:recordId/documents/:docId',
  requireRole('admin', 'service_writer', 'technician', 'bookkeeper'),
  async (req, res) => {
    try {
      const { rowCount } = await pool.query(
        `UPDATE record_documents SET deleted_at = NOW()
          WHERE id = $1 AND record_id = $2 AND deleted_at IS NULL`,
        [req.params.docId, req.params.recordId]
      );
      if (!rowCount) return res.status(404).json({ error: 'Document not found' });
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
