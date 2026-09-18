const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const { scoreLead, velocityScore, verifyTurnstile, THRESHOLD } = require('../utils/leadSpam');
const { sendLeadAlerts, buildShopSms } = require('../services/leadAlerts');
const { sendSMS } = require('../services/sms');

const STAFF_ROLES = ['admin', 'service_writer', 'bookkeeper', 'technician'];
const VALID_LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'converted'];

// ---------------------------------------------------------------------------
// Lead photos. Five per submission, images only, 12MB each before resize.
// A photo problem never costs us the lead: multer errors are captured and the
// text fields still process, and the photo insert happens after the lead has
// already committed.
// ---------------------------------------------------------------------------
const MAX_PHOTOS = 5;
const PHOTO_MAX_WIDTH = 1600;

// The file cap here is deliberately higher than MAX_PHOTOS. multer aborts the
// whole upload once a limit trips, so capping it AT five meant a customer who
// picked six lost all six. We accept a generous number and keep the first five
// in the handler instead.
const UPLOAD_FILE_CEILING = 20;

const uploadPhotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: UPLOAD_FILE_CEILING },
  fileFilter: (req, file, cb) => cb(null, /^image\//i.test(file.mimetype)),
});

function acceptPhotos(req, res, next) {
  uploadPhotos.array('photos', UPLOAD_FILE_CEILING)(req, res, (err) => {
    if (err) {
      // Keep whatever multer managed to parse. A photo problem must never cost
      // us the text of the lead, and it must not silently discard good photos.
      req.photoError = err.message;
      if (!Array.isArray(req.files)) req.files = [];
    }
    next();
  });
}

let sharpLib;
function getSharp() {
  if (sharpLib === undefined) {
    try { sharpLib = require('sharp'); } catch (err) {
      console.error('sharp not available for lead photos:', err.message);
      sharpLib = null;
    }
  }
  return sharpLib;
}

// Content check by file header, not by extension or the declared mime type.
// A .jpg that is really a script has none of these signatures.
function sniffImage(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png';
  if (buf.slice(0, 6).toString('latin1') === 'GIF89a' || buf.slice(0, 6).toString('latin1') === 'GIF87a') return 'image/gif';
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  if (buf.slice(4, 8).toString('latin1') === 'ftyp') {
    const brand = buf.slice(8, 12).toString('latin1');
    if (/^(heic|heix|hevc|mif1|msf1|avif)/i.test(brand)) return 'image/heic';
  }
  return null;
}

// Re-encode to JPEG at a sane width so a 4MB phone photo does not sit in
// Postgres at full resolution. If sharp is unavailable on the host we keep the
// original bytes rather than losing the photo, but only after the header check
// has confirmed it really is an image.
async function processLeadPhoto(buffer) {
  const sniffed = sniffImage(buffer);
  if (!sniffed) return { skipped: 'not an image by file header' };

  const sharp = getSharp();
  if (!sharp) return { data: buffer, mime: sniffed, resized: false };

  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return { data: buffer, mime: sniffed, resized: false };
    const data = await sharp(buffer)
      .rotate()
      .resize({ width: PHOTO_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    return { data, mime: 'image/jpeg', resized: true };
  } catch (err) {
    // HEIC from a Mac is the usual case here: sharp's prebuilt binary cannot
    // always decode it. Keep the original so the photo is not lost.
    console.error('lead photo resize failed, storing original:', err.message);
    return { data: buffer, mime: sniffed, resized: false };
  }
}

// ---------------------------------------------------------------------------
// POST /api/leads — Website lead intake (PUBLIC, no auth)
// Matches existing customer by email/phone or creates new one, then logs the
// lead with record_id = NULL. No stub unit/record is created anymore; staff
// decide what to do with the lead from the Records page.
// ---------------------------------------------------------------------------
// Recovers a full email address from free text (used when the inbound lead
// agent truncates the address, e.g. stores "jean.clappier" instead of the
// full "jean.clappier@gmail.com" that appears in the message body).
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

// ---------------------------------------------------------------------------
// Pull the RV out of a website lead message. Mirrors client/src/utils/parseLead
// so the server can fill the unit even when the caller sends nothing.
//   RV: 2024 Nash 17k | Length: 20 ft | Services: ... | Issue: ...
// ---------------------------------------------------------------------------
function parseLeadRv(msg) {
  const out = { year: null, make: null, model: null, linear_feet: null };
  if (!msg) return out;
  const field = (label) => {
    const m = String(msg).match(new RegExp(label + '\\s*:\\s*([^|]*)(?:\\||$)', 'i'));
    return m ? m[1].trim() : '';
  };
  const raw = field('RV');
  const len = (field('Length').match(/\d+(\.\d+)?/) || [null])[0];
  if (len) out.linear_feet = parseFloat(len);
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (/^(19|20)\d{2}$/.test(parts[0] || '')) {
      out.year = parseInt(parts[0], 10);
      out.make = parts[1] || null;
      out.model = parts.slice(2).join(' ') || null;
    } else {
      out.make = parts[0] || null;
      out.model = parts.slice(1).join(' ') || null;
    }
  }
  return out;
}

