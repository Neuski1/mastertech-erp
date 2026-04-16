import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const POYNT_SDK_URL = 'https://collect.commerce.godaddy.com/sdk.js';
const POYNT_BUSINESS_ID = process.env.REACT_APP_POYNT_BUSINESS_ID || '9538e7da-e4aa-4ab6-8678-aab648c15d25';
const POYNT_APPLICATION_ID = process.env.REACT_APP_POYNT_APPLICATION_ID
  || '9538e7da-e4aa-4ab6-8678-aab648c15d25=urn:aid:479613dd-dc78-4fd6-8681-e22291d6f845';

// Load the Poynt Collect SDK once
function loadPoyntSdk() {
  if (window.TokenizeJs) return Promise.resolve();
  const existing = document.querySelector(`script[src="${POYNT_SDK_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = POYNT_SDK_URL;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load payment SDK'));
    document.head.appendChild(s);
  });
}

export default function PayOnline() {
  const { paymentToken } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [email, setEmail] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [success, setSuccess] = useState(null);
  const collectRef = useRef(null);
  const mountedRef = useRef(false);

  // Fetch link details
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/payments/online/${paymentToken}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment link not found');
        if (!cancelled) {
          setLink(data);
          setEmail(data.defaultEmail || '');
        }
      } catch (err) {
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [paymentToken]);

  // Load SDK + mount card form once link is loaded and not already paid
  useEffect(() => {
    if (!link || link.alreadyPaid || success) return;
    let cancelled = false;
    loadPoyntSdk()
      .then(() => {
        if (cancelled || mountedRef.current) return;
        if (!window.TokenizeJs) {
          setPaymentError('Payment SDK did not initialize. Please refresh.');
          return;
        }
        try {
          const collect = new window.TokenizeJs(POYNT_BUSINESS_ID, POYNT_APPLICATION_ID);
          collect.mount('card-element', document, {
            hideZip: false,
            iFrameStyles: { base: { color: '#111827', fontSize: '16px' } },
          });
          collectRef.current = collect;
          mountedRef.current = true;
          setSdkReady(true);
        } catch (err) {
          setPaymentError('Could not initialize payment form.');
          console.error(err);
        }
      })
      .catch((err) => { if (!cancelled) setPaymentError(err.message); });
    return () => { cancelled = true; };
  }, [link, success]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaymentError('');
    if (!collectRef.current) return;
    if (!email || !email.includes('@')) {
      setPaymentError('Please enter a valid email for your receipt.');
      return;
    }
    setSubmitting(true);
    try {
      const nonceResult = await collectRef.current.getNonce();
      const nonce = nonceResult && (nonceResult.data || nonceResult.nonce || nonceResult);
      if (!nonce || typeof nonce !== 'string') {
        throw new Error('Please re-enter card information and try again.');
      }
      const res = await fetch(`${API_BASE}/payments/online/${paymentToken}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, customerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setSuccess(data);
    } catch (err) {
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><p style={msg}>Loading...</p></Shell>;
  if (fetchError) return <Shell><p style={err}>{fetchError}</p></Shell>;
  if (!link) return <Shell><p style={err}>Payment link not found.</p></Shell>;

  if (success) {
    return (
      <Shell>
        <h2 style={{ color: '#059669', margin: '0 0 12px' }}>Payment Received — Thank You!</h2>
        <p style={{ margin: '0 0 8px' }}>Work Order #{success.recordNumber}</p>
        <p style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 600 }}>${success.amountPaid}</p>
        {success.transactionId && (
          <p style={{ margin: '8px 0', fontSize: '0.8rem', color: '#6b7280' }}>
            Transaction ID: {success.transactionId}
          </p>
        )}
        <p style={{ margin: '16px 0 0', fontSize: '0.875rem' }}>
          A receipt has been sent to {email}.
        </p>
      </Shell>
    );
  }

  if (link.alreadyPaid) {
    return (
      <Shell>
        <h2 style={{ color: '#059669', margin: '0 0 12px' }}>Already Paid</h2>
        <p>This invoice has already been paid. Thank you!</p>
        <p style={{ margin: '16px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
          Questions? Call (303) 557-2214.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: '1.4rem' }}>Master Tech RV Repair</h1>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.9rem' }}>{link.paymentTypeLabel}</p>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: '0 0 20px' }}>
        <div style={row}><span style={labelCell}>Work Order</span><span style={valCell}>#{link.recordNumber}</span></div>
        <div style={row}><span style={labelCell}>Customer</span><span style={valCell}>{link.customerName}</span></div>
        <div style={{ ...row, borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 12 }}>
          <span style={{ ...labelCell, fontWeight: 600 }}>Amount Due</span>
          <span style={{ ...valCell, fontSize: '1.25rem', fontWeight: 700, color: '#1e3a5f' }}>${link.amountDollars}</span>
        </div>
      </div>

      <form onSubmit={handlePay}>
        <label style={formLabel}>Email for receipt</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
          placeholder="you@example.com"
        />

        <label style={formLabel}>Card information</label>
        <div id="card-element" style={{
          border: '1px solid #d1d5db', borderRadius: 6, padding: '10px 12px',
          background: '#fff', minHeight: 44,
        }} />
        {!sdkReady && <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>Loading secure card form...</p>}

        {paymentError && (
          <div style={{ margin: '16px 0 0', padding: '10px 12px', background: '#fef2f2',
            border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '0.875rem' }}>
            {paymentError}
          </div>
        )}

        <button type="submit" disabled={!sdkReady || submitting} style={{
          marginTop: 20, width: '100%', padding: '12px',
          background: submitting ? '#6b7280' : '#1e3a5f', color: '#fff',
          border: 'none', borderRadius: 6, fontSize: '1rem', fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}>
          {submitting ? 'Processing...' : `Pay $${link.amountDollars}`}
        </button>

        <p style={{ margin: '16px 0 0', fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>
          Secure payment powered by GoDaddy Payments. Questions? Call (303) 557-2214.
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px 24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

const row = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' };
const labelCell = { color: '#6b7280' };
const valCell = { color: '#111827', fontWeight: 500 };
const formLabel = { display: 'block', margin: '12px 0 6px', fontSize: '0.8rem', color: '#374151', fontWeight: 500 };
const input = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.95rem', boxSizing: 'border-box' };
const msg = { textAlign: 'center', color: '#6b7280' };
const err = { textAlign: 'center', color: '#dc2626' };
