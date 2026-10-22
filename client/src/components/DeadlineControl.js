import React, { useState } from 'react';
import { api } from '../api/client';

// Hard vs flexible due date on a work order (migration 076, Oct 22, 2026).
// Flexible is the default: a placeholder date that keeps the board in order
// and never reaches the customer. Hard is a real promise and needs a reason;
// only hard dates go on the customer's texts, status page and estimate.
//
// Errors show INSIDE this box (Oct 22 fix): the page-level error banner sits
// at the top of the work order, out of sight of the Dates section, so a
// refused save looked like "nothing happened". The editor also carries its own
// date field, so an estimate with no due date can be marked hard in one step.
const btn = {
  padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer',
  border: '1px solid #9ca3af', background: '#fff', color: '#374151',
};
const btnRed = { ...btn, border: '1px solid #dc2626', background: '#dc2626', color: '#fff' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' };

// "2026-10-30T06:00:00.000Z" or "2026-10-30" -> "2026-10-30" for <input type=date>.
const ymd = (v) => (v ? String(v).slice(0, 10) : '');

export default function DeadlineControl({ record, editable, onSaved }) {
  const isHard = record.deadline_type === 'hard';
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async (body) => {
    setBusy(true);
    setErr('');
    try {
      await api.updateRecord(record.id, body);
      setEditing(false);
      if (onSaved) await onSaved();
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    setErr('');
    setReason(record.deadline_reason || '');
    setDue(ymd(record.expected_completion_date));
    setEditing(true);
  };

  const saveHard = () => {
    if (!due) { setErr('Pick the due date.'); return; }
    if (!reason.trim()) { setErr('Type the reason, for example "Leaving for Moab 11/6".'); return; }
    const body = { deadline_type: 'hard', deadline_reason: reason.trim() };
    if (due !== ymd(record.expected_completion_date)) body.expected_completion_date = due;
    save(body);
  };

  return (
    <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
      background: isHard ? '#fef2f2' : '#f9fafb', border: `1px solid ${isHard ? '#fecaca' : '#e5e7eb'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {isHard ? (
          <span style={{ background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.75rem',
            padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>HARD DEADLINE</span>
        ) : (
          <span style={{ background: '#e5e7eb', color: '#374151', fontWeight: 600, fontSize: '0.75rem',
            padding: '3px 8px', borderRadius: '4px' }}>FLEXIBLE</span>
        )}
        <span style={{ fontSize: '0.85rem', color: '#374151', flex: 1, minWidth: '180px' }}>
          {isHard
            ? (record.deadline_reason || 'No reason given')
            : 'Internal target only. Not shown to the customer.'}
        </span>
        {editable && !editing && (
          isHard ? (
            <>
              <button type="button" style={btn} disabled={busy} onClick={startEdit}>Edit</button>
              <button type="button" style={btn} disabled={busy} onClick={() => save({ deadline_type: 'flexible' })}>
                {busy ? 'Removing...' : 'Remove hard deadline'}
              </button>
            </>
          ) : (
            <button type="button" style={btnRed} disabled={busy} onClick={startEdit}>Mark hard deadline</button>
          )
        )}
      </div>
      {editing && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={inputStyle} />
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveHard(); }}
            placeholder="Why is it hard? e.g. Leaving for Moab 11/6"
            style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
          />
          <button type="button" style={btnRed} disabled={busy} onClick={saveHard}>
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button type="button" style={btn} disabled={busy} onClick={() => { setEditing(false); setErr(''); }}>Cancel</button>
        </div>
      )}
      {err && (
        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>{err}</div>
      )}
      {isHard && !err && (
        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '6px' }}>
          This date goes on the customer's status texts, status page and estimate.
        </div>
      )}
    </div>
  );
}