const norm = (v) => String(v == null ? '' : v).trim().toLowerCase();

// Save the RV from a lead onto the customer record. Never creates a duplicate:
// an existing unit with the same make/model (and a non-conflicting year) is
// backfilled instead, and a bare stub unit is filled in rather than added to.
// Returns { unit_id, unit_action } where action is created | updated | matched.
async function saveLeadUnit(client, customerId, rv) {
  const hasData = rv && (rv.year || rv.make || rv.model || rv.linear_feet);
  if (!customerId || !hasData) return { unit_id: null, unit_action: 'none' };

  const { rows: units } = await client.query(
    'SELECT id, year, make, model, linear_feet FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY id',
    [customerId]
  );

  const match = units.find((u) => {
    if (!norm(u.make) && !norm(u.model)) return false;
    const makeOk = !rv.make || !norm(u.make) || norm(u.make) === norm(rv.make);
    const modelOk = !rv.model || !norm(u.model) || norm(u.model) === norm(rv.model);
    const yearOk = !rv.year || !u.year || Number(u.year) === Number(rv.year);
    return makeOk && modelOk && yearOk;
  });

  // A stub unit is one create-estimate or an earlier lead left behind: no
  // identifying detail at all. Fill it rather than stacking a second RV.
  const stub = units.find((u) => !u.year && !norm(u.make) && !norm(u.model) && !u.linear_feet);

  const target = match || stub;
  if (target) {
    const { rows } = await client.query(
      `UPDATE units
          SET year = COALESCE(year, $1),
              make = COALESCE(NULLIF(make, ''), $2),
              model = COALESCE(NULLIF(model, ''), $3),
              linear_feet = COALESCE(linear_feet, $4)
        WHERE id = $5
        RETURNING id`,
      [rv.year || null, rv.make || null, rv.model || null, rv.linear_feet || null, target.id]
    );
    return { unit_id: rows[0].id, unit_action: match ? 'matched' : 'updated' };
  }

  const { rows } = await client.query(
    'INSERT INTO units (customer_id, year, make, model, linear_feet) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [customerId, rv.year || null, rv.make || null, rv.model || null, rv.linear_feet || null]
  );
  return { unit_id: rows[0].id, unit_action: 'created' };
}

