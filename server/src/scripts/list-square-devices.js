#!/usr/bin/env node
/**
 * List all Square Terminal devices connected to your account.
 * Run: node server/src/scripts/list-square-devices.js
 *
 * NOTE: This uses credentials from your local .env file.
 * To list PRODUCTION devices, temporarily set SQUARE_ENVIRONMENT=production
 * and use the production access token in .env, then run the script.
 * REMEMBER to restore sandbox credentials after.
 */

require('dotenv').config();

const env = process.env.SQUARE_ENVIRONMENT || 'sandbox';
const token = process.env.SQUARE_ACCESS_TOKEN;
const baseUrl = env === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

async function listDevices() {
  console.log('Fetching Square devices...\n');
  console.log(`Environment: ${env}`);
  console.log(`Access Token: ${token ? '***set' : 'NOT SET'}\n`);

  if (!token) {
    console.error('SQUARE_ACCESS_TOKEN is not set in .env');
    return;
  }

  try {
    // List device codes
    const res = await fetch(`${baseUrl}/v2/devices/codes`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    if (data.errors) {
      console.error('API Error:', data.errors.map(e => e.detail).join('; '));
      return;
    }

    const codes = data.device_codes || [];
    if (codes.length === 0) {
      console.log('No terminal device codes found.\n');
    } else {
      console.log(`Found ${codes.length} device code(s):\n`);
      codes.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.name || 'Unnamed'}`);
        console.log(`     Device ID:   ${d.device_id || '—'}`);
        console.log(`     Code:        ${d.code || '—'}`);
        console.log(`     Status:      ${d.status || '—'}`);
        console.log(`     Product:     ${d.product_type || '—'}`);
        console.log(`     Location:    ${d.location_id || '—'}`);
        console.log(`     Paired At:   ${d.paired_at || '—'}`);
        console.log('');
      });
      const paired = codes.find(d => d.status === 'PAIRED');
      if (paired && paired.device_id) {
        console.log('>> Add to Railway env vars:');
        console.log(`   SQUARE_TERMINAL_DEVICE_ID=${paired.device_id}\n`);
      }
    }

    // Also list devices directly
    const devRes = await fetch(`${baseUrl}/v2/devices`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const devData = await devRes.json();
    const devices = devData.devices || [];

    if (devices.length > 0) {
      console.log(`Found ${devices.length} device(s):\n`);
      devices.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.attributes?.name || d.name || 'Unnamed'}`);
        console.log(`     Device ID:   ${d.id}`);
        console.log(`     Type:        ${d.attributes?.type || '—'}`);
        console.log(`     Status:      ${d.status?.category || '—'}`);
        console.log(`     Location:    ${d.location_id || '—'}`);
        console.log('');
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }

  if (env === 'sandbox') {
    console.log('---');
    console.log('Running against SANDBOX. To list production devices:');
    console.log('1. Temporarily set SQUARE_ENVIRONMENT=production in .env');
    console.log('2. Set SQUARE_ACCESS_TOKEN to your production token');
    console.log('3. Re-run this script');
    console.log('4. Restore sandbox credentials after');
  }
}

listDevices();
