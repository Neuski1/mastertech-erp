import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const CATEGORIES = [
  { value: 'before', label: 'Before', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'during', label: 'During', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'after', label: 'After', color: '#10b981', bg: '#d1fae5' },
  { value: 'damage', label: 'Damage', color: '#dc2626', bg: '#fee2e2' },
  { value: 'other', label: 'Other', color: '#6b7280', bg: '#f3f4f6' },
];

const catMap = {};
CATEGORIES.forEach(c => { catMap[c.value] = c; });

export default function PhotoLinksSection({ recordId, isEditable }) {
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'before', label: '', onedrive_url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPhotos = async () => {
    try {
      const data = await api.getRecordPhotos(recordId);
      setPhotos(data);
    } catch { setPhotos([]); }
  };

  useEffect(() => { fetchPhotos(); }, [recordId]); // eslint-disable-line

  const handleAdd = async () => {
    if (!form.onedrive_url) { setError('URL is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.addRecordPhoto(recordId, form);
      setForm({ category: 'before', label: '', onedrive_url: '' });
      setShowForm(false);
      fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Remove this photo link?')) return;
    try {
      await api.deleteRecordPhoto(recordId, photoId);
      fetchPhotos();
    } catch (err) {
      alert(err.message);
    }
  };

  const truncateUrl = (url) => {
    if (!url) return '';
    if (url.length <= 50) return url;
    return url.substring(0, 47) + '...';
  };

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>Photos</h2>
        {isEditable && !showForm && (
          <button onClick={() => setShowForm(true)} style={btnSmallPrimary}>+ Add Photo Link</button>
        )}
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Add form */}
      {showForm && (
        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, width: '130px' }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Description (optional)" style={{ ...inputStyle, flex: 1 }} autoComplete="off" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={form.onedrive_url} onChange={(e) => setForm({ ...form, onedrive_url: e.target.value })} placeholder="Paste OneDrive sharing link..." style={{ ...inputStyle, flex: 1 }} autoComplete="off" />
            <button onClick={handleAdd} disabled={saving} style={btnSmallPrimary}>{saving ? '...' : 'Save'}</button>
            <button onClick={() => { setShowForm(false); setError(''); }} style={btnSmallGray}>Cancel</button>
          </div>
        </div>
      )}

      {/* Photo list */}
      {photos.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '0.85rem' }}>No photo links yet</div>
      )}
      {photos.map(p => {
        const cat = catMap[p.category] || catMap.other;
        return (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
            <span style={{ flex: 1, fontSize: '0.85rem', color: '#374151' }}>
              {p.label || truncateUrl(p.onedrive_url)}
            </span>
            <a href={p.onedrive_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Open &rarr;
            </a>
            {isEditable && (
              <button onClick={() => handleDelete(p.id)} style={btnTinyDanger}>&#128465;</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const sectionStyle = { marginBottom: '24px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' };
const errorStyle = { color: '#dc2626', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.8rem' };
const btnSmallPrimary = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnSmallGray = { padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const btnTinyDanger = { padding: '2px 6px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' };
