import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function ReviewRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getReviewRequests()
      .then((d) => setRows(d.requests || []))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  const [savingId, setSavingId] = useState(null);
  const excludeCustomer = async (custId, label) => {
    if (!custId) return;
    if (!window.confirm(`Stop all future review requests to ${label}?`)) return;
    setSavingId(custId);
    try {
      await api.updateCustomer(custId, { review_opt_out: true });
      setRows((rs) => rs.map((x) => (x.customer_id === custId ? { ...x, review_opt_out: true } : x)));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSavingId(null);
    }
  };

  const name = (r) => [r.first_name, r.last_name].filter(Boolean).join(' ') || '(unknown)';
  const filtered = q.trim()
    ? rows.filter((r) => `${name(r)} ${r.email_primary || ''} ${r.phone_primary || ''} ${r.record_number || ''}`.toLowerCase().includes(q.toLowerCase()))
    : rows;

  const channelBadge = (ch) => {
    const map = {
      email: { bg: '#dbeafe', fg: '#1e40af', label: 'Email' },
      sms: { bg: '#dcfce7', fg: '#166534', label: 'Text' },
      skipped: { bg: '#f3f4f6', fg: '#6b7280', label: 'Skipped' },
    };
    const s = map[ch] || { bg: '#f3f4f6', fg: '#374151', label: ch };
    return <span style={{ background: s.bg, color: s.fg, padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Review Requests</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Every review request the system has sent after a completed job. One request per customer, no repeats.
        To stop future requests to someone, open their customer profile and turn on "Do not send review requests."
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, phone, invoice #..."
        style={{ padding: 8, width: 320, maxWidth: '100%', border: '1px solid #ccc', borderRadius: 6, marginBottom: 12 }}
      />
      {error && <div style={{ background: '#fee', color: '#900', padding: 12, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      {loading ? <p>Loading...</p> : (
        <>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{filtered.length} request{filtered.length === 1 ? '' : 's'}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: '#fff', textAlign: 'left' }}>
                <th style={th}>Date</th>
                <th style={th}>Customer</th>
                <th style={th}>Channel</th>
                <th style={th}>Sent To</th>
                <th style={th}>Invoice</th>
                <th style={th}>Future Requests</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{formatDate(r.created_at)}</td>
                  <td style={td}>
                    {r.customer_id ? <Link to={`/customers/${r.customer_id}`}>{name(r)}</Link> : name(r)}
                    {r.review_opt_out && <span style={{ marginLeft: 6, color: '#dc2626', fontSize: '0.72rem', fontWeight: 600 }}>OPTED OUT</span>}
                  </td>
                  <td style={td}>{channelBadge(r.channel)}</td>
                  <td style={td}>{r.channel === 'sms' ? (r.phone_primary || '') : (r.email_primary || '')}</td>
                  <td style={td}>{r.record_number ? (r.record_id ? <Link to={`/records/${r.record_id}`}>#{r.record_number}</Link> : `#${r.record_number}`) : ''}</td>
                  <td style={td}>
                    {r.review_opt_out ? (
                      <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>Excluded</span>
                    ) : (
                      <button
                        onClick={() => excludeCustomer(r.customer_id, name(r))}
                        disabled={savingId === r.customer_id}
                        style={{ padding: '3px 10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {savingId === r.customer_id ? 'Saving…' : 'Exclude'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#999', padding: 24 }}>No review requests found.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontWeight: 600 };
const td = { padding: '7px 12px' };
