import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import NewCustomerModal from '../components/NewCustomerModal';
import BulletTextarea from '../components/BulletTextarea';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';

export default function RecordNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state;
  const [step, setStep] = useState(prefill?.prefillCustomer ? 2 : 1); // 1: select customer, 2: select/create unit, 3: record details
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [searchDone, setSearchDone] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(prefill?.prefillCustomer || null);
  const [units, setUnits] = useState(prefill?.prefillUnits || []);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ year: '', make: '', model: '', vin: '', license_plate: '' });
  const [recordData, setRecordData] = useState({
    key_number: '', job_description: '', is_insurance_job: false, expected_completion_date: '',
    insurance_company: '', insurance_contact_name: '', insurance_phone: '', insurance_email: '',
    claim_number: '', policy_number: '', deductible_amount: '', under_warranty_amount: '', no_charge_amount: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // New Customer modal state
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const searchCustomers = async () => {
    if (!customerSearch.trim()) return;
    try {
      const data = await api.getCustomers({ search: customerSearch, limit: 20 });
      setCustomers(data.customers);
      setSearchDone(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setStep(2);
    try {
      const unitList = await api.getCustomerUnits(customer.id);
      setUnits(unitList);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectUnit = (unit) => {
    setSelectedUnit(unit);
    setShowNewUnit(false);
    setStep(3);
  };

  const createAndSelectUnit = async () => {
    if (!newUnit.make && !newUnit.model) {
      setError('Enter at least a make or model');
      return;
    }
    try {
      const unit = await api.createUnit({
        customer_id: selectedCustomer.id,
        year: newUnit.year ? parseInt(newUnit.year) : null,
        make: newUnit.make || null,
        model: newUnit.model || null,
        vin: newUnit.vin || null,
        license_plate: newUnit.license_plate || null,
      });
      setSelectedUnit(unit);
      setShowNewUnit(false);
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const createRecord = async () => {
    setSaving(true);
    setError('');
    try {
      const rec = await api.createRecord({
        customer_id: selectedCustomer.id,
        unit_id: selectedUnit.id,
        key_number: recordData.key_number || null,
        job_description: recordData.job_description || null,
        is_insurance_job: recordData.is_insurance_job,
        expected_completion_date: recordData.expected_completion_date || null,
        insurance_company: recordData.insurance_company || null,
        insurance_contact_name: recordData.insurance_contact_name || null,
        insurance_phone: recordData.insurance_phone || null,
        insurance_email: recordData.insurance_email || null,
        claim_number: recordData.claim_number || null,
        policy_number: recordData.policy_number || null,
        deposit_amount: recordData.deductible_amount ? parseFloat(recordData.deductible_amount) : 0,
      });
      navigate(`/records/${rec.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <button onClick={() => navigate('/records')} style={btnLink}>&larr; Back to Records</button>
      <h1 style={{ marginTop: '8px' }}>New Record</h1>

      {error && <div style={{ color: 'red', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['Select Customer', 'Select Unit', 'Record Details'].map((label, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '8px',
            backgroundColor: step > i + 1 ? '#d1fae5' : step === i + 1 ? '#1e3a5f' : '#f3f4f6',
            color: step === i + 1 ? '#fff' : step > i + 1 ? '#065f46' : '#9ca3af',
            borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Step 1: Customer search */}
      {step === 1 && (
        <div style={cardStyle}>
          <h2 style={cardTitle}>Find Customer</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search by name, account #, phone, email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={searchCustomers} style={btnPrimary}>Search</button>
            <button onClick={() => setShowNewCustomer(true)} style={btnSecondary}>+ New Customer</button>
          </div>
          {customers.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {customers.map(c => (
                <div
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  style={listItemStyle}
                >
                  <strong>{c.last_name}{c.first_name ? `, ${c.first_name}` : ''}</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '8px' }}>
                    #{c.account_number} {c.phone_primary && `\u00B7 ${formatPhone(c.phone_primary)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
          {searchDone && customers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <p style={{ margin: '0 0 12px' }}>No customers found for "{customerSearch}"</p>
              <button onClick={() => setShowNewCustomer(true)} style={btnPrimary}>+ Create New Customer</button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Unit selection */}
      {step === 2 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ ...cardTitle, marginBottom: 0 }}>
              Select Unit for {selectedCustomer.last_name}{selectedCustomer.first_name ? `, ${selectedCustomer.first_name}` : ''}
            </h2>
            <button onClick={() => { setStep(1); setSelectedCustomer(null); }} style={btnLink}>Change Customer</button>
          </div>

          {units.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {units.map(u => (
                <div key={u.id} onClick={() => selectUnit(u)} style={listItemStyle}>
                  <strong>{[u.year, u.make, u.model].filter(Boolean).join(' ')}</strong>
                  {u.license_plate && <span style={{ color: '#6b7280', marginLeft: '8px' }}>{u.license_plate}</span>}
                  {u.vin && <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '8px' }}>VIN: {u.vin}</span>}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setShowNewUnit(!showNewUnit)} style={btnSecondary}>
            {showNewUnit ? 'Cancel' : '+ Add New Unit'}
          </button>

          {showNewUnit && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input type="number" value={newUnit.year} onChange={(e) => setNewUnit({ ...newUnit, year: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Make</label>
                  <input type="text" value={newUnit.make} onChange={(e) => setNewUnit({ ...newUnit, make: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Model</label>
                  <input type="text" value={newUnit.model} onChange={(e) => setNewUnit({ ...newUnit, model: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>VIN</label>
                  <input type="text" value={newUnit.vin} onChange={(e) => setNewUnit({ ...newUnit, vin: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>License Plate</label>
                  <input type="text" value={newUnit.license_plate} onChange={(e) => setNewUnit({ ...newUnit, license_plate: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button onClick={createAndSelectUnit} style={{ ...btnPrimary, marginTop: '12px' }}>Create Unit & Continue</button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Record details */}
      {step === 3 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ ...cardTitle, marginBottom: 0 }}>Record Details</h2>
            <button onClick={() => setStep(2)} style={btnLink}>Change Unit</button>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <strong>Customer:</strong> {selectedCustomer.last_name}{selectedCustomer.first_name ? `, ${selectedCustomer.first_name}` : ''} (#{selectedCustomer.account_number})
            <br/>
            <strong>Unit:</strong> {[selectedUnit.year, selectedUnit.make, selectedUnit.model].filter(Boolean).join(' ')}
            {selectedUnit.license_plate && ` \u00B7 ${selectedUnit.license_plate}`}
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: '0 0 180px' }}>
              <label style={labelStyle}>Key #</label>
              <input type="text" value={recordData.key_number} onChange={(e) => setRecordData({ ...recordData, key_number: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={recordData.is_insurance_job} onChange={(e) => setRecordData({
                  ...recordData, is_insurance_job: e.target.checked,
                  ...(!e.target.checked ? { insurance_company: '', insurance_contact_name: '', insurance_phone: '', insurance_email: '', claim_number: '', policy_number: '', deductible_amount: '' } : {}),
                })} />
                Insurance Job
              </label>
            </div>
          </div>

          {recordData.is_insurance_job && (
            <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginTop: '12px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e40af' }}>Insurance Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Insurance Company</label>
                  <input value={recordData.insurance_company} onChange={(e) => setRecordData({ ...recordData, insurance_company: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Claim #</label>
                  <input value={recordData.claim_number} onChange={(e) => setRecordData({ ...recordData, claim_number: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Policy #</label>
                  <input value={recordData.policy_number} onChange={(e) => setRecordData({ ...recordData, policy_number: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Deductible</label>
                  <input type="number" step="0.01" value={recordData.deductible_amount} onChange={(e) => setRecordData({ ...recordData, deductible_amount: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Name</label>
                  <input value={recordData.insurance_contact_name} onChange={(e) => setRecordData({ ...recordData, insurance_contact_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={handlePhoneInput(recordData.insurance_phone)} onChange={(e) => setRecordData({ ...recordData, insurance_phone: handlePhoneInput(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={recordData.insurance_email} onChange={(e) => setRecordData({ ...recordData, insurance_email: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Requested Due Date</label>
            <input
              type="date"
              value={recordData.expected_completion_date}
              onChange={(e) => setRecordData({ ...recordData, expected_completion_date: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Job Description / Customer Complaint</label>
            <BulletTextarea
              value={recordData.job_description}
              onChange={(val) => setRecordData({ ...recordData, job_description: val })}
              placeholder="• Describe the work needed..."
              style={{ ...inputStyle, width: '100%', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <button onClick={createRecord} disabled={saving} style={{ ...btnPrimary, marginTop: '20px', width: '100%', padding: '12px' }}>
            {saving ? 'Creating...' : 'Create Estimate'}
          </button>
        </div>
      )}

      {/* ─── New Customer Modal ─── */}
      {showNewCustomer && (
        <NewCustomerModal
          onClose={() => setShowNewCustomer(false)}
          onCreated={(created) => {
            setShowNewCustomer(false);
            selectCustomer(created);
          }}
        />
      )}
    </div>
  );
}

// Styles
const cardStyle = { padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' };
const cardTitle = { fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px' };
const inputStyle = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' };
const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0 };
const listItemStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' };
