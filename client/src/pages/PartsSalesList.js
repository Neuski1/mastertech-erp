import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function PartsSalesList() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSales = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getPartsSales(params);
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, [statusFilter]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchSales();
  };

  const handleNew = async () => {
    try {
      const sale = await api.createPartsSale({});
      navigate(`/parts-sales/${sale.id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatCurrency = (val) =>
    parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const colors = { open: { bg: '#fef3c7', color: '#92400e' }, paid: { bg: '#d1fae5', color: '#065f46' }, void: { bg: '#fee2e2', color: '#991b1b' } };
    const c = colors[status] || colors.open;
    return (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: c.bg, color: c.color, textTransform: 'uppercase' }}>
        {status}
      </span>
    );
  };

  const getCustomerName = (sale) => {
    if (sale.last_name) return `${sale.last_name}${sale.first_name ? ', ' + sale.first_name : ''}`;
    return sale.customer_name || 'Walk-in';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Parts Sales</h1>
        <button onClick={handleNew} style={btnPrimary}>+ New Parts Sale</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search by sale # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="paid">Paid</option>
          <option value="void">Void</option>
        </select>
        <button onClick={fetchSales} style={btnSecondary}>Search</button>
      </div>

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Sale #</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Customer</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Due</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No parts sales found</td></tr>
            )}
            {sales.map(sale => (
              <tr key={sale.id} onClick={() => navigate(`/parts-sales/${sale.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}><span style={{ fontWeight: 600, color: '#1e3a5f' }}>{sale.sale_number}</span></td>
                <td style={tdStyle}>{formatDate(sale.sale_date)}</td>
                <td style={tdStyle}>{getCustomerName(sale)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(sale.total_amount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: parseFloat(sale.amount_due) > 0 ? '#dc2626' : '#065f46' }}>{formatCurrency(sale.amount_due)}</td>
                <td style={tdStyle}>{statusBadge(sale.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const inputStyle = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', boxSizing: 'border-box' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb', letterSpacing: '0.05em' };
const tdStyle = { padding: '10px 12px', fontSize: '0.875rem' };
