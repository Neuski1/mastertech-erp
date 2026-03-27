const { SquareClient, SquareEnvironment } = require('square');

/*
 SQUARE PRODUCTION SETUP — Carol's steps:
 1. Go to developer.squareup.com
 2. Click your application → switch from Sandbox to Production tab
 3. Copy Production Access Token
 4. Copy Production Location ID (your actual Master Tech location)
 5. In Railway → mastertech-erp → Variables, update:
      SQUARE_ACCESS_TOKEN = [production token]
      SQUARE_LOCATION_ID  = [production location ID]
      SQUARE_ENVIRONMENT  = production
 6. Railway will auto-redeploy
 IMPORTANT: Never use production credentials in local .env
 during development — keep sandbox values locally.
*/

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
