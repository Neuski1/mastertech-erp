import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ImagePicker from '../components/ImagePicker';

const TEMPLATES = [
  { value: 'seasonal', label: 'Seasonal Promotion', icon: '\uD83C\uDF38', defaultSubject: 'Get Your RV Ready for the Season \u2014 Master Tech RV', defaultBody: '<p>Don\'t wait until you\'re packed and ready to roll to find out something\'s wrong. A quick seasonal checkup from our certified techs can catch small problems before they become expensive ones \u2014 and get you on the road with total peace of mind. Come in now before the spring rush hits and avoid the wait!</p>' },
  { value: 'service_reminder', label: 'Service Reminder', icon: '\uD83D\uDD27', defaultSubject: 'Time for Your Annual RV Checkup \u2014 Master Tech RV Repair & Storage', defaultBody: '<p>It\'s been a while since we\'ve seen your RV, and we want to make sure it\'s in top shape for your next adventure!</p>' },
];

// A social post is the same wizard with a different middle: caption instead of
// subject and body, platforms instead of an audience, and a human doing the
// actual posting. The ERP does not publish to Facebook, Instagram or YouTube.
const SOCIAL_TEMPLATE = {
  value: 'social_post', label: 'Social Post', icon: '📷',
  blurb: 'Facebook, Instagram or YouTube. Caption plus pictures, held as a draft until it is posted.',
};

const PLATFORMS = ['Facebook', 'Instagram', 'YouTube'];

// MONTH_OPTIONS removed — filter no longer uses time-based exclusion

