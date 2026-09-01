import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

// ---------------------------------------------------------------------------
// ImagePicker — one modal, three ways in:
//   Library      images already approved for marketing use
//   Work Orders  photos off a real job, copied into the library when picked
//   Upload       a file from this computer
//
// Always returns a marketing_images row (with public_url), never a raw work
// order photo. Picking a work order photo copies it, so customer photos never
// become public by accident and a deleted photo never breaks a sent email.
// ---------------------------------------------------------------------------

export default function ImagePicker({ open, onClose, onSelect, title = 'Choose a picture' }) {
  const [tab, setTab] = useState('library');
  const [library, setLibrary] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadLibrary = useCallback(() => {
    api.getMarketingImages().then(setLibrary).catch(err => setError(err.message));
  }, []);

  const loadPhotos = useCallback((search) => {
    setBusy(true);
    api.searchRecordPhotos(search).then(setPhotos).catch(err => setError(err.message)).finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    setError('');
    loadLibrary();
  }, [open, loadLibrary]);

  useEffect(() => {
    if (open && tab === 'workorders' && photos.length === 0) loadPhotos('');
  }, [open, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const pickFromWorkOrder = async (p) => {
    setBusy(true); setError('');
    try {
      const img = await api.addMarketingImageFromPhoto({
        record_id: p.record_id,
        photo_id: p.id,
        title: p.label || `WO ${p.record_number}`,
        alt_text: [p.year, p.make, p.model].filter(Boolean).join(' ') || null,
      });
      onSelect(img);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBusy(true); setError('');
    try {
      const saved = await api.uploadMarketingImages(files);
      loadLibrary();
      if (saved.length === 1) { onSelect(saved[0]); onClose(); }
      else { setTab('library'); }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); e.target.value = ''; }
  };

  const customerName = (p) => p.company_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || '';

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>{title}</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '12px' }}>
          {[['library', 'Library'], ['workorders', 'Work Order Photos'], ['upload', 'Upload']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={tabBtn(tab === key)}>{label}</button>
          ))}
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {tab === 'library' && (
          <div>
            {library.length === 0 && <p style={emptyText}>Nothing in the library yet. Pull a photo off a work order or upload one.</p>}
            <div style={grid}>
              {library.map(img => (
                <div key={img.id} style={card} onClick={() => { onSelect(img); onClose(); }}>
                  <img src={img.thumb_url} alt={img.alt_text || img.title || ''} style={thumb} />
                  <div style={cardLabel}>{img.title || img.filename}</div>
                  {img.record_number && <div style={cardSub}>WO {img.record_number}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'workorders' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadPhotos(q); }}
                placeholder="Work order number, customer, or make/model"
                style={input}
              />
              <button onClick={() => loadPhotos(q)} style={btnSecondary}>Search</button>
            </div>
            {busy && <p style={emptyText}>Working...</p>}
            {!busy && photos.length === 0 && <p style={emptyText}>No photos found. The 60 most recent show by default.</p>}
            <div style={grid}>
              {photos.map(p => (
                <div key={p.id} style={card} onClick={() => pickFromWorkOrder(p)}>
                  <img src={api.recordPhotoThumbUrl(p.record_id, p.id)} alt={p.label || ''} style={thumb} />
                  <div style={cardLabel}>WO {p.record_number}</div>
                  <div style={cardSub}>{customerName(p)}</div>
                  <div style={cardSub}>{[p.year, p.make, p.model].filter(Boolean).join(' ')}</div>
                </div>
              ))}
            </div>
            <p style={{ ...emptyText, marginTop: '12px', fontSize: '0.75rem' }}>
              Picking a photo copies it into the marketing library. The customer's original stays private.
            </p>
          </div>
        )}

        {tab === 'upload' && (
          <div style={{ padding: '24px 0' }}>
            <label style={uploadBox}>
              <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>+</div>
              <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{busy ? 'Uploading...' : 'Choose image files'}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>JPG or PNG, up to 25MB each. Resized to email width automatically.</div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modal = { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', width: '100%', maxWidth: '760px', maxHeight: '85vh', overflowY: 'auto' };
const closeBtn = { background: 'none', border: 'none', fontSize: '1.6rem', lineHeight: 1, cursor: 'pointer', color: '#9ca3af' };
const tabBtn = (active) => ({ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: active ? '#1e3a5f' : '#9ca3af', borderBottom: active ? '2px solid #1e3a5f' : '2px solid transparent' });
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' };
const card = { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#fff' };
const thumb = { width: '100%', height: '100px', objectFit: 'cover', display: 'block', backgroundColor: '#f3f4f6' };
const cardLabel = { padding: '6px 8px 0', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a5f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const cardSub = { padding: '0 8px 6px', fontSize: '0.7rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const input = { flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' };
const btnSecondary = { padding: '8px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 };
const errorBox = { padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' };
const emptyText = { color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '12px' };
const uploadBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' };
