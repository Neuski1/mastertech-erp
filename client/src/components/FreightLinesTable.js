import React, { useState } from 'react';
import { api } from '../api/client';

export default function FreightLinesTable({ recordId, freightLines = [], isEditable, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showStorageCalc, setShowStorageCalc] = useState(false);
  const [calcDays, setCalcDays] = useState('');
  const [calcRate, setCalcRate] = useState('25.00');
  const [calcDesc, setCalcDesc] = useState('Outdoor storage');
  const [calcSaving, setCalcSaving] = useState(false);

  const calcTotal = (parseFloat(calcDays) || 0) * (parseFloat(calcRate) || 0);
  const calcDescAuto = `Outdoor storage — ${calcDays || 0} days @ $${parseFloat(calcRate || 0).toFixed(2)}/day`;

  const openStorageCalc = () => {
    setCalcDays('');
    setCalcRate('25.00');
    setCalcDesc('');
    setShowStorageCalc(true);
    setError('');
  };

  const handleAddStorageFee = async () => {
    const days = parseFloat(calcDays);
    const rate = parseFloat(calcRate);
    if (!days || days <= 0) { setError('Enter number of days'); return; }
    if (!rate || rate <= 0) { setError('Enter rate per day'); return; }
    const total = parseFloat((days * rate).toFixed(2));
    const desc = calcDesc || calcDescAuto;
    setCalcSaving(true);
    setError('');
    try {
      await api.addFreightLine(recordId, { description: desc, amount: total });
      setShowStorageCalc(false);
      onUpdate();
      alert(`Storage fee of $${total.toFixed(2)} added to record`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCalcSaving(false);
    }
  };

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setAdding(true); setForm({ description: '', amount: '' }); }} style={btnAdd}>
              + Add Charge
            </button>
            <button onClick={openStorageCalc} style={{ ...btnAdd, backgroundColor: '#7c3aed' }}>
              Storage Fee Calculator
            </button>
          </div>
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

      {/* Storage Fee Calculator Modal */}
      {showStorageCalc && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Calculate Storage Fee</h3>
            {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '8px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Days Stored</label>
                <input
                  type="number"
                  min="1"
                  value={calcDays}
                  onChange={(e) => { setCalcDays(e.target.value); setCalcDesc(`Outdoor storage — ${e.target.value || 0} days @ $${parseFloat(calcRate || 0).toFixed(2)}/day`); }}
                  placeholder="Enter days"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Rate Per Day ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={calcRate}
                  onChange={(e) => { setCalcRate(e.target.value); setCalcDesc(`Outdoor storage — ${calcDays || 0} days @ $${parseFloat(e.target.value || 0).toFixed(2)}/day`); }}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Fee</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}>${calcTotal.toFixed(2)}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <input
                value={calcDesc}
                onChange={(e) => setCalcDesc(e.target.value)}
                style={inputStyle}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 16px', fontStyle: 'italic' }}>
              Storage fees are not subject to sales tax
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowStorageCalc(false); setError(''); }} style={btnCancel}>Cancel</button>
              <button onClick={handleAddStorageFee} disabled={calcSaving} style={btnSave}>
                {calcSaving ? 'Adding...' : 'Add to Record'}
              </button>
            </div>
          </div>
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
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
