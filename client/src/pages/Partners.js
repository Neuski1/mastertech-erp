import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

// Pipeline stages. These match the partners_status_chk constraint in
// migration 054 — adding one here means adding it there too.
const STAGES = [
  { key: 'new', label: 'New', color: '#6b7280', bg: '#f3f4f6' },
  { key: 'attempted', label: 'Attempted', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'contacted', label: 'Contacted', color: '#2563eb', bg: '#eff6ff' },
  { key: 'in_conversation', label: 'In Conversation', color: '#0891b2', bg: '#ecfeff' },
  { key: 'active', label: 'Active Partner', color: '#059669', bg: '#ecfdf5' },
  { key: 'declined', label: 'Declined', color: '#dc2626', bg: '#fef2f2' },
  { key: 'not_a_fit', label: 'Not a Fit', color: '#b45309', bg: '#fffbeb' },
  { key: 'dormant', label: 'Dormant', color: '#9ca3af', bg: '#f9fafb' },
];

// Priority order: storage facilities, then campgrounds, then RV clubs.
// Dealers and mobile techs are never pitched — they carry do_not_pitch.
const PARTNER_TYPES = [
  { key: 'storage_facility', label: 'Storage Facility', rank: 1 },
  { key: 'campground', label: 'Campground', rank: 2 },
  { key: 'rv_club', label: 'RV Club', rank: 3 },
  { key: 'dealer', label: 'Dealer', rank: 9 },
  { key: 'mobile_tech', label: 'Mobile Tech', rank: 9 },
  { key: 'other', label: 'Other', rank: 9 },
];

const ACTIVITY_TYPES = [
  { key: 'call', label: 'Phone Call', icon: '📞' },
  { key: 'voicemail', label: 'Left Voicemail', icon: '☎' },
  { key: 'email_sent', label: 'Sent Email', icon: '✉' },
  { key: 'email_reply', label: 'Email Reply', icon: '📨' },
  { key: 'visit', label: 'Stopped By', icon: '🚗' },
  { key: 'meeting', label: 'Met In Person', icon: '🤝' },
  { key: 'referral_received', label: 'Referral Received', icon: '⭐' },
  { key: 'note', label: 'General Note', icon: '📝' },
];

// Outcome is what drives the status change in the partners_sync_from_activity
// trigger. Nothing here is cosmetic.
const OUTCOMES = [
  { key: '', label: 'No outcome yet' },
  { key: 'no_answer', label: 'No answer' },
  { key: 'left_message', label: 'Left message' },
  { key: 'spoke', label: 'Spoke with them' },
  { key: 'interested', label: 'Interested' },
  { key: 'asked_to_follow_up', label: 'Asked us to follow up' },
  { key: 'not_interested', label: 'Not interested' },
  { key: 'agreed', label: 'Agreed to partner' },
];

const DUE_REASONS = [
  { key: 'overdue', label: 'Overdue', color: '#dc2626', bg: '#fef2f2', blurb: 'Past the due date on the next step.' },
  { key: 'no_next_step', label: 'No Next Step', color: '#b45309', bg: '#fffbeb', blurb: 'Nothing says what happens next.' },
  { key: 'never_contacted', label: 'Never Contacted', color: '#2563eb', bg: '#eff6ff', blurb: 'On the list, never touched.' },
  { key: 'stale_14_day', label: 'Stale (14+ Days)', color: '#7c3aed', bg: '#f5f3ff', blurb: 'No contact in over two weeks.' },
];

const STAGE_MAP = {};
STAGES.forEach(s => { STAGE_MAP[s.key] = s; });
const ACTIVITY_MAP = {};
ACTIVITY_TYPES.forEach(a => { ACTIVITY_MAP[a.key] = a; });
const TYPE_MAP = {};
PARTNER_TYPES.forEach(t => { TYPE_MAP[t.key] = t; });

const todayISO = () => new Date().toISOString().split('T')[0];
const isoOrBlank = (d) => (d ? String(d).split('T')[0] : '');
const isOverdue = (due) => !!due && isoOrBlank(due) < todayISO();

