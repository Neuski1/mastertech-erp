import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

const STATUS_STYLES = {
  in_progress: { label: 'IN PROGRESS', bg: '#d4f5e2', color: '#1a7a4a' },
  awaiting_parts: { label: 'AWAITING PARTS', bg: '#fee2e2', color: '#991b1b' },
  approved: { label: 'NOT STARTED', bg: '#dbeafe', color: '#1e3a5f' },
  estimate: { label: 'ESTIMATE', bg: '#fef3c7', color: '#92400e' },
  on_hold: { label: 'ON HOLD', bg: '#f3f4f6', color: '#6b7280' },
};

const ACTIVE_STATUSES = ['in_progress', 'awaiting_parts', 'approved'];
const ATTENTION_STATUSES = ['estimate', 'on_hold'];

function fmtCurrency(val) {
  const n = parseFloat(val) || 0;
  if (n === 0) return '\u2014';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isPastDue(record) {
  if (!record.expected_completion_date) return false;
  if (record.status === 'awaiting_parts') return false;
  return new Date(record.expected_completion_date) < new Date(new Date().toDateString());
}

function sortRecords(records) {
  return records.sort((a, b) => {
    const aDate = a.expected_completion_date ? new Date(a.expected_completion_date).getTime() : Infinity;
    const bDate = b.expected_completion_date ? new Date(b.expected_completion_date).getTime() : Infinity;
    if (aDate !== bDate) return aDate - bDate;
    return (a.record_number || 0) - (b.record_number || 0);
  });
}

function getWorkLines(desc) {
  if (!desc) return [];
  return desc.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5);
}

