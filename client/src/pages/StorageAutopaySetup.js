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
  // An enrolled customer whose card just declined needs to swap it themselves.
  // The page used to dead-end them on "call us", which is the one thing they
  // cannot do at 9pm when the decline email lands.
  const [replacing, setReplacing] = useState(false);
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
    if (!config || !info || info.bank || (info.already_enrolled && !replacing) || done || mountedRef.current) return;
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
  }, [config, info, done, replacing]);

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

  // A box set to bank transfer (ACH) gets the bank flow, never the card form.
  if (info && info.bank && config) return shell(<BankAutopay token={token} info={info} config={config} />);

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

  if (info && info.already_enrolled && !replacing) {
    return shell(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>&#128179;</div>
        <h2 style={{ color: NAVY, margin: '8px 0 12px', fontSize: 18 }}>You&rsquo;re already on autopay</h2>
        <p style={{ color: '#374151', fontSize: 14 }}>We have your {info.card_brand || 'card'}{info.card_last4 ? ` ending in ${info.card_last4}` : ''} on file for {info.space_label}.</p>
        <p style={{ color: '#374151', fontSize: 14 }}>If that card has expired or was declined, you can put a new one on file right here.</p>
        <button
          onClick={() => { setReplacing(true); setAuthorized(false); }}
          style={{ marginTop: 8, padding: '12px 22px', background: NAVY, color: '#fff', border: 'none',
                   borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Use a Different Card
        </button>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 16 }}>Or call us at (303) 557-2214 and we will take care of it.</p>
      </div>
    );
  }

  return shell(
    <>
      <h2 style={{ color: NAVY, margin: '0 0 6px', fontSize: 20 }}>
        {replacing ? 'Replace Your Card on File' : 'Set Up Monthly Autopay'}
      </h2>
      <p style={{ color: '#374151', fontSize: 14, margin: '0 0 16px' }}>
        {replacing
          ? `Hi ${info.customer_name || 'there'}, enter the new card below. It replaces the ${info.card_brand || 'card'}${info.card_last4 ? ` ending in ${info.card_last4}` : ''} we had on file and will be used for your monthly storage rent.`
          : `Hi ${info.customer_name || 'there'}, save a card so your storage rent is paid automatically each month. No more monthly invoices to remember.`}
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

// ---------------------------------------------------------------------------
// ACH bank autopay. Step 1 connects the bank through Plaid inside Square's SDK
// (intent STORE) and puts it on file. Step 2 approves a recurring monthly
// debit for one fixed amount (intent RECURRING_CHARGE). Square never debits on
// its own; the ERP's monthly engine reuses the approval each month and only
// when the amount matches, so a rate change sends the customer back here to
// approve the new amount without reconnecting the bank.
// ---------------------------------------------------------------------------
function tokenizeAch(ach, options) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, v) => { if (settled) return; settled = true; try { ach.removeEventListener('ontokenization', handler); } catch (_) {} fn(v); };
    const handler = (event) => {
      const { tokenResult, error } = (event && event.detail) || {};
      if (error) return finish(reject, new Error(error.message || String(error)));
      if (tokenResult && tokenResult.status === 'OK' && tokenResult.token) return finish(resolve, tokenResult.token);
      const msg = tokenResult && tokenResult.errors && tokenResult.errors[0] && tokenResult.errors[0].message;
      finish(reject, new Error(msg || 'The bank connection was cancelled.'));
    };
    ach.addEventListener('ontokenization', handler);
    Promise.resolve(ach.tokenize(options))
      .then(r => { if (r && r.status === 'OK' && r.token) finish(resolve, r.token); })
      .catch(e => finish(reject, e));
  });
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const longDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

