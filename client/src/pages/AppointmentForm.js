import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';
import NewCustomerModal from '../components/NewCustomerModal';

const APPT_TYPES = [
  { value: 'drop_off', label: 'Drop Off' },
  { value: 'pick_up', label: 'Pick Up' },
  { value: 'storage', label: 'Storage' },
  { value: 'rv_repair', label: 'RV Repair' },
];

const STATUSES = ['scheduled', 'confirmed', 'arrived', 'in_progress', 'complete', 'cancelled', 'no_show'];

export default function AppointmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const prefillDate = location.state?.date;

  const [form, setForm] = useState({
    customer_id: '',
    unit_id: '',
    record_id: '',
    appointment_type: 'drop_off',
    scheduled_date: prefillDate || new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    duration_minutes: '60',
    technician_id: '',
    status: 'scheduled',
    dropoff_notes: '',
    pickup_notes: '',
    internal_notes: '',
    job_description: '',
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerUnits, setCustomerUnits] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newUnitYear, setNewUnitYear] = useState('');
  const [newUnitMake, setNewUnitMake] = useState('');
  const [newUnitModel, setNewUnitModel] = useState('');
  const [emailWarning, setEmailWarning] = useState(null);
  const [creatingRecord, setCreatingRecord] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState(null); // { type: 'success'|'warning'|'error', text }

  // Load technicians
  useEffect(() => {
    api.getTechnicians().then(setTechnicians).catch(() => {});
  }, []);

  // Load existing appointment for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const appt = await api.getAppointment(id);
        const dt = new Date(appt.scheduled_at);
        setForm({
          customer_id: appt.customer_id || '',
          unit_id: appt.unit_id || '',
          record_id: appt.record_id || '',
          appointment_type: appt.appointment_type,
          scheduled_date: dt.toLocaleDateString('en-CA'), // YYYY-MM-DD
          scheduled_time: dt.toTimeString().slice(0, 5), // HH:MM
          duration_minutes: appt.duration_minutes || '',
          technician_id: appt.technician_id || '',
          status: appt.status,
          dropoff_notes: appt.dropoff_notes || '',
          pickup_notes: appt.pickup_notes || '',
          internal_notes: appt.internal_notes || '',
          job_description: appt.job_description || '',
        });
        setSelectedCustomer({
          id: appt.customer_id,
          last_name: appt.last_name,
          first_name: appt.first_name,
          company_name: appt.company_name,
        });
        setCustomerEmail(appt.customer_email || appt.email_primary || '');
        setCustomerPhone(appt.customer_phone || appt.phone_primary || '');
        setNotifyCustomer(appt.notify_customer || false);
        // Load units for this customer
        const units = await api.getCustomerUnits(appt.customer_id);
        setCustomerUnits(units);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Customer search
  useEffect(() => {
    if (customerSearch.length < 2) { setCustomerResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await api.getCustomers({ search: customerSearch, limit: 10 });
        setCustomerResults(results.customers || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setForm(f => ({ ...f, customer_id: customer.id, unit_id: '', record_id: '' }));
    setCustomerSearch('');
    setCustomerResults([]);
    // Pre-fill email/phone from customer record, auto-check notify if email exists
    setCustomerEmail(customer.email_primary || '');
    setCustomerPhone(customer.phone_primary || '');
    setNotifyCustomer(!!customer.email_primary);
    try {
      const units = await api.getCustomerUnits(customer.id);
      setCustomerUnits(units);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let finalCustomerId = parseInt(form.customer_id);
      let finalUnitId = form.unit_id ? parseInt(form.unit_id) : null;

      // Create new unit if fields are filled and no unit selected
      if (!finalUnitId && (newUnitYear || newUnitMake || newUnitModel) && finalCustomerId) {
        try {
          const unit = await api.createUnit({
            customer_id: finalCustomerId,
            year: newUnitYear ? parseInt(newUnitYear) : null,
            make: newUnitMake || null,
            model: newUnitModel || null,
          });
          finalUnitId = unit.id;
          setCustomerUnits(prev => [...prev, unit]);
        } catch (unitErr) {
          setError('Failed to create unit: ' + unitErr.message);
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...form,
        customer_id: finalCustomerId,
        unit_id: finalUnitId,
        record_id: form.record_id ? parseInt(form.record_id) : null,
        technician_id: form.technician_id ? parseInt(form.technician_id) : null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        notify_customer: notifyCustomer,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
      };

      if (isEdit) {
        await api.updateAppointment(id, payload);
      } else {
        const result = await api.createAppointment(payload);
        if (result.emailWarning) {
          setEmailWarning(result.emailWarning);
          // Show warning for 5 seconds before navigating
          setTimeout(() => navigate('/schedule'), 5000);
          setSaving(false);
          return;
        }
      }
      navigate('/schedule');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteAppointment(id);
      navigate('/schedule');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateRecord = async () => {
    setCreatingRecord(true);
    setError(null);
    try {
      const rec = await api.createRecord({
        customer_id: parseInt(form.customer_id),
        unit_id: form.unit_id ? parseInt(form.unit_id) : null,
        job_description: form.job_description || null,
      });
      // Link appointment to the new record and set arrived status
      await api.updateAppointment(id, { record_id: rec.id, status: 'arrived' });
      alert(`Record #${rec.record_number} created from this appointment.`);
      navigate(`/records/${rec.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingRecord(false);
    }
  };

  const handleResendConfirmation = async () => {
    const email = customerEmail || selectedCustomer?.email_primary;
    if (!window.confirm(`Resend appointment confirmation to ${email || 'customer'}?`)) return;
    setResending(true);
    setResendMsg(null);
    try {
      const result = await api.resendConfirmation(id);
      setResendMsg({ type: 'success', text: `Confirmation email resent to ${result.email}` });
    } catch (err) {
      if (err.message.includes('No email address')) {
        setResendMsg({ type: 'warning', text: 'No email address on file for this customer. Add an email to their customer record first.' });
      } else {
        setResendMsg({ type: 'error', text: 'Email could not be sent — check Vercel logs for details.' });
      }
    } finally {
      setResending(false);
      setTimeout(() => setResendMsg(null), 6000);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/schedule')} style={linkBtn}>&larr; Back to Schedule</button>

      <div style={card}>
        <h1 style={{ margin: '0 0 24px 0' }}>
          {isEdit ? 'Edit Appointment' : 'New Appointment'}
        </h1>

        {error && <div style={errorBox}>{error}</div>}
        {emailWarning && (
          <div style={{ padding: '12px', backgroundColor: '#fefce8', color: '#854d0e', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem', border: '1px solid #fde68a' }}>
            Appointment saved. Email notification could not be sent — check Vercel environment variables.
            <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#a16207' }}>{emailWarning}</div>
          </div>
        )}

        {resendMsg && (
          <div style={{
            padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem',
            backgroundColor: resendMsg.type === 'success' ? '#f0fdf4' : resendMsg.type === 'warning' ? '#fefce8' : '#fef2f2',
            color: resendMsg.type === 'success' ? '#065f46' : resendMsg.type === 'warning' ? '#854d0e' : '#dc2626',
            border: `1px solid ${resendMsg.type === 'success' ? '#bbf7d0' : resendMsg.type === 'warning' ? '#fde68a' : '#fca5a5'}`,
          }}>
            {resendMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Customer picker */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Customer *</label>
            {selectedCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <strong>{selectedCustomer.last_name}{selectedCustomer.first_name ? `, ${selectedCustomer.first_name}` : ''}</strong>
                  {selectedCustomer.company_name ? ` (${selectedCustomer.company_name})` : ''}
                </div>
                {!isEdit && (
                  <button type="button" onClick={() => { setSelectedCustomer(null); setForm(f => ({ ...f, customer_id: '', unit_id: '' })); setCustomerUnits([]); setCustomerEmail(''); setCustomerPhone(''); setNotifyCustomer(false); }} style={btnSmall}>Change</button>
                )}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name, phone, email..."
                  style={inputStyle}
                  autoFocus
                />
                {customerResults.length > 0 && (
                  <div style={dropdownStyle}>
                    {customerResults.map(c => (
                      <div key={c.id} onClick={() => selectCustomer(c)} style={dropdownItem}>
                        <strong>{c.last_name}{c.first_name ? `, ${c.first_name}` : ''}</strong>
                        {c.company_name ? ` (${c.company_name})` : ''}
                        <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '0.8rem' }}>{(c.phone_primary ? formatPhone(c.phone_primary) : c.email_primary) || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowNewCustomer(true)} style={{ ...btnSmall, color: '#1e3a5f' }}>+ Add New Customer</button>
                </div>
              </div>
            )}
          </div>

          {/* Row: Type + Status */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Appointment Type *</label>
              <select name="appointment_type" value={form.appointment_type} onChange={handleChange} style={inputStyle}>
                {APPT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {isEdit && (
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row: Date + Time + Duration */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date *</label>
              <input name="scheduled_date" type="date" value={form.scheduled_date} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Time *</label>
              <input name="scheduled_time" type="time" value={form.scheduled_time} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Duration (min)</label>
              <input name="duration_minutes" type="number" min="0" step="15" value={form.duration_minutes} onChange={handleChange} placeholder="60" style={inputStyle} />
            </div>
          </div>

          {/* Row: Unit + Technician */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Unit</label>
              <select name="unit_id" value={form.unit_id} onChange={handleChange} style={inputStyle} disabled={!form.customer_id}>
                <option value="">— Select Unit —</option>
                {customerUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {[u.year, u.make, u.model].filter(Boolean).join(' ') || `Unit #${u.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Technician</label>
              <select name="technician_id" value={form.technician_id} onChange={handleChange} style={inputStyle}>
                <option value="">— Unassigned —</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* New Unit fields (for new appointments when no unit selected) */}
          {!isEdit && form.customer_id && !form.unit_id && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Or enter a new unit:</label>
              <div style={row}>
                <div style={{ flex: '0 0 100px' }}>
                  <label style={labelStyle}>Year</label>
                  <input type="number" value={newUnitYear} onChange={(e) => setNewUnitYear(e.target.value)} placeholder="2024" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Make</label>
                  <input type="text" value={newUnitMake} onChange={(e) => setNewUnitMake(e.target.value)} placeholder="e.g. Airstream" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Model</label>
                  <input type="text" value={newUnitModel} onChange={(e) => setNewUnitModel(e.target.value)} placeholder="e.g. Bambi" style={inputStyle} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Leave blank if unknown — can be added later from the customer record.</div>
            </div>
          )}

          {/* Record ID (optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Record / WO # (optional)</label>
            <input name="record_id" type="number" value={form.record_id} onChange={handleChange} placeholder="Leave blank if no record yet" style={{ ...inputStyle, maxWidth: '200px' }} />
          </div>

          {/* Contact & Notification */}
          {selectedCustomer && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <div style={row}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Customer Email</label>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Customer Phone</label>
                  <input type="tel" value={handlePhoneInput(customerPhone)} onChange={(e) => setCustomerPhone(handlePhoneInput(e.target.value))} placeholder="(303) 555-1234" style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)} />
                Send appointment confirmation to customer
              </label>
            </div>
          )}

          {/* Notes */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Drop-off Notes</label>
              <textarea name="dropoff_notes" value={form.dropoff_notes} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pick-up Notes</label>
              <textarea name="pickup_notes" value={form.pickup_notes} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Internal Notes</label>
            <textarea name="internal_notes" value={form.internal_notes} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical', width: '100%' }} />
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Job Description / Customer Complaint</label>
            <textarea name="job_description" value={form.job_description} onChange={handleChange} rows={3} placeholder="Describe the work requested or customer complaint..." style={{ ...inputStyle, resize: 'vertical', width: '100%' }} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" disabled={saving || !form.customer_id} style={btnPrimary}>
              {saving ? 'Saving...' : isEdit ? 'Update Appointment' : 'Create Appointment'}
            </button>
            <button type="button" onClick={() => navigate('/schedule')} style={btnSecondary}>Cancel</button>
            {isEdit && (
              <button type="button" onClick={handleResendConfirmation} disabled={resending} style={btnSecondary}>
                {resending ? 'Sending...' : '\u2709 Resend Confirmation'}
              </button>
            )}
            {isEdit && form.appointment_type === 'drop_off' && !form.record_id && (
              <button type="button" onClick={handleCreateRecord} disabled={creatingRecord} style={{ ...btnPrimary, backgroundColor: '#059669' }}>
                {creatingRecord ? 'Creating...' : 'Create Record'}
              </button>
            )}

            {isEdit && (
              <div style={{ marginLeft: 'auto' }}>
                {showDelete ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>Delete this appointment?</span>
                    <button type="button" onClick={handleDelete} style={btnDanger}>Yes, Delete</button>
                    <button type="button" onClick={() => setShowDelete(false)} style={btnSecondary}>No</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowDelete(true)} style={btnDangerOutline}>Delete</button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
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
const card = {
  backgroundColor: '#fff', borderRadius: '8px', padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '12px',
};
const row = { display: 'flex', gap: '16px', marginBottom: '16px' };
const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em',
};
const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem', outline: 'none',
};
const linkBtn = {
  background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
  fontSize: '0.875rem', padding: '0', marginBottom: '8px',
};
const errorBox = {
  padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626',
  borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem',
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const btnSmall = {
  padding: '4px 10px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
};
const btnDanger = {
  padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};
const btnDangerOutline = {
  padding: '8px 16px', backgroundColor: '#fff', color: '#dc2626',
  border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
};
const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff',
  border: '1px solid #d1d5db', borderRadius: '0 0 6px 6px', maxHeight: '200px',
  overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};
const dropdownItem = {
  padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem',
  borderBottom: '1px solid #f3f4f6',
};
