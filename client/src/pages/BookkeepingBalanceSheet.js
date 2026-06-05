import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate, formatDateTime } from '../utils/dateFormat';

export default function BookkeepingBalanceSheet() {
  const today = new Date().toISOString().slice(0, 10);
  const [asOf, setAsOf] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getBookkeepingBalanceSheet(asOf)
      .then(setData)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [asOf]);

  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sections = { 'Bank': [], 'Accounts Receivable': [], 'Other Current Asset': [], 'Fixed Asset': [], 'Fixed Asset (contra)': [],
                     'Credit Card': [], 'Accounts Payable': [], 'Other Current Liability': [], 'Long-Term Liability': [], 'Equity': [] };
  if (data) for (const a of data.accounts) {
    if (sections[a.account_type]) sections[a.account_type].push(a);
  }
  const sumOf = (arr) => arr.reduce((s, a) => s + Number(a.balance), 0);

  const totalCurrentAssets = sumOf(sections['Bank']) + sumOf(sections['Accounts Receivable']) + sumOf(sections['Other Current Asset']);
  const totalFixedAssets   = sumOf(sections['Fixed Asset']) + sumOf(sections['Fixed Asset (contra)']);
  const totalAssets        = totalCurrentAssets + totalFixedAssets;
  const totalCurrentLiabs  = sumOf(sections['Credit Card']) + sumOf(sections['Accounts Payable']) + sumOf(sections['Other Current Liability']);
  const totalLongTerm      = sumOf(sections['Long-Term Liability']);
  const totalLiabs         = totalCurrentLiabs + totalLongTerm;
  const totalEquity        = sumOf(sections['Equity']);

  const renderRow = (a) => (
    <tr key={a.account_number}>
      <td style={td}><span style={{ color: '#888', fontFamily: 'monospace', marginRight: 6 }}>{a.account_number}</span>{a.name}</td>
      <td style={tdRight}>${fmt(a.balance)}</td>
    </tr>
  );
  const renderGroup = (label, items) => items.length > 0 && (
    <>
      <tr style={{ background: '#f0f0f0' }}><td style={{ ...td, fontWeight: 700 }}>{label}</td><td style={tdRight}></td></tr>
      {items.map(renderRow)}
    </>
  );
  const totalRow = (label, val, bg='#fce4ec') => (
    <tr style={{ background: bg }}><td style={{ ...td, fontWeight: 700 }}>{label}</td><td style={{ ...tdRight, fontWeight: 700 }}>${fmt(val)}</td></tr>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Balance Sheet</h2>
        <label>
          As of:&nbsp;
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} style={{ padding: 6, borderRadius: 4 }} />
        </label>
      </div>
      {error && <div style={{ background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : data && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a2a4a', color: '#fff' }}>
              <th style={{ ...th, textAlign: 'left' }}>Account</th>
              <th style={{ ...th, textAlign: 'right', width: 180 }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#dde7f5' }}><td style={{ ...td, fontWeight: 800, fontSize: '1.05rem' }} colSpan={2}>ASSETS</td></tr>
            {renderGroup('Bank Accounts', sections['Bank'])}
            {renderGroup('Accounts Receivable', sections['Accounts Receivable'])}
            {renderGroup('Other Current Assets', sections['Other Current Asset'])}
            {totalRow('Total Current Assets', totalCurrentAssets, '#e8f5e9')}
            {renderGroup('Fixed Assets', sections['Fixed Asset'])}
            {renderGroup('Accumulated Depreciation', sections['Fixed Asset (contra)'])}
            {totalRow('Total Fixed Assets', totalFixedAssets, '#e8f5e9')}
            {totalRow('TOTAL ASSETS', totalAssets, '#1a2a4a')}
            <tr style={{ background: '#dde7f5' }}><td style={{ ...td, fontWeight: 800, fontSize: '1.05rem' }} colSpan={2}>LIABILITIES</td></tr>
            {renderGroup('Credit Cards', sections['Credit Card'])}
            {renderGroup('Accounts Payable', sections['Accounts Payable'])}
            {renderGroup('Other Current Liabilities', sections['Other Current Liability'])}
            {totalRow('Total Current Liabilities', totalCurrentLiabs, '#fff3e0')}
            {renderGroup('Long-Term Liabilities', sections['Long-Term Liability'])}
            {totalRow('Total Long-Term Liabilities', totalLongTerm, '#fff3e0')}
            {totalRow('TOTAL LIABILITIES', totalLiabs, '#fce4ec')}
            <tr style={{ background: '#dde7f5' }}><td style={{ ...td, fontWeight: 800, fontSize: '1.05rem' }} colSpan={2}>EQUITY</td></tr>
            {renderGroup('Equity', sections['Equity'])}
            {totalRow('TOTAL EQUITY', totalEquity, '#c8e6c9')}
            {totalRow('TOTAL LIABILITIES + EQUITY', totalLiabs + totalEquity, '#1a2a4a')}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', fontWeight: 600 };
const td = { padding: '6px 12px', borderBottom: '1px solid #eee' };
const tdRight = { padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'monospace' };
