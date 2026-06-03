import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { api } from '../api/client';
import BookkeepingNav from '../components/BookkeepingNav';

const LS_TOKEN = 'plaid_link_token';
const LS_INST  = 'plaid_pending_institution';

export default function Bookkeeping() {
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Detect OAuth return: Plaid appends ?oauth_state_id=... to the redirect URI
  const isOAuthRedirect = typeof window !== 'undefined' &&
    window.location.search.includes('oauth_state_id=');
  const savedLinkToken = isOAuthRedirect ? localStorage.getItem(LS_TOKEN) : null;
  const savedInstitution = isOAuthRedirect ? localStorage.getItem(LS_INST) : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [it, ac, gl] = await Promise.all([
        api.getPlaidItems(),
        api.getPlaidAccounts(),
        api.getGlAccounts(),
      ]);
      setItems(it);
      setAccounts(ac);
      setGlAccounts(gl);
    } catch (e) {
      setError(typeof e === 'string' ? e : (e.message || JSON.stringify(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // If we have a saved token AND we're returning from OAuth, set it as the active token
  useEffect(() => {
    if (savedLinkToken && isOAuthRedirect) {
      setLinkToken(savedLinkToken);
    }
  }, [savedLinkToken, isOAuthRedirect]);

  const startConnect = async () => {
    setError(''); setMessage('');
    try {
      // Pass current URL as redirect_uri so Plaid OAuth banks return us here
      const redirectUri = `${window.location.origin}/bookkeeping`;
      const { link_token } = await api.getPlaidLinkToken(redirectUri);
      localStorage.setItem(LS_TOKEN, link_token);
      setLinkToken(link_token);
    } catch (e) {
      setError(typeof e === 'string' ? e : (e.message || JSON.stringify(e)));
    }
  };

  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    setMessage('Connecting...');
    try {
      const instName = metadata?.institution?.name || savedInstitution;
      await api.exchangePlaidToken(public_token, instName);
      setMessage(`Connected ${instName || 'institution'}.`);
      setLinkToken(null);
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_INST);
      // Clean ?oauth_state_id off the URL
      if (window.location.search.includes('oauth_state_id')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      await loadData();
    } catch (e) {
      setError('Connect failed: ' + (typeof e === 'string' ? e : (e.message || JSON.stringify(e))));
    }
  }, [loadData, savedInstitution]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setLinkToken(null);
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_INST);
    },
    onEvent: (eventName, metadata) => {
      // Capture the institution name before OAuth redirect so we can recover it after
      if (eventName === 'SELECT_INSTITUTION' && metadata?.institution_name) {
        localStorage.setItem(LS_INST, metadata.institution_name);
      }
    },
    receivedRedirectUri: isOAuthRedirect ? window.location.href : undefined,
  });

  // Auto-open Link when token is ready (covers both fresh connect and OAuth resume)
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  const handleSync = async (itemId) => {
    setError(''); setMessage(''); setSyncing(itemId);
    try {
      const result = await api.syncPlaid(itemId);
      const r = result.synced?.[0] || {};
      setMessage(`Synced: ${r.added || 0} added, ${r.modified || 0} updated, ${r.removed || 0} removed`);
      await loadData();
    } catch (e) {
      setError('Sync failed: ' + (typeof e === 'string' ? e : (e.message || JSON.stringify(e))));
    } finally {
      setSyncing(null);
    }
  };

  const handleMap = async (plaidAccountId, glAccountNumber) => {
    if (!glAccountNumber) return;
    try {
      await api.setPlaidGlMapping(plaidAccountId, glAccountNumber);
      await loadData();
    } catch (e) {
      setError('Mapping failed: ' + (typeof e === 'string' ? e : (e.message || JSON.stringify(e))));
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bookkeeping</h1>
      <BookkeepingNav />
      <h2 style={{ marginTop: 0 }}>Bank Connections</h2>
      <p style={{ color: '#666' }}>
        Connect your bank and credit card accounts. Transactions sync automatically and
        get categorized to your chart of accounts.
      </p>

      {error && (
        <div style={{ background: '#fee', border: '1px solid #c00', color: '#900', padding: 12, borderRadius: 6, marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ background: '#efe', border: '1px solid #0a0', color: '#060', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {message}
        </div>
      )}

      <button
        onClick={startConnect}
        style={{
          background: '#1a2a4a', color: '#fff', border: 'none', padding: '12px 24px',
          borderRadius: 6, fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        + Connect a Bank or Credit Card
      </button>

      <h2>Connected Institutions</h2>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p style={{ color: '#888' }}>None yet. Click "Connect a Bank" above to start.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={cellHead}>Institution</th>
              <th style={cellHead}>Status</th>
              <th style={cellHead}>Accounts</th>
              <th style={cellHead}>Last Synced</th>
              <th style={cellHead}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={cell}>{it.institution_name}</td>
                <td style={cell}>
                  <span style={{
                    background: it.status === 'active' ? '#dfd' : '#fdd',
                    color: it.status === 'active' ? '#060' : '#900',
                    padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem',
                  }}>
                    {it.status}
                  </span>
                </td>
                <td style={cell}>{it.account_count}</td>
                <td style={cell}>{it.last_synced_at ? new Date(it.last_synced_at).toLocaleString() : 'Never'}</td>
                <td style={cell}>
                  <button
                    onClick={() => handleSync(it.id)}
                    disabled={syncing === it.id}
                    style={syncBtn}
                  >
                    {syncing === it.id ? 'Syncing...' : 'Sync Now'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Linked Accounts</h2>
      {accounts.length === 0 ? (
        <p style={{ color: '#888' }}>No accounts yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={cellHead}>Institution</th>
              <th style={cellHead}>Account</th>
              <th style={cellHead}>Type</th>
              <th style={cellHead}>Balance</th>
              <th style={cellHead}>GL Account</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td style={cell}>{a.institution_name}</td>
                <td style={cell}>{a.nickname} ****{a.mask}</td>
                <td style={cell}>{a.account_subtype || a.account_type}</td>
                <td style={cell}>${Number(a.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={cell}>
                  <select
                    value={a.gl_account_number || ''}
                    onChange={(e) => handleMap(a.id, e.target.value)}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                  >
                    <option value="">— pick GL account —</option>
                    {glAccounts
                      .filter((g) => g.account_type === 'Bank' || g.account_type === 'Credit Card')
                      .map((g) => (
                        <option key={g.account_number} value={g.account_number}>
                          {g.account_number} {g.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cellHead = { padding: '10px 12px', borderBottom: '2px solid #ddd', fontWeight: 600 };
const cell     = { padding: '10px 12px', borderBottom: '1px solid #eee' };
const syncBtn  = {
  background: '#1a2a4a', color: '#fff', border: 'none', padding: '6px 14px',
  borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem',
};
