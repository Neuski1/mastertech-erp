import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BookkeepingPnlComparison() {
  const currentYear = new Date().getFullYear();
  const allYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const [selectedYears, setSelectedYears] = useState([currentYear, currentYear - 1]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('monthly');
  const [throughMonth, setThroughMonth] = useState(Math.max(0, new Date().getMonth() - 1)); // default: last completed month

  const handlePrint = () => {
    const style = document.createElement('style');
    style.id = 'pnl-print-landscape';
    style.textContent = `
      @media print {
        @page { size: landscape; margin: 0.4in; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .pnl-scroll { overflow: visible !important; max-height: none !important; max-width: none !important; }
        .pnl-scroll table { font-size: 6.5pt !important; table-layout: auto !important; width: 100% !important; }
        .pnl-scroll th, .pnl-scroll td { position: static !important; padding: 2px 3px !important; }
        .pnl-scroll thead th { background: #1a2a4a !important; color: #fff !important; }
        .pnl-print-table { font-size: 8pt !important; }
        .pnl-print-table th, .pnl-print-table td { padding: 2px 4px !important; white-space: nowrap; }
        .pnl-print-table thead th { background: #1a2a4a !important; color: #fff !important; }
      }`;
    document.head.appendChild(style);
    const cleanup = () => { const el = document.getElementById('pnl-print-landscape'); if (el) el.remove(); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 1000);
  };

  const toggleYear = (y) => {
    setSelectedYears(prev => prev.includes(y)
      ? prev.filter(x => x !== y).sort((a,b) => b - a)
      : [...prev, y].sort((a,b) => b - a)
    );
  };

  useEffect(() => {
    if (selectedYears.length === 0) return;
    setLoading(true); setError('');
    api.getBookkeepingPnlComparison(selectedYears)
      .then(setData)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [selectedYears]);

  const fmt = (n) => {
    const v = Number(n || 0);
    if (v === 0) return '';
    return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  const fmtPct = (a, b) => {
    if (!b || b === 0) return '—';
    const pct = ((a - b) / Math.abs(b)) * 100;
    const color = pct >= 0 ? '#060' : '#900';
    return <span style={{ color, fontWeight: 600 }}>{pct > 0 ? '+' : ''}{pct.toFixed(0)}%</span>;
  };

  const groups = useMemo(() => {
    if (!data) return null;
    const g = { Income: [], COGS: [], Expense: [], 'Other Income': [] };
    for (const a of data.accounts) if (g[a.account_type]) g[a.account_type].push(a);
    Object.values(g).forEach(arr => arr.sort((a,b) => a.account_number.localeCompare(b.account_number)));
    return g;
  }, [data]);

  const yearTotal = (acct, year) => (acct.years[year] || Array(12).fill(0)).slice(0, throughMonth + 1).reduce((s,n) => s + Number(n), 0);
  const sectionMonth = (accts, year, month) => accts.reduce((s, a) => s + Number((a.years[year] || [])[month] || 0), 0);
  const sectionYear = (accts, year) => accts.reduce((s, a) => s + yearTotal(a, year), 0);

  const years = selectedYears;
  const visMonths = MONTHS.slice(0, throughMonth + 1);

  if (loading) return <Wrapper><BookkeepingNav /><p>Loading...</p></Wrapper>;
  if (error) return <Wrapper><BookkeepingNav /><div style={errBox}>{error}</div></Wrapper>;
  if (!data) return <Wrapper><BookkeepingNav /></Wrapper>;

  const grossBy = (y,m) => sectionMonth(groups.Income, y, m) - sectionMonth(groups.COGS, y, m);
  const netBy = (y,m) => grossBy(y, m) - sectionMonth(groups.Expense, y, m) + sectionMonth(groups['Other Income'], y, m);

  // Print-only half-year table: idxs are REAL month indexes (0-5 or 6-11), so
  // the data lookup stays correct. YTD (full-year total) is shown on the 2nd half.
  const printHalf = (idxs, includeYTD, title) => {
    const sectionRows = (label, accts) => (<>
      <tr style={section}>
        <td style={{ ...td, fontWeight: 700 }}>{label}</td>
        {idxs.map(mi => years.map(y => <td key={`${mi}-${y}`} style={tdR}></td>))}
        {includeYTD && years.map(y => <td key={`h-${y}`} style={tdR}></td>)}
      </tr>
      {accts.map(a => (
        <tr key={a.account_number}>
          <td style={td}><span style={mono}>{a.account_number}</span> {a.name}</td>
          {idxs.map(mi => years.map((y, yi) => (
            <td key={`${mi}-${y}`} style={{ ...tdR, borderRight: yi === years.length-1 ? '2px solid #ddd' : '1px solid #eee' }}>{fmt((a.years[y] || [])[mi])}</td>
          )))}
          {includeYTD && years.map(y => (
            <td key={`ytd-${y}`} style={{ ...tdR, fontWeight: 700, background: '#eef' }}>{fmt((a.years[y] || []).slice(0, throughMonth + 1).reduce((sm, n) => sm + Number(n), 0))}</td>
          ))}
        </tr>
      ))}
    </>);
    const totalRow = (label, valFn, bg, color='#000') => (
      <tr style={{ background: bg, color }}>
        <td style={{ ...td, fontWeight: 700, background: bg, color }}>{label}</td>
        {idxs.map(mi => years.map((y, yi) => (
          <td key={`${mi}-${y}`} style={{ ...tdR, fontWeight: 700, color }}>{fmt(valFn(y, mi))}</td>
        )))}
        {includeYTD && years.map(y => (
          <td key={`ytd-${y}`} style={{ ...tdR, fontWeight: 700, color }}>{fmt(MONTHS.slice(0, throughMonth + 1).reduce((sm, _u, mi) => sm + valFn(y, mi), 0))}</td>
        ))}
      </tr>
    );
    return (
      <div style={{ pageBreakInside: 'avoid', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '13pt' }}>{title}</h3>
        <table className="pnl-print-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={hdr}>
              <th style={{ ...th, textAlign: 'left' }}>Account</th>
              {idxs.map(mi => <th key={mi} colSpan={years.length} style={{ ...th, borderRight: '2px solid #fff' }}>{MONTHS[mi]}</th>)}
              {includeYTD && <th colSpan={years.length} style={{ ...th, background: '#3949ab' }}>Thru {MONTHS[throughMonth]}</th>}
            </tr>
            <tr style={hdr}>
              <th style={{ ...thSm, textAlign: 'left' }}></th>
              {idxs.map(mi => years.map((y, i) => <th key={`${mi}-${y}`} style={{ ...thSm, borderRight: i === years.length-1 ? '2px solid #fff' : '1px solid #555' }}>{String(y).slice(2)}</th>))}
              {includeYTD && years.map(y => <th key={`ytd-${y}`} style={{ ...thSm, background: '#3949ab' }}>{String(y).slice(2)}</th>)}
            </tr>
          </thead>
          <tbody>
            {sectionRows('INCOME', groups.Income)}
            {totalRow('Total Income', (y,m) => sectionMonth(groups.Income, y, m), '#e8f5e9')}
            {sectionRows('COST OF GOODS SOLD', groups.COGS)}
            {totalRow('Total COGS', (y,m) => sectionMonth(groups.COGS, y, m), '#fff3e0')}
            {totalRow('GROSS PROFIT', (y,m) => grossBy(y, m), '#c8e6c9')}
            {sectionRows('EXPENSES', groups.Expense)}
            {totalRow('Total Expenses', (y,m) => sectionMonth(groups.Expense, y, m), '#fce4ec')}
            {sectionRows('OTHER INCOME', groups['Other Income'])}
            {totalRow('NET INCOME', (y,m) => netBy(y, m), '#1a2a4a', '#fff')}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Wrapper>
      <BookkeepingNav />
      <div className="print-only" style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Master Tech RV Repair & Storage</h1>
        <h2 style={{ margin: 0 }}>P&L Comparison</h2>
        <p style={{ margin: 0 }}>{years.join(' vs ')} &nbsp;|&nbsp; Through {MONTHS[throughMonth]}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 12, flexWrap: 'wrap' }} className="print-hide">
        <h2 style={{ margin: 0 }}>P&L Comparison</h2>
        <div style={{ display:'flex', gap:6, marginLeft: 12 }}>
          {allYears.map(y => (
            <label key={y} style={{ ...yearChip, background: selectedYears.includes(y) ? '#1a2a4a' : '#f0f0f0', color: selectedYears.includes(y) ? '#fff' : '#333' }}>
              <input type="checkbox" checked={selectedYears.includes(y)} onChange={() => toggleYear(y)} style={{ marginRight: 4 }} /> {y}
            </label>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'0.85rem', color:'#555' }}>Through</span>
          <select value={throughMonth} onChange={(e) => setThroughMonth(Number(e.target.value))} style={{ padding:'4px 8px', border:'1px solid #ccc', borderRadius:4, fontWeight:600 }}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={() => setView('annual')} style={view==='annual'?tabActive:tab}>Annual Totals</button>
          <button onClick={() => setView('monthly')} style={view==='monthly'?tabActive:tab}>Month-by-Month</button>
          <button onClick={handlePrint} style={{ ...tab, background: '#1a2a4a', color: '#fff' }}>Print (Landscape)</button>
        </div>
      </div>

      {view === 'annual' ? (
        <div className="pnl-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
        <table style={tbl}>
          <thead>
            <tr style={hdr}>
              <th style={{ ...th, textAlign:'left', minWidth: 300, position: 'sticky', top: 0, left: 0, background: '#1a2a4a', zIndex: 5 }}>Account</th>
              {years.map(y => <th key={y} style={{ ...th, position: 'sticky', top: 0, background: '#1a2a4a', zIndex: 4 }}>{y}<div style={{ fontSize:'0.65rem', fontWeight:400, opacity:0.8 }}>thru {MONTHS[throughMonth]}</div></th>)}
              {years.length >= 2 && <th style={{ ...th, position: 'sticky', top: 0, background: '#1a2a4a', zIndex: 4 }}>{years[0]} vs {years[1]}</th>}
            </tr>
          </thead>
          <tbody>
            {renderAnnualSection('INCOME', groups.Income, years, yearTotal, fmt, fmtPct)}
            {renderAnnualTotal('Total Income', years.map(y => sectionYear(groups.Income, y)), fmt, fmtPct, '#e8f5e9')}
            {renderAnnualSection('COST OF GOODS SOLD', groups.COGS, years, yearTotal, fmt, fmtPct)}
            {renderAnnualTotal('Total COGS', years.map(y => sectionYear(groups.COGS, y)), fmt, fmtPct, '#fff3e0')}
            {renderAnnualTotal('GROSS PROFIT', years.map(y => sectionYear(groups.Income, y) - sectionYear(groups.COGS, y)), fmt, fmtPct, '#c8e6c9')}
            {renderAnnualSection('EXPENSES', groups.Expense, years, yearTotal, fmt, fmtPct)}
            {renderAnnualTotal('Total Expenses', years.map(y => sectionYear(groups.Expense, y)), fmt, fmtPct, '#fce4ec')}
            {renderAnnualSection('OTHER INCOME', groups['Other Income'], years, yearTotal, fmt, fmtPct)}
            {renderAnnualTotal('NET INCOME', years.map(y => sectionYear(groups.Income, y) - sectionYear(groups.COGS, y) - sectionYear(groups.Expense, y) + sectionYear(groups['Other Income'], y)), fmt, fmtPct, '#1a2a4a', '#fff')}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="pnl-scroll print-hide" style={{ overflowX: 'auto', overflowY: 'auto', width: '100%', maxWidth: '100%', maxHeight: 'calc(100vh - 240px)' }}>
          <table style={{ ...tbl, fontSize: '0.78rem', tableLayout: 'auto' }}>
            <thead>
              <tr style={hdr}>
                <th rowSpan={2} style={{ ...th, textAlign:'left', minWidth: 220, position: 'sticky', left: 0, top: 0, background:'#1a2a4a', zIndex: 5 }}>Account</th>
                {visMonths.map((m) => (
                  <th key={m} colSpan={years.length} style={{ ...th, borderRight: '2px solid #fff', position: 'sticky', top: 0, background: '#1a2a4a', zIndex: 4 }}>{m}</th>
                ))}
                <th colSpan={years.length} style={{ ...th, background:'#3949ab', position: 'sticky', top: 0, zIndex: 4 }}>Thru {MONTHS[throughMonth]}</th>
              </tr>
              <tr style={hdr}>
                {visMonths.flatMap((m) =>
                  years.map((y, i) => <th key={`${m}-${y}`} style={{ ...thSm, borderRight: i === years.length-1 ? '2px solid #fff' : '1px solid #555', position: 'sticky', top: 36, background: '#1a2a4a', zIndex: 4 }}>{String(y).slice(2)}</th>)
                )}
                {years.map((y) => <th key={`tot-${y}`} style={{ ...thSm, background:'#3949ab', position: 'sticky', top: 36, zIndex: 4 }}>{String(y).slice(2)}</th>)}
              </tr>
            </thead>
            <tbody>
              {renderMonthlySection('INCOME', groups.Income, years, visMonths, fmt)}
              {renderMonthlyTotal('Total Income', years, visMonths, (y,m) => sectionMonth(groups.Income, y, m), fmt, '#e8f5e9')}
              {renderMonthlySection('COGS', groups.COGS, years, visMonths, fmt)}
              {renderMonthlyTotal('Total COGS', years, visMonths, (y,m) => sectionMonth(groups.COGS, y, m), fmt, '#fff3e0')}
              {renderMonthlyTotal('GROSS PROFIT', years, visMonths, (y,m) => grossBy(y,m), fmt, '#c8e6c9')}
              {renderMonthlySection('EXPENSES', groups.Expense, years, visMonths, fmt)}
              {renderMonthlyTotal('Total Expenses', years, visMonths, (y,m) => sectionMonth(groups.Expense, y, m), fmt, '#fce4ec')}
              {renderMonthlySection('OTHER INCOME', groups['Other Income'], years, visMonths, fmt)}
              {renderMonthlyTotal('NET INCOME', years, visMonths, (y,m) => netBy(y,m), fmt, '#1a2a4a', '#fff')}
            </tbody>
          </table>
        </div>
      )}

      {/* Print-only: split months into readable pages (Jan-Jun, then Jul-through-selected) */}
      {view === 'monthly' && (
        <div className="print-only">
          {(() => {
            const first = []; for (let m = 0; m <= Math.min(5, throughMonth); m++) first.push(m);
            const second = []; for (let m = 6; m <= throughMonth; m++) second.push(m);
            const thru = MONTHS[throughMonth];
            return (<>
              {printHalf(first, second.length === 0, `January \u2013 ${MONTHS[Math.min(5, throughMonth)]}${second.length === 0 ? ` (Total Thru ${thru})` : ''}`)}
              {second.length > 0 && <div style={{ pageBreakBefore: 'always' }}></div>}
              {second.length > 0 && printHalf(second, true, `July \u2013 ${thru} (Total Thru ${thru})`)}
            </>);
          })()}
        </div>
      )}

      <p style={{ fontSize:'0.85rem', color:'#666', marginTop: 16 }} className="print-hide">
        Tip: toggle years above to add or remove columns. Use the Month-by-Month tab to compare every account by month, Annual Totals for a clean year-end view.
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }) {
  return <div style={{ padding: 24, maxWidth: '100%', margin: '0 auto' }}>
    <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>{children}
  </div>;
}

function renderAnnualSection(label, accts, years, yearTotalFn, fmt, fmtPct) {
  return (<>
    <tr style={section}>
      <td style={{ ...td, fontWeight: 700 }}>{label}</td>
      {years.map(y => <td key={y} style={td}></td>)}
      {years.length >= 2 && <td style={td}></td>}
    </tr>
    {accts.map(a => {
      const totals = years.map(y => yearTotalFn(a, y));
      return (
        <tr key={a.account_number}>
          <td style={td}><span style={mono}>{a.account_number}</span> {a.name}</td>
          {totals.map((v, i) => <td key={i} style={tdR}>{fmt(v)}</td>)}
          {years.length >= 2 && <td style={tdR}>{fmtPct(totals[0], totals[1])}</td>}
        </tr>
      );
    })}
  </>);
}

function renderAnnualTotal(label, totals, fmt, fmtPct, bg='#e0e0e0', color='#000') {
  return (
    <tr style={{ background: bg, color }}>
      <td style={{ ...td, fontWeight:700, color }}>{label}</td>
      {totals.map((v, i) => <td key={i} style={{ ...tdR, fontWeight:700, color }}>{fmt(v)}</td>)}
      {totals.length >= 2 && <td style={{ ...tdR, fontWeight:700, color }}>{fmtPct(totals[0], totals[1])}</td>}
    </tr>
  );
}

function renderMonthlySection(label, accts, years, months, fmt) {
  return (<>
    <tr style={section}>
      <td style={{ ...td, fontWeight:700, position:'sticky', left:0, background:'#f0f0f0', zIndex: 2 }}>{label}</td>
      {months.map(m => years.map(y => <td key={`${m}-${y}`} style={tdR}></td>))}
      {years.map(y => <td key={`t-${y}`} style={tdR}></td>)}
    </tr>
    {accts.map(a => {
      const total = (y) => (a.years[y] || []).reduce((s,n) => s + Number(n), 0);
      return (
        <tr key={a.account_number}>
          <td style={{ ...td, position:'sticky', left:0, background:'#fff', zIndex: 2 }}>
            <span style={mono}>{a.account_number}</span> {a.name}
          </td>
          {months.map((m, mi) => years.map((y, yi) => (
            <td key={`${m}-${y}`} style={{ ...tdR, borderRight: yi === years.length-1 ? '2px solid #ddd' : '1px solid #eee' }}>
              {fmt((a.years[y] || [])[mi])}
            </td>
          )))}
          {years.map((y, yi) => (
            <td key={`t-${y}`} style={{ ...tdR, fontWeight:600, background:'#f5f5f5', borderRight: yi === years.length-1 ? '2px solid #ddd' : '1px solid #eee' }}>
              {fmt(total(y))}
            </td>
          ))}
        </tr>
      );
    })}
  </>);
}

function renderMonthlyTotal(label, years, months, fn, fmt, bg='#e0e0e0', color='#000') {
  const total = (y) => months.reduce((s, _, mi) => s + fn(y, mi), 0);
  return (
    <tr style={{ background: bg, color }}>
      <td style={{ ...td, fontWeight:700, position:'sticky', left:0, background:bg, color, zIndex: 2 }}>{label}</td>
      {months.map((_, mi) => years.map((y, yi) => (
        <td key={`${mi}-${y}`} style={{ ...tdR, fontWeight:700, color, borderRight: yi === years.length-1 ? '2px solid #fff' : 'none' }}>
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

const tbl = { borderCollapse: 'collapse', fontSize: '0.9rem' };
const hdr = { background: '#1a2a4a', color: '#fff' };
const th  = { padding: '8px 10px', textAlign: 'right', minWidth: 80 };
const thSm = { padding: '4px 6px', textAlign: 'right', minWidth: 55, fontSize: '0.75rem' };
const td  = { padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' };
const tdR = { padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid #eee', fontFamily: 'monospace', whiteSpace: 'nowrap' };
const section = { background: '#f0f0f0' };
const mono = { color: '#888', fontFamily: 'monospace', marginRight: 6 };
const tab = { padding: '6px 14px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
const tabActive = { ...tab, background: '#1a2a4a', color: '#fff', border: '1px solid #1a2a4a' };
const yearChip = { padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none', display: 'inline-flex', alignItems: 'center' };
const errBox = { background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 };