function BankAutopay({ token, info, config }) {
  const [bank, setBank] = useState(info.bank);
  const [holder, setHolder] = useState(info.customer_name || '');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [changing, setChanging] = useState(false);
  const achRef = useRef(null);

  const getAch = useCallback(async () => {
    if (achRef.current) return achRef.current;
    const Square = await loadSquareSdk(config.environment);
    const payments = Square.payments(config.applicationId, config.locationId);
    const ach = await payments.ach({ redirectURI: window.location.href, transactionId: `sto-${Date.now()}` });
    achRef.current = ach;
    return ach;
  }, [config]);

  const plan = bank.plan;
  const needsApproval = bank.connected && (!bank.authorized || Math.round((bank.auth_amount || 0) * 100) !== Math.round(plan.amount * 100));

  const connect = async () => {
    if (!holder.trim()) { setError('Enter the name on the bank account.'); return; }
    setError(''); setBusy('connect');
    try {
      const ach = await getAch();
      const bnon = await tokenizeAch(ach, { accountHolderName: holder.trim(), intent: 'STORE' });
      const res = await fetch(`${API_BASE}/storage-autopay/setup/${token}/bank`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: bnon, holderName: holder.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not connect the bank account.');
      setBank(b => ({ ...b, connected: true, bank_account_id: data.bank_account_id, bank_name: data.bank_name,
                      last4: data.last4, authorized: false, auth_amount: null, plan: data.plan || b.plan }));
      setChanging(false); setAgree(false);
    } catch (e) { setError(e.message || 'Could not connect the bank account.'); }
    finally { setBusy(''); }
  };

  const approve = async () => {
    setError(''); setBusy('approve');
    try {
      const ach = await getAch();
      const bauth = await tokenizeAch(ach, {
        intent: 'RECURRING_CHARGE',
        bankAccountId: bank.bank_account_id,
        accountHolderName: holder.trim() || undefined,
        amount: plan.amount.toFixed(2),
        currency: 'USD',
        frequency: { months: 1 },
        startDate: plan.chargeDate,
      });
      const res = await fetch(`${API_BASE}/storage-autopay/setup/${token}/bank-authorize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: bauth, amount: plan.amount, startDate: plan.chargeDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the approval.');
      setDone(data);
    } catch (e) { setError(e.message || 'Could not save the approval.'); }
    finally { setBusy(''); }
  };

  const errBox = error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 10, borderRadius: 6, margin: '12px 0', fontSize: 13 }}>{error}</div>;
  const btn = (label, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled}
      style={{ width: '100%', padding: 14, background: disabled ? '#9ca3af' : NAVY, color: '#fff', border: 'none', borderRadius: 8,
               fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer' }}>{label}</button>
  );
  const acctName = `${bank.bank_name || 'bank account'}${bank.last4 ? ` ending in ${bank.last4}` : ''}`;
  const summary = (
    <div style={{ padding: '12px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, margin: '0 0 16px', fontSize: 14, color: NAVY, lineHeight: 1.6 }}>
      Starting with your <strong>{plan.monthLabel}</strong> storage<br/>
      Rent {money(plan.rent)} + bank transfer fee {money(plan.fee)} = <strong>{money(plan.amount)} a month</strong><br/>
      First debit on {longDate(plan.chargeDate)}, then the last day of each month
    </div>
  );

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 46 }}>&#9989;</div>
        <h2 style={{ color: '#065f46', margin: '8px 0 12px' }}>Bank autopay is set up</h2>
        <p style={{ color: '#374151', fontSize: 14 }}>We will debit {money(done.amount)} from your {acctName} for your storage, starting with {done.month_label}. The first debit is on {longDate(done.charge_date)}.</p>
        <p style={{ color: '#6b7280', fontSize: 13 }}>If you have any questions, give us a call at (303) 557-2214.</p>
      </div>
    );
  }

  if (bank.connected && !needsApproval && !changing) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>&#127974;</div>
        <h2 style={{ color: NAVY, margin: '8px 0 12px', fontSize: 18 }}>You&rsquo;re on bank autopay</h2>
        <p style={{ color: '#374151', fontSize: 14 }}>We debit {money(bank.auth_amount)} a month from your {acctName}.</p>
        <button onClick={() => { setChanging(true); setAgree(false); }}
          style={{ marginTop: 8, padding: '12px 22px', background: NAVY, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Use a Different Bank Account
        </button>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 16 }}>Or call us at (303) 557-2214.</p>
      </div>
    );
  }

  if (bank.connected && needsApproval && !changing) {
    return (
      <>
        <h2 style={{ color: NAVY, margin: '0 0 6px', fontSize: 20 }}>{bank.authorized ? 'Approve Your New Amount' : 'Approve Your Monthly Debit'}</h2>
        <p style={{ color: '#374151', fontSize: 14, margin: '0 0 16px' }}>Your {acctName} is connected. One more step: approve the monthly debit.</p>
        {summary}
        <label style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#374151', marginBottom: 16, cursor: 'pointer', lineHeight: 1.5 }}>
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
          <span>I authorize Master Tech RV Repair &amp; Storage to debit {money(plan.amount)} from my {acctName} on the last day of each month for the next month&rsquo;s storage, starting {longDate(plan.chargeDate)}, until I cancel. I can cancel anytime by calling (303) 557-2214.</span>
        </label>
        {errBox}
        {btn(busy === 'approve' ? 'Waiting for approval...' : 'Approve Monthly Debit', approve, !agree || !!busy)}
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => setChanging(true)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>Use a different bank account</button>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 style={{ color: NAVY, margin: '0 0 6px', fontSize: 20 }}>Set Up Bank Autopay</h2>
      <p style={{ color: '#374151', fontSize: 14, margin: '0 0 16px' }}>
        Hi {info.customer_name || 'there'}, connect your checking account and your storage is paid automatically each month. Bank transfer costs 1%, much less than a card.
      </p>
      {summary}
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name on the bank account</label>
      <input value={holder} onChange={e => setHolder(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15, marginBottom: 16 }} />
      {errBox}
      {btn(busy === 'connect' ? 'Waiting for your bank...' : 'Connect Bank Account', connect, !!busy)}
      {busy && <p style={{ textAlign: 'center', marginTop: 10 }}>
        <button onClick={() => setBusy('')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>Start over</button>
      </p>}
      <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 12, textAlign: 'center' }}>Your bank login goes through Plaid and Square. We never see or store your account or login details.</p>
    </>
  );
}
