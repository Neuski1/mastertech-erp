// client/src/utils/dateFormat.js
//
// Centralized date formatting that respects Mountain Time (America/Denver,
// auto-switching MST/MDT).
//
// The key behavior: DATE-only strings (YYYY-MM-DD) are treated as local
// dates, NOT UTC midnight. This fixes the bug where a Postgres DATE column
// like 2026-05-31 was being serialized as 2026-05-31T00:00:00Z, then the
// browser (in MDT, UTC-6) converted that to May 30 5:00 PM local time and
// displayed the wrong day.
//
// Functions:
//   formatDate(v)       -> "5/31/2026"           (date-only)
//   formatDateTime(v)   -> "5/31/2026, 6:30 PM"  (full timestamp, Mountain)
//   formatTime(v)       -> "6:30 PM"             (just the time, Mountain)
//   formatMonthYear(v)  -> "May 2026"            (for report headers)

const TZ = 'America/Denver';
const DATE_OPTS = { year: 'numeric', month: 'numeric', day: 'numeric' };
const DT_OPTS = { ...DATE_OPTS, hour: 'numeric', minute: '2-digit', timeZone: TZ };
const TIME_OPTS = { hour: 'numeric', minute: '2-digit', timeZone: TZ };
const MY_OPTS = { year: 'numeric', month: 'long', timeZone: TZ };

// Match the leading YYYY-MM-DD of any ISO-like string.
function pickLocalParts(value) {
  if (value == null) return null;
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
}

export function formatDate(value) {
  if (value == null || value === '') return '';
  const parts = pickLocalParts(value);
  if (parts) {
    // Treat as a local (Mountain) date, no UTC drift.
    return new Date(parts[0], parts[1], parts[2]).toLocaleDateString('en-US', DATE_OPTS);
  }
  // Fall back: parse as timestamp and convert to Mountain.
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { ...DATE_OPTS, timeZone: TZ });
}

export function formatDateTime(value) {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-US', DT_OPTS);
}

export function formatTime(value) {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString('en-US', TIME_OPTS);
}

export function formatMonthYear(value) {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', MY_OPTS);
}
