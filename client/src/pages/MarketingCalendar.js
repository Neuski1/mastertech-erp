import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import MarketingNav from '../components/MarketingNav';
import ImagePicker from '../components/ImagePicker';

// ---------------------------------------------------------------------------
// Marketing calendar. Twelve months forward, visual month grid.
//
// Terri drops a promo tag on a date. Smile picks it up and builds the piece in
// the Campaigns section, which links the campaign back to the calendar row.
// Colors group by where it goes: email, Facebook/Instagram, Google/YouTube.
// ---------------------------------------------------------------------------

// Keep in step with CHANNELS in server/src/routes/marketingCalendar.js. The
// server validates against its copy, so anything here that is not there will be
// rejected on save.
const CHANNELS = ['Email', 'Facebook', 'Instagram', 'YouTube', 'Google Ads', 'Google Business Profile', 'Partner', 'Website', 'Other'];
const OWNERS = ['Terri', 'Smile', 'Carol', 'SEO/GEO'];

const GROUPS = {
  email: { label: 'Email', color: '#1e3a5f', soft: '#e3ebf5', channels: ['Email'] },
  social: { label: 'Facebook / Instagram', color: '#c2255c', soft: '#fce7f0', channels: ['Facebook', 'Instagram'] },
  search: { label: 'Google / YouTube', color: '#c62828', soft: '#fdeaea', channels: ['YouTube', 'Google Ads', 'Google Business Profile'] },
  partner: { label: 'Partner', color: '#047857', soft: '#e3f5ef', channels: ['Partner'] },
  other: { label: 'Other', color: '#6b7280', soft: '#f1f2f4', channels: ['Website', 'Other'] },
};

// An unrecognised channel is a data problem, not a styling one. Make it loud
// instead of letting it blend into the grey Other bucket.
const UNKNOWN_GROUP = { key: 'unknown', label: 'Unknown channel', color: '#b45309', soft: '#fff7ed', channels: [] };

function groupFor(channel) {
  for (const [key, g] of Object.entries(GROUPS)) if (g.channels.includes(channel)) return { key, ...g };
  return { ...UNKNOWN_GROUP };
}

// One status vocabulary across the calendar and the Campaigns section, so a
// piece reads the same in both places.
const STATUSES = [
  { value: 'draft', label: 'Draft', bg: '#f3f4f6', color: '#374151' },
  { value: 'needs_photo', label: 'Needs Photo', bg: '#fef3c7', color: '#92400e' },
  { value: 'approved', label: 'Approved', bg: '#d1fae5', color: '#065f46' },
  { value: 'posted', label: 'Posted', bg: '#dbeafe', color: '#1e40af' },
  { value: 'skipped', label: 'Skipped', bg: '#fee2e2', color: '#991b1b' },
];
const statusMeta = (value) => STATUSES.find(s => s.value === value) || STATUSES[0];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthLabel = (iso) => {
  const [y, m] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
};

const shiftMonth = (iso, delta) => {
  const [y, m] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
};