export default function ActiveWorkOrdersReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the main nav while this report is mounted
    const nav = document.querySelector('nav') || document.querySelector('header');
    if (nav) nav.style.display = 'none';
    return () => {
      if (nav) nav.style.display = '';
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getRecords({ page: 1, limit: 500 });
        setRecords(data.records || []);
      } catch (err) {
        console.error('Failed to load records:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeRecords = sortRecords(records.filter(r => ACTIVE_STATUSES.includes(r.status)));
  const attentionRecords = sortRecords(records.filter(r => ATTENTION_STATUSES.includes(r.status)));
  const allActive = [...activeRecords, ...attentionRecords];
  const pastDueCount = allActive.filter(isPastDue).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const countByStatus = (status) => allActive.filter(r => r.status === status).length;

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>Loading report...</div>;
  }

  return (
    <div>
      {/* Print Toolbar — hidden on print */}
      <div className="no-print" style={toolbarStyle}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Active Work Orders Report</span>
        <button onClick={() => window.print()} style={printBtnStyle}>Print / Save PDF</button>
      </div>

      {/* Report Header */}
      <div style={headerStyle}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Active Work Orders</div>
          <div style={{ fontSize: '12px', color: '#93c5fd' }}>Master Tech RV &middot; Technician Priority Sheet</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Printed: {today}</div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginTop: '4px' }}>Total Active: {allActive.length} work orders</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={statsBarStyle}>
        <StatBlock label="Total Active" value={allActive.length} color="#1e3a5f" />
        <StatDivider />
        <StatBlock label="In Progress" value={countByStatus('in_progress')} color="#1a7a4a" />
        <StatDivider />
        <StatBlock label="Not Started" value={countByStatus('approved')} color="#1e3a5f" />
        <StatDivider />
        <StatBlock label="Awaiting Parts" value={countByStatus('awaiting_parts')} color="#991b1b" />
        <StatDivider />
        <StatBlock label="Needs Attention" value={attentionRecords.length} color="#c0392b" />
        {pastDueCount > 0 && (
          <>
            <StatDivider />
            <StatBlock label="Past Due" value={pastDueCount} color="#dc2626" />
          </>
        )}
      </div>

      {/* Active Work Section */}
      <Section title="Active Work" count={activeRecords.length} color="#2c3e70" records={activeRecords} />

      {/* Needs Attention Section */}
      {attentionRecords.length > 0 && (
        <Section title="Needs Attention" count={attentionRecords.length} color="#c0392b" records={attentionRecords} />
      )}

      {/* Footer */}
      <div style={footerStyle}>
        <span>Master Tech RV ERP &middot; Active Work Orders</span>
        <span>Generated: {new Date().toLocaleDateString()} &middot; {allActive.length} records</span>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print, nav, header { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          tr { page-break-inside: avoid; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, count, color, records }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ ...sectionHeaderStyle, borderLeftColor: color }}>
        <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color }}>
          {title}
        </span>
        <span style={{ ...pillStyle, backgroundColor: color }}>{count}</span>
      </div>
      <table style={{ ...tableStyle, tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '60px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '155px' }} />
          <col style={{ width: '110px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ minWidth: '240px' }} />
          <col style={{ width: '75px' }} />
          <col style={{ width: '36px' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'center' }}>WO #</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Unit</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Due Date</th>
            <th style={thStyle}>Work Description</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Amt Due</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>{'\u2713'}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => {
            const s = STATUS_STYLES[r.status] || { label: r.status, bg: '#f3f4f6', color: '#333' };
            const pastDue = isPastDue(r);
            const lines = getWorkLines(r.job_description);
            const rowBg = i % 2 === 0 ? '#fff' : '#f8f9fc';

            return (
              <tr key={r.id} style={{ backgroundColor: rowBg }}>
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>#{r.record_number}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>
                    {r.last_name}{r.first_name ? `, ${r.first_name}` : ''}
                    {!r.last_name && r.company_name ? r.company_name : ''}
                  </div>
                  {r.company_name && r.last_name && <div style={{ fontSize: '10px', color: '#6b7280' }}>{r.company_name}</div>}
                  {r.is_insurance_job && (
                    <div style={{ fontSize: '9px', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>&#9873; INSURANCE</div>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontSize: '12px' }}>{[r.year, r.make, r.model].filter(Boolean).join(' ') || '\u2014'}</div>
                  {r.vin && <div style={{ fontSize: '9px', color: '#9ca3af' }}>{r.vin}</div>}
                </td>
                <td style={tdStyle}>
                  <span style={{ ...statusPillStyle, backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                </td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: pastDue ? '#dc2626' : '#374151', fontWeight: pastDue ? 700 : 400 }}>
                  {fmtDate(r.expected_completion_date)}
                  {pastDue && ' \u26A0'}
                </td>
                <td style={tdStyle}>
                  {lines.length > 0 ? lines.map((l, j) => (
                    <div key={j} style={{ fontSize: '11px', color: '#374151', lineHeight: 1.4 }}>
                      {l.replace(/^[\u2022\-\*]\s*/, '\u2022 ')}
                    </div>
                  )) : <span style={{ color: '#d1d5db' }}>\u2014</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>{fmtCurrency(r.amount_due)}</td>
                <td style={{ ...tdStyle, textAlign: 'center', fontSize: '16px', color: '#d1d5db' }}>{'\u2610'}</td>
              </tr>
            );
          })}
          {records.length === 0 && (
            <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No records</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function StatDivider() {
  return <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const toolbarStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 24px', backgroundColor: '#1a2a4a',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const printBtnStyle = {
  padding: '8px 20px', backgroundColor: '#22c55e', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.875rem',
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '20px 24px', backgroundColor: '#1a2a4a',
  marginBottom: '0',
};

const statsBarStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
  padding: '14px 24px', backgroundColor: '#f3f4f6',
  borderBottom: '1px solid #e5e7eb', marginBottom: '20px',
};

const sectionHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 16px', borderLeft: '4px solid',
  backgroundColor: '#f9fafb', marginBottom: '0',
};

const pillStyle = {
  display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
  color: '#fff', fontSize: '11px', fontWeight: 700,
};

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '0' };

const thStyle = {
  padding: '8px 10px', backgroundColor: '#2c3e70', color: '#fff',
  fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.04em', borderBottom: '2px solid #1a2a4a',
};

const tdStyle = {
  padding: '8px 10px', borderBottom: '1px solid #e5e7eb',
  fontSize: '12px', verticalAlign: 'top',
};

const statusPillStyle = {
  display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
  fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
};

const footerStyle = {
  display: 'flex', justifyContent: 'space-between',
  padding: '12px 24px', borderTop: '1px solid #d1d5db',
  fontSize: '10px', color: '#9ca3af', marginTop: '12px',
};
