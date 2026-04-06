import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [qbStatus, setQbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [calStatus, setCalStatus] = useState(null);
  const [calLoading, setCalLoading] = useState(true);

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
    const cal = searchParams.get('calendar');
    if (cal === 'connected') {
      setActionMsg({ type: 'success', text: 'Google Calendar connected successfully!' });
    } else if (cal === 'error') {
      setActionMsg({ type: 'error', text: `Google Calendar connection failed: ${searchParams.get('message') || 'Unknown error'}` });
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

  const fetchCalStatus = useCallback(async () => {
    setCalLoading(true);
    try {
      const status = await api.calGetStatus();
      setCalStatus(status);
    } catch {
      setCalStatus({ connected: false });
    } finally {
      setCalLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); fetchCalStatus(); }, [fetchStatus, fetchCalStatus]);

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

      {/* Google Calendar Integration */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Google Calendar</h2>

        {calLoading ? (
          <div style={{ color: '#9ca3af', padding: '20px' }}>Checking connection...</div>
        ) : calStatus?.connected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={connectedBadge}>Connected</span>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Calendar: {calStatus.calendarName || calStatus.calendarId || 'Primary'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px' }}>
              New appointments will automatically sync to Google Calendar.
            </p>
            <button onClick={async () => {
              if (!window.confirm('Disconnect Google Calendar? Existing synced events will remain.')) return;
              try {
                await api.calDisconnect();
                setCalStatus({ connected: false });
                setActionMsg({ type: 'success', text: 'Google Calendar disconnected' });
              } catch (err) { setActionMsg({ type: 'error', text: err.message }); }
            }} style={btnDanger}>Disconnect</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px' }}>
              Connect Google Calendar to automatically sync appointments.
            </p>
            <button onClick={async () => {
              try {
                const { url } = await api.calGetAuthUrl();
                window.location.href = url;
              } catch (err) { setActionMsg({ type: 'error', text: err.message }); }
            }} style={btnPrimary}>Connect Google Calendar</button>
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
      {/* Technician Wages — Admin Only */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Technician Wages</h2>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 12px', fontStyle: 'italic' }}>Admin only — not visible to technicians. Used for profitability reports.</p>
        {technicians.filter(t => t.is_active).map(tech => (
          <div key={tech.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{tech.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                defaultValue={tech.hourly_wage || ''}
                placeholder="0.00"
                onBlur={async (e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val)) return;
                  try {
                    await api.updateTechnician(tech.id, { hourly_wage: val });
                    setActionMsg({ type: 'success', text: `${tech.name} wage updated to $${val.toFixed(2)}/hr` });
                    setTimeout(() => setActionMsg(null), 3000);
                  } catch (err) { setActionMsg({ type: 'error', text: err.message }); }
                }}
                style={{ width: '80px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>/hr</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Reminders */}
      <PaymentRemindersSection onMessage={setActionMsg} />

      {/* Square Terminal Setup */}
      <SquareDevicesSection onMessage={setActionMsg} />
    </div>
  );
}

function PaymentRemindersSection({ onMessage }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReminderSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load reminder settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleToggle = async () => {
    if (!settings) return;
    setToggling(true);
    try {
      const newEnabled = settings.payment_reminders_enabled !== 'true';
      await api.updateReminderSettings({ enabled: newEnabled });
      onMessage({ type: 'success', text: `Payment reminders ${newEnabled ? 'enabled' : 'disabled'}` });
      setTimeout(() => onMessage(null), 3000);
      await fetchSettings();
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    } finally {
      setToggling(false);
    }
  };

  const isEnabled = settings && settings.payment_reminders_enabled === 'true';

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Payment Reminders</h2>
        {settings && (
          <span style={isEnabled ? connectedBadge : disconnectedBadge}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        )}
      </div>
      {loading ? (
        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Loading...</div>
      ) : settings ? (
        <>
          <button onClick={handleToggle} disabled={toggling} style={{ ...btnPrimary, marginBottom: '16px', backgroundColor: isEnabled ? '#dc2626' : '#059669' }}>
            {toggling ? 'Updating...' : (isEnabled ? 'Disable Reminders' : 'Enable Reminders')}
          </button>
          <div style={infoGrid}>
            <div>
              <span style={labelStyle}>Schedule</span>
              <div style={{ fontSize: '0.875rem' }}>Daily at 9:00 AM Mountain</div>
            </div>
            <div>
              <span style={labelStyle}>Interval</span>
              <div style={{ fontSize: '0.875rem' }}>Every 3 days per record</div>
            </div>
            <div>
              <span style={labelStyle}>Last Run</span>
              <div style={{ fontSize: '0.875rem' }}>
                {settings.payment_reminders_last_run
                  ? new Date(settings.payment_reminders_last_run).toLocaleString()
                  : 'Never'}
              </div>
            </div>
            <div>
              <span style={labelStyle}>Sent Last Run</span>
              <div style={{ fontSize: '0.875rem' }}>{settings.payment_reminders_last_run_count || '0'} reminders</div>
            </div>
            <div>
              <span style={labelStyle}>Pending Records</span>
              <div style={{ fontSize: '0.875rem' }}>{settings.pending_records || 0} records with balance due</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '12px', marginBottom: 0 }}>
            Automatic reminders are sent to customers with outstanding balances based on their communication preference (email, text, or both). Manual reminders can also be sent from individual record pages.
          </p>
        </>
      ) : null}
    </div>
  );
}

function SquareDevicesSection({ onMessage }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getSquareDevices();
      setDevices(data.devices || []);
      setFetched(true);
      if ((data.devices || []).length === 0) {
        onMessage({ type: 'error', text: 'No Square devices found. Make sure a Terminal device is paired in your Square Dashboard.' });
      }
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyDeviceId = (deviceId) => {
    navigator.clipboard.writeText(deviceId);
    setCopiedId(deviceId);
    onMessage({ type: 'success', text: `Device ID copied to clipboard` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitle}>Square Terminal Setup</h2>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
        Find your Terminal Device ID to enable card reader payments.
      </p>

      {!fetched && (
        <button onClick={fetchDevices} disabled={loading} style={btnListDevices}>
          {loading ? 'Loading...' : 'List Square Devices'}
        </button>
      )}

      {fetched && devices.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Device Name</th>
                <th style={thStyle}>Device ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Location ID</th>
                <th style={{ ...thStyle, width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{d.name}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}>{d.id}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                      backgroundColor: d.status === 'PAIRED' ? '#d1fae5' : '#fef3c7',
                      color: d.status === 'PAIRED' ? '#065f46' : '#92400e',
                    }}>{d.status}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}>{d.locationId}</td>
                  <td style={tdStyle}>
                    <button onClick={() => copyDeviceId(d.id)} style={copiedId === d.id ? btnCopied : btnCopy}>
                      {copiedId === d.id ? 'Copied!' : 'Copy ID'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={fetchDevices} disabled={loading} style={{ ...btnRefresh, marginTop: '12px' }}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      {fetched && devices.length === 0 && (
        <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e' }}>
          No devices found. Pair a Terminal device in your Square Dashboard first.
          <button onClick={fetchDevices} disabled={loading} style={{ ...btnRefresh, marginLeft: '12px' }}>
            {loading ? 'Refreshing...' : 'Try Again'}
          </button>
        </div>
      )}
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
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnDanger = {
  padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626',
  border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
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
const btnListDevices = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnCopy = {
  padding: '4px 10px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
};
const btnCopied = {
  padding: '4px 10px', backgroundColor: '#d1fae5', color: '#065f46',
  border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
};
const btnRefresh = {
  padding: '6px 14px', backgroundColor: '#fff', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
};
const thStyle = {
  padding: '8px 10px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb', letterSpacing: '0.05em',
};
const tdStyle = { padding: '8px 10px', fontSize: '0.85rem' };
