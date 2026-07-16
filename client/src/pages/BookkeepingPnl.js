import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate, formatDateTime } from '../utils/dateFormat';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BookkeepingPnl() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cumulative, setCumulative] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getBookkeepingPnl(year)
      .then(setData)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [year]);

  const fmt = (n) => {
    const v = Number(n || 0);
    if (v === 0) return '';
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Group accounts by type for P&L sections (Income, COGS, Expense, Other Income)
  const groups = { Income: [], COGS: [], Expense: [], 'Other Income': [] };
  if (data) for (const a of data.accounts) {
    if (groups[a.account_type]) groups[a.account_type].push(a);
  }

  const sumMonths = (accts) => MONTHS.map((_, mi) => accts.reduce((s, a) => s + Number(a.months[mi]), 0));
  const sumYear = (arr) => arr.reduce((s, n) => s + n, 0);
  // Running (cumulative) total: each month = sum of that month + all prior.
  // Lets Carol read the combined N-month figure straight off the latest posted
  // month instead of adding columns in her head.
  const runningSum = (arr) => { let s = 0; return arr.map(n => (s += Number(n || 0))); };

  const income = sumMonths(groups['Income']);
  const cogs = sumMonths(groups['COGS']);
  const expense = sumMonths(groups['Expense']);
  const otherInc = sumMonths(groups['Other Income']);
  const grossProfit = income.map((v, i) => v - cogs[i]);
  const netIncome = grossProfit.map((v, i) => v - expense[i] + otherInc[i]);

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <div className="print-only" style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Master Tech RV Repair & Storage</h1>
        <h2 style={{ margin: 0 }}>Profit & Loss by Month</h2>
        <p style={{ margin: 0 }}>Year {year}{cumulative ? ' — Running (Year-to-Date) Totals' : ''}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Profit &amp; Loss by Month</h2>
        <label>
          Year:&nbsp;
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: 6, borderRadius: 4 }}>
            {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <button
          className="print-hide"
          onClick={() => setCumulative(c => !c)}
          style={{ marginLeft: 'auto', padding: '8px 16px', background: cumulative ? '#1a2a4a' : '#f0f0f0', color: cumulative ? '#fff' : '#333', border: '1px solid #1a2a4a', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
          title="Toggle between each month's own amount and the year-to-date running total through each month"
        >
          {cumulative ? 'Showing: Running Total' : 'Showing: Monthly'}
        </button>
        <button className="print-hide" onClick={() => window.print()} style={{ padding: '8px 16px', background: '#1a2a4a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Print</button>
      </div>
      {error && <div style={{ background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : data && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#1a2a4a', color: '#fff' }}>
              <th style={{ ...thLeft, position: 'sticky', left: 0, background: '#1a2a4a' }}>Account</th>
              {MONTHS.map(m => <th key={m} style={thRight}>{m}</th>)}
              <th style={{ ...thRight, fontWeight: 700 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {renderSection('INCOME', groups['Income'], fmt, cumulative, runningSum)}
            {renderTotal('Total Income', income, fmt, '#e8f5e9', '#000', cumulative, runningSum)}
            {renderSection('COST OF GOODS SOLD', groups['COGS'], fmt, cumulative, runningSum)}
            {renderTotal('Total COGS', cogs, fmt, '#fff3e0', '#000', cumulative, runningSum)}
            {renderTotal('GROSS PROFIT', grossProfit, fmt, '#c8e6c9', '#000', cumulative, runningSum)}
            {renderSection('EXPENSES', groups['Expense'], fmt, cumulative, runningSum)}
            {renderTotal('Total Expenses', expense, fmt, '#fce4ec', '#000', cumulative, runningSum)}
            {renderSection('OTHER INCOME', groups['Other Income'], fmt, cumulative, runningSum)}
            {renderTotal('Total Other Income', otherInc, fmt, '#e8f5e9', '#000', cumulative, runningSum)}
            {renderTotal('NET INCOME', netIncome, fmt, '#1a2a4a', '#fff', cumulative, runningSum)}
          </tbody>
        </table>
      )}
    </div>
  );
}

function renderSection(label, accts, fmt, cumulative, runningSum) {
  return (
    <>
      <tr style={{ background: '#f0f0f0' }}>
        <td style={{ ...tdLeft, fontWeight: 700, position: 'sticky', left: 0, background: '#f0f0f0' }}>{label}</td>
        {Array(13).fill(null).map((_, i) => <td key={i} style={tdRight}></td>)}
      </tr>
      {accts.map(a => {
        const cells = cumulative ? runningSum(a.months) : a.months;
        const grand = a.months.reduce((s, n) => s + Number(n), 0);
        return (
          <tr key={a.account_number}>
            <td style={{ ...tdLeft, position: 'sticky', left: 0, background: '#fff' }}>
              <span style={{ color: '#888', fontFamily: 'monospace', marginRight: 6 }}>{a.account_number}</span>{a.name}
            </td>
            {cells.map((v, i) => <td key={i} style={tdRight}>{fmt(v)}</td>)}
            <td style={{ ...tdRight, fontWeight: 600 }}>{fmt(grand)}</td>
          </tr>
        );
      })}
    </>
  );
}

function renderTotal(label, vals, fmt, bg = '#e0e0e0', color = '#000', cumulative = false, runningSum = null) {
  const total = vals.reduce((s, n) => s + n, 0);
  const cells = cumulative && runningSum ? runningSum(vals) : vals;
  return (
    <tr style={{ background: bg, color }}>
      <td style={{ ...tdLeft, fontWeight: 700, position: 'sticky', left: 0, background: bg, color }}>{label}</td>
      {cells.map((v, i) => <td key={i} style={{ ...tdRight, fontWeight: 700 }}>{fmt(v)}</td>)}
      <td style={{ ...tdRight, fontWeight: 700 }}>{fmt(total)}</td>
    </tr>
  );
}

const thLeft = { padding: '8px 12px', textAlign: 'left', minWidth: 250 };
const thRight = { padding: '8px 12px', textAlign: 'right', minWidth: 90 };
const tdLeft = { padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #eee' };
const tdRight = { padding: '6px 12px', textAlign: 'right', borderBottom: '1px solid #eee', fontFamily: 'monospace' };