const currentMonth = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-01`;
};

const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const emptyRow = (month, date) => ({
  month, scheduled_date: date || '', date_note: '', channel: 'Instagram', piece: '',
  owner: 'Terri', status: 'draft', response: '', notes: '',
});

export default function MarketingCalendar() {
  const navigate = useNavigate();
  // Twelve months forward from this month, plus three behind so the response
  // column on what just ran is still reachable.
  const [windowStart, setWindowStart] = useState(shiftMonth(currentMonth(), -3));
  const [selected, setSelected] = useState(currentMonth());
  const [data, setData] = useState({ months: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('month'); // month | list
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragRowId, setDragRowId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const from = windowStart;
  const to = shiftMonth(windowStart, 14);

  const load = useCallback(() => {
    setLoading(true);
    api.getMarketingCalendar({ from, to })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const monthData = data.months.find(m => m.month === selected) || { month: selected, rows: [], notes: '' };

  const save = async () => {
    if (!editing.piece.trim()) { setError('Piece is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...editing };
      if (!payload.scheduled_date) payload.scheduled_date = null;
      if (editing.id) await api.updateCalendarRow(editing.id, payload);
      else await api.createCalendarRow(payload);
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!window.confirm('Remove this from the calendar?')) return;
    try { await api.deleteCalendarRow(row.id); setEditing(null); load(); }
    catch (err) { setError(err.message); }
  };

  // Terri tags it, Smile builds it. Any picture already attached to the row
  // rides along, so a photo found at planning time is not re-hunted at build
  // time.
  const buildIt = (row) => {
    const img = row.image_urls ? `&images=${encodeURIComponent(row.image_urls)}` : '';
    navigate(`/marketing/new?calendar_row=${row.id}&piece=${encodeURIComponent(row.piece)}&channel=${encodeURIComponent(row.channel)}${img}`);
  };

  // Attach a picture straight from the calendar.
  //
  // This SAVES immediately on an existing row rather than waiting for the Save
  // button. Adding a picture and then clicking Approve used to throw the
  // picture away, because Approve closed the dialog without saving. "I added a
  // picture" has to mean it is added.
  const attachImage = async (img) => {
    setPickerOpen(false);
    const urls = [editing?.image_urls || '', img.public_url].filter(Boolean).join(',');
    const nextStatus = editing?.status === 'needs_photo' ? 'draft' : editing?.status;
    setEditing(e => (e ? { ...e, image_urls: urls, status: nextStatus } : e));

    if (!editing?.id) return; // new row, saved with the rest on Save
    try {
      const saved = await api.updateCalendarRow(editing.id, { image_urls: urls });
      // Pull the row back so the linked campaign's synced state is reflected.
      setEditing(e => (e && e.id === saved.id ? { ...e, ...saved } : e));
      load();
    } catch (err) { setError(err.message); }
  };

  // Approve or send back the linked campaign without leaving the calendar.
  // Carol's ask: after adding the missing picture, decide right here instead of
  // going and finding the same piece again in the Campaigns list.
  const runApproval = async (action) => {
    const cid = editing?.campaign_id;
    if (!cid) return;
    setError('');
    try {
      // Never decide on a row while edits are still sitting in the dialog.
      if (editing.id) {
        const payload = { ...editing };
        if (!payload.scheduled_date) payload.scheduled_date = null;
        await api.updateCalendarRow(editing.id, payload);
      }
      if (action === 'approve') await api.approveCampaign(cid, null);
      else if (action === 'needs_photo') await api.flagCampaignNeedsPhoto(cid, null);
      else {
        const reason = window.prompt('Why is this coming back? The reason is saved on the piece.');
        if (!reason || !reason.trim()) return;
        await api.rejectCampaign(cid, reason.trim());
      }
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  };

  const removeImage = async (url) => {
    const urls = (editing?.image_urls || '').split(',').filter(u => u && u !== url).join(',');
    setEditing(e => (e ? { ...e, image_urls: urls } : e));
    if (!editing?.id) return;
    try {
      await api.updateCalendarRow(editing.id, { image_urls: urls });
      load();
    } catch (err) { setError(err.message); }
  };

  // Drag a piece to a different day. Only within the month on screen, so the
  // month never has to change underneath the drop.
  const dropOnDay = async (iso) => {
    const id = dragRowId;
    setDragRowId(null);
    setDragOverDay(null);
    if (!id || !iso) return;

    const row = monthData.rows.find(r => r.id === id);
    if (!row || row.scheduled_date === iso) return;
    if (row.status === 'posted') { setError('That one already went out. Moving it would rewrite history.'); return; }

    // Optimistic: move it on screen now, put it back if the save fails.
    setData(d => ({
      ...d,
      months: d.months.map(m => (m.month !== selected ? m : {
        ...m,
        rows: m.rows.map(r => (r.id === id ? { ...r, scheduled_date: iso } : r)),
      })),
    }));

    try {
      await api.updateCalendarRow(id, { scheduled_date: iso, date_note: null });
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  // --- month grid ---------------------------------------------------------
  const [year, mon] = selected.split('-').map(Number);
  const firstWeekday = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rowsForDay = (day) => {
    const iso = `${selected.slice(0, 7)}-${String(day).padStart(2, '0')}`;
    return monthData.rows.filter(r => r.scheduled_date && String(r.scheduled_date).slice(0, 10) === iso);
  };
  const undatedRows = monthData.rows.filter(r => !r.scheduled_date);

  const monthStrip = [];
  for (let i = 0; i < 15; i++) monthStrip.push(shiftMonth(windowStart, i));

  const countFor = (iso) => (data.months.find(m => m.month === iso)?.rows.length) || 0;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  return (
    <div>
      <MarketingNav />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e3a5f' }}>Marketing Calendar</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
            Twelve months ahead. Terri tags the promotion, Smile builds it in Campaigns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setView(view === 'month' ? 'list' : 'month')} style={btnSecondary}>
            {view === 'month' ? 'List view' : 'Month view'}
          </button>
          <button onClick={() => { setWindowStart(shiftMonth(currentMonth(), -3)); setSelected(currentMonth()); }} style={btnSecondary}>Today</button>
          <button onClick={() => setEditing(emptyRow(selected, ''))} style={btnPrimary}>+ Add</button>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {/* Twelve-month strip */}
      <div style={strip}>
        <button onClick={() => setWindowStart(shiftMonth(windowStart, -3))} style={stripArrow}>&larr;</button>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1 }}>
          {monthStrip.map(iso => {
            const [sy, sm] = iso.split('-').map(Number);
            const active = iso === selected;
            const past = iso < currentMonth();
            return (
              <button key={iso} onClick={() => setSelected(iso)} style={stripBtn(active, past)}>
                <div style={{ fontWeight: 700 }}>{MONTH_SHORT[sm - 1]}</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.75 }}>{String(sy).slice(2)}</div>
                <div style={{ fontSize: '0.62rem', marginTop: '2px', opacity: countFor(iso) ? 1 : 0.35 }}>{countFor(iso)}</div>
              </button>
            );
          })}
        </div>
        <button onClick={() => setWindowStart(shiftMonth(windowStart, 3))} style={stripArrow}>&rarr;</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', margin: '12px 0 14px' }}>
        {Object.entries(GROUPS).map(([key, g]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4b5563' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: g.color, display: 'inline-block' }} />
            {g.label}
          </div>
        ))}
        {(() => {
          const bad = data.months.flatMap(m => m.rows).filter(r => groupFor(r.channel).key === 'unknown');
          if (bad.length === 0) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: UNKNOWN_GROUP.color, display: 'inline-block' }} />
              {bad.length} row{bad.length === 1 ? '' : 's'} with an unrecognised channel, open and fix
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', margin: '0 0 10px' }}>
        <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.15rem' }}>{monthLabel(selected)}</h2>
        {view === 'month' && (
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Drag a piece to another day to move it. Click it to edit or approve.
          </span>
        )}
      </div>

      {view === 'month' && (
        <div style={gridWrap}>
          <div style={weekHeader}>
            {DAY_NAMES.map(d => <div key={d} style={weekHeaderCell}>{d}</div>)}
          </div>
          <div style={monthGrid}>
            {cells.map((day, i) => {
              const iso = day ? `${selected.slice(0, 7)}-${String(day).padStart(2, '0')}` : null;
              const isToday = iso === todayIso();
              return (
                <div
                  key={i}
                  style={{
                    ...dayCell,
                    backgroundColor: !day ? '#fafafa'
                      : dragOverDay === iso ? '#e3ebf5'
                      : isToday ? '#fffbeb' : '#fff',
                    outline: dragOverDay === iso ? '2px solid #1e3a5f' : 'none',
                    outlineOffset: '-2px',
                    cursor: day ? 'pointer' : 'default',
                  }}
                  onClick={() => day && setEditing(emptyRow(selected, iso))}
                  onDragOver={(e) => { if (day && dragRowId) { e.preventDefault(); setDragOverDay(iso); } }}
                  onDragLeave={() => { if (dragOverDay === iso) setDragOverDay(null); }}
                  onDrop={(e) => { e.preventDefault(); dropOnDay(iso); }}
                >
                  {day && (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: isToday ? 700 : 500, color: isToday ? '#92400e' : '#9ca3af', marginBottom: '3px' }}>{day}</div>
                      {rowsForDay(day).map(row => {
                        const g = groupFor(row.channel);
                        return (
                          <div
                            key={row.id}
                            draggable={row.status !== 'posted'}
                            onDragStart={(e) => { setDragRowId(row.id); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragEnd={() => { setDragRowId(null); setDragOverDay(null); }}
                            onClick={(e) => { e.stopPropagation(); setEditing({ ...row, month: String(row.month).slice(0, 10), scheduled_date: String(row.scheduled_date).slice(0, 10) }); }}
                            title={row.status === 'posted' ? `${row.channel} — ${row.piece}` : `${row.channel} — ${row.piece}\nDrag to move it to another day`}
                            style={{
                              ...chip,
                              backgroundColor: g.soft,
                              borderLeft: `3px solid ${g.color}`,
                              color: g.color,
                              opacity: row.status === 'skipped' ? 0.5 : (dragRowId === row.id ? 0.4 : 1),
                              cursor: row.status !== 'posted' ? 'grab' : 'pointer',
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{row.channel}</span>{' '}
                            <span style={{ color: '#374151', fontWeight: 500 }}>{row.piece}</span>
                            {row.image_urls && <span title="Has a picture" style={{ marginLeft: '4px' }}>&#9635;</span>}
                            {row.status !== 'draft' && (
                              <span style={{ ...flag, backgroundColor: statusMeta(row.status).color }}>
                                {statusMeta(row.status).label}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'month' && undatedRows.length > 0 && (
        <div style={{ ...panel, marginTop: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>No date set</div>
          {undatedRows.map(row => {
            const g = groupFor(row.channel);
            return (
              <div key={row.id}
                draggable
                onDragStart={(e) => { setDragRowId(row.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragEnd={() => { setDragRowId(null); setDragOverDay(null); }}
                onClick={() => setEditing({ ...row, month: String(row.month).slice(0, 10), scheduled_date: '' })}
                title="Drag onto a day to schedule it"
                style={{ ...chip, backgroundColor: g.soft, borderLeft: `3px solid ${g.color}`, color: g.color, marginBottom: '4px', cursor: 'grab' }}>
                <span style={{ fontWeight: 700 }}>{row.channel}</span>{' '}
                <span style={{ color: '#374151', fontWeight: 500 }}>{row.piece}</span>
                {row.date_note && <span style={{ color: '#9ca3af' }}> · {row.date_note}</span>}
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <div style={panel}>
          {monthData.rows.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Nothing on the calendar this month.</p>}
          {monthData.rows.length > 0 && (
            <table style={table}>
              <thead>
                <tr>
                  <th style={{ ...th, width: '54px' }}>Day</th>
                  <th style={{ ...th, width: '96px' }}>Channel</th>
                  <th style={th}>Piece</th>
                  <th style={{ ...th, width: '70px' }}>Owner</th>
                  <th style={{ ...th, width: '110px' }}>Status</th>
                  <th style={{ ...th, width: '26%' }}>Response</th>
                  <th style={{ ...th, width: '120px' }}></th>
                </tr>
              </thead>
              <tbody>
                {monthData.rows.map(row => {
                  const g = groupFor(row.channel);
                  return (
                    <tr key={row.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ ...td, color: '#6b7280' }}>
                        {row.scheduled_date ? String(row.scheduled_date).slice(8, 10).replace(/^0/, '') : (row.date_note || 'TBD')}
                      </td>
                      <td style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, backgroundColor: g.soft, color: g.color }}>{row.channel}</span>
                      </td>
                      <td style={td}>
                        {row.piece}
                        {row.notes && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>{row.notes}</div>}
                      </td>
                      <td style={{ ...td, color: '#6b7280' }}>{row.owner || ''}</td>
                      <td style={td}>
                        <select value={row.status} onChange={async (e) => { await api.updateCalendarRow(row.id, { status: e.target.value }); load(); }} style={miniSelect}>
                          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td, color: row.response ? '#374151' : '#d1d5db' }}>{row.response || ''}</td>
                      <td style={td}>
                        {row.campaign_id
                          ? <button onClick={() => navigate(`/marketing/${row.campaign_id}`)} style={btnLinkSmall}>Open</button>
                          : <button onClick={() => buildIt(row)} style={btnLinkSmall}>Build it</button>}
                        <button onClick={() => setEditing({ ...row, month: String(row.month).slice(0, 10), scheduled_date: row.scheduled_date ? String(row.scheduled_date).slice(0, 10) : '' })} style={btnLinkSmall}>Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {monthData.notes && (
        <p style={{ margin: '10px 2px 0', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{monthData.notes}</p>
      )}

      {editing && (
        <div style={overlay} onClick={() => setEditing(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '1.1rem' }}>
              {editing.id ? 'Edit' : `Add to ${monthLabel(editing.month)}`}
            </h2>

            {/* The piece this row was built into, and the decision on it.
                Nothing sends by itself, so this is where it gets a yes. */}
            {editing.campaign_id && (
              <div style={approvalPanel(editing.campaign_approval_status)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {CAMPAIGN_APPROVAL_LABEL[editing.campaign_approval_status] || 'Draft'}
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                      {editing.campaign_name || 'Linked campaign'}
                      {editing.campaign_status && editing.campaign_status !== 'draft' ? ` · already ${editing.campaign_status}` : ''}
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate(`/marketing/${editing.campaign_id}`)} style={btnLinkSmall}>Open the campaign</button>
                </div>

                {editing.campaign_status === 'draft' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => runApproval('approve')} style={btnApprove}>Approve</button>
                    <button type="button" onClick={() => runApproval('needs_photo')} style={btnSecondary}>Needs Photo</button>
                    <button type="button" onClick={() => runApproval('reject')} style={btnReject}>Send back</button>
                  </div>
                )}
                <p style={{ margin: '8px 0 0', fontSize: '0.72rem', opacity: 0.85 }}>
                  Approving does not send it. It clears the piece to be sent or posted, which a person still does.
                </p>
              </div>
            )}

            {!editing.campaign_id && editing.id && (
              <div style={{ ...approvalPanel('draft'), fontSize: '0.78rem' }}>
                No campaign built from this row yet, so there is nothing to approve. Add the picture and
                notes here, then use Build it in Campaigns.
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Promotion or piece</label>
              <input value={editing.piece} onChange={(e) => setEditing({ ...editing, piece: e.target.value })} placeholder="Winterize push, before the first hard freeze" style={input} autoFocus />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={label}>Channel</label>
                <select value={editing.channel} onChange={(e) => setEditing({ ...editing, channel: e.target.value })} style={input}>
                  {/* Show an existing bad value so it can be seen and corrected
                      rather than rendering as a blank select. */}
                  {!CHANNELS.includes(editing.channel) && editing.channel && (
                    <option value={editing.channel}>{editing.channel} (not a valid channel, pick one below)</option>
                  )}
                  {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Owner</label>
                <select value={editing.owner || ''} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} style={input}>
                  <option value="">—</option>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Date</label>
                <input type="date" value={editing.scheduled_date || ''} onChange={(e) => setEditing({ ...editing, scheduled_date: e.target.value })} style={input} />
              </div>
              <div>
                <label style={label}>Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} style={input}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Pictures</label>
              {(() => {
                const urls = (editing.image_urls || '').split(',').filter(Boolean);
                return (
                  <>
                    {urls.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {urls.map(u => (
                          <div key={u} style={{ position: 'relative' }}>
                            <img src={u} alt="" style={{ width: '96px', height: '68px', objectFit: 'cover', borderRadius: '6px', display: 'block', backgroundColor: '#f3f4f6' }} />
                            <button type="button" onClick={() => removeImage(u)} title="Remove"
                              style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1 }}>
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => setPickerOpen(true)} style={btnSecondary}>
                      {urls.length ? '+ Add another picture' : '+ Add a picture'}
                    </button>
                    {editing.status === 'needs_photo' && urls.length === 0 && (
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
                        Waiting on a photo. Adding one clears this.
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Notes for whoever builds it</label>
              <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} style={{ ...input, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Response (fill in after it runs)</label>
              <textarea value={editing.response || ''} onChange={(e) => setEditing({ ...editing, response: e.target.value })} rows={2} placeholder="What it actually did." style={{ ...input, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Cancel</button>
              {editing.id && !editing.campaign_id && <button onClick={() => buildIt(editing)} style={btnSecondary}>Build it in Campaigns</button>}
              {editing.id && <button onClick={() => remove(editing)} style={{ ...btnSecondary, color: '#dc2626', marginLeft: 'auto' }}>Delete</button>}
            </div>
          </div>
        </div>
      )}

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={attachImage}
        title="Add a picture to this calendar row"
      />
    </div>
  );
}

const strip = { display: 'flex', alignItems: 'stretch', gap: '6px', backgroundColor: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' };
const stripArrow = { padding: '0 10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '0.9rem' };
const stripBtn = (active, past) => ({
  minWidth: '56px', padding: '6px 4px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
  border: active ? '1px solid #1e3a5f' : '1px solid #e5e7eb',
  backgroundColor: active ? '#1e3a5f' : (past ? '#f9fafb' : '#fff'),
  color: active ? '#fff' : (past ? '#9ca3af' : '#1e3a5f'),
  fontSize: '0.72rem', lineHeight: 1.2,
});
const gridWrap = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const weekHeader = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
const weekHeaderCell = { padding: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' };
const monthGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' };
const dayCell = { minHeight: '96px', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '4px 5px', overflow: 'hidden' };
const chip = { fontSize: '0.68rem', lineHeight: 1.3, padding: '3px 5px', borderRadius: '4px', marginBottom: '3px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'normal' };
const flag = { marginLeft: '4px', padding: '0 4px', borderRadius: '3px', backgroundColor: '#92400e', color: '#fff', fontSize: '0.6rem', fontWeight: 700 };
const panel = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '14px 16px' };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' };
const th = { textAlign: 'left', padding: '4px 6px', fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.03em' };
const td = { padding: '6px', verticalAlign: 'top' };
const miniSelect = { fontSize: '0.7rem', padding: '1px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%' };
const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modal = { backgroundColor: '#fff', borderRadius: '10px', padding: '22px', width: '100%', maxWidth: '620px', maxHeight: '88vh', overflowY: 'auto' };
const label = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' };
const btnPrimary = { padding: '9px 18px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 };
const btnSecondary = { padding: '9px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 };
const btnLinkSmall = { background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, padding: '0 4px' };
const CAMPAIGN_APPROVAL_LABEL = {
  draft: 'Draft, waiting on you', needs_photo: 'Needs a photo', approved: 'Approved',
  rejected: 'Sent back', posted: 'Posted',
};
const APPROVAL_TONE = {
  draft: { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
  needs_photo: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  approved: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  rejected: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  posted: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
};
const approvalPanel = (status) => {
  const t = APPROVAL_TONE[status] || APPROVAL_TONE.draft;
  return {
    padding: '10px 12px', borderRadius: '8px', marginBottom: '14px',
    backgroundColor: t.bg, color: t.color, border: `1px solid ${t.border}`,
  };
};
const btnApprove = { padding: '7px 14px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnReject = { padding: '7px 14px', backgroundColor: '#fff', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const errorBox = { padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' };
