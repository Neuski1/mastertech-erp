import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate, formatDateTime } from '../utils/dateFormat';

export default function BookkeepingChart() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getChartOfAccounts()
      .then(setAccounts)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  const visible = showInactive ? accounts : accounts.filter(a => a.is_active);
  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Group by statement -> account_type
  const groups = {};
  for (const a of visible) {
    (groups[a.statement] = groups[a.statement] || []).push(a);
  }
  const statementOrder = ['Balance Sheet', 'P&L'];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <div className="print-only" style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Master Tech RV Repair & Storage</h1>
        <h2 style={{ margin: 0 }}>Chart of Accounts</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Chart of Accounts</h2>
        <label style={{ fontSize: '0.9rem' }}>
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive
        </label>
        <button className="print-hide" onClick={() => window.print()} style={{ marginLeft: 12, padding: '8px 16px', background: '#1a2a4a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Print</button>
      </div>
      {error && <div style={{ background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : statementOrder.map(stmt => (
        groups[stmt] && (
          <div key={stmt} style={{ marginBottom: 32 }}>
            <h3 style={{ background: '#1a2a4a', color: '#fff', padding: '8px 12px', marginBottom: 0 }}>{stmt}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ ...th, width: 80 }}>Acct #</th>
                  <th style={th}>Name</th>
                  <th style={th}>Type</th>
                  <th style={{ ...th, textAlign: 'right', width: 150 }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {groups[stmt].map(a => (
                  <tr key={a.id}>
                    <td style={td}>{a.account_number}</td>
                    <td style={td}>{a.name}</td>
                    <td style={td}><span style={typeBadge(a.account_type)}>{a.account_type}</span></td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>${fmt(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ))}
    </div>
  );
}

const th = { padding: '10px 12px', borderBottom: '2px solid #ddd', fontWeight: 600, textAlign: 'left' };
const td = { padding: '8px 12px', borderBottom: '1px solid #eee' };
const typeBadge = (t) => ({
  background: '#e0e7ff', color: '#1a2a4a', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem'
});
