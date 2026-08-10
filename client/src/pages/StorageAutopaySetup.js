import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const NAVY = '#1e3a5f';

function loadSquareSdk(environment) {
  return new Promise((resolve, reject) => {
    if (window.Square) return resolve(window.Square);
    const src = environment === 'production'
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    const sc = document.createElement('script');
    sc.src = src;
    sc.onload = () => resolve(window.Square);
    sc.onerror = () => reject(new Error('Could not load the secure card form. Check your connection and try again.'));
    document.body.appendChild(sc);
  });
}

export default function StorageAutopaySetup() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const cardRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [iRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/storage-autopay/setup/${token}`),
          fetch(`${API_BASE}/storage-autopay/config`),
        ]);
        const iData = await iRes.json();
        if (!iRes.ok) throw new Error(iData.error || 'This autopay link is not valid.');
        const cData = await cRes.json();
        if (!cData.applicationId || !cData.locationId) throw new Error('Card payments are not configured yet. Please contact us.');
        setInfo(iData);
        setConfig(cData);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Mount Square card form once we have config and the customer isn't already enrolled.
  useEffect(() => {
    if (!config || !info || info.already_enrolled || done || mountedRef.current) return;
    mountedRef.current = true;
    (async () => {
      try {
        const Square = await loadSquareSdk(config.environment);
        const payments = Square.payments(config.applicationId, config.locationId);
        const card = await payments.card();
        await card.attach('#card-container');
        cardRef.current = card;
      } catch (e) {
        setError(e.message || 'Could not start the card form.');
      }
    })();
  }, [config, info, done]);

  const handleSubmit = useCallback(async () => {
    if (!cardRef.current) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        throw new Error((result.errors && result.errors[0] && result.errors[0].message) || 'Please check the card details and try again.');
      }
      const res = await fetch(`${API_BASE}/storage-autopay/setup/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: result.token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the card.');
      setDone({ brand: data.card_brand, last4: data.card_last4 });
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [token]);

  const shell = (body) => (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif', padding: '24px 12px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ background: NAVY, padding: '20px 28px', textAlign: 'center' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 18 }}>MASTER TECH RV REPAIR &amp; STORAGE</h1>
          <p style={{ color: '#93c5fd', margin: '4px 0 0', fontSize: 11, fontStyle: 'italic' }}>Storage Autopay Setup</p>
        </div>
        <div style={{ padding: '28px' }}>{body}</div>
        <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '14px 28px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
        </div>
      </div>
    </div>
  );

  if (loading) return shell(<p style={{ color: '#6b7280' }}>Loading...</p>);
  if (error && !info) return shell(<p style={{ color: '#b91c1c' }}>{error}</p>);

  if (done) {
    return shell(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 46 }}>&#9989;</div>
        <h2 style={{ color: '#065f46', margin: '8px 0 12px' }}>Autopay is set up</h2>
        <p style={{ color: '#374151', fontSize: 14 }}>Your {done.brand || 'card'}{done.last4 ? ` ending in ${done.last4}` : ''} is on file. We&rsquo;ll charge your monthly storage rent automatically. No action needed from you each month.</p>
        <p style={{ color: '#6b7280', fontSize: 13 }}>You can cancel or change your card anytime by calling us.</p>
      </div>
    );
  }

  if (info && info.already_enrolled) {
    return shell(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>&#128179;</div>
        <h2 style={{ color: NAVY, margin: '8px 0 12px', fontSize: 18 }}>You&rsquo;re already on autopay</h2>
        <p style={{ color: '#374151', fontSize: 14 }}>We have your {info.card_brand || 'card'}{info.card_last4 ? ` ending in ${info.card_last4}` : ''} on file for {info.space_label}. To change it, please call us at (303) 557-2214.</p>
      </div>
    );
  }

  return shell(
    <>
      <h2 style={{ color: NAVY, margin: '0 0 6px', fontSize: 20 }}>Set Up Monthly Autopay</h2>
      <p style={{ color: '#374151', fontSize: 14, margin: '0 0 16px' }}>
        Hi {info.customer_name || 'there'}, save a card so your storage rent is paid automatically each month. No more monthly invoices to remember.
      </p>
      <div style={{ padding: '12px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, marginBottom: 18, fontSize: 14, color: '#1e3a5f' }}>
        <strong>{info.space_label}</strong> ({info.space_type})<br/>
        ${Number(info.monthly_rate).toFixed(2)} / month, charged on the {info.due_day || 1}{info.due_day === 1 ? 'st' : ''} of each month
      </div>

      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Card Details</label>
      <div id="card-container" style={{ marginBottom: 16 }} />

      <label style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#374151', marginBottom: 16, cursor: 'pointer', lineHeight: 1.5 }}>
        <input type="checkbox" checked={authorized} onChange={e => setAuthorized(e.target.checked)} style={{ marginTop: 3 }} />
        <span>I authorize Master Tech RV Repair &amp; Storage to automatically charge this card ${Number(info.monthly_rate).toFixed(2)} each month for storage rent for {info.space_label}, until I cancel. I can cancel anytime by calling (303) 557-2214.</span>
      </label>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={!authorized || submitting}
        style={{ width: '100%', padding: 14, background: (!authorized || submitting) ? '#9ca3af' : NAVY, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: (!authorized || submitting) ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? 'Saving...' : 'Turn On Autopay'}
      </button>
      <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 12, textAlign: 'center' }}>Your card is stored securely by Square. We never see or store your full card number.</p>
    </>
  );
}
