import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import useIsMobile from '../utils/useIsMobile';

const STATUS_GROUPS = [
  {
    key: 'attention',
    label: 'Needs Attention',
    statuses: ['estimate', 'awaiting_approval', 'order_parts', 'on_hold'],
    bg: '#fff1f2', border: '#fecdd3', headerBg: '#ffe4e6', headerColor: '#9f1239',
  },
  {
    key: 'scheduling',
    label: 'Scheduling',
    statuses: ['schedule_customer', 'scheduled'],
    bg: '#f5f3ff', border: '#ddd6fe', headerBg: '#ede9fe', headerColor: '#5b21b6',
  },
  {
    key: 'active',
    label: 'Active Work',
    statuses: ['approved', 'awaiting_parts', 'in_progress'],
    bg: '#eff6ff', border: '#bfdbfe', headerBg: '#dbeafe', headerColor: '#1e40af',
  },
  {
    key: 'billing',
    label: 'Billing',
    statuses: ['complete', 'payment_pending', 'partial'],
    bg: '#fffbeb', border: '#fde68a', headerBg: '#fef3c7', headerColor: '#92400e',
  },
  {
    key: 'filed',
    label: 'Filed Estimates',
    statuses: ['filed'],
    bg: '#f8fafc', border: '#cbd5e1', headerBg: '#e2e8f0', headerColor: '#475569',
  },
  {
    key: 'closed',
    label: 'Closed',
    statuses: ['paid', 'void'],
    bg: '#f9fafb', border: '#e5e7eb', headerBg: '#f3f4f6', headerColor: '#6b7280',
  },
];

const STATUS_LABELS = {
  '': 'All Statuses',
  estimate: 'Estimate',
  approved: 'Not Started',
  schedule_customer: 'Schedule Customer',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  order_parts: 'Order Parts',
  awaiting_parts: 'Awaiting Parts',
  awaiting_approval: 'Awaiting Approval',
  complete: 'Complete',
  payment_pending: 'Payment Pending',
  partial: 'Partial Payment',
  paid: 'Paid',
  on_hold: 'On Hold',
  void: 'Void',
  filed: 'File Estimate',
};

