import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Standalone fetch that runs to completion even if the component unmounts.
// This prevents lost saves when the user navigates away right after changing a field.
async function sendLaborUpdate(recordId, lineId, data) {
  const token = sessionStorage.getItem('erp_token');
  const res = await fetch(`${API_BASE}/labor/${recordId}/${lineId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
    keepalive: true, // ensures fetch completes even during page navigation
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Save failed' }));
    throw new Error(err.error || 'Save failed');
  }
  return res.json();
}

export default function LaborLinesTable({ recordId, laborLines, isEditable, onUpdate }) {
  const { canSeeFinancials, isTechnician } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ technician_id: '', description: '', hours: '', no_charge: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedLineId, setSavedLineId] = useState(null);

  useEffect(() => {
    api.getTechnicians().then(setTechnicians).catch(() => {});
  }, []);

  const formatCurrency = (val) =>
    parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const totalHours = (laborLines || []).reduce((sum, l) => sum + parseFloat(l.hours || 0), 0);
  const laborSubtotal = (laborLines || []).reduce((sum, l) => sum + (l.no_charge ? 0 : parseFloat(l.line_total || 0)), 0);

  const resetForm = () => {
    setForm({ technician_id: '', description: '', hours: '', no_charge: false });
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
        no_charge: form.no_charge,
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

  const handleDelete = async (lineId) => {
    if (!window.confirm('Delete this labor line?')) return;
    try {
      await api.deleteLabor(recordId, lineId);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  // Inline save for any field.
  // Uses a fire-and-forget fetch via sendLaborUpdate so the save completes
  // even if the user navigates away before the response arrives.
  const handleInlineSave = (lineId, field, value) => {
    const data = {};
    if (field === 'technician_id') data.technician_id = value ? parseInt(value) : null;
    if (field === 'description') data.description = value;
    if (field === 'hours') data.hours = parseFloat(value || 0);
    if (field === 'no_charge') data.no_charge = value;
    if (field === 'contractor_cost') data.contractor_cost = value;

    // Fire the save — this fetch runs to completion regardless of component unmount
    sendLaborUpdate(recordId, lineId, data)
      .then((result) => {
        console.log(`Saved ${field} for labor line ${lineId}:`, result?.technician_id);
        setSavedLineId(lineId);
        setTimeout(() => setSavedLineId(null), 1500);
        onUpdate();
      })
      .catch((err) => {
        console.error(`Error saving ${field} for labor line ${lineId}:`, err);
        setError(err.message);
      });
  };

  const canEdit = isEditable || isTechnician;
  const hoursNeedAttention = (line) => parseFloat(line.hours || 0) === 0;

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>Labor Lines</h2>
        {canEdit && !showAddForm && (
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
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Contractor Cost</th>}
            {canEdit && <th style={{ ...thStyle, textAlign: 'center', width: '40px' }}>N/C</th>}
            {canEdit && <th style={{ ...thStyle, width: '50px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {(laborLines || []).map((line) => (
            <tr key={line.id} style={
              line.no_charge
                ? { backgroundColor: '#f0f9ff' }
                : hoursNeedAttention(line) ? { backgroundColor: '#fff3cd' } : undefined
            }>
              <td style={tdStyle}>L</td>

              {/* Description — always editable, auto-expands */}
              <td style={tdStyle}>
                {canEdit ? (
                  <textarea
                    key={`desc-${line.id}-${line.updated_at || line.id}`}
                    defaultValue={line.description}
                    ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    onBlur={(e) => {
                      if (e.target.value !== line.description) handleInlineSave(line.id, 'description', e.target.value);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur(); } }}
                    style={{ ...inlineEditable, minHeight: '36px', resize: 'none', whiteSpace: 'pre-wrap', overflow: 'hidden' }}
                  />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>
                    {line.description}
                    {line.no_charge && <span style={ncBadge}>N/C</span>}
                  </span>
                )}
              </td>

              {/* Technician — always a dropdown */}
              <td style={tdStyle}>
                {canEdit ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select
                      value={line.technician_id != null ? String(line.technician_id) : ''}
                      onChange={(e) => handleInlineSave(line.id, 'technician_id', e.target.value)}
                      style={inlineSelect}
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                    </select>
                    {savedLineId === line.id && <span style={savedBadge}>Saved</span>}
                  </div>
                ) : (
                  line.technician_name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>
                )}
              </td>

              {/* Hours — always editable */}
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                {canEdit ? (
                  <input
                    key={`hours-${line.id}-${line.hours}`}
                    type="number"
                    step="0.25"
                    min="0"
                    defaultValue={parseFloat(line.hours).toFixed(2)}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v !== parseFloat(line.hours)) handleInlineSave(line.id, 'hours', e.target.value);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    style={{ ...inlineEditable, width: '70px', textAlign: 'right' }}
                  />
                ) : (
                  <span>
                    {parseFloat(line.hours).toFixed(2)}
                    {hoursNeedAttention(line) && (
                      <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600, marginLeft: '4px' }}>&#9888;</span>
                    )}
                  </span>
                )}
              </td>

              {canSeeFinancials && (
                <td style={{ ...tdStyle, textAlign: 'right', color: line.no_charge ? '#9ca3af' : undefined }}>
                  {formatCurrency(line.rate)}
                </td>
              )}
              {canSeeFinancials && (
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {line.no_charge ? (
                    <span style={{ color: '#9ca3af' }}>$0.00 <span style={ncBadge}>N/C</span></span>
                  ) : (
                    formatCurrency(line.line_total)
                  )}
                </td>
              )}

              {/* Contractor Cost — editable inline */}
              {canSeeFinancials && (
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {canEdit ? (
                    <input
                      key={`cost-${line.id}-${line.contractor_cost}`}
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={line.contractor_cost != null ? parseFloat(line.contractor_cost).toFixed(2) : ''}
                      placeholder="0.00"
                      onBlur={(e) => {
                        const newVal = e.target.value !== '' ? parseFloat(e.target.value) : null;
                        const oldVal = line.contractor_cost != null ? parseFloat(line.contractor_cost) : null;
                        if (newVal !== oldVal) handleInlineSave(line.id, 'contractor_cost', e.target.value || null);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      style={{ ...inlineEditable, width: '85px', textAlign: 'right' }}
                    />
                  ) : (
                    line.contractor_cost != null ? formatCurrency(line.contractor_cost) : <span style={{ color: '#d1d5db' }}>$0.00</span>
                  )}
                </td>
              )}

              {/* No Charge toggle */}
              {canEdit && (
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!line.no_charge}
                    onChange={(e) => handleInlineSave(line.id, 'no_charge', e.target.checked)}
                    title="No Charge"
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </td>
              )}

              {canEdit && (
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(line.id)} style={btnTinyDanger}>Del</button>
                </td>
              )}
            </tr>
          ))}

          {/* Add form row */}
          {showAddForm && (
            <tr style={{ backgroundColor: '#f0fdf4' }}>
              <td style={tdStyle}>L</td>
              <td style={tdStyle}>
                <textarea placeholder="Labor description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inlineInput, minHeight: '80px', resize: 'vertical' }} rows={3} />
              </td>
              <td style={tdStyle}>
                <select value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })} style={inlineInput}>
                  <option value="">Unassigned</option>
                  {technicians.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                </select>
              </td>
              <td style={tdStyle}>
                <input type="number" step="0.25" min="0" placeholder="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={{ ...inlineInput, width: '70px', textAlign: 'right' }} />
              </td>
              {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>$198.00</td>}
              {canSeeFinancials && (
                <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>
                  {form.no_charge ? '$0.00' : (form.hours ? formatCurrency(parseFloat(form.hours) * 198) : '$0.00')}
                </td>
              )}
              {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right', color: '#9ca3af' }}>—</td>}
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={form.no_charge} onChange={(e) => setForm({ ...form, no_charge: e.target.checked })} style={{ cursor: 'pointer' }} />
                  N/C
                </label>
              </td>
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
            {canSeeFinancials && (
              <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>
                {formatCurrency((laborLines || []).reduce((s, l) => s + (parseFloat(l.contractor_cost) || 0), 0) || 0)}
              </td>
            )}
            {canEdit && <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>}
            {canEdit && <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>}
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
const inlineEditable = { padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box', backgroundColor: '#fefce8' };
const inlineSelect = { padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: '#fefce8', cursor: 'pointer' };
const savedBadge = { position: 'absolute', top: '-6px', right: '-8px', fontSize: '0.6rem', color: '#059669', fontWeight: 700, backgroundColor: '#d1fae5', padding: '1px 4px', borderRadius: '3px' };
const ncBadge = { display: 'inline-block', marginLeft: '6px', padding: '1px 6px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1e40af' };
const errorStyle = { color: 'red', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.8rem' };
const btnSmallPrimary = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnTiny = { padding: '2px 8px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const btnTinyGray = { padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const btnTinyDanger = { padding: '2px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' };
