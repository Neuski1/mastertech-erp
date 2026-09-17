// ---------------------------------------------------------------------------
// Lead spam scoring.
//
// Nothing here deletes anything. Every submission is scored, the reasons are
// recorded, and anything at or over THRESHOLD is quarantined: it still writes
// to the leads table with is_spam = true, but it creates no customer, touches
// no customer notes, and fires no notification. Staff review it in the Spam
// tab and can release a false positive.
//
// Scoring is additive with an RV-vocabulary credit, so a real customer who
// happens to paste a link is not silently swallowed.
// ---------------------------------------------------------------------------

const THRESHOLD = 6;
const MIN_FILL_SECONDS = 3;
const MAX_FORM_AGE_HOURS = 12;

// A bare domain or any scheme. Real RV owners describing a broken furnace do
// not link to anything; every pitch does.
const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|co|ru|cn|info|biz|xyz|top|online|site|shop|club|live|agency)\b/i;
const MARKUP_RE = /<\s*(?:a|script|iframe|img|div|br|p)\b|\[url=|\[\/?link\]|\{\{/i;
const NON_LATIN_RE = /[Ѐ-ӿ؀-ۿ一-鿿぀-ヿ֐-׿]/;

const PITCH_TERMS = [
  'seo', 'backlink', 'back link', 'guest post', 'guest blogging', 'rank higher',
  'first page of google', 'page one of google', 'top of google', 'search rankings',
  'web design', 'website design', 'redesign your', 'web development', 'app development',
  'digital marketing', 'marketing services', 'lead generation', 'leads for your',
  'social media management', 'increase your traffic', 'more traffic', 'more customers',
  'noticed your website', 'noticed your site', 'visited your website', 'came across your',
  'i was browsing', 'checking your website', 'your website is not', 'website audit',
  'free audit', 'free consultation', 'no obligation', 'limited time offer',
  'crypto', 'bitcoin', 'forex', 'investment opportunity', 'loan offer', 'funding for your',
  'business loan', 'merchant cash', 'credit repair', 'work from home', 'make money',
  'dear sir', 'dear owner', 'dear madam', 'to whom it may concern', 'esteemed',
  'outsourcing', 'offshore team', 'dedicated developers', 'hire our', 'our agency',
  'click here', 'unsubscribe', 'viagra', 'casino', 'escort', 'porn', 'adult',
];

// Vocabulary only a real RV customer uses. Credits against the score so one
// stray link in a genuine request does not quarantine a paying job.
const RV_TERMS = [
  'rv', 'motorhome', 'motor home', 'travel trailer', 'fifth wheel', '5th wheel',
  'camper', 'trailer', 'toy hauler', 'class a', 'class b', 'class c', 'coach',
  'winterize', 'dewinterize', 'de-winterize', 'furnace', 'water heater', 'awning',
  'slide out', 'slideout', 'slide-out', 'black tank', 'grey tank', 'gray tank',
  'holding tank', 'converter', 'inverter', 'shore power', 'propane', 'lp gas',
  'roof leak', 'delamination', 'leveling', 'generator', 'air conditioner',
  'refrigerator', 'fridge', 'toilet', 'plumbing', 'electrical', 'solar', 'victron',
  'lithium', 'battery', 'axle', 'brakes', 'bearings', 'storage', 'roof seal', 'reseal',
  'jayco', 'keystone', 'forest river', 'winnebago', 'thor', 'grand design', 'airstream',
  'coachmen', 'heartland', 'dutchmen', 'newmar', 'tiffin', 'lance', 'nash', 'arctic fox',
];

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'trashmail.com', 'getnada.com',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mintemail.com', 'spam4.me',
];

const lc = (v) => String(v == null ? '' : v).toLowerCase();
const digits = (v) => String(v == null ? '' : v).replace(/\D/g, '');

// A real US number: 10 digits (or 11 leading 1), area code and exchange both
// starting 2-9. Rejects 000/111/555-prefixed and other placeholder shapes.
function phoneShape(raw) {
  let d = digits(raw);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  if (!d) return 'missing';
  if (d.length !== 10) return 'bad_length';
  // Deliberate fakes are checked before the NANP rules so they score as the
  // heavier "fake pattern" rather than a generic formatting miss.
  if (/^(\d)\1{9}$/.test(d)) return 'repeated_digits';
  if ('01234567890'.includes(d) || '09876543210'.includes(d)) return 'sequential';
  if (d.slice(0, 3) === '555' || d.slice(3, 6) === '555') return 'placeholder';
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(d)) return 'invalid_nanp';
  return 'ok';
}

function countTerms(haystack, terms) {
  const hits = [];
  for (const t of terms) {
    // Word-boundary match so "rv" does not fire inside "survey" and "seo"
    // does not fire inside "seosomething".
    const re = new RegExp(`(?:^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`, 'i');
    if (re.test(haystack)) hits.push(t);
  }
  return hits;
}

// ---------------------------------------------------------------------------
// scoreLead — pure, no database. Returns { score, reasons, isSpam }.
//
// input: { name, email, phone, message, honeypot, honeypot2, formStartedAt,
//          turnstileOk, userAgent }
// turnstileOk: true (passed), false (failed), null (not configured, skipped)
// ---------------------------------------------------------------------------
function scoreLead(input = {}) {
  const reasons = [];
  let score = 0;
  const add = (points, why) => { score += points; reasons.push(`${why} (+${points})`); };

  const name = String(input.name || '');
  const email = String(input.email || '');
  const phone = String(input.phone || '');
  const message = String(input.message || '');
  const freeText = `${name} ${message}`;
  const blob = lc(freeText);

  // --- Hard blocks: no human ever trips these -------------------------------
  if (String(input.honeypot || '').trim() || String(input.honeypot2 || '').trim()) {
    add(100, 'honeypot field filled');
  }

  if (input.turnstileOk === false) add(100, 'turnstile verification failed');

  const started = input.formStartedAt ? Number(input.formStartedAt) : null;
  if (started && Number.isFinite(started)) {
    const seconds = (Date.now() - started) / 1000;
    if (seconds < MIN_FILL_SECONDS) add(100, `form completed in ${seconds.toFixed(1)}s`);
    else if (seconds > MAX_FORM_AGE_HOURS * 3600) add(4, 'stale form token');
  }

  // --- Content signals ------------------------------------------------------
  if (URL_RE.test(freeText)) add(5, 'link or domain in the message');
  if (MARKUP_RE.test(freeText)) add(5, 'html or bbcode markup');
  if (NON_LATIN_RE.test(freeText)) add(5, 'non-latin script');

  const pitch = countTerms(blob, PITCH_TERMS);
  if (pitch.length) add(Math.min(8, pitch.length * 4), `pitch wording: ${pitch.slice(0, 4).join(', ')}`);

  if (URL_RE.test(name)) add(4, 'link in the name field');
  if (name && digits(name).length >= 4) add(3, 'name is mostly digits');
  if (name && name.length > 60) add(2, 'name unreasonably long');

  if (message.length > 1500) add(2, 'message over 1500 characters');
  if (message.length > 40 && message === message.toUpperCase()) add(2, 'message is all caps');
  if ((message.match(/!/g) || []).length > 3) add(1, 'excessive exclamation marks');

  // --- Contact sanity -------------------------------------------------------
  const ps = phoneShape(phone);
  if (ps === 'invalid_nanp' || ps === 'bad_length') add(4, `phone is not a valid US number (${ps})`);
  else if (ps === 'repeated_digits' || ps === 'sequential' || ps === 'placeholder') add(6, `fake phone pattern (${ps})`);

  const domain = lc(email.split('@')[1] || '');
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) add(5, `disposable email domain ${domain}`);
  if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) add(3, 'malformed email address');

  if (!phone && !email) add(4, 'no phone and no email');

  if (!input.userAgent) add(2, 'no browser user agent');

  // --- RV credit: real customers talk about RVs -----------------------------
  const rv = countTerms(blob, RV_TERMS);
  if (rv.length >= 2) { score -= 4; reasons.push(`rv vocabulary: ${rv.slice(0, 4).join(', ')} (-4)`); }
  else if (rv.length === 1) { score -= 2; reasons.push(`rv vocabulary: ${rv[0]} (-2)`); }

  if (score < 0) score = 0;
  return { score, reasons, isSpam: score >= THRESHOLD };
}

