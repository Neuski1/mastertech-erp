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

module.exports = { chargeNonce, isPoyntConfigured, healthCheck, extractSdkAppId };
