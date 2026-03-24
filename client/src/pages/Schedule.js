import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const APPT_TYPES = [
  { value: 'drop_off', label: 'Drop Off' },
  { value: 'pick_up', label: 'Pick Up' },
  { value: 'storage', label: 'Storage' },
  { value: 'rv_repair', label: 'RV Repair' },
];

const STATUS_COLORS = {
  scheduled: { bg: '#dbeafe', text: '#1e40af' },
  confirmed: { bg: '#d1fae5', text: '#065f46' },
  in_progress: { bg: '#fef3c7', text: '#92400e' },
  complete: { bg: '#e5e7eb', text: '#374151' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  no_show: { bg: '#fce7f3', text: '#9d174d' },
};

const TYPE_LABELS = {};
APPT_TYPES.forEach(t => { TYPE_LABELS[t.value] = t.label; });

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatShortDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Schedule() {
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments({
        date_from: formatDate(weekStart),
        date_to: formatDate(weekEnd),
        limit: 200,
      });
      setAppointments(data.appointments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  // Group appointments by date for week view
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const appointmentsByDate = {};
  days.forEach(d => { appointmentsByDate[formatDate(d)] = []; });
  appointments.forEach(appt => {
    const dateKey = new Date(appt.scheduled_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey].push(appt);
    }
  });
  // Sort each day's appointments by time
  Object.values(appointmentsByDate).forEach(arr =>
    arr.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  );

  const todayStr = formatDate(new Date());

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Schedule</h1>
        <button onClick={() => navigate('/schedule/new')} style={btnPrimary}>
          + New Appointment
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={prevWeek} style={btnNav}>&larr;</button>
          <button onClick={goToday} style={btnNav}>Today</button>
          <button onClick={nextWeek} style={btnNav}>&rarr;</button>
          <span style={{ fontWeight: 600, marginLeft: '8px' }}>
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            {' \u2013 '}
            {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setView('week')} style={view === 'week' ? btnToggleActive : btnToggle}>Week</button>
          <button onClick={() => setView('list')} style={view === 'list' ? btnToggleActive : btnToggle}>List</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
      ) : view === 'week' ? (
        /* ---- WEEK VIEW ---- */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {days.map(day => {
            const key = formatDate(day);
            const isToday = key === todayStr;
            const dayAppts = appointmentsByDate[key] || [];

            return (
              <div key={key} style={{
                ...dayColumn,
                borderColor: isToday ? '#3b82f6' : '#e5e7eb',
                borderWidth: isToday ? '2px' : '1px',
              }}>
                <div style={{
                  ...dayHeader,
                  backgroundColor: isToday ? '#eff6ff' : '#f9fafb',
                  color: isToday ? '#1e40af' : '#374151',
                }}>
                  {formatShortDate(day)}
                </div>
                <div style={{ padding: '4px', minHeight: '120px' }}>
                  {dayAppts.length === 0 ? (
                    <div style={{ color: '#d1d5db', fontSize: '0.75rem', textAlign: 'center', padding: '16px 0' }}>—</div>
                  ) : dayAppts.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => navigate(`/schedule/${appt.id}`)}
                      style={{
                        ...apptCard,
                        backgroundColor: (STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled).bg,
                        color: (STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled).text,
                        borderLeft: `3px solid ${(STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled).text}`,
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        {formatTime(appt.scheduled_at)}
                      </div>
                      <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                        {TYPE_LABELS[appt.appointment_type] || appt.appointment_type}
                      </div>
                      <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.8 }}>
                        {appt.last_name}{appt.first_name ? `, ${appt.first_name}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- LIST VIEW ---- */
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date / Time</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Technician</th>
                <th style={thStyle}>WO #</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No appointments this week</td></tr>
              ) : appointments
                .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
                .map(appt => (
                <tr key={appt.id} onClick={() => navigate(`/schedule/${appt.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{new Date(appt.scheduled_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatTime(appt.scheduled_at)}</div>
                  </td>
                  <td style={tdStyle}>{TYPE_LABELS[appt.appointment_type] || appt.appointment_type}</td>
                  <td style={tdStyle}>
                    {appt.last_name}{appt.first_name ? `, ${appt.first_name}` : ''}
                    {appt.company_name ? <span style={{ color: '#999', marginLeft: '4px' }}>({appt.company_name})</span> : ''}
                  </td>
                  <td style={tdStyle}>
                    {[appt.unit_year, appt.unit_make, appt.unit_model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={tdStyle}>{appt.technician_name || '—'}</td>
                  <td style={tdStyle}>{appt.record_number || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: (STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled).bg,
                      color: (STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled).text,
                    }}>
                      {appt.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Styles
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnNav = {
  padding: '6px 12px', backgroundColor: '#fff', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
};
const btnToggle = {
  padding: '6px 14px', backgroundColor: '#fff', color: '#6b7280',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
};
const btnToggleActive = {
  padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff',
  border: '1px solid #1e3a5f', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
};
const dayColumn = {
  backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb',
  overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};
const dayHeader = {
  padding: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem',
  borderBottom: '1px solid #e5e7eb',
};
const apptCard = {
  padding: '6px 8px', borderRadius: '4px', marginBottom: '4px',
  cursor: 'pointer', transition: 'opacity 0.15s',
};
const tableStyle = {
  width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff',
  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
const thStyle = {
  textAlign: 'left', padding: '12px 16px', backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.75rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em',
};
const tdStyle = {
  padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem',
};
