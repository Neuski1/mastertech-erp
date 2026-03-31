import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

const PAYMENT_TYPES = [
  { value: 'final_payment', label: 'Final Payment' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'partial_payment', label: 'Partial Payment' },
];

export default function SquarePayment({ recordId, amountDue, onSuccess, onClose }) {
  const [step, setStep] = useState('confirm'); // confirm | waiting | success | failed
  const [amount, setAmount] = useState(amountDue > 0 ? amountDue.toFixed(2) : '');
  const [paymentType, setPaymentType] = useState('final_payment');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const pollRef = useRef(null);
  const autoCloseRef = useRef(null);

  // Manual fallback fields
  const [manualRef, setManualRef] = useState('');

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, []);

  const handleCreateCheckout = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await api.squarePosCheckout({
        recordId,
        amount: parsedAmount,
        paymentType,
        notes: notes || null,
      });

      setStep('waiting');

      // Open checkout page in new tab
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
      }

      // Start polling for payment completion
      startPolling(result.orderId);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const startPolling = (oid) => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.squarePosStatus(oid);

        if (status.isPaid) {
          clearInterval(pollRef.current);
          pollRef.current = null;

          // Record the payment in our system
          try {
            await api.squarePosRecordPayment({
              recordId,
              orderId: oid,
              paymentType,
            });
          } catch (e) {
            // May already be recorded by callback
            console.log('Record payment note:', e.message);
          }

          const amountDollars = status.totalMoney
            ? Number(status.totalMoney.amount) / 100
            : parseFloat(amount);

          setSuccessInfo({
            amount: amountDollars,
            transactionId: status.transactionId || oid,
          });
          setStep('success');

          autoCloseRef.current = setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 3000);
        }
      } catch (err) {
        console.error('Poll error:', err.message);
      }
    }, 3000);
  };

  const handleCancel = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setStep('failed');
  };

  // Manual card payment (no Square checkout)
  const handleManualCard = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      await api.addPayment(recordId, {
        payment_method: 'credit_card',
        payment_type: paymentType,
        amount: parsedAmount,
        payment_date: new Date().toISOString().split('T')[0],
        check_number: manualRef || null,
        notes: notes || 'Manual card entry',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>
            {step === 'waiting' ? 'Complete Payment on Square' : step === 'success' ? 'Payment Successful!' : 'Pay by Card'}
          </h2>
          {step !== 'waiting' && (
            <button onClick={onClose} style={closeBtn}>&times;</button>
          )}
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {/* ── STEP: Confirm ── */}
        {step === 'confirm' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Amount ($)</label>
                <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} disabled={processing} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Payment Type</label>
                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={inputStyle} disabled={processing}>
                  {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Notes (optional)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Customer auth code" style={inputStyle} disabled={processing} />
            </div>

            {/* Primary: Square Checkout */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button onClick={handleCreateCheckout} disabled={processing} style={{ ...btnTerminal, opacity: processing ? 0.6 : 1 }}>
                {processing ? 'Creating...' : 'Open Square Checkout'}
              </button>
              <button onClick={onClose} style={btnSecondary} disabled={processing}>Cancel</button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>OR record manually</span>
              <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
            </div>

            {/* Manual fallback */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Reference # (last 4, auth code, etc.)</label>
              <input type="text" value={manualRef} onChange={(e) => setManualRef(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={handleManualCard} disabled={processing} style={{ ...btnPrimary, opacity: processing ? 0.6 : 1 }}>
              {processing ? 'Recording...' : `Record Card Payment $${parseFloat(amount || 0).toFixed(2)}`}
            </button>
          </div>
        )}

        {/* ── STEP: Waiting ── */}
        {step === 'waiting' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128179;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '8px' }}>
              Complete payment on Square Terminal
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' }}>
              ${parseFloat(amount || 0).toFixed(2)}
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem', color: '#1e40af' }}>
              A Square checkout page has opened in a new tab.<br />
              Have the customer complete the payment there.<br />
              This screen will update automatically.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={pulsingDot} />
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Waiting for payment confirmation...</span>
            </div>
            <button onClick={handleCancel} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && successInfo && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#9989;</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>
              Payment Successful!
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' }}>
              ${successInfo.amount.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '24px' }}>
              Confirmation: {successInfo.transactionId}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Closing automatically...
            </div>
          </div>
        )}

        {/* ── STEP: Failed/Cancelled ── */}
        {step === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#10060;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>
              Payment cancelled
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => { setStep('confirm'); setError(null); }} style={btnPrimary}>
                Try Again
              </button>
              <button onClick={onClose} style={btnSecondary}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em',
};
const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};
const errorBox = {
  padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626',
  borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem',
};
const btnPrimary = {
  padding: '10px 24px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnTerminal = {
  padding: '12px 24px', backgroundColor: '#065f46', color: '#fff',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
};
const btnSecondary = {
  padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const closeBtn = {
  background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af',
  cursor: 'pointer', padding: '0 4px', lineHeight: 1,
};
const pulsingDot = {
  width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6',
  animation: 'pulse 1.5s infinite',
};

// Inject keyframe animation
if (typeof document !== 'undefined' && !document.getElementById('pulse-animation')) {
  const style = document.createElement('style');
  style.id = 'pulse-animation';
  style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }';
  document.head.appendChild(style);
}
