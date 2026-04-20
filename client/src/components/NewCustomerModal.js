import React, { useState } from 'react';
import { api } from '../api/client';
import { handlePhoneInput } from '../utils/formatPhone';

export default function NewCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', company_name: '',
    phone_primary: '', phone_secondary: '', email_primary: '',
    address_street: '', address_city: '', address_state: '', address_zip: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.last_name.trim()) { setError('Last name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const created = await api.createCustomer(form);
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>New Customer</h3>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        {error && <div style={errorBox}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} autoComplete="off">
          <div>
            <label style={labelStyle}>First Name</label>
            <input type="text" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input type="text" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} style={inputStyle} autoFocus autoComplete="off" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Company</label>
            <input type="text" value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>Phone 1</label>
            <input type="text" value={handlePhoneInput(form.phone_primary)} onChange={(e) => handleChange('phone_primary', handlePhoneInput(e.target.value))} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>Phone 2</label>
            <input type="text" value={handlePhoneInput(form.phone_secondary)} onChange={(e) => handleChange('phone_secondary', handlePhoneInput(e.target.value))} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="text" value={form.email_primary} onChange={(e) => handleChange('email_primary', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Street</label>
            <input type="text" value={form.address_street} onChange={(e) => handleChange('address_street', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input type="text" value={form.address_city} onChange={(e) => handleChange('address_city', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input type="text" value={form.address_state} onChange={(e) => handleChange('address_state', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
          <div>
            <label style={labelStyle}>ZIP</label>
            <input type="text" value={form.address_zip} onChange={(e) => handleChange('address_zip', e.target.value)} style={inputStyle} autoComplete="off" />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.last_name.trim()} style={btnPrimary}>
            {saving ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1100,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '520px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em',
};
const inputStyle = {
  padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px',
  fontSize: '0.875rem', width: '100%', boxSizing: 'border-box',
};
const errorBox = {
  padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626',
  borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem',
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const closeBtnStyle = {
  background: 'none', border: 'none', fontSize: '1.5rem',
  cursor: 'pointer', color: '#9ca3af', padding: '0 4px',
};