// ---------------------------------------------------------------------------
// velocityScore — database-backed rate limiting. Separate from scoreLead so
// the scoring rules stay unit-testable without a connection.
// ---------------------------------------------------------------------------
async function velocityScore(client, { ip, phone, email, message }) {
  const reasons = [];
  let score = 0;
  const add = (points, why) => { score += points; reasons.push(`${why} (+${points})`); };

  try {
    if (ip) {
      const { rows } = await client.query(
        "SELECT COUNT(*)::int AS n FROM leads WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'",
        [ip]
      );
      if (rows[0].n >= 5) add(6, `${rows[0].n} submissions from this IP in the last hour`);
      else if (rows[0].n >= 3) add(3, `${rows[0].n} submissions from this IP in the last hour`);
    }

    const contact = digits(phone) || lc(email);
    if (contact) {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS n FROM leads
          WHERE created_at > NOW() - INTERVAL '24 hours'
            AND (regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') = $1 AND $1 <> ''
                 OR LOWER(COALESCE(email,'')) = $2 AND $2 <> '')`,
        [digits(phone), lc(email)]
      );
      if (rows[0].n >= 3) add(5, `${rows[0].n} submissions from this contact in 24 hours`);
    }

    // Identical body from a DIFFERENT contact is a blast. The same person
    // submitting twice is a double-click, not spam, so their own earlier
    // submission is excluded: quarantining a real customer's second try
    // would be worse than letting a duplicate through.
    const body = String(message || '').trim();
    if (body.length > 60) {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS n FROM leads
          WHERE created_at > NOW() - INTERVAL '7 days'
            AND TRIM(COALESCE(message,'')) = $1
            AND regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') IS DISTINCT FROM NULLIF($2, '')
            AND LOWER(COALESCE(email,'')) IS DISTINCT FROM NULLIF($3, '')`,
        [body, digits(phone), lc(email)]
      );
      if (rows[0].n >= 1) add(6, 'identical message body from a different contact in the last 7 days');
    }
  } catch (err) {
    // Velocity is a bonus signal. A failure here must never block a lead.
    console.error('velocityScore error (ignored):', err.message);
  }

  return { score, reasons };
}

// ---------------------------------------------------------------------------
// verifyTurnstile — returns true, false, or null when no secret is configured.
// Until Carol creates the Cloudflare site key this stays null and the rest of
// the scoring carries the load, so the filter ships without waiting on it.
// ---------------------------------------------------------------------------
async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return null;

  // A MISSING token is not a failure unless we know the widget is live on the
  // forms. The secret gets configured before the front end ships the widget,
  // and treating that gap as a failure quarantines every real customer. Flip
  // TURNSTILE_REQUIRED=true once the widget is rendering on both forms.
  if (!token) {
    return process.env.TURNSTILE_REQUIRED === 'true' ? false : null;
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.append('remoteip', remoteIp);
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const json = await resp.json();
    return json.success === true;
  } catch (err) {
    // Cloudflare unreachable must not take the form down with it.
    console.error('turnstile verify error (treated as skipped):', err.message);
    return null;
  }
}

module.exports = { scoreLead, velocityScore, verifyTurnstile, phoneShape, THRESHOLD };
