import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCampaigns().then(setCampaigns).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const colors = {
      draft: { bg: '#f3f4f6', color: '#374151' },
      sending: { bg: '#fef3c7', color: '#92400e' },
      sent: { bg: '#d1fae5', color: '#065f46' },
      cancelled: { bg: '#fee2e2', color: '#991b1b' },
    };
    const c = colors[status] || colors.draft;
    return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: c.bg, color: c.color, textTransform: 'uppercase' }}>{status}</span>;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draft campaign?')) return;
    try {
      await api.deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Email Campaigns</h1>
        <button onClick={() => navigate('/marketing/new')} style={btnPrimary}>+ New Campaign</button>
      </div>

      <div style={{ padding: '10px 16px', backgroundColor: '#eff6ff', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: '#1e40af' }}>
        Resend free plan: 100 emails/day. Large campaigns send automatically at 100/day until complete.
      </div>

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Template</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Recipients</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Sent</th>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No campaigns yet</td></tr>
            )}
            {campaigns.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{c.name}</span></td>
                <td style={tdStyle}>{c.template_type === 'service_reminder' ? 'Service Reminder' : 'Seasonal'}</td>
                <td style={tdStyle}>
                  {statusBadge(c.status)}
                  {c.status === 'sending' && <span style={{ fontSize: '0.75rem', color: '#92400e', marginLeft: '6px' }}>{c.sent_count} of {c.recipient_count}</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{c.recipient_count || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{c.sent_count || '—'}</td>
                <td style={tdStyle}>{formatDate(c.sent_at || c.created_at)}</td>
                <td style={tdStyle}>
                  <button onClick={() => navigate(`/marketing/${c.id}`)} style={btnSmall}>
                    {c.status === 'draft' ? 'Edit' : 'View'}
                  </button>
                  {c.status === 'draft' && (
                    <button onClick={() => handleDelete(c.id)} style={{ ...btnSmall, color: '#dc2626', marginLeft: '4px' }}>Del</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSmall = { padding: '3px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '10px 12px', fontSize: '0.875rem' };
