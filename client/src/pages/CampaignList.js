import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';
import MarketingNav from '../components/MarketingNav';

const TYPE_BADGE = {
  social: { bg: '#fce7f0', color: '#c2255c', label: 'Social' },
  email: { bg: '#e3ebf5', color: '#1e3a5f', label: 'Email' },
};

// Same four words the calendar uses.
const APPROVAL_BADGE = {
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
  needs_photo: { bg: '#fef3c7', color: '#92400e', label: 'Needs Photo' },
  approved: { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Sent Back' },
  posted: { bg: '#dbeafe', color: '#1e40af', label: 'Posted' },
};

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');       // all | email | social
  const [stateFilter, setStateFilter] = useState('all');     // all | waiting | approved | out
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.getCampaigns().then(setCampaigns).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Same decisions the calendar offers, so the two views really are one thing
  // seen two ways.
  const runApproval = async (c, action) => {
    setError('');
    try {
      if (action === 'approve') await api.approveCampaign(c.id, null);
      else if (action === 'needs_photo') await api.flagCampaignNeedsPhoto(c.id, null);
      else {
        const reason = window.prompt(`Send "${c.name}" back. Why? The reason is saved on the piece.`);
        if (!reason || !reason.trim()) return;
        await api.rejectCampaign(c.id, reason.trim());
      }
      load();
    } catch (err) { setError(err.message); }
  };

  const visible = campaigns.filter(c => {
    const isSocial = c.campaign_type === 'social';
    if (typeFilter === 'email' && isSocial) return false;
    if (typeFilter === 'social' && !isSocial) return false;

    if (stateFilter === 'waiting') return c.status === 'draft' && c.approval_status !== 'approved';
    if (stateFilter === 'approved') return c.status === 'draft' && c.approval_status === 'approved';
    if (stateFilter === 'out') return c.status !== 'draft';
    return true;
  });

  const countFor = (t) => campaigns.filter(c => (t === 'email' ? c.campaign_type !== 'social' : c.campaign_type === 'social')).length;

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
      <MarketingNav />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e3a5f' }}>Campaigns</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Email sends and social posts, drafts included.</p>
        </div>
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
                      <tr key={c.id}><td style={atdStyle}>{c.name}</td><td style={atdStyle}>{c.email}</td><td style={atdStyle}>{c.date ? formatDate(c.date) : '—'}</td><td style={atdStyle}><button onClick={() => navigate(`/customers/${c.id}`)} style={btnView}>View</button></td></tr>
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
                      <tr key={i}><td style={atdStyle}>{r.customer_name}</td><td style={atdStyle}>{r.email}</td><td style={atdStyle}>{r.campaign_name}</td><td style={atdStyle}>{r.sent_at ? formatDate(r.sent_at) : '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </div>
      )}

      {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['all', `All (${campaigns.length})`], ['email', `Email (${countFor('email')})`], ['social', `Social (${countFor('social')})`]].map(([k, lbl]) => (
            <button key={k} onClick={() => setTypeFilter(k)} style={filterBtn(typeFilter === k)}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['all', 'Any state'], ['waiting', 'Waiting on me'], ['approved', 'Approved, not out'], ['out', 'Already out']].map(([k, lbl]) => (
            <button key={k} onClick={() => setStateFilter(k)} style={filterBtn(stateFilter === k)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Template</th>
              <th style={{ ...thStyle, width: '120px' }}>Run date</th>
              <th style={thStyle}>Approval</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Recipients</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Sent</th>
              <th style={{ ...thStyle, width: '120px' }}>Went out</th>
              <th style={{ ...thStyle, width: '190px' }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                {campaigns.length === 0 ? 'No campaigns yet' : 'Nothing matches that filter'}
              </td></tr>
            )}
            {visible.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{c.name}</span></td>
                <td style={tdStyle}>
                  {(() => {
                    const t = TYPE_BADGE[c.campaign_type === 'social' ? 'social' : 'email'];
                    const detail = c.campaign_type === 'social'
                      ? (c.platforms || 'Social')
                      : (c.template_type === 'service_reminder' ? 'Service Reminder' : 'Seasonal');
                    return (
                      <>
                        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, backgroundColor: t.bg, color: t.color, marginRight: '6px' }}>{t.label}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{detail}</span>
                      </>
                    );
                  })()}
                </td>
                <td style={tdStyle}>
                  {(() => {
                    if (!c.run_date) {
                      return <span style={{ fontSize: '0.8rem', color: c.calendar_date_note ? '#6b7280' : '#d1d5db' }}>
                        {c.calendar_date_note || 'no date'}
                      </span>;
                    }
                    const today = new Date().toISOString().slice(0, 10);
                    const overdue = c.run_date < today && c.status === 'draft';
                    return (
                      <span
                        title={c.run_date_source === 'calendar' ? 'From the calendar row' : 'Set on the campaign'}
                        style={{ fontSize: '0.8rem', fontWeight: overdue ? 700 : 500, color: overdue ? '#b91c1c' : '#374151' }}
                      >
                        {formatDate(c.run_date)}
                        {overdue && <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>past due</span>}
                      </span>
                    );
                  })()}
                </td>
                <td style={tdStyle}>
                  {(() => {
                    const a = APPROVAL_BADGE[c.approval_status] || APPROVAL_BADGE.draft;
                    return <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, backgroundColor: a.bg, color: a.color }}>{a.label}</span>;
                  })()}
                </td>
                <td style={tdStyle}>
                  {statusBadge(c.status)}
                  {c.status === 'sending' && <span style={{ fontSize: '0.75rem', color: '#92400e', marginLeft: '6px' }}>{c.sent_count} of {c.recipient_count}</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{c.recipient_count || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{c.sent_count || '—'}</td>
                {/* When it actually went out, not when the row was created.
                    The planned date is the Run date column. */}
                <td style={tdStyle}>
                  {c.posted_at || c.sent_at
                    ? <span style={{ fontSize: '0.8rem' }}>{formatDate(c.posted_at || c.sent_at)}</span>
                    : <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>not yet</span>}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={() => navigate(`/marketing/${c.id}`)} style={btnSmall}>
                      {c.status === 'draft' ? 'Edit' : 'View'}
                    </button>
                    {c.status === 'draft' && c.approval_status !== 'approved' && (
                      <button onClick={() => runApproval(c, 'approve')} style={{ ...btnSmall, backgroundColor: '#065f46', color: '#fff', border: 'none' }}>Approve</button>
                    )}
                    {c.status === 'draft' && (
                      <button onClick={() => runApproval(c, 'reject')} style={{ ...btnSmall, color: '#991b1b', borderColor: '#fca5a5' }}>Send back</button>
                    )}
                    {c.status === 'draft' && (
                      <button onClick={() => handleDelete(c.id)} style={{ ...btnSmall, color: '#dc2626' }}>Del</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const filterBtn = (active) => ({
  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  border: active ? '1px solid #1e3a5f' : '1px solid #d1d5db',
  backgroundColor: active ? '#1e3a5f' : '#fff',
  color: active ? '#fff' : '#374151',
});
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
