import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [qbStatus, setQbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Technician management state
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(true);
  const [newTechName, setNewTechName] = useState('');
  const [addingTech, setAddingTech] = useState(false);

  // Check for OAuth callback result in URL
  useEffect(() => {
    const qb = searchParams.get('qb');
    if (qb === 'connected') {
      setActionMsg({ type: 'success', text: 'QuickBooks connected successfully!' });
    } else if (qb === 'error') {
      setActionMsg({ type: 'error', text: `QuickBooks connection failed: ${searchParams.get('message') || 'Unknown error'}` });
    }
  }, [searchParams]);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const status = await api.qbGetStatus();
      setQbStatus(status);
    } catch (err) {
      setQbStatus({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleConnect = async () => {
    try {
      const { authUri } = await api.qbGetAuthUrl();
      window.location.href = authUri;
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect from QuickBooks? You can reconnect later.')) return;
    try {
      await api.qbDisconnect();
      setActionMsg({ type: 'success', text: 'QuickBooks disconnected' });
      await fetchStatus();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Fetch all technicians
  const fetchTechnicians = useCallback(async () => {
    setTechLoading(true);
    try {
      const data = await api.getAllTechnicians();
      setTechnicians(data);
    } catch (err) {
      // Silently handle — user may not be admin
    } finally {
      setTechLoading(false);
    }
  }, []);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const handleAddTechnician = async () => {
    if (!newTechName.trim()) return;
    setAddingTech(true);
    try {
      await api.createTechnician(newTechName.trim());
      setNewTechName('');
      setActionMsg({ type: 'success', text: `Technician "${newTechName.trim()}" added` });
      await fetchTechnicians();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setAddingTech(false);
    }
  };

  const handleToggleTechnician = async (tech) => {
    const newActive = !tech.is_active;
    const action = newActive ? 'reactivate' : 'deactivate';
    if (!window.confirm(`${newActive ? 'Reactivate' : 'Deactivate'} ${tech.name}?`)) return;
    try {
      await api.updateTechnician(tech.id, { is_active: newActive });
      setActionMsg({ type: 'success', text: `${tech.name} ${action}d` });
      await fetchTechnicians();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const formatExpiry = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ marginTop: 0, marginBottom: '24px' }}>Settings</h1>

      {actionMsg && (
        <div style={{
          padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.875rem',
          backgroundColor: actionMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: actionMsg.type === 'success' ? '#065f46' : '#dc2626',
          border: `1px solid ${actionMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {actionMsg.text}
        </div>
      )}

      {/* QuickBooks Integration */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>QuickBooks Online</h2>

        {loading ? (
          <div style={{ color: '#9ca3af', padding: '20px' }}>Checking connection...</div>
        ) : qbStatus?.connected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={connectedBadge}>Connected</span>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Company ID: {qbStatus.realmId}
              </span>
            </div>

            <div style={infoGrid}>
              <div>
                <label style={labelStyle}>Environment</label>
                <div style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{qbStatus.environment}</div>
              </div>
              <div>
                <label style={labelStyle}>Token Expires</label>
                <div style={{ fontSize: '0.875rem', color: qbStatus.isExpired ? '#dc2626' : '#111827' }}>
                  {qbStatus.isExpired ? 'EXPIRED — ' : ''}{formatExpiry(qbStatus.tokenExpiry)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button onClick={handleDisconnect} style={btnDangerOutline}>
                Disconnect QuickBooks
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={disconnectedBadge}>Not Connected</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '16px' }}>
              Connect to QuickBooks Online to automatically sync paid invoices and payments.
            </p>
            <button onClick={handleConnect} style={btnQB}>
              Connect to QuickBooks
            </button>
          </div>
        )}
      </div>

      {/* Technician Management */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Technicians</h2>

        {techLoading ? (
          <div style={{ color: '#9ca3af', padding: '20px' }}>Loading technicians...</div>
        ) : (
          <>
            {/* Technician list */}
            <div style={{ marginBottom: '16px' }}>
              {technicians.map(tech => (
                <div key={tech.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', marginBottom: '4px', borderRadius: '6px',
                  backgroundColor: tech.is_active ? '#fff' : '#f9fafb',
                  border: `1px solid ${tech.is_active ? '#e5e7eb' : '#e5e7eb'}`,
                  opacity: tech.is_active ? 1 : 0.55,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: tech.is_active ? '#22c55e' : '#d1d5db',
                      display: 'inline-block',
                    }} />
                    <span style={{
                      fontSize: '0.9rem', fontWeight: 500,
                      color: tech.is_active ? '#111827' : '#9ca3af',
                      textDecoration: tech.is_active ? 'none' : 'line-through',
                    }}>
                      {tech.name}
                    </span>
                    {!tech.is_active && (
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>inactive</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleTechnician(tech)}
                    style={tech.is_active ? btnDeactivate : btnReactivate}
                  >
                    {tech.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              ))}
              {technicians.length === 0 && (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No technicians found</p>
              )}
            </div>

            {/* Add technician form */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="New technician name"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTechnician()}
                style={techInputStyle}
              />
              <button onClick={handleAddTechnician} disabled={addingTech || !newTechName.trim()} style={{
                ...btnAddTech,
                opacity: (addingTech || !newTechName.trim()) ? 0.5 : 1,
                cursor: (addingTech || !newTechName.trim()) ? 'not-allowed' : 'pointer',
              }}>
                {addingTech ? 'Adding...' : 'Add Technician'}
              </button>
            </div>
          </>
        )}
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
  marginTop: 0, marginBottom: '16px', paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
};
const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em',
};
const infoGrid = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px',
};
const connectedBadge = {
  display: 'inline-block', padding: '4px 12px', backgroundColor: '#d1fae5',
  color: '#065f46', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
};
const disconnectedBadge = {
  display: 'inline-block', padding: '4px 12px', backgroundColor: '#fee2e2',
  color: '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
};
const btnQB = {
  padding: '10px 20px', backgroundColor: '#2ca01c', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnDangerOutline = {
  padding: '8px 16px', backgroundColor: '#fff', color: '#dc2626',
  border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
};
const btnDeactivate = {
  padding: '4px 12px', backgroundColor: '#fff', color: '#dc2626',
  border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
};
const btnReactivate = {
  padding: '4px 12px', backgroundColor: '#f0fdf4', color: '#065f46',
  border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
};
const techInputStyle = {
  flex: 1, padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem',
};
const btnAddTech = {
  padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
};
