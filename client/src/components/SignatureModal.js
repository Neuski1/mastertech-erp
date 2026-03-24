import React, { useRef, useState, useEffect, useCallback } from 'react';

const LEGAL_PARAGRAPHS = [
  'By signing below, I authorize Master Tech RV Repair & Storage to perform the services and repairs described in this estimate on my RV/unit. I understand that the final charges may vary from this estimate due to unforeseen conditions discovered during the repair process. Any additional work or costs beyond this estimate will be communicated to me for approval before proceeding.',
  'I agree to pay the full balance for all authorized services upon completion of work.',
  'I understand that Master Tech RV Repair & Storage takes reasonable care of all units in our possession; however, we are not responsible for loss or damage to the RV or personal belongings left inside in the event of fire, theft, weather events, or other circumstances beyond our control. We recommend removing valuables prior to drop-off.',
  'I grant Master Tech RV Repair & Storage permission to operate my RV/unit as needed for testing, inspection, and the safe movement of the vehicle within our facility.',
];

export default function SignatureModal({ record, onSign, onClose }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  }, [drawing, getPos]);

  const stopDraw = useCallback(() => {
    setDrawing(false);
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!hasSignature) return;
    setSubmitting(true);
    try {
      const signatureData = canvasRef.current.toDataURL('image/png');
      await onSign(signatureData);
    } catch (err) {
      alert('Error signing estimate: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const customerName = `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Customer';
  const unitDesc = [record.year, record.make, record.model].filter(Boolean).join(' ');

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.15rem' }}>Customer Estimate Authorization</h2>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>

        {/* Estimate summary */}
        <div style={{ backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><strong>Estimate #:</strong> {record.record_number}</div>
            <div><strong>Customer:</strong> {customerName}</div>
            <div><strong>Unit:</strong> {unitDesc}</div>
            <div><strong>Estimated Total:</strong> <span style={{ fontWeight: 700, color: '#1e3a5f' }}>${(parseFloat(record.total_sales) || 0).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Legal text */}
        <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', lineHeight: '1.5', color: '#92400e' }}>
          <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Authorization Agreement:</strong>
          {LEGAL_PARAGRAPHS.map((p, i) => (
            <p key={i} style={{ margin: i === 0 ? '0 0 8px' : '8px 0' }}>{p}</p>
          ))}
        </div>

        {/* Signature area */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Signature
            </label>
            <button onClick={clearSignature} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}>
              Clear
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={560}
            height={150}
            style={{
              width: '100%',
              height: '150px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasSignature && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', margin: '8px 0 0' }}>
              Draw signature above using mouse or touch
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button
            onClick={handleSign}
            disabled={!hasSignature || submitting}
            style={{
              ...signBtnStyle,
              opacity: (!hasSignature || submitting) ? 0.5 : 1,
              cursor: (!hasSignature || submitting) ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Signing & Generating PDF...' : 'Sign & Approve Estimate'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '620px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
const closeBtnStyle = {
  background: 'none', border: 'none', fontSize: '1.5rem',
  cursor: 'pointer', color: '#9ca3af', padding: '0 4px',
};
const cancelBtnStyle = {
  padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer',
  fontSize: '0.875rem',
};
const signBtnStyle = {
  padding: '10px 24px', backgroundColor: '#065f46', color: '#fff',
  border: 'none', borderRadius: '6px', fontWeight: 700,
  fontSize: '0.875rem',
};
