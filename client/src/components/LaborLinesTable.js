import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LaborLinesTable({ recordId, laborLines, isEditable, onUpdate }) {
  const { canSeeFinancials, isTechnician, user } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ technician_id: '', description: '', hours: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditHours, setQuickEditHours] = useState('');

  useEffect(() => {
    api.getTechnicians().then(setTechnicians).catch(() => {});
  }, []);

  const formatCurrency = (val) =>
    parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const totalHours = (laborLines || []).reduce((sum, l) => sum + parseFloat(l.hours || 0), 0);
  const laborSubtotal = (laborLines || []).reduce((sum, l) => sum + parseFloat(l.line_total || 0), 0);

  const resetForm = () => {
    setForm({ technician_id: '', description: '', hours: '' });
    setError('');
  };

  const handleAdd = async () => {
    if (!form.description) {
      setError('Description is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.addLabor(recordId, {
        technician_id: form.technician_id ? parseInt(form.technician_id) : undefined,
        description: form.description,
        hours: form.hours ? parseFloat(form.hours) : 0,
      });
      setShowAddForm(false);
      resetForm();
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (line) => {
    setEditingId(line.id);
    setForm({
      technician_id: line.technician_id || '',
      description: line.description,
      hours: parseFloat(line.hours),
    });
    setError('');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateLabor(recordId, editingId, {
        technician_id: form.technician_id ? parseInt(form.technician_id) : undefined,
        description: form.description,
        hours: parseFloat(form.hours || 0),
      });
      setEditingId(null);
      resetForm();
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lineId) => {
    if (!window.confirm('Delete this labor line?')) return;
    try {
      await api.deleteLabor(recordId, lineId);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  // Quick inline hours edit
  const startQuickEdit = (line) => {
    setQuickEditId(line.id);
    setQuickEditHours(parseFloat(line.hours).toString());
  };

  const saveQuickEdit = async (lineId) => {
    const newHours = parseFloat(quickEditHours || 0);
    if (isNaN(newHours) || newHours < 0) return;
    try {
      await api.updateLabor(recordId, lineId, { hours: newHours });
      setQuickEditId(null);
      setQuickEditHours('');
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickEditKeyDown = (e, lineId) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      saveQuickEdit(lineId);
    } else if (e.key === 'Escape') {
      setQuickEditId(null);
      setQuickEditHours('');
    }
  };

  const hoursNeedAttention = (line) => parseFloat(line.hours || 0) === 0;

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>Labor Lines</h2>
        {(isEditable || isTechnician) && !showAddForm && (
          <button onClick={() => { setShowAddForm(true); resetForm(); }} style={btnSmallPrimary}>
            + Add Labor
          </button>
        )}
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Technician</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Hours</th>
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>}
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Subtotal</th>}
            {(isEditable || isTechnician) && <th style={{ ...thStyle, width: '80px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {(laborLines || []).map((line) =>
            editingId === line.id ? (
              <tr key={line.id} style={{ backgroundColor: '#fffbeb' }}>
                <td style={tdStyle}>L</td>
                <td style={tdStyle}>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inlineInput, minHeight: '80px', resize: 'vertical' }} rows={3} />
                </td>
                <td style={tdStyle}>
                  <select value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })} style={inlineInput}>
                    <option value="">Unassigned</option>
                    {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.25" min="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={{ ...inlineInput, width: '70px', textAlign: 'right' }} />
                </td>
                {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>{formatCurrency(line.rate)}</td>}
                {canSeeFinancials && (
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>
                    {form.hours ? formatCurrency(parseFloat(form.hours) * parseFloat(line.rate)) : '$0.00'}
                  </td>
                )}
                <td style={tdStyle}>
                  <button onClick={handleSaveEdit} disabled={saving} style={btnTiny}>Save</button>
                  <button onClick={() => { setEditingId(null); resetForm(); }} style={btnTinyGray}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={line.id} style={hoursNeedAttention(line) ? { backgroundColor: '#fff3cd' } : undefined}>
                <td style={tdStyle}>{line.line_type}</td>
                <td style={{ ...tdStyle, whiteSpace: 'pre-wrap' }}>{line.description}</td>
                <td style={tdStyle}>{line.technician_name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {quickEditId === line.id ? (
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={quickEditHours}
                      onChange={(e) => setQuickEditHours(e.target.value)}
                      onKeyDown={(e) => handleQuickEditKeyDown(e, line.id)}
                      onBlur={() => saveQuickEdit(line.id)}
                      autoFocus
                      style={{ ...inlineInput, width: '70px', textAlign: 'right' }}
                    />
                  ) : (
                    <span
                      onClick={(isEditable || isTechnician) ? () => startQuickEdit(line) : undefined}
                      style={(isEditable || isTechnician) ? { cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', gap: '6px' } : undefined}
                      title={(isEditable || isTechnician) ? 'Click to edit hours' : undefined}
                    >
                      {parseFloat(line.hours).toFixed(2)}
                      {hoursNeedAttention(line) && (
                        <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600 }}>&#9888; Hours needed</span>
                      )}
                    </span>
                  )}
                </td>
                {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.rate)}</td>}
                {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.line_total)}</td>}
                {(isEditable || isTechnician) && (
                  <td style={tdStyle}>
                    {(isEditable || (isTechnician && line.technician_id === user?.technician_id)) && (
                      <>
                        <button onClick={() => handleEdit(line)} style={btnTinyGray} title="Edit labor line">&#9998;</button>
                        <button onClick={() => handleDelete(line.id)} style={btnTinyDanger}>Del</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            )
          )}

          {/* Add form row */}
          {showAddForm && (
            <tr style={{ backgroundColor: '#f0fdf4' }}>
              <td style={tdStyle}>L</td>
              <td style={tdStyle}>
                <textarea placeholder="Labor description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inlineInput, minHeight: '80px', resize: 'vertical' }} rows={3} />
              </td>
              <td style={tdStyle}>
                {isTechnician ? (
                  <select value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })} style={inlineInput}>
                    <option value="">Select...</option>
                    {technicians.filter(t => t.name === user?.name).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                ) : (
                  <select value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })} style={inlineInput}>
                    <option value="">Unassigned</option>
                    {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </td>
              <td style={tdStyle}>
                <input type="number" step="0.25" min="0" placeholder="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={{ ...inlineInput, width: '70px', textAlign: 'right' }} />
              </td>
              {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>$198.00</td>}
              {canSeeFinancials && (
                <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>
                  {form.hours ? formatCurrency(parseFloat(form.hours) * 198) : '$0.00'}
                </td>
              )}
              <td style={tdStyle}>
                <button onClick={handleAdd} disabled={saving} style={btnTiny}>{saving ? '...' : 'Add'}</button>
                <button onClick={() => setShowAddForm(false)} style={btnTinyGray}>Cancel</button>
              </td>
            </tr>
          )}

          {/* No rows message */}
          {(!laborLines || laborLines.length === 0) && !showAddForm && (
            <tr><td colSpan={99} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No labor lines yet</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f9fafb', fontWeight: 600 }}>
            <td colSpan={3} style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>TOTAL HOURS: {totalHours.toFixed(2)}</td>
            <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>{totalHours.toFixed(2)}</td>
            {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}></td>}
            {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>{formatCurrency(laborSubtotal)}</td>}
            {(isEditable || isTechnician) && <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const sectionStyle = { marginBottom: '24px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const thStyle = { textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const inlineInput = { padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' };
const errorStyle = { color: 'red', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.8rem' };
const btnSmallPrimary = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnTiny = { padding: '2px 8px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const btnTinyGray = { padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const btnTinyDanger = { padding: '2px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' };
