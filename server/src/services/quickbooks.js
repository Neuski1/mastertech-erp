const OAuthClient = require('intuit-oauth');
const pool = require('../db/pool');

// ---------------------------------------------------------------------------
// QuickBooks OAuth2 client — initialized from environment variables
// ---------------------------------------------------------------------------

const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID,
  clientSecret: process.env.QB_CLIENT_SECRET,
  environment: process.env.QB_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  redirectUri: process.env.QB_REDIRECT_URI || 'http://localhost:3001/api/quickbooks/callback',
});

// ---------------------------------------------------------------------------
// Token storage helpers — persist to system_settings table
// ---------------------------------------------------------------------------

async function saveSetting(key, value) {
  await pool.query(
    `INSERT INTO system_settings (setting_key, setting_value, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = $2`,
    [key, value, `QuickBooks ${key}`]
  );
}

async function loadSetting(key) {
  const { rows } = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key = $1',
    [key]
  );
  return rows[0] ? rows[0].setting_value : null;
}

async function saveTokens(tokenData) {
  await Promise.all([
    saveSetting('qb_access_token', tokenData.access_token),
    saveSetting('qb_refresh_token', tokenData.refresh_token),
    saveSetting('qb_token_expiry', tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString()),
    ...(tokenData.realmId ? [saveSetting('qb_realm_id', tokenData.realmId)] : []),
  ]);
}

async function loadTokens() {
  const [accessToken, refreshToken, tokenExpiry, realmId] = await Promise.all([
    loadSetting('qb_access_token'),
    loadSetting('qb_refresh_token'),
    loadSetting('qb_token_expiry'),
    loadSetting('qb_realm_id'),
  ]);

  return { accessToken, refreshToken, tokenExpiry, realmId };
}

async function clearTokens() {
  const keys = ['qb_access_token', 'qb_refresh_token', 'qb_token_expiry', 'qb_realm_id'];
  for (const key of keys) {
    await pool.query('DELETE FROM system_settings WHERE setting_key = $1', [key]);
  }
}

// ---------------------------------------------------------------------------
// Token refresh — auto-refresh if expired before any API call
// ---------------------------------------------------------------------------

async function getValidAccessToken() {
  const tokens = await loadTokens();

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('QuickBooks not connected. Please authorize first.');
  }

  const expiry = new Date(tokens.tokenExpiry);
  const now = new Date();

  // Refresh if token expires within 5 minutes
  if (expiry.getTime() - now.getTime() < 5 * 60 * 1000) {
    try {
      oauthClient.setToken({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'bearer',
        expires_in: Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000)),
      });

      const authResponse = await oauthClient.refresh();
      const newTokens = authResponse.getJson();

      await saveTokens({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_in: newTokens.expires_in,
      });

      return { accessToken: newTokens.access_token, realmId: tokens.realmId };
    } catch (err) {
      console.error('QB token refresh failed:', err);
      throw new Error('QuickBooks token refresh failed. Please reconnect.');
    }
  }

  return { accessToken: tokens.accessToken, realmId: tokens.realmId };
}

// ---------------------------------------------------------------------------
// QB API helper — makes authenticated requests to QuickBooks REST API
// ---------------------------------------------------------------------------

const QB_BASE = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com',
  production: 'https://quickbooks.api.intuit.com',
};

async function qbRequest(method, path, body = null) {
  const { accessToken, realmId } = await getValidAccessToken();
  const env = process.env.QB_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  const baseUrl = QB_BASE[env];
  const url = `${baseUrl}/v3/company/${realmId}${path}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    const errMsg = data.Fault?.Error?.[0]?.Detail
      || data.Fault?.Error?.[0]?.Message
      || JSON.stringify(data);
    throw new Error(`QB API ${res.status}: ${errMsg}`);
  }

  return data;
}

module.exports = {
  oauthClient,
  saveTokens,
  loadTokens,
  clearTokens,
  getValidAccessToken,
  qbRequest,
};
