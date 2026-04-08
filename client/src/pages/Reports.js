import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

function getMonthRange(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

function getYearRange(offset = 0) {
  const y = new Date().getFullYear() + offset;
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

const METHOD_LABELS = { credit_card: 'Credit Card', check: 'Check', cash: 'Cash', zelle: 'Zelle' };

export default function Reports() {
  const thisMonth = getMonthRange(0);
  const [from, setFrom] = useState(thisMonth.from);
  const [to, setTo] = useState(thisMonth.to);
  const [report, setReport] = useState(null);
  const [techReport, setTechReport] = useState(null);
  const [contractorReport, setContractorReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fmtCur = (v) => parseFloat(v || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const runReport = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, techData, contractorData] = await Promise.all([
        api.getFinancialReport({ from, to }),
        api.getTechProfitability({ from, to }).catch(() => null),
        api.getContractorProfitability({ from, to }).catch(() => null),
      ]);
      setReport(data);
      setTechReport(techData);
      setContractorReport(contractorData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runReport(); }, []); // eslint-disable-line

  const quickSelect = (range) => {
    setFrom(range.from);
    setTo(range.to);
  };

  const r = report?.revenue;
  // Subtotal = sum of line items (labor + parts + freight + shop supplies)
  // Not derived from grossRevenue which may differ for Summit-imported records
  const subtotal = r ? r.labor + r.parts + r.misc + r.shopSupplies : 0;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Financial Reports</h1>
        <a href="/reports/active-workorders" style={{ padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
          Active Work Orders
        </a>
      </div>

      {/* Date range selector */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={runReport} disabled={loading} style={btnPrimary}>
            {loading ? 'Loading...' : 'Run Report'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => quickSelect(getMonthRange(0))} style={btnQuick}>This Month</button>
          <button onClick={() => quickSelect(getMonthRange(-1))} style={btnQuick}>Last Month</button>
          <button onClick={() => quickSelect(getYearRange(0))} style={btnQuick}>This Year</button>
          <button onClick={() => quickSelect(getYearRange(-1))} style={btnQuick}>Last Year</button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}

      {report && (
        <>
          {/* Revenue Summary */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Revenue Summary</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 12px' }}>
              {new Date(from + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {new Date(to + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <table style={tableStyle}>
              <tbody>
                <Row label="Labor" value={fmtCur(r.labor)} />
                <Row label="Parts" value={fmtCur(r.parts)} />
                <Row label="Miscellaneous / Freight" value={fmtCur(r.misc)} />
                <Row label="Shop Supplies" value={fmtCur(r.shopSupplies)} />
                <Row label="SUBTOTAL (before tax/fees)" value={fmtCur(subtotal)} bold border />
                <Row label="Sales Tax" value={fmtCur(r.tax)} indent />
                <Row label="Credit Card Fees (3%)" value={fmtCur(r.ccFees)} indent />
                <Row label="TOTAL SERVICE REVENUE" value={fmtCur(r.grossRevenue)} bold border />
                <Row label="Storage Revenue" value={fmtCur(report.storage.total)} />
                <Row label="GRAND TOTAL" value={fmtCur(r.grossRevenue + report.storage.total)} bold border color="#065f46" />
              </tbody>
            </table>
          </div>

          {/* Work Order Activity */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Work Order Activity</h2>
            <table style={tableStyle}>
              <tbody>
                <Row label="Total Work Orders" value={report.workOrders.total} />
                <Row label="Completed / Paid" value={report.workOrders.paid} />
                <Row label="Open / In Progress" value={report.workOrders.open} />
                <Row label="Average Invoice" value={fmtCur(r.avgInvoice)} />
                <Row label="Largest Invoice" value={fmtCur(r.maxInvoice)} />
              </tbody>
            </table>
          </div>

          {/* Payment Methods */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Payment Methods</h2>
            <table style={tableStyle}>
              <tbody>
                {report.payments.map(p => (
                  <Row key={p.method} label={METHOD_LABELS[p.method] || p.method} value={`${fmtCur(p.total)}  (${p.percent}%)`} />
                ))}
                <Row label="TOTAL PAYMENTS" value={fmtCur(report.totalPayments)} bold border />
              </tbody>
            </table>
          </div>

          {/* Storage Revenue */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Storage Revenue</h2>
            <table style={tableStyle}>
              <tbody>
                <Row label="Storage Charges" value={fmtCur(report.storage.total)} />
                <Row label="Number of Charges" value={report.storage.chargeCount} />
              </tbody>
            </table>
          </div>

          {/* Top Customers */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Top Customers by Revenue</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Customer</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Records</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((c, i) => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <strong>{c.name}</strong>
                      {c.company && <span style={{ color: '#6b7280', marginLeft: '6px' }}>({c.company})</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{c.records}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{fmtCur(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Technician Profitability */}
          {techReport && techReport.technicians && (
            <div style={sectionStyle}>
              <h2 style={sectionTitle}>Technician Profitability</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Technician</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Jobs</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Wage Cost</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Profit</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {techReport.technicians.map(t => (
                    <tr key={t.id}>
                      <td style={tdStyle}><strong>{t.name}</strong></td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{t.jobs}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{t.hours.toFixed(1)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{fmtCur(t.revenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{t.hourlyWage > 0 ? fmtCur(t.wageCost) : '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{t.hourlyWage > 0 ? fmtCur(t.profit) : '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: t.hourlyWage === 0 ? '#9ca3af' : t.margin >= 70 ? '#065f46' : t.margin >= 50 ? '#92400e' : '#dc2626' }}>
                        {t.hourlyWage > 0 ? `${t.margin}%` : 'Set wage'}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f9fafb', fontWeight: 700 }}>
                    <td style={{ ...tdStyle, borderTop: '2px solid #1e3a5f' }}>TOTAL</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{techReport.totals.jobs}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{techReport.totals.hours.toFixed(1)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(techReport.totals.revenue)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(techReport.totals.wageCost)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(techReport.totals.profit)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f', color: techReport.totals.margin >= 70 ? '#065f46' : techReport.totals.margin >= 50 ? '#92400e' : '#dc2626' }}>{techReport.totals.margin}%</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7280' }}>
                <div>Labor Rate: ${techReport.laborRate}/hr | Average Effective Rate: {fmtCur(techReport.totals.avgRate)}/hr</div>
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Wage cost uses current hourly rates from Settings. Set wages there first for accurate margins.</div>
              </div>
            </div>
          )}

          {/* Contractor Profitability */}
          {contractorReport && contractorReport.contractors && (
            <div style={sectionStyle}>
              <h2 style={sectionTitle}>Contractor Profitability</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Contractor</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Jobs</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Revenue Billed</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Contractor Cost</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Profit</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorReport.contractors.map(c => (
                    <tr key={c.id}>
                      <td style={tdStyle}><strong>{c.name}</strong></td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{c.jobs}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{c.hours.toFixed(1)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{fmtCur(c.revenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{c.cost > 0 ? fmtCur(c.cost) : '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{c.cost > 0 ? fmtCur(c.profit) : '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: c.cost === 0 ? '#9ca3af' : c.margin >= 70 ? '#065f46' : c.margin >= 50 ? '#92400e' : '#dc2626' }}>
                        {c.cost > 0 ? `${c.margin}%` : 'No cost entered'}
                      </td>
                    </tr>
                  ))}
                  {contractorReport.contractors.length > 0 && (
                    <tr style={{ backgroundColor: '#f9fafb', fontWeight: 700 }}>
                      <td style={{ ...tdStyle, borderTop: '2px solid #1e3a5f' }}>TOTAL</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{contractorReport.totals.jobs}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{contractorReport.totals.hours.toFixed(1)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(contractorReport.totals.revenue)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(contractorReport.totals.cost)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f' }}>{fmtCur(contractorReport.totals.profit)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #1e3a5f', color: contractorReport.totals.margin >= 70 ? '#065f46' : contractorReport.totals.margin >= 50 ? '#92400e' : '#dc2626' }}>{contractorReport.totals.margin}%</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                Based on contractor cost entered per labor line. Only lines with cost entered are included.
              </div>
            </div>
          )}

          {/* Print button */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <button onClick={() => window.print()} style={btnPrimary}>Print Report</button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, bold, border, indent, color }) {
  return (
    <tr>
      <td style={{ padding: '8px 12px', fontSize: bold ? '0.95rem' : '0.875rem', fontWeight: bold ? 700 : 400, color: color || (indent ? '#6b7280' : '#374151'), paddingLeft: indent ? '28px' : '12px', borderTop: border ? '2px solid #1e3a5f' : undefined }}>{label}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: bold ? '0.95rem' : '0.875rem', fontWeight: bold ? 700 : 400, color: color || '#374151', borderTop: border ? '2px solid #1e3a5f' : undefined }}>{value}</td>
    </tr>
  );
}

const cardStyle = { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' };
const sectionStyle = { marginBottom: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const inputStyle = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '4px' };
const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnQuick = { padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' };
