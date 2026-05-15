/**
 * Poynt (GoDaddy Payments) Collect service.
 * Charges a Poynt Collect nonce via the Poynt Node SDK in a single step.
 *
 * The SDK's chargeToken() accepts either { token } (pre-tokenized) or
 * { nonce } (browser nonce from Poynt Collect). For Collect, the nonce
 * path is correct — a separate tokenizeCard() call is for terminal/raw
 * card data and returns "bad request" when given a Collect nonce.
 */

// Enable the Poynt SDK's built-in debug logging so Railway logs show the
// raw HTTP request URL, body, and response for every API call.
try { require('debug').enable('poynt'); } catch {}

let client = null;

function normalizePrivateKey(raw) {
  if (!raw) return raw;
  let key = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.split('\n').map((l) => l.trim()).join('\n').trim();
  return key;
}

/**
 * POYNT_APPLICATION_ID env var packs two IDs in the form:
 *   "<uuid>=urn:aid:<appId>"
 * Both the browser TokenizeJs SDK and the server Node SDK need just the
 * "urn:aid:<appId>" portion. Passing the full string causes Poynt's API
 * to respond with "No application found associated with applicationId ..."
 * on the browser side, and to reject the signed JWT on the server side.
 */
function extractSdkAppId(fullApplicationId) {
  const match = fullApplicationId.match(/(urn:aid:[a-f0-9-]+)/i);
  if (match) return match[1];
  return fullApplicationId;
}

function getClient() {
  if (client) return client;
  const { POYNT_APPLICATION_ID, POYNT_PRIVATE_KEY } = process.env;
  if (!POYNT_APPLICATION_ID || !POYNT_PRIVATE_KEY) {
    throw new Error('Poynt not configured — missing POYNT_APPLICATION_ID or POYNT_PRIVATE_KEY');
  }
  const key = normalizePrivateKey(POYNT_PRIVATE_KEY);
  const hasBegin = /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(key);
  const hasEnd = /-----END [A-Z ]*PRIVATE KEY-----/.test(key);
  if (!hasBegin || !hasEnd) {
    throw new Error('Poynt private key is malformed — expected a PEM block with BEGIN/END PRIVATE KEY markers. Check that POYNT_PRIVATE_KEY in Railway preserves newlines.');
  }
  const sdkAppId = extractSdkAppId(POYNT_APPLICATION_ID);
  const keyLines = key.split('\n').length;
  const keyStart = key.slice(0, 40);
  console.log(`[poynt] initializing SDK — applicationId: ${sdkAppId}, key: ${keyLines} lines, starts: "${keyStart}..."`);
  const poynt = require('poynt');
  client = poynt({ applicationId: sdkAppId, key });
  return client;
}

function isPoyntConfigured() {
  return !!(process.env.POYNT_APPLICATION_ID && process.env.POYNT_PRIVATE_KEY
    && process.env.POYNT_BUSINESS_ID && process.env.POYNT_STORE_ID);
}

/**
 * Charge a Poynt Collect nonce directly. No separate tokenize step needed.
 * The SDK builds fundingSource: { nonce } internally when you pass `nonce`
 * instead of `token`.
 *
 * @param {Object} opts
 * @param {string} opts.nonce - browser nonce from Poynt Collect getNonce()
 * @param {number} opts.amountCents - amount in cents (integer)
 * @param {string} [opts.customerEmail]
 * @param {string} [opts.requestId] - idempotency key
 */
function chargeNonce({ nonce, amountCents, customerEmail, requestId }) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    c.chargeToken(
      {
        businessId: process.env.POYNT_BUSINESS_ID,
        storeId: process.env.POYNT_STORE_ID,
        action: 'SALE',
        source: 'WEB',
        nonce,
        amounts: {
          transactionAmount: amountCents,
          orderAmount: amountCents,
          currency: 'USD',
        },
        emailReceipt: !!customerEmail,
        receiptEmailAddress: customerEmail || undefined,
        requestId,
      },
      (err, result) => err ? reject(err) : resolve(result)
    );
  });
}

/**
 * Diagnostic: report config presence, PEM shape, and whether a fresh SDK
 * init succeeds — without ever returning the key itself.
 */
