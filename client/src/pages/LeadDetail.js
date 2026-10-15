import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LEAD_QUICK_REPLIES } from '../utils/leadReplies';

// ---------------------------------------------------------------------------
// LeadDetail — the page the shop alert text links to.
//
// Designed for one hand, outdoors, next to an RV. Big targets, the customer's
// number as a Text button, and canned replies that send in two taps.
// Everything sends from the shop number through Dialpad, so the thread lands
// on the customer record instead of a personal cell.
// ---------------------------------------------------------------------------

// Carol's approved wording lives in one place, shared with the Records list.
const QUICK_REPLIES = LEAD_QUICK_REPLIES;

// Same recovery as RecordList: the inbound lead agent sometimes truncates the
// stored address at the "@", so fall back to the first full address in the body.
const LEAD_EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const leadEmail = (l) => {
  if (l && l.email && l.email.includes('@')) return l.email;
  const m = ((l && l.message) || '').match(LEAD_EMAIL_RE);
  return m ? m[0] : ((l && l.email) || '');
};

// Gmail compose link, matching the Email button on the Records lead list.
// A bare mailto: does nothing on a PC with no desktop mail app, which is
// why this button looked dead when opened from a notification.
function gmailHref(lead, signature) {
  const first = (lead.customer_first || (lead.name || '').trim().split(/\s+/)[0] || 'there');
  const subject = 'Re: Your request to Master Tech RV Repair & Storage';
  const sent = lead.created_at ? new Date(lead.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : '';
  const quoted = (lead.message || '(no message on file)').split('\n').map((ln) => '> ' + ln).join('\n');
  const body = [
    `Hi ${first},`, '',
    'Thank you for reaching out to Master Tech RV Repair & Storage.', '', '',
    ...(signature ? [signature, ''] : []),
    '-----------------------------------------',
    sent ? `On ${sent} you wrote:` : 'Your original request:',
    quoted,
  ].join('\n');
  return `https://mail.google.com/mail/?view=cm&fs=1&authuser=service@mastertechrvrepair.com&to=${encodeURIComponent(leadEmail(lead))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function field(message, label) {
  const m = String(message || '').match(new RegExp(label + '\\s*:\\s*([^|]*)(?:\\||$)', 'i'));
  return m ? m[1].trim() : '';
}

const when = (t) => (t ? new Date(t).toLocaleString('en-US', {
  timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
}) : '');

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});
  const [signature, setSignature] = useState('');
  const replyRef = useRef(null);
  const inputRef = useRef(null);

  // The Text button replaced Call (tel: links were unreliable). It jumps to
  // the Dialpad reply box below instead of handing off to a phone dialer.
  const jumpToText = () => {
    if (replyRef.current) replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (inputRef.current) setTimeout(() => inputRef.current.focus(), 300);
  };

  useEffect(() => {
    api.getLeadEmailSignature()
      .then((d) => setSignature((d && d.signature) || ''))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      setLead(await api.getLead(id));
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  // Auto-log outreach like the Records list does. Fire-and-forget so a
  // logging failure never blocks the call or the email.
  const autoLog = (channel) => {
    api.logLeadCall(id, {
      contacted_at: new Date().toISOString(),
      entry_type: channel === 'email' ? 'email' : 'call',
      note: channel === 'email' ? 'Emailed (auto-logged)' : 'Called (auto-logged)',
    }).then(() => load()).catch((err) => console.error('auto-log failed', err.message));
  };

  useEffect(() => { load(); }, [load]);

  // Load each photo through the authenticated client and keep the object URL.
  // Revoked on unmount so a long session does not leak blobs.
  useEffect(() => {
    if (!lead || !lead.photos || !lead.photos.length) return undefined;
    let alive = true;
    const made = [];
    (async () => {
      for (const p of lead.photos) {
        try {
          const url = await api.getLeadPhotoUrl(id, p.id);
          if (!alive) { URL.revokeObjectURL(url); return; }
          made.push(url);
          setPhotoUrls((prev) => ({ ...prev, [p.id]: url }));
        } catch (err) {
          console.error('lead photo failed to load', p.id, err.message);
        }
      }
    })();
    return () => { alive = false; made.forEach((u) => URL.revokeObjectURL(u)); };
  }, [lead, id]);

  async function send(text) {
    const body = String(text || '').trim();
    if (!body || sending) return;
    setSending(true);
    setToast(null);
    try {
      await api.replyToLead(id, body);
      setToast({ ok: true, text: 'Text sent' });
      setMsg('');
      load();
    } catch (err) {
      setToast({ ok: false, text: err.message });
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <div style={S.wrap}>
        <p style={{ color: '#b00', marginBottom: 16 }}>{error}</p>
        <button style={S.ghost} onClick={() => navigate('/records')}>Back to Records</button>
      </div>
    );
  }
  if (!lead) return <div style={S.wrap}><p>Loading…</p></div>;

  const rv = field(lead.message, 'RV');
  const len = field(lead.message, 'Length');
  const services = field(lead.message, 'Services');
  const issue = field(lead.message, 'Issue') || field(lead.message, 'Notes');
  const photos = lead.photos || [];
  const contacts = lead.contacts || [];
  const digits = String(lead.phone || '').replace(/\D/g, '');

  return (
    <div style={S.wrap}>
      <button style={S.back} onClick={() => navigate('/records')}>← Records</button>

      <div style={S.head}>
        <span style={S.kicker}>{lead.is_spam ? 'QUARANTINED' : 'WEBSITE LEAD'}</span>
        <h1 style={S.name}>{lead.name || 'No name given'}</h1>
        <p style={S.meta}>{when(lead.created_at)} · {lead.source || 'website'}</p>
      </div>

      <div style={S.actions}>
        {digits && !lead.sms_opt_out && (
          <button type="button" onClick={jumpToText} style={{ ...S.call, border: 'none', cursor: 'pointer' }}>Text {lead.phone}</button>
        )}
        {leadEmail(lead) && (
          <a href={gmailHref(lead, signature)} target="_blank" rel="noopener noreferrer"
             onClick={() => autoLog('email')} style={S.ghost}>Email</a>
        )}
      </div>

      {lead.sms_opt_out && (
        <p style={S.warn}>This customer replied STOP. Texting is blocked, call them instead.</p>
      )}

      <div style={S.card}>
        {rv && <Row label="RV" value={[rv, len].filter(Boolean).join(', ')} />}
        {services && <Row label="Services" value={services} />}
        {lead.email && <Row label="Email" value={lead.email} />}
        {issue && (
          <div style={{ marginTop: 12 }}>
            <div style={S.label}>What they said</div>
            <p style={S.issue}>{issue}</p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div style={S.photos}>
          {photos.map((p) => (
            photoUrls[p.id] ? (
              <a key={p.id} href={photoUrls[p.id]} target="_blank" rel="noreferrer" style={S.photoLink}>
                <img src={photoUrls[p.id]} alt={p.title} style={S.photo} />
              </a>
            ) : (
              <div key={p.id} style={{ ...S.photo, background: '#eef0f3' }} />
            )
          ))}
        </div>
      )}

      {!lead.sms_opt_out && digits && (
        <div style={S.replyBox} ref={replyRef}>
          <div style={S.label}>Text them back, from the shop number</div>
          {QUICK_REPLIES.map((q, i) => (
            <button key={i} style={S.quick} disabled={sending} onClick={() => send(q)}>{q}</button>
          ))}
          <textarea
            ref={inputRef}
            style={S.input}
            rows={3}
            placeholder="Or write your own…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            maxLength={600}
          />
          <button style={{ ...S.send, opacity: sending || !msg.trim() ? 0.5 : 1 }}
                  disabled={sending || !msg.trim()} onClick={() => send(msg)}>
            {sending ? 'Sending…' : 'Send text'}
          </button>
        </div>
      )}

      {toast && (
        <p style={{ ...S.toast, background: toast.ok ? '#e6f4ea' : '#fdecea', color: toast.ok ? '#1e6b34' : '#b3261e' }}>
          {toast.text}
        </p>
      )}

      {contacts.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={S.label}>History</div>
          {contacts.map((c) => (
            <div key={c.id} style={S.histRow}>
              <span style={S.histMeta}>{when(c.contacted_at)} · {c.entry_type}{c.author ? ` · ${c.author}` : ''}</span>
              <span>{c.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Inline styles rather than a new stylesheet: this page is self-contained and
// sized for a phone first, which is where it will almost always be opened.
const S = {
  wrap: { maxWidth: 640, margin: '0 auto', padding: '16px 16px 64px' },
  back: {
    background: 'none', border: 'none', color: '#12355b', fontSize: 15,
    padding: '8px 0', cursor: 'pointer', minHeight: 44,
  },
  head: { marginBottom: 16 },
  kicker: { fontSize: 12, letterSpacing: '.08em', color: '#667', fontWeight: 600 },
  name: { fontSize: 26, margin: '4px 0 2px', lineHeight: 1.2 },
  meta: { margin: 0, color: '#667', fontSize: 14 },
  actions: { display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap' },
  call: {
    flex: '1 1 auto', textAlign: 'center', background: '#12355b', color: '#fff',
    textDecoration: 'none', padding: '14px 18px', borderRadius: 8, fontSize: 17,
    fontWeight: 600, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ghost: {
    textAlign: 'center', background: '#fff', color: '#12355b', border: '1px solid #c7ccd6',
    textDecoration: 'none', padding: '14px 18px', borderRadius: 8, fontSize: 16,
    minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  warn: {
    background: '#fff4e5', border: '1px solid #ffd8a8', color: '#8a5300',
    padding: '10px 12px', borderRadius: 6, fontSize: 14, margin: '0 0 16px',
  },
  card: { background: '#f7f8fa', borderRadius: 8, padding: 14, marginBottom: 16 },
  row: { display: 'flex', gap: 12, padding: '4px 0', fontSize: 15 },
  label: { fontSize: 12, letterSpacing: '.06em', color: '#667', fontWeight: 600, minWidth: 74, textTransform: 'uppercase' },
  issue: { margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.5 },
  photos: { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 },
  photoLink: { flex: '0 0 auto' },
  photo: { height: 110, width: 110, objectFit: 'cover', borderRadius: 8, display: 'block' },
  replyBox: { borderTop: '1px solid #e4e7ec', paddingTop: 18 },
  quick: {
    display: 'block', width: '100%', textAlign: 'left', background: '#fff',
    border: '1px solid #c7ccd6', borderRadius: 8, padding: '12px 14px',
    marginBottom: 8, fontSize: 15, lineHeight: 1.4, cursor: 'pointer', minHeight: 48,
  },
  input: {
    width: '100%', boxSizing: 'border-box', border: '1px solid #c7ccd6',
    borderRadius: 8, padding: 12, fontSize: 16, marginTop: 8, fontFamily: 'inherit',
  },
  send: {
    width: '100%', background: '#12355b', color: '#fff', border: 'none',
    borderRadius: 8, padding: '14px 18px', fontSize: 17, fontWeight: 600,
    marginTop: 8, cursor: 'pointer', minHeight: 48,
  },
  toast: { marginTop: 14, padding: '10px 12px', borderRadius: 6, fontSize: 15 },
  histRow: { display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 0', borderBottom: '1px solid #eef0f3', fontSize: 15 },
  histMeta: { fontSize: 12, color: '#667' },
};
