import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'in_person', label: 'In Person' },
];

const CHANNEL_ICONS = { email: '\u2709', phone: '\u260E', sms: '\uD83D\uDCF1', in_person: '\uD83D\uDDE3' };
const STATUS_COLORS = {
  sent: '#3b82f6',
  delivered: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
};

export default function CommunicationLog({ customerId, recordId }) {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    channel: 'phone',
    trigger_event: 'manual_log',
    message_content: '',
    delivery_status: 'sent',
  });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (recordId) {
        data = await api.getCommsByRecord(recordId);
      } else if (customerId) {
        data = await api.getCommsByCustomer(customerId);
      } else {
        setLoading(false);
        return;
      }
      setEntries(data.entries);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load communications:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId, recordId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message_content.trim()) return;
    setError(null);
    setSaving(true);

    try {
      await api.logCommunication({
        customer_id: customerId,
        record_id: recordId || null,
        channel: form.channel,
        trigger_event: form.trigger_event,
        message_content: form.message_content,
        delivery_status: form.delivery_status,
        is_manual: true,
      });
      setForm({ channel: 'phone', trigger_event: 'manual_log', message_content: '', delivery_status: 'sent' });
      setShowForm(false);
      await fetchEntries();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>
          Communication Log
          {total > 0 && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '8px', fontSize: '0.85rem' }}>({total})</span>}
        </h2>
        {customerId && (
          <button onClick={() => setShowForm(!showForm)} style={btnSmall}>
            {showForm ? 'Cancel' : '+ Log Entry'}
          </button>
        )}
      </div>

      {/* Add entry form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '8px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} style={{ ...inputStyle, width: 'auto' }}>
              {CHANNELS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select value={form.trigger_event} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })} style={{ ...inputStyle, width: 'auto' }}>
              <option value="manual_log">Manual Log</option>
              <option value="status_update">Status Update</option>
              <option value="estimate_sent">Estimate Sent</option>
              <option value="invoice_sent">Invoice Sent</option>
              <option value="payment_received">Payment Received</option>
              <option value="appointment_reminder">Appointment Reminder</option>
              <option value="parts_arrived">Parts Arrived</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="follow_up">Follow-Up</option>
              <option value="other">Other</option>
            </select>
            <select value={form.delivery_status} onChange={(e) => setForm({ ...form, delivery_status: e.target.value })} style={{ ...inputStyle, width: 'auto' }}>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <textarea
            value={form.message_content}
            onChange={(e) => setForm({ ...form, message_content: e.target.value })}
            placeholder="Enter communication details..."
            rows={3}
            style={{ ...inputStyle, width: '100%', resize: 'vertical', marginBottom: '8px' }}
          />
          <button type="submit" disabled={saving || !form.message_content.trim()} style={btnPrimary}>
            {saving ? 'Saving...' : 'Log Entry'}
          </button>
        </form>
      )}

      {/* Entries list */}
      {loading ? (
        <div style={{ color: '#9ca3af', padding: '20px', textAlign: 'center' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No communication history</p>
      ) : (
        <div>
          {entries.map(entry => (
            <div key={entry.id} style={entryStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>{CHANNEL_ICONS[entry.channel] || '\u2709'}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    {entry.channel.replace(/_/g, ' ')}
                  </span>
                  <span style={{
                    padding: '1px 6px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 600,
                    backgroundColor: `${STATUS_COLORS[entry.delivery_status] || '#999'}20`,
                    color: STATUS_COLORS[entry.delivery_status] || '#999',
                  }}>
                    {entry.delivery_status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '1px 6px', borderRadius: '3px' }}>
                    {entry.trigger_event.replace(/_/g, ' ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {formatDateTime(entry.sent_at)}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#374151' }}>
                {entry.message_content}
              </div>
              {entry.record_number && !recordId && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  WO #{entry.record_number}
                </div>
              )}
              {entry.sent_by_name && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                  by {entry.sent_by_name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Styles
const sectionStyle = {
  marginBottom: '24px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const sectionTitle = {
  fontSize: '1rem', fontWeight: 700, color: '#1e3a5f',
  marginTop: 0, marginBottom: '16px', paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
};
const entryStyle = {
  padding: '12px', borderBottom: '1px solid #f3f4f6',
};
const inputStyle = {
  padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px',
  fontSize: '0.85rem', outline: 'none',
};
const btnSmall = {
  padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
};
const btnPrimary = {
  padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};
