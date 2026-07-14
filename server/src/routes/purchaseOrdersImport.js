// server/src/routes/purchaseOrdersImport.js
//
// Automated order-import endpoint for the external Gmail-reading agent.
//
// Carol places parts orders on supplier websites / by phone (filling the
// Amazon Business "PO" field with a customer/job name), and a confirmation
// email arrives afterward. An external agent parses those emails and pushes
// the structured order here so it lands as a purchase_order in the ERP.
//
// Auth: X-Cowork-Key header must match COWORK_API_KEY — the SAME mechanism the
// cowork-admin routes use. This router is mounted at /api/purchase-orders
// BEFORE the JWT-protected purchaseOrders router so the single /import-parsed
// path authenticates with the agent key; every other /api/purchase-orders/*
// path falls through unchanged to the JWT-protected router.

const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// Same key check as server/src/routes/cowork-admin.js.
function requireCoworkKey(req, res, next) {
  const provided = req.headers['x-cowork-key'];
  const expected = process.env.COWORK_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'COWORK_API_KEY not configured on server' });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing X-Cowork-Key' });
  }
  next();
}

// Best-effort audit_log write inside a transaction, guarded by a savepoint so a
// missing audit_log table can't abort the import.
async function auditLog(client, { rowId, action, newValue }) {
  try {
    await client.query('SAVEPOINT sp_audit');
    await client.query(
      `INSERT INTO audit_log (table_name, row_id, action, changed_by, new_value, changed_at)
       VALUES ('purchase_orders', $1, $2, 'email-agent', $3, NOW())`,
      [rowId, action, newValue == null ? null : JSON.stringify(newValue)]
    );
    await client.query('RELEASE SAVEPOINT sp_audit');
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT sp_audit');
  }
}

