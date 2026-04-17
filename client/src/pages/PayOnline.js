import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const POYNT_SDK_URL = 'https://collect.commerce.godaddy.com/sdk.js';

// Load the Poynt Collect SDK once
function loadPoyntSdk() {
  if (window.TokenizeJs) return Promise.resolve();
  const existing = document.querySelector(`script[src="${POYNT_SDK_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      // Already loaded?
      if (window.TokenizeJs) resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = POYNT_SDK_URL;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load payment SDK. Please check your internet connection and try again.'));
    document.head.appendChild(s);
  });
}

/**
 * Extract a readable error message from whatever shape Poynt Collect emits.
 * Never returns the literal string "error" — that's the event name, not a message.
 */
function describeCollectError(err) {
  if (!err) return 'Card information is incomplete.';
  if (typeof err === 'string' && err.toLowerCase() !== 'error') return err;

  // Poynt sometimes emits { code, message, details } or nests under .error / .data
  const candidates = [
    err.message,
    err.description,
    err.developerMessage,
    err.errorMessage,
    err.error?.message,
    err.error?.description,
    err.data?.message,
    err.detail,
    err.details,
    Array.isArray(err.errors) && err.errors[0]?.message,
    err.code,
  ].filter((v) => typeof v === 'string' && v && v.toLowerCase() !== 'error');

  if (candidates.length > 0) return candidates[0];
  try { return `Card entry error: ${JSON.stringify(err)}`; }
  catch { return 'Card information is incomplete.'; }
}

/**
 * Wrap collect.getNonce() to handle both the event-driven API
 * (payment-nonce / error events) and any promise return.
 * Resolves with the nonce string, rejects with a readable error.
 */
function getNonceFromCollect(collect, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (!collect) return reject(new Error('Payment form not ready.'));
    let settled = false;
    let timer;

    const finish = (fn, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { collect.off && collect.off('payment-nonce', onNonce); } catch {}
      try { collect.off && collect.off('error', onError); } catch {}
      try { collect.off && collect.off('nonce_error', onNonceError); } catch {}
      fn(val);
    };
    const extractNonce = (data) => {
      if (!data) return null;
      if (typeof data === 'string') return data;
      return data.nonce || data.data || (data.response && (data.response.nonce || data.response.data)) || null;
    };
    const onNonce = (data) => {
      console.log('[pay] payment-nonce event fired, raw:', data);
      const nonce = extractNonce(data);
      if (nonce) finish(resolve, nonce);
      else finish(reject, new Error('Payment SDK returned no nonce. Please re-enter your card and try again.'));
    };
    const onError = (err) => {
      console.error('[pay] Poynt error event:', err);
      finish(reject, new Error(describeCollectError(err)));
    };
    const onNonceError = (err) => {
      let raw;
      try { raw = JSON.stringify(err); } catch { raw = String(err); }
      console.error('[pay] Poynt nonce_error event:', raw);
      finish(reject, Object.assign(
        new Error(describeCollectError(err) || 'Card could not be tokenized.'),
        { details: err }
      ));
    };

    if (typeof collect.on === 'function') {
      collect.on('payment-nonce', onNonce);
      collect.on('error', onError);
      collect.on('nonce_error', onNonceError);
    }

    timer = setTimeout(() => {
      finish(reject, new Error('Card entry timed out. Please re-enter your card and try again.'));
    }, timeoutMs);

    let result;
    try { result = collect.getNonce(); }
    catch (err) {
      console.error('[pay] collect.getNonce() threw synchronously:', err);
      return finish(reject, err instanceof Error ? err : new Error(describeCollectError(err)));
    }

    // Also accept a promise-style return, which some SDK versions still use.
    if (result && typeof result.then === 'function') {
      result.then(
        (d) => {
          console.log('[pay] getNonce() promise resolved, raw:', d);
          const n = extractNonce(d);
          if (n) finish(resolve, n);
        },
        (e) => {
          console.error('[pay] getNonce() promise rejected:', e);
          finish(reject, e instanceof Error ? e : new Error(describeCollectError(e)));
        }
      );
    }
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
  const [errorDetails, setErrorDetails] = useState(null);
  const [success, setSuccess] = useState(null);
  const [config, setConfig] = useState(null);
  const collectRef = useRef(null);
  const mountedRef = useRef(false);

  // Fetch link + Poynt config in parallel
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [linkRes, cfgRes] = await Promise.all([
          fetch(`${API_BASE}/payments/online/${paymentToken}`),
          fetch(`${API_BASE}/payments/online/config`),
        ]);
        const linkData = await linkRes.json();
        if (!linkRes.ok) throw new Error(linkData.error || 'Payment link not found');
        const cfgData = await cfgRes.json();
        if (cancelled) return;
        if (!cfgData.businessId || !cfgData.applicationId) {
          throw new Error('Payment processor is not configured. Please contact us.');
        }
        setLink(linkData);
        setEmail(linkData.defaultEmail || '');
        setConfig(cfgData);
      } catch (err) {
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [paymentToken]);

  // Load SDK + mount card form once link+config are loaded and not already paid
  useEffect(() => {
    if (!link || !config || link.alreadyPaid || success) return;
    let cancelled = false;
    loadPoyntSdk()
      .then(() => {
        if (cancelled || mountedRef.current) return;
        if (!window.TokenizeJs) {
          setPaymentError('Payment SDK did not initialize. Please refresh.');
          return;
        }
        try {
          const collect = new window.TokenizeJs(config.businessId, config.applicationId);
          collect.mount('card-element', document, {
            hideZip: false,
            iFrameStyles: { base: { color: '#111827', fontSize: '16px' } },
          });
          collectRef.current = collect;
          mountedRef.current = true;
          setSdkReady(true);
        } catch (err) {
          console.error('TokenizeJs init error:', err);
          setPaymentError('Could not initialize payment form. Please refresh.');
        }
      })
      .catch((err) => { if (!cancelled) setPaymentError(err.message); });
    return () => { cancelled = true; };
  }, [link, config, success]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setErrorDetails(null);
    if (!collectRef.current) return;
    if (!email || !email.includes('@')) {
      setPaymentError('Please enter a valid email for your receipt.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('[pay] requesting nonce from Poynt...');
      const nonce = await getNonceFromCollect(collectRef.current);
      console.log('[pay] nonce received, length:', nonce && nonce.length, 'preview:', nonce && (nonce.slice(0, 12) + '...'));
      console.log('[pay] posting to /charge...');
      const res = await fetch(`${API_BASE}/payments/online/${paymentToken}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, customerEmail: email }),
      });
      let data;
      try { data = await res.json(); }
      catch {
        const text = await res.text().catch(() => '');
        throw Object.assign(new Error(`Server returned ${res.status} ${res.statusText}`), {
          details: { status: res.status, bodyPreview: text.slice(0, 500) },
        });
      }
      console.log('[pay] /charge response:', res.status, data);
      if (!res.ok) {
        throw Object.assign(new Error(data?.error || `Server returned ${res.status}`), { details: data });
      }
      setSuccess(data);
    } catch (err) {
      console.error('[pay] Payment error:', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
      setErrorDetails(err.details || null);
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
            <div style={{ fontWeight: 600 }}>{paymentError}</div>
            {errorDetails && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#7f1d1d' }}>Technical details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.7rem', margin: '6px 0 0', color: '#4b5563' }}>
                  {(() => { try { return JSON.stringify(errorDetails, null, 2); } catch { return String(errorDetails); } })()}
                </pre>
              </details>
            )}
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
