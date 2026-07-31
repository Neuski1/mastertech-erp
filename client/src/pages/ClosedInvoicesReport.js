import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const METHOD_LABELS = { credit_card: 'Credit Card', check: 'Check', cash: 'Cash', zelle: 'Zelle' };

function fmtCur(v) {
  return (parseFloat(v || 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
function fmtDate(d) {
  if (!d) return '—';
  const s = String(d).slice(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${parseInt(m[2])}/${parseInt(m[3])}/${m[1]}`;
  return s;
}
function fmtMethods(methods) {
  if (!methods) return '—';
  return methods.split(',').map(x => x.trim()).filter(Boolean)
    .map(x => METHOD_LABELS[x] || x.replace(/_/g, ' ')).join(', ');
}

function iso(d) { return d.toISOString().split('T')[0]; }
function monthRange(offset = 0) {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offset);
  return { from: iso(new Date(d.getFullYear(), d.getMonth(), 1)), to: iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
}
function quarterRange(offset = 0) {
  const now = new Date();
  let q = Math.floor(now.getMonth() / 3) + offset;
  let year = now.getFullYear();
  while (q < 0) { q += 4; year -= 1; }
  while (q > 3) { q -= 4; year += 1; }
  const startMonth = q * 3;
  return { from: iso(new Date(year, startMonth, 1)), to: iso(new Date(year, startMonth + 3, 0)) };
}
function yearRange(offset = 0) {
  const y = new Date().getFullYear() + offset;
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

const PRESETS = {
  this_month: { label: 'This Month', get: () => monthRange(0) },
  last_month: { label: 'Last Month', get: () => monthRange(-1) },
  this_quarter: { label: 'This Quarter', get: () => quarterRange(0) },
  last_quarter: { label: 'Last Quarter', get: () => quarterRange(-1) },
  this_year: { label: 'This Year', get: () => yearRange(0) },
  last_year: { label: 'Last Year', get: () => yearRange(-1) },
  custom: { label: 'Custom Range', get: null },
};

export default function ClosedInvoicesReport() {
  const [preset, setPreset] = useState('this_month');
  const initial = monthRange(0);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (f, t) => {
    setLoading(true); setError('');
    try {
      const res = await api.getClosedInvoices({ from: f, to: t });
      setData(res);
    } catch (err) { setError(err.message); setData(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { run(from, to); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = (key) => {
    setPreset(key);
    const p = PRESETS[key];
    if (p && p.get) {
      const r = p.get();
      setFrom(r.from); setTo(r.to);
      run(r.from, r.to);
    }
  };

  const periodLabel = preset === 'custom' ? `${fmtDate(from)} – ${fmtDate(to)}` : PRESETS[preset].label;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          @page { size: auto; margin: 0.5in; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
        .print-only { display: none; }
        @media print { .print-only { display: block; } }
      `}</style>

      <div className="print-only" style={{ marginBottom: '12px' }}>
        <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '20px' }}>Master Tech RV Repair &amp; Storage</h1>
        <div style={{ fontSize: '13px', color: '#374151' }}>Closed Invoices — {periodLabel}</div>
      </div>

      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Closed Invoices</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/reports" style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>&larr; Reports</a>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Print / Save PDF</button>
        </div>
      </div>

      <div className="print-hide" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Period</label>
        <select value={preset} onChange={(e) => applyPreset(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }}>
          {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {preset === 'custom' && (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            <span style={{ color: '#6b7280' }}>to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
            <button onClick={() => run(from, to)} style={{ padding: '6px 14px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Run</button>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#6b7280' }}>{fmtDate(from)} &ndash; {fmtDate(to)}</span>
      </div>

      {error && <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px' }}>{error}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading...</div>
      ) : data && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Invoice #</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Closed</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Paid By</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No closed invoices in this period.</td></tr>
              ) : data.invoices.map((inv, i) => (
                <tr key={inv.record_number} style={{ borderTop: '1px solid #e5e7eb', background: i % 2 ? '#f9fafb' : '#fff' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 600 }}>#{inv.record_number}</td>
                  <td style={{ padding: '7px 12px' }}>{inv.customer_name}</td>
                  <td style={{ padding: '7px 12px', color: '#374151' }}>{fmtDate(inv.closed_date)}</td>
                  <td style={{ padding: '7px 12px', color: '#374151' }}>{fmtMethods(inv.methods)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 500 }}>{fmtCur(inv.total_sales)}</td>
                </tr>
              ))}
              {data.invoices.length > 0 && (
                <tr style={{ borderTop: '2px solid #1e3a5f', background: '#f3f4f6', fontWeight: 700, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={{ padding: '9px 12px' }} colSpan={4}>{data.count} invoice{data.count !== 1 ? 's' : ''}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmtCur(data.totalAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
