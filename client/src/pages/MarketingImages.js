import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import MarketingNav from '../components/MarketingNav';
import ImagePicker from '../components/ImagePicker';

// ---------------------------------------------------------------------------
// Marketing image library. Everything a campaign can use, in one place.
// Images here are served publicly by id so mail clients can load them, which
// is exactly why work order photos are copied in rather than linked.
// ---------------------------------------------------------------------------

export default function MarketingImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getMarketingImages()
      .then(setImages)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    try {
      await api.updateMarketingImage(editing.id, {
        title: editing.title, alt_text: editing.alt_text, tags: editing.tags,
      });
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  };

  const archive = async (img) => {
    if (!window.confirm(`Archive "${img.title || img.filename}"? Emails already sent keep working.`)) return;
    try { await api.archiveMarketingImage(img.id); load(); }
    catch (err) { setError(err.message); }
  };

  const copyUrl = (img) => {
    navigator.clipboard?.writeText(img.public_url);
    setCopied(img.id);
    setTimeout(() => setCopied(c => (c === img.id ? null : c)), 2000);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div>
      <MarketingNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e3a5f' }}>Marketing Images</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
            {images.length} in the library. Anything here can go in a campaign email.
          </p>
        </div>
        <button onClick={() => setPickerOpen(true)} style={btnPrimary}>+ Add Images</button>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {images.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', backgroundColor: '#fff', borderRadius: '8px' }}>
          Nothing here yet. Pull a before/after off a work order or upload a file.
        </div>
      )}

      <div style={grid}>
        {images.map(img => (
          <div key={img.id} style={card}>
            <img src={img.thumb_url} alt={img.alt_text || img.title || ''} style={thumb} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e3a5f' }}>{img.title || img.filename}</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                {img.source === 'record_photo' && img.record_number ? `From WO ${img.record_number}` : 'Uploaded'}
                {img.width ? ` · ${img.width}×${img.height}` : ''}
              </div>
              {img.alt_text && <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>{img.alt_text}</div>}
              <div style={{ display: 'flex', gap: '2px', marginTop: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setEditing({ ...img })} style={btnLinkSmall}>Edit</button>
                <button onClick={() => copyUrl(img)} style={btnLinkSmall}>{copied === img.id ? 'Copied' : 'Copy URL'}</button>
                <button onClick={() => archive(img)} style={{ ...btnLinkSmall, color: '#dc2626' }}>Archive</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImagePicker
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); load(); }}
        onSelect={() => { load(); }}
        title="Add to the marketing library"
      />

      {editing && (
        <div style={overlay} onClick={() => setEditing(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '1.1rem' }}>Edit image</h2>
            <img src={editing.thumb_url} alt="" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px' }} />
            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Title</label>
              <input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={input} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Alt text (what a screen reader reads, and what shows if images are blocked)</label>
              <input value={editing.alt_text || ''} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} style={input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Tags</label>
              <input value={editing.tags || ''} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="roof, before-after, winterize" style={input} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveEdit} style={btnPrimary}>Save</button>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' };
const card = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' };
const thumb = { width: '100%', height: '130px', objectFit: 'cover', display: 'block', backgroundColor: '#f3f4f6' };
const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modal = { backgroundColor: '#fff', borderRadius: '10px', padding: '22px', width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto' };
const label = { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' };
const btnPrimary = { padding: '9px 18px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 };
const btnSecondary = { padding: '9px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 };
const btnLinkSmall = { background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, padding: '0 4px' };
const errorBox = { padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' };