// ---------------------------------------------------------------------------
// POST /api/purchase-orders/import-parsed
// Body: {
//   vendor_name, order_number, po_name?, order_date, expected_date?,
//   tracking_number?, subtotal, shipping_cost, total,
//   items: [{ description, vendor_part_number?, qty, cost_each }],
//   source_email_msg_id?
// }
// ---------------------------------------------------------------------------
router.post('/import-parsed', requireCoworkKey, async (req, res) => {
  const {
    vendor_name, order_number, po_name, order_date, expected_date,
    tracking_number, subtotal, shipping_cost, total, items, source_email_msg_id,
  } = req.body || {};

  if (!vendor_name || !String(vendor_name).trim()) {
    return res.status(400).json({ error: 'vendor_name is required' });
  }
  if (!order_number || !String(order_number).trim()) {
    return res.status(400).json({ error: 'order_number is required (used for idempotent dedupe)' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items[] is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // (1) Idempotent dedupe on order_number — update tracking / ETA / email id
    // instead of creating a duplicate PO.
    const { rows: existing } = await client.query(
      'SELECT * FROM purchase_orders WHERE order_number = $1 LIMIT 1',
      [order_number]
    );
    if (existing.length) {
      const prev = existing[0];

      // The supplier's confirmation email is the authoritative source for what
      // was actually ordered and what it actually cost. A PO seeded earlier
      // from a work-order estimate carries QUOTED pricing and may be missing
      // lines the buyer added at checkout. Previously this branch only
      // refreshed tracking/ETA, so those POs kept estimate pricing forever and
      // po_name was silently dropped. Reconcile the money and the lines here.
      const notes = mergePoNameIntoNotes(prev.notes, po_name);

      const { rows: updated } = await client.query(
        `UPDATE purchase_orders SET
           tracking_number = COALESCE($1, tracking_number),
           expected_date = COALESCE($2, expected_date),
           order_email_msg_id = COALESCE($3, order_email_msg_id),
           subtotal = COALESCE($4, subtotal),
           shipping_cost = COALESCE($5, shipping_cost),
           total = COALESCE($6, total),
           notes = $7,
           updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [
          tracking_number || null, expected_date || null, source_email_msg_id || null,
          subtotal ?? null, shipping_cost ?? null, total ?? null,
          notes, prev.id,
        ]
      );

      // Reconcile line items against the confirmation. Match on
      // vendor_part_number when present, else on description. Update the cost
      // of lines we already have (estimate -> actual) and insert lines the
      // email lists that the PO is missing. Never delete: a line that exists
      // in the ERP but not in this email may have come from a partial
      // shipment or a second confirmation.
      const reconciled = await reconcileLineItems(client, prev.id, items);

      if (source_email_msg_id) {
        await logInboundEmail(client, source_email_msg_id, updated[0], { order_number, po_name, vendor_name });
      }
      // Keep already-linked record lines in sync, then try to link any items
      // that weren't linkable before.
      await syncLinkedRecordLines(client, updated[0]);
      const linked = await autoLinkImportedPO(client, updated[0], po_name);
      await auditLog(client, { rowId: prev.id, action: 'import_parsed_update',
        newValue: {
          order_number, po_name: po_name || null, tracking_number, expected_date,
          total_before: prev.total, total_after: updated[0].total,
          lines_updated: reconciled.updated, lines_inserted: reconciled.inserted,
          newly_linked: linked,
        } });
      await client.query('COMMIT');
      return res.json({ updated: true, po: updated[0], lines: reconciled, linked });
    }

    // (2) Match supplier by case-insensitive name — create nothing. If there's
    // no match, leave supplier_id null and keep the vendor text as-is.
    const { rows: sup } = await client.query(
      'SELECT id FROM suppliers WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1',
      [vendor_name]
    );
    const supplierId = sup.length ? sup[0].id : null;

    // (3) Notes: store po_name verbatim (never guess a record link, even if it
    // looks like MT-<digits>) plus the import provenance.
    const notes = mergePoNameIntoNotes(null, po_name);

    const { rows: poRows } = await client.query(
      `INSERT INTO purchase_orders
         (vendor, supplier_id, status, order_date, expected_date, order_number,
          tracking_number, subtotal, shipping_cost, total, notes, submitted_at,
          order_email_msg_id)
       VALUES ($1, $2, 'submitted', $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
       RETURNING *`,
      [
        String(vendor_name).trim(), supplierId,
        order_date || new Date(), expected_date || null, order_number,
        tracking_number || null, subtotal || 0, shipping_cost || 0, total || 0,
        notes, source_email_msg_id || null,
      ]
    );
    const po = poRows[0];

    // Stable PO number for a submitted order (PO-YYYY-<padded id>).
    const poNumber = `PO-${new Date().getFullYear()}-${String(po.id).padStart(5, '0')}`;
    await client.query('UPDATE purchase_orders SET po_number = $1 WHERE id = $2', [poNumber, po.id]);
    po.po_number = poNumber;

    // (4) Line items — source='manual' (no inventory / record linkage guessed).
    for (const item of items) {
      const qty = parseFloat(item.qty) || 1;
      const costEach = parseFloat(item.cost_each) || 0;
      const lineTotal = Math.round(qty * costEach * 100) / 100;
      await client.query(
        `INSERT INTO po_line_items
           (po_id, description, vendor_part_number, qty, cost_each, line_total, matched, source)
         VALUES ($1, $2, $3, $4, $5, $6, false, 'manual')`,
        [po.id, item.description || 'Imported item', item.vendor_part_number || null, qty, costEach, lineTotal]
      );
    }

    // (6) Log the inbound confirmation email when present.
    if (source_email_msg_id) {
      await logInboundEmail(client, source_email_msg_id, po, { order_number, po_name, vendor_name });
    }

    // Auto-link imported line items back to the work-order parts lines.
    const linked = await autoLinkImportedPO(client, po, po_name);

    // (7) Audit.
    await auditLog(client, { rowId: po.id, action: 'import_parsed',
      newValue: { order_number, po_name: po_name || null, vendor_name, supplier_id: supplierId, item_count: items.length, linked } });

    await client.query('COMMIT');
    res.status(201).json({ created: true, po, linked });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/purchase-orders/import-parsed error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// Auto-linking: connect an imported PO's line items back to the work-order
// parts lines that ordered them. Priority order (never guess beyond these):
//   (1) record_parts_lines with the same order_number and no existing PO link;
//   (2) a record id parsed from po_name (MT-1420 / #1420 / bare active id) —
//       its 'ordered'/'not_ordered' lines matched by part number or description;
//   (3) same supplier + exact vendor_part_number on 'ordered' lines with no
//       order_number.
// For each match: set po_line_items.record_parts_line_id and copy po_number,
// order_number, tracking and ETA onto the record line.
// ---------------------------------------------------------------------------
const norm = (s) => (s == null ? '' : String(s)).toLowerCase().replace(/\s+/g, ' ').trim();
const vpEq = (a, b) => !!norm(a) && norm(a) === norm(b);
const descClose = (a, b) => {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return false;
  return na === nb || (na.length >= 6 && nb.length >= 6 && (na.includes(nb) || nb.includes(na)));
};

function extractRecordId(poName) {
  if (!poName) return null;
  const s = String(poName);
  let m = s.match(/\bMT-?(\d{1,7})\b/i);
  if (m) return parseInt(m[1], 10);
  m = s.match(/#\s*(\d{1,7})/);
  if (m) return parseInt(m[1], 10);
  m = s.match(/^\s*(\d{1,7})\s*$/);
  if (m) return parseInt(m[1], 10);
  return null;
}

// Update a record parts line with the PO's tracking info and link one PO line.
async function linkPair(client, po, recordLineId, poItemId) {
  await client.query('UPDATE po_line_items SET record_parts_line_id = $1 WHERE id = $2', [recordLineId, poItemId]);
  await client.query(
    `UPDATE record_parts_lines SET
       po_number = COALESCE($1, po_number),
       order_number = COALESCE($2, order_number),
       order_tracking = COALESCE($3, order_tracking),
       order_eta = COALESCE($4, order_eta),
       updated_at = NOW()
     WHERE id = $5`,
    [po.po_number || null, po.order_number || null, po.tracking_number || null, po.expected_date || null, recordLineId]
  );
}

// Keep already-linked record lines in sync with the (possibly updated) PO.
async function syncLinkedRecordLines(client, po) {
  await client.query(
    `UPDATE record_parts_lines rpl SET
       po_number = COALESCE($1, rpl.po_number),
       order_number = COALESCE($2, rpl.order_number),
       order_tracking = COALESCE($3, rpl.order_tracking),
       order_eta = COALESCE($4, rpl.order_eta),
       updated_at = NOW()
     FROM po_line_items li
     WHERE li.po_id = $5 AND li.record_parts_line_id = rpl.id`,
    [po.po_number || null, po.order_number || null, po.tracking_number || null, po.expected_date || null, po.id]
  );
}

async function autoLinkImportedPO(client, po, po_name) {
  // Unused (still-unlinked) line items on this PO.
  const { rows: poItems } = await client.query(
    'SELECT id, vendor_part_number, description FROM po_line_items WHERE po_id = $1 AND record_parts_line_id IS NULL ORDER BY id',
    [po.id]
  );
  const unused = [...poItems];
  const linkedRecordIds = new Set();
  let linked = 0;

  const takeItemFor = (recLine, allowAny) => {
    let i = unused.findIndex(pi => vpEq(pi.vendor_part_number, recLine.vendor_part_number));
    if (i < 0) i = unused.findIndex(pi => descClose(pi.description, recLine.description));
    if (i < 0 && allowAny) i = 0;
    return i;
  };
  const linkLine = async (recLine, allowAny) => {
    if (!unused.length || linkedRecordIds.has(recLine.id)) return;
    const i = takeItemFor(recLine, allowAny);
    if (i < 0) return;
    const poItem = unused.splice(i, 1)[0];
    await linkPair(client, po, recLine.id, poItem.id);
    linkedRecordIds.add(recLine.id);
    linked++;
  };

  // (1) Same order_number, no existing PO link. Strong signal → allow any item.
  if (po.order_number) {
    const { rows } = await client.query(
      `SELECT id, vendor_part_number, description FROM record_parts_lines
        WHERE deleted_at IS NULL AND po_number IS NULL
          AND order_number IS NOT NULL AND LOWER(TRIM(order_number)) = LOWER(TRIM($1))`,
      [po.order_number]
    );
    for (const rl of rows) { if (!unused.length) break; await linkLine(rl, true); }
  }

  // (2) Record id parsed from po_name → match its ordered/not_ordered lines by
  //     part number or close description (require a field match, never guess).
  const recId = extractRecordId(po_name);
  if (recId && unused.length) {
    const { rows: rec } = await client.query('SELECT id FROM records WHERE id = $1 AND deleted_at IS NULL', [recId]);
    if (rec.length) {
      const { rows } = await client.query(
        `SELECT id, vendor_part_number, description FROM record_parts_lines
          WHERE record_id = $1 AND deleted_at IS NULL AND po_number IS NULL
            AND order_status IN ('ordered', 'not_ordered')`,
        [recId]
      );
      for (const rl of rows) { if (!unused.length) break; await linkLine(rl, false); }
    }
  }

  // (3) Same supplier + exact vendor_part_number on 'ordered' lines with no
  //     order_number. Iterate the remaining unused items.
  for (const poItem of [...unused]) {
    if (!poItem.vendor_part_number) continue;
    const supCond = po.supplier_id ? 'rpl.supplier_id = $2' : 'LOWER(TRIM(rpl.vendor)) = LOWER(TRIM($2))';
    const supVal = po.supplier_id || po.vendor;
    const { rows } = await client.query(
      `SELECT id, vendor_part_number, description FROM record_parts_lines rpl
        WHERE deleted_at IS NULL AND po_number IS NULL
          AND order_status = 'ordered' AND order_number IS NULL
          AND LOWER(TRIM(vendor_part_number)) = LOWER(TRIM($1))
          AND ${supCond}
        ORDER BY id LIMIT 1`,
      [poItem.vendor_part_number, supVal]
    );
    if (rows.length && !linkedRecordIds.has(rows[0].id)) {
      const idx = unused.findIndex(u => u.id === poItem.id);
      if (idx >= 0) {
        const chosen = unused.splice(idx, 1)[0];
        await linkPair(client, po, rows[0].id, chosen.id);
        linkedRecordIds.add(rows[0].id);
        linked++;
      }
    }
  }

  return linked;
}

// Log to order_email_log (gmail_msg_id is UNIQUE) — best-effort match record.
async function logInboundEmail(client, msgId, po, { order_number, po_name, vendor_name }) {
  try {
    await client.query('SAVEPOINT sp_email');
    await client.query(
      `INSERT INTO order_email_log (gmail_msg_id, parsed_po, parsed_json, match_status)
       VALUES ($1, $2, $3, 'matched')
       ON CONFLICT (gmail_msg_id) DO UPDATE SET
         parsed_po = EXCLUDED.parsed_po, parsed_json = EXCLUDED.parsed_json, match_status = 'matched'`,
      [msgId, po.po_number || order_number || String(po.id),
       JSON.stringify({ po_id: po.id, order_number, po_name: po_name || null, vendor_name })]
    );
    await client.query('RELEASE SAVEPOINT sp_email');
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT sp_email');
  }
}

// ---------------------------------------------------------------------------
// Build/refresh the notes string, preserving any existing operator notes and
// adding "PO: <po_name>" exactly once (idempotent across repeat imports).
// ---------------------------------------------------------------------------
function mergePoNameIntoNotes(existingNotes, poName) {
  const parts = [];
  const name = poName == null ? '' : String(poName).trim();
  if (name) parts.push(`PO: ${name}`);

  const prior = (existingNotes || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    // Drop the bits we regenerate so repeat imports don't duplicate them.
    .filter((s) => !/^PO:\s/i.test(s))
    .filter((s) => s !== 'Imported via email agent');

  parts.push(...prior);
  parts.push('Imported via email agent');
  return parts.join(' | ');
}

// ---------------------------------------------------------------------------
// Reconcile po_line_items against the supplier confirmation. Update costs on
// lines we can match, insert lines the email has that the PO does not. Never
// deletes. Returns { updated, inserted }.
// ---------------------------------------------------------------------------
async function reconcileLineItems(client, poId, items) {
  const result = { updated: 0, inserted: 0 };
  if (!Array.isArray(items) || items.length === 0) return result;

  const { rows: current } = await client.query(
    'SELECT id, description, vendor_part_number FROM po_line_items WHERE po_id = $1',
    [poId]
  );

  const norm = (v) => (v == null ? '' : String(v).trim().toLowerCase());
  const claimed = new Set();

  for (const item of items) {
    const qty = parseFloat(item.qty) || 1;
    const costEach = parseFloat(item.cost_each) || 0;
    const lineTotal = Math.round(qty * costEach * 100) / 100;
    const vpn = norm(item.vendor_part_number);
    const desc = norm(item.description);

    // Prefer an exact vendor_part_number match; fall back to description.
    const match = current.find(
      (c) =>
        !claimed.has(c.id) &&
        ((vpn && norm(c.vendor_part_number) === vpn) ||
          (!vpn && desc && norm(c.description) === desc))
    );

    if (match) {
      claimed.add(match.id);
      await client.query(
        `UPDATE po_line_items
            SET qty = $1, cost_each = $2, line_total = $3, source = 'email'
          WHERE id = $4`,
        [qty, costEach, lineTotal, match.id]
      );
      result.updated += 1;
    } else {
      await client.query(
        `INSERT INTO po_line_items
           (po_id, description, vendor_part_number, qty, cost_each, line_total, matched, source)
         VALUES ($1, $2, $3, $4, $5, $6, false, 'email')`,
        [poId, item.description || 'Imported item', item.vendor_part_number || null, qty, costEach, lineTotal]
      );
      result.inserted += 1;
    }
  }
  return result;
}

module.exports = router;