function healthCheck() {
  const { POYNT_APPLICATION_ID, POYNT_BUSINESS_ID, POYNT_STORE_ID, POYNT_PRIVATE_KEY } = process.env;
  const result = {
    applicationIdSet: !!POYNT_APPLICATION_ID,
    businessIdSet: !!POYNT_BUSINESS_ID,
    storeIdSet: !!POYNT_STORE_ID,
    privateKeySet: !!POYNT_PRIVATE_KEY,
    privateKeyLooksValid: false,
    privateKeyLineCount: 0,
    sdkAppIdExtracted: null,
    sdkInitOk: false,
    sdkInitError: null,
  };

  if (POYNT_PRIVATE_KEY) {
    const key = normalizePrivateKey(POYNT_PRIVATE_KEY);
    const hasBegin = /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(key);
    const hasEnd = /-----END [A-Z ]*PRIVATE KEY-----/.test(key);
    result.privateKeyLooksValid = hasBegin && hasEnd;
    result.privateKeyLineCount = key.split('\n').length;
  }

  if (POYNT_APPLICATION_ID) {
    result.sdkAppIdExtracted = extractSdkAppId(POYNT_APPLICATION_ID);
  }

  if (result.applicationIdSet && result.privateKeyLooksValid) {
    try {
      const key = normalizePrivateKey(POYNT_PRIVATE_KEY);
      const sdkAppId = extractSdkAppId(POYNT_APPLICATION_ID);
      const poynt = require('poynt');
      poynt({ applicationId: sdkAppId, key });
      result.sdkInitOk = true;
    } catch (err) {
      result.sdkInitError = err && (err.message || String(err));
    }
  }

  return result;
}

/**
 * Fetch the business object from Poynt Cloud. Includes nested stores +
 * storeDevices arrays — used to look up a deviceId (UUID) from a terminal's
 * serial number, since Payment Bridge needs the cloud deviceId, not the serial
 * or the merchant-facing TID printed on the terminal.
 */
function getBusiness() {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    c.getBusiness(
      { businessId: process.env.POYNT_BUSINESS_ID },
      (err, result) => err ? reject(err) : resolve(result)
    );
  });
}

/**
 * Make a raw Poynt API call through the SDK's authenticated request method.
 * The SDK only wraps a subset of endpoints; this lets us hit any REST endpoint
 * (like /stores/{storeId}/devices) using the existing JWT/refresh plumbing.
 */
function rawRequest(opts) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    c.request(opts, (err, result) => err ? reject(err) : resolve(result));
  });
}

/**
 * Hit the Poynt REST endpoint that lists devices for a store. The SDK's
 * getBusiness() response sometimes omits storeDevices, so call the devices
 * endpoint directly. Falls back to the getBusiness shape if the dedicated
 * endpoint isn't accessible for some reason.
 *
 * Returns: { devices: [...], raw: { business, storeDevicesByStore } } so the
 * UI shows everything Poynt actually returned, making it easy to diagnose
 * empty results.
 */
async function listDevices() {
  const businessId = process.env.POYNT_BUSINESS_ID;
  const storeId = process.env.POYNT_STORE_ID;
  const out = [];
  const raw = { business: null, storeDevicesByStore: {} };

  // 1) Try the business object first — it may include nested stores+devices.
  try {
    const business = await getBusiness();
    raw.business = business;
    for (const store of business?.stores || []) {
      for (const dev of store?.storeDevices || []) {
        out.push({
          source: 'business.stores.storeDevices',
          storeId: store.id,
          storeName: store.displayName || store.name || null,
          deviceId: dev.id,
          serialNumber: dev.serialNumber || dev.serialNum || null,
          name: dev.name || dev.deviceName || null,
          type: dev.type || dev.deviceType || null,
          status: dev.status || null,
          tid: dev.terminalId || null,
        });
      }
    }
  } catch (err) {
    raw.businessError = err?.developerMessage || err?.message || String(err);
  }

  // 2) Hit the dedicated /stores/{storeId}/devices endpoint as well — this is
  //    what Poynt HQ uses to render the device list and is more reliable.
  if (storeId) {
    try {
      const devicesResp = await rawRequest({
        url: '/businesses/' + encodeURIComponent(businessId)
          + '/stores/' + encodeURIComponent(storeId) + '/devices',
        method: 'GET',
      });
      raw.storeDevicesByStore[storeId] = devicesResp;
      const arr = Array.isArray(devicesResp) ? devicesResp
        : (devicesResp?.devices || devicesResp?.items || []);
      for (const dev of arr) {
        out.push({
          source: 'stores/' + storeId + '/devices',
          storeId,
          storeName: null,
          deviceId: dev.id || dev.storeDeviceId,
          serialNumber: dev.serialNumber || dev.serialNum || null,
          name: dev.name || dev.deviceName || null,
          type: dev.type || dev.deviceType || null,
          status: dev.status || null,
          tid: dev.terminalId || null,
        });
      }
    } catch (err) {
      raw.storeDevicesError = err?.developerMessage || err?.message || String(err);
    }
  }

  return { devices: out, raw };
}

