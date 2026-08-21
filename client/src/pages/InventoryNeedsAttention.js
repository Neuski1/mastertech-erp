import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const GROUPS = [
  { key: 'negative',    title: 'Negative stock',        why: 'Impossible quantity. Something was deducted past zero, so a count is wrong somewhere.', fix: 'qty' },
  { key: 'below_cost',  title: 'Priced below cost',     why: 'You lose money every time one of these sells.', fix: 'price' },
  { key: 'duplicates',  title: 'Duplicate part numbers', why: 'The same part number on more than one row. Stock gets split and neither count is right.', fix: null },
  { key: 'no_cost',     title: 'Missing cost',          why: 'No cost means no margin math and understated inventory value.', fix: 'cost' },
  { key: 'no_price',    title: 'Missing sale price',    why: 'Nothing to charge the customer without looking it up every time.', fix: 'price' },
  { key: 'no_supplier', title: 'No supplier',           why: 'Nobody to reorder from when it runs out.', fix: 'vendor' },
  { key: 'no_location', title: 'No location',           why: 'Cannot be found on the shelf without hunting.', fix: 'location' },
];

const LOCATIONS = ['Front Closet', 'Back Room', 'Shop'];

export default function InventoryNeedsAttention() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api.getInventoryNeedsAttention()
      .then((d) => {
        setData(d);
        // open the first group that has rows
        const firstWithRows = GROUPS.find((g) => (d.counts[g.key] || 0) > 0);
        if (firstWithRows) setOpen((o) => (Object.keys(o).length ? o : { [firstWithRows.key]: true }));
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const money = (v) => (v == null || v === '' ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const draftKey = (id, field) => `${id}:${field}`;

  const saveField = async (item, field, value) => {
    setSavingId(item.id);
    setError('');
    try {
      const payload = {};
      if (field === 'qty') payload.qty_on_hand = parseFloat(value);
      if (field === 'cost') payload.cost_each = parseFloat(value);
      if (field === 'price') payload.sale_price_each = parseFloat(value);
      if (field === 'vendor') payload.vendor = value;
      if (field === 'location') payload.location = value;
      await api.updateInventoryItem(item.id, payload);
      load();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSavingId(null);
    }
  };

  const fixCell = (g, item) => {
    if (!g.fix) return <Link to={`/inventory/${item.id}`} style={linkBtn}>Open</Link>;
    const k = draftKey(item.id, g.fix);
    const val = drafts[k] !== undefined ? drafts[k] : '';
    if (g.fix === 'location') {
      return (
        <select
          value={val}
          disabled={savingId === item.id}
          onChange={(e) => { setDrafts({ ...drafts, [k]: e.target.value }); if (e.target.value) saveField(item, 'location', e.target.value); }}
          style={inp}
        >
          <option value="">Set location…</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      );
    }
    const placeholder = g.fix === 'qty' ? 'Correct qty' : g.fix === 'vendor' ? 'Supplier name' : g.fix === 'cost' ? 'Cost' : 'Price';
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          type={g.fix === 'vendor' ? 'text' : 'number'}
          step="0.01"
          value={val}
          placeholder={placeholder}
          disabled={savingId === item.id}
          onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter' && val !== '') saveField(item, g.fix, val); }}
          style={{ ...inp, width: 110 }}
        />
        <button
          disabled={val === '' || savingId === item.id}
          onClick={() => saveField(item, g.fix, val)}
          style={saveBtn}
        >
          {savingId === item.id ? '…' : 'Save'}
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h1 style={{ margin: 0 }}>Inventory — Needs Attention</h1>
        <Link to="/inventory" style={{ ...linkBtn, marginLeft: 'auto' }}>Back to Inventory</Link>
      </div>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Everything wrong with the catalog in one place. Fix what you can inline; anything fixed disappears from the list.
      </p>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      {loading && <p>Loading...</p>}

      {data && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {GROUPS.map((g) => {
              const n = data.counts[g.key] || 0;
              return (
                <button
                  key={g.key}
                  onClick={() => setOpen({ ...open, [g.key]: !open[g.key] })}
                  style={{
                    ...chip,
                    background: n === 0 ? '#f0fdf4' : open[g.key] ? '#1e3a5f' : '#fff',
                    color: n === 0 ? '#065f46' : open[g.key] ? '#fff' : '#1e3a5f',
                    borderColor: n === 0 ? '#bbf7d0' : '#1e3a5f',
                  }}
                >
                  {g.title} <strong style={{ marginLeft: 6 }}>{n}</strong>
                </button>
              );
            })}
            <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
              {data.counts.total} item{data.counts.total === 1 ? '' : 's'} flagged
            </span>
          </div>

          {data.counts.total === 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#065f46', padding: 16, borderRadius: 8 }}>
              Nothing needs attention. The catalog is clean.
            </div>
          )}

          {GROUPS.map((g) => {
            const rows = (data.groups[g.key] || []);
            if (!rows.length || !open[g.key]) return null;
            return (
              <div key={g.key} style={{ marginBottom: 26 }}>
                <h2 style={{ fontSize: '1rem', color: '#1e3a5f', marginBottom: 2 }}>{g.title} ({rows.length})</h2>
                <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#6b7280' }}>{g.why}</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f', color: '#fff', textAlign: 'left' }}>
                      <th style={th}>Part #</th>
                      <th style={th}>Description</th>
                      <th style={{ ...th, textAlign: 'right' }}>Qty</th>
                      <th style={{ ...th, textAlign: 'right' }}>Cost</th>
                      <th style={{ ...th, textAlign: 'right' }}>Price</th>
                      <th style={th}>Supplier</th>
                      <th style={th}>Fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((it) => (
                      <tr key={`${g.key}-${it.id}`} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={td}><Link to={`/inventory/${it.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{it.part_number || '—'}</Link></td>
                        <td style={td}>{it.description}</td>
                        <td style={{ ...td, textAlign: 'right', color: Number(it.qty_on_hand) < 0 ? '#dc2626' : '#111', fontWeight: Number(it.qty_on_hand) < 0 ? 700 : 400 }}>{it.qty_on_hand}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{money(it.cost_each)}</td>
                        <td style={{ ...td, textAlign: 'right', color: g.key === 'below_cost' ? '#dc2626' : '#111' }}>{money(it.sale_price_each)}</td>
                        <td style={td}>{it.vendor || '—'}</td>
                        <td style={td}>{fixCell(g, it)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const th = { padding: '8px 10px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' };
const td = { padding: '7px 10px' };
const chip = { padding: '7px 14px', borderRadius: 999, border: '1px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' };
const inp = { padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.8rem' };
const saveBtn = { padding: '4px 10px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' };
const linkBtn = { padding: '4px 10px', background: '#f3f4f6', color: '#1e3a5f', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' };