// Match an existing customer on email or phone, otherwise create one. Shared
// by intake and by releasing a lead out of the spam quarantine, so a released
// lead lands exactly where it would have without the filter.
async function matchOrCreateCustomer(client, { name, email, phone, source }) {
  let customerId = null;
  if (email) {
    const { rows } = await client.query(
      'SELECT id FROM customers WHERE LOWER(email_primary) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
      [email]
    );
    if (rows.length > 0) customerId = rows[0].id;
  }
  if (!customerId && phone) {
    const { rows } = await client.query(
      "SELECT id FROM customers WHERE regexp_replace(COALESCE(phone_primary,''), '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g') AND regexp_replace($1,'[^0-9]','','g') <> '' AND deleted_at IS NULL LIMIT 1",
      [phone]
    );
    if (rows.length > 0) customerId = rows[0].id;
  }
  if (customerId) return customerId;

  const nameParts = (name || '').trim().split(/\s+/);
  const lastName = nameParts.pop() || 'Unknown';
  const firstName = nameParts.join(' ') || null;

  const acctRes = await client.query(
    "SELECT COALESCE(MAX(CAST(account_number AS INTEGER)), 0) + 1 AS next FROM customers WHERE account_number ~ '^[0-9]+$'"
  );
  const accountNumber = String(acctRes.rows[0].next);

  const { rows } = await client.query(
    `INSERT INTO customers (account_number, first_name, last_name, phone_primary, email_primary, lead_source)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [accountNumber, firstName, lastName, phone || null, email || null, source]
  );
  return rows[0].id;
}

router.post('/', acceptPhotos, async (req, res) => {
  const { name, phone, message, source = 'website' } = req.body;
  let email = (req.body.email || '').trim();
  // If the provided email is missing or not a full address, try to pull a
  // valid one out of the message body before we store or match on it.
  if (!email || !email.includes('@')) {
    const m = (message || '').match(EMAIL_RE);
    if (m) email = m[0];
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || null;
  const userAgent = req.headers['user-agent'] || null;
  const photos = Array.isArray(req.files) ? req.files.slice(0, MAX_PHOTOS) : [];

  if (!name && !email && !phone) {
    return res.status(400).json({
      error: 'At least name, email, or phone is required',
      message: 'Please add a phone number or email so we can reach you.',
    });
  }

  // --- Spam scoring, before anything is created -----------------------------
  // Runs ahead of the customer match on purpose. A quarantined submission must
  // never create a customer record, which is exactly how the customers table
  // filled up with junk before this existed.
  const turnstile = await verifyTurnstile(
    req.body.turnstile_token || req.body['cf-turnstile-response'],
    ip
  );
  const turnstileOk = turnstile.ok;
  const base = scoreLead({
    name, email, phone, message, userAgent, turnstileOk,
    turnstileCodes: turnstile.codes,
    honeypot: req.body.company_website,
    honeypot2: req.body.fax_number,
    formStartedAt: req.body.form_started_at,
  });

  const client = await pool.connect();
  try {
    const velocity = await velocityScore(client, { ip, phone, email, message });
    const spamScore = base.score + velocity.score;
    const spamReasons = [...base.reasons, ...velocity.reasons].join('; ');
    const isSpam = spamScore >= THRESHOLD;

    if (isSpam) {
      // Quarantine: the row is kept so a false positive can be released, but
      // no customer, no unit, no note, no photos, no notification. The caller
      // gets an ordinary success so a bot learns nothing about the filter.
      const { rows } = await client.query(
        `INSERT INTO leads (customer_id, record_id, name, phone, email, message, source,
                            is_spam, spam_score, spam_reasons, ip_address, user_agent)
         VALUES (NULL, NULL, $1, $2, $3, $4, $5, TRUE, $6, $7, $8, $9) RETURNING id, created_at`,
        [name, phone || null, email || null, message || null, source,
         spamScore, spamReasons, ip, userAgent]
      );
      console.log(JSON.stringify({
        evt: 'lead_intake', outcome: 'quarantined', lead_id: rows[0].id,
        source, ip, spam_score: spamScore, reasons: spamReasons, photos: photos.length,
      }));
      // verified:false is what the front end reads to decide NOT to fire a
      // Google Ads conversion. Firing on every 200 would teach Smart Bidding
      // to buy whatever produces spam. The accepted and quarantined payloads
      // already differ in shape, so this leaks nothing new to a bot; it just
      // makes the signal explicit instead of inferred.
      return res.status(201).json({ ok: true, verified: false, lead: { id: rows[0].id } });
    }

    await client.query('BEGIN');

    let customerId = await matchOrCreateCustomer(client, { name, email, phone, source });

    // Log the lead — no stub unit/record; record_id stays NULL until staff act.
    const { rows: leadRows } = await client.query(
      `INSERT INTO leads (customer_id, record_id, name, phone, email, message, source,
                          is_spam, spam_score, spam_reasons, ip_address, user_agent)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, FALSE, $7, $8, $9, $10) RETURNING *`,
      [customerId, name, phone || null, email || null, message || null, source,
       spamScore, spamReasons || null, ip, userAgent]
    );

    // Document the request on the customer record immediately, so it is never
    // lost even if the lead is later converted and that record is deleted.
    if (message && message.trim() && customerId) {
      const when = new Date().toLocaleDateString('en-US', { timeZone: 'America/Denver' });
      const contact = [phone, email].filter(Boolean).join(', ');
      const note = `[Lead ${when} via ${source}] ${message.trim()}` + (contact ? ` | Contact: ${contact}` : '');
      await client.query(
        "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 WHEN position($1 in notes) > 0 THEN notes ELSE notes || CHR(10) || $1 END WHERE id = $2",
        [note, customerId]
      );
    }

    // The lead is durable from here. Everything after this point is a bonus
    // and must not be able to undo it.
    await client.query('COMMIT');

    const leadId = leadRows[0].id;
    let photosSaved = 0;

    if (photos.length && customerId) {
      for (const [i, file] of photos.entries()) {
        try {
          const processed = await processLeadPhoto(file.buffer);
          if (!processed || !processed.data) {
            console.error(`lead ${leadId} photo ${i + 1} skipped: ${processed && processed.skipped}`);
            continue;
          }
          await client.query(
            `INSERT INTO customer_documents (customer_id, doc_type, title, file_data, mime_type, file_size, related_id)
             VALUES ($1, 'lead_photo', $2, $3, $4, $5, $6)`,
            [customerId, `Lead photo ${i + 1}`, processed.data, processed.mime, processed.data.length, leadId]
          );
          photosSaved += 1;
        } catch (photoErr) {
          // A bad photo is not a lost customer. Log it and keep going.
          console.error(`lead ${leadId} photo ${i + 1} rejected:`, photoErr.message);
        }
      }
      if (photosSaved) {
        await client.query('UPDATE leads SET photo_count = $1 WHERE id = $2', [photosSaved, leadId]);
      }
    }

    console.log(JSON.stringify({
      evt: 'lead_intake', outcome: 'accepted', lead_id: leadId, customer_id: customerId,
      source, ip, spam_score: spamScore,
      photos_received: photos.length, photos_saved: photosSaved,
      photo_error: req.photoError || null,
    }));

    res.status(201).json({
      ok: true,
      verified: true,
      lead: { ...leadRows[0], photo_count: photosSaved },
      customer_id: customerId,
      photos_received: photos.length,
      photos_saved: photosSaved,
      photo_error: req.photoError || null,
    });

    // Alerts fire AFTER the response. The customer is not kept waiting on an
    // email provider, and a dead provider cannot turn a saved lead into a
    // failed submission. Quarantined leads never reach this line.
    sendLeadAlerts({ ...leadRows[0], customer_id: customerId }, { photoCount: photosSaved })
      .then((r) => console.log(JSON.stringify({
        evt: 'lead_alerts', lead_id: leadId,
        sms: r.shop_sms.results.map((x) => `${x.to}:${x.success ? 'sent' : (x.skipped || x.error)}`),
        shop_email: r.shop_email.result?.success ? 'sent' : r.shop_email.result?.error,
        customer_email: r.customer_email.result?.success ? 'sent' : (r.customer_email.result?.error || 'no address'),
      })))
      .catch((err) => console.error('[leadAlerts] unexpected failure:', err.message));
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (rollbackErr) { /* nothing to roll back */ }
    console.error('POST /api/leads error:', err);
    console.log(JSON.stringify({
      evt: 'lead_intake', outcome: 'failed', source, ip, error: err.message,
    }));
    // The visitor must never get a silent drop. This is now the only path a
    // lead can arrive on, so a failure has to tell them to pick up the phone.
    res.status(500).json({
      error: err.message,
      message: 'Something went wrong sending your request. Please call the shop at 303-557-2214 and we will take care of it.',
    });
  } finally {
    client.release();
  }
});

// GET /api/leads — List non-deleted leads (staff only)
// ?spam=true returns the quarantine instead. Quarantined leads are excluded
// from every other view so the real list stays clean.
router.get('/', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const archived = req.query.archived === 'true' || req.query.archived === '1';
    const spam = req.query.spam === 'true' || req.query.spam === '1';
    const { rows } = await pool.query(
      `SELECT l.*, c.first_name AS customer_first, c.last_name AS customer_last,
              r.record_number AS record_number, r.status AS record_status,
              (r.id IS NOT NULL AND r.deleted_at IS NULL) AS record_open,
              COALESCE(lc.contacts, '[]'::json) AS contacts
       FROM leads l
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN records r ON r.id = l.record_id
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object('id', x.id, 'contacted_at', x.contacted_at, 'note', x.note,
                                           'entry_type', COALESCE(x.entry_type, 'call'), 'author', u.name)
                         ORDER BY x.contacted_at DESC) AS contacts
           FROM lead_contacts x
           LEFT JOIN users u ON u.id = x.created_by
          WHERE x.lead_id = l.id
       ) lc ON true
       WHERE ${spam
         ? 'l.is_spam = TRUE AND l.deleted_at IS NULL'
         : `${archived ? "l.deleted_at IS NOT NULL AND l.closed_reason = 'filed'" : 'l.deleted_at IS NULL'} AND COALESCE(l.is_spam, FALSE) = FALSE`}
       ORDER BY ${archived && !spam ? 'l.deleted_at' : 'l.created_at'} DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/not-spam — Release a false positive out of quarantine.
