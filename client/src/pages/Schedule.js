import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const APPT_TYPES = [
  { value: 'storage_pickup', label: 'Storage Pickup' },
  { value: 'storage_drop_off', label: 'Storage Drop Off' },
  { value: 'rv_service_pickup', label: 'RV Service Pickup' },
  { value: 'rv_service_drop_off', label: 'RV Service Drop Off' },
  { value: 'rv_diagnostics', label: 'RV Diagnostics' },
  { value: 'rv_estimate_build', label: 'RV Estimate Build' },
  { value: 'rv_repair', label: 'RV Repair' },
  { value: 'parts', label: 'Parts' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS = {
  scheduled: { bg: '#dbeafe', text: '#1e40af' },
  confirmed: { bg: '#d1fae5', text: '#065f46' },
  arrived: { bg: '#ddd6fe', text: '#5b21b6' },
  in_progress: { bg: '#fef3c7', text: '#92400e' },
  complete: { bg: '#e5e7eb', text: '#374151' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  no_show: { bg: '#fce7f3', text: '#9d174d' },
};

const TYPE_COLORS = {
  // New types
  storage_pickup:      { bg: '#eab308', dark: '#ca8a04' }, // yellow
  storage_drop_off:    { bg: '#7c3aed', dark: '#6d28d9' }, // deep purple
  rv_service_pickup:   { bg: '#ea580c', dark: '#c2410c' }, // orange
  rv_service_drop_off: { bg: '#059669', dark: '#047857' }, // emerald green
  rv_diagnostics:      { bg: '#dc2626', dark: '#b91c1c' }, // red
  rv_estimate_build:   { bg: '#d97706', dark: '#b45309' }, // amber
  // Existing
  rv_repair:           { bg: '#16a34a', dark: '#15803d' }, // green
  rv_service:          { bg: '#16a34a', dark: '#15803d' }, // green
  parts:               { bg: '#0891b2', dark: '#0e7490' }, // cyan
  other:               { bg: '#6b7280', dark: '#4b5563' }, // gray
  // Legacy values left so old appointments still render with a color
  drop_off:            { bg: '#2563eb', dark: '#1d4ed8' },
  pick_up:             { bg: '#ea580c', dark: '#c2410c' },
  storage:             { bg: '#7c3aed', dark: '#6d28d9' },
};
const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.other;

const TYPE_LABELS = {};
APPT_TYPES.forEach(t => { TYPE_LABELS[t.value] = t.label; });

const STATUS_LABELS = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  complete: 'Complete',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

// Small status badge shown on calendar cards so you can see appointment
// status at a glance without opening the appointment.
function StatusChip({ status, small }) {
  if (!status) return null;
  const colors = STATUS_COLORS[status] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{
      padding: small ? '1px 5px' : '2px 8px',
      borderRadius: '4px',
      fontSize: small ? '0.6rem' : '0.7rem',
      fontWeight: 700,
      backgroundColor: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

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
  // Display in Mountain Time — avoid UTC conversion from raw Date parsing
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Denver' });
}

function formatShortDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthEnd(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Schedule() {
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [currentMonth, setCurrentMonth] = useState(getMonthStart(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterTech, setFilterTech] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelledAppts, setCancelledAppts] = useState([]);
  const [cancelledLoading, setCancelledLoading] = useState(false);
  const [mobileDayOffset, setMobileDayOffset] = useState(new Date().getDay()); // 0-6, start on today
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMobile = useIsMobile();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Load technicians for list view filters
  useEffect(() => {
    api.getTechnicians().then(data => {
      setTechnicians(data.technicians || data || []);
    }).catch(() => {});
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let params;
      if (view === 'week') {
        params = {
          date_from: formatDate(weekStart),
          date_to: formatDate(weekEnd),
          limit: 200,
        };
      } else if (view === 'month') {
        const mStart = getMonthStart(currentMonth);
        const mEnd = getMonthEnd(currentMonth);
        params = {
          date_from: formatDate(mStart),
          date_to: formatDate(mEnd),
          limit: 500,
        };
      } else {
        // list view: today + 6 months
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sixMonths = addMonths(today, 6);
        params = {
          date_from: formatDate(today),
          date_to: formatDate(sixMonths),
          limit: 500,
        };
      }
      const data = await api.getAppointments(params);
      setAppointments(data.appointments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [view, weekStart, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Fetch cancelled appointments
  const fetchCancelled = async () => {
    setCancelledLoading(true);
    try {
      const data = await api.getAppointments({
        include_cancelled: 'true',
        limit: 500,
        sort: 'scheduled_at',
        order: 'desc',
      });
      setCancelledAppts(data.appointments);
    } catch (err) {
      console.error('Failed to load cancelled appointments:', err);
    } finally {
      setCancelledLoading(false);
    }
  };

  useEffect(() => {
    if (showCancelled) fetchCancelled();
  }, [showCancelled]);

  // Week navigation
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
  const goTodayWeek = () => setWeekStart(getWeekStart(new Date()));

  // Month navigation
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goTodayMonth = () => setCurrentMonth(getMonthStart(new Date()));

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
    const dateKey = new Date(appt.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
    if (appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey].push(appt);
    }
  });
  Object.values(appointmentsByDate).forEach(arr =>
    arr.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  );

  const todayStr = formatDate(new Date());

  // ---- MONTH VIEW helpers ----
  const buildMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    // Build grid: fill in leading days from prev month
    const cells = [];
    const prevMonthLast = new Date(year, month, 0);
    const prevDays = prevMonthLast.getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, inMonth: false, date: new Date(year, month - 1, prevDays - i) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }
    // Fill trailing days
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
      }
    }
    return cells;
  };

  const monthApptsByDate = {};
  if (view === 'month') {
    appointments.forEach(appt => {
      const dateKey = new Date(appt.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
      if (!monthApptsByDate[dateKey]) monthApptsByDate[dateKey] = [];
      monthApptsByDate[dateKey].push(appt);
    });
    Object.values(monthApptsByDate).forEach(arr =>
      arr.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    );
  }

  // ---- LIST VIEW helpers ----
  const filteredListAppts = appointments
    .filter(appt => filterType === 'all' || appt.appointment_type === filterType)
    .filter(appt => filterTech === 'all' || String(appt.technician_id) === filterTech)
    .filter(appt => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = `${appt.first_name || ''} ${appt.last_name || ''} ${appt.company_name || ''}`.toLowerCase();
      return name.includes(q);
    })
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const listGrouped = {};
  filteredListAppts.forEach(appt => {
    const dateKey = new Date(appt.scheduled_at).toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
    if (!listGrouped[dateKey]) listGrouped[dateKey] = [];
    listGrouped[dateKey].push(appt);
  });
  const listDates = Object.keys(listGrouped).sort();

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleBulkResend = async () => {
    // Count upcoming appointments with email
    const upcomingWithEmail = appointments.filter(a =>
      !['cancelled', 'complete', 'no_show'].includes(a.status)
    ).length;
    if (!window.confirm(
      `Send confirmation emails to all customers with upcoming appointments who have an email on file?\nThis may send up to ${upcomingWithEmail} emails.`
    )) return;
    setBulkSending(true);
    setBulkResult(null);
    try {
      const result = await api.bulkResendConfirmations();
      setBulkResult(result);
      setTimeout(() => setBulkResult(null), 8000);
    } catch (err) {
      alert('Bulk resend failed: ' + err.message);
    } finally {
      setBulkSending(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '20px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ margin: 0 }}>Schedule</h1>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={handleBulkResend} disabled={bulkSending} style={btnNav}>
                {bulkSending ? 'Sending...' : '\u2709 Resend All Upcoming'}
              </button>
            )}
            <button onClick={() => navigate('/schedule/new')} style={btnPrimary}>
              + New Appointment
            </button>
          </div>
        )}
      </div>
      {isMobile && (
        <button onClick={() => navigate('/schedule/new')} style={{ ...btnPrimary, width: '100%', marginBottom: '12px', padding: '14px 20px', fontSize: '1rem' }}>
          + New Appointment
        </button>
      )}
      {bulkResult && (
        <div style={{
          padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem',
          backgroundColor: bulkResult.failed === 0 ? '#f0fdf4' : '#fefce8',
          color: bulkResult.failed === 0 ? '#065f46' : '#854d0e',
          border: `1px solid ${bulkResult.failed === 0 ? '#bbf7d0' : '#fde68a'}`,
        }}>
          Sent {bulkResult.sent} of {bulkResult.total} confirmation emails.
          {bulkResult.failed > 0 && ` ${bulkResult.failed} failed.`}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {view === 'week' && !isMobile && (
            <>
              <button onClick={prevWeek} style={btnNav}>&larr;</button>
              <button onClick={goTodayWeek} style={btnNav}>Today</button>
              <button onClick={nextWeek} style={btnNav}>&rarr;</button>
              <span style={{ fontWeight: 600, marginLeft: '8px', fontSize: isMobile ? '0.85rem' : undefined }}>
                {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                {' \u2013 '}
                {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </>
          )}
          {view === 'week' && isMobile && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={prevWeek} style={btnNav}>&larr;</button>
              <button onClick={goTodayWeek} style={btnNav}>Today</button>
              <button onClick={nextWeek} style={btnNav}>&rarr;</button>
            </div>
          )}
          {view === 'month' && (
            <>
              <button onClick={prevMonth} style={btnNav}>&larr;</button>
              <button onClick={goTodayMonth} style={btnNav}>Today</button>
              <button onClick={nextMonth} style={btnNav}>&rarr;</button>
              <span style={{ fontWeight: 600, marginLeft: '8px' }}>{monthLabel}</span>
            </>
          )}
          {view === 'list' && (
            <span style={{ fontWeight: 600, color: '#374151', fontSize: isMobile ? '0.85rem' : undefined }}>
              Upcoming: {filteredListAppts.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Always-visible customer name search. Typing here jumps the
              calendar to List view so the search results are actually shown. */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              const q = e.target.value;
              setSearchQuery(q);
              if (q.trim() && view !== 'list') setView('list');
            }}
            placeholder="Search customer name..."
            style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', width: isMobile ? '160px' : '220px' }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setView('week')} style={view === 'week' ? btnToggleActive : btnToggle}>Week</button>
            <button onClick={() => setView('month')} style={view === 'month' ? btnToggleActive : btnToggle}>Month</button>
            <button onClick={() => setView('list')} style={view === 'list' ? btnToggleActive : btnToggle}>List</button>
          </div>
        </div>
      </div>

      {/* List view filter bar (search input now lives above next to the view toggles) */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Types</option>
            {APPT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filterTech}
            onChange={e => setFilterTech(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Technicians</option>
            {technicians.map(t => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCancelled(!showCancelled)}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: showCancelled ? '2px solid #dc2626' : '1px solid #d1d5db',
              backgroundColor: showCancelled ? '#fef2f2' : '#fff',
              color: showCancelled ? '#dc2626' : '#6b7280',
              marginLeft: 'auto',
            }}
          >
            {showCancelled ? 'Hide Cancelled' : 'Show Cancelled'}
          </button>
        </div>
      )}

      {/* Color legend — all views */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {APPT_TYPES.map(t => (
          <div key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#374151' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: getTypeColor(t.value).bg }} />
            {t.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>
      ) : view === 'week' ? (
        /* ---- WEEK VIEW ---- */
        isMobile ? (
          /* Mobile: one day at a time */
          (() => {
            const mobileDay = days[mobileDayOffset] || days[0];
            const mobileKey = formatDate(mobileDay);
            const mobileAppts = appointmentsByDate[mobileKey] || [];
            const isToday = mobileKey === todayStr;
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button onClick={() => setMobileDayOffset(Math.max(0, mobileDayOffset - 1))} disabled={mobileDayOffset === 0} style={{ ...btnNav, fontSize: '1.2rem', padding: '8px 16px', opacity: mobileDayOffset === 0 ? 0.3 : 1 }}>&larr;</button>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isToday ? '#1e40af' : '#1e3a5f' }}>
                      {mobileDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    {isToday && <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Today</div>}
                  </div>
                  <button onClick={() => setMobileDayOffset(Math.min(6, mobileDayOffset + 1))} disabled={mobileDayOffset === 6} style={{ ...btnNav, fontSize: '1.2rem', padding: '8px 16px', opacity: mobileDayOffset === 6 ? 0.3 : 1 }}>&rarr;</button>
                </div>
                {/* Day dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                  {days.map((d, i) => (
                    <button key={i} onClick={() => setMobileDayOffset(i)} style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                      backgroundColor: i === mobileDayOffset ? '#1e3a5f' : formatDate(d) === todayStr ? '#dbeafe' : '#f3f4f6',
                      color: i === mobileDayOffset ? '#fff' : formatDate(d) === todayStr ? '#1e40af' : '#6b7280',
                    }}>
                      {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </button>
                  ))}
                </div>
                {mobileAppts.length === 0 ? (
                  <div onClick={() => navigate('/schedule/new', { state: { date: mobileKey } })} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>+</div>
                    Tap to add appointment
                  </div>
                ) : mobileAppts.map(appt => {
                  const tc = getTypeColor(appt.appointment_type);
                  return (
                  <div key={appt.id} onClick={() => navigate(`/schedule/${appt.id}`)} style={{
                    padding: '14px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: tc.bg,
                    borderLeft: `4px solid ${tc.dark}`,
                    color: '#fff',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatTime(appt.scheduled_at)}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>
                      {appt.last_name}{appt.first_name ? `, ${appt.first_name}` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.25)' }}>
                        {TYPE_LABELS[appt.appointment_type] || appt.appointment_type}
                      </span>
                      <StatusChip status={appt.status} />
                      {appt.technician_name && <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{appt.technician_name}</span>}
                    </div>
                    {(appt.unit_year || appt.unit_make || appt.unit_model) && (
                      <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '4px' }}>
                        {[appt.unit_year, appt.unit_make, appt.unit_model].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          /* Desktop: 7-column grid */
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
                  <div
                    onClick={() => navigate('/schedule/new', { state: { date: key } })}
                    style={{ padding: '4px', minHeight: '120px', cursor: 'pointer' }}
                    title="Click to add appointment"
                  >
                    {dayAppts.length === 0 ? (
                      <div style={{ color: '#d1d5db', fontSize: '1.2rem', textAlign: 'center', padding: '16px 0' }}>+</div>
                    ) : dayAppts.map(appt => {
                      const tc = getTypeColor(appt.appointment_type);
                      return (
                      <div
                        key={appt.id}
                        onClick={(e) => { e.stopPropagation(); navigate(`/schedule/${appt.id}`); }}
                        style={{
                          ...apptCard,
                          backgroundColor: tc.bg,
                          color: '#fff',
                          borderLeft: `3px solid ${tc.dark}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            {formatTime(appt.scheduled_at)}
                          </span>
                          <StatusChip status={appt.status} small />
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.85 }}>
                          {TYPE_LABELS[appt.appointment_type] || appt.appointment_type}
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.85 }}>
                          {appt.last_name}{appt.first_name ? `, ${appt.first_name}` : ''}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : view === 'month' ? (
        /* ---- MONTH VIEW ---- */
        <div>
          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={monthDayOfWeekHeader}>{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
            {buildMonthGrid().map((cell, idx) => {
              const cellKey = formatDate(cell.date);
              const isToday = cellKey === todayStr;
              const cellAppts = (monthApptsByDate[cellKey] || []);
              const showAppts = cellAppts.slice(0, 3);
              const moreCount = cellAppts.length - 3;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    navigate('/schedule/new', { state: { date: cellKey } });
                  }}
                  className="month-grid-cell"
                  style={{
                    ...monthCell,
                    backgroundColor: isToday ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: isToday ? 700 : 400,
                    color: !cell.inMonth ? '#d1d5db' : isToday ? '#1e40af' : '#374151',
                    marginBottom: '4px',
                  }}>
                    {cell.day}
                  </div>
                  {cell.inMonth && showAppts.map(appt => (
                    <div
                      key={appt.id}
                      className="month-pill"
                      onClick={(e) => { e.stopPropagation(); navigate(`/schedule/${appt.id}`); }}
                      style={{
                        ...monthPill,
                        backgroundColor: getTypeColor(appt.appointment_type).bg,
                      }}
                      title={`${formatTime(appt.scheduled_at)} - ${TYPE_LABELS[appt.appointment_type] || appt.appointment_type} - ${appt.last_name || ''} - ${STATUS_LABELS[appt.status] || appt.status || ''}`}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appt.status === 'arrived' && '✓ '}
                        {appt.status === 'complete' && '✓✓ '}
                        {appt.status === 'no_show' && '✕ '}
                        {formatTime(appt.scheduled_at)} {appt.last_name || ''}
                      </span>
                    </div>
                  ))}
                  {cell.inMonth && moreCount > 0 && (
                    <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>
                      +{moreCount} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ---- LIST VIEW (6 months) ---- */
        <div>
          {listDates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>No upcoming appointments</div>
          ) : listDates.map(dateKey => {
            const dateObj = new Date(dateKey + 'T12:00:00');
            const dateLabel = dateObj.toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            });
            const dayAppts = listGrouped[dateKey];

            return (
              <div key={dateKey} style={{ marginBottom: '20px' }}>
                <div style={listDateHeader}>{dateLabel}</div>
                {dayAppts.map(appt => (
                  <div
                    key={appt.id}
                    onClick={() => navigate(`/schedule/${appt.id}`)}
                    style={{ ...listRow, borderLeft: `4px solid ${getTypeColor(appt.appointment_type).bg}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', minWidth: '80px' }}>
                        {formatTime(appt.scheduled_at)}
                      </span>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: getTypeColor(appt.appointment_type).bg,
                      }}>
                        {TYPE_LABELS[appt.appointment_type] || appt.appointment_type}
                      </span>
                      <StatusChip status={appt.status} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {appt.last_name}{appt.first_name ? `, ${appt.first_name}` : ''}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {[appt.unit_year, appt.unit_make, appt.unit_model].filter(Boolean).join(' ') || ''}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>&rarr;</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancelled Appointments Archive */}
      {view === 'list' && showCancelled && (
        <div style={{ marginTop: '32px', borderTop: '2px solid #fecaca', paddingTop: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>
            Cancelled Appointments ({cancelledAppts.length})
          </h2>
          {cancelledLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Loading cancelled...</div>
          ) : cancelledAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No cancelled appointments</div>
          ) : (() => {
            // Group by customer to show repeat cancellers
            const byCust = {};
            cancelledAppts.forEach(appt => {
              const key = appt.customer_id;
              if (!byCust[key]) byCust[key] = { name: `${appt.last_name || ''}${appt.first_name ? ', ' + appt.first_name : ''}`, company: appt.company_name, appts: [] };
              byCust[key].appts.push(appt);
            });
            const sorted = Object.entries(byCust).sort((a, b) => b[1].appts.length - a[1].appts.length);
            return (
              <div>
                {sorted.map(([custId, data]) => (
                  <div key={custId} style={{
                    marginBottom: '12px', padding: '12px 16px', backgroundColor: data.appts.length >= 3 ? '#fef2f2' : '#fff',
                    border: `1px solid ${data.appts.length >= 3 ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#374151' }}>
                        {data.name}{data.company ? ` (${data.company})` : ''}
                      </span>
                      <span style={{
                        padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: data.appts.length >= 3 ? '#dc2626' : data.appts.length >= 2 ? '#f59e0b' : '#9ca3af',
                        color: '#fff',
                      }}>
                        {data.appts.length} cancellation{data.appts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {data.appts.map(appt => {
                      const d = new Date(appt.scheduled_at);
                      return (
                        <div key={appt.id} style={{ fontSize: '0.8rem', color: '#6b7280', padding: '2px 0', display: 'flex', gap: '12px' }}>
                          <span>{d.toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>{formatTime(appt.scheduled_at)}</span>
                          <span style={{ padding: '0 6px', borderRadius: '3px', fontSize: '0.7rem', backgroundColor: getTypeColor(appt.appointment_type).bg, color: '#fff' }}>
                            {TYPE_LABELS[appt.appointment_type] || appt.appointment_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Mobile floating action button */}
      {isMobile && (
        <button className="mobile-fab" onClick={() => navigate('/schedule/new')}>+</button>
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
const tableStyle = { // eslint-disable-line no-unused-vars
  width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff',
  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
const thStyle = { // eslint-disable-line no-unused-vars
  textAlign: 'left', padding: '12px 16px', backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.75rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em',
};
const tdStyle = { // eslint-disable-line no-unused-vars
  padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem',
};

// Month view styles
const monthDayOfWeekHeader = {
  textAlign: 'center', padding: '8px', fontWeight: 600, fontSize: '0.75rem',
  color: '#6b7280', backgroundColor: '#f9fafb', textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
const monthCell = {
  minHeight: '100px', padding: '6px', backgroundColor: '#fff',
  verticalAlign: 'top',
};
const monthPill = {
  padding: '2px 6px', borderRadius: '3px', fontSize: '0.65rem',
  color: '#fff', marginBottom: '2px', cursor: 'pointer',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

// List view styles
const selectStyle = {
  padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.85rem', color: '#374151', backgroundColor: '#fff',
  cursor: 'pointer', minWidth: '160px',
};
const listDateHeader = {
  fontWeight: 700, fontSize: '0.9rem', color: '#1e3a5f',
  padding: '8px 0', borderBottom: '2px solid #e5e7eb', marginBottom: '4px',
};
const listRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
  borderRadius: '4px', transition: 'background-color 0.1s',
};
