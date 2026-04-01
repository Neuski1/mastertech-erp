import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const TEMPLATES = [
  { value: 'seasonal', label: 'Seasonal Promotion', icon: '\uD83C\uDF38', defaultSubject: 'Get Your RV Ready for the Season \u2014 Master Tech RV', defaultBody: '<p>Don\'t wait until you\'re packed and ready to roll to find out something\'s wrong. A quick seasonal checkup from our certified techs can catch small problems before they become expensive ones \u2014 and get you on the road with total peace of mind. Come in now before the spring rush hits and avoid the wait!</p>' },
  { value: 'service_reminder', label: 'Service Reminder', icon: '\uD83D\uDD27', defaultSubject: 'Time for Your Annual RV Checkup \u2014 Master Tech RV Repair & Storage', defaultBody: '<p>It\'s been a while since we\'ve seen your RV, and we want to make sure it\'s in top shape for your next adventure!</p>' },
];

const MONTH_OPTIONS = [3, 6, 9, 12, 18, 24];

export default function CampaignEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [step, setStep] = useState(isNew ? 1 : 2);
  const [campaign, setCampaign] = useState(null);
  const [form, setForm] = useState({ name: '', template_type: '', subject: '', body_html: '', target_filter: { last_visit_months: 6 } });
  const [audience, setAudience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isNew);

  // Load existing campaign
  useEffect(() => {
    if (!isNew) {
      api.getCampaign(id).then(data => {
        setCampaign(data);
        setForm({
          name: data.name,
          template_type: data.template_type,
          subject: data.subject,
          body_html: data.body_html,
          target_filter: data.target_filter || { last_visit_months: 6 },
        });
        setStep(data.status === 'draft' ? 2 : 4);
      }).catch(err => setError(err.message)).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // Fetch audience count when filter changes
  useEffect(() => {
    if (step >= 3 && form.target_filter?.last_visit_months) {
      api.getAudienceCount({ last_visit_months: form.target_filter.last_visit_months })
        .then(setAudience).catch(() => {});
    }
  }, [step, form.target_filter?.last_visit_months]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectTemplate = (tmpl) => {
    setForm({ ...form, template_type: tmpl.value, subject: tmpl.defaultSubject, body_html: tmpl.defaultBody, name: form.name || tmpl.label });
    setStep(2);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (isNew && !campaign) {
        const created = await api.createCampaign(form);
        setCampaign(created);
        navigate(`/marketing/${created.id}`, { replace: true });
      } else {
        await api.updateCampaign(campaign.id, form);
      }
      setSaving(false);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  const handlePreview = async () => {
    setPreviewResult(null); setError('');
    try {
      await handleSave();
      const cid = campaign?.id;
      if (!cid) return;
      const result = await api.previewCampaign(cid);
      setPreviewResult(result.success ? 'Test email sent to carol@mastertechrvrepair.com' : `Failed: ${result.error}`);
      setTimeout(() => setPreviewResult(null), 5000);
    } catch (err) { setError(err.message); }
  };

  const handleSend = async () => {
    const cid = campaign?.id;
    if (!cid) return;
    if (!audience || audience.eligible === 0) { setError('No eligible recipients'); return; }
    if (!window.confirm(`Send "${form.name}" to ${audience.eligible} customers?\n\nEmails will be sent at 100/day.\nEstimated completion: ${audience.estimatedDays} day${audience.estimatedDays > 1 ? 's' : ''}.\n\nThis cannot be undone.`)) return;

    setSending(true); setError('');
    try {
      await handleSave();
      // Update filter before sending
      await api.updateCampaign(cid, { target_filter: form.target_filter });
      const result = await api.sendCampaign(cid);
      setSendResult(result);
      setStep(4);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const isDraft = !campaign || campaign.status === 'draft';
  const isSent = campaign && ['sent', 'sending'].includes(campaign.status);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/marketing')} style={btnLink}>&larr; Back to Campaigns</button>

      {error && <div style={errorBox}>{error}</div>}
      {previewResult && <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#065f46', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' }}>{previewResult}</div>}

      {/* Step 1: Choose template */}
      {step === 1 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>New Campaign</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Choose a template to get started:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {TEMPLATES.map(tmpl => (
              <div key={tmpl.value} onClick={() => selectTemplate(tmpl)} style={templateCard}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{tmpl.icon}</div>
                <h3 style={{ margin: '0 0 4px', color: '#1e3a5f' }}>{tmpl.label}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  {tmpl.value === 'seasonal' ? 'Promote seasonal services and specials' : 'Remind past customers to schedule service'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Customize */}
      {step === 2 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>{isNew ? 'Customize Email' : form.name}</h1>
          <div style={cardStyle}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Campaign Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} disabled={!isDraft} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Subject Line</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} disabled={!isDraft} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email Body (HTML)</label>
              <textarea value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} rows={8} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} disabled={!isDraft} />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>Use &lt;p&gt; tags for paragraphs. Customer name auto-inserted.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isDraft && <button onClick={() => { handleSave(); setStep(3); }} disabled={saving || !form.name || !form.subject} style={btnPrimary}>{saving ? 'Saving...' : 'Next: Select Audience'}</button>}
              {isDraft && <button onClick={handlePreview} style={btnSecondary}>Send Test Email</button>}
              {!isDraft && <button onClick={() => setStep(4)} style={btnPrimary}>View Report</button>}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Audience */}
      {step === 3 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>Select Audience</h1>
          <div style={cardStyle}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Customers with no service or storage activity in:</label>
              <select
                value={form.target_filter?.last_visit_months || 6}
                onChange={(e) => setForm({ ...form, target_filter: { ...form.target_filter, last_visit_months: parseInt(e.target.value) } })}
                style={{ ...inputStyle, width: '200px' }}
              >
                {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                Excludes: customers currently in storage, customers with open work orders, and customers serviced within the selected time period.
              </p>
            </div>

            {audience && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '2.2' }}>
                  <div style={{ fontWeight: 600, color: '#065f46', fontSize: '1.1rem', marginBottom: '4px' }}>
                    {audience.eligible} emails will be sent
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>Excluded:</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', paddingLeft: '12px' }}>
                    {audience.noEmail > 0 && <div>{audience.noEmail} — no email on file</div>}
                    {audience.unsubscribed > 0 && <div>{audience.unsubscribed} — unsubscribed</div>}
                    {audience.excludedStorage > 0 && <div>{audience.excludedStorage} — currently in storage</div>}
                    {audience.excludedOpenOrders > 0 && <div>{audience.excludedOpenOrders} — have open work orders</div>}
                    {audience.excludedRecentService > 0 && <div>{audience.excludedRecentService} — serviced in last {form.target_filter?.last_visit_months || 6} months</div>}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: '8px' }}>Estimated send time: {audience.estimatedDays} day{audience.estimatedDays > 1 ? 's' : ''} at 100/day</div>
                </div>

                {audience.preview && audience.preview.length > 0 && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Preview (first 10):</div>
                    {audience.preview.map(c => (
                      <div key={c.id} style={{ fontSize: '0.8rem', color: '#374151', padding: '2px 0' }}>{c.name} — {c.email}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>Back</button>
              <button onClick={handleSend} disabled={sending || !audience || audience.eligible === 0} style={{ ...btnSend, opacity: sending || !audience || audience.eligible === 0 ? 0.5 : 1 }}>
                {sending ? 'Sending...' : `Send Campaign (${audience?.eligible || 0} emails)`}
              </button>
              <button onClick={handlePreview} style={btnSecondary}>Send Test Email</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Report */}
      {step === 4 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>{form.name} — Report</h1>

          {sendResult && (
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>Campaign started!</div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                Sent {sendResult.sentToday} emails today. {sendResult.remaining > 0 ? `Remaining ${sendResult.remaining} will send over the next ${sendResult.estimatedDaysRemaining} day(s) at 100/day.` : 'All emails sent.'}
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <StatCard label="Total Recipients" value={campaign?.recipient_count || 0} />
              <StatCard label="Sent" value={campaign?.sent_count || 0} color="#065f46" />
              <StatCard label="Status" value={(campaign?.status || 'draft').toUpperCase()} />
            </div>

            {/* Progress bar */}
            {campaign?.status === 'sending' && campaign.recipient_count > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#059669', borderRadius: '4px', width: `${Math.round((campaign.sent_count / campaign.recipient_count) * 100)}%`, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{campaign.sent_count} of {campaign.recipient_count} sent</span>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Cancel this campaign? Emails already sent cannot be recalled.')) return;
                      try {
                        const result = await api.cancelCampaign(campaign.id);
                        alert(`Campaign cancelled. ${result.cancelledCount} queued emails were stopped.`);
                        window.location.reload();
                      } catch (err) {
                        alert('Cancel failed: ' + err.message);
                      }
                    }}
                    style={{ padding: '4px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Cancel Campaign
                  </button>
                </div>
              </div>
            )}

            {/* Retry failed button */}
            {campaign?.recipients && campaign.recipients.filter(r => r.status === 'failed').length > 0 && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>
                    {campaign.recipients.filter(r => r.status === 'failed').length} failed
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '8px' }}>
                    (rate limit or delivery error)
                  </span>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const result = await api.retryCampaign(campaign.id);
                      alert(`Retrying ${result.retried} failed recipients. ${result.sent} sent so far.`);
                      window.location.reload();
                    } catch (err) {
                      alert('Retry failed: ' + err.message);
                    }
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Retry Failed
                </button>
              </div>
            )}

            {/* Recipient list */}
            {campaign?.recipients && campaign.recipients.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '8px' }}>Recipients</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th style={thSmall}>Name</th>
                        <th style={thSmall}>Email</th>
                        <th style={thSmall}>Status</th>
                        <th style={thSmall}>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaign.recipients.map(r => (
                        <tr key={r.id}>
                          <td style={tdSmall}>{r.customer_name}</td>
                          <td style={tdSmall}>{r.email}</td>
                          <td style={tdSmall}>
                            <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                              backgroundColor: r.status === 'sent' ? '#d1fae5' : r.status === 'failed' ? '#fee2e2' : '#fef3c7',
                              color: r.status === 'sent' ? '#065f46' : r.status === 'failed' ? '#991b1b' : '#92400e',
                            }}>{r.status}</span>
                          </td>
                          <td style={{ ...tdSmall, color: '#dc2626' }}>{r.error_message || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || '#1e3a5f' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnSend = { padding: '12px 24px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0, marginBottom: '8px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px' };
const errorBox = { padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' };
const templateCard = { padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s' };
const thSmall = { padding: '6px 8px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' };
const tdSmall = { padding: '6px 8px', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' };
