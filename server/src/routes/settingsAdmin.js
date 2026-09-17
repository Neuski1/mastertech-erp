// ---------------------------------------------------------------------------
// Business Settings — the owner-editable configuration surface.
//
// The point of this route is that Carol can change what the business charges
// and what it says to customers without a developer in the loop. That makes it
// the most dangerous route in the system, so it is built with the brakes on:
//
//   * admin role only, always.
//   * Every value is validated against its catalog entry — type, range, and
//     for percentages a hard ceiling — before it touches the table.
//   * Nothing saves without `confirm: true` on the request. The UI shows the
//     old-vs-new diff and sets that flag only after the change is confirmed on
//     screen, so a stray PUT cannot rewrite the card fee.
//   * Every change writes an audit row: who, when, old value, new value.
//   * Every audit row can be reverted in one click, which itself writes a new
//     audit row rather than erasing history.
//
// Nothing here can delete a setting or invent a new key. The catalog is the
// only source of what exists, so the worst an editing mistake can do is set a
// known key to another in-range value, which is one click to undo.
// ---------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');
const { CATEGORIES, SETTINGS, BY_KEY } = require('../db/settingsCatalog');
const settings = require('../db/settings');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Longest customer-facing string we will store. Generous for a paragraph of
// contract wording, small enough that nobody pastes a novel into an invoice.
const MAX_TEXT = 200;
const MAX_LONGTEXT = 4000;

// ---------------------------------------------------------------------------
// validate — returns { ok, value } or { ok: false, error }
// `value` comes back as the canonical STRING that goes in setting_value.
// ---------------------------------------------------------------------------
function validate(def, incoming) {
  const t = def.value_type;

  if (t === 'boolean') {
    if (typeof incoming === 'boolean') return { ok: true, value: incoming ? 'true' : 'false' };
    const s = String(incoming).trim().toLowerCase();
    if (['true', 'false'].includes(s)) return { ok: true, value: s };
    return { ok: false, error: 'must be true or false' };
  }

  if (t === 'money' || t === 'number' || t === 'integer' || t === 'percent') {
    if (incoming === '' || incoming === null || incoming === undefined) {
      return { ok: false, error: 'cannot be blank' };
    }
    // Tolerate a pasted "$1,250.00" or a trailing "%" — the owner is typing
    // these by hand and should not have to strip formatting.
    const cleaned = String(incoming).replace(/[$,\s%]/g, '');
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return { ok: false, error: 'must be a number' };
    if (n < 0) return { ok: false, error: 'cannot be negative' };
    if (t === 'integer' && !Number.isInteger(n)) return { ok: false, error: 'must be a whole number' };

    const min = def.min != null ? def.min : 0;
    const max = def.max != null ? def.max : null;
    if (n < min) return { ok: false, error: `cannot be below ${formatForError(def, min)}` };
    if (max != null && n > max) return { ok: false, error: `cannot be above ${formatForError(def, max)}` };

    if (t === 'money') return { ok: true, value: (Math.round(n * 100) / 100).toFixed(2) };
    if (t === 'integer') return { ok: true, value: String(Math.round(n)) };
    // Percentages are stored as decimals. Six places is enough for 3.5% and
    // stops floating point noise from landing in the table.
    if (t === 'percent') return { ok: true, value: String(Number(n.toFixed(6))) };
    return { ok: true, value: String(n) };
  }

  const s = String(incoming == null ? '' : incoming);

  if (t === 'email') {
    const trimmed = s.trim();
    if (!EMAIL_RE.test(trimmed)) return { ok: false, error: 'must be a valid email address' };
    return { ok: true, value: trimmed };
  }

  if (t === 'longtext') {
    if (s.length > MAX_LONGTEXT) return { ok: false, error: `must be under ${MAX_LONGTEXT} characters` };
    if (!s.trim()) return { ok: false, error: 'cannot be blank' };
    return { ok: true, value: s };
  }

  // text and phone
  const trimmed = s.trim();
  if (!trimmed) return { ok: false, error: 'cannot be blank' };
  if (trimmed.length > MAX_TEXT) return { ok: false, error: `must be under ${MAX_TEXT} characters` };
  return { ok: true, value: trimmed };
}

