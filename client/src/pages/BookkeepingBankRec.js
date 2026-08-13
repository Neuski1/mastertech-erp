import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate } from '../utils/dateFormat';

export default function BookkeepingBankRec() {
  const monthEnd = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  };
  const [asOf, setAsOf] = useState(monthEnd());
  const [data, setData] = useState(null);
  const [stmt, setStmt] = useState({}); // account_number -> statement ending balance (typed)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    api.getBankReconciliation(asOf)
      .then(setData)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [asOf]);

  const fmt = (n) => (n == null || n === '') ? '' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Bank Reconciliation</h2>
        <label>As of:&nbsp;<input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} style={{ padding: 6, borderRadius: 4 }} /></label>
      </div>
      <p style={{ color: '#555', fontSize: 13, marginTop: 0 }}>
        Enter each account's <strong>bank statement ending balance</strong> for this date. The ledger should match it to the penny. Any difference means the month's close is missing or mis-booked an item.
      </p>
      {error && <div style={{ background: '#fee', color: '#900', padding: 12, borderRadius: 6, marginBottom: 16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : data && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1a2a4a', color: '#fff', textAlign: 'left' }}>
              <th style={th}>Account</th>
              <th style={{ ...th, textAlign: 'right' }}>Ledger Balance</th>
              <th style={{ ...th, textAlign: 'right' }}>Statement Ending Balance</th>
              <th style={{ ...th, textAlign: 'right' }}>Difference</th>
              <th style={{ ...th, textAlign: 'right' }}>Bank Feed (last sync)</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map(a => {
              const typed = stmt[a.account_number];
              const diff = (typed !== undefined && typed !== '') ? (Number(typed) - a.gl_balance) : null;
              const ok = diff != null && Math.abs(diff) < 0.005;
              return (
                <tr key={a.account_number} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}><span style={{ color: '#888', fontFamily: 'monospace', marginRight: 6 }}>{a.account_number}</span>{a.name}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>${fmt(a.gl_balance)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <span style={{ color: '#888' }}>$</span>
                    <input type="number" step="0.01" value={typed ?? ''} placeholder="0.00"
                      onChange={e => setStmt({ ...stmt, [a.account_number]: e.target.value })}
                      style={{ width: 130, padding: '4px 6px', textAlign: 'right', border: '1px solid #ccc', borderRadius: 4 }} />
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace', fontWeight: 700,
                               color: diff == null ? '#999' : ok ? '#0a7d28' : '#b91c1c' }}>
                    {diff == null ? '—' : ok ? '✓ ties' : `$${fmt(diff)}`}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#888', fontSize: 12 }}>
                    {a.feed_balance != null ? `$${fmt(a.feed_balance)}` : '—'}
                    {a.feed_as_of && <div style={{ fontSize: 11 }}>{formatDate(a.feed_as_of)}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p style={{ color: '#888', fontSize: 12, marginTop: 16 }}>
        The ledger balance is built from the monthly close journal entries. The bank feed figure is Plaid's last stored balance and can lag, so reconcile against the actual statement, not the feed.
      </p>
    </div>
  );
}

const th = { padding: '8px 10px', fontSize: 12 };
const td = { padding: '8px 10px' };
