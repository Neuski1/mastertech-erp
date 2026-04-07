import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditRecords, isAdmin } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [units, setUnits] = useState([]);
  const [records, setRecords] = useState([]);
  const [storage, setStorage] = useState([]);
  const [marketingLog, setMarketingLog] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unitFilter, setUnitFilter] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitSaving, setUnitSaving] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [storageCharges, setStorageCharges] = useState([]);

  // Marketing note
  const [noteChannel, setNoteChannel] = useState('Note');
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Merge state
  const [showMerge, setShowMerge] = useState(false);
  const [mergeStep, setMergeStep] = useState(1);
  const [mergeSearch, setMergeSearch] = useState('');
  const [mergeResults, setMergeResults] = useState([]);
  const [mergeSearching, setMergeSearching] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [dupUnits, setDupUnits] = useState([]);
  const [dupRecords, setDupRecords] = useState([]);
  const [dupStorage, setDupStorage] = useState([]);
  const [dupMarketing, setDupMarketing] = useState([]);
  const [keepFields, setKeepFields] = useState({});
  const [merging, setMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [cust, unitList, recList, storList, mktList] = await Promise.all([
        api.getCustomer(id),
        api.getCustomerUnits(id),
        api.getCustomerRecords(id),
        api.getCustomerStorage(id).catch(() => []),
        api.getMarketingLog(id).catch(() => []),
      ]);
      setCustomer(cust);
      setFormData(cust);
      setUnits(unitList);
      setRecords(recList);
      setStorage(storList);
      setMarketingLog(mktList);
      // Fetch storage billing history
      api.getStorageCharges({ customer_id: id }).then(data => {
        setStorageCharges(Array.isArray(data) ? data : data.charges || []);
      }).catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUnitClick = (unit) => {
    if (selectedUnit?.id === unit.id) {
      setSelectedUnit(null);
      setEditingUnit(null);
    } else {
      setSelectedUnit(unit);
      setEditingUnit(null);
      setUnitFilter(unit);
    }
  };

  const startEditUnit = (unit) => {
    setEditingUnit({ ...unit });
  };

  const handleSaveUnit = async () => {
    setUnitSaving(true);
    try {
      await api.updateUnit(editingUnit.id, {
        year: editingUnit.year || null,
        make: editingUnit.make || null,
        model: editingUnit.model || null,
        vin: editingUnit.vin || null,
        license_plate: editingUnit.license_plate || null,
        unit_type: editingUnit.unit_type || null,
        color: editingUnit.color || null,
        linear_feet: editingUnit.linear_feet ? parseFloat(editingUnit.linear_feet) : null,
        unit_notes: editingUnit.unit_notes || null,
      });
      setEditingUnit(null);
      // Refresh units
      const unitList = await api.getCustomerUnits(id);
      setUnits(unitList);
      const updated = unitList.find(u => u.id === selectedUnit.id);
      if (updated) setSelectedUnit(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUnitSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    const name = `${customer.last_name || ''}${customer.first_name ? ', ' + customer.first_name : ''}`.trim();
    if (!window.confirm(
      `Delete ${name}?\n\nThis will also delete all units associated with this customer. Records and invoices will be preserved for accounting purposes.\n\nThis cannot be undone.`
    )) return;
    try {
      await api.deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const fields = ['first_name', 'last_name', 'company_name', 'phone_primary',
        'phone_secondary', 'email_primary', 'address_street', 'address_city',
        'address_state', 'address_zip', 'notes'];
      const updates = {};
      fields.forEach(f => {
        if (formData[f] !== customer[f]) updates[f] = formData[f];
      });
      if (Object.keys(updates).length > 0) {
        await api.updateCustomer(id, updates);
      }
      setEditing(false);
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await api.addMarketingNote({ customer_id: parseInt(id), channel: noteChannel, notes: noteText });
      setNoteText('');
      const updated = await api.getMarketingLog(id);
      setMarketingLog(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setNoteSaving(false);
    }
  };

  // Merge helpers
  const handleMergeSearch = async (term) => {
    setMergeSearch(term);
    if (term.length < 2) { setMergeResults([]); return; }
    setMergeSearching(true);
    try {
      const data = await api.getCustomers({ search: term, limit: 20 });
      setMergeResults(data.customers.filter(c => c.id !== parseInt(id)));
    } catch (err) { /* ignore */ }
    finally { setMergeSearching(false); }
  };

  const selectDuplicate = async (dup) => {
    setDuplicate(dup);
    setMergeStep(2);
    setKeepFields({});
    // Load duplicate's related data counts
    try {
      const [u, r, s, mk] = await Promise.all([
        api.getCustomerUnits(dup.id),
        api.getCustomerRecords(dup.id),
        api.getCustomerStorage(dup.id).catch(() => []),
        api.getMarketingLog(dup.id).catch(() => []),
      ]);
      setDupUnits(u);
      setDupRecords(r);
      setDupStorage(s);
      setDupMarketing(mk);
    } catch (err) { /* ignore */ }
  };

  const mergeFieldList = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'company_name', label: 'Company' },
    { key: 'phone_primary', label: 'Phone 1' },
    { key: 'phone_secondary', label: 'Phone 2' },
    { key: 'email_primary', label: 'Email' },
    { key: 'address_street', label: 'Street' },
    { key: 'address_city', label: 'City' },
    { key: 'address_state', label: 'State' },
    { key: 'address_zip', label: 'ZIP' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleConfirmMerge = async () => {
    setMerging(true);
    try {
      const result = await api.mergeCustomers(id, { duplicateId: duplicate.id, keepFields });
      const m = result.merged;
      const parts = [];
      if (m.records) parts.push(`${m.records} records`);
      if (m.units) parts.push(`${m.units} units`);
      if (m.appointments) parts.push(`${m.appointments} appointments`);
      if (m.storage) parts.push(`${m.storage} storage assignments`);
      if (m.communications) parts.push(`${m.communications} communications`);
      if (m.marketing) parts.push(`${m.marketing} marketing notes`);
      setMergeSuccess(`Customers merged successfully. ${parts.length > 0 ? parts.join(', ') + ' reassigned.' : 'No related records to reassign.'}`);
      setShowMerge(false);
      resetMerge();
      await fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setMerging(false);
    }
  };

  const resetMerge = () => {
    setMergeStep(1);
    setMergeSearch('');
    setMergeResults([]);
    setDuplicate(null);
    setDupUnits([]);
    setDupRecords([]);
    setDupStorage([]);
    setDupMarketing([]);
    setKeepFields({});
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '—' : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (error && !customer) return <div style={{ color: 'red', padding: '40px' }}>Error: {error}</div>;
  if (!customer) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const filteredRecords = unitFilter
    ? records.filter(r => r.year === unitFilter.year && r.make === unitFilter.make && r.model === unitFilter.model)
    : records;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Nav */}
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => navigate('/customers')} style={{ ...btnLink, marginBottom: '8px' }}>&larr; Back to Customers</button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isAdmin && !editing && (
            <button onClick={() => handleDeleteCustomer()} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>Delete Customer</button>
          )}
          {isAdmin && !editing && (
            <button onClick={() => { setShowMerge(true); resetMerge(); setMergeSuccess(''); }} style={{ ...btnSecondary, color: '#6b7280', borderColor: '#d1d5db' }}>Merge Duplicate</button>
          )}
          {canEditRecords && !editing && (
            <button onClick={() => setEditing(true)} style={btnSecondary}>Edit</button>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setFormData(customer); }} style={btnSecondary}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            </>
          )}
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

      {/* Edit banner */}
      {editing && (
        <div style={{ padding: '10px 16px', marginBottom: '16px', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px' }}>
          <span style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>Editing Customer — make changes then click Save</span>
        </div>
      )}

      {/* ─── Customer Info Card ─── */}
      <div style={{ ...sectionStyle, ...(editing ? { borderColor: '#93c5fd', backgroundColor: '#fafbff' } : {}) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitle}>Customer Information</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {customer.is_storage_customer && (
              <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#dbeafe', color: '#1e40af' }}>Storage Customer</span>
            )}
            {customer.lead_source && (
              <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#065f46' }}>Lead: {customer.lead_source}</span>
            )}
            {!customer.email_primary && (
              <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e' }}>No Email</span>
            )}
            {customer.marketing_opt_out && (
              <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#dc2626' }}>Opted Out</span>
            )}
          </div>
        </div>
        <div style={gridStyle}>
          <Field label="Account #" value={customer.account_number} />
          <EditableField label="First Name" field="first_name" value={formData.first_name || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Last Name" field="last_name" value={formData.last_name || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Company" field="company_name" value={formData.company_name || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Phone 1" field="phone_primary" value={formData.phone_primary || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="Phone 2" field="phone_secondary" value={formData.phone_secondary || ''} editing={editing} onChange={handleFieldChange} />
          <div>
            <EditableField label="Email" field="email_primary" value={formData.email_primary || ''} editing={editing} onChange={handleFieldChange} />
            {!editing && customer.email_invalid && (
              <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e' }}>
                Email bounced {customer.email_invalid_date ? new Date(customer.email_invalid_date).toLocaleDateString() : ''} — please verify
              </span>
            )}
            {!editing && customer.marketing_opt_out && (
              <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#dc2626' }}>
                Unsubscribed {customer.email_opt_out_date ? new Date(customer.email_opt_out_date).toLocaleDateString() : ''}
              </span>
            )}
          </div>
          <EditableField label="Street" field="address_street" value={formData.address_street || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="City" field="address_city" value={formData.address_city || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="State" field="address_state" value={formData.address_state || ''} editing={editing} onChange={handleFieldChange} />
          <EditableField label="ZIP" field="address_zip" value={formData.address_zip || ''} editing={editing} onChange={handleFieldChange} />
        </div>
        {editing && (
          <div style={{ marginTop: '12px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={formData.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} style={{ ...inputStyle, width: '100%', minHeight: '60px' }} />
          </div>
        )}
        {!editing && customer.notes && (
          <div style={{ marginTop: '12px' }}>
            <label style={labelStyle}>Notes</label>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{customer.notes}</p>
          </div>
        )}
        {/* Email flags */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!customer.marketing_opt_out}
              onChange={async (e) => {
                try {
                  const updated = await api.updateCustomer(id, { marketing_opt_out: e.target.checked });
                  setCustomer(updated);
                } catch (err) { setError(err.message); }
              }}
            />
            <span style={{ color: customer.marketing_opt_out ? '#dc2626' : '#374151' }}>
              {customer.marketing_opt_out ? 'Opted out of marketing emails' : 'Exclude from marketing emails'}
            </span>
            {customer.marketing_opt_out && (
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Customer must re-opt-in to receive campaigns</span>
            )}
          </label>
          {customer.email_invalid && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!customer.email_invalid}
                onChange={async (e) => {
                  try {
                    const updated = await api.updateCustomer(id, { email_invalid: e.target.checked });
                    setCustomer(updated);
                  } catch (err) { setError(err.message); }
                }}
              />
              <span style={{ color: '#92400e' }}>
                Email bounced — mark as verified/corrected to clear
              </span>
            </label>
          )}
        </div>
      </div>

      {/* ─── Storage Section ─── */}
      {storage.length > 0 && (
        <div style={{ ...sectionStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <h2 style={sectionTitle}>Storage</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Space</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Unit</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
                <th style={thStyle}>Move-in</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {storage.map(s => {
                const isActive = !s.billing_end_date;
                return (
                  <tr key={s.id}>
                    <td style={tdStyle}><strong>{s.space_label || s.space_number || '—'}</strong></td>
                    <td style={tdStyle}>{s.space_type === 'indoor' ? 'Indoor' : 'Outdoor'}</td>
                    <td style={tdStyle}>{[s.unit_year, s.unit_make, s.unit_model].filter(Boolean).join(' ') || s.unit_description || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(s.monthly_rate)}</td>
                    <td style={tdStyle}>{formatDate(s.billing_start_date)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                        backgroundColor: isActive ? '#d1fae5' : '#f3f4f6',
                        color: isActive ? '#065f46' : '#6b7280',
                      }}>
                        {isActive ? 'Active' : 'Ended'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Units ─── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ ...sectionTitle, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>Units ({units.length})</h2>
          {canEditRecords && (
            <button onClick={() => setShowAddUnit(true)} style={{ padding: '4px 12px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
              + Add Unit
            </button>
          )}
        </div>
        {units.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={() => { setUnitFilter(null); setSelectedUnit(null); setEditingUnit(null); }} style={{ ...(!unitFilter ? chipActive : chipStyle) }}>All</button>
              {units.map(u => {
                const label = [u.year, u.make, u.model].filter(Boolean).join(' ') || 'Unknown Unit';
                const isSelected = selectedUnit?.id === u.id;
                return (
                  <button key={u.id} onClick={() => handleUnitClick(u)} style={isSelected ? chipActive : chipStyle}>
                    {label}
                    {u.vin && <span style={{ fontSize: '0.7rem', color: isSelected ? '#93c5fd' : '#9ca3af', marginLeft: '4px' }}>VIN: ...{u.vin.slice(-6)}</span>}
                  </button>
                );
              })}
            </div>
            {/* Unit detail panel */}
            {selectedUnit && (
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                {editingUnit ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      <div><label style={unitLabelStyle}>Year</label><input type="number" value={editingUnit.year || ''} onChange={(e) => setEditingUnit({ ...editingUnit, year: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>Make</label><input value={editingUnit.make || ''} onChange={(e) => setEditingUnit({ ...editingUnit, make: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>Model</label><input value={editingUnit.model || ''} onChange={(e) => setEditingUnit({ ...editingUnit, model: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>VIN</label><input value={editingUnit.vin || ''} onChange={(e) => setEditingUnit({ ...editingUnit, vin: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>License Plate</label><input value={editingUnit.license_plate || ''} onChange={(e) => setEditingUnit({ ...editingUnit, license_plate: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>Type</label><input value={editingUnit.unit_type || ''} onChange={(e) => setEditingUnit({ ...editingUnit, unit_type: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>Color</label><input value={editingUnit.color || ''} onChange={(e) => setEditingUnit({ ...editingUnit, color: e.target.value })} style={unitInputStyle} /></div>
                      <div><label style={unitLabelStyle}>Linear Feet</label><input type="number" step="0.1" min="0" value={editingUnit.linear_feet || ''} onChange={(e) => setEditingUnit({ ...editingUnit, linear_feet: e.target.value })} placeholder="0" style={unitInputStyle} /></div>
                    </div>
                    <div style={{ marginBottom: '12px' }}><label style={unitLabelStyle}>Notes</label><textarea value={editingUnit.unit_notes || ''} onChange={(e) => setEditingUnit({ ...editingUnit, unit_notes: e.target.value })} style={{ ...unitInputStyle, minHeight: '60px', resize: 'vertical' }} /></div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                      <button onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this unit? This cannot be undone.')) return;
                        try {
                          await api.deleteUnit(editingUnit.id);
                          setEditingUnit(null);
                          const unitList = await api.getCustomerUnits(id);
                          setUnits(unitList);
                          setSelectedUnit(unitList[0] || null);
                        } catch (err) {
                          setError(err.message);
                        }
                      }} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>Delete Unit</button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSaveUnit} disabled={unitSaving} style={btnPrimary}>{unitSaving ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => setEditingUnit(null)} style={btnSecondary}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1rem' }}>{[selectedUnit.year, selectedUnit.make, selectedUnit.model].filter(Boolean).join(' ') || 'Unknown Unit'}</h3>
                      {canEditRecords && <button onClick={() => startEditUnit(selectedUnit)} style={{ padding: '3px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
                      <div><span style={unitLabelStyle}>VIN</span><div>{selectedUnit.vin || '—'}</div></div>
                      <div><span style={unitLabelStyle}>License Plate</span><div>{selectedUnit.license_plate || '—'}</div></div>
                      <div><span style={unitLabelStyle}>Type</span><div>{selectedUnit.unit_type || '—'}</div></div>
                      <div><span style={unitLabelStyle}>Color</span><div>{selectedUnit.color || '—'}</div></div>
                      <div><span style={unitLabelStyle}>Linear Feet</span><div>{selectedUnit.linear_feet ? `${parseFloat(selectedUnit.linear_feet)} ft` : '—'}</div></div>
                    </div>
                    {selectedUnit.unit_notes && <div style={{ marginTop: '8px', fontSize: '0.85rem' }}><span style={unitLabelStyle}>Notes</span><div style={{ whiteSpace: 'pre-wrap' }}>{selectedUnit.unit_notes}</div></div>}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No units on file</p>
        )}
      </div>

      {/* ─── Storage Billing History ─── */}
      {storageCharges.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Storage Billing History ({storageCharges.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Space</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                <th style={thStyle}>Month</th>
              </tr>
            </thead>
            <tbody>
              {[...storageCharges].sort((a, b) => new Date(b.charge_date) - new Date(a.charge_date)).map(c => (
                <tr key={c.id}>
                  <td style={tdStyle}>{new Date(c.charge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style={tdStyle}>{c.space_label || '\u2014'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>${parseFloat(c.amount).toFixed(2)}</td>
                  <td style={tdStyle}>{c.charge_month ? new Date(c.charge_month + '-01T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Records History ─── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ ...sectionTitle, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            Records History ({filteredRecords.length})
            {unitFilter && <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#6b7280' }}> — filtered by unit</span>}
          </h2>
          {canEditRecords && (
            <button onClick={() => navigate('/records/new', { state: { prefillCustomer: customer, prefillUnits: units } })} style={{ padding: '4px 12px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
              + New Record
            </button>
          )}
        </div>
        {filteredRecords.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>WO #</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.id} onClick={() => navigate(`/records/${r.id}`, { state: { from: 'customer', customerId: customer.id } })} style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}><strong>{r.record_number}</strong></td>
                  <td style={tdStyle}>{formatDate(r.created_at)}</td>
                  <td style={tdStyle}>{[r.year, r.make, r.model].filter(Boolean).join(' ') || '—'}</td>
                  <td style={tdStyle}><StatusBadge status={r.status} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(r.total_sales)}</td>
                  <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.job_description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No records</p>
        )}
      </div>

      {/* ─── Marketing & Notes Log ─── */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Marketing & Notes</h2>

        {/* Add note form */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 120px' }}>
            <label style={labelStyle}>Channel</label>
            <select value={noteChannel} onChange={(e) => setNoteChannel(e.target.value)} style={inputStyle}>
              <option>Note</option>
              <option>Email</option>
              <option>Phone</option>
              <option>SMS</option>
              <option>Postcard</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Note</label>
            <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} style={inputStyle} placeholder="Add a marketing note..." />
          </div>
          <button onClick={handleAddNote} disabled={noteSaving || !noteText.trim()} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}>
            {noteSaving ? 'Adding...' : 'Add Note'}
          </button>
        </div>

        {/* Log entries */}
        {marketingLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {marketingLog.map(m => (
              <div key={m.id} style={{ padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {m.campaign_name || m.channel || 'Note'}
                    {m.channel && <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '8px' }}>via {m.channel}</span>}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    {formatDate(m.created_at)}
                    {m.logged_by_name && ` by ${m.logged_by_name}`}
                  </span>
                </div>
                {m.notes && <div style={{ color: '#4b5563' }}>{m.notes}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No marketing entries</p>
        )}
      </div>

      {/* Merge success banner */}
      {mergeSuccess && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>{mergeSuccess}</span>
          <button onClick={() => setMergeSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontSize: '1.1rem' }}>&times;</button>
        </div>
      )}

      {/* ─── Merge Customer Modal ─── */}
      {showMerge && (
        <div style={overlayStyle}>
          <div style={mergeModalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e3a5f' }}>
                {mergeStep === 1 && 'Step 1: Find Duplicate'}
                {mergeStep === 2 && 'Step 2: Choose Fields to Keep'}
                {mergeStep === 3 && 'Step 3: Confirm Merge'}
              </h3>
              <button onClick={() => setShowMerge(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#6b7280' }}>&times;</button>
            </div>

            {/* Step 1: Search for duplicate */}
            {mergeStep === 1 && (
              <div>
                <input
                  type="text"
                  placeholder="Search for duplicate customer..."
                  value={mergeSearch}
                  onChange={(e) => handleMergeSearch(e.target.value)}
                  style={{ ...inputStyle, marginBottom: '12px' }}
                  autoFocus
                />
                {mergeSearching && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Searching...</p>}
                {mergeResults.length > 0 && (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    {mergeResults.map(c => (
                      <div
                        key={c.id}
                        onClick={() => selectDuplicate(c)}
                        style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.85rem' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <strong>{c.last_name}{c.first_name ? `, ${c.first_name}` : ''}</strong>
                        <span style={{ color: '#6b7280', marginLeft: '8px' }}>#{c.account_number}</span>
                        {c.phone_primary && <span style={{ color: '#6b7280', marginLeft: '12px' }}>{formatPhone(c.phone_primary)}</span>}
                        {c.email_primary && <span style={{ color: '#6b7280', marginLeft: '12px' }}>{c.email_primary}</span>}
                        <span style={{ float: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>
                          {c.unit_count || 0} units, {c.record_count || 0} records
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {mergeSearch.length >= 2 && !mergeSearching && mergeResults.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No matching customers found</p>
                )}
              </div>
            )}

            {/* Step 2: Compare and choose fields */}
            {mergeStep === 2 && duplicate && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #6ee7b7' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#065f46', marginBottom: '4px' }}>Master (Keep)</div>
                    <strong>{customer.last_name}{customer.first_name ? `, ${customer.first_name}` : ''}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>#{customer.account_number} &middot; {units.length} units &middot; {records.length} records</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', marginBottom: '4px' }}>Duplicate (Delete)</div>
                    <strong>{duplicate.last_name}{duplicate.first_name ? `, ${duplicate.first_name}` : ''}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>#{duplicate.account_number} &middot; {duplicate.unit_count || 0} units &middot; {duplicate.record_count || 0} records</div>
                  </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: '100px' }}>Field</th>
                        <th style={thStyle}>Master Value</th>
                        <th style={thStyle}>Duplicate Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergeFieldList.map(({ key, label }) => {
                        const masterVal = customer[key] || '';
                        const dupVal = duplicate[key] || '';
                        const same = masterVal === dupVal;
                        const keepDup = keepFields[key] !== undefined;
                        return (
                          <tr key={key}>
                            <td style={{ ...tdStyle, fontWeight: 600, fontSize: '0.8rem' }}>{label}</td>
                            <td
                              onClick={() => { const next = { ...keepFields }; delete next[key]; setKeepFields(next); }}
                              style={{ ...tdStyle, cursor: same ? 'default' : 'pointer', backgroundColor: !same && !keepDup ? '#d1fae5' : 'transparent', fontSize: '0.85rem' }}
                            >
                              {!same && <input type="radio" checked={!keepDup} onChange={() => {}} style={{ marginRight: '6px' }} />}
                              {masterVal || <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                            <td
                              onClick={() => { if (!same) setKeepFields({ ...keepFields, [key]: dupVal }); }}
                              style={{ ...tdStyle, cursor: same ? 'default' : 'pointer', backgroundColor: !same && keepDup ? '#dbeafe' : 'transparent', fontSize: '0.85rem' }}
                            >
                              {!same && <input type="radio" checked={keepDup} onChange={() => {}} style={{ marginRight: '6px' }} />}
                              {dupVal || <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <button onClick={() => { setMergeStep(1); setDuplicate(null); }} style={btnSecondary}>Back</button>
                  <button onClick={() => setMergeStep(3)} style={btnPrimary}>Next: Review</button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {mergeStep === 3 && duplicate && (
              <div>
                <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#92400e' }}>This action cannot be undone.</p>
                  <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#78350f' }}>
                    Master record: <strong>{customer.last_name}{customer.first_name ? `, ${customer.first_name}` : ''}</strong> (#{customer.account_number})
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: '#78350f' }}>The following will be moved to the master record:</p>
                  <ul style={{ margin: '0 0 12px', paddingLeft: '20px', fontSize: '0.85rem', color: '#78350f' }}>
                    <li>{dupUnits.length} units</li>
                    <li>{dupRecords.length} work orders / records</li>
                    <li>{dupStorage.length} storage assignments</li>
                    <li>{dupMarketing.length} marketing notes</li>
                  </ul>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
                    The duplicate record (#{duplicate.account_number}) will be permanently deleted.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setMergeStep(2)} style={btnSecondary}>Back</button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowMerge(false)} style={btnSecondary}>Cancel</button>
                    <button onClick={handleConfirmMerge} disabled={merging} style={{ ...btnPrimary, backgroundColor: '#dc2626' }}>
                      {merging ? 'Merging...' : 'Confirm Merge'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Add Unit Modal ─── */}
      {showAddUnit && (
        <AddUnitModal
          customerId={parseInt(id)}
          onClose={() => setShowAddUnit(false)}
          onCreated={() => { setShowAddUnit(false); fetchAll(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddUnitModal
// ---------------------------------------------------------------------------
function AddUnitModal({ customerId, onClose, onCreated }) {
  const [form, setForm] = useState({
    year: '', make: '', model: '', vin: '', license_plate: '',
    color: '', unit_type: '', unit_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const UNIT_TYPES = [
    'Travel Trailer', '5th Wheel', 'Motorhome Class A', 'Motorhome Class B',
    'Motorhome Class C', 'Toy Hauler', 'Truck Camper', 'Van', 'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.make && !form.model) { setError('Make or model is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.createUnit({
        customer_id: customerId,
        year: form.year ? parseInt(form.year) : null,
        make: form.make || null,
        model: form.model || null,
        vin: form.vin || null,
        license_plate: form.license_plate || null,
        color: form.color || null,
        linear_feet: form.linear_feet ? parseFloat(form.linear_feet) : null,
        unit_type: form.unit_type || null,
        unit_notes: form.unit_notes || null,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div style={overlayStyle}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Add Unit</h2>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: '0.85rem', color: '#6b7280' }}>X</button>
        </div>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Year</label>
              <input type="number" min="1900" max="2099" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2024" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Make</label>
              <input value={form.make} onChange={(e) => set('make', e.target.value)} placeholder="e.g. Airstream" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. Flying Cloud" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Unit Type</label>
              <select value={form.unit_type} onChange={(e) => set('unit_type', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Optional" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Linear Feet</label>
              <input type="number" step="0.1" min="0" value={form.linear_feet || ''} onChange={(e) => set('linear_feet', e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>VIN</label>
              <input value={form.vin} onChange={(e) => set('vin', e.target.value)} placeholder="Optional" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>License Plate</label>
              <input value={form.license_plate} onChange={(e) => set('license_plate', e.target.value)} placeholder="Optional" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.unit_notes} onChange={(e) => set('unit_notes', e.target.value)} placeholder="Optional notes..." style={{ ...inputStyle, minHeight: '60px' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save Unit'}</button>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-components
function Field({ label, value }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ fontSize: '0.875rem' }}>{value || '—'}</div>
    </div>
  );
}

function EditableField({ label, field, value, editing, onChange }) {
  const isPhone = field && (field.includes('phone') && !field.includes('email'));
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {editing ? (
        <input type="text" value={isPhone ? handlePhoneInput((value ?? '').replace(/\D/g, '')) : (value ?? '')} onChange={(e) => onChange(field, isPhone ? handlePhoneInput(e.target.value) : e.target.value)} style={inputStyle} />
      ) : (
        <div style={{ fontSize: '0.875rem' }}>{isPhone ? (formatPhone(value) || '—') : (value || '—')}</div>
      )}
    </div>
  );
}

// Styles
const sectionStyle = { marginBottom: '24px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' };
const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
const thStyle = { textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' };
const btnPrimary = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0 };
const chipStyle = { padding: '4px 12px', borderRadius: '9999px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' };
const chipActive = { padding: '4px 12px', borderRadius: '9999px', border: '1px solid #3b82f6', backgroundColor: '#dbeafe', cursor: 'pointer', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 };
const unitLabelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em' };
const unitInputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const mergeModalStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '720px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
