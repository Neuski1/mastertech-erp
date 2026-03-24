import React, { useState } from 'react';
import { api } from '../api/client';

export default function FreightLinesTable({ recordId, freightLines = [], isEditable, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!form.description.trim()) { setError('Description required'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.addFreightLine(recordId, {
        description: form.description,
        amount: parseFloat(form.amount),
      });
      setForm({ description: '', amount: '' });
      setAdding(false);
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (lineId) => {
    setSaving(true);
    setError('');
    try {
      await api.updateFreightLine(recordId, lineId, {
        description: form.description,
        amount: parseFloat(form.amount),
      });
      setEditingId(null);
      setForm({ description: '', amount: '' });
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lineId) => {
    if (!window.confirm('Delete this freight line?')) return;
    try {
      await api.deleteFreightLine(recordId, lineId);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (line) => {
    setEditingId(line.id);
    setForm({ description: line.description, amount: String(parseFloat(line.amount)) });
    setAdding(false);
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const subtotal = freightLines.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>Freight / Misc. Charges</h2>
        {isEditable && !adding && !editingId && (
          <button onClick={() => { setAdding(true); setForm({ description: '', amount: '' }); }} style={btnAdd}>
            + Add Charge
          </button>
        )}
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '8px' }}>{error}</div>}

      {freightLines.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: 'right', width: '120px' }}>Amount</th>
              {isEditable && <th style={{ ...thStyle, width: '100px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {freightLines.map(line => (
              editingId === line.id ? (
                <tr key={line.id}>
                  <td style={tdStyle}>
                    <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ ...inputStyle, textAlign: 'right' }} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleUpdate(line.id)} disabled={saving} style={btnSave}>{saving ? '...' : 'Save'}</button>
                      <button onClick={() => { setEditingId(null); setForm({ description: '', amount: '' }); }} style={btnCancel}>X</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={line.id}>
                  <td style={tdStyle}>{line.description}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.amount)}</td>
                  {isEditable && (
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => startEdit(line)} style={btnEdit}>Edit</button>
                        <button onClick={() => handleDelete(line.id)} style={btnDel}>Del</button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            ))}
          </tbody>
          {freightLines.length > 1 && (
            <tfoot>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>Subtotal</td>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
                {isEditable && <td style={tdStyle}></td>}
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {freightLines.length === 0 && !adding && (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '8px 0 0' }}>No charges</p>
      )}

      {adding && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Shipping from NTP" style={inputStyle} />
          </div>
          <div style={{ flex: '0 0 120px' }}>
            <label style={labelStyle}>Amount ($)</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" style={inputStyle} />
          </div>
          <button onClick={handleAdd} disabled={saving} style={btnSave}>{saving ? '...' : 'Add'}</button>
          <button onClick={() => { setAdding(false); setError(''); }} style={btnCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}

const sectionStyle = {
  marginBottom: '24px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const sectionTitle = {
  fontSize: '1rem', fontWeight: 700, color: '#1e3a5f',
  marginTop: 0, marginBottom: '16px', paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
};
const thStyle = {
  textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280',
};
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
const btnAdd = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnSave = { padding: '6px 12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' };
const btnCancel = { padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' };
const btnEdit = { padding: '2px 8px', backgroundColor: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
const btnDel = { padding: '2px 8px', backgroundColor: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