const emptyPartner = {
  business_name: '', address: '', location: '', contact_phone: '', website: '',
  contact_name: '', email: '', date_contacted: '', status: 'new', notes: '',
  partner_type: 'storage_facility', next_step: '', next_step_due: '',
  do_not_pitch: false, do_not_pitch_reason: '', referral_terms: '',
};

const emptyContact = {
  activity_type: 'call', contact_date: todayISO(), direction: 'outbound',
  outcome: '', summary: '', next_step: '', next_step_due: '',
};

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [duePartners, setDuePartners] = useState([]);
  const [funnelStats, setFunnelStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [view, setView] = useState('due'); // 'due' | 'funnel' | 'table'
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [form, setForm] = useState({ ...emptyPartner });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [logFor, setLogFor] = useState(null); // partner the Log Contact modal is open on
  const [contact, setContact] = useState({ ...emptyContact });
  const [logging, setLogging] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const [all, due] = await Promise.all([
        api.getPartners(params),
        api.getPartnersDue(),
      ]);
      setPartners(all.partners);
      setFunnelStats(all.funnel_stats);
      setDuePartners(due.partners);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  useEffect(() => {
    if (actionMsg) { const t = setTimeout(() => setActionMsg(''), 4000); return () => clearTimeout(t); }
  }, [actionMsg]);

  const openAdd = () => {
    setEditPartner(null);
    setForm({ ...emptyPartner });
    setShowModal(true);
  };

  const fetchActivities = async (partnerId) => {
    setActivitiesLoading(true);
    try {
      const data = await api.getPartnerActivities(partnerId);
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const openEdit = (p) => {
    setEditPartner(p);
    setForm({
      business_name: p.business_name || '',
      address: p.address || '',
      location: p.location || '',
      contact_phone: p.contact_phone || '',
      website: p.website || '',
      contact_name: p.contact_name || '',
      email: p.email || '',
      date_contacted: isoOrBlank(p.date_contacted),
      status: p.status || 'new',
      notes: p.notes || '',
      partner_type: p.partner_type || '',
      next_step: p.next_step || '',
      next_step_due: isoOrBlank(p.next_step_due),
      do_not_pitch: !!p.do_not_pitch,
      do_not_pitch_reason: p.do_not_pitch_reason || '',
      referral_terms: p.referral_terms || '',
    });
    setActivities([]);
    setShowModal(true);
    fetchActivities(p.id);
  };

  const openLog = (p) => {
    setLogFor(p);
    setContact({ ...emptyContact });
  };

  const handleSave = async () => {
    if (!form.business_name.trim()) return alert('Business Name is required');
    if (!form.partner_type) return alert('Partner Type is required');
    if (!form.do_not_pitch && !form.next_step.trim()) {
      return alert('Next Step is required. If this record should never be pitched, tick Do Not Pitch instead.');
    }
    if (!form.do_not_pitch && !form.next_step_due) {
      return alert('Next Step Due is required. A next step with no date never comes due, so it never shows up.');
    }
    setSaving(true);
    try {
      if (editPartner) {
        await api.updatePartner(editPartner.id, form);
        setActionMsg(`Updated ${form.business_name}`);
      } else {
        await api.createPartner(form);
        // A brand new record that is flagged do_not_pitch, or is already
        // active with nothing overdue, will not appear on the Due tab. Land on
        // the Pipeline view so the partner she just added is actually on screen
        // instead of looking like the save failed.
        if (form.do_not_pitch) {
          setView('funnel');
          setFilterStatus('');
          setActionMsg(`Added ${form.business_name}. It is marked Do Not Pitch, so it lives here in Pipeline, not on the Due tab.`);
        } else {
          setActionMsg(`Added ${form.business_name}`);
        }
      }
      setShowModal(false);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePartner(id);
      setActionMsg('Partner deleted');
      setConfirmDelete(null);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    }
  };

  // The save button stays disabled until both of these are filled. The server
  // enforces the same rule, so this is convenience, not the guard.
  const contactValid = contact.summary.trim() && contact.next_step.trim() && contact.next_step_due;

  const handleLogContact = async () => {
    if (!contactValid || !logFor) return;
    setLogging(true);
    try {
      await api.addPartnerActivity(logFor.id, contact);
      setActionMsg(`Logged contact for ${logFor.business_name}`);
      setLogFor(null);
      if (editPartner && editPartner.id === logFor.id) fetchActivities(logFor.id);
      fetchPartners();
    } catch (err) {
      alert(err.message);
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (!editPartner) return;
    try {
      await api.deletePartnerActivity(editPartner.id, actId);
      fetchActivities(editPartner.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPartners = Object.values(funnelStats).reduce((a, b) => a + b, 0);

  // The Due tab reads the partners_due view, which the server does not filter
  // by stage or search. Apply both here or the dropdown silently does nothing
  // on the default view, which is exactly how it looked broken.
  const searchLower = search.trim().toLowerCase();
  const matchesFilters = (p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (!searchLower) return true;
    return [p.business_name, p.contact_name, p.email, p.address, p.location]
      .some(v => v && String(v).toLowerCase().includes(searchLower));
  };
  const visibleDue = duePartners.filter(matchesFilters);

  // The badge and the tab label always show the real total, never the filtered
  // count — the number of things owed does not change because of a dropdown.
  const dueCount = duePartners.length;
  const dueHiddenByFilter = dueCount - visibleDue.length;

  // --- STYLES ---
  const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 };
  const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
  const btnSecondary = { padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 13 };
  const btnLog = { padding: '6px 12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' };
  const cardStyle = { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', marginBottom: 10, cursor: 'pointer', transition: 'box-shadow 0.2s' };
  const badgeStyle = (stage) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
    color: stage?.color || '#6b7280', backgroundColor: stage?.bg || '#f3f4f6',
  });
  const typeBadge = { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.03em' };
  const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
  const modalBox = { backgroundColor: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#374151' };

  // Next step and due date live on the record header, not buried in notes.
  const NextStepLine = ({ p, compact }) => {
    const overdue = isOverdue(p.next_step_due);
    if (!p.next_step) {
      return (
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 600 }}>
          No next step set
        </div>
      );
    }
    return (
      <div style={{
        marginTop: 8, padding: '6px 10px', borderRadius: 8,
        background: overdue ? '#fef2f2' : '#f8fafc',
        borderLeft: `3px solid ${overdue ? '#dc2626' : '#94a3b8'}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: overdue ? '#dc2626' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Next step{p.next_step_due ? ` · due ${formatDate(p.next_step_due)}` : ''}{overdue ? ' · OVERDUE' : ''}
        </div>
        <div style={{ fontSize: 13, color: '#334155', marginTop: 2, ...(compact ? { maxHeight: 34, overflow: 'hidden' } : {}) }}>
          {p.next_step}
        </div>
      </div>
    );
  };

  const PartnerCard = ({ p, showDueReason }) => {
    const reason = DUE_REASONS.find(r => r.key === p.due_reason);
    return (
      <div style={cardStyle} onClick={() => openEdit(p)}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.business_name}</div>
          <span style={badgeStyle(STAGE_MAP[p.status])}>{STAGE_MAP[p.status]?.label || p.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
          {p.partner_type && <span style={typeBadge}>{TYPE_MAP[p.partner_type]?.label || p.partner_type}</span>}
          {p.do_not_pitch && (
            <span style={{ ...typeBadge, color: '#991b1b', backgroundColor: '#fee2e2' }}>Do Not Pitch</span>
          )}
          {showDueReason && reason && (
            <span style={{ ...typeBadge, color: reason.color, backgroundColor: reason.bg }}>{reason.label}</span>
          )}
        </div>
        {(p.address || p.location) && (
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
            {[p.address, p.location].filter(Boolean).join(', ')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#374151', marginBottom: 4, flexWrap: 'wrap' }}>
          {p.contact_phone && <span>{p.contact_phone}</span>}
          {p.contact_name && <span>{p.contact_name}</span>}
        </div>
        {p.email && <div style={{ fontSize: 13, color: '#2563eb', marginBottom: 4 }}>{p.email}</div>}
        {p.status === 'active' && p.referral_terms && (
          <div style={{ fontSize: 12, color: '#065f46', background: '#ecfdf5', borderRadius: 6, padding: '4px 8px', marginTop: 6 }}>
            Terms: {p.referral_terms}
          </div>
        )}
        <NextStepLine p={p} compact />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {p.date_contacted ? `Last contact ${formatDate(p.date_contacted)}` : 'Never contacted'}
          </span>
          <button onClick={e => { e.stopPropagation(); openLog(p); }} style={btnLog}>Log Contact</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#1e3a5f' }}>Partners</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            {totalPartners} partner{totalPartners !== 1 ? 's' : ''} tracked
            {dueCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{` · ${dueCount} due`}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Search partners..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: 200 }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: 160 }}>
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4, background: '#e5e7eb', borderRadius: 8, padding: 3 }}>
            {[['due', `Due${dueCount ? ` (${dueCount})` : ''}`], ['funnel', 'Pipeline'], ['table', 'Table']].map(([key, label]) => (
              <button key={key} onClick={() => setView(key)}
                style={{
                  ...btnSecondary,
                  backgroundColor: view === key ? '#fff' : 'transparent',
                  color: key === 'due' && dueCount > 0 ? '#dc2626' : '#374151',
                  fontWeight: view === key ? 700 : 500,
                  boxShadow: view === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={openAdd} style={btnPrimary}>+ Add Partner</button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: 8, marginBottom: 16, fontWeight: 500, fontSize: 14 }}>
          {actionMsg}
        </div>
      )}

      {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading partners...</div>
      ) : view === 'due' ? (
        /* ============ DUE VIEW — the default landing view ============ */
        <>
          {/* The Due tab is a work list, not the partner list. Say so, or a
              partner that is not due reads as a record that failed to save. */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap', fontSize: 13, color: '#64748b' }}>
            <span>
              Work list only: {dueCount} of {totalPartners} partners need attention.
              {dueHiddenByFilter > 0 && <strong style={{ color: '#b45309' }}>{` ${dueHiddenByFilter} hidden by the filter.`}</strong>}
            </span>
            <button onClick={() => setView('funnel')} style={{ ...btnSecondary, fontSize: 12 }}>
              See all {totalPartners} partners
            </button>
          </div>
          {visibleDue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: dueCount > 0 ? '#f8fafc' : '#ecfdf5', borderRadius: 12, border: `1px solid ${dueCount > 0 ? '#e2e8f0' : '#a7f3d0'}` }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{dueCount > 0 ? '🔍' : '✓'}</div>
              <div style={{ fontWeight: 700, color: dueCount > 0 ? '#334155' : '#065f46', fontSize: 16 }}>
                {dueCount > 0 ? 'Nothing due matches this filter' : 'Nothing due'}
              </div>
              <div style={{ color: dueCount > 0 ? '#64748b' : '#047857', fontSize: 13, marginTop: 4 }}>
                {dueCount > 0
                  ? `${dueCount} partner${dueCount !== 1 ? 's are' : ' is'} due, but none match. Clear the filter, or switch to Pipeline to see every partner.`
                  : 'Every partner has a next step with a date that has not passed. Switch to Pipeline or Table to see the full list.'}
              </div>
            </div>
          ) : (
            DUE_REASONS.map(reason => {
              const group = visibleDue.filter(p => p.due_reason === reason.key)
                .sort((a, b) => (a.priority_rank - b.priority_rank)
                  || String(a.next_step_due || '').localeCompare(String(b.next_step_due || '')));
              if (group.length === 0) return null;
              return (
                <div key={reason.key} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ ...badgeStyle(reason), fontSize: 13, padding: '4px 12px' }}>
                      {reason.label} ({group.length})
                    </span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{reason.blurb}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
                    {group.map(p => <PartnerCard key={p.id} p={p} showDueReason={false} />)}
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : view === 'funnel' ? (
        /* ============ FUNNEL / PIPELINE VIEW ============ */
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {STAGES.map(stage => {
              const count = funnelStats[stage.key] || 0;
              return (
                <div key={stage.key}
                  onClick={() => setFilterStatus(filterStatus === stage.key ? '' : stage.key)}
                  style={{
                    flex: '1 1 110px', background: filterStatus === stage.key ? stage.bg : '#fff',
                    border: `2px solid ${filterStatus === stage.key ? stage.color : '#e5e7eb'}`,
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s', minWidth: 100,
                  }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stage.color }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginTop: 2 }}>{stage.label}</div>
                </div>
              );
            })}
          </div>

          {partners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No partners found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {partners.map(p => <PartnerCard key={p.id} p={p} showDueReason={false} />)}
            </div>
          )}
        </>
      ) : (
        /* ============ TABLE VIEW ============ */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Business Name', 'Type', 'Status', 'Address', 'Contact', 'Phone', 'Email', 'Last Contact', 'Next Step', 'Due', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No partners found</td></tr>
              ) : partners.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                  onClick={() => openEdit(p)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>
                    {p.business_name}
                    {p.do_not_pitch && <span style={{ ...typeBadge, marginLeft: 6, color: '#991b1b', backgroundColor: '#fee2e2' }}>Do Not Pitch</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{TYPE_MAP[p.partner_type]?.label || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={badgeStyle(STAGE_MAP[p.status])}>{STAGE_MAP[p.status]?.label || p.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', maxWidth: 220 }}>
                    {[p.address, p.location].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{p.contact_name || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{p.contact_phone || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#2563eb' }}>{p.email || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {p.date_contacted ? formatDate(p.date_contacted) : 'Never'}
                  </td>
                  <td style={{ padding: '10px 12px', color: p.next_step ? '#374151' : '#b45309', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.next_step || 'None set'}
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: isOverdue(p.next_step_due) ? 700 : 400, color: isOverdue(p.next_step_due) ? '#dc2626' : '#6b7280' }}>
                    {p.next_step_due ? formatDate(p.next_step_due) : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <button onClick={e => { e.stopPropagation(); openLog(p); }} style={btnLog}>Log</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(p); }}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, marginLeft: 6 }} title="Delete">{'✕'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ ADD / EDIT MODAL ============ */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>{editPartner ? 'Edit Partner' : 'Add New Partner'}</h2>

            {editPartner && <NextStepLine p={editPartner} />}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: editPartner ? 16 : 0 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Business Name *</label>
                <input style={inputStyle} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Partner Type *</label>
                <select style={inputStyle} value={form.partner_type} onChange={e => setForm({ ...form, partner_type: e.target.value })}>
                  <option value="">Select a type...</option>
                  {PARTNER_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Next Step {form.do_not_pitch ? '' : '*'}</label>
                <input style={inputStyle} value={form.next_step}
                  placeholder="e.g. Call Ken Allen for an email address, then send intro"
                  onChange={e => setForm({ ...form, next_step: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Next Step Due</label>
                <input style={inputStyle} type="date" value={form.next_step_due} onChange={e => setForm({ ...form, next_step_due: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Last Contact</label>
                <input style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} type="date" value={form.date_contacted} readOnly disabled />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Set automatically when a contact is logged.</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Street Address</label>
                <input style={inputStyle} value={form.address}
                  placeholder="11905 E 124th Ave"
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>City, State, ZIP</label>
                <input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Henderson, CO 80640" />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle} value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="example.com" />
              </div>
              {form.status === 'active' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Referral Terms</label>
                  <input style={inputStyle} value={form.referral_terms}
                    placeholder="What we actually agreed to. e.g. They hand out our cards, we give their tenants 10% off winterizing"
                    onChange={e => setForm({ ...form, referral_terms: e.target.value })} />
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={form.do_not_pitch}
                    onChange={e => setForm({ ...form, do_not_pitch: e.target.checked })} />
                  Do Not Pitch
                </label>
                <div style={{ fontSize: 12, color: form.do_not_pitch ? '#b45309' : '#9ca3af', marginTop: 4 }}>
                  {form.do_not_pitch
                    ? 'This record will not appear on the Due tab at all. Find it under Pipeline or Table.'
                    : 'For dealers, mobile techs, and anyone already handled. Keeps the record, drops it off the work list.'}
                </div>
                {form.do_not_pitch && (
                  <input style={{ ...inputStyle, marginTop: 8 }} value={form.do_not_pitch_reason}
                    placeholder="Why. e.g. Dealer, we do not pitch dealers"
                    onChange={e => setForm({ ...form, do_not_pitch_reason: e.target.value })} />
                )}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            {/* ---- ACTIVITY TIMELINE (edit mode only) ---- */}
            {editPartner && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '2px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#1e3a5f' }}>Activity History</h3>
                  <button onClick={() => openLog(editPartner)} style={btnLog}>+ Log Contact</button>
                </div>

                {activitiesLoading ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 16 }}>Loading activity log...</div>
                ) : activities.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 16, fontSize: 13 }}>Nothing logged yet.</div>
                ) : (
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {activities.map(act => {
                      const aType = ACTIVITY_MAP[act.activity_type] || { icon: '📝', label: act.activity_type };
                      const outcome = OUTCOMES.find(o => o.key === act.outcome);
                      return (
                        <div key={act.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0, paddingTop: 2 }}>{aType.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{aType.label}</span>
                              {outcome && outcome.key && <span style={{ ...typeBadge }}>{outcome.label}</span>}
                              <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(act.contact_date)}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{act.summary}</div>
                            {act.next_step && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                                {'↳'} Next: {act.next_step}{act.next_step_due ? ` (due ${formatDate(act.next_step_due)})` : ''}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDeleteActivity(act.id)}
                            style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: '2px 4px' }}
                            title="Delete entry">{'✕'}</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {editPartner && (
                  <button onClick={() => { setShowModal(false); setConfirmDelete(editPartner); }}
                    style={{ ...btnSecondary, color: '#dc2626' }}>Delete Partner</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : editPartner ? 'Save Changes' : 'Add Partner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ LOG CONTACT MODAL ============ */}
      {logFor && (
        <div style={modalOverlay} onClick={() => setLogFor(null)}>
          <div style={{ ...modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: 20 }}>Log Contact</h2>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>{logFor.business_name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>What happened</label>
                <select style={inputStyle} value={contact.activity_type}
                  onChange={e => setContact({ ...contact, activity_type: e.target.value })}>
                  {ACTIVITY_TYPES.map(a => <option key={a.key} value={a.key}>{a.icon} {a.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" style={inputStyle} value={contact.contact_date}
                  onChange={e => setContact({ ...contact, contact_date: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Direction</label>
                <select style={inputStyle} value={contact.direction}
                  onChange={e => setContact({ ...contact, direction: e.target.value })}>
                  <option value="outbound">We reached out</option>
                  <option value="inbound">They reached out</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Outcome</label>
                <select style={inputStyle} value={contact.outcome}
                  onChange={e => setContact({ ...contact, outcome: e.target.value })}>
                  {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Moves the record's status on its own.</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Summary *</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={contact.summary}
                  placeholder="e.g. Left VM with front desk, asked for a callback from the manager"
                  onChange={e => setContact({ ...contact, summary: e.target.value })} />
              </div>
            </div>

            <div style={{ marginTop: 18, padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Required: what happens next
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Next Step *</label>
                <input style={inputStyle} value={contact.next_step}
                  placeholder="e.g. Call back Tuesday and ask for the rate sheet"
                  onChange={e => setContact({ ...contact, next_step: e.target.value })} />
              </div>
              <div style={{ maxWidth: 200 }}>
                <label style={labelStyle}>Due *</label>
                <input type="date" style={inputStyle} value={contact.next_step_due}
                  onChange={e => setContact({ ...contact, next_step_due: e.target.value })} />
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setLogFor(null)} style={btnSecondary}>Cancel</button>
              <button onClick={handleLogContact} disabled={!contactValid || logging}
                style={{
                  ...btnPrimary,
                  backgroundColor: contactValid ? '#059669' : '#d1d5db',
                  cursor: contactValid ? 'pointer' : 'not-allowed',
                  opacity: logging ? 0.6 : 1,
                }}
                title={contactValid ? '' : 'Fill in the summary, the next step, and its due date'}>
                {logging ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {confirmDelete && (
        <div style={modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modalBox, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{'⚠'}</div>
            <h3 style={{ margin: '0 0 8px', color: '#1e3a5f' }}>Delete Partner?</h3>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>
              Are you sure you want to delete <strong>{confirmDelete.business_name}</strong>? This cannot be undone.
              To keep the record but stop pitching it, use Do Not Pitch instead.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnSecondary}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                style={{ ...btnPrimary, backgroundColor: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
