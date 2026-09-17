// ---------------------------------------------------------------------------
// Business Settings — the owner-editable configuration panel.
//
// Three deliberate brakes, in order:
//   1. EDIT MODE. Everything is read-only text until Edit Mode is switched on.
//      You cannot change a rate by clicking into a field you were only reading.
//   2. CONFIRM. Saving does not save. It opens a review box listing every
//      change as old -> new, with a note on what each one affects, and only the
//      button in that box writes anything.
//   3. HISTORY. Every change is listed underneath with who made it and when,
//      and each one has an Undo button.
//
// Leaving Edit Mode with unsaved edits asks first. Nothing here can delete a
// setting or add one — the list comes from the server — so the worst case is a
// wrong value, which is one click in the history to put back.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateFormat';

// A percentage is STORED as a decimal (0.035) and SHOWN as 3.5. Everything in
// this file that touches a percent goes through these two, so the conversion
// happens in exactly one place in each direction.
const toDisplay = (setting) => {
  if (setting.value_type === 'percent') {
    const n = parseFloat(setting.value);
    if (!Number.isFinite(n)) return '';
    // Trim trailing zeros: 3.50 reads as 3.5, 9.75 stays 9.75.
    return String(parseFloat((n * 100).toFixed(4)));
  }
  return setting.value == null ? '' : String(setting.value);
};

const toStored = (setting, displayValue) => {
  if (setting.value_type === 'percent') {
    const n = parseFloat(String(displayValue).replace(/[%\s,]/g, ''));
    if (!Number.isFinite(n)) return displayValue;
    return String(parseFloat((n / 100).toFixed(6)));
  }
  return displayValue;
};

// How a value reads when it is NOT being edited.
const prettyValue = (setting, stored) => {
  const v = stored == null ? '' : String(stored);
  switch (setting.value_type) {
    case 'percent': {
      const n = parseFloat(v);
      return Number.isFinite(n) ? `${parseFloat((n * 100).toFixed(4))}%` : v;
    }
    case 'money': {
      const n = parseFloat(v);
      return Number.isFinite(n) ? `$${n.toFixed(2)}` : v;
    }
    case 'boolean':
      return v === 'true' ? 'On' : 'Off';
    default:
      return v;
  }
};