export default function CampaignEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [step, setStep] = useState(isNew ? 1 : 2);
  const [campaign, setCampaign] = useState(null);
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', template_type: '', subject: '', body_html: '', target_filter: { last_visit_months: 6 },
    hero_image_url: null, hero_alt: '', hero_caption: null,
    campaign_type: 'email', platforms: '', post_caption: '', scheduled_for: '',
    calendar_row_id: null,
  });
  const [pickerFor, setPickerFor] = useState(null); // 'hero' | 'body'
  const [inlineImages, setInlineImages] = useState([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [audience, setAudience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [undoRecipient, setUndoRecipient] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFullList, setShowFullList] = useState(true);

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
          hero_image_url: data.hero_image_url ?? null,
          hero_alt: data.hero_alt || '',
          hero_caption: data.hero_caption ?? null,
          campaign_type: data.campaign_type || 'email',
          platforms: data.platforms || '',
          post_caption: data.post_caption || '',
          scheduled_for: data.scheduled_for ? String(data.scheduled_for).slice(0, 10) : '',
          calendar_row_id: data.calendar_row_id || null,
        });
        setStep(data.status === 'draft' ? 2 : 5);
      }).catch(err => setError(err.message)).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // Came in from the calendar: Terri tagged the promotion, this prefills it.
  useEffect(() => {
    if (!isNew) return;
    const rowId = searchParams.get('calendar_row');
    if (!rowId) return;
    const piece = searchParams.get('piece') || '';
    const channel = searchParams.get('channel') || '';
    const isSocial = ['Facebook', 'Instagram', 'YouTube'].includes(channel);
    setForm(f => ({
      ...f,
      name: piece || f.name,
      calendar_row_id: Number(rowId),
      campaign_type: isSocial ? 'social' : f.campaign_type,
      template_type: isSocial ? 'social_post' : f.template_type,
      platforms: isSocial ? channel : f.platforms,
      post_caption: isSocial ? '' : f.post_caption,
    }));
    if (isSocial) setStep(2);
  }, [isNew, searchParams]);

  const isSocial = form.campaign_type === 'social';

  // Fetch audience count when entering the audience step. Social posts have no
  // audience — they go to a page, not a mailing list.
  useEffect(() => {
    if (step >= 4 && form.template_type && form.campaign_type !== 'social') {
      api.getAudienceCount({ template_type: form.template_type }).then(setAudience).catch(() => {});
    }
  }, [step, form.template_type, form.campaign_type]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectTemplate = (tmpl) => {
    setForm({ ...form, campaign_type: 'email', template_type: tmpl.value, subject: tmpl.defaultSubject, body_html: tmpl.defaultBody, name: form.name || tmpl.label });
    setStep(2);
  };

  const selectSocial = () => {
    setForm({ ...form, campaign_type: 'social', template_type: 'social_post', name: form.name || 'Social Post', platforms: form.platforms || 'Instagram' });
    setStep(2);
  };

  const togglePlatform = (p) => {
    const list = (form.platforms || '').split(',').map(s => s.trim()).filter(Boolean);
    const next = list.includes(p) ? list.filter(x => x !== p) : [...list, p];
    setForm({ ...form, platforms: next.join(',') });
  };

  const hasPlatform = (p) => (form.platforms || '').split(',').map(s => s.trim()).includes(p);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (isNew && !campaign) {
        const created = await api.createCampaign(form);
        setCampaign(created);
        window.history.replaceState(null, '', `/marketing/${created.id}`);
      } else {
        await api.updateCampaign(campaign.id, form);
      }
      setSaving(false);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  // Save Draft — the copy can now sit in the module unsent. Before this, a
  // campaign only saved on the way to the audience screen.
  const handleSaveDraft = async () => {
    await handleSave();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Images. The hero sits under the header; inline images drop into the body
  // as email-safe <img> tags at 100% width of the 600px column.
  const handleImageSelected = (img) => {
    if (pickerFor === 'hero') {
      setForm(f => ({ ...f, hero_image_url: img.public_url, hero_alt: img.alt_text || img.title || '' }));
    } else if (pickerFor === 'body') {
      if (isSocial) {
        // A social post carries the picture itself, not HTML around it.
        setForm(f => ({ ...f, image_urls: [(f.image_urls || ''), img.public_url].filter(Boolean).join(',') }));
      } else {
        const tag = `\n<p style="margin:16px 0;"><img src="${img.public_url}" alt="${(img.alt_text || img.title || '').replace(/"/g, '&quot;')}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border-radius:6px;" /></p>`;
        setForm(f => ({ ...f, body_html: (f.body_html || '') + tag }));
      }
      setInlineImages(list => [...list, img]);
    }
    setPickerFor(null);
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
    const sendCount = (audience?.eligible || 0) - removedIds.size;
    if (!audience || sendCount === 0) { setError('No eligible recipients'); return; }
    if (!window.confirm(`Send "${form.name}" to ${sendCount} customers?${removedIds.size > 0 ? `\n(${removedIds.size} manually excluded)` : ''}\n\nAll emails will be sent immediately.\n\nThis cannot be undone.`)) return;

    setSending(true); setError('');
    try {
      await handleSave();
      await api.updateCampaign(cid, { target_filter: form.target_filter });
      const result = await api.sendCampaign(cid, { excluded_ids: [...removedIds] });
      setSendResult(result);
      setStep(5);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  // Approve, send it back, or park it on a missing photo. Every one of these
  // writes a record on the campaign.
  const runApproval = async (action) => {
    const cid = campaign?.id;
    if (!cid) return;
    setError('');
    try {
      let updated;
      if (action === 'approve') {
        updated = await api.approveCampaign(cid, null);
      } else if (action === 'needs_photo') {
        updated = await api.flagCampaignNeedsPhoto(cid, null);
      } else {
        const reason = window.prompt('Why is this coming back? The reason is saved on the piece.');
        if (!reason || !reason.trim()) return;
        updated = await api.rejectCampaign(cid, reason.trim());
      }
      setCampaign(c => ({ ...c, ...updated }));
    } catch (err) { setError(err.message); }
  };

  const isDraft = !campaign || campaign.status === 'draft';
  const isSent = campaign && ['sent', 'sending'].includes(campaign.status);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/marketing')} style={btnLink}>&larr; Back to Campaigns</button>

      {error && <div style={errorBox}>{error}</div>}
      {previewResult && <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#065f46', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' }}>{previewResult}</div>}

      {/* Approval bar. Approval is a record here, not a reply in an email
          thread: who approved it, when, and the reason if it came back. */}
      {campaign && (
        <div style={approvalBar(campaign.approval_status)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {APPROVAL_LABELS[campaign.approval_status] || 'Draft'}
            </span>
            {campaign.approval_status === 'approved' && campaign.approved_at && (
              <span style={{ fontSize: '0.78rem' }}>
                by {campaign.approved_by_name || 'staff'} on {new Date(campaign.approved_at).toLocaleDateString()}
              </span>
            )}
            {campaign.approval_status === 'rejected' && campaign.rejected_reason && (
              <span style={{ fontSize: '0.78rem' }}>{campaign.rejected_reason}</span>
            )}
            {campaign.approval_status === 'needs_photo' && (
              <span style={{ fontSize: '0.78rem' }}>Waiting on a picture before this can go.</span>
            )}
          </div>
          {campaign.status === 'draft' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => runApproval('approve')} style={btnApprove}>Approve</button>
              <button onClick={() => runApproval('needs_photo')} style={btnSecondary}>Needs Photo</button>
              <button onClick={() => runApproval('reject')} style={btnReject}>Reject</button>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Choose template */}
      {step === 1 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>New Campaign</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>What are you building?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div onClick={selectSocial} style={templateCard}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{SOCIAL_TEMPLATE.icon}</div>
              <h3 style={{ margin: '0 0 4px', color: '#1e3a5f' }}>{SOCIAL_TEMPLATE.label}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{SOCIAL_TEMPLATE.blurb}</p>
            </div>
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
          <h1 style={{ color: '#1e3a5f' }}>{isNew ? (isSocial ? 'Write the Post' : 'Customize Email') : form.name}</h1>
          <div style={cardStyle}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Campaign Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} disabled={!isDraft} />
            </div>
            {isSocial ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Where it goes</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => togglePlatform(p)} disabled={!isDraft}
                        style={{ ...btnSecondary, backgroundColor: hasPlatform(p) ? '#1e3a5f' : '#f3f4f6', color: hasPlatform(p) ? '#fff' : '#374151' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Caption</label>
                  <textarea value={form.post_caption || ''} onChange={(e) => setForm({ ...form, post_caption: e.target.value })} rows={6} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} disabled={!isDraft} placeholder="Lead with the customer's problem. Use a real job. End with one action." />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>{(form.post_caption || '').length} characters</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Post on</label>
                  <input type="date" value={form.scheduled_for || ''} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} style={inputStyle} disabled={!isDraft} />
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Subject Line</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} disabled={!isDraft} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Email Body (HTML)</label>
                  <textarea value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} rows={8} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} disabled={!isDraft} />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>Use &lt;p&gt; tags for paragraphs. Customer name auto-inserted.</p>
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {isDraft && <button onClick={async () => { await handleSave(); setStep(3); }} disabled={saving || !form.name || (!isSocial && !form.subject)} style={btnPrimary}>{saving ? 'Saving...' : 'Next: Pictures'}</button>}
              {isDraft && <button onClick={handleSaveDraft} disabled={saving || !form.name || (!isSocial && !form.subject)} style={btnSecondary}>Save Draft</button>}
              {isDraft && !isSocial && <button onClick={handlePreview} style={btnSecondary}>Send Test Email</button>}
              {isDraft && draftSaved && <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>Draft saved</span>}
              {!isDraft && <button onClick={() => setStep(5)} style={btnPrimary}>View Report</button>}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pictures */}
      {step === 3 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>Pictures</h1>
          <p style={{ color: '#6b7280', marginTop: '-8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            Pull a real before/after off a work order, use something already in the library, or upload a file.
          </p>

          {!isSocial && (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#1e3a5f' }}>Header image</h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#6b7280' }}>
              The wide shot under the logo. Leave it alone to keep the stock mountain photo.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: '260px' }}>
                {form.hero_image_url === '' ? (
                  <div style={heroEmpty}>No header image</div>
                ) : (
                  <img
                    src={form.hero_image_url || '/images/rv-mountains.jpg'}
                    alt={form.hero_alt || 'Header'}
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', display: 'block', backgroundColor: '#f3f4f6' }}
                  />
                )}
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>
                  {form.hero_image_url ? 'Custom image' : form.hero_image_url === '' ? 'Header removed' : 'Stock mountain photo'}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <button onClick={() => setPickerFor('hero')} disabled={!isDraft} style={btnSecondary}>Choose header image</button>
                  {form.hero_image_url !== null && form.hero_image_url !== '' && (
                    <button onClick={() => setForm({ ...form, hero_image_url: null, hero_alt: '' })} disabled={!isDraft} style={btnSecondary}>Back to stock</button>
                  )}
                  {form.hero_image_url !== '' && (
                    <button onClick={() => setForm({ ...form, hero_image_url: '' })} disabled={!isDraft} style={btnSecondary}>No header</button>
                  )}
                </div>
                <label style={labelStyle}>Caption under the header</label>
                <input
                  value={form.hero_caption === null ? '' : form.hero_caption}
                  onChange={(e) => setForm({ ...form, hero_caption: e.target.value })}
                  placeholder="Leave blank to use the default line"
                  style={inputStyle}
                  disabled={!isDraft}
                />
              </div>
            </div>
          </div>
          )}

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#1e3a5f' }}>
              {isSocial ? 'Pictures for the post' : 'Pictures in the body'}
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#6b7280' }}>
              {isSocial
                ? 'These ride along with the caption. First one is the lead image.'
                : 'Each one drops in at the end of the email body. Move it by editing the HTML on the previous screen.'}
            </p>

            {inlineImages.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {inlineImages.map((img, i) => (
                  <div key={`${img.id}-${i}`} style={{ width: '110px' }}>
                    <img src={img.thumb_url} alt="" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setPickerFor('body')} disabled={!isDraft} style={btnSecondary}>+ Add a picture</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>Back</button>
            {isDraft && <button onClick={async () => { await handleSave(); setStep(4); }} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : (isSocial ? 'Next: Review' : 'Next: Select Audience')}</button>}
            {isDraft && <button onClick={handleSaveDraft} disabled={saving} style={btnSecondary}>Save Draft</button>}
            {isDraft && !isSocial && <button onClick={handlePreview} style={btnSecondary}>Send Test Email</button>}
            {draftSaved && <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>Draft saved</span>}
          </div>
        </div>
      )}

      {/* Step 4 (social): Review and post */}
      {step === 4 && isSocial && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>Review</h1>
          <div style={cardStyle}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
              {form.platforms || 'No platform picked'}
              {form.scheduled_for ? ` · ${form.scheduled_for}` : ''}
            </div>
            {inlineImages.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {inlineImages.map((img, i) => (
                  <img key={`${img.id}-${i}`} src={img.thumb_url} alt="" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                ))}
              </div>
            )}
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#111', lineHeight: 1.6, margin: 0 }}>
              {form.post_caption || <span style={{ color: '#9ca3af' }}>No caption yet.</span>}
            </p>
          </div>

          <div style={{ ...cardStyle, backgroundColor: '#f9fafb' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
              The ERP holds the draft. Post it yourself on {form.platforms || 'the platform'}, then mark it posted here
              so the calendar row closes out.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStep(3)} style={btnSecondary}>Back</button>
              {isDraft && <button onClick={handleSaveDraft} disabled={saving} style={btnSecondary}>Save Draft</button>}
              {isDraft && (
                <button
                  onClick={async () => {
                    await handleSave();
                    const cid = campaign?.id;
                    if (!cid) return;
                    if (!window.confirm('Mark this post as posted? It closes the calendar row too.')) return;
                    try { const updated = await api.markCampaignPosted(cid); setCampaign(updated); setStep(5); }
                    catch (err) { setError(err.message); }
                  }}
                  disabled={campaign?.approval_status !== 'approved'}
                  style={{ ...btnSend, opacity: campaign?.approval_status !== 'approved' ? 0.5 : 1 }}
                >
                  {campaign?.approval_status !== 'approved' ? 'Approve before posting' : 'Mark as Posted'}
                </button>
              )}
              {draftSaved && <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>Draft saved</span>}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Audience */}
      {step === 4 && !isSocial && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>Select Audience</h1>
          <div style={cardStyle}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
              All customers with an email on file, excluding: currently in storage, open work orders, opted out, bad email, and unsubscribed.
            </p>

            {audience && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', lineHeight: '2.2' }}>
                  <div style={{ fontWeight: 600, color: '#065f46', fontSize: '1.1rem', marginBottom: '4px' }}>
                    {audience.eligible - removedIds.size} emails will be sent
                    {removedIds.size > 0 && <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>({removedIds.size} manually removed)</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>Excluded:</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem', paddingLeft: '12px' }}>
                    {audience.noEmail > 0 && <div>{audience.noEmail} — no email on file</div>}
                    {audience.excludedStorage > 0 && <div>{audience.excludedStorage} — currently in storage</div>}
                    {audience.excludedOpenOrders > 0 && <div>{audience.excludedOpenOrders} — open work order</div>}
                    {(audience.excludedOptOut || 0) > 0 && <div>{audience.excludedOptOut} — opted out of marketing</div>}
                    {(audience.excludedInvalid || 0) > 0 && <div>{audience.excludedInvalid} — bad email on file</div>}
                    {audience.unsubscribed > 0 && <div>{audience.unsubscribed} — unsubscribed</div>}
                    {(audience.excludedAlreadySent || 0) > 0 && <div>{audience.excludedAlreadySent} — already received this campaign</div>}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: '8px' }}>All emails will be sent immediately</div>
                </div>

                {/* Full recipient list with remove/select */}
                {audience.allRecipients && audience.allRecipients.length > 0 && (() => {
                  const active = audience.allRecipients.filter(c => !removedIds.has(c.id));
                  const removed = audience.allRecipients.filter(c => removedIds.has(c.id));
                  const allSelected = active.length > 0 && active.every(c => selectedIds.has(c.id));
                  const removeRecipient = (c) => {
                    setRemovedIds(prev => new Set([...prev, c.id]));
                    setSelectedIds(prev => { const s = new Set(prev); s.delete(c.id); return s; });
                    setUndoRecipient(c);
                    setTimeout(() => setUndoRecipient(u => u?.id === c.id ? null : u), 5000);
                  };
                  const addBack = (c) => {
                    setRemovedIds(prev => { const s = new Set(prev); s.delete(c.id); return s; });
                    setUndoRecipient(u => u?.id === c.id ? null : u);
                  };
                  return (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <button onClick={() => setShowFullList(!showFullList)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a5f', padding: 0 }}>
                        {showFullList ? 'Hide' : 'Show'} full recipient list ({active.length})
                      </button>
                    </div>

                    {undoRecipient && (
                      <div style={{ padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span>Removed {undoRecipient.name}</span>
                        <button onClick={() => addBack(undoRecipient)} style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Undo</button>
                      </div>
                    )}

                    {showFullList && (
                      <>
                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                          <div style={{ padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                            <strong>{selectedIds.size} selected</strong>
                            <button onClick={() => { selectedIds.forEach(id => setRemovedIds(prev => new Set([...prev, id]))); setSelectedIds(new Set()); }} style={{ padding: '4px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Remove Selected</button>
                            <button onClick={() => setSelectedIds(new Set())} style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</button>
                          </div>
                        )}
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                              <tr>
                                <th style={{ ...thSmall, width: '30px' }}>
                                  <input type="checkbox" checked={allSelected} onChange={(e) => {
                                    if (e.target.checked) setSelectedIds(new Set(active.map(c => c.id)));
                                    else setSelectedIds(new Set());
                                  }} />
                                </th>
                                <th style={thSmall}>Name</th>
                                <th style={thSmall}>Email</th>
                                <th style={{ ...thSmall, width: '60px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {active.map(c => (
                                <tr key={c.id}>
                                  <td style={tdSmall}><input type="checkbox" checked={selectedIds.has(c.id)} onChange={(e) => {
                                    const s = new Set(selectedIds);
                                    e.target.checked ? s.add(c.id) : s.delete(c.id);
                                    setSelectedIds(s);
                                  }} /></td>
                                  <td style={tdSmall}>{c.name}</td>
                                  <td style={tdSmall}>{c.email}</td>
                                  <td style={tdSmall}><button onClick={() => removeRecipient(c)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Remove</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Removed recipients */}
                        {removed.length > 0 && (
                          <details style={{ marginTop: '12px' }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', padding: '4px 0' }}>
                              Removed Recipients ({removed.length})
                            </summary>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <tbody>
                                  {removed.map(c => (
                                    <tr key={c.id} style={{ backgroundColor: '#fef2f2' }}>
                                      <td style={tdSmall}>{c.name}</td>
                                      <td style={tdSmall}>{c.email}</td>
                                      <td style={tdSmall}><button onClick={() => addBack(c)} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Add Back</button></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                  );
                })()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} style={btnSecondary}>Back</button>
              {(() => {
                const notApproved = campaign?.approval_status !== 'approved';
                const blocked = sending || !audience || (audience.eligible - removedIds.size) <= 0 || notApproved;
                return (
                  <button onClick={handleSend} disabled={blocked} style={{ ...btnSend, opacity: blocked ? 0.5 : 1 }}>
                    {sending ? 'Sending...' : notApproved ? 'Approve before sending' : `Send Campaign (${(audience?.eligible || 0) - removedIds.size} emails)`}
                  </button>
                );
              })()}
              <button onClick={handlePreview} style={btnSecondary}>Send Test Email</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Report */}
      {step === 5 && (
        <div>
          <h1 style={{ color: '#1e3a5f' }}>{form.name} — Report</h1>

          {sendResult && (
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>Campaign started!</div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                Sent {sendResult.sentToday} emails. {sendResult.remaining > 0 ? `${sendResult.remaining} remaining — sending now.` : 'All emails sent.'}
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

            {/* Sent recipients */}
            {campaign?.recipients && campaign.recipients.filter(r => r.status === 'sent').length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '8px' }}>
                  Sent ({campaign.recipients.filter(r => r.status === 'sent').length})
                </h3>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead><tr><th style={thSmall}>Name</th><th style={thSmall}>Email</th></tr></thead>
                    <tbody>
                      {campaign.recipients.filter(r => r.status === 'sent').map(r => (
                        <tr key={r.id}>
                          <td style={tdSmall}>{r.customer_name}</td>
                          <td style={tdSmall}>{r.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Manually excluded — collapsible */}
            {campaign?.recipients && (() => {
              const excluded = campaign.recipients.filter(r => r.status === 'manually_excluded');
              if (excluded.length === 0) return null;
              return (
                <details style={{ marginTop: '16px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#6b7280', padding: '8px 0' }}>
                    Manually Excluded ({excluded.length})
                  </summary>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead><tr><th style={thSmall}>Name</th><th style={thSmall}>Email</th></tr></thead>
                      <tbody>
                        {excluded.map(r => (
                          <tr key={r.id} style={{ backgroundColor: '#f9fafb' }}>
                            <td style={tdSmall}>{r.customer_name}</td>
                            <td style={tdSmall}>{r.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })()}

            {/* Undeliverable recipients — collapsible */}
            {campaign?.recipients && (() => {
              const failed = campaign.recipients.filter(r => r.status === 'failed');
              if (failed.length === 0) return null;
              const formatReason = (msg) => {
                if (!msg) return 'Unknown error';
                const m = msg.toLowerCase();
                if (m.includes('bounce')) return 'Bad email address (bounced)';
                if (m.includes('invalid_to') || m.includes('invalid email')) return 'Invalid email address format';
                if (m.includes('not found') || m.includes('does not exist') || m.includes('404')) return 'Email address not found';
                if (m.includes('spam') || m.includes('complaint')) return 'Marked as spam by recipient';
                if (m.includes('unsubscrib')) return 'Previously unsubscribed';
                if (m.includes('rate') || m.includes('too many') || m.includes('429')) return 'Sending rate limit — use Retry';
                return msg.length > 80 ? msg.slice(0, 80) + '...' : msg;
              };
              return (
                <details style={{ marginTop: '16px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#dc2626', padding: '8px 0' }}>
                    Undeliverable Recipients ({failed.length})
                  </summary>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead><tr><th style={thSmall}>Name</th><th style={thSmall}>Email</th><th style={thSmall}>Reason</th></tr></thead>
                      <tbody>
                        {failed.map(r => (
                          <tr key={r.id}>
                            <td style={tdSmall}>{r.customer_name}</td>
                            <td style={tdSmall}>{r.email}</td>
                            <td style={{ ...tdSmall, color: '#92400e' }}>{formatReason(r.error_message)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })()}
          </div>
        </div>
      )}

      <ImagePicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={handleImageSelected}
        title={pickerFor === 'hero' ? 'Choose a header image' : 'Add a picture to the email'}
      />
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
const APPROVAL_LABELS = {
  draft: 'Draft', needs_photo: 'Needs Photo', approved: 'Approved',
  rejected: 'Sent Back', posted: 'Posted',
};
const APPROVAL_TONE = {
  draft: { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
  needs_photo: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  approved: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  rejected: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  posted: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
};
const approvalBar = (status) => {
  const t = APPROVAL_TONE[status] || APPROVAL_TONE.draft;
  return {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
    flexWrap: 'wrap', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px',
    backgroundColor: t.bg, color: t.color, border: `1px solid ${t.border}`,
  };
};
const btnApprove = { padding: '7px 14px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnReject = { padding: '7px 14px', backgroundColor: '#fff', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const heroEmpty = { width: '100%', height: '110px', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.78rem' };
