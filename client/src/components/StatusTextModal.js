import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { formatDateTime } from '../utils/dateFormat';

// "Text Update" on a work order: the dealership-style status text.
// Tech taps an update, the words fill in, they can edit, one tap sends it
// through Dialpad on the shop number. Built to be used on a phone standing
// inside the customer's RV, so everything is big and one column on mobile.

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const NOTE_LABELS = {
  parts_ordered: { label: 'When are they due? (optional)', placeholder: 'e.g. ETA is Thursday.' },
  delayed: { label: 'Why, and the new date (required)', placeholder: 'e.g. The replacement awning arm is backordered until Oct 10.' },
  custom: { label: 'Your message', placeholder: 'Type what you want the customer to know.' },
};

// Same tidy-up the server does after filling tokens, so what the tech sees
// is exactly what gets sent.
function fill(text, note) {
  return String(text || '')
    .split('{note}').join(note || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([.,!?])/g, '$1')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function authToken() {
  try { return localStorage.getItem('erp_token'); } catch { return null; }
}

export default function StatusTextModal({ recordId, onClose, onSent }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [type, setType] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [edited, setEdited] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [picked, setPicked] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.getStatusUpdates(recordId), api.getRecordPhotos(recordId).catch(() => [])])
      .then(([d, p]) => {
        if (!alive) return;
        setData(d);
        setType(d.suggested || 'custom');
        setPhotos((Array.isArray(p) ? p : []).filter(ph => ph.filename || ph.content_type));
      })
      .catch(err => alive && setLoadError(err.message));
    return () => { alive = false; };
  }, [recordId]);

  const current = useMemo(() => (data ? data.types.find(t => t.key === type) : null), [data, type]);

  // Refill the message from the template whenever the update or note changes,
  // unless the tech has typed over it.
  useEffect(() => {
    if (!current || edited) return;
    setMessage(fill(current.draft, note));
  }, [current, note, edited]);

  const chooseType = (key) => {
    setType(key);
    setNote('');
    setEdited(false);
    setError('');
  };

  const noteCfg = current && current.draft.includes('{note}') ? (NOTE_LABELS[type] || { label: 'Extra detail (optional)', placeholder: '' }) : null;
  const finalText = message ? `${message.trim()}${/reply stop/i.test(message) ? '' : ` ${data?.stop_line || 'Reply STOP to opt out.'}`}` : '';
  const noteMissing = current && current.needs_note && !note.trim() && !edited;
  const customEmpty = type === 'custom' && !note.trim() && !edited;
  const canSend = data && data.can_send && message.trim() && !noteMissing && !customEmpty && !sending;

  const togglePhoto = (id) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const send = async () => {
    setError('');
    setSending(true);
    try {
      const out = await api.sendStatusUpdate(recordId, {
        type, note, message: message.trim(), photo_ids: picked,
      });
      onSent && onSent(out);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const labelFor = (key) => data?.types.find(t => t.key === key)?.label || key;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.15rem' }}>Text Customer Update</h2>
            {data && (
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>
                To {data.customer_name || 'customer'}{data.to ? ` at ${data.to.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')}` : ''} · WO #{data.record_number}
              </div>
            )}
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Close">&times;</button>
        </div>

        {loadError && <div style={errBox}>{loadError}</div>}
        {!data && !loadError && <div style={{ padding: '24px 0', color: '#6b7280' }}>Loading...</div>}

        {data && (
          <>
            {data.blockers.length > 0 && (
              <div style={{ ...warnBox, marginTop: 14 }}>
                <strong>{data.enabled ? 'Cannot send' : 'Preview only'}</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  {data.blockers.map(b => <li key={b}>{b}</li>)}
                </ul>
              </div>
            )}

            <div style={sectionLabel}>1. What's happening?</div>
            <div style={grid}>
              {data.types.map(t => {
                const on = t.key === type;
                return (
                  <button key={t.key} onClick={() => chooseType(t.key)} style={{
                    ...typeBtn,
                    borderColor: on ? '#1e3a5f' : '#d1d5db',
                    background: on ? '#1e3a5f' : '#fff',
                    color: on ? '#fff' : '#1e3a5f',
                  }}>
                    {t.label}
                    {t.key === data.suggested && <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 500, opacity: 0.8 }}>suggested</span>}
                  </button>
                );
              })}
            </div>

            {noteCfg && (
              <>
                <div style={sectionLabel}>2. {noteCfg.label}</div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={noteCfg.placeholder}
                  rows={2}
                  disabled={edited}
                  style={input}
                />
              </>
            )}

            {photos.length > 0 && (
              <>
                <div style={sectionLabel}>{noteCfg ? '3' : '2'}. Share photos on the customer's status page (optional)</div>
                <div style={photoGrid}>
                  {photos.map(ph => {
                    const on = picked.includes(ph.id);
                    const tok = authToken();
                    return (
                      <button key={ph.id} onClick={() => togglePhoto(ph.id)} title={ph.label || ph.filename || ''} style={{
                        padding: 0, border: `3px solid ${on ? '#5FD584' : 'transparent'}`, borderRadius: 8, background: 'none', cursor: 'pointer', position: 'relative',
                      }}>
                        <img src={`${API_BASE}/records/${recordId}/photos/${ph.id}/thumbnail${tok ? `?token=${tok}` : ''}`} alt={ph.label || 'Work order photo'}
                          style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 5, display: 'block' }} />
                        {on && <span style={checkMark}>&#10003;</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between' }}>
              <span>The text {edited ? '(edited)' : ''}</span>
              {edited && (
                <button onClick={() => setEdited(false)} style={linkBtn}>Reset to template</button>
              )}
            </div>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setEdited(true); }}
              rows={4}
              style={input}
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
              Customer sees: <em>{finalText}</em>
              <div style={{ marginTop: 2 }}>{finalText.length} characters{finalText.length > 160 ? ` (arrives as ${Math.ceil(finalText.length / 153)} texts)` : ''}. The link opens their job status page.</div>
            </div>

            {error && <div style={errBox}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={send} disabled={!canSend} style={{ ...sendBtn, opacity: canSend ? 1 : 0.5, cursor: canSend ? 'pointer' : 'not-allowed' }}>
                {sending ? 'Sending...' : 'Send Text'}
              </button>
              <button onClick={onClose} style={cancelBtn}>Cancel</button>
            </div>
            {noteMissing && <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: 6 }}>Add a reason or new date before sending.</div>}

            {data.history && data.history.length > 0 && (
              <>
                <div style={sectionLabel}>Already sent on this work order</div>
                <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  {data.history.map(h => (
                    <div key={h.id} style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong style={{ color: '#1e3a5f' }}>{labelFor(h.update_type)}</strong>
                        <span style={{ color: h.delivery_status === 'sent' ? '#6b7280' : '#dc2626' }}>
                          {h.delivery_status === 'sent' ? formatDateTime(h.created_at) : `FAILED ${formatDateTime(h.created_at)}`}
                        </span>
                      </div>
                      <div style={{ color: '#6b7280' }}>
                        {h.sent_by_name ? `${h.sent_by_name}` : ''}{h.photo_ids && h.photo_ids.length ? ` · ${h.photo_ids.length} photo${h.photo_ids.length > 1 ? 's' : ''}` : ''}{h.error ? ` · ${h.error}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: 12, fontSize: '0.8rem' }}>
              <a href={data.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f' }}>Open the customer's status page</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 1000, overflowY: 'auto', padding: '24px 8px' };
const panel = { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 560, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const closeBtn = { background: 'none', border: 'none', fontSize: '1.6rem', lineHeight: 1, cursor: 'pointer', color: '#6b7280' };
const sectionLabel = { fontSize: '0.8rem', fontWeight: 700, color: '#374151', margin: '16px 0 8px', textTransform: 'none' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 };
const typeBtn = { padding: '12px 10px', border: '2px solid', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center', minHeight: 52 };
const input = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
const photoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 6 };
const checkMark = { position: 'absolute', top: 4, right: 4, background: '#5FD584', color: '#1e3a5f', borderRadius: '50%', width: 20, height: 20, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const warnBox = { background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', borderRadius: 8, padding: '10px 12px', fontSize: '0.85rem' };
const errBox = { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '10px 12px', fontSize: '0.85rem', marginTop: 12 };
const sendBtn = { flex: 1, padding: '14px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem' };
const cancelBtn = { padding: '14px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem' };
const linkBtn = { background: 'none', border: 'none', color: '#1e3a5f', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', padding: 0 };