/**
 * Push a sale to a Poynt Smart Terminal via Payment Bridge.
 *
 * Sends a cloud message that wakes up the terminal's Payment Bridge listener
 * and prompts the customer to tap/insert/swipe. The terminal posts the result
 * back to Poynt Cloud; we reconcile by polling getTransactions filtered by
 * the referenceId we send here.
 *
 * @param {Object} opts
 * @param {number} opts.amountCents - integer cents
 * @param {string} opts.referenceId - our online_payments.payment_token (UUID)
 * @param {string} [opts.deviceId]   - terminal cloud UUID (defaults to env)
 * @param {string} [opts.serialNumber] - terminal serial (optional disambiguator)
 */
function pushToTerminal({ amountCents, referenceId, deviceId, serialNumber }) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    const targetDeviceId = deviceId || process.env.POYNT_TERMINAL_DEVICE_ID;
    const targetSerial = serialNumber || process.env.POYNT_TERMINAL_SERIAL || undefined;
    if (!targetDeviceId) {
      return reject(new Error('Missing terminal deviceId — set POYNT_TERMINAL_DEVICE_ID or pass deviceId.'));
    }
    // Payment Bridge payload — kept minimal. action SALE = run a card sale,
    // amount in cents, autoCapture=true so funds settle on the merchant batch.
    const data = JSON.stringify({
      action: 'SALE',
      amount: amountCents,
      currency: 'USD',
      referenceId,
      autoCapture: true,
      skipReceiptScreen: false,
    });
    console.log('[poynt] payment bridge → device=%s, amount=%d cents, ref=%s',
      targetDeviceId, amountCents, referenceId);
    c.sendPaymentBridgeMessage(
      {
        businessId: process.env.POYNT_BUSINESS_ID,
        storeId: process.env.POYNT_STORE_ID,
        deviceId: targetDeviceId,
        serialNumber: targetSerial,
        data,
        ttl: 600, // 10 min — terminal stops listening after this
      },
      (err, result) => err ? reject(err) : resolve(result)
    );
  });
}

/**
 * Look up a transaction in Poynt by our referenceId. Used to reconcile
 * Payment Bridge sales — we don't get a synchronous response from the
 * terminal, so we poll Poynt for the matching transaction after the customer
 * runs the card.
 */
function findTransactionByReference({ referenceId, minutesBack = 30 } = {}) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    const startAt = new Date(Date.now() - minutesBack * 60 * 1000).toISOString();
    c.getTransactions(
      {
        businessId: process.env.POYNT_BUSINESS_ID,
        storeId: process.env.POYNT_STORE_ID,
        searchKey: referenceId,
        startAt,
        limit: 25,
      },
      (err, result) => {
        if (err) return reject(err);
        const txns = result?.transactions || result?.items || [];
        // Some Poynt deploys return the referenceId in different fields —
        // check each one. Match status CAPTURED or AUTHORIZED.
        const hit = txns.find((t) => {
          const ref = t.referenceId
            || t.context?.referenceId
            || t.references?.[0]?.id
            || null;
          return ref && String(ref) === String(referenceId);
        });
        resolve(hit || null);
      }
    );
  });
}

module.exports = {
  chargeNonce,
  isPoyntConfigured,
  healthCheck,
  extractSdkAppId,
  getBusiness,
  listDevices,
  pushToTerminal,
  findTransactionByReference,
};