export default function RecordList() {
  const { canSeeFinancials, canEditRecords, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({ closed: true, filed: true });
  const [groupSort, setGroupSort] = useState({}); // { groupKey: { field, dir } }
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [leads, setLeads] = useState([]);
  const showLeads = canEditRecords || isAdmin;
  // File-lead modal: the lead being filed (null = closed) + customer search state
  const [fileLeadTarget, setFileLeadTarget] = useState(null);
  const [logCallFor, setLogCallFor] = useState(null);
  const [logCallDate, setLogCallDate] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      // When no filter, fetch large batch for grouping
      const params = { page, limit: statusFilter || search ? 50 : 500 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getRecords(params);
      setRecords(data.records);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const fetchLeads = useCallback(async () => {
    if (!showLeads) return;
    try {
      const data = await api.getLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  }, [showLeads]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Debounced customer search for the File-lead modal
  useEffect(() => {
    if (!fileLeadTarget) return;
    const term = customerSearch.trim();
    if (!term) { setCustomerResults([]); return; }
    setCustomerSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await api.getCustomers({ search: term, limit: 20 });
        setCustomerResults(Array.isArray(data.customers) ? data.customers : []);
      } catch (err) {
        console.error('Customer search failed:', err);
        setCustomerResults([]);
      } finally {
        setCustomerSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch, fileLeadTarget]);

  const setLeadStatus = async (leadId, status) => {
    try {
      await api.updateLead(leadId, { status });
      fetchLeads();
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  const logLeadContact = async (lead, dateStr) => {
    try {
      const when = dateStr ? new Date(dateStr + 'T12:00:00').toISOString() : new Date().toISOString();
      await api.updateLead(lead.id, { status: 'contacted', contacted_at: when });
      setLogCallFor(null);
      fetchLeads();
    } catch (err) {
      console.error('Failed to log contact:', err);
    }
  };

  const scheduleLead = async (lead, leadName) => {
    try {
      await api.updateLead(lead.id, { status: 'scheduled' });
      navigate('/schedule/new', { state: {
        customerId: lead.customer_id,
        customerName: leadName,
        customerPhone: lead.phone,
        customerEmail: lead.email,
      } });
    } catch (err) {
      console.error('Failed to schedule lead:', err);
      fetchLeads();
    }
  };

  const buildEstimateFromLead = async (lead) => {
    try {
      const r = await api.createEstimateFromLead(lead.id);
      navigate(`/records/${r.record_id}`);
    } catch (err) {
      console.error('Failed to build estimate from lead:', err);
    }
  };

  const removeLead = async (lead) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    try {
      await api.deleteLead(lead.id);
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const openLeadRecord = (lead) => {
    if (!lead.record_id) return;
    navigate(`/records/${lead.record_id}`);
  };

  const addLeadToWaitlist = (lead) => {
    const name = lead.name || [lead.customer_first, lead.customer_last].filter(Boolean).join(' ') || 'Unknown';
    navigate('/storage', { state: { addWaitlistFromLead: {
      leadId: lead.id,
      contactName: name,
      contactPhone: lead.phone || '',
      contactEmail: lead.email || '',
      message: lead.message || '',
    } } });
  };

  const openFileLead = (lead) => {
    setFileLeadTarget(lead);
    setCustomerSearch(lead.name || [lead.customer_first, lead.customer_last].filter(Boolean).join(' ') || '');
    setCustomerResults([]);
  };

  const closeFileLead = () => {
    setFileLeadTarget(null);
    setCustomerSearch('');
    setCustomerResults([]);
  };

  const submitFileLead = async (customerId) => {
    if (!fileLeadTarget) return;
    try {
      await api.fileLead(fileLeadTarget.id, customerId ? { customer_id: customerId } : {});
      closeFileLead();
      fetchLeads();
    } catch (err) {
      console.error('Failed to file lead:', err);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const toggleGroup = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isGrouped = !statusFilter && !search;

  const formatDate = (val) => {
    if (!val) return '—';
    const s = String(val);
    // Pull the YYYY-MM-DD prefix directly so a DATE column serialized to JSON
    // as "2026-05-29T00:00:00.000Z" still displays as 5/29 instead of 5/28
    // (which is what JS gives you when it parses that as UTC and renders in
    // Mountain Time).
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${parseInt(m[2])}/${parseInt(m[3])}/${m[1]}`;
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const isPastDue = (r) => {
    if (!r.expected_completion_date) return false;
    if (['complete', 'paid', 'void', 'filed'].includes(r.status)) return false;
    const due = new Date(r.expected_completion_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const renderRow = (r, showDueDate = false, showPaidDate = false) => (
    <tr key={r.id} onClick={() => navigate(`/records/${r.id}`)} style={{ cursor: 'pointer' }}>
      <td style={tdStyle}><strong>{r.record_number}</strong></td>
      <td style={tdStyle}>
        {r.last_name}{r.first_name ? `, ${r.first_name}` : ''}
        {r.company_name ? <span style={{ color: '#666', marginLeft: '6px' }}>({r.company_name})</span> : ''}
      </td>
      <td style={tdStyle}>
        {[r.year, r.make, r.model].filter(Boolean).join(' ') || '—'}
      </td>
      <td style={tdStyle}><StatusBadge status={r.status} /></td>
      <td style={tdStyle}>{formatDate(r.intake_date || r.created_at)}</td>
      {showDueDate && (
        <td style={{ ...tdStyle, color: isPastDue(r) ? '#dc2626' : undefined, fontWeight: isPastDue(r) ? 600 : undefined }}>
          {formatDate(r.expected_completion_date)}
        </td>
      )}
      {showPaidDate && (
        <td style={tdStyle}>{formatDate(r.last_payment_date)}</td>
      )}
      {canSeeFinancials && (
        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(['paid', 'void'].includes(r.status) ? r.total_collected : r.amount_due)}
        </td>
      )}
    </tr>
  );

  const handleGroupSort = (groupKey, field) => {
    setGroupSort(prev => {
      const cur = prev[groupKey];
      if (cur?.field === field) {
        return { ...prev, [groupKey]: { field, dir: cur.dir === 'asc' ? 'desc' : 'asc' } };
      }
      return { ...prev, [groupKey]: { field, dir: field === 'expected_completion_date' ? 'asc' : 'desc' } };
    });
  };

  // Closed records default to most-recently-paid first (nulls last)
  const effectiveSort = (groupKey) =>
    groupSort[groupKey] || (groupKey === 'closed' ? { field: 'last_payment_date', dir: 'desc' } : null);

  // Default ordering for the Active Work group: surface what to work on next.
  // 1) workable jobs (in progress, not started) above jobs blocked on parts,
  // 2) within each, overdue / soonest due date first (no due date last),
  // 3) tie-break by status (in progress > not started > order parts > awaiting parts),
  // 4) then newest work order first.
  const ACTIVE_RANK = { in_progress: 0, approved: 1, order_parts: 2, awaiting_parts: 3 };
  const isBlocked = (s) => s === 'order_parts' || s === 'awaiting_parts';
  const smartActiveSort = (recs) => [...recs].sort((a, b) => {
    const ba = isBlocked(a.status) ? 1 : 0;
    const bb = isBlocked(b.status) ? 1 : 0;
    if (ba !== bb) return ba - bb;
    const da = a.expected_completion_date ? new Date(a.expected_completion_date).getTime() : Infinity;
    const db = b.expected_completion_date ? new Date(b.expected_completion_date).getTime() : Infinity;
    if (da !== db) return da - db;
    const ra = ACTIVE_RANK[a.status] ?? 9;
    const rb = ACTIVE_RANK[b.status] ?? 9;
    if (ra !== rb) return ra - rb;
    return (parseFloat(b.record_number) || 0) - (parseFloat(a.record_number) || 0);
  });

  const sortGroupRecords = (recs, groupKey) => {
    const sort = effectiveSort(groupKey);
    if (!sort) return groupKey === 'active' ? smartActiveSort(recs) : recs;
    const { field, dir } = sort;
    return [...recs].sort((a, b) => {
      let va = a[field], vb = b[field];
      if (field === 'expected_completion_date' || field === 'created_at' || field === 'last_payment_date') {
        va = va ? new Date(va).getTime() : (dir === 'asc' ? Infinity : -Infinity);
        vb = vb ? new Date(vb).getTime() : (dir === 'asc' ? Infinity : -Infinity);
      } else if (field === 'record_number' || field === 'amount_due' || field === 'total_collected') {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      } else {
        va = (va || '').toString().toLowerCase();
        vb = (vb || '').toString().toLowerCase();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortArrow = (groupKey, field) => {
    const sort = effectiveSort(groupKey);
    if (!sort || sort.field !== field) return '';
    return sort.dir === 'asc' ? ' \u25B2' : ' \u25BC';
  };

  const renderMobileCard = (r, showPaidDate = false) => (
    <div key={r.id} className="mobile-record-card" onClick={() => navigate(`/records/${r.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <strong style={{ fontSize: '0.9rem', color: '#1e3a5f' }}>WO #{r.record_number}</strong>
        <StatusBadge status={r.status} />
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
        {r.last_name}{r.first_name ? `, ${r.first_name}` : ''}
        {r.company_name ? <span style={{ color: '#666', fontWeight: 400, marginLeft: '6px' }}>({r.company_name})</span> : ''}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
        {[r.year, r.make, r.model].filter(Boolean).join(' ') || 'No unit'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
        <span>{showPaidDate ? `Paid ${formatDate(r.last_payment_date)}` : formatDate(r.intake_date || r.created_at)}</span>
        {canSeeFinancials && <span style={{ fontWeight: 600, color: '#374151' }}>{formatCurrency(['paid', 'void'].includes(r.status) ? r.total_collected : r.amount_due)}</span>}
      </div>
    </div>
  );

  const renderTableHead = (showDueDate = false, groupKey = null, showPaidDate = false) => {
    const sortable = groupKey ? { cursor: 'pointer', userSelect: 'none' } : {};
    const onClick = (field) => groupKey ? () => handleGroupSort(groupKey, field) : undefined;
    return (
      <thead>
        <tr>
          <th style={{ ...thStyle, ...sortable }} onClick={onClick('record_number')}>WO #{sortArrow(groupKey, 'record_number')}</th>
          <th style={{ ...thStyle, ...sortable }} onClick={onClick('last_name')}>Customer{sortArrow(groupKey, 'last_name')}</th>
          <th style={thStyle}>Unit</th>
          <th style={{ ...thStyle, ...sortable }} onClick={onClick('status')}>Status{sortArrow(groupKey, 'status')}</th>
          <th style={{ ...thStyle, ...sortable }} onClick={onClick('intake_date')}>Intake Date{sortArrow(groupKey, 'intake_date')}</th>
          {showDueDate && <th style={{ ...thStyle, ...sortable }} onClick={onClick('expected_completion_date')}>Due Date{sortArrow(groupKey, 'expected_completion_date')}</th>}
          {showPaidDate && <th style={{ ...thStyle, ...sortable }} onClick={onClick('last_payment_date')}>Paid Date{sortArrow(groupKey, 'last_payment_date')}</th>}
          {canSeeFinancials && (
            showPaidDate
              ? <th style={{ ...thStyle, ...sortable, textAlign: 'right' }} onClick={onClick('total_collected')}>Amount Paid{sortArrow(groupKey, 'total_collected')}</th>
              : <th style={{ ...thStyle, ...sortable, textAlign: 'right' }} onClick={onClick('amount_due')}>Amount Due{sortArrow(groupKey, 'amount_due')}</th>
          )}
        </tr>
      </thead>
    );
  };

  return (
    <div>
      <div className={isMobile ? 'page-header' : ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Records</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isMobile && (
            <button onClick={() => navigate('/reports/active-workorders')} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              Print Work Orders
            </button>
          )}
          {canEditRecords && !isMobile && (
            <button onClick={() => navigate('/records/new')} style={btnPrimary}>
              + New Record
            </button>
          )}
        </div>
      </div>

      {/* Leads */}
      {showLeads && (() => {
        const PIPELINE = ['new', 'contacted', 'scheduled'];
        const visibleLeads = leads.filter(l => PIPELINE.includes(l.status));
        const activeCount = leads.filter(l => PIPELINE.includes(l.status)).length;
        if (visibleLeads.length === 0) return null;
        const leadName = (l) => l.name || [l.customer_first, l.customer_last].filter(Boolean).join(' ') || 'Unknown';
        const leadEmailHref = (l) => {
          const first = (l.customer_first || (l.name || '').trim().split(/\s+/)[0] || 'there');
          const subject = 'Re: Your request to Master Tech RV Repair & Storage';
          const when = l.created_at ? new Date(l.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : '';
          const quoted = (l.message || '(no message on file)').split('\n').map((ln) => '> ' + ln).join('\n');
          const body = [
            `Hi ${first},`, '',
            'Thank you for reaching out to Master Tech RV Repair & Storage.', '', '',
            '-----------------------------------------',
            when ? `On ${when} you wrote:` : 'Your original request:',
            quoted,
          ].join('\n');
          return `https://mail.google.com/mail/?view=cm&fs=1&authuser=service@mastertechrvrepair.com&to=${encodeURIComponent(l.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        };
        const STATUS_LABEL = { new: 'New', contacted: 'Contacted', scheduled: 'Scheduled', converted: 'Converted' };
        const pillColors = (status) => {
          if (status === 'new') return { bg: '#bbf7d0', fg: '#166534' };
          if (status === 'contacted') return { bg: '#fde68a', fg: '#92400e' };
          if (status === 'scheduled') return { bg: '#bfdbfe', fg: '#1e40af' };
          return { bg: '#e5e7eb', fg: '#374151' };
        };
        const actionBtn = (extra) => ({
          padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600,
          border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151',
          ...extra,
        });
        return (
          <div style={{ borderRadius: '8px', border: '1px solid #bbf7d0', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              padding: '10px 16px', backgroundColor: '#dcfce7', color: '#166534',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 700, fontSize: '0.875rem',
            }}>
              <span>Leads</span>
              <span style={{
                backgroundColor: '#166534', color: '#fff', borderRadius: '999px',
                padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
              }}>{activeCount}</span>
            </div>
            <div style={{ backgroundColor: '#f0fdf4' }}>
              {visibleLeads.map((l) => {
                const pc = pillColors(l.status);
                return (
                <div key={l.id} style={{
                  padding: '12px 16px', borderTop: '1px solid #dcfce7',
                  display: 'flex', flexWrap: 'wrap', gap: '12px',
                  alignItems: 'flex-start', justifyContent: 'space-between',
                }}>
                  <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700 }}>{leadName(l)}</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '1px 6px', borderRadius: '4px',
                        backgroundColor: pc.bg, color: pc.fg,
                      }}>{STATUS_LABEL[l.status] || l.status}</span>
                      {l.source && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>via {l.source}</span>
                      )}
                      {l.record_number && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>WO #{l.record_number}</span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(l.created_at)}</span>
                      {l.contacted_at && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Contacted {formatDate(l.contacted_at)}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#374151', marginTop: '4px' }}>
                      {[l.phone, l.email].filter(Boolean).join(' \u00b7 ') || '\u2014'}
                    </div>
                    {l.message && (
                      <div style={{
                        fontSize: '0.8125rem', color: '#4b5563', marginTop: '4px',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }} title={l.message}>{l.message}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {l.phone && (
                      <a href={`tel:${(l.phone || '').replace(/\D/g, '')}`} style={{ ...actionBtn({ border: '1px solid #2563eb', color: '#2563eb' }), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Call</a>
                    )}
                    {l.email && (
                      <a href={leadEmailHref(l)} target="_blank" rel="noopener noreferrer" style={{ ...actionBtn({ border: '1px solid #2563eb', color: '#2563eb' }), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Email</a>
                    )}
                    {logCallFor === l.id ? (
                      <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        <input type="date" value={logCallDate} onChange={(e) => setLogCallDate(e.target.value)} style={{ fontSize: '0.75rem', padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                        <button onClick={() => logLeadContact(l, logCallDate)} style={actionBtn({ border: '1px solid #166534', backgroundColor: '#166534', color: '#fff' })}>Save</button>
                        <button onClick={() => setLogCallFor(null)} style={actionBtn({})}>Cancel</button>
                      </span>
                    ) : (
                      <button onClick={() => { setLogCallFor(l.id); setLogCallDate(new Date().toISOString().slice(0, 10)); }}
                        style={actionBtn({ border: '1px solid #166534', color: '#166534' })}
                      >Log Call</button>
                    )}
                    <button onClick={() => scheduleLead(l, leadName(l))}
                      style={actionBtn({ border: '1px solid #2563eb', backgroundColor: l.status === 'scheduled' ? '#2563eb' : '#fff', color: l.status === 'scheduled' ? '#fff' : '#2563eb' })}
                    >Schedule</button>
                    <button onClick={() => addLeadToWaitlist(l)}
                      style={actionBtn({ border: '1px solid #0d9488', color: '#0d9488' })}
                    >Add to Waitlist</button>
                    <button onClick={() => buildEstimateFromLead(l)}
                      style={actionBtn({ border: '1px solid #16a34a', color: '#16a34a' })}
                    >Build Estimate</button>
                    <button onClick={() => openFileLead(l)} style={actionBtn({ border: '1px solid #6b7280', color: '#374151' })}>File</button>
                    <button onClick={() => removeLead(l)}
                      style={actionBtn({ border: '1px solid #dc2626', color: '#dc2626' })}
                    >Delete</button>
                    {l.record_id && (
                      <button onClick={() => openLeadRecord(l)}
                        style={actionBtn({ padding: '5px 12px', fontWeight: 700, border: '1px solid #16a34a', backgroundColor: '#16a34a', color: '#fff' })}
                      >Open Record</button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by WO#, customer, description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: '100%', marginBottom: isMobile ? '8px' : '0' }}
        />
        {isMobile ? (
          <div className="mobile-status-pills" style={{ marginTop: '8px' }}>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <button
                key={val}
                className={`mobile-status-pill${statusFilter === val ? ' active' : ''}`}
                onClick={() => { setStatusFilter(val); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ ...inputStyle, marginLeft: '12px' }}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No records found</div>
      ) : isGrouped ? (
        /* ─── Grouped View ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {STATUS_GROUPS.map(group => {
            const groupRecords = records.filter(r => group.statuses.includes(r.status));
            if (groupRecords.length === 0) return null;
            const isCollapsed = collapsed[group.key];

            return (
              <div key={group.key} style={{ borderRadius: '8px', border: `1px solid ${group.border}`, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer',
                    backgroundColor: group.headerBg, color: group.headerColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontWeight: 700, fontSize: '0.875rem', textAlign: 'left',
                  }}
                >
                  <span>
                    {isCollapsed ? '\u25B6' : '\u25BC'} {group.label}
                    <span style={{
                      marginLeft: '8px', padding: '2px 8px', borderRadius: '9999px',
                      backgroundColor: group.headerColor, color: '#fff',
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {groupRecords.length}
                    </span>
                  </span>
                </button>
                {!isCollapsed && (
                  <div style={{ backgroundColor: group.bg, padding: isMobile ? '8px' : 0 }}>
                    {isMobile ? (
                      sortGroupRecords(groupRecords, group.key).map(r => renderMobileCard(r, group.key === 'closed'))
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        {renderTableHead(!['closed', 'filed'].includes(group.key), group.key, group.key === 'closed')}
                        <tbody>
                          {sortGroupRecords(groupRecords, group.key).map(r => renderRow(r, !['closed', 'filed'].includes(group.key), group.key === 'closed'))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Flat View (filtered/searched) ─── */
        isMobile ? (
          <div>{records.map(r => renderMobileCard(r))}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              {renderTableHead(false)}
              <tbody>
                {records.map(r => renderRow(r, false))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pagination — only for flat view */}
      {!isGrouped && total > 50 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnSecondary}>Previous</button>
          <span style={{ padding: '8px', color: '#666' }}>Page {page} of {Math.ceil(total / 50)}</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} style={btnSecondary}>Next</button>
        </div>
      )}

      {/* File Lead modal — pick an existing customer to file under, or file as-is */}
      {fileLeadTarget && (
        <div
          onClick={closeFileLead}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '40px 16px', zIndex: 1000, overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: '10px', width: '100%',
              maxWidth: '560px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column', maxHeight: '80vh',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#1e3a5f' }}>
                File Lead — {fileLeadTarget.name || [fileLeadTarget.customer_first, fileLeadTarget.customer_last].filter(Boolean).join(' ') || 'Unknown'}
              </h3>
              <div style={{ fontSize: '0.8125rem', color: '#4b5563', marginTop: '6px' }}>
                {[fileLeadTarget.phone, fileLeadTarget.email].filter(Boolean).join(' · ') || '—'}
              </div>
              {fileLeadTarget.message && (
                <div style={{ fontSize: '0.8125rem', color: '#4b5563', marginTop: '4px' }}>
                  {fileLeadTarget.message}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                Currently attached to:{' '}
                <strong>
                  {[fileLeadTarget.customer_first, fileLeadTarget.customer_last].filter(Boolean).join(' ') || 'a new/auto-created customer'}
                </strong>
              </div>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Search for the customer to file under
              </label>
              <input
                type="text"
                autoFocus
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Name, account #, phone, or email"
                style={{ ...inputStyle, width: '100%', marginTop: '6px', boxSizing: 'border-box' }}
              />

              <div style={{ marginTop: '12px' }}>
                {customerSearchLoading && (
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', padding: '8px 0' }}>Searching…</div>
                )}
                {!customerSearchLoading && customerSearch.trim() && customerResults.length === 0 && (
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', padding: '8px 0' }}>No matching customers.</div>
                )}
                {customerResults.map((c) => {
                  const cname = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.company_name || 'Unknown';
                  return (
                    <div
                      key={c.id}
                      onClick={() => submitFileLead(c.id)}
                      style={{
                        padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px',
                        marginBottom: '6px', cursor: 'pointer', backgroundColor: '#f9fafb',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {cname}
                        {c.account_number && (
                          <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '8px', fontSize: '0.8125rem' }}>
                            #{c.account_number}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '2px' }}>
                        {[c.phone_primary, c.email_primary].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e5e7eb',
              display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap',
            }}>
              <button onClick={closeFileLead} style={btnSecondary}>Cancel</button>
              <button onClick={() => submitFileLead(null)} style={btnPrimary}>
                File to current/new customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile floating action button */}
      {canEditRecords && (
        <button className="mobile-fab" onClick={() => navigate('/records/new')}>+</button>
      )}
    </div>
  );
}

// Styles
const inputStyle = {
  padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.875rem', outline: 'none',
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const tableStyle = {
  width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff',
  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
const thStyle = {
  textAlign: 'left', padding: '10px 16px', backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em',
};
const tdStyle = {
  padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem',
};
