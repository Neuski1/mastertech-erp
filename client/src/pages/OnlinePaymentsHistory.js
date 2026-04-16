import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const TYPE_LABELS = { parts_deposit: 'Parts Deposit', final_payment: 'Final Payment' };
const STATUS_STYLES = {
  paid: { background: '#d1fae5', color: '#065f46' },
  pending: { background: '#fef3c7', color: '#92400e' },
  failed: { background: '#fee2e2', color: '#991b1b' },
};

export default function OnlinePaymentsHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [status, setStatus] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (paymentType) params.payment_type = paymentType;
      if (status) params.status = status;
      const data = await api.getOnlinePaymentHistory(params);
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, paymentType, status]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalPaid = rows
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + parseInt(r.amount_cents), 0);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1e3a5f', margin: '0 0 16px' }}>Online Payments</h1>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div>
          <label style={lbl}>From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={input} />
        </div>
        <div>
          <label style={lbl}>To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={input} />
        </div>
        <div>
          <label style={lbl}>Type</label>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={input}>
            <option value="">All types</option>
            <option value="parts_deposit">Parts Deposit</option>
            <option value="final_payment">Final Payment</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button onClick={() => { setDateFrom(''); setDateTo(''); setPaymentType(''); setStatus(''); }}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
          Clear
        </button>
      </div>

      {error && <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 10, fontSize: '0.875rem', color: '#374151' }}>
        {loading ? 'Loading...' : `${rows.length} payment${rows.length === 1 ? '' : 's'} — $${(totalPaid / 100).toFixed(2)} collected`}
      </div>

      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={th}>Date</th>
              <th style={th}>WO #</th>
              <th style={th}>Customer</th>
              <th style={th}>Type</th>
              <th style={{ ...th, textAlign: 'right' }}>Amount</th>
              <th style={th}>Status</th>
              <th style={th}>Email</th>
              <th style={th}>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const name = r.company_name
                || [r.first_name, r.last_name].filter(Boolean).join(' ')
                || 'Customer';
              const dt = r.paid_at || r.created_at;
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={td}>{new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                  <td style={td}>
                    <Link to={`/records/${r.record_id || ''}`} style={{ color: '#1e40af' }}>#{r.record_number}</Link>
                  </td>
                  <td style={td}>{name}</td>
                  <td style={td}>{TYPE_LABELS[r.payment_type] || r.payment_type}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 500 }}>${(parseInt(r.amount_cents) / 100).toFixed(2)}</td>
                  <td style={td}>
                    <span style={{
                      ...STATUS_STYLES[r.status] || { background: '#e5e7eb', color: '#374151' },
                      padding: '2px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize'
                    }}>{r.status}</span>
                  </td>
                  <td style={{ ...td, color: '#6b7280' }}>{r.customer_email || '—'}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280' }}>{r.transaction_id || '—'}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '0.75rem', color: '#374151', marginBottom: 4, fontWeight: 500 };
const input = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem' };
const th = { padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.03em' };
const td = { padding: '10px 12px', fontSize: '0.85rem', color: '#111827' };
