// ---------------------------------------------------------------------------
// Synchronous settings cache.
//
// Why sync: the fee and wording lookups live inside functions that are called
// from the middle of invoice and charge builders — feeConfig(), payInstructions(),
// contract PDF writers. Making those async would ripple through every caller
// and every one of those ripples is a chance to break a money path. So the
// whole of system_settings is held in a Map, refreshed at boot, on every write
// through the settings admin route, and on a timer.
//
// Every accessor takes a fallback and returns it whenever the row is missing,
// blank, unparseable, or out of the catalog's declared range. That is
// deliberate: the cache failing to load must never change a charge. The
// fallbacks passed at each call site are the exact literals that used to be
// hardcoded there, so a total settings outage leaves the system behaving
// exactly as it did before any of this existed.
// ---------------------------------------------------------------------------

const pool = require('./pool');
const { BY_KEY } = require('./settingsCatalog');

let cache = new Map();
let loadedAt = 0;
let loading = null;

const REFRESH_MS = 60 * 1000;

async function load() {
  if (loading) return loading;
  loading = (async () => {
    try {
      const { rows } = await pool.query('SELECT setting_key, setting_value FROM system_settings');
      const next = new Map();
      for (const r of rows) next.set(r.setting_key, r.setting_value);
      cache = next;
      loadedAt = Date.now();
    } catch (err) {
      // Leave the previous cache in place. A DB blip must not blank the values.
      console.error('[settings] load failed, keeping previous cache:', err.message);
    } finally {
      loading = null;
    }
  })();
  return loading;
}

// Called after any write so the next read is current without waiting for the
// timer. Fire-and-forget by design; the caller already has the new values.
function invalidate() {
  loadedAt = 0;
  return load();
}

// Kick a background refresh if the cache is stale. Never blocks a read.
function touch() {
  if (Date.now() - loadedAt > REFRESH_MS && !loading) load();
}

function raw(key) {
  touch();
  const v = cache.get(key);
  return (v === undefined || v === null || String(v).trim() === '') ? null : String(v);
}

// Numbers are range-checked against the catalog. A value outside the declared
// min/max is treated as corrupt and the fallback wins — a fat-fingered 350%
// card fee that somehow got past the API still cannot reach a customer.
function num(key, fallback) {
  const v = raw(key);
  if (v === null) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const def = BY_KEY.get(key);
  if (def) {
    if (def.min != null && n < def.min) return fallback;
    if (def.max != null && n > def.max) return fallback;
  }
  return n;
}

function int(key, fallback) {
  const n = num(key, null);
  if (n === null) return fallback;
  const i = Math.round(n);
  return Number.isFinite(i) ? i : fallback;
}

// Money is rounded to cents so a stray 25.00000001 never reaches an invoice.
function money(key, fallback) {
  const n = num(key, null);
  if (n === null) return fallback;
  return Math.round(n * 100) / 100;
}

function str(key, fallback) {
  const v = raw(key);
  return v === null ? fallback : v;
}

function bool(key, fallback) {
  const v = raw(key);
  if (v === null) return fallback;
  const s = v.trim().toLowerCase();
  if (['true', 't', '1', 'yes', 'on'].includes(s)) return true;
  if (['false', 'f', '0', 'no', 'off'].includes(s)) return false;
  return fallback;
}

// Convenience for the many places that print "3.5%" beside a 0.035 rate.
function pctLabel(key, fallback, decimals = 2) {
  const n = num(key, fallback);
  const s = (n * 100).toFixed(decimals);
  return s.replace(/\.?0+$/, '') + '%';
}

// Async escape hatch, kept for code that would rather await than trust the
// cache (and for the first read at boot before load() has resolved).
async function fresh(key, fallback) {
  await load();
  return str(key, fallback);
}

module.exports = { load, invalidate, num, int, money, str, bool, pctLabel, fresh, REFRESH_MS };
