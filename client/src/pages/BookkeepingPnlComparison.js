import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BookkeepingPnlComparison() {
  const currentYear = new Date().getFullYear();
  const defaultYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const [years, setYears] = useState(defaultYears);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('annual'); // 'annual' | 'monthly'
  const [highlightMonth, setHighlightMonth] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getBookkeepingPnlComparison(years)
      .then(setData)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [years]);

  const fmt = (n) => {
    const v = Number(n || 0);
    if (v === 0) return '';
    return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  const fmtPct = (a, b) => {
    if (!b || b === 0) return '—';
    const pct = ((a - b) / Math.abs(b)) * 100;
    const color = pct >= 0 ? '#060' : '#900';
    return <span style={{ color }}>{pct > 0 ? '+' : ''}{pct.toFixed(0)}%</span>;
  };

  // Group accounts by type for P&L sections
  const groups = useMemo(() => {
    if (!data) return null;
    const g = { Income: [], COGS: [], Expense: [], 'Other Income': [] };
    for (const a of data.accounts) {
      if (g[a.account_type]) g[a.account_type].push(a);
    }
    Object.values(g).forEach(arr => arr.sort((a,b) => a.account_number.localeCompare(b.account_number)));
    return g;
  }, [data]);

  const yearTotal = (acct, year) => (acct.years[year] || Array(12).fill(0)).reduce((s,n) => s + Number(n), 0);
  const sectionMonth = (accts, year, month) => accts.reduce((s, a) => s + ((a.years[year] || [])[month] || 0), 0);
  const sectionYear = (accts, year) => accts.reduce((s, a) => s + yearTotal(a, year), 0);

  if (loading) return <Wrapper><BookkeepingNav /><p>Loading...</p></Wrapper>;
  if (error) return <Wrapper><BookkeepingNav /><div style={errBox}>{error}</div></Wrapper>;
  if (!data) return <Wrapper><BookkeepingNav /></Wrapper>;

  const incomeBy = (y,m) => sectionMonth(groups.Income, y, m);
  const cogsBy = (y,m) => sectionMonth(groups.COGS, y, m);
  const expenseBy = (y,m) => sectionMonth(groups.Expense, y, m);
  const otherIncBy = (y,m) => sectionMonth(groups['Other Income'], y, m);
  const grossBy = (y,m) => incomeBy(y,m) - cogsBy(y,m);
  const netBy = (y,m) => grossBy(y,m) - expenseBy(y,m) + otherIncBy(y,m);

  return (
    <Wrapper>
      <BookkeepingNav />
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>P&L Comparison</h2>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={() => setView('annual')} style={view==='annual'?tabActive:tab}>Annual Totals</button>
          <button onClick={() => setView('monthly')} style={view==='monthly'?tabActive:tab}>Month-by-Month</button>
        </div>
      </div>

      {view === 'annual' ? (
        <table style={tbl}>
          <thead>
            <tr style={hdr}>
              <th style={{ ...th, textAlign:'left', minWidth:280 }}>Account</th>
              {years.map(y => <th key={y} style={th}>{y}</th>)}
              <th style={th}>{years[1]} vs {years[0]}</th>
            </tr>
          </thead>
          <tbody>
            {renderAnnualSection('INCOME', groups.Income, years, yearTotal, sectionYear, fmt, fmtPct)}
            {renderAnnualTotal('Total Income', years.map(y => sectionYear(groups.Income, y)), fmt, fmtPct, '#e8f5e9')}
            {renderAnnualSection('COST OF GOODS SOLD', groups.COGS, years, yearTotal, sectionYear, fmt, fmtPct)}
            {renderAnnualTotal('Total COGS', years.map(y => sectionYear(groups.COGS, y)), fmt, fmtPct, '#fff3e0')}
            {renderAnnualTotal('GROSS PROFIT', years.map(y => sectionYear(groups.Income, y) - sectionYear(groups.COGS, y)), fmt, fmtPct, '#c8e6c9')}
            {renderAnnualSection('EXPENSES', groups.Expense, years, yearTotal, sectionYear, fmt, fmtPct)}
            {renderAnnualTotal('Total Expenses', years.map(y => sectionYear(groups.Expense, y)), fmt, fmtPct, '#fce4ec')}
            {renderAnnualSection('OTHER INCOME', groups['Other Income'], years, yearTotal, sectionYear, fmt, fmtPct)}
            {renderAnnualTotal('NET INCOME', years.map(y => sectionYear(groups.Income, y) - sectionYear(groups.COGS, y) - sectionYear(groups.Expense, y) + sectionYear(groups['Other Income'], y)), fmt, fmtPct, '#1a2a4a', '#fff')}
          </tbody>
        </table>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ ...tbl, fontSize: '0.78rem' }}>
            <thead>
              <tr style={hdr}>
                <th rowSpan={2} style={{ ...th, textAlign:'left', minWidth: 220, position: 'sticky', left: 0, background:'#1a2a4a', zIndex: 2 }}>Account</th>
                {MONTHS.map((m, idx) => (
                  <th key={m} colSpan={years.length} style={{ ...th, borderRight: '2px solid #fff' }}>{m}</th>
                ))}
                <th colSpan={years.length} style={{ ...th, background:'#3949ab' }}>TOTAL</th>
              </tr>
              <tr style={hdr}>
                {MONTHS.flatMap((m, idx) =>
                  years.map((y, i) => <th key={`${m}-${y}`} style={{ ...thSm, borderRight: i === years.length-1 ? '2px solid #fff' : '1px solid #555' }}>{String(y).slice(2)}</th>)
                )}
                {years.map((y, i) => <th key={`tot-${y}`} style={{ ...thSm, background:'#3949ab' }}>{String(y).slice(2)}</th>)}
              </tr>
            </thead>
            <tbody>
              {renderMonthlySection('INCOME', groups.Income, years, MONTHS, fmt)}
              {renderMonthlyTotal('Total Income', years, MONTHS, (y,m) => sectionMonth(groups.Income, y, m), fmt, '#e8f5e9')}
              {renderMonthlySection('COGS', groups.COGS, years, MONTHS, fmt)}
              {renderMonthlyTotal('Total COGS', years, MONTHS, (y,m) => sectionMonth(groups.COGS, y, m), fmt, '#fff3e0')}
              {renderMonthlyTotal('GROSS PROFIT', years, MONTHS, (y,m) => grossBy(y,m), fmt, '#c8e6c9')}
              {renderMonthlySection('EXPENSES', groups.Expense, years, MONTHS, fmt)}
              {renderMonthlyTotal('Total Expenses', years, MONTHS, (y,m) => sectionMonth(groups.Expense, y, m), fmt, '#fce4ec')}
              {renderMonthlySection('OTHER INCOME', groups['Other Income'], years, MONTHS, fmt)}
              {renderMonthlyTotal('NET INCOME', years, MONTHS, (y,m) => netBy(y,m), fmt, '#1a2a4a', '#fff')}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize:'0.85rem', color:'#666', marginTop: 16 }}>
        Live data from posted journal entries. 2023-2025 historical values loaded from saved P&L files
        (Jan-Oct from monthly comparison file, Nov-Dec inferred from annual totals). 2023 monthly distribution
        is an annual-divided-by-12 placeholder; will refine when account-level monthly data becomes available.
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }) {
  return (
    <div style={{ padding: 24, maxWidth: 1800, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      {children}
    </div>
  );
}

function renderAnnualSection(label, accts, years, yearTotalFn, sectionYearFn, fmt, fmtPct) {
  return (
    <>
      <tr style={section}>
        <td style={{ ...td, fontWeight: 700 }}>{label}</td>
        {years.map(y => <td key={y} style={td}></td>)}
        <td style={td}></td>
      </tr>
      {accts.map(a => {
        const totals = years.map(y => yearTotalFn(a, y));
        return (
          <tr key={a.account_number}>
            <td style={td}><span style={mono}>{a.account_number}</span> {a.name}</td>
            {totals.map((v, i) => <td key={i} style={tdR}>{fmt(v)}</td>)}
            <td style={tdR}>{fmtPct(totals[0], totals[1])}</td>
          </tr>
        );
      })}
    </>
  );
}

function renderAnnualTotal(label, totals, fmt, fmtPct, bg='#e0e0e0', color='#000') {
  return (
    <tr style={{ background: bg, color }}>
      <td style={{ ...td, fontWeight:700, color }}>{label}</td>
      {totals.map((v, i) => <td key={i} style={{ ...tdR, fontWeight:700, color }}>{fmt(v)}</td>)}
      <td style={{ ...tdR, fontWeight:700, color }}>{fmtPct(totals[0], totals[1])}</td>
    </tr>
  );
}

function renderMonthlySection(label, accts, years, months, fmt) {
  return (
    <>
      <tr style={section}>
        <td style={{ ...td, fontWeight:700, position:'sticky', left:0, background:'#f0f0f0' }}>{label}</td>
        {months.map(m => years.map((y,i) => <td key={`${m}-${y}`} style={tdR}></td>))}
        {years.map((y,i) => <td key={`t-${y}`} style={tdR}></td>)}
      </tr>
      {accts.map(a => {
        const total = (y) => (a.years[y] || []).reduce((s,n) => s + Number(n), 0);
        return (
          <tr key={a.account_number}>
            <td style={{ ...td, position:'sticky', left:0, background:'#fff' }}>
              <span style={mono}>{a.account_number}</span> {a.name}
            </td>
            {months.map((m, mi) => years.map((y,yi) => (
              <td key={`${m}-${y}`} style={{ ...tdR, borderRight: yi === years.length-1 ? '2px solid #ddd' : '1px solid #eee' }}>
                {fmt((a.years[y] || [])[mi])}
              </td>
            )))}
            {years.map((y,yi) => (
              <td key={`t-${y}`} style={{ ...tdR, fontWeight:600, background:'#f5f5f5', borderRight: yi === years.length-1 ? '2px solid #ddd' : '1px solid #eee' }}>
                {fmt(total(y))}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

function renderMonthlyTotal(label, years, months, fn, fmt, bg='#e0e0e0', color='#000') {
  const total = (y) => months.reduce((s, _, mi) => s + fn(y, mi), 0);
  return (
    <tr style={{ background: bg, color }}>
      <td style={{ ...td, fontWeight:700, position:'sticky', left:0, background:bg, color }}>{label}</td>
      {months.map((m, mi) => years.map((y, yi) => (
        <td key={`${m}-${y}`} style={{ ...tdR, fontWeight:700, color, borderRight: yi === years.length-1 ? '2px solid #fff' : 'none' }}>
          {fmt(fn(y, mi))}
        </td>
      )))}
      {years.map((y, yi) => (
        <td key={`tot-${y}`} style={{ ...tdR, fontWeight:700, color, borderRight: yi === years.length-1 ? '2px solid #fff' : 'none' }}>
          {fmt(total(y))}
        </td>
      ))}
    </tr>
  );
}

const tbl = { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' };
const hdr = { background: '#1a2a4a', color: '#fff' };
const th  = { padding: '8px 10px', textAlign: 'right', minWidth: 80 };
const thSm = { padding: '4px 6px', textAlign: 'right', minWidth: 50, fontSize: '0.75rem' };
const td  = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #eee' };
const tdR = { padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #eee', fontFamily: 'monospace' };
const section = { background: '#f0f0f0' };
const mono = { color: '#888', fontFamily: 'monospace', marginRight: 6 };
const tab = { padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
const tabActive = { ...tab, background: '#1a2a4a', color: '#fff', border: '1px solid #1a2a4a' };
const errBox = { background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 };
