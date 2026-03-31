import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

const PAYMENT_TYPES = [
  { value: 'final_payment', label: 'Final Payment' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'partial_payment', label: 'Partial Payment' },
];

export default function SquarePayment({ recordId, amountDue, onSuccess, onClose }) {
  const [step, setStep] = useState('confirm'); // confirm | terminal-pending | waiting-online | record-form | success | failed
  const [amount, setAmount] = useState(amountDue > 0 ? amountDue.toFixed(2) : '');
  const [paymentType, setPaymentType] = useState('final_payment');
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const pollRef = useRef(null);
  const autoCloseRef = useRef(null);

  // Record Terminal Payment form
  const [recordRef, setRecordRef] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, []);

  // ── Option 1: Charge Square Terminal ──────────────────────────────
  const handleTerminal = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const result = await api.squareTerminalCheckout({
        recordId,
        amount: parsedAmount,
        paymentType,
      });
      setStep('waiting-terminal');
      startTerminalPolling(result.checkoutId);
    } catch (err) {
      // Show actual Square error for debugging
      setStep('terminal-pending');
      setError(err.message || 'Unknown Square Terminal error');
    } finally {
      setProcessing(false);
    }
  };

  const startTerminalPolling = (checkoutId) => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.squareTerminalStatus(checkoutId);
        if (status.status === 'COMPLETED') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          try {
            await api.squareTerminalComplete({ checkoutId, recordId, paymentType });
          } catch (e) {
            console.log('Complete note:', e.message);
          }
          setSuccessInfo({
            amount: Number(status.amountMoney?.amount || 0) / 100 || parseFloat(amount),
            transactionId: status.paymentIds?.[0] || checkoutId,
          });
          setStep('success');
          autoCloseRef.current = setTimeout(() => { if (onSuccess) onSuccess(); }, 3000);
        } else if (status.status === 'CANCELED' || status.status === 'CANCEL_REQUESTED') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setStep('failed');
        }
      } catch (err) {
        console.error('Terminal poll error:', err.message);
      }
    }, 3000);
  };

  // ── Option 2: Online Card Entry ───────────────────────────────────
  const handleOnlineCheckout = async () => {
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
      });
      setStep('waiting-online');
      if (result.checkoutUrl) window.open(result.checkoutUrl, '_blank');
      startOnlinePolling(result.orderId);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const startOnlinePolling = (oid) => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.squarePosStatus(oid);
        if (status.isPaid) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          try {
            await api.squarePosRecordPayment({ recordId, orderId: oid, paymentType });
          } catch (e) {
            console.log('Record payment note:', e.message);
          }
          const amountDollars = status.totalMoney ? Number(status.totalMoney.amount) / 100 : parseFloat(amount);
          setSuccessInfo({ amount: amountDollars, transactionId: status.transactionId || oid });
          setStep('success');
          autoCloseRef.current = setTimeout(() => { if (onSuccess) onSuccess(); }, 3000);
        }
      } catch (err) {
        console.error('Online poll error:', err.message);
      }
    }, 3000);
  };

  // ── Option 3: Record Terminal Payment (already collected) ─────────
  const handleRecordPayment = async () => {
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
        payment_date: recordDate,
        check_number: recordRef || null,
        notes: recordRef ? `Square Terminal #${recordRef}` : 'Square Terminal payment',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setStep('failed');
  };

  const resetToConfirm = () => {
    setStep('confirm');
    setError(null);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>
            {step === 'waiting-terminal' ? 'Waiting for Card Tap...'
              : step === 'waiting-online' ? 'Complete Payment on Square'
              : step === 'success' ? 'Payment Successful!'
              : 'Pay by Card'}
          </h2>
          {!step.startsWith('waiting') && (
            <button onClick={onClose} style={closeBtn}>&times;</button>
          )}
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {/* ── STEP: Confirm (three options) ── */}
        {(step === 'confirm' || step === 'terminal-pending' || step === 'record-form') && (
          <div>
            {/* Amount & Type */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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

            {/* Option 1: Square Terminal */}
            <div style={optionCard}>
              <button onClick={handleTerminal} disabled={processing} style={{ ...btnGreen, opacity: processing ? 0.6 : 1, width: '100%' }}>
                {processing ? 'Sending...' : 'Charge Square Terminal'}
              </button>
              <div style={optionNote}>Lower processing rate — card present</div>
              {step === 'terminal-pending' && (
                <div style={warningBox}>
                  Square Terminal error — use online entry or record payment manually below.
                </div>
              )}
            </div>

            {/* Option 2: Online Card Entry */}
            <div style={optionCard}>
              <button onClick={handleOnlineCheckout} disabled={processing} style={{ ...btnBlue, opacity: processing ? 0.6 : 1, width: '100%' }}>
                Online Card Entry
              </button>
              <div style={optionNote}>Higher processing rate — card not present</div>
            </div>

            {/* Option 3: Record Terminal Payment */}
            <div style={optionCard}>
              {step !== 'record-form' ? (
                <>
                  <button onClick={() => setStep('record-form')} style={{ ...btnGray, width: '100%' }}>
                    Record Terminal Payment
                  </button>
                  <div style={optionNote}>Already collected on Terminal</div>
                </>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '10px' }}>Record Terminal Payment</div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelSmall}>Square Receipt #</label>
                      <input type="text" value={recordRef} onChange={(e) => setRecordRef(e.target.value)} placeholder="Optional" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelSmall}>Date</label>
                      <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleRecordPayment} disabled={processing} style={{ ...btnGreen, opacity: processing ? 0.6 : 1 }}>
                      {processing ? 'Saving...' : `Save Payment $${parseFloat(amount || 0).toFixed(2)}`}
                    </button>
                    <button onClick={() => setStep('confirm')} style={btnSecondary}>Back</button>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel */}
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button onClick={onClose} style={{ ...btnSecondary, fontSize: '0.8rem' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── STEP: Waiting (Terminal) ── */}
        {step === 'waiting-terminal' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128179;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '8px' }}>
              Waiting for customer to tap card...
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '24px' }}>
              ${parseFloat(amount || 0).toFixed(2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={pulsingDot} />
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Communicating with Square Terminal...</span>
            </div>
            <button onClick={handleCancelPolling} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>Cancel Payment</button>
          </div>
        )}

        {/* ── STEP: Waiting (Online) ── */}
        {step === 'waiting-online' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128179;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '8px' }}>
              Complete payment on Square checkout
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
            <button onClick={handleCancelPolling} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>Cancel</button>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && successInfo && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#9989;</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>Payment Successful!</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' }}>${successInfo.amount.toFixed(2)}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '24px' }}>Confirmation: {successInfo.transactionId}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Closing automatically...</div>
          </div>
        )}

        {/* ── STEP: Failed/Cancelled ── */}
        {step === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#10060;</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626', marginBottom: '8px' }}>Payment cancelled</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={resetToConfirm} style={btnPrimary}>Try Again</button>
              <button onClick={onClose} style={btnSecondary}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' };
const labelSmall = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '3px' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const errorBox = { padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' };
const warningBox = { padding: '10px', backgroundColor: '#fffbeb', color: '#92400e', borderRadius: '6px', marginTop: '8px', fontSize: '0.8rem', border: '1px solid #fde68a' };
const optionCard = { padding: '14px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' };
const optionNote = { fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px', textAlign: 'center' };
const btnGreen = { padding: '12px 24px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' };
const btnBlue = { padding: '12px 24px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' };
const btnGray = { padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' };
const btnPrimary = { padding: '10px 24px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const closeBtn = { background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer', padding: '0 4px', lineHeight: 1 };
const pulsingDot = { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'pulse 1.5s infinite' };

if (typeof document !== 'undefined' && !document.getElementById('pulse-animation')) {
  const style = document.createElement('style');
  style.id = 'pulse-animation';
  style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }';
  document.head.appendChild(style);
}
