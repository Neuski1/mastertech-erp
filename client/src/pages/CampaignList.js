import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCampaigns().then(setCampaigns).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadAudit = () => {
    if (audit) { setShowAudit(!showAudit); return; }
    api.getCampaignAudit().then(data => { setAudit(data); setShowAudit(true); }).catch(() => {});
  };

  const exportCsv = (rows, headers, filename) => {
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadAudit} style={btnSecondary}>{showAudit ? 'Hide Audit' : 'Audience Audit'}</button>
          <button onClick={() => navigate('/marketing/new')} style={btnPrimary}>+ New Campaign</button>
        </div>
      </div>


      {/* Audience Audit Panel */}
      {showAudit && audit && (
        <div style={{ marginBottom: '20px' }}>
          {/* No Email */}
          <details style={{ marginBottom: '8px' }}>
            <summary style={auditSummary}>
              <span style={{ color: '#92400e' }}>No Email on File ({audit.noEmailCount})</span>
            </summary>
            <div style={auditPanel}>
              <p style={auditHelper}>These customers cannot receive email campaigns. Add an email address to include them.</p>
              {audit.noEmailCount > 0 && <button onClick={() => exportCsv(audit.noEmail, ['name', 'phone'], `customers-no-email-${new Date().toISOString().split('T')[0]}.csv`)} style={btnExport}>Export CSV</button>}
              <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '8px' }}>
                <table style={auditTable}>
                  <thead><tr><th style={athStyle}>Name</th><th style={athStyle}>Phone</th><th style={athStyle}></th></tr></thead>
                  <tbody>
                    {audit.noEmail.map(c => (
                      <tr key={c.id}><td style={atdStyle}>{c.name}</td><td style={atdStyle}>{c.phone || '—'}</td><td style={atdStyle}><button onClick={() => navigate(`/customers/${c.id}`)} style={btnView}>View</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          {/* Bad Email */}
          <details style={{ marginBottom: '8px' }}>
            <summary style={auditSummary}>
              <span style={{ color: '#dc2626' }}>Bad Email on File ({audit.badEmailCount})</span>
            </summary>
            <div style={auditPanel}>
              <p style={auditHelper}>These email addresses bounced. Please verify and update them.</p>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={auditTable}>
                  <thead><tr><th style={athStyle}>Name</th><th style={athStyle}>Email</th><th style={athStyle}>Phone</th><th style={athStyle}></th></tr></thead>
                  <tbody>
                    {audit.badEmail.map(c => (
                      <tr key={c.id}><td style={atdStyle}>{c.name}</td><td style={atdStyle}>{c.email}</td><td style={atdStyle}>{c.phone || '—'}</td><td style={atdStyle}><button onClick={() => navigate(`/customers/${c.id}`)} style={btnView}>View</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          {/* Opted Out */}
          <details style={{ marginBottom: '8px' }}>
            <summary style={auditSummary}>
              <span style={{ color: '#991b1b' }}>Opted Out of Marketing ({audit.optedOutCount})</span>
            </summary>
            <div style={auditPanel}>
              <p style={auditHelper}>These customers have opted out or unsubscribed from marketing emails.</p>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={auditTable}>
                  <thead><tr><th style={athStyle}>Name</th><th style={athStyle}>Email</th><th style={athStyle}>Date</th><th style={athStyle}></th></tr></thead>
                  <tbody>
                    {audit.optedOut.map(c => (
                      <tr key={c.id}><td style={atdStyle}>{c.name}</td><td style={atdStyle}>{c.email}</td><td style={atdStyle}>{c.date ? new Date(c.date).toLocaleDateString() : '—'}</td><td style={atdStyle}><button onClick={() => navigate(`/customers/${c.id}`)} style={btnView}>View</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          {/* Sent History */}
          <details style={{ marginBottom: '8px' }}>
            <summary style={auditSummary}>
              <span style={{ color: '#065f46' }}>Already Received Campaign ({audit.sentCount})</span>
            </summary>
            <div style={auditPanel}>
              <p style={auditHelper}>These customers already received a campaign email and will be excluded from the next send.</p>
              {audit.sentCount > 0 && <button onClick={() => exportCsv(audit.sentHistory, ['customer_name', 'email', 'campaign_name', 'sent_at'], `campaign-sent-history-${new Date().toISOString().split('T')[0]}.csv`)} style={btnExport}>Export CSV</button>}
              <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '8px' }}>
                <table style={auditTable}>
                  <thead><tr><th style={athStyle}>Name</th><th style={athStyle}>Email</th><th style={athStyle}>Campaign</th><th style={athStyle}>Sent</th></tr></thead>
                  <tbody>
                    {audit.sentHistory.map((r, i) => (
                      <tr key={i}><td style={atdStyle}>{r.customer_name}</td><td style={atdStyle}>{r.email}</td><td style={atdStyle}>{r.campaign_name}</td><td style={atdStyle}>{r.sent_at ? new Date(r.sent_at).toLocaleDateString() : '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </div>
      )}

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
const btnSecondary = { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnSmall = { padding: '3px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' };
const btnView = { padding: '2px 8px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 };
const btnExport = { padding: '4px 10px', backgroundColor: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '10px 12px', fontSize: '0.875rem' };
const auditSummary = { cursor: 'pointer', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' };
const auditPanel = { padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' };
const auditHelper = { fontSize: '0.8rem', color: '#6b7280', margin: '0 0 8px', fontStyle: 'italic' };
const auditTable = { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' };
const athStyle = { padding: '6px 8px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' };
const atdStyle = { padding: '6px 8px', borderBottom: '1px solid #f3f4f6' };
