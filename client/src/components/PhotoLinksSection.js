import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CATEGORIES = [
  { value: 'before', label: 'Before', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'during', label: 'During', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'after', label: 'After', color: '#10b981', bg: '#d1fae5' },
  { value: 'damage', label: 'Damage', color: '#dc2626', bg: '#fee2e2' },
  { value: 'upload', label: 'Upload', color: '#8b5cf6', bg: '#ede9fe' },
  { value: 'other', label: 'Other', color: '#6b7280', bg: '#f3f4f6' },
];

const catMap = {};
CATEGORIES.forEach(c => { catMap[c.value] = c; });

export default function PhotoLinksSection({ recordId, isEditable }) {
  const [photos, setPhotos] = useState([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ category: 'before', label: '', onedrive_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null); // photo ID to view full-size
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const fileInputRef = useRef(null);

  const fetchPhotos = async () => {
    try {
      const data = await api.getRecordPhotos(recordId);
      setPhotos(data);
    } catch { setPhotos([]); }
  };

  useEffect(() => { fetchPhotos(); }, [recordId]); // eslint-disable-line

  // Upload files from phone/browser
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const totalMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
    setUploadProgress(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''} (${totalMB.toFixed(1)} MB)...`);
    setError('');

    try {
      const result = await api.uploadRecordPhotos(recordId, files);
      setUploadProgress(`${result.uploaded} photo${result.uploaded > 1 ? 's' : ''} uploaded!`);
      fetchPhotos();
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(`Upload error: ${err.message || err.toString()}`);
      setUploadProgress('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add OneDrive link (legacy)
  const handleAddLink = async () => {
    if (!linkForm.onedrive_url) { setError('URL is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.addRecordPhoto(recordId, linkForm);
      setLinkForm({ category: 'before', label: '', onedrive_url: '' });
      setShowLinkForm(false);
      fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.deleteRecordPhoto(recordId, photoId);
      if (viewPhoto === photoId) setViewPhoto(null);
      fetchPhotos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Email photos to customer
  const handleEmailPhotos = async () => {
    const uploadedPhotos = photos.filter(p => p.photo_data !== undefined || p.file_size > 0);
    if (uploadedPhotos.length === 0) {
      setError('No uploaded photos to email. Upload photos first.');
      return;
    }
    setEmailSending(true);
    setError('');
    setEmailSuccess('');
    try {
      const result = await api.emailRecordPhotos(recordId, {
        message: emailMessage || undefined,
      });
      setEmailSuccess(`${result.photo_count} photo${result.photo_count > 1 ? 's' : ''} sent to ${result.sent_to}`);
      setShowEmailForm(false);
      setEmailMessage('');
      setTimeout(() => setEmailSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailSending(false);
    }
  };

  const truncateUrl = (url) => {
    if (!url) return '';
    if (url.length <= 50) return url;
    return url.substring(0, 47) + '...';
  };

  // Split photos into uploaded (have binary data) and linked (OneDrive)
  const uploadedPhotos = photos.filter(p => p.filename && p.file_size > 0);
  const linkedPhotos = photos.filter(p => p.onedrive_url && (!p.filename || !p.file_size));

  const isExpanded = expanded !== null ? expanded : photos.length > 0;

  const getAuthToken = () => {
    try { return localStorage.getItem('erp_token'); } catch { return null; }
  };

  const thumbnailUrl = (photo) => {
    const token = getAuthToken();
    return `${API_BASE}/records/${recordId}/photos/${photo.id}/thumbnail${token ? `?token=${token}` : ''}`;
  };

  const fullImageUrl = (photo) => {
    const token = getAuthToken();
    return `${API_BASE}/records/${recordId}/photos/${photo.id}/image${token ? `?token=${token}` : ''}`;
  };

  // Force a Save-As dialog and a real .jpg download. Used to bypass the
  // Outlook bug where inline images saved out of an emailed WO get renamed
  // to "pdfx". Same endpoint, just with download=1.
  const downloadUrl = (photo) => {
    const token = getAuthToken();
    const q = `download=1${token ? `&token=${token}` : ''}`;
    return `${API_BASE}/records/${recordId}/photos/${photo.id}/image?${q}`;
  };

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(!isExpanded)}>
        <h2 style={{ ...sectionTitle, marginBottom: isExpanded ? undefined : 0 }}>
          <span style={{ fontSize: '0.7rem', marginRight: '6px' }}>{isExpanded ? '▼' : '▶'}</span>
          Photos
          {!isExpanded && photos.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400, marginLeft: '12px' }}>({photos.length})</span>
          )}
        </h2>
      </div>

      {!isExpanded ? null : (<>
        {error && <div style={errorStyle}>{error}</div>}
        {uploadProgress && <div style={successStyle}>{uploadProgress}</div>}
        {emailSuccess && <div style={successStyle}>{emailSuccess}</div>}

        {/* Upload buttons */}
        {isEditable && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* Hidden file input — accepts images, allows camera on mobile */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {uploading ? 'Uploading...' : '📷 Upload Photos'}
            </button>
            {uploadedPhotos.length > 0 && (
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                disabled={emailSending}
                style={{ ...btnGreen, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {emailSending ? 'Sending...' : '✉️ Email to Customer'}
              </button>
            )}
            {photos.length > 0 && (
              <a
                href={`${API_BASE}/records/${recordId}/photos/download-all${getAuthToken() ? `?token=${getAuthToken()}` : ''}`}
                style={{ ...btnSmallGray, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                title="Download every photo as a single .zip — drag the contents into OneDrive or upload to an insurance portal"
              >
                ⬇ Download All (.zip)
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowLinkForm(!showLinkForm); }}
              style={btnSmallGray}
            >
              + Link (OneDrive)
            </button>
          </div>
        )}

        {/* Email form */}
        {showEmailForm && (
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Message to customer (optional):
            </label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="e.g., Here are photos of the damage we found during inspection..."
              rows={3}
              style={{ ...inputStyle, width: '100%', resize: 'vertical', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleEmailPhotos} disabled={emailSending} style={btnGreen}>
                {emailSending ? 'Sending...' : `Send ${uploadedPhotos.length} Photo${uploadedPhotos.length > 1 ? 's' : ''}`}
              </button>
              <button onClick={() => { setShowEmailForm(false); setEmailMessage(''); }} style={btnSmallGray}>Cancel</button>
            </div>
          </div>
        )}

        {/* OneDrive link form (legacy) */}
        {showLinkForm && (
          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <select value={linkForm.category} onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })} style={{ ...inputStyle, width: '130px' }}>
                {CATEGORIES.filter(c => c.value !== 'upload').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input value={linkForm.label} onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })} placeholder="Description (optional)" style={{ ...inputStyle, flex: 1 }} autoComplete="off" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={linkForm.onedrive_url} onChange={(e) => setLinkForm({ ...linkForm, onedrive_url: e.target.value })} placeholder="Paste OneDrive sharing link..." style={{ ...inputStyle, flex: 1 }} autoComplete="off" />
              <button onClick={handleAddLink} disabled={saving} style={btnSmallPrimary}>{saving ? '...' : 'Save'}</button>
              <button onClick={() => { setShowLinkForm(false); setError(''); }} style={btnSmallGray}>Cancel</button>
            </div>
          </div>
        )}

        {/* Uploaded photos — thumbnail grid */}
        {uploadedPhotos.length > 0 && (
          <div style={{ marginBottom: linkedPhotos.length > 0 ? '16px' : '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {uploadedPhotos.map(p => {
                const cat = catMap[p.category] || catMap.upload;
                return (
                  <div key={p.id} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <img
                      src={thumbnailUrl(p)}
                      alt={p.label || p.filename}
                      onClick={() => setViewPhoto(viewPhoto === p.id ? null : p.id)}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer', display: 'block' }}
                      loading="lazy"
                    />
                    <div style={{ padding: '4px 6px', fontSize: '0.7rem' }}>
                      <span style={{ padding: '1px 4px', borderRadius: '3px', backgroundColor: cat.bg, color: cat.color, fontWeight: 600, fontSize: '0.6rem' }}>{cat.label}</span>
                      <div style={{ color: '#6b7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.label || p.filename}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{p.file_size ? `${(p.file_size / 1024).toFixed(0)} KB` : ''}</span>
                        <a href={downloadUrl(p)} download={p.filename || 'photo.jpg'}
                           onClick={(e) => e.stopPropagation()}
                           style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                          &darr; Save .jpg
                        </a>
                      </div>
                    </div>
                    {isEditable && (
                      <button onClick={() => handleDelete(p.id)} style={{ position: 'absolute', top: '4px', right: '4px', padding: '2px 5px', backgroundColor: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.65rem', lineHeight: 1 }}>&times;</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full-size photo viewer */}
        {viewPhoto && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img
                src={fullImageUrl({ id: viewPhoto })}
                alt="Full size"
                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
              />
              <button
                onClick={() => setViewPhoto(null)}
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Linked photos (OneDrive) */}
        {linkedPhotos.length > 0 && (
          <div>
            {uploadedPhotos.length > 0 && (
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px', marginTop: '8px' }}>OneDrive Links</div>
            )}
            {linkedPhotos.map(p => {
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
        )}

        {/* Empty state */}
        {photos.length === 0 && !showLinkForm && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '0.85rem' }}>
            No photos yet — tap "Upload Photos" to add images from your phone or camera
          </div>
        )}
      </>)}
    </div>
  );
}

const sectionStyle = { marginBottom: '24px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', boxSizing: 'border-box' };
const errorStyle = { color: '#dc2626', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.8rem' };
const successStyle = { color: '#065f46', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#d1fae5', borderRadius: '4px', fontSize: '0.8rem' };
const btnPrimary = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnGreen = { padding: '8px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const btnSmallPrimary = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnSmallGray = { padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const btnTinyDanger = { padding: '2px 6px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' };
