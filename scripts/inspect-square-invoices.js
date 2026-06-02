#!/usr/bin/env node
/**
 * Read-only Square invoice inspector for the storage payment-grid off-by-one.
 *
 * Purpose
 *   The grid buckets each invoice by paymentRequests[0].dueDate. Because we
 *   bill "monthly on the last day, in advance", June's invoice is due May 31
 *   and lands in May — so June reads unpaid for everyone. This script dumps the
 *   raw invoice fields for two known recurring series so we can SEE which field
 *   reliably encodes the month the invoice is actually FOR (the service month),
 *   and switch the bucketing to that field instead of dueDate.
 *
 * What it prints, per matched invoice:
 *   - invoice_number and the -R- sequence number
 *   - status
 *   - paymentRequests[0].dueDate
 *   - createdAt
 *   - title
 *   - order line item name(s)
 *   - (year, month) the CURRENT code assigns  (from dueDate)
 *   - (year, month) for the SERVICE-month hypothesis (dueDate + 1 month)
 *   so the human can compare against title / line item text, which usually spell
 *   out "June 2026" and are the real source of truth.
 *
 * Matching
 *   Series id = the -R- prefix of invoice_number (e.g. "3952-R-7" -> "3952"),
 *   which is stored on storage_billing.square_sub_id. We look the series up to
 *   get its square_customer_id and search that customer's invoices; if the
 *   series isn't linked in the DB, we fall back to paging all location invoices
 *   and filtering by the "<series>-R-" prefix.
 *
 * Guarantees
 *   READ ONLY. Only issues SELECTs against Postgres and search/get calls
 *   against Square. It never writes to the database, to Square, or to the
 *   storage_payment_status cache.
 *
 * Run from the project root (point .env at the SAME Square account the grid
 * syncs against — i.e. production, the way the live sync runs):
 *     node scripts/inspect-square-invoices.js
 */
const path = require('path');

// Deps (dotenv, pg) live in server/node_modules, not the repo root. Resolve
// them from there if a root-level install isn't present, so this runs no matter
// which workspace got `npm install`.
function dep(name) {
  try {
    return require(name);
  } catch (e) {
    return require(path.join(__dirname, '..', 'server', 'node_modules', name));
  }
}