function formatForError(def, n) {
  if (def.value_type === 'percent') return `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
  if (def.value_type === 'money') return `$${Number(n).toFixed(2)}`;
  return String(n);
}

// A setting the owner changes but that the code still reads from somewhere
// else is a lie on screen. These are the keys whose changes only take effect
// on the NEXT run of a scheduled job, and the UI says so.
const DEFERRED_EFFECT = {
  storage_card_fee_pct: 'Takes effect on the next invoice run and the next autopay charge. Invoices already sent are unchanged.',
  storage_ach_fee_pct: 'Takes effect on the next invoice run.',
  storage_ach_fee_min: 'Takes effect on the next invoice run.',
  storage_late_fee: 'Takes effect on the next reminder you send.',
  storage_late_fee_day: 'Takes effect on the next reminder you send.',
  labor_rate: 'Applies to new labor lines. Existing work orders keep the rate they were written at.',
  tax_rate: 'Applies to new work orders. Existing ones keep their own rate.',
  shop_supplies_rate: 'Recalculates on any work order that is edited after this change.',
  cc_fee_rate: 'Recalculates on any work order that is edited after this change.',
  storage_indoor_rate_per_ft: 'Used when quoting a new space. Existing contracts keep their quoted rate.',
  storage_outdoor_rate_per_ft: 'Used when quoting a new space. Existing contracts keep their quoted rate.',
};

// ---------------------------------------------------------------------------
// GET /api/settings-admin — the whole editable catalog with current values
// ---------------------------------------------------------------------------
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT setting_key, setting_value, updated_at, updated_by_name
         FROM system_settings`
    );
    const live = new Map(rows.map(r => [r.setting_key, r]));

    const items = SETTINGS.map(def => {
      const row = live.get(def.key);
      const stored = row && row.setting_value !== null && String(row.setting_value).trim() !== ''
        ? row.setting_value : null;
      return {
        key: def.key,
        category: def.category,
        sort: def.sort,
        label: def.label,
        value_type: def.value_type,
        help: def.help || null,
        min: def.min != null ? def.min : null,
        max: def.max != null ? def.max : null,
        value: stored != null ? stored : String(def.fallback),
        default_value: String(def.fallback),
        is_default: stored == null || String(stored) === String(def.fallback),
        updated_at: row ? row.updated_at : null,
        updated_by_name: row ? row.updated_by_name : null,
        effect_note: DEFERRED_EFFECT[def.key] || null,
      };
    });

    res.json({
      categories: CATEGORIES.slice().sort((a, b) => a.sort - b.sort),
      settings: items.sort((a, b) => a.sort - b.sort),
    });
  } catch (err) {
    console.error('GET /settings-admin error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/settings-admin/validate — dry run. Returns the diff the UI shows
// in the confirmation box, with every value validated but nothing written.
// ---------------------------------------------------------------------------
router.post('/validate', requireRole('admin'), async (req, res) => {
  try {
    const result = await buildDiff(req.body?.changes);
    res.json(result);
  } catch (err) {
    console.error('POST /settings-admin/validate error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function buildDiff(changes) {
  if (!Array.isArray(changes) || !changes.length) {
    return { diff: [], errors: [], unchanged: 0 };
  }
  const keys = changes.map(c => c && c.key).filter(Boolean);
  const { rows } = await pool.query(
    'SELECT setting_key, setting_value FROM system_settings WHERE setting_key = ANY($1::text[])',
    [keys]
  );
  const live = new Map(rows.map(r => [r.setting_key, r.setting_value]));

  const diff = [];
  const errors = [];
  let unchanged = 0;

  for (const c of changes) {
    const def = BY_KEY.get(c && c.key);
    if (!def) {
      errors.push({ key: c && c.key, error: 'not a known setting' });
      continue;
    }
    const check = validate(def, c.value);
    if (!check.ok) {
      errors.push({ key: def.key, label: def.label, error: check.error });
      continue;
    }
    const current = live.has(def.key) && live.get(def.key) != null && String(live.get(def.key)).trim() !== ''
      ? String(live.get(def.key))
      : String(def.fallback);

    if (current === check.value) { unchanged++; continue; }

    diff.push({
      key: def.key,
      label: def.label,
      category: def.category,
      value_type: def.value_type,
      old_value: current,
      new_value: check.value,
      effect_note: DEFERRED_EFFECT[def.key] || null,
    });
  }
  return { diff, errors, unchanged };
}

// ---------------------------------------------------------------------------
// PUT /api/settings-admin — apply changes. Requires confirm: true.
//
// The confirm flag is the safety interlock: the editor only sets it after the
// owner has seen the old-vs-new list and clicked through it. Without it the
// route returns the diff and saves nothing, so an accidental or replayed
// request is a no-op that shows you what it would have done.
// ---------------------------------------------------------------------------
router.put('/', requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { changes, confirm } = req.body || {};
    const { diff, errors, unchanged } = await buildDiff(changes);

    if (errors.length) {
      return res.status(400).json({ error: 'Some values were rejected', errors, diff });
    }
    if (!diff.length) {
      return res.json({ saved: 0, unchanged, diff: [], message: 'Nothing changed' });
    }
    if (confirm !== true) {
      return res.status(409).json({
        error: 'Confirmation required',
        needs_confirmation: true,
        diff,
      });
    }

    const who = req.user || {};
    const whoName = who.name || who.email || 'Unknown';

    await client.query('BEGIN');
    for (const d of diff) {
      const def = BY_KEY.get(d.key);
      await client.query(
        `INSERT INTO system_settings (setting_key, setting_value, description, updated_at, updated_by, updated_by_name)
              VALUES ($1, $2, $3, NOW(), $4, $5)
         ON CONFLICT (setting_key) DO UPDATE
            SET setting_value = EXCLUDED.setting_value,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by,
                updated_by_name = EXCLUDED.updated_by_name`,
        [d.key, d.new_value, def.help || def.label, who.id || null, whoName]
      );
      await client.query(
        `INSERT INTO system_settings_audit
           (setting_key, setting_label, old_value, new_value, changed_by, changed_by_name, source)
         VALUES ($1, $2, $3, $4, $5, $6, 'edit')`,
        [d.key, d.label, d.old_value, d.new_value, who.id || null, whoName]
      );
    }
    await client.query('COMMIT');

    await settings.invalidate();

    res.json({ saved: diff.length, unchanged, diff });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('PUT /settings-admin error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// GET /api/settings-admin/audit — who changed what, newest first
// ---------------------------------------------------------------------------
router.get('/audit', requireRole('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const { rows } = await pool.query(
      `SELECT id, setting_key, setting_label, old_value, new_value,
              changed_by_name, changed_at, source, reverted_at, reverted_by_name
         FROM system_settings_audit
        ORDER BY changed_at DESC, id DESC
        LIMIT $1`,
      [limit]
    );
    // A row is revertable when it is the CURRENT value of that key. Reverting
    // an older entry when a newer one exists would silently undo the newer
    // change too, so the UI only offers undo on the latest entry per key.
    const { rows: current } = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    const live = new Map(current.map(r => [r.setting_key, r.setting_value == null ? null : String(r.setting_value)]));

    res.json(rows.map(r => ({
      ...r,
      value_type: BY_KEY.get(r.setting_key)?.value_type || 'text',
      can_revert: !r.reverted_at && live.get(r.setting_key) === String(r.new_value),
    })));
  } catch (err) {
    console.error('GET /settings-admin/audit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/settings-admin/audit/:id/revert — put a setting back
//
// Revert does not erase the original audit row. It marks it reverted and
// writes a NEW row for the reversal, so the history reads as what actually
// happened rather than as though the change never occurred.
// ---------------------------------------------------------------------------
router.post('/audit/:id/revert', requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT * FROM system_settings_audit WHERE id = $1',
      [req.params.id]
    );
    const entry = rows[0];
    if (!entry) return res.status(404).json({ error: 'Audit entry not found' });
    if (entry.reverted_at) return res.status(400).json({ error: 'That change was already reverted' });

    const def = BY_KEY.get(entry.setting_key);
    if (!def) return res.status(400).json({ error: 'That setting no longer exists' });

    const { rows: cur } = await client.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = $1',
      [entry.setting_key]
    );
    const currentValue = cur[0] ? String(cur[0].setting_value) : String(def.fallback);
    if (currentValue !== String(entry.new_value)) {
      return res.status(409).json({
        error: 'This setting has changed again since then. Undo the most recent change first.',
      });
    }

    // The old value still has to pass validation — an audit row written before
    // a range was tightened must not be a way around the range.
    const check = validate(def, entry.old_value);
    if (!check.ok) {
      return res.status(400).json({ error: `Cannot restore that value: it ${check.error}` });
    }

    const who = req.user || {};
    const whoName = who.name || who.email || 'Unknown';

    await client.query('BEGIN');
    await client.query(
      `UPDATE system_settings
          SET setting_value = $2, updated_at = NOW(), updated_by = $3, updated_by_name = $4
        WHERE setting_key = $1`,
      [entry.setting_key, check.value, who.id || null, whoName]
    );
    await client.query(
      `UPDATE system_settings_audit
          SET reverted_at = NOW(), reverted_by = $2, reverted_by_name = $3
        WHERE id = $1`,
      [entry.id, who.id || null, whoName]
    );
    await client.query(
      `INSERT INTO system_settings_audit
         (setting_key, setting_label, old_value, new_value, changed_by, changed_by_name, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'revert')`,
      [entry.setting_key, entry.setting_label, entry.new_value, check.value, who.id || null, whoName]
    );
    await client.query('COMMIT');

    await settings.invalidate();

    res.json({ success: true, setting_key: entry.setting_key, restored_to: check.value });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /settings-admin/audit/:id/revert error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
// Exposed so the validator can be exercised directly. Not mounted as a route.
module.exports.__validate = validate;
