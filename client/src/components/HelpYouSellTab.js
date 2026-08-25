import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormat';

/**
 * Help You Sell — Sales Facilitation Agreements
 *
 * A second contract, separate from the storage lease, for storage customers who
 * want us to help them sell their RV. Draft -> Preview -> Email -> customer
 * signs online -> signed PDF lands in their customer documents.
 *
 * Ending a storage lease never touches these, and vice versa.
 */

const money = (n) => {
  const v = parseFloat(n);
  if (!isFinite(v)) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const STATUS_STYLES = {
  draft: { bg: '#f3f4f6', fg: '#4b5563', label: 'Draft' },
  sent: { bg: '#dbeafe', fg: '#1e40af', label: 'Sent — awaiting signature' },
  accepted: { bg: '#dcfce7', fg: '#065f46', label: 'Signed' },
  sold: { bg: '#fef3c7', fg: '#92400e', label: 'Sold' },
  cancelled: { bg: '#fee2e2', fg: '#b91c1c', label: 'Cancelled' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span style={{
      backgroundColor: s.bg, color: s.fg, borderRadius: '10px',
      padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

export default function HelpYouSellTab({ flash }) {
  const { isAdmin, canEditRecords } = useAuth();
  const canEdit = isAdmin || canEditRecords;

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getHelpYouSellAgreements();
      setAgreements(res.agreements || []);
      setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openPreview = async (id) => {
    const w = window.open('about:blank', '_blank');
    try {
      const { viewUrl } = await api.getHelpYouSellPreviewUrl(id);
      if (w) w.location.href = viewUrl; else window.open(viewUrl, '_blank', 'noopener');
    } catch (e) { if (w) w.close(); flash('Error: ' + e.message); }
  };

  const sendAgreement = async (a) => {
    if (!window.confirm(`Email the Help You Sell agreement to ${a.customer_name}? They will get a link to review and sign it online.`)) return;
    try {
      const res = await api.emailHelpYouSell(a.id);
      flash(res.message || 'Agreement emailed');
      load();
    } catch (e) { flash('Error: ' + e.message); }
  };

  const openSigned = async (id) => {
    const w = window.open('about:blank', '_blank');
    try {
      const blob = await api.getHelpYouSellSigned(id);
      const url = URL.createObjectURL(blob);
      if (w) w.location.href = url; else window.open(url, '_blank', 'noopener');
    } catch (e) { if (w) w.close(); flash('Error: ' + e.message); }
  };

  const active = agreements.filter(a => !['sold', 'cancelled'].includes(a.status));
  const closed = agreements.filter(a => ['sold', 'cancelled'].includes(a.status));

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{
        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
        padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', color: '#1e3a5f', lineHeight: 1.6,
      }}>
        <strong>Help You Sell</strong> is a separate agreement from the storage lease. The customer keeps paying
        storage until the RV sells or leaves the lot. Ending storage does not cancel this agreement, and
        cancelling this agreement does not end storage.
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626',
          borderRadius: '6px', marginBottom: '16px', border: '1px solid #fecaca', fontSize: '0.85rem',
        }}>{error}</div>
      )}

      {canEdit && (
        <div style={{ marginBottom: '16px' }}>
          <button onClick={() => setShowNew(true)} style={btnPrimary}>+ New Help You Sell Agreement</button>
        </div>
      )}

      {agreements.length === 0 && (
        <div style={{
          padding: '40px', textAlign: 'center', color: '#6b7280',
          backgroundColor: '#fff', border: '1px dashed #d1d5db', borderRadius: '8px',
        }}>
          No Help You Sell agreements yet. Start one from a storage customer above.
        </div>
      )}

      {[{ title: 'Active', rows: active }, { title: 'Sold / Cancelled', rows: closed }].map(group => (
        group.rows.length > 0 && (
          <div key={group.title} style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              {group.title} ({group.rows.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {group.rows.map(a => (
                <AgreementCard
                  key={a.id}
                  a={a}
                  canEdit={canEdit}
                  isAdmin={isAdmin}
                  expanded={expandedId === a.id}
                  onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  onPreview={() => openPreview(a.id)}
                  onSend={() => sendAgreement(a)}
                  onOpenSigned={() => openSigned(a.id)}
                  onChanged={load}
                  flash={flash}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {showNew && (
        <NewAgreementModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
          flash={flash}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AgreementCard
// ---------------------------------------------------------------------------
function AgreementCard({ a, canEdit, isAdmin, expanded, onToggle, onPreview, onSend, onOpenSigned, onChanged, flash }) {
  const signed = !!a.accepted_at;

  const save = async (patch, what) => {
    try {
      await api.updateHelpYouSell(a.id, patch);
      flash(`${what} saved`);
      onChanged();
    } catch (e) { flash('Error: ' + e.message); }
  };

  const commission = (parseFloat(a.commission_pct) || 0);
  const estCommission = a.asking_price ? (parseFloat(a.asking_price) * commission / 100) : null;

  return (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
      borderLeft: `4px solid ${signed ? '#065f46' : a.status === 'sent' ? '#3b82f6' : '#d1d5db'}`,
      padding: '14px 16px',
    }}>
      <div onClick={onToggle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '0.95rem' }}>{a.customer_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {a.rv_label || 'RV not specified'}
            {a.space_label ? ` · Space ${a.space_label}` : ''}
            {a.monthly_storage_rate ? ` · ${money(a.monthly_storage_rate)}/mo storage` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>{commission}% fee</span>
          <StatusPill status={a.status} />
          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '14px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '12px', lineHeight: 1.7 }}>
            Agreement date: {a.agreement_date ? formatDate(a.agreement_date) : '—'}
            {a.sent_at && <> &middot; Sent {formatDate(a.sent_at)}</>}
            {a.accepted_at && <> &middot; <strong style={{ color: '#065f46' }}>Signed {formatDate(a.accepted_at)} by &ldquo;{a.signature_name}&rdquo;</strong></>}
            {a.accepted_ip && <> (IP {a.accepted_ip})</>}
          </div>

          {signed && (
            <div style={{
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px',
              padding: '8px 12px', fontSize: '0.78rem', color: '#065f46', marginBottom: '12px',
            }}>
              Asking price at signing: <strong>{a.asking_price ? money(a.asking_price) : 'not stated'}</strong>
              {a.asking_price && <> &middot; full-price sale pays us <strong>{money(parseFloat(a.asking_price) * commission / 100)}</strong></>}
              <div style={{ marginTop: '4px' }}>
                Signed agreements are locked. Terms cannot be edited, cancel and issue a new one if the deal changes.
              </div>
            </div>
          )}

          {canEdit && !signed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <Field label="RV Description" defaultValue={a.rv_description || a.rv_label || ''}
                onSave={(v) => save({ rv_description: v }, 'RV description')} placeholder="2006 Airstream Safari" />
              <Field label="Monthly Storage Rate" defaultValue={a.monthly_storage_rate || ''} type="number"
                onSave={(v) => save({ monthly_storage_rate: v }, 'Storage rate')} placeholder="138.00" />
              <Field label="Commission %" defaultValue={a.commission_pct || ''} type="number"
                onSave={(v) => save({ commission_pct: v }, 'Commission')} placeholder="5" />
              <Field label="Cancellation Fee %" defaultValue={a.cancellation_fee_pct || ''} type="number"
                onSave={(v) => save({ cancellation_fee_pct: v }, 'Cancellation fee')} placeholder="1" />
              <Field label="Asking Price (customer confirms)" defaultValue={a.asking_price || ''} type="number"
                onSave={(v) => save({ asking_price: v }, 'Asking price')} placeholder="45000" />
              <Field label="Notice Days" defaultValue={a.notice_days || ''} type="number"
                onSave={(v) => save({ notice_days: v }, 'Notice period')} placeholder="30" />
            </div>
          )}

          {!signed && estCommission != null && (
            <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: '12px' }}>
              At the {money(a.asking_price)} asking price, a full-price sale pays us <strong>{money(estCommission)}</strong>.
              Early cancellation fee would be <strong>{money(parseFloat(a.asking_price) * (parseFloat(a.cancellation_fee_pct) || 0) / 100)}</strong>.
            </div>
          )}

          {canEdit && !signed && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Special Terms (optional)</label>
              <textarea defaultValue={a.special_terms || ''} rows={2}
                onBlur={(e) => { if ((e.target.value || '') !== (a.special_terms || '')) save({ special_terms: e.target.value }, 'Special terms'); }}
                placeholder="Extra clause for this customer (saves on blur)"
                style={{ ...inputStyleFull, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          )}

          {signed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <Field label="Sale Price" defaultValue={a.sale_price || ''} type="number"
                onSave={(v) => save({ sale_price: v }, 'Sale price')} placeholder="42500" />
              <Field label="Sold On" defaultValue={a.sold_at ? String(a.sold_at).split('T')[0] : ''} type="date"
                onSave={(v) => save({ sold_at: v }, 'Sale date')} />
              <Field label="Commission Collected" defaultValue={a.commission_collected_at ? String(a.commission_collected_at).split('T')[0] : ''} type="date"
                onSave={(v) => save({ commission_collected_at: v }, 'Commission date')} />
            </div>
          )}

          {signed && a.sale_price && (
            <div style={{
              backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px',
              padding: '8px 12px', fontSize: '0.82rem', color: '#92400e', marginBottom: '12px',
            }}>
              Commission due: <strong>{money(parseFloat(a.sale_price) * commission / 100)}</strong> ({commission}% of {money(a.sale_price)}).
              Book it as sales facilitation income when collected.
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={onPreview} style={{ ...btnTiny, backgroundColor: '#f3f4f6', color: '#1e3a5f', border: '1px solid #d1d5db' }}>
              Preview Agreement
            </button>
            {canEdit && !signed && (
              <button onClick={onSend} style={{ ...btnTiny, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>
                {a.sent_at ? 'Resend to Customer' : 'Email to Customer'}
              </button>
            )}
            {signed && (
              <button onClick={onOpenSigned} style={{ ...btnTiny, backgroundColor: '#dcfce7', color: '#065f46', border: '1px solid #86efac' }}>
                Print Signed Agreement
              </button>
            )}
            {canEdit && a.status !== 'sold' && a.status !== 'cancelled' && (
              <button onClick={() => {
                if (!window.confirm('Mark this agreement cancelled? The signed copy stays on the customer record.')) return;
                save({ status: 'cancelled' }, 'Status');
              }} style={{ ...btnTiny, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                Mark Cancelled
              </button>
            )}
            {canEdit && signed && a.status === 'accepted' && (
              <button onClick={() => save({ status: 'sold' }, 'Status')}
                style={{ ...btnTiny, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                Mark Sold
              </button>
            )}
            {isAdmin && (
              <button onClick={async () => {
                if (!window.confirm('Delete this agreement from the list? Any signed PDF stays on the customer record.')) return;
                try { await api.deleteHelpYouSell(a.id); flash('Agreement removed'); onChanged(); }
                catch (e) { flash('Error: ' + e.message); }
              }} style={{ ...btnTiny, backgroundColor: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, defaultValue, onSave, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder}
        onBlur={(e) => { if (String(e.target.value) !== String(defaultValue ?? '')) onSave(e.target.value); }}
        style={inputStyleFull} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewAgreementModal — pick a storage customer, set the terms, create the draft
// ---------------------------------------------------------------------------
function NewAgreementModal({ onClose, onCreated, flash }) {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({
    rv_description: '', monthly_storage_rate: '', commission_pct: '5',
    cancellation_fee_pct: '1', asking_price: '', notice_days: '30',
    payment_days: '5', special_terms: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getHelpYouSellCandidates()
      .then(r => setCandidates(r.candidates || []))
      .catch(e => setError(e.message));
  }, []);

  const pick = (c) => {
    setPicked(c);
    setForm(f => ({
      ...f,
      rv_description: c.rv_label || '',
      monthly_storage_rate: c.monthly_rate != null ? String(parseFloat(c.monthly_rate).toFixed(2)) : '',
    }));
  };

  const filtered = candidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.customer_name || '').toLowerCase().includes(q)
      || (c.rv_label || '').toLowerCase().includes(q)
      || (c.space_label || '').toLowerCase().includes(q);
  });

  const submit = async () => {
    if (!picked) { setError('Pick a storage customer first.'); return; }
    setSaving(true); setError('');
    try {
      await api.createHelpYouSell({
        customer_id: picked.customer_id,
        billing_id: picked.billing_id,
        unit_id: picked.unit_id,
        ...form,
      });
      flash('Draft agreement created. Preview it, then email it to the customer.');
      onCreated();
    } catch (e) { setError(e.message); setSaving(false); }
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a5f' }}>New Help You Sell Agreement</h2>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', color: '#6b7280' }}>Close</button>
        </div>

        {error && <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem' }}>{error}</div>}

        {!picked ? (
          <>
            <label style={labelStyle}>Storage Customer</label>
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, RV, or space" style={{ ...inputStyleFull, marginBottom: '10px' }} />
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              {filtered.length === 0 && <div style={{ padding: '16px', color: '#9ca3af', fontSize: '0.85rem' }}>No matching storage customers.</div>}
              {filtered.map(c => (
                <div key={c.billing_id} onClick={() => pick(c)} style={{
                  padding: '10px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.85rem',
                }}>
                  <div style={{ fontWeight: 600, color: '#1e3a5f' }}>
                    {c.customer_name}
                    {c.has_agreement && <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>already has one</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                    {c.rv_label || 'RV not on file'} &middot; Space {c.space_label} &middot; {money(c.monthly_rate)}/mo
                    {!c.email_primary && <span style={{ color: '#b91c1c' }}> &middot; no email on file</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#1e3a5f' }}>{picked.customer_name}</strong>
              <span style={{ color: '#6b7280' }}> &middot; Space {picked.space_label} &middot; {picked.email_primary || 'no email on file'}</span>
              <button onClick={() => setPicked(null)} style={{ marginLeft: '10px', ...btnTiny, backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151' }}>Change</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>RV Description</label>
                <input value={form.rv_description} onChange={(e) => setForm({ ...form, rv_description: e.target.value })}
                  placeholder="2006 Airstream Safari" style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Monthly Storage Rate</label>
                <input type="number" step="0.01" value={form.monthly_storage_rate}
                  onChange={(e) => setForm({ ...form, monthly_storage_rate: e.target.value })}
                  placeholder="138.00" style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Commission %</label>
                <input type="number" step="0.1" value={form.commission_pct}
                  onChange={(e) => setForm({ ...form, commission_pct: e.target.value })} style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Cancellation Fee %</label>
                <input type="number" step="0.1" value={form.cancellation_fee_pct}
                  onChange={(e) => setForm({ ...form, cancellation_fee_pct: e.target.value })} style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Asking Price (optional)</label>
                <input type="number" step="1" value={form.asking_price}
                  onChange={(e) => setForm({ ...form, asking_price: e.target.value })}
                  placeholder="45000" style={inputStyleFull} />
                <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '3px' }}>
                  Leave blank if you do not know. The customer enters what they plan to list it for when they sign.
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notice Days</label>
                <input type="number" value={form.notice_days}
                  onChange={(e) => setForm({ ...form, notice_days: e.target.value })} style={inputStyleFull} />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Special Terms (optional)</label>
              <textarea rows={2} value={form.special_terms}
                onChange={(e) => setForm({ ...form, special_terms: e.target.value })}
                placeholder="Anything specific to this customer"
                style={{ ...inputStyleFull, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '10px' }}>
              This creates a draft. Nothing is sent until you click Email to Customer.
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={submit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Creating…' : 'Create Draft'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em',
};
const inputStyleFull = {
  padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px',
  fontSize: '0.875rem', width: '100%', boxSizing: 'border-box',
};
const btnPrimary = {
  padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const btnTiny = {
  padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
  fontSize: '0.75rem', fontWeight: 600,
};
const overlay = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '40px 16px', zIndex: 1000, overflowY: 'auto',
};
const modalBox = {
  backgroundColor: '#fff', borderRadius: '10px', padding: '20px 24px',
  width: '100%', maxWidth: '640px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
};
