#!/usr/bin/env node
/**
 * List all Square Terminal devices connected to your account.
 * Run: node server/src/scripts/list-square-devices.js
 *
 * Copy the Device ID for your terminal and add it to .env as:
 *   SQUARE_TERMINAL_DEVICE_ID=<device_id>
 */

require('dotenv').config();
const { client } = require('../services/square');

async function listDevices() {
  console.log('Fetching Square devices...\n');
  console.log(`Environment: ${process.env.SQUARE_ENVIRONMENT || 'sandbox'}`);
  console.log(`Access Token: ${process.env.SQUARE_ACCESS_TOKEN ? '***set' : 'NOT SET'}\n`);

  try {
    const response = await client.devices.list();
    const devices = response.data?.devices || [];

    if (devices.length === 0) {
      console.log('No devices found. Make sure your Square Terminal is paired in Square Dashboard.');
      return;
    }

    console.log(`Found ${devices.length} device(s):\n`);
    devices.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.name || 'Unnamed Device'}`);
      console.log(`     Device ID: ${d.id}`);
      console.log(`     Status:    ${d.status || '—'}`);
      console.log(`     Product:   ${d.productType || '—'}`);
      console.log(`     Location:  ${d.locationId || '—'}`);
      console.log('');
    });

    console.log('Copy the Device ID above and add to .env:');
    console.log(`  SQUARE_TERMINAL_DEVICE_ID=${devices[0].id}`);
  } catch (err) {
    const detail = err.errors
      ? err.errors.map(e => e.detail).join('; ')
      : err.message;
    console.error('Error listing devices:', detail);
  }
}

listDevices();
