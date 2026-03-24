import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const STATUS_GROUPS = [
  {
    key: 'attention',
    label: 'Needs Attention',
    statuses: ['estimate', 'awaiting_approval', 'on_hold'],
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
    statuses: ['approved', 'in_progress', 'awaiting_parts'],
    bg: '#eff6ff', border: '#bfdbfe', headerBg: '#dbeafe', headerColor: '#1e40af',
  },
  {
    key: 'billing',
    label: 'Billing',
    statuses: ['complete', 'payment_pending', 'partial'],
    bg: '#fffbeb', border: '#fde68a', headerBg: '#fef3c7', headerColor: '#92400e',
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
  awaiting_parts: 'Awaiting Parts',
  awaiting_approval: 'Awaiting Approval',
  complete: 'Complete',
  payment_pending: 'Payment Pending',
  partial: 'Partial Payment',
  paid: 'Paid',
  on_hold: 'On Hold',
  void: 'Void',
};

export default function RecordList() {
  const { canSeeFinancials, canEditRecords } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({ closed: true });
  const navigate = useNavigate();

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
    const d = new Date(val);
    return isNaN(d.getTime()) ? '—' : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const isPastDue = (r) => {
    if (!r.expected_completion_date) return false;
    if (['complete', 'paid', 'void'].includes(r.status)) return false;
    const due = new Date(r.expected_completion_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const renderRow = (r, showDueDate = false) => (
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
      {showDueDate && (
        <td style={{ ...tdStyle, color: isPastDue(r) ? '#dc2626' : undefined, fontWeight: isPastDue(r) ? 600 : undefined }}>
          {formatDate(r.expected_completion_date)}
        </td>
      )}
      {canSeeFinancials && (
        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
          {formatCurrency(r.amount_due)}
        </td>
      )}
    </tr>
  );

  const renderTableHead = (showDueDate = false) => (
    <thead>
      <tr>
        <th style={thStyle}>WO #</th>
        <th style={thStyle}>Customer</th>
        <th style={thStyle}>Unit</th>
        <th style={thStyle}>Status</th>
        {showDueDate && <th style={thStyle}>Due Date</th>}
        {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Amount Due</th>}
      </tr>
    </thead>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Records</h1>
        {canEditRecords && (
          <button onClick={() => navigate('/records/new')} style={btnPrimary}>
            + New Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by WO#, customer, description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={inputStyle}
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
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
                  <div style={{ backgroundColor: group.bg }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      {renderTableHead(group.key === 'active')}
                      <tbody>
                        {groupRecords.map(r => renderRow(r, group.key === 'active'))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── Flat View (filtered/searched) ─── */
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            {renderTableHead(false)}
            <tbody>
              {records.map(r => renderRow(r, false))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination — only for flat view */}
      {!isGrouped && total > 50 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnSecondary}>Previous</button>
          <span style={{ padding: '8px', color: '#666' }}>Page {page} of {Math.ceil(total / 50)}</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} style={btnSecondary}>Next</button>
        </div>
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
