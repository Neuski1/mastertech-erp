/**
 * Poynt (GoDaddy Payments) Collect service.
 * Handles card nonce tokenization + SALE charge via the Poynt Node SDK.
 * Requires POYNT_APPLICATION_ID, POYNT_PRIVATE_KEY, POYNT_BUSINESS_ID, POYNT_STORE_ID.
 */

let client = null;

function getClient() {
  if (client) return client;
  const { POYNT_APPLICATION_ID, POYNT_PRIVATE_KEY } = process.env;
  if (!POYNT_APPLICATION_ID || !POYNT_PRIVATE_KEY) {
    throw new Error('Poynt not configured — missing POYNT_APPLICATION_ID or POYNT_PRIVATE_KEY');
  }
  const poynt = require('poynt');
  // Railway stores multiline secrets with literal \n — convert to real newlines.
  const key = POYNT_PRIVATE_KEY.includes('\\n')
    ? POYNT_PRIVATE_KEY.replace(/\\n/g, '\n')
    : POYNT_PRIVATE_KEY;
  client = poynt({ applicationId: POYNT_APPLICATION_ID, key });
  return client;
}

function isPoyntConfigured() {
  return !!(process.env.POYNT_APPLICATION_ID && process.env.POYNT_PRIVATE_KEY
    && process.env.POYNT_BUSINESS_ID && process.env.POYNT_STORE_ID);
}

function tokenizeCard({ nonce }) {
  return new Promise((resolve, reject) => {
    getClient().tokenizeCard(
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
    getClient().chargeToken(
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
