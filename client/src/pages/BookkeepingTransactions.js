import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';
import { formatDate } from '../utils/dateFormat';

const PAGE = 100;

export default function BookkeepingTransactions() {
  const [accounts, setAccounts] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState({ account_id: '', start: '', end: '', status: '', q: '' });

  useEffect(() => {
    api.getPlaidAccounts().then(setAccounts).catch(() => {});
  }, []);

  const load = useCallback(async (off) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBankTransactions({ ...filters, limit: PAGE, offset: off });
      setRows(data.transactions || []);
      setTotal(data.total || 0);
      setSumAmount(data.sum_amount || 0);
      setOffset(off);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(0); }, [load]);

  const money = (n) => {
    const v = Number(n || 0);
    return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const acctLabel = (a) => `${a.institution_name ? a.institution_name + ' ' : ''}${a.nickname || a.account_subtype || a.account_type || 'Account'}${a.mask ? ' ••' + a.mask : ''}`;

  const page = Math.floor(offset / PAGE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }} className="print-hide">Bank Transactions</h2>
        <button className="print-hide" onClick={() => window.print()} style={btnDark}>Print</button>
      </div>

      <div className="print-hide" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <label style={lbl}>Account</label>
          <select value={filters.account_id} onChange={(e) => setFilters({ ...filters, account_id: e.target.value })} style={inp}>
            <option value="">All accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{acctLabel(a)}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>From</label>
          <input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>To</label>
          <input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={inp}>
            <option value="">Any</option>
            <option value="pending">Uncategorized</option>
            <option value="reviewed">Reviewed</option>
            <option value="posted">Posted</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>Search</label>
          <input placeholder="Merchant or description" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} style={{ ...inp, width: '100%' }} />
        </div>
        <button onClick={() => load(0)} style={btnDark}>Apply</button>
      </div>

      {error && <div style={{ background: '#fee', color: '#900', padding: 12, borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
        {total.toLocaleString()} transaction{total === 1 ? '' : 's'} &nbsp;|&nbsp; Net amount: {money(sumAmount)}
      </div>

      {loading ? <p>Loading...</p> : rows.length === 0 ? <p>No transactions match these filters.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={th}>Date</th>
              <th style={th}>Account</th>
              <th style={th}>Merchant / Description</th>
              <th style={th}>Category</th>
              <th style={{ ...th, textAlign: 'right' }}>Amount</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{formatDate(t.txn_date)}</td>
                <td style={td}>{t.institution_name}{t.mask ? ' ••' + t.mask : ''}</td>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{t.merchant_name || t.description || '—'}</div>
                  {t.merchant_name && t.description && t.description !== t.merchant_name && (
                    <div style={{ color: '#888', fontSize: 11 }}>{t.description}</div>
                  )}
                  {t.is_transfer && <span style={tag}>transfer</span>}
                </td>
                <td style={td}>{t.gl_number ? `${t.gl_number} ${t.gl_name}` : <span style={{ color: '#c00' }}>Uncategorized</span>}</td>
                <td style={{ ...td, textAlign: 'right', color: Number(t.amount) < 0 ? '#0a7d28' : '#111', fontWeight: 600 }}>{money(t.amount)}</td>
                <td style={td}>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pages > 1 && (
        <div className="print-hide" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
          <button disabled={offset === 0 || loading} onClick={() => load(Math.max(0, offset - PAGE))} style={btnLight}>‹ Prev</button>
          <span style={{ fontSize: 13 }}>Page {page} of {pages}</span>
          <button disabled={page >= pages || loading} onClick={() => load(offset + PAGE)} style={btnLight}>Next ›</button>
        </div>
      )}
      <p style={{ fontSize: 12, color: '#888', marginTop: 16 }}>Transactions sync automatically each morning from your connected banks. Amounts follow Plaid's convention: positive = money out, negative = money in.</p>
    </div>
  );
}

const th = { padding: '8px 10px', borderBottom: '2px solid #1a2a4a', fontSize: 12 };
const td = { padding: '7px 10px', verticalAlign: 'top' };
const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 2 };
const inp = { padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 };
const btnDark = { padding: '8px 16px', background: '#1a2a4a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
const btnLight = { padding: '6px 12px', background: '#f0f0f0', color: '#1a2a4a', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
const tag = { display: 'inline-block', marginTop: 3, fontSize: 10, background: '#eef', color: '#446', border: '1px solid #ccd', borderRadius: 3, padding: '0 4px' };
