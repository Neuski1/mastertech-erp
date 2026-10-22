import React, { useState } from 'react';
import { api } from '../api/client';

// Hard vs flexible due date on a work order (migration 076, Oct 22, 2026).
// Flexible is the default: a placeholder date that keeps the board in order
// and never reaches the customer. Hard is a real promise and needs a reason;
// only hard dates go on the customer's texts, status page and estimate.
const btn = {
  padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer',
  border: '1px solid #9ca3af', background: '#fff', color: '#374151',
};
const btnRed = { ...btn, border: '1px solid #dc2626', background: '#dc2626', color: '#fff' };

export default function DeadlineControl({ record, editable, onSaved, onError }) {
  const isHard = record.deadline_type === 'hard';
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (body) => {
    setBusy(true);
    try {
      await api.updateRecord(record.id, body);
      setEditing(false);
      if (onSaved) await onSaved();
    } catch (err) {
      if (onError) onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    if (!record.expected_completion_date) {
      if (onError) onError('Set the Expected Completion date first, then mark it a hard deadline.');
      return;
    }
    setReason(record.deadline_reason || '');
    setEditing(true);
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
              <button style={btn} disabled={busy} onClick={startEdit}>Edit reason</button>
              <button style={btn} disabled={busy} onClick={() => save({ deadline_type: 'flexible' })}>Make flexible</button>
            </>
          ) : (
            <button style={btnRed} disabled={busy} onClick={startEdit}>Mark hard deadline</button>
          )
        )}
      </div>
      {editing && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && reason.trim()) save({ deadline_type: 'hard', deadline_reason: reason.trim() }); }}
            placeholder="Why is it hard? e.g. Leaving for Moab 11/6"
            style={{ flex: 1, minWidth: '220px', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
          />
          <button style={btnRed} disabled={busy || !reason.trim()}
            onClick={() => save({ deadline_type: 'hard', deadline_reason: reason.trim() })}>
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button style={btn} disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
      {isHard && (
        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '6px' }}>
          This date goes on the customer's status texts, status page and estimate.
        </div>
      )}
    </div>
  );
}