// Clears the flag and attaches the customer the filter stopped us creating, so
// the lead appears in the normal list as if it had come straight through.
router.post('/:id/not-spam', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: leadRows } = await client.query(
      'SELECT * FROM leads WHERE id = $1 FOR UPDATE', [req.params.id]
    );
    if (!leadRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = leadRows[0];
    let customerId = lead.customer_id;
    if (!customerId) {
      customerId = await matchOrCreateCustomer(client, {
        name: lead.name, email: lead.email, phone: lead.phone, source: lead.source,
      });
    }
    const { rows } = await client.query(
      'UPDATE leads SET is_spam = FALSE, customer_id = $1 WHERE id = $2 RETURNING *',
      [customerId, lead.id]
    );
    await client.query('COMMIT');
    console.log(JSON.stringify({
      evt: 'lead_intake', outcome: 'released_from_quarantine', lead_id: lead.id,
      customer_id: customerId, was_score: lead.spam_score,
    }));
    res.json(rows[0]);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* nothing to roll back */ }
    console.error('POST /api/leads/:id/not-spam error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/leads/:id — One lead with everything the phone view needs.
router.get('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, c.first_name AS customer_first, c.last_name AS customer_last,
              c.sms_opt_out,
              COALESCE(lc.contacts, '[]'::json) AS contacts,
              COALESCE(ph.photos, '[]'::json) AS photos
         FROM leads l
         LEFT JOIN customers c ON c.id = l.customer_id
         LEFT JOIN LATERAL (
           SELECT json_agg(json_build_object('id', x.id, 'contacted_at', x.contacted_at, 'note', x.note,
                                             'entry_type', COALESCE(x.entry_type, 'call'), 'author', u.name)
                           ORDER BY x.contacted_at DESC) AS contacts
             FROM lead_contacts x LEFT JOIN users u ON u.id = x.created_by
            WHERE x.lead_id = l.id
         ) lc ON true
         LEFT JOIN LATERAL (
           SELECT json_agg(json_build_object('id', d.id, 'title', d.title) ORDER BY d.id) AS photos
             FROM customer_documents d
            WHERE d.doc_type = 'lead_photo' AND d.related_id = l.id
         ) ph ON true
        WHERE l.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/leads/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/reply — Text the customer back from the shop number.
// This is the point of the link in the alert: two taps from the buzz in your
// pocket to the customer having an answer. Goes out on 303-557-2214 through
// Dialpad, so the thread lives in the shop's record, not on a personal cell.
router.post('/:id/reply', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const body = String(req.body.message || '').trim();
  if (!body) return res.status(400).json({ error: 'message is required' });
  if (body.length > 600) return res.status(400).json({ error: 'message is too long (600 characters max)' });

  try {
    const { rows } = await pool.query(
      'SELECT id, customer_id, name, phone, is_spam FROM leads WHERE id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
    const lead = rows[0];
    if (!lead.phone) return res.status(400).json({ error: 'This lead has no phone number' });

    // sendSMS handles normalization, the STOP opt-out check and provider
    // config. It only reports success when the text actually went out.
    const result = await sendSMS(lead.phone, body);
    if (!result.success) {
      return res.status(502).json({
        error: result.skipped
          ? `Not sent: ${result.skipped}`
          : (result.error || 'Text could not be sent'),
        skipped: result.skipped || null,
      });
    }

    // Log it twice on purpose: communication_log is the customer's history,
    // lead_contacts is what the Leads list shows inline.
    if (lead.customer_id) {
      await pool.query(
        `INSERT INTO communication_log (customer_id, channel, trigger_event, message_content, sent_at, delivery_status, is_manual, sent_by_user_id)
         VALUES ($1, 'sms', 'lead_reply', $2, NOW(), 'sent', true, $3)`,
        [lead.customer_id, body, req.user?.id || null]
      ).catch((e) => console.error('[lead reply] communication_log failed:', e.message));
    }
    await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, entry_type, created_by)
       VALUES ($1, NOW(), $2, 'text', $3)`,
      [lead.id, body, req.user?.id || null]
    ).catch((e) => console.error('[lead reply] lead_contacts failed:', e.message));

    await pool.query(
      "UPDATE leads SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END, contacted_at = COALESCE(contacted_at, NOW()) WHERE id = $1",
      [lead.id]
    ).catch(() => {});

    console.log(JSON.stringify({ evt: 'lead_reply', lead_id: lead.id, chars: body.length }));
    res.json({ ok: true, sent_to: lead.phone });
  } catch (err) {
    console.error('POST /api/leads/:id/reply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id/alert-preview — Dry run. Renders exactly what the alerts
// WOULD say for a real lead and sends nothing. Used to approve the wording.
router.get('/:id/alert-preview', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
    const { rows: pc } = await pool.query(
      "SELECT COUNT(*)::int AS n FROM customer_documents WHERE doc_type = 'lead_photo' AND related_id = $1",
      [req.params.id]
    );
    res.json(await sendLeadAlerts(rows[0], { photoCount: pc[0].n, dryRun: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id/photos — Photos the customer attached to this request.
router.get('/:id/photos', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, mime_type, file_size, created_at
         FROM customer_documents
        WHERE doc_type = 'lead_photo' AND related_id = $1
        ORDER BY id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id/photos/:docId — The image bytes.
router.get('/:id/photos/:docId', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT file_data, mime_type FROM customer_documents
        WHERE id = $1 AND related_id = $2 AND doc_type = 'lead_photo'`,
      [req.params.docId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Photo not found' });
    res.setHeader('Content-Type', rows[0].mime_type || 'image/jpeg');
    res.send(rows[0].file_data);
  } catch (err) {
    console.error('GET /api/leads/:id/photos/:docId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — Update lead status and/or contacted_at (staff only)
router.patch('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { status } = req.body;
  const hasStatus = status !== undefined;
  const hasContactedAt = Object.prototype.hasOwnProperty.call(req.body, 'contacted_at');

  if (!hasStatus && !hasContactedAt) {
    return res.status(400).json({ error: 'status or contacted_at is required' });
  }
  if (hasStatus && !VALID_LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_LEAD_STATUSES.join(', ')}` });
  }

  const sets = [];
  const params = [];
  if (hasStatus) {
    params.push(status);
    sets.push(`status = $${params.length}`);
  }
  if (hasContactedAt) {
    params.push(req.body.contacted_at);
    sets.push(`contacted_at = $${params.length}`);
  }
  params.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE leads SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/contact — Log a call/contact with an optional note (staff only).
// Appends to lead_contacts (a running history) and refreshes the lead summary.
router.post('/:id/contact', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { contacted_at, note } = req.body || {};
  const entryType = (req.body || {}).entry_type === 'email' ? 'email' : 'call';
  try {
    const when = contacted_at || new Date().toISOString();
    const { rows } = await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, created_by, entry_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, contacted_at, note, entry_type`,
      [req.params.id, when, (note || '').trim() || null, req.user.id, entryType]
    );
    await pool.query(
      `UPDATE leads
          SET contacted_at = $1,
              status = CASE WHEN status = 'new' THEN 'contacted'::lead_status_type ELSE status END
        WHERE id = $2`,
      [when, req.params.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/leads/:id/contact error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/note — Add a free-text note against a lead (staff only).
// Notes live in lead_contacts beside the call log, separated by entry_type.
// Unlike a logged call, a note never sets contacted_at and never advances the
// lead's status: writing yourself a reminder is not the same as reaching the
// customer.
router.post('/:id/note', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const note = ((req.body || {}).note || '').trim();
  if (!note) return res.status(400).json({ error: 'note is required' });
  try {
    const { rows: leadRows } = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (leadRows.length === 0) return res.status(404).json({ error: 'Lead not found' });

    const { rows } = await pool.query(
      `INSERT INTO lead_contacts (lead_id, contacted_at, note, created_by, entry_type)
       VALUES ($1, NOW(), $2, $3, 'note')
       RETURNING id, contacted_at, note, entry_type`,
      [req.params.id, note, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/leads/:id/note error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id/note/:noteId — Remove a note (staff only). Only notes
// can be deleted; the call/email log is a record of what was actually done.
router.delete('/:id/note/:noteId', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM lead_contacts WHERE id = $1 AND lead_id = $2 AND entry_type = 'note' RETURNING id",
      [req.params.noteId, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/leads/:id/note/:noteId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Permanently delete a lead (staff only).
// Delete means gone: the row and its call/note history leave the database, so
// a deleted lead can never reappear in the Closed Leads list. Works on an open
// lead and on one already sitting in Closed. Filing or converting a lead is
// what keeps it (see /file and /create-estimate) — nothing here is recoverable.
router.delete('/:id', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Explicit, so the delete does not depend on the FK cascade being in place.
    await client.query('DELETE FROM lead_contacts WHERE lead_id = $1', [req.params.id]);
    const { rows } = await client.query(
      'DELETE FROM leads WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    await client.query('COMMIT');
    res.json({ id: rows[0].id, deleted: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/leads/:id error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/leads/:id/create-estimate — Build an estimate record from a lead (staff only)
router.post('/:id/create-estimate', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: leadRows } = await client.query(
      'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (leadRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = leadRows[0];

    // Put the RV from the lead on the customer record, matching or backfilling
    // an existing unit rather than duplicating one. Falls back to the old
    // behaviour (first unit, else a bare stub) when the message has no RV.
    let unitId = null;
    const rvFromLead = parseLeadRv(lead.message);
    const saved = await saveLeadUnit(client, lead.customer_id, rvFromLead);
    unitId = saved.unit_id;

    if (!unitId) {
      const { rows: unitRows } = await client.query(
        'SELECT id FROM units WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY id LIMIT 1',
        [lead.customer_id]
      );
      if (unitRows.length > 0) {
        unitId = unitRows[0].id;
      } else {
        const { rows: newUnit } = await client.query(
          'INSERT INTO units (customer_id) VALUES ($1) RETURNING id',
          [lead.customer_id]
        );
        unitId = newUnit[0].id;
      }
    }

    // Next record number
    const numRes = await client.query(
      'SELECT COALESCE(MAX(record_number), 0) + 1 AS next_num FROM records'
    );
    const recordNumber = numRes.rows[0].next_num;

    const { rows: recRows } = await client.query(
      `INSERT INTO records (record_number, customer_id, unit_id, status, job_description, tax_rate)
       VALUES ($1, $2, $3, 'estimate', $4, 0.0975) RETURNING id`,
      [recordNumber, lead.customer_id, unitId, lead.message || 'Website inquiry']
    );
    const recordId = recRows[0].id;

    // Carry the lead's call history into the customer record so it isn't lost.
    if (lead.customer_id) {
      const { rows: cts } = await client.query(
        "SELECT contacted_at, note, COALESCE(entry_type, 'call') AS entry_type FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at",
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          const kind = ct.entry_type === 'note' ? 'Note' : (ct.entry_type === 'email' ? 'Email' : 'Call');
          return `[${kind} ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, lead.customer_id]
        );
      }
    }

    await client.query(
      "UPDATE leads SET record_id = $1, status = 'converted', deleted_at = NOW(), closed_reason = 'converted' WHERE id = $2",
      [recordId, lead.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ record_id: recordId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads/:id/create-estimate error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/leads/:id/file — File a lead's info onto the customer record and remove from the box (staff only)
router.post('/:id/file', requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: leadRows } = await client.query(
      'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (leadRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }
    const lead = leadRows[0];

    // The staff member may have picked an existing customer to file under.
    const chosenCustomerId = req.body && req.body.customer_id ? req.body.customer_id : null;
    const targetCustomerId = chosenCustomerId || lead.customer_id;

    const when = new Date(lead.created_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    const contact = [lead.phone, lead.email].filter(Boolean).join(', ');
    const note = `[Lead ${when} via ${lead.source || 'website'}]` + (lead.message ? ` ${lead.message}` : '') + (contact ? ` | Contact: ${contact}` : '');

    if (targetCustomerId) {
      await client.query(
        "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 WHEN position($1 in notes) > 0 THEN notes ELSE notes || CHR(10) || $1 END WHERE id = $2",
        [note, targetCustomerId]
      );
      const { rows: cts } = await client.query(
        "SELECT contacted_at, note, COALESCE(entry_type, 'call') AS entry_type FROM lead_contacts WHERE lead_id = $1 ORDER BY contacted_at",
        [lead.id]
      );
      if (cts.length) {
        const block = cts.map((ct) => {
          const d = new Date(ct.contacted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' });
          const kind = ct.entry_type === 'note' ? 'Note' : (ct.entry_type === 'email' ? 'Email' : 'Call');
          return `[${kind} ${d}]` + (ct.note ? ` ${ct.note}` : '');
        }).join('\n');
        await client.query(
          "UPDATE customers SET notes = CASE WHEN notes IS NULL OR notes = '' THEN $1 ELSE notes || CHR(10) || $1 END WHERE id = $2",
          [block, targetCustomerId]
        );
      }
    }

    // Put the RV on the customer record. The caller may send an edited unit
    // (the File Lead modal prefills it from the message and lets staff fix it);
    // if it sends nothing, fall back to parsing the message here. save_unit
    // false means the staff member deliberately unticked it.
    let unitResult = { unit_id: null, unit_action: 'none' };
    const body = req.body || {};
    if (body.save_unit !== false && targetCustomerId) {
      let rv;
      if (body.unit) {
        // An explicit payload wins outright, so a field the staff member
        // cleared stays cleared instead of being re-parsed from the message.
        const sent = body.unit;
        rv = {
          year: String(sent.year || '').trim() ? parseInt(sent.year, 10) || null : null,
          make: String(sent.make || '').trim() || null,
          model: String(sent.model || '').trim() || null,
          linear_feet: String(sent.linear_feet || '').trim() ? parseFloat(sent.linear_feet) || null : null,
        };
      } else {
        rv = parseLeadRv(lead.message);
      }
      unitResult = await saveLeadUnit(client, targetCustomerId, rv);
    }

    await client.query(
      "UPDATE leads SET deleted_at = NOW(), closed_reason = 'filed' WHERE id = $1",
      [lead.id]
    );

    // DEDUPE: if the lead was filed under a different (existing) customer than
    // the one it was auto-attached to, and the original attached customer is a
    // bare auto-created stub (created from a website lead, with no records,
    // units, or other live leads), soft-delete that stub.
    if (
      chosenCustomerId &&
      lead.customer_id &&
      String(chosenCustomerId) !== String(lead.customer_id)
    ) {
      const { rows: stubRows } = await client.query(
        'SELECT id, lead_source FROM customers WHERE id = $1 AND deleted_at IS NULL',
        [lead.customer_id]
      );
      if (stubRows.length > 0 && stubRows[0].lead_source !== null) {
        const { rows: recCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM records WHERE customer_id = $1 AND deleted_at IS NULL',
          [lead.customer_id]
        );
        const { rows: unitCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM units WHERE customer_id = $1 AND deleted_at IS NULL',
          [lead.customer_id]
        );
        const { rows: leadCount } = await client.query(
          'SELECT COUNT(*)::int AS n FROM leads WHERE customer_id = $1 AND id <> $2 AND deleted_at IS NULL',
          [lead.customer_id, lead.id]
        );
        if (recCount[0].n === 0 && unitCount[0].n === 0 && leadCount[0].n === 0) {
          await client.query(
            'UPDATE customers SET deleted_at = NOW() WHERE id = $1',
            [lead.customer_id]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({
      filed: true,
      customer_id: targetCustomerId,
      unit_id: unitResult.unit_id,
      unit_action: unitResult.unit_action,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/leads/:id/file error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
