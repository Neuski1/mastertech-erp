const { SquareClient, SquareEnvironment } = require('square');

// ---------------------------------------------------------------------------
// Square SDK client — initialized from environment variables
// SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
// ---------------------------------------------------------------------------

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;
const applicationId = process.env.SQUARE_APPLICATION_ID;

if (!accessToken) {
  console.warn('WARNING: SQUARE_ACCESS_TOKEN not set — Square payments will fail');
}

const environment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

const client = new SquareClient({
  token: accessToken,
  environment,
});

module.exports = {
  client,
  locationId,
  applicationId,
  environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
};