export default function BusinessSettings() {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const [catalog, setCatalog] = useState({ categories: [], settings: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  // Keyed by setting key, holding the DISPLAY value being typed.
  const [drafts, setDrafts] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [reviewing, setReviewing] = useState(null); // { diff: [...] } once confirmed
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [audit, setAudit] = useState([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [reverting, setReverting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBusinessSettings();
      setCatalog(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      setAudit(await api.getBusinessSettingsAudit());
    } catch {
      setAudit([]);
    }
  }, []);

  useEffect(() => { if (isAdmin) { load(); loadAudit(); } }, [isAdmin, load, loadAudit]);

  const byCategory = useMemo(() => {
    const map = {};
    for (const s of catalog.settings) (map[s.category] = map[s.category] || []).push(s);
    return map;
  }, [catalog.settings]);

  // A draft counts as a change only once it differs from what is stored, so
  // typing a value and typing it back leaves you with nothing to save.
  const pendingChanges = useMemo(() => {
    const out = [];
    for (const s of catalog.settings) {
      if (!(s.key in drafts)) continue;
      const stored = toStored(s, drafts[s.key]);
      if (String(stored).trim() === String(s.value).trim()) continue;
      out.push({ setting: s, value: stored, display: drafts[s.key] });
    }
    return out;
  }, [drafts, catalog.settings]);

  const changeCount = pendingChanges.length;

  function setDraft(key, value) {
    setDrafts(d => ({ ...d, [key]: value }));
    setFieldErrors(e => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function discardEdits() {
    setDrafts({});
    setFieldErrors({});
    setReviewing(null);
  }

  function leaveEditMode() {
    if (changeCount > 0 &&
        !window.confirm(`You have ${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}. Discard them?`)) {
      return;
    }
    discardEdits();
    setEditMode(false);
  }

  // Step 2 of 3: ask the server to validate and describe the change, but write
  // nothing. What comes back is what the confirmation box shows.
  async function handleReview() {
    setMsg(null);
    try {
      const res = await api.validateBusinessSettings(
        pendingChanges.map(c => ({ key: c.setting.key, value: c.value }))
      );
      if (res.errors && res.errors.length) {
        const map = {};
        for (const e of res.errors) map[e.key] = e.error;
        setFieldErrors(map);
        setMsg({ type: 'error', text: 'Fix the highlighted values before saving.' });
        return;
      }
      if (!res.diff.length) {
        setMsg({ type: 'info', text: 'Nothing changed.' });
        return;
      }
      setReviewing(res);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  }

  // Step 3 of 3: the only call that writes.
  async function handleConfirmSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.saveBusinessSettings(
        reviewing.diff.map(d => ({ key: d.key, value: d.new_value })),
        true
      );
      setReviewing(null);
      discardEdits();
      setEditMode(false);
      await load();
      await loadAudit();
      setMsg({ type: 'success', text: `Saved ${res.saved} ${res.saved === 1 ? 'change' : 'changes'}.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleRevert(entry) {
    if (!window.confirm(
      `Put "${entry.setting_label}" back to ${prettyValue({ value_type: entry.value_type }, entry.old_value)}?`
    )) return;
    setReverting(entry.id);
    setMsg(null);
    try {
      await api.revertBusinessSetting(entry.id);
      await load();
      await loadAudit();
      setMsg({ type: 'success', text: `${entry.setting_label} put back.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setReverting(null);
    }
  }

  if (!isAdmin) return null;

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ ...sectionTitle, border: 'none', margin: 0, padding: 0 }}>Business Settings</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
            Rates, fees and the wording customers see. Everything is locked until you turn on Edit Mode.
          </p>
        </div>
        <EditModeToggle on={editMode} onChange={(next) => (next ? setEditMode(true) : leaveEditMode())} />
      </div>

      {msg && (
        <div style={{
          padding: '10px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.84rem',
          backgroundColor: msg.type === 'success' ? '#f0fdf4' : msg.type === 'error' ? '#fef2f2' : '#f8fafc',
          color: msg.type === 'success' ? '#065f46' : msg.type === 'error' ? '#b91c1c' : '#334155',
          border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : msg.type === 'error' ? '#fecaca' : '#e2e8f0'}`,
        }}>{msg.text}</div>
      )}

      {editMode && (
        <div style={{ padding: '10px 12px', marginBottom: '16px', borderRadius: '6px',
                      background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e' }}>
          <strong>Edit Mode is on.</strong> Changes are not saved until you review and confirm them.
        </div>
      )}

      {loading && <div style={{ color: '#9ca3af', padding: '20px 0' }}>Loading settings...</div>}
      {loadError && <div style={{ color: '#b91c1c', padding: '12px 0', fontSize: '0.85rem' }}>{loadError}</div>}

      {!loading && !loadError && catalog.categories.map(cat => {
        const items = byCategory[cat.key] || [];
        if (!items.length) return null;
        return (
          <div key={cat.key} style={{ marginBottom: '22px' }}>
            <h3 style={catTitle}>{cat.label}</h3>
            {cat.blurb && <p style={catBlurb}>{cat.blurb}</p>}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              {items.map((s, i) => (
                <SettingRow
                  key={s.key}
                  setting={s}
                  editMode={editMode}
                  draft={drafts[s.key]}
                  error={fieldErrors[s.key]}
                  onChange={(v) => setDraft(s.key, v)}
                  striped={i % 2 === 1}
                />
              ))}
            </div>
          </div>
        );
      })}

      {editMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px',
                      paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleReview}
            disabled={changeCount === 0}
            style={{ ...btnPrimary, opacity: changeCount === 0 ? 0.45 : 1,
                     cursor: changeCount === 0 ? 'not-allowed' : 'pointer' }}
          >
            {changeCount === 0 ? 'No changes yet' : `Review ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}`}
          </button>
          <button onClick={leaveEditMode} style={btnGhost}>Cancel</button>
        </div>
      )}

      {reviewing && (
        <ConfirmChanges
          diff={reviewing.diff}
          saving={saving}
          onCancel={() => setReviewing(null)}
          onConfirm={handleConfirmSave}
        />
      )}

      {/* Change history */}
      <div style={{ marginTop: '26px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
        <button onClick={() => setAuditOpen(o => !o)} style={linkBtn}>
          {auditOpen ? 'Hide' : 'Show'} change history{audit.length ? ` (${audit.length})` : ''}
        </button>
        {auditOpen && (
          audit.length === 0
            ? <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '10px 0 0' }}>Nothing has been changed yet.</p>
            : (
              <div style={{ marginTop: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                {audit.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                    background: i % 2 ? '#fafafa' : '#fff', borderTop: i ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                        {a.setting_label || a.setting_key}
                        {a.source === 'revert' && (
                          <span style={{ marginLeft: '8px', fontSize: '0.68rem', fontWeight: 600, color: '#6b7280',
                                         background: '#f3f4f6', borderRadius: '10px', padding: '2px 8px' }}>undo</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px',
                                    overflowWrap: 'anywhere' }}>
                        <span style={{ textDecoration: 'line-through' }}>
                          {prettyValue({ value_type: a.value_type }, a.old_value)}
                        </span>
                        {'  →  '}
                        <strong style={{ color: '#111827' }}>
                          {prettyValue({ value_type: a.value_type }, a.new_value)}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '3px' }}>
                        {a.changed_by_name || 'Unknown'} · {formatDateTime(a.changed_at)}
                        {a.reverted_at && ` · undone ${formatDateTime(a.reverted_at)}`}
                      </div>
                    </div>
                    {a.can_revert && (
                      <button
                        onClick={() => handleRevert(a)}
                        disabled={reverting === a.id}
                        style={{ ...btnSmall, opacity: reverting === a.id ? 0.5 : 1 }}
                      >
                        {reverting === a.id ? 'Undoing...' : 'Undo'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function EditModeToggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      title={on ? 'Lock the settings again' : 'Unlock the settings for editing'}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0,
        padding: '7px 13px', borderRadius: '20px', cursor: 'pointer',
        fontSize: '0.8rem', fontWeight: 600,
        border: `1px solid ${on ? '#f59e0b' : '#d1d5db'}`,
        background: on ? '#fffbeb' : '#fff',
        color: on ? '#92400e' : '#374151',
      }}
    >
      <span style={{
        width: '30px', height: '17px', borderRadius: '9px', position: 'relative',
        background: on ? '#f59e0b' : '#d1d5db', transition: 'background .12s',
      }}>
        <span style={{
          position: 'absolute', top: '2px', left: on ? '15px' : '2px',
          width: '13px', height: '13px', borderRadius: '50%', background: '#fff',
          transition: 'left .12s',
        }} />
      </span>
      Edit Mode
    </button>
  );
}

function SettingRow({ setting, editMode, draft, error, onChange, striped }) {
  const display = draft !== undefined ? draft : toDisplay(setting);
  const changed = draft !== undefined && String(toStored(setting, draft)).trim() !== String(setting.value).trim();
  const isLong = setting.value_type === 'longtext';

  return (
    <div style={{
      display: 'flex', flexDirection: isLong ? 'column' : 'row',
      alignItems: isLong ? 'stretch' : 'flex-start',
      gap: isLong ? '8px' : '16px', padding: '11px 14px',
      background: changed ? '#fffbeb' : striped ? '#fafafa' : '#fff',
      borderTop: striped || changed ? '1px solid #f3f4f6' : 'none',
      borderLeft: changed ? '3px solid #f59e0b' : '3px solid transparent',
    }}>
      <div style={{ flex: isLong ? 'none' : '1 1 auto', minWidth: 0 }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111827' }}>
          {setting.label}
          {changed && <span style={{ marginLeft: '8px', fontSize: '0.68rem', color: '#92400e', fontWeight: 700 }}>CHANGED</span>}
        </div>
        {setting.help && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '3px', lineHeight: 1.45 }}>
            {setting.help}
          </div>
        )}
        {error && (
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
            This {error}
          </div>
        )}
      </div>

      <div style={{ flex: isLong ? 'none' : '0 0 auto', minWidth: isLong ? 0 : '190px', textAlign: isLong ? 'left' : 'right' }}>
        {!editMode ? (
          <div style={{
            fontSize: '0.88rem', color: '#111827', fontWeight: 600,
            whiteSpace: isLong ? 'pre-wrap' : 'normal', textAlign: isLong ? 'left' : 'right',
            background: isLong ? '#f9fafb' : 'transparent',
            border: isLong ? '1px solid #f3f4f6' : 'none',
            borderRadius: isLong ? '6px' : 0, padding: isLong ? '8px 10px' : 0,
            lineHeight: 1.5, overflowWrap: 'anywhere',
          }}>
            {prettyValue(setting, setting.value)}
          </div>
        ) : (
          <SettingInput setting={setting} value={display} error={!!error} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

function SettingInput({ setting, value, error, onChange }) {
  const base = {
    width: '100%', boxSizing: 'border-box', padding: '7px 10px',
    border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`, borderRadius: '6px',
    fontSize: '0.86rem', fontFamily: 'inherit',
  };

  if (setting.value_type === 'boolean') {
    return (
      <select value={value === 'true' ? 'true' : 'false'} onChange={(e) => onChange(e.target.value)}
              style={{ ...base, minWidth: '110px' }}>
        <option value="true">On</option>
        <option value="false">Off</option>
      </select>
    );
  }

  if (setting.value_type === 'longtext') {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5}
                style={{ ...base, resize: 'vertical', lineHeight: 1.5 }} />
    );
  }

  const numeric = ['money', 'percent', 'number', 'integer'].includes(setting.value_type);
  const suffix = setting.value_type === 'percent' ? '%' : null;
  const prefix = setting.value_type === 'money' ? '$' : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
      {prefix && <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{prefix}</span>}
      <input
        type={numeric ? 'number' : 'text'}
        step={setting.value_type === 'integer' ? '1' : setting.value_type === 'percent' ? '0.01' : '0.01'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...base, textAlign: numeric ? 'right' : 'left', minWidth: numeric ? '100px' : '190px' }}
      />
      {suffix && <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{suffix}</span>}
    </div>
  );
}

// The confirmation box. This is the last thing between a typed number and a
// customer's card, so it spells out every change rather than counting them.
function ConfirmChanges({ diff, saving, onCancel, onConfirm }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '10px', width: '100%', maxWidth: '560px',
        maxHeight: '86vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,.28)',
      }}>
        <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e3a5f' }}>
            Confirm {diff.length} {diff.length === 1 ? 'change' : 'changes'}
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
            Nothing has been saved yet. Check each line, then confirm.
          </p>
        </div>

        <div style={{ overflowY: 'auto', padding: '6px 22px 12px' }}>
          {diff.map(d => (
            <div key={d.key} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#111827' }}>{d.label}</div>
              <div style={{ fontSize: '0.85rem', marginTop: '5px', overflowWrap: 'anywhere' }}>
                <span style={{ color: '#9ca3af', textDecoration: 'line-through' }}>
                  {prettyValue({ value_type: d.value_type }, d.old_value)}
                </span>
                <span style={{ color: '#9ca3af', margin: '0 8px' }}>→</span>
                <strong style={{ color: '#065f46' }}>
                  {prettyValue({ value_type: d.value_type }, d.new_value)}
                </strong>
              </div>
              {d.effect_note && (
                <div style={{ fontSize: '0.75rem', color: '#92400e', background: '#fffbeb',
                              border: '1px solid #fde68a', borderRadius: '5px',
                              padding: '6px 9px', marginTop: '7px', lineHeight: 1.45 }}>
                  {d.effect_note}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid #e5e7eb',
                      display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={saving} style={btnGhost}>Go back</button>
          <button onClick={onConfirm} disabled={saving}
                  style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save these changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const sectionStyle = {
  marginBottom: '24px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const sectionTitle = {
  fontSize: '1rem', fontWeight: 700, color: '#1e3a5f',
};
const catTitle = {
  fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
  letterSpacing: '0.05em', margin: '0 0 3px',
};
const catBlurb = {
  fontSize: '0.76rem', color: '#9ca3af', margin: '0 0 9px', lineHeight: 1.45,
};
const btnPrimary = {
  padding: '9px 18px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none',
  borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem',
};
const btnGhost = {
  padding: '9px 16px', backgroundColor: '#fff', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.86rem',
};
const btnSmall = {
  padding: '5px 12px', backgroundColor: '#fff', color: '#1e3a5f',
  border: '1px solid #1e3a5f', borderRadius: '5px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.75rem', flexShrink: 0,
};
const linkBtn = {
  background: 'none', border: 'none', padding: 0, color: '#1e3a5f',
  fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
};
