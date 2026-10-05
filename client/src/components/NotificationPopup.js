import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

// Pop-up over the ERP that lists what is still open in the notification
// center. Carol, Oct 5 2026: leads and alerts live only in the ERP now, so
// they have to be impossible to miss when the ERP is opened.
//
// When it shows (decided in App.js):
//   - The first time a tab loads the ERP and anything is open.
//   - Whenever a new or repeated alert arrives (latest_at moved forward).
//   - Every 2 hours while anything URGENT is still open.
// "Remind me later" only hides it; nothing is marked handled except by the
// Mark handled button.

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

const SHOW_MAX = 6;

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function NotificationPopup({ onClose }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await api.getNotifications('open');
      const list = d.notifications || [];
      setItems(list);
      setTotal(list.length);
      if (!list.length) onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => { load(); }, [load]);

  // Escape closes it, same as Remind me later.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const markHandled = async (id) => {
    setBusy(id);
    try {
      await api.markNotificationHandled(id);
      window.dispatchEvent(new Event('notifications-changed'));
      const left = items.filter(n => n.id !== id);
      setItems(left);
      setTotal(t => t - 1);
      if (!left.length) onClose();
    } catch (e) { setError(e.message); }
    setBusy(null);
  };

  const go = (to) => { onClose(); navigate(to); };

  const urgent = items.filter(n => n.severity === 'urgent').length;
  const shown = items.slice(0, SHOW_MAX);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-popup-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'calc(70px + env(safe-area-inset-top, 0px)) 16px 16px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 10, width: '100%', maxWidth: 560,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        <div style={{
          background: urgent ? '#dc2626' : '#1e3a5f', color: '#fff', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div id="notif-popup-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              {loading ? 'Checking notifications...' : `${total} open notification${total === 1 ? '' : 's'}`}
            </div>
            {!loading && urgent > 0 && (
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{urgent} urgent</div>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', lineHeight: 1, cursor: 'pointer', padding: 4,
          }}>&times;</button>
        </div>

        {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {shown.map(n => {
            const c = TYPE_COLORS[n.type] || { bg: '#e5e7eb', fg: '#374151' };
            return (
              <div key={n.id} style={{
                padding: '12px 18px', borderBottom: '1px solid #f1f5f9',
                borderLeft: `4px solid ${n.severity === 'urgent' ? '#dc2626' : 'transparent'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ background: c.bg, color: c.fg, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {n.type_label || n.type}
                  </span>
                  {n.occurrences > 1 && <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{n.occurrences}x</span>}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{timeAgo(n.last_at)}</span>
                </div>
                <div style={{ fontWeight: 700, color: '#111827', wordBreak: 'break-word' }}>{n.title}</div>
                {n.body && (
                  <div style={{
                    fontSize: '0.85rem', color: '#4b5563', marginTop: 2, wordBreak: 'break-word',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{n.body}</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {n.link && <button onClick={() => go(n.link)} style={btnGhost}>Open</button>}
                  <button disabled={busy === n.id} onClick={() => markHandled(n.id)} style={btnPrimary}>
                    {busy === n.id ? '...' : 'Mark handled'}
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && total > SHOW_MAX && (
            <div style={{ padding: '10px 18px', fontSize: '0.85rem', color: '#6b7280' }}>
              Plus {total - SHOW_MAX} more.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '12px 18px', background: '#f8fafc', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={btnGhost}>Remind me later</button>
          <button onClick={() => go('/notifications')} style={{ ...btnPrimary, background: '#1e3a5f', color: '#fff' }}>See all notifications</button>
        </div>
      </div>
    </div>
  );
}

const btnPrimary = { padding: '7px 14px', background: '#5FD584', color: '#1e3a5f', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' };
const btnGhost = { padding: '7px 12px', background: '#fff', color: '#1e3a5f', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' };
