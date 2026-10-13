import React, { useRef, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

// Customer signs the Direction to Pay on screen at drop-off. The wording comes
// from the server (GET /records/:id/dtp), the same text the signed PDF prints.
// Guards from the Sept 8 lease incident: Enter never submits, signing asks for
// confirmation, and the button disables itself while the request is in flight.
export default function DtpSignatureModal({ record, onSigned, onClose }) {
  const canvasRef = useRef(null);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(`${record.first_name || ''} ${record.last_name || ''}`.trim());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getDtp(record.id).then(setForm).catch(e => setLoadError(e.message || 'Could not load the form'));
  }, [record.id]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, [form]);

  const getPos = useCallback((e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (x - rect.left) * (c.width / rect.width), y: (y - rect.top) * (c.height / rect.height) };
  }, []);
  const start = (e) => { e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); setDrawing(true); };
  const move = (e) => { if (!drawing) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasSignature(true); };
  const stop = () => setDrawing(false);
  const clear = () => { const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); setHasSignature(false); };

  const blocked = form && form.missing && form.missing.length > 0;
  const canSign = form && !blocked && hasSignature && signerName.trim() && !submitting;

  const handleSign = async () => {
    if (!canSign) return;
    if (!window.confirm(`Save ${signerName.trim()}'s signed Direction to Pay to this work order?`)) return;
    setSubmitting(true);
    try {
      const signatureData = canvasRef.current.toDataURL('image/png');
      const result = await api.signDtp(record.id, { signatureData, signerName: signerName.trim() });
      onSigned(result);
    } catch (err) {
      alert('Could not save the signed form: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 680, maxWidth: '96vw', maxHeight: '94vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.25rem' }}>Direction to Pay</h2>
          <button onClick={onClose} disabled={submitting} style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div><strong>Insurance:</strong> {record.insurance_company || <span style={{ color: '#dc2626' }}>missing</span>}</div>
          <div><strong>Claim #:</strong> {record.claim_number || 'to be assigned'}</div>
          <div><strong>Work Order:</strong> #{record.record_number}</div>
          <div><strong>RV:</strong> {[record.year, record.make, record.model].filter(Boolean).join(' ')}</div>
        </div>

        {loadError && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{loadError}</div>}
        {blocked && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: '0.9rem' }}>
            Fill in the {form.missing.join(' and ')} in the Insurance section before the customer signs.
          </div>
        )}

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 16px', marginBottom: 14, maxHeight: 300, overflowY: 'auto', fontSize: '0.95rem', lineHeight: 1.55, color: '#111' }}>
          {!form && !loadError && <div style={{ color: '#6b7280' }}>Loading form...</div>}
          {form && form.paragraphs.map((p, i) => <p key={i} style={{ margin: i ? '10px 0 0' : 0 }}>{p}</p>)}
        </div>

        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Printed name</label>
        <input value={signerName} onChange={(e) => setSignerName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box', marginBottom: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer signature</span>
          <button onClick={clear} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}>Clear</button>
        </div>
        <canvas ref={canvasRef} width={640} height={170}
          style={{ width: '100%', height: 170, border: '2px solid #d1d5db', borderRadius: 6, cursor: 'crosshair', touchAction: 'none', background: '#fff' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={move} onTouchEnd={stop} />
        {!hasSignature && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', margin: '6px 0 0' }}>Sign above with the mouse, a finger or a stylus</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSign} disabled={!canSign}
            style={{ padding: '10px 24px', background: '#b45309', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, opacity: canSign ? 1 : 0.5, cursor: canSign ? 'pointer' : 'not-allowed' }}>
            {submitting ? 'Saving signed form...' : 'Sign Direction to Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
