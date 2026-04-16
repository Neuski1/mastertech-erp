/**
 * Poynt (GoDaddy Payments) Collect service.
 * Handles card nonce tokenization + SALE charge via the Poynt Node SDK.
 * Requires POYNT_APPLICATION_ID, POYNT_PRIVATE_KEY, POYNT_BUSINESS_ID, POYNT_STORE_ID.
 */

let client = null;

function normalizePrivateKey(raw) {
  if (!raw) return raw;
  // Railway (and many CI systems) store multiline secrets with literal "\n"
  // rather than real newlines. Poynt's SDK feeds the PEM straight into
  // jsonwebtoken which requires real newlines — so we normalize here.
  let key = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
  // Handle quoted values copied with surrounding quotes
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // Trim whitespace on each line — some UIs inject leading spaces
  key = key.split('\n').map((l) => l.trim()).join('\n').trim();
  return key;
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
    throw new Error('Poynt private key is malformed — expected a PEM block with BEGIN/END PRIVATE KEY markers. Check that POYNT_PRIVATE_KEY in Railway preserves newlines (paste the full PEM including header/footer).');
  }
  const poynt = require('poynt');
  client = poynt({ applicationId: POYNT_APPLICATION_ID, key });
  return client;
}

function isPoyntConfigured() {
  return !!(process.env.POYNT_APPLICATION_ID && process.env.POYNT_PRIVATE_KEY
    && process.env.POYNT_BUSINESS_ID && process.env.POYNT_STORE_ID);
}

function tokenizeCard({ nonce }) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    c.tokenizeCard(
      { businessId: process.env.POYNT_BUSINESS_ID, nonce },
      (err, result) => err ? reject(err) : resolve(result)
    );
  });
}

/**
 * Charge a tokenized card. Amounts in CENTS.
 * @param {Object} opts
 * @param {string} opts.cardToken - paymentJWT returned by tokenizeCard
 * @param {number} opts.amountCents
 * @param {string} [opts.customerEmail]
 * @param {string} [opts.requestId]
 */
function chargeToken({ cardToken, amountCents, customerEmail, requestId }) {
  return new Promise((resolve, reject) => {
    let c;
    try { c = getClient(); } catch (err) { return reject(err); }
    c.chargeToken(
      {
        businessId: process.env.POYNT_BUSINESS_ID,
        storeId: process.env.POYNT_STORE_ID,
        action: 'SALE',
        source: 'WEB',
        token: cardToken,
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

module.exports = { tokenizeCard, chargeToken, isPoyntConfigured };
