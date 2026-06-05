import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate } from '../utils/dateFormat';

export default function BookkeepingJournalEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    api.getJournalEntries()
      .then(setEntries)
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <h2 style={{ marginTop: 0 }}>Journal Entries</h2>
      {error && <div style={{ background:'#fee', color:'#900', padding:12, borderRadius:6, marginBottom:16 }}>{error}</div>}
      {loading ? <p>Loading...</p> : entries.length === 0 ? <p>No journal entries posted yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={th}></th>
              <th style={th}>Date</th>
              <th style={th}>Description</th>
              <th style={th}>Source</th>
              <th style={th}>Posted By</th>
              <th style={{ ...th, textAlign: 'right' }}>Debits</th>
              <th style={{ ...th, textAlign: 'right' }}>Credits</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <React.Fragment key={e.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => toggle(e.id)}>
                  <td style={td}>{expanded.has(e.id) ? '▼' : '▶'}</td>
                  <td style={td}>{formatDate(e.entry_date)}</td>
                  <td style={td}>{e.description}</td>
                  <td style={td}>{e.source}</td>
                  <td style={td}>{e.posted_by}</td>
                  <td style={{ ...td, textAlign: 'right' }}>${fmt(e.total_debit)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>${fmt(e.total_credit)}</td>
                </tr>
                {expanded.has(e.id) && (
                  <tr>
                    <td colSpan={7} style={{ background: '#fafafa', padding: '12px 24px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left' }}>
                            <th style={th2}>Acct</th>
                            <th style={th2}>Account</th>
                            <th style={th2}>Memo</th>
                            <th style={{ ...th2, textAlign: 'right' }}>Debit</th>
                            <th style={{ ...th2, textAlign: 'right' }}>Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(e.lines || []).map((l, idx) => (
                            <tr key={idx}>
                              <td style={td2}>{l.account_number}</td>
                              <td style={td2}>{l.account_name}</td>
                              <td style={td2}>{l.memo}</td>
                              <td style={{ ...td2, textAlign: 'right' }}>{Number(l.debit) > 0 ? '$' + fmt(l.debit) : ''}</td>
                              <td style={{ ...td2, textAlign: 'right' }}>{Number(l.credit) > 0 ? '$' + fmt(l.credit) : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th  = { padding: '10px 12px', borderBottom: '2px solid #ddd', fontWeight: 600 };
const td  = { padding: '10px 12px', borderBottom: '1px solid #eee' };
const th2 = { padding: '6px 12px', borderBottom: '1px solid #ccc', fontSize: '0.85rem', color: '#666' };
const td2 = { padding: '6px 12px', borderBottom: '1px solid #eee', fontSize: '0.9rem' };
