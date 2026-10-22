import React from 'react';
import { api } from '../api/client';

// Full-day warnings (Carol's team, Oct 22, 2026). Never blocks: the person can
// always keep the date.
//
// kind 'due':  a new Expected Completion date on a day that already has the
//              cap of other open work orders due (Business Settings > Work
//              Order Policy, wo_due_date_daily_cap, default 3).
// kind 'appt': a service appointment booked on a day that already has the cap
//              of service appointments (appt_service_daily_cap, default 3).
//              Storage pickups/drop offs, phone follow-ups and parts visits
//              do not count (server list in routes/appointments.js).

// Appointment types that never count toward the service cap. Mirrors
// NOT_SERVICE_TYPES in server/src/routes/appointments.js.
export const NOT_SERVICE_APPT_TYPES = ['storage', 'storage_pickup', 'storage_drop_off', 'storage_check_in',
  'storage_check_out', 'follow_up_call', 'parts', 'parts_pickup'];

const isYmd = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

// Returns the load when the day is full (or a weekend), else null. Any lookup
// failure returns null so a hiccup never stops a save.
export async function checkDueDateLoad(date, excludeId) {
  const d = date ? String(date).slice(0, 10) : '';
  if (!isYmd(d)) return null;
  try {
    const load = await api.getDueDateLoad(d, excludeId);
    return load && (load.over || load.weekend) ? { ...load, kind: 'due' } : null;
  } catch (e) {
    return null;
  }
}

export async function checkApptDayLoad(date, type, excludeId) {
  const d = date ? String(date).slice(0, 10) : '';
  if (!isYmd(d) || !type || NOT_SERVICE_APPT_TYPES.includes(type)) return null;
  try {
    const load = await api.getApptDayLoad(d, excludeId);
    return load && load.over ? { ...load, kind: 'appt' } : null;
  } catch (e) {
    return null;
  }
}

const longDay = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', {
  timeZone: 'UTC', weekday: 'long', month: 'short', day: 'numeric',
});
const shortDay = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', {
  timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric',
});
const STATUS_LABEL = {
  estimate: 'Estimate', approved: 'Not Started', schedule_customer: 'Schedule Customer', scheduled: 'Scheduled',
  in_progress: 'In Progress', order_parts: 'Order Parts', awaiting_parts: 'Awaiting Parts',
  awaiting_approval: 'Awaiting Approval', on_hold: 'On Hold',
};
const typeLabel = (t) => String(t || '').replace(/^rv_/, 'RV ').replace(/_/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase()).replace(/^Rv /, 'RV ');
const time12 = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
const box = { background: '#fff', borderRadius: '10px', maxWidth: '460px', width: '100%',
  padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };
const btn = { padding: '8px 14px', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer',
  border: '1px solid #9ca3af', background: '#fff', color: '#374151' };

export default function DueDateLoadModal({ load, onKeep, onPick, onCancel }) {
  if (!load) return null;
  const isAppt = load.kind === 'appt';
  const others = load.records || [];
  const n = others.length;
  return (
    <div style={overlay} onClick={onCancel}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px', color: '#b91c1c', fontSize: '1.1rem' }}>
          {load.over ? `${longDay(load.date)} is full` : `${longDay(load.date)} is a weekend`}
        </h3>
        {load.over && !isAppt && (
          <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>
            {n} other work order{n === 1 ? ' is' : 's are'} already due that day.
            Tell the customer we need another day, or commit to one of the open days below.
          </p>
        )}
        {load.over && isAppt && (
          <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>
            {n} service appointment{n === 1 ? ' is' : 's are'} already booked that day (limit {load.cap}).
            Storage pickups and drop offs are not counted. Offer the customer one of the open days below.
          </p>
        )}
        {load.weekend && !isAppt && (
          <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>
            The shop is closed weekends.
          </p>
        )}
        {n > 0 && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '12px', maxHeight: '160px', overflowY: 'auto' }}>
            {others.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px',
                padding: '6px 10px', fontSize: '0.85rem', borderBottom: '1px solid #f3f4f6' }}>
                <span>
                  {isAppt
                    ? <strong>{time12(r.time)}</strong>
                    : <strong>#{r.record_number}</strong>}{' '}
                  {r.last_name || r.company_name || ''}{r.first_name ? `, ${r.first_name}` : ''}
                  {!isAppt && r.deadline_type === 'hard' && (
                    <span style={{ marginLeft: '6px', background: '#dc2626', color: '#fff', fontSize: '0.65rem',
                      fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>HARD</span>
                  )}
                </span>
                <span style={{ color: '#6b7280' }}>
                  {isAppt ? typeLabel(r.appointment_type) : (STATUS_LABEL[r.status] || r.status)}
                </span>
              </div>
            ))}
          </div>
        )}
        {(load.next_open || []).length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Next open days</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {load.next_open.map(o => (
                <button type="button" key={o.date} onClick={() => onPick(o.date)}
                  style={{ ...btn, border: '1px solid #1e3a5f', color: '#1e3a5f', fontWeight: 600 }}>
                  {shortDay(o.date)} <span style={{ fontWeight: 400, color: '#6b7280' }}>({o.count} {isAppt ? 'booked' : 'due'})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={onCancel}>Pick another day</button>
          <button type="button" style={{ ...btn, background: '#b91c1c', border: '1px solid #b91c1c', color: '#fff' }}
            onClick={onKeep}>Keep {shortDay(load.date)} anyway</button>
        </div>
      </div>
    </div>
  );
}
