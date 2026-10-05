import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

// Notification center. Everything that needs a person: bounced customer
// email, failed texts, STOP replies, autopay declines, estimate approvals,
// reschedule and cancel requests, new leads. A notification stays open until
// someone marks it handled. That is the whole point: Gmail is not a to-do list.

const TYPE_COLORS = {
  email_bounce:       { bg: '#fef3c7', fg: '#92400e' },
  sms_failed:         { bg: '#fef3c7', fg: '#92400e' },
  sms_opt_out:        { bg: '#e5e7eb', fg: '#374151' },
  autopay_declined:   { bg: '#fee2e2', fg: '#991b1b' },
  estimate_approved:  { bg: '#d1fae5', fg: '#065f46' },
  reschedule_request: { bg: '#dbeafe', fg: '#1e40af' },
  cancel_request:     { bg: '#fee2e2', fg: '#991b1b' },
  new_lead:           { bg: '#ede9fe', fg: '#5b21b6' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric' });
}

function fullTime(iso) {
  return iso ? new Date(iso).toLocaleString('en-US', { timeZone: 'America/Denver', dateStyle: 'medium', timeStyle: 'short' }) : '';
}

export default function Notifications() {
  const [status, setStatus] = useState('open');
  const [type, setType] = useState('');
  const [data, setData] = useState({ notifications: [], open_by_type: {}, types: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const d = await api.getNotifications(status, type);
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => { setLoading(true); load(); }, [load]);
  // Keep it fresh while it is open on the office screen.
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const tellBell = () => window.dispatchEvent(new Event('notifications-changed'));

  const markHandled = async (id) => {
    setBusy(id);
    try {
      await api.markNotificationHandled(id);
      setData(d => ({ ...d, notifications: d.notifications.filter(n => n.id !== id) }));
      tellBell();
      load();
    } catch (e) { setError(e.message); }
    setBusy(null);
  };

  const reopen = async (id) => {
    setBusy(id);
    try {
      await api.reopenNotification(id);
      setData(d => ({ ...d, notifications: d.notifications.filter(n => n.id !== id) }));
      tellBell();
    } catch (e) { setError(e.message); }
    setBusy(null);
  };

  const handleAll = async () => {
    const label = type ? (data.types[type] || type) : 'every';
    if (!window.confirm(`Mark ${type ? `all "${label}"` : 'every open'} notification handled?`)) return;
    try {
      await api.handleAllNotifications(type);
      tellBell();
      load();
    } catch (e) { setError(e.message); }
  };

  const openTotal = Object.values(data.open_by_type || {}).reduce((a, b) => a + b, 0);
  const typeKeys = Object.keys(data.types || {});

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e3a5f' }}>Notifications</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStatus('open')} style={status === 'open' ? tabOn : tabOff}>
            Open{openTotal ? ` (${openTotal})` : ''}
          </button>
          <button onClick={() => setStatus('handled')} style={status === 'handled' ? tabOn : tabOff}>Handled</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <button onClick={() => setType('')} style={type === '' ? chipOn : chipOff}>All</button>
        {typeKeys.map(k => (
          <button key={k} onClick={() => setType(k)} style={type === k ? chipOn : chipOff}>
            {data.types[k]}{status === 'open' && data.open_by_type[k] ? ` (${data.open_by_type[k]})` : ''}
          </button>
        ))}
        {status === 'open' && data.notifications.length > 1 && (
          <button onClick={handleAll} style={{ ...chipOff, marginLeft: 'auto', color: '#6b7280' }}>
            Mark all {type ? 'shown ' : ''}handled
          </button>
        )}
      </div>

      {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
      ) : data.notifications.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: 8 }}>
          {status === 'open' ? 'Nothing open. Inbox zero, the ERP edition.' : 'Nothing handled yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.notifications.map(n => {
            const c = TYPE_COLORS[n.type] || { bg: '#e5e7eb', fg: '#374151' };
            return (
              <div key={n.id} style={{
                background: '#fff', borderRadius: 8, padding: '14px 16px',
                borderLeft: `4px solid ${n.severity === 'urgent' && status === 'open' ? '#dc2626' : '#cbd5e1'}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ background: c.bg, color: c.fg, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {n.type_label}
                    </span>
                    {n.occurrences > 1 && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{n.occurrences}x</span>
                    )}
                    <span title={fullTime(n.last_at)} style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{timeAgo(n.last_at)}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 4, wordBreak: 'break-word' }}>
                    {n.link ? <Link to={n.link} style={{ color: '#1e3a5f', textDecoration: 'none' }}>{n.title}</Link> : n.title}
                  </div>
                  {n.body && (
                    <div style={{ fontSize: '0.875rem', color: '#4b5563', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.body}</div>
                  )}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: '0.8rem' }}>
                    {n.customer_id && n.customer_name && (
                      <Link to={`/customers/${n.customer_id}`} style={linkSm}>{n.customer_name}</Link>
                    )}
                    {n.record_id && n.record_number && (
                      <Link to={`/records/${n.record_id}`} style={linkSm}>WO #{n.record_number}</Link>
                    )}
                    {status === 'handled' && (
                      <span style={{ color: '#9ca3af' }}>Handled {timeAgo(n.handled_at)}{n.handled_by_name ? ` by ${n.handled_by_name}` : ''}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {n.link && <Link to={n.link} style={btnGhost}>Open</Link>}
                  {status === 'open' ? (
                    <button disabled={busy === n.id} onClick={() => markHandled(n.id)} style={btnPrimary}>
                      {busy === n.id ? '...' : 'Mark handled'}
                    </button>
                  ) : (
                    <button disabled={busy === n.id} onClick={() => reopen(n.id)} style={btnGhost}>Reopen</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const tabBase = { padding: '6px 14px', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: '1px solid #1e3a5f' };
const tabOn = { ...tabBase, background: '#1e3a5f', color: '#fff' };
const tabOff = { ...tabBase, background: '#fff', color: '#1e3a5f' };
const chipBase = { padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #d1d5db' };
const chipOn = { ...chipBase, background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' };
const chipOff = { ...chipBase, background: '#fff', color: '#374151' };
const btnPrimary = { padding: '8px 14px', background: '#5FD584', color: '#1e3a5f', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' };
const btnGhost = { padding: '8px 12px', background: '#fff', color: '#1e3a5f', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' };
const linkSm = { color: '#2563eb', textDecoration: 'none' };
