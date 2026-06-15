const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// Configure multer — store in memory for processing with sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Lazy-load sharp
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

// ---------------------------------------------------------------------------
// GET /api/records/:recordId/photos — List photos (metadata only, no binary)
// ---------------------------------------------------------------------------
router.get('/:recordId/photos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.record_id, p.category, p.label, p.onedrive_url,
              p.filename, p.content_type, p.file_size, p.created_by, p.created_at,
              u.name AS created_by_name
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

// ---------------------------------------------------------------------------
// POST /api/records/:recordId/photos — Upload photos directly from phone/browser
// ---------------------------------------------------------------------------
router.post('/:recordId/photos', requireRole('admin', 'service_writer', 'technician'), (req, res, next) => {
  upload.array('photos', 20)(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large — max 25MB per photo'
        : err.code === 'LIMIT_FILE_COUNT' ? 'Too many files — max 20 at once'
        : err.message || 'Upload error';
      return res.status(400).json({ error: msg });
    }
    next();
  });
}, async (req, res) => {
  try {
    const recordId = req.params.recordId;

    // If no files, fall back to old OneDrive link behavior
    if (!req.files || req.files.length === 0) {
      const { category, label, onedrive_url } = req.body;
      if (!onedrive_url) return res.status(400).json({ error: 'No photos uploaded and no onedrive_url provided' });
      const { rows } = await pool.query(
        `INSERT INTO record_photos (record_id, category, label, onedrive_url, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [recordId, category || 'other', label || null, onedrive_url, req.user?.id || null]
      );
      return res.status(201).json(rows[0]);
    }

    // Direct upload flow
    const { rows: rec } = await pool.query('SELECT id FROM records WHERE id = $1', [recordId]);
    if (rec.length === 0) return res.status(404).json({ error: 'Record not found' });

    const sharp = getSharp();
    const category = req.body.category || 'upload';
    const results = [];

    for (const file of req.files) {
      try {
        let photoBuffer = file.buffer;
        let thumbBuffer = null;
        let contentType = 'image/jpeg';
        let fileSize = file.size;

        if (sharp) {
          // Resize main photo: max 1600px on longest side, JPEG 80% quality
          photoBuffer = await sharp(file.buffer)
            .rotate() // auto-rotate based on EXIF orientation
            .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();
          fileSize = photoBuffer.length;

          // Generate thumbnail: 300px max
          thumbBuffer = await sharp(file.buffer)
            .rotate()
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 70 })
            .toBuffer();
        } else {
          contentType = file.mimetype;
        }

        const { rows } = await pool.query(
          `INSERT INTO record_photos (record_id, category, label, filename, content_type, file_size, photo_data, thumbnail_data, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, record_id, category, label, filename, content_type, file_size, created_by, created_at`,
          [recordId, category, file.originalname, file.originalname, contentType, fileSize, photoBuffer, thumbBuffer, req.user.id]
        );
        results.push(rows[0]);
      } catch (err) {
        console.error(`Photo processing error for ${file.originalname}:`, err.message);
        // Fallback: store original without processing
        try {
          const { rows } = await pool.query(
            `INSERT INTO record_photos (record_id, category, label, filename, content_type, file_size, photo_data, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, record_id, category, label, filename, content_type, file_size, created_by, created_at`,
            [recordId, category, file.originalname, file.originalname, file.mimetype, file.size, file.buffer, req.user.id]
          );
          results.push(rows[0]);
        } catch (dbErr) {
          console.error(`DB insert error for ${file.originalname}:`, dbErr.message);
        }
      }
    }

    res.status(201).json({ uploaded: results.length, photos: results });
  } catch (err) {
    console.error('Photo upload handler error:', err);
    res.status(500).json({ error: err.message || 'Photo upload failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/records/:recordId/photos/:photoId/image — Serve full-size photo
// ---------------------------------------------------------------------------
router.get('/:recordId/photos/:photoId/image', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT photo_data, content_type, filename FROM record_photos WHERE id = $1 AND record_id = $2',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0 || !rows[0].photo_data) return res.status(404).json({ error: 'Photo not found' });

    // ?download=1 forces a Save-As dialog with the original filename + jpg
    // extension. Outlook was converting inline images to "pdfx" when users
    // tried to save them out of an emailed WO; download=1 hands the customer
    // (or Carol) a real .jpg file directly.
    const wantDownload = req.query.download === '1' || req.query.download === 'true';
    let filename = rows[0].filename || 'photo.jpg';
    // Never trust a non-image content_type on download: browsers (and Outlook)
    // will re-tag the file from the MIME type, which is what produced .pdfx.
    let serveType = rows[0].content_type || 'image/jpeg';
    if (!serveType.startsWith('image/')) serveType = 'image/jpeg';
    if (wantDownload) {
      const goodExt = serveType === 'image/png' ? '.png' : serveType === 'image/gif' ? '.gif' : serveType === 'image/webp' ? '.webp' : '.jpg';
      const curExt = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';
      const validImgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
      if (!validImgExts.includes(curExt)) {
        const base = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
        filename = base + goodExt;
      }
    }
    res.set('Content-Type', serveType);
    res.set('Content-Disposition', `${wantDownload ? 'attachment' : 'inline'}; filename="${filename}"`);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(rows[0].photo_data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/records/:recordId/photos/download-all — Bulk zip download
//
// Returns every uploaded photo on the WO as a .zip with sensible filenames
// (WO####-category-N.jpg) so Carol can drag the whole batch into a OneDrive
// folder or upload it to an insurance portal in one go. OneDrive-linked
// photos are NOT included in the zip (we don't have their bytes), but their
// links are written to a manifest.txt inside the zip so nothing is missed.
// ---------------------------------------------------------------------------
router.get('/:recordId/photos/download-all', async (req, res) => {
  try {
    const { rows: photos } = await pool.query(
      `SELECT p.id, p.category, p.label, p.filename, p.content_type,
              p.photo_data, p.onedrive_url,
              r.record_number
         FROM record_photos p
         JOIN records r ON r.id = p.record_id
        WHERE p.record_id = $1
        ORDER BY p.category, p.created_at, p.id`,
      [req.params.recordId]
    );

    if (photos.length === 0) {
      return res.status(404).json({ error: 'No photos on this work order' });
    }

    const woNumber = photos[0].record_number || req.params.recordId;
    const zipName = `WO${woNumber}-photos.zip`;
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipName}"`);

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      console.error('Photo zip error:', err);
      try { res.status(500).end(); } catch (e) { /* response already sent */ }
    });
    archive.pipe(res);

    const counters = {};
    const skippedLinks = [];
    for (const p of photos) {
      const cat = (p.category || 'other').toLowerCase();
      counters[cat] = (counters[cat] || 0) + 1;
      const n = counters[cat];
      const rawExt = (p.filename && p.filename.includes('.'))
        ? p.filename.slice(p.filename.lastIndexOf('.')).toLowerCase()
        : '';
      const validImgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
      const ext = validImgExts.includes(rawExt)
        ? rawExt
        : (p.content_type === 'image/png' ? '.png'
           : p.content_type === 'image/gif' ? '.gif'
           : p.content_type === 'image/webp' ? '.webp'
           : '.jpg');
      const labelPart = p.label ? `-${p.label.replace(/[^a-z0-9-_]/gi, '_').slice(0, 40)}` : '';
      const name = `WO${woNumber}-${cat}-${String(n).padStart(2,'0')}${labelPart}${ext}`;
      if (p.photo_data) {
        archive.append(p.photo_data, { name });
      } else if (p.onedrive_url) {
        skippedLinks.push(`${name}  ->  ${p.onedrive_url}`);
      }
    }
    if (skippedLinks.length > 0) {
      archive.append(
        `OneDrive-linked photos (open these in a browser):\n\n${skippedLinks.join('\n')}\n`,
        { name: 'manifest.txt' }
      );
    }
    await archive.finalize();
  } catch (err) {
    console.error('GET photos/download-all error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/records/:recordId/photos/:photoId/thumbnail — Serve thumbnail
// ---------------------------------------------------------------------------
router.get('/:recordId/photos/:photoId/thumbnail', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT thumbnail_data, photo_data, content_type FROM record_photos WHERE id = $1 AND record_id = $2',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

    const data = rows[0].thumbnail_data || rows[0].photo_data;
    if (!data) return res.status(404).json({ error: 'No image data' });

    res.set('Content-Type', rows[0].content_type || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/records/:recordId/photos/:photoId — Update label/category
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// DELETE /api/records/:recordId/photos/:photoId
// ---------------------------------------------------------------------------
router.delete('/:recordId/photos/:photoId', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM record_photos WHERE id = $1 AND record_id = $2 RETURNING id',
      [req.params.photoId, req.params.recordId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/records/:recordId/photos/email — Email photos to customer
// ---------------------------------------------------------------------------
router.post('/:recordId/photos/email', requireRole('admin', 'service_writer', 'technician'), async (req, res) => {
  const recordId = req.params.recordId;
  const { photoIds, message } = req.body;

  try {
    // Get record + customer info
    const { rows: recRows } = await pool.query(
      `SELECT r.id, r.record_number, r.status,
              c.first_name, c.last_name, c.email_primary, c.company_name
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = $1`,
      [recordId]
    );
    if (recRows.length === 0) return res.status(404).json({ error: 'Record not found' });

    const record = recRows[0];
    const customerEmail = req.body.email || record.email_primary;
    if (!customerEmail) return res.status(400).json({ error: 'No customer email address on file' });

    const customerName = `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Valued Customer';

    // Fetch photos with binary data
    let photoQuery = 'SELECT id, filename, label, content_type, photo_data FROM record_photos WHERE record_id = $1 AND photo_data IS NOT NULL';
    const photoParams = [recordId];
    if (photoIds && photoIds.length > 0) {
      photoQuery += ` AND id = ANY($2)`;
      photoParams.push(photoIds);
    }
    photoQuery += ' ORDER BY created_at';

    const { rows: photos } = await pool.query(photoQuery, photoParams);
    if (photos.length === 0) return res.status(400).json({ error: 'No photos to send' });

    // Build email
    const fromAddr = `"Master Tech RV Repair" <${process.env.EMAIL_USER || 'service@mastertechrvrepair.com'}>`;
    const photoCount = photos.length;
    const subject = `Photos for Work Order #${record.record_number} — Master Tech RV Repair`;

    const captionList = photos.map((p, i) => {
      const label = p.label || p.filename || `Photo ${i + 1}`;
      return `<li style="margin:4px 0;color:#374151;">${label}</li>`;
    }).join('');

    const customMessage = message
      ? `<p style="color:#374151;font-size:15px;margin:0 0 16px;white-space:pre-line;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
      : '';

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color:#1e3a5f;padding:20px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">Master Tech RV Repair & Storage</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:20px;">Photos for Work Order #${record.record_number}</h2>
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hello ${customerName},</p>
      ${customMessage}
      <p style="color:#374151;font-size:15px;margin:0 0 12px;">
        We've attached <strong>${photoCount} photo${photoCount > 1 ? 's' : ''}</strong> related to your work order.
      </p>
      <ul style="padding-left:20px;margin:0 0 20px;">${captionList}</ul>
      <p style="color:#374151;font-size:14px;margin:20px 0 0;">
        If you have any questions, please contact us:<br/>
        <strong>Phone:</strong> (303) 557-2214<br/>
        <strong>Email:</strong> service@mastertechrvrepair.com
      </p>
    </div>
    <div style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;">
        Master Tech RV Repair &amp; Storage<br/>
        6590 East 49th Avenue, Commerce City, CO 80022<br/>
        (303) 557-2214 &nbsp;|&nbsp; service@mastertechrvrepair.com
      </p>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;font-style:italic;">Our Service Makes Happy Campers!</p>
    </div>
  </div>
</body></html>`;

    const textBody = `Photos for Work Order #${record.record_number}\n\nHello ${customerName},\n\n${message ? message + '\n\n' : ''}We've attached ${photoCount} photo${photoCount > 1 ? 's' : ''} related to your work order.\n\nIf you have any questions:\nPhone: (303) 557-2214\nEmail: service@mastertechrvrepair.com\n\n---\nMaster Tech RV Repair & Storage\nOur Service Makes Happy Campers!`;

    const attachments = photos.map((p, i) => ({
      filename: p.filename || `photo-${i + 1}.jpg`,
      content: p.photo_data,
      contentType: p.content_type || 'image/jpeg',
    }));

    // Use the shared Resend-based email service. Railway blocks outbound SMTP
    // ports, so a raw nodemailer SMTP transporter hangs until timeout here.
    const { sendEmail } = require('../services/email');
    const emailResult = await sendEmail({
      to: customerEmail,
      cc: 'service@mastertechrvrepair.com',
      subject,
      html: htmlBody,
      text: textBody,
      attachments,
    });
    if (!emailResult.success) {
      return res.status(502).json({ error: 'Email failed to send: ' + (emailResult.error || 'unknown error') });
    }

    // Log to communication_log
    try {
      await pool.query(
        `INSERT INTO communication_log (record_id, comm_type, direction, recipient, subject, body, sent_by, sent_at)
         VALUES ($1, 'email', 'outbound', $2, $3, $4, $5, NOW())`,
        [recordId, customerEmail, subject, `Sent ${photoCount} photo(s)`, req.user.id]
      );
    } catch (logErr) {
      console.log('Photo email log skip:', logErr.message);
    }

    res.json({ success: true, sent_to: customerEmail, photo_count: photoCount });
  } catch (err) {
    console.error('Email photos error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