dep('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = dep('pg');

// Boxes to inspect: display name + recurring series id (invoice_number prefix).
const TARGETS = [
  { name: 'Bret Barber', series: '3952' },
  { name: 'Adam Eaton', series: '1537' },
];

// --- month helpers ----------------------------------------------------------

// Bucket exactly the way server/src/routes/storage.js does today: the calendar
// month printed on the date string (date-only -> no timezone shift).
function codeBucket(dateStr) {
  if (!dateStr) return { year: null, month: null };
  const s = String(dateStr);
  const year = parseInt(s.slice(0, 4), 10);
  const month = parseInt(s.slice(5, 7), 10);
  if (!year || !month) return { year: null, month: null };
  return { year, month };
}

function addMonths({ year, month }, delta) {
  if (!year || !month) return { year: null, month: null };
  let m = month + delta;
  let y = year;
  while (m > 12) { m -= 12; y += 1; }
  while (m < 1) { m += 12; y -= 1; }
  return { year: y, month: m };
}

const ym = ({ year, month }) =>
  year && month ? `${year}-${String(month).padStart(2, '0')}` : '(none)';

// Pull the sequence number out of an invoice_number like "3952-R-7".
function seqOf(invoiceNumber, series) {
  if (!invoiceNumber) return null;
  const idx = invoiceNumber.indexOf('-R-');
  if (idx === -1) return null;
  return invoiceNumber.slice(idx + 3);
}

// Tolerate either response shape from the SDK (.invoices or .result.invoices).
const invoicesOf = (resp) => resp?.invoices || resp?.result?.invoices || [];
const cursorOf = (resp) => resp?.cursor || resp?.result?.cursor || null;

// --- main --------------------------------------------------------------------

(async () => {
  // Square client, reused from the same wrapper the live sync uses. Requiring it
  // resolves `square` from server/node_modules, where it is installed.
  let squareClient, locationId;
  try {
    ({ client: squareClient, locationId } = require('../server/src/services/square'));
  } catch (e) {
    console.error('ERROR: could not load the Square client wrapper:', e.message);
    console.error('Run from the project root and ensure server deps are installed.');
    process.exit(1);
  }

  const url = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('ERROR: PRODUCTION_DATABASE_URL (or DATABASE_URL) is not set in .env');
    process.exit(1);
  }
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  // Cache order -> line item names so we don't re-fetch the same order.
  const orderCache = new Map();
  async function lineItemNames(orderId) {
    if (!orderId) return [];
    if (orderCache.has(orderId)) return orderCache.get(orderId);
    let names = [];
    try {
      const resp = await squareClient.orders.get({ orderId });
      const order = resp?.order || resp?.result?.order;
      names = (order?.lineItems || []).map((li) => li.name).filter(Boolean);
    } catch (e) {
      names = [`(order fetch failed: ${e.message})`];
    }
    orderCache.set(orderId, names);
    return names;
  }

  // Find a series' customer id from storage_billing (read-only).
  async function customerForSeries(series) {
    const { rows } = await pool.query(
      `SELECT id AS billing_id, customer_id, square_customer_id, square_sub_id
         FROM storage_billing
        WHERE square_sub_id = $1
        ORDER BY deleted_at NULLS FIRST
        LIMIT 1`,
      [series]
    );
    return rows[0] || null;
  }

  // All invoices for a customer (paginated, read-only search).
  async function invoicesForCustomer(squareCustomerId) {
    const out = [];
    let cursor;
    do {
      const resp = await squareClient.invoices.search({
        query: {
          filter: {
            locationIds: locationId ? [locationId] : undefined,
            customerIds: [squareCustomerId],
          },
        },
        limit: 100,
        cursor,
      });
      out.push(...invoicesOf(resp));
      cursor = cursorOf(resp);
    } while (cursor);
    return out;
  }

  // Fallback: page every location invoice and filter by the series prefix.
  async function invoicesByPrefixScan(series) {
    const prefix = `${series}-R-`;
    const out = [];
    let cursor;
    do {
      const resp = await squareClient.invoices.search({
        query: { filter: { locationIds: locationId ? [locationId] : undefined } },
        limit: 200,
        cursor,
      });
      for (const inv of invoicesOf(resp)) {
        if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) out.push(inv);
      }
      cursor = cursorOf(resp);
    } while (cursor);
    return out;
  }

  try {
    console.log(`Square location: ${locationId || '(none configured)'}`);
    console.log(`Environment    : ${process.env.SQUARE_ENVIRONMENT || 'sandbox'}`);

    for (const target of TARGETS) {
      console.log('\n' + '#'.repeat(78));
      console.log(`# ${target.name} — series ${target.series}`);
      console.log('#'.repeat(78));

      const link = await customerForSeries(target.series);
      let invoices = [];
      let how = '';
      if (link && link.square_customer_id) {
        how = `square_customer_id ${link.square_customer_id} (billing ${link.billing_id})`;
        const all = await invoicesForCustomer(link.square_customer_id);
        // Keep only this series' invoices.
        invoices = all.filter(
          (inv) => inv.invoiceNumber && inv.invoiceNumber.startsWith(`${target.series}-R-`)
        );
      }
      if (invoices.length === 0) {
        how = how
          ? how + ' -> none matched; fell back to location prefix scan'
          : 'square_sub_id not linked in DB; location prefix scan';
        invoices = await invoicesByPrefixScan(target.series);
      }
      console.log(`Matched via    : ${how}`);
      console.log(`Invoices found : ${invoices.length}`);

      // Sort by -R- sequence when numeric, else by invoice_number.
      invoices.sort((a, b) => {
        const sa = parseInt(seqOf(a.invoiceNumber, target.series), 10);
        const sb = parseInt(seqOf(b.invoiceNumber, target.series), 10);
        if (!Number.isNaN(sa) && !Number.isNaN(sb)) return sa - sb;
        return String(a.invoiceNumber).localeCompare(String(b.invoiceNumber));
      });

      const tableRows = [];
      for (const inv of invoices) {
        const pr = Array.isArray(inv.paymentRequests) ? inv.paymentRequests[0] : null;
        const dueDate = pr && pr.dueDate ? pr.dueDate : null;
        const code = codeBucket(dueDate);                 // what the grid uses now
        const service = addMonths(code, 1);               // dueDate+1 hypothesis
        const names = await lineItemNames(inv.orderId);

        console.log('\n  ' + '-'.repeat(72));
        console.log(`  invoice_number   : ${inv.invoiceNumber}`);
        console.log(`  -R- sequence     : ${seqOf(inv.invoiceNumber, target.series)}`);
        console.log(`  status           : ${inv.status}`);
        console.log(`  dueDate (pr[0])  : ${dueDate}`);
        console.log(`  createdAt        : ${inv.createdAt}`);
        console.log(`  title            : ${inv.title || '(none)'}`);
        console.log(`  line item name(s): ${names.length ? names.join(' | ') : '(none)'}`);
        console.log(`  CODE bucket      : ${ym(code)}   <- current grid (by dueDate)`);
        console.log(`  SERVICE (dd+1)   : ${ym(service)}   <- hypothesis; verify vs title/line item`);

        tableRows.push({
          invoice_number: inv.invoiceNumber,
          seq: seqOf(inv.invoiceNumber, target.series),
          status: inv.status,
          dueDate,
          code_bucket: ym(code),
          service_dd1: ym(service),
          title: inv.title || '',
          line_items: names.join(' | '),
        });
      }

      if (tableRows.length) {
        console.log('\n  Summary for series ' + target.series + ':');
        console.table(tableRows);
      }
    }

    console.log('\nDone — read-only. Nothing was written to the database or to Square.');
  } catch (err) {
    console.error('FATAL:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
