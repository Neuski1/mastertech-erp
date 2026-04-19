import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const STAGES = [
  { key: 'new', label: 'New', color: '#6b7280', bg: '#f3f4f6' },
  { key: 'sent_email', label: 'Sent Email', color: '#2563eb', bg: '#eff6ff' },
  { key: 'left_vm', label: 'Left VM', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'no_response', label: 'No Response', color: '#d97706', bg: '#fffbeb' },
  { key: 'met_live', label: 'Met Live', color: '#0891b2', bg: '#ecfeff' },
  { key: 'agreed', label: 'Agreed to Partner', color: '#059669', bg: '#ecfdf5' },
  { key: 'not_interested', label: 'Not Interested', color: '#dc2626', bg: '#fef2f2' },
];

const STAGE_MAP = {};
STAGES.forEach(s => { STAGE_MAP[s.key] = s; });

const emptyPartner = {
  business_name: '', location: '', contact_phone: '', website: '',
  contact_name: '', email: '', date_contacted: '', status: 'new', notes: '',
};

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [funnelStats, setFunnelStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [view, setView] = useState('funnel'); // 'funnel' | 'table'
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [form, setForm] = useState({ ...emptyPartner });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const data = await api.getPartners(params);
      setPartners(data.partners);
      setFunnelStats(data.funnel_stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  useEffect(() => {
    if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 4000); return () => clearTimeout(t); }
  }, [actionMsg]);

  const openAdd = () => {
    setEditPartner(null);
    setForm({ ...emptyPartner });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditPartner(p);
    setForm({
      business_name: p.business_name || '',
      location: p.location || '',
      contact_phone: p.contact_phone || '',
      website: p.website || '',
      contact_name: p.contact_name || '',
      email: p.email || '',
      date_contacted: p.date_contacted ? p.date_contacted.split('T')[0] : '',
      status: p.status || 'new',
      notes: p.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.business_name.trim()) return alert('Business Name is required');
    setSaving(true);
    try {
      if (editPartner) {
        await api.updatePartner(editPartner.id, form);
        setActionMsg(`Updated ${form.business_name}`);
      } else {
        await api.createPartner(form);
        setActionMsg(`Added ${form.business_name}`);
      }
      setShowModal(false);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePartner(id);
      setActionMsg('Partner deleted');
      setConfirmDelete(null);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    }
  };

  const quickStatusChange = async (partner, newStatus) => {
    try {
      await api.updatePartner(partner.id, { status: newStatus });
      fetchPartners();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPartners = Object.values(funnelStats).reduce((a, b) => a + b, 0);

  // --- STYLES ---
  const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 };
  const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
  const btnSecondary = { padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 13 };
  const cardStyle = { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', marginBottom: 10, cursor: 'pointer', transition: 'box-shadow 0.2s' };
  const badgeStyle = (stage) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
    color: stage?.color || '#6b7280', backgroundColor: stage?.bg || '#f3f4f6',
  });
  const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalBox = { backgroundColor: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#374151' };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#1e3a5f' }}>Partners</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            {totalPartners} potential partner{totalPartners !== 1 ? 's' : ''} in pipeline
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Search partners..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: 220 }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: 160 }}>
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4, background: '#e5e7eb', borderRadius: 8, padding: 3 }}>
            <button onClick={() => setView('funnel')}
              style={{ ...btnSecondary, backgroundColor: view === 'funnel' ? '#fff' : 'transparent', boxShadow: view === 'funnel' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              Pipeline
            </button>
            <button onClick={() => setView('table')}
              style={{ ...btnSecondary, backgroundColor: view === 'table' ? '#fff' : 'transparent', boxShadow: view === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              Table
            </button>
          </div>
          <button onClick={openAdd} style={btnPrimary}>+ Add Partner</button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: 8, marginBottom: 16, fontWeight: 500, fontSize: 14 }}>
          {actionMsg}
        </div>
      )}

      {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading partners...</div>
      ) : view === 'funnel' ? (
        /* ============ FUNNEL / PIPELINE VIEW ============ */
        <>
          {/* Funnel Stats Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {STAGES.map(stage => {
              const count = funnelStats[stage.key] || 0;
              return (
                <div key={stage.key}
                  onClick={() => setFilterStatus(filterStatus === stage.key ? '' : stage.key)}
                  style={{
                    flex: '1 1 120px', background: filterStatus === stage.key ? stage.bg : '#fff',
                    border: `2px solid ${filterStatus === stage.key ? stage.color : '#e5e7eb'}`,
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s', minWidth: 110,
                  }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stage.color }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginTop: 2 }}>{stage.label}</div>
                </div>
              );
            })}
          </div>

          {/* Partner Cards */}
          {partners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No partners found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {partners.map(p => (
                <div key={p.id} style={cardStyle} onClick={() => openEdit(p)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.business_name}</div>
                    <span style={badgeStyle(STAGE_MAP[p.status])}>{STAGE_MAP[p.status]?.label || p.status}</span>
                  </div>
                  {p.location && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{p.location}</div>}
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#374151', marginBottom: 4, flexWrap: 'wrap' }}>
                    {p.contact_phone && <span>{p.contact_phone}</span>}
                    {p.contact_name && <span>{p.contact_name}</span>}
                  </div>
                  {p.email && <div style={{ fontSize: 13, color: '#2563eb', marginBottom: 4 }}>{p.email}</div>}
                  {p.website && <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.website}</div>}
                  {p.notes && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, fontStyle: 'italic', whiteSpace: 'pre-wrap', maxHeight: 40, overflow: 'hidden' }}>{p.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ============ TABLE VIEW ============ */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Business Name', 'Location', 'Phone', 'Contact', 'Email', 'Website', 'Status', 'Date Contacted', 'Notes', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No partners found</td></tr>
              ) : partners.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                  onClick={() => openEdit(p)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>{p.business_name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.location || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{p.contact_phone || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{p.contact_name || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#2563eb' }}>{p.email || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>{p.website || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={badgeStyle(STAGE_MAP[p.status])}>{STAGE_MAP[p.status]?.label || p.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {p.date_contacted ? new Date(p.date_contacted).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(p); }}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ ADD / EDIT MODAL ============ */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>{editPartner ? 'Edit Partner' : 'Add New Partner'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Business Name *</label>
                <input style={inputStyle} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle} value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="example.com" />
              </div>
              <div>
                <label style={labelStyle}>Date Contacted</label>
                <input style={inputStyle} type="date" value={form.date_contacted} onChange={e => setForm({ ...form, date_contacted: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            {/* Quick Status Buttons (edit mode only) */}
            {editPartner && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Quick Status Change</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STAGES.map(s => (
                    <button key={s.key}
                      onClick={() => { setForm({ ...form, status: s.key }); }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, color: s.color, backgroundColor: form.status === s.key ? s.bg : '#fff',
                        borderColor: form.status === s.key ? s.color : '#d1d5db',
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {editPartner && (
                  <button onClick={() => { setShowModal(false); setConfirmDelete(editPartner); }}
                    style={{ ...btnSecondary, color: '#dc2626' }}>Delete Partner</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : editPartner ? 'Save Changes' : 'Add Partner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {confirmDelete && (
        <div style={modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modalBox, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#9888;</div>
            <h3 style={{ margin: '0 0 8px', color: '#1e3a5f' }}>Delete Partner?</h3>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>
              Are you sure you want to delete <strong>{confirmDelete.business_name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnSecondary}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                style={{ ...btnPrimary, backgroundColor: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
