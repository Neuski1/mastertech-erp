import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

const TYPE_LABELS = { insurance: 'Insurance', warranty: 'Warranty', other: 'Other' };
const TYPE_COLORS = {
  insurance: { bg: '#dbeafe', fg: '#1e40af' },
  warranty: { bg: '#dcfce7', fg: '#166534' },
  other: { bg: '#f3f4f6', fg: '#374151' },
};

export default function RecordDocumentsSection({ recordId, isEditable }) {
  const [docs, setDocs] = useState([]);
  const [docType, setDocType] = useState('insurance');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    try { setDocs(await api.getRecordDocuments(recordId)); } catch { setDocs([]); }
  };
  useEffect(() => { fetchDocs(); }, [recordId]); // eslint-disable-line

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      await api.uploadRecordDocument(recordId, file, docType, file.name);
      await fetchDocs();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleView = async (doc) => {
    setBusyId(doc.id); setError('');
    try {
      const blob = await api.downloadRecordDocument(recordId, doc.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError('Could not open document');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      await api.deleteRecordDocument(recordId, doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round((b || 0) / 1024)) + ' KB');

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 16, marginBottom: 16 }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#1e3a5f' }}>Insurance &amp; Warranty Documents</h2>
      {isEditable && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem' }}>
            <option value="insurance">Insurance</option>
            <option value="warranty">Warranty</option>
            <option value="other">Other</option>
          </select>
          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={handleUpload} disabled={uploading} style={{ fontSize: '0.85rem' }} />
          {uploading && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Uploading…</span>}
        </div>
      )}
      {error && <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginBottom: 8 }}>{error}</div>}
      {docs.length === 0 ? (
        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No documents attached.</div>
      ) : (
        <div>
          {docs.map((d) => {
            const c = TYPE_COLORS[d.doc_type] || TYPE_COLORS.other;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: c.bg, color: c.fg, textTransform: 'uppercase' }}>
                  {TYPE_LABELS[d.doc_type] || 'Other'}
                </span>
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#374151', wordBreak: 'break-word' }}>{d.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{fmtSize(d.file_size)}</span>
                <button onClick={() => handleView(d)} disabled={busyId === d.id}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                  {busyId === d.id ? '…' : 'View'}
                </button>
                {isEditable && (
                  <button onClick={() => handleDelete(d)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
