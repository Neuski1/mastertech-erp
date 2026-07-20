import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { formatDate } from '../utils/dateFormat';

const NAVY = '#1e3a5f';
const AMBER = '#f59e0b';

const ORDER_STATUS_LABEL = {
  ordered: { label: 'ORDERED', bg: '#fef3c7', color: '#92400e' },
  not_ordered: { label: 'NOT ORDERED', bg: '#e0f2fe', color: '#0369a1' },
  backordered: { label: 'BACKORDERED', bg: '#fee2e2', color: '#991b1b' },
};

function fmtDate(d) {
  if (!d) return '—';
  try { return formatDate(d); } catch { return d; }
}

// A line is "overdue" when it is ordered and either has no ETA at all or the
// ETA is in the past. That is exactly what the writer needs to chase.
function isOverdue(line) {
  if (line.order_status !== 'ordered') return false;
  if (!line.order_eta) return true;
  return new Date(line.order_eta) < new Date(new Date().toDateString());
}

export default function PartsOnOrder() {
  const [lines, setLines] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (opts) => {
    const silent = !!(opts && opts.silent === true);
    if (!silent) setLoading(true);
    try {
      const [data, em] = await Promise.all([
        api.getPartsOnOrder(),
        api.getUnmatchedOrderEmails().catch(() => []),
      ]);
      setLines(data || []);
      setEmails(em || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const autoRefreshParts = useCallback(() => load({ silent: true }), [load]);
  useAutoRefresh(autoRefreshParts);

  useEffect(() => { load(); }, [load]);

  const startEdit = (line) => {
    setEditId(line.id);
    setForm({
      order_status: line.order_status || 'ordered',
      order_supplier: line.order_supplier || '',
      order_number: line.order_number || '',
      order_tracking: line.order_tracking || '',
      order_eta: line.order_eta ? String(line.order_eta).slice(0, 10) : '',
      order_date: line.order_date ? String(line.order_date).slice(0, 10) : '',
    });
  };

  const cancelEdit = () => { setEditId(null); setForm({}); };

  const saveEdit = async (line) => {
    setSaving(true);
    try {
      await api.updatePart(line.record_id, line.id, {
        order_status: form.order_status,
        order_supplier: form.order_supplier,
        order_number: form.order_number,
        order_tracking: form.order_tracking,
        order_eta: form.order_eta || null,
        order_date: form.order_date || null,
      });
      setEditId(null);
      setForm({});
      await load();
    } catch (err) {
      alert('Could not save: ' + (err.message || 'error'));
    } finally {
      setSaving(false);
    }
  };

  const overdueCount = lines.filter(isOverdue).length;

  const th = { textAlign: 'left', padding: '8px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', borderBottom: `2px solid ${NAVY}`, whiteSpace: 'nowrap' };
  const td = { padding: '8px 10px', fontSize: '0.85rem', color: '#111', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' };
  const input = { padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '100%' };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ color: NAVY, margin: 0, fontSize: '1.5rem' }}>Parts on Order</h1>
        <button onClick={load} style={{ padding: '8px 16px', background: NAVY, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Refresh</button>
      </div>
      <p style={{ color: '#6b7280', marginTop: 0, fontSize: '0.9rem' }}>
        Every part still on order across open jobs, oldest first. {overdueCount > 0 && (
          <strong style={{ color: '#991b1b' }}>{overdueCount} need chasing (no ETA or past due).</strong>
        )}
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#991b1b' }}>{error}</p>}

      {!loading && !error && lines.length === 0 && (
        <p style={{ color: '#6b7280' }}>Nothing on order right now. Nice and clear.</p>
      )}

      {!loading && lines.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>WO #</th>
                <th style={th}>Customer</th>
                <th style={th}>Part</th>
                <th style={th}>Supplier</th>
                <th style={th}>PO #</th>
                <th style={th}>Supplier Ord #</th>
                <th style={th}>Ordered</th>
                <th style={th}>ETA</th>
                <th style={th}>Tracking</th>
                <th style={th}>Waiting</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => {
                const editing = editId === line.id;
                const overdue = isOverdue(line);
                return (
                  <tr key={line.id} style={{ background: editing ? '#fffbeb' : overdue ? '#fef2f2' : '#fff' }}>
                    <td style={td}>
                      <Link to={`/records/${line.record_id}`} style={{ color: NAVY, fontWeight: 700, textDecoration: 'none' }}>
                        {line.record_number}
                      </Link>
                    </td>
                    <td style={td}>{line.company_name || line.customer_name || '—'}</td>
                    <td style={td}>
                      <div>{line.description || '—'}</div>
                      {line.part_number && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{line.part_number}</div>}
                    </td>
                    <td style={td}>
                      {editing
                        ? <input style={input} value={form.order_supplier} onChange={e => setForm({ ...form, order_supplier: e.target.value })} placeholder="Supplier" />
                        : (line.order_supplier || '—')}
                    </td>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: line.po_number ? NAVY : '#9ca3af' }}>{line.po_number || '—'}</span></td>
                    <td style={td}>
                      {editing
                        ? <input style={input} value={form.order_number} onChange={e => setForm({ ...form, order_number: e.target.value })} placeholder="Order #" />
                        : (line.order_number || '—')}
                    </td>
                    <td style={td}>
                      {editing
                        ? <input type="date" style={input} value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} />
                        : fmtDate(line.order_date)}
                    </td>
                    <td style={{ ...td, color: overdue ? '#991b1b' : '#111', fontWeight: overdue ? 700 : 400 }}>
                      {editing
                        ? <input type="date" style={input} value={form.order_eta} onChange={e => setForm({ ...form, order_eta: e.target.value })} />
                        : fmtDate(line.order_eta)}
                    </td>
                    <td style={td}>
                      {editing
                        ? <input style={input} value={form.order_tracking} onChange={e => setForm({ ...form, order_tracking: e.target.value })} placeholder="Tracking" />
                        : (line.order_tracking || '—')}
                    </td>
                    <td style={td}>{line.days_waiting != null ? `${line.days_waiting}d` : '—'}</td>
                    <td style={td}>
                      {editing ? (
                        <select style={input} value={form.order_status} onChange={e => setForm({ ...form, order_status: e.target.value })}>
                          <option value="not_ordered">Not Ordered</option>
                          <option value="ordered">Ordered</option>
                          <option value="backordered">Backordered</option>
                          <option value="received">Received</option>
                        </select>
                      ) : (() => {
                        const s = ORDER_STATUS_LABEL[line.order_status] || { label: (line.order_status || '').toUpperCase(), bg: '#f3f4f6', color: '#374151' };
                        return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>;
                      })()}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {editing ? (
                        <>
                          <button disabled={saving} onClick={() => saveEdit(line)} style={{ padding: '3px 8px', background: NAVY, color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', marginRight: 4 }}>{saving ? '...' : 'Save'}</button>
                          <button disabled={saving} onClick={cancelEdit} style={{ padding: '3px 8px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(line)} style={{ padding: '3px 10px', background: '#f3f4f6', color: NAVY, border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Unmatched supplier emails — populated once email auto-fill ships. */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: NAVY, fontSize: '1.1rem', marginBottom: 6 }}>Unmatched Order Emails</h2>
        {emails.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
            None. Supplier confirmation emails that cannot be auto-matched to a PO will land here for a quick manual link (email auto-fill is the next phase).
          </p>
        ) : (
          <div style={{ overflowX: 'auto', border: `1px solid ${AMBER}`, borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={th}>Received</th>
                  <th style={th}>From</th>
                  <th style={th}>Subject</th>
                  <th style={th}>PO found</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(em => (
                  <tr key={em.id}>
                    <td style={td}>{fmtDate(em.received_at)}</td>
                    <td style={td}>{em.from_addr || '—'}</td>
                    <td style={td}>{em.subject || '—'}</td>
                    <td style={td}>{em.parsed_po || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
