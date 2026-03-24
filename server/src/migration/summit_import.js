/**
 * Summit Data Migration Script
 *
 * Imports historical work orders, customers, units, labor lines, and parts lines
 * from a Summit-exported Excel workbook into the Master Tech RV ERP database.
 *
 * Usage:
 *   Dry run:  node server/src/migration/summit_import.js --file "path/to/file.xlsx"
 *   Live run: node server/src/migration/summit_import.js --file "path/to/file.xlsx" --live
 */

require('dotenv').config();
const XLSX = require('xlsx');
const { Pool } = require('pg');

// ─── CLI Args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
if (fileIdx === -1 || !args[fileIdx + 1]) {
  console.error('Usage: node summit_import.js --file "path/to/file.xlsx" [--live]');
  process.exit(1);
}
const filePath = args[fileIdx + 1];
const isLive = args.includes('--live');

console.log(`\n========================================`);
console.log(`  Summit Data Migration`);
console.log(`  Mode: ${isLive ? '*** LIVE ***' : 'DRY RUN'}`);
console.log(`  File: ${filePath}`);
console.log(`========================================\n`);

// ─── DB Connection ──────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Vendor enum values (lowercase for matching) ────────────────────────────
const VENDOR_ENUM = [
  'Amazon', 'NTP', 'Torklift', 'Interstate', 'Lippert',
  'Renogy', 'Iron', 'Woodstream', 'Adfas', 'TMC',
  'Home Depot', 'Airstream', 'Other'
];
const VENDOR_MAP = {};
VENDOR_ENUM.forEach(v => { VENDOR_MAP[v.toLowerCase()] = v; });

// ─── Helpers ────────────────────────────────────────────────────────────────
function clean(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

function cleanNum(val) {
  if (val === undefined || val === null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function parseExcelDate(val) {
  if (!val) return null;
  // xlsx returns JS Date objects for date cells
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  // If it's a number, it's an Excel serial date
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const month = String(d.m).padStart(2, '0');
      const day = String(d.d).padStart(2, '0');
      return `${d.y}-${month}-${day}`;
    }
  }
  // Try parsing string
  const s = String(val).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function matchVendor(vendorStr) {
  if (!vendorStr) return null;
  const lower = String(vendorStr).trim().toLowerCase();
  return VENDOR_MAP[lower] || null;
}

// ─── Counters ───────────────────────────────────────────────────────────────
const counts = {
  customers: { imported: 0, skipped: 0, errors: 0 },
  units:     { imported: 0, skipped: 0, errors: 0 },
  records:   { imported: 0, skipped: 0, errors: 0 },
  labor:     { imported: 0, skipped: 0, errors: 0 },
  parts:     { imported: 0, skipped: 0, errors: 0 },
};

const errors = [];

function logError(entity, identifier, reason) {
  const msg = `[ERROR] ${entity} ${identifier}: ${reason}`;
  console.error(msg);
  errors.push(msg);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Read Excel
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetNames = workbook.SheetNames;
  console.log(`  Sheets found: ${sheetNames.join(', ')}`);

  // Sheet1 = line items, Sheet2 = WO headers
  const sheet1 = workbook.Sheets[sheetNames[0]];
  const sheet2 = workbook.Sheets[sheetNames[1]];

  if (!sheet1 || !sheet2) {
    console.error('ERROR: Expected at least 2 sheets in the workbook.');
    process.exit(1);
  }

  const lineItems = XLSX.utils.sheet_to_json(sheet1, { defval: null });
  const woHeaders = XLSX.utils.sheet_to_json(sheet2, { defval: null });

  console.log(`  Sheet1 (line items): ${lineItems.length} rows`);
  console.log(`  Sheet2 (WO headers): ${woHeaders.length} rows`);

  // Build lookup: W.O. → line items
  const linesByWO = {};
  for (const row of lineItems) {
    const wo = clean(row['W.O.']);
    if (!wo) continue;
    if (!linesByWO[wo]) linesByWO[wo] = [];
    linesByWO[wo].push(row);
  }

  // ── Get DB client (transaction for live mode) ─────────────────────────
  const client = await pool.connect();

  try {
    if (isLive) {
      await client.query('BEGIN');
    }

    // ── Load existing technicians ────────────────────────────────────────
    const techResult = await client.query(
      `SELECT id, LOWER(name) as name FROM technicians WHERE deleted_at IS NULL`
    );
    const techMap = {};
    let defaultTechId = null;
    for (const t of techResult.rows) {
      techMap[t.name] = t.id;
      if (!defaultTechId) defaultTechId = t.id;
    }

    // Create a Summit Import technician for unmatched labor lines
    let summitTechId;
    const existingSummitTech = techResult.rows.find(t => t.name === 'summit import');
    if (existingSummitTech) {
      summitTechId = existingSummitTech.id;
    } else if (isLive) {
      const techInsert = await client.query(
        `INSERT INTO technicians (name) VALUES ('Summit Import') RETURNING id`
      );
      summitTechId = techInsert.rows[0].id;
      console.log(`  Created "Summit Import" technician (id=${summitTechId}) for unmatched labor lines`);
    } else {
      summitTechId = -1; // placeholder for dry run
      console.log('  [DRY RUN] Would create "Summit Import" technician for unmatched labor lines');
    }

    // ── Load existing customers & records (for skip detection) ───────────
    const existingCustResult = await client.query(
      `SELECT account_number FROM customers WHERE deleted_at IS NULL`
    );
    const existingCustomers = new Set(existingCustResult.rows.map(r => r.account_number));

    const existingRecResult = await client.query(
      `SELECT record_number FROM records WHERE deleted_at IS NULL`
    );
    const existingRecords = new Set(existingRecResult.rows.map(r => r.record_number));

    // ── Phase 1: Import Customers ────────────────────────────────────────
    console.log('\n── Phase 1: Importing Customers ──');

    // Deduplicate by CUST ID, take first occurrence
    const customerMap = {}; // CUST ID → row data
    for (const row of woHeaders) {
      const custId = clean(row['CUST ID']);
      if (!custId) continue;
      if (!customerMap[custId]) {
        customerMap[custId] = row;
      }
    }

    // custId → db id mapping
    const custIdToDbId = {};

    for (const [custId, row] of Object.entries(customerMap)) {
      if (existingCustomers.has(custId)) {
        console.log(`  SKIP customer ${custId} (already exists)`);
        counts.customers.skipped++;
        // Still need to look up the DB id for record/unit import
        if (isLive) {
          const r = await client.query(
            `SELECT id FROM customers WHERE account_number = $1 AND deleted_at IS NULL`,
            [custId]
          );
          if (r.rows[0]) custIdToDbId[custId] = r.rows[0].id;
        }
        continue;
      }

      const lastName = clean(row['LAST']);
      if (!lastName) {
        logError('Customer', custId, 'Missing LAST name');
        counts.customers.errors++;
        continue;
      }

      // Handle duplicate EMAIL columns - Sheet2 has EMAIL at beginning and end
      // Use the first non-null email found
      const email = clean(row['EMAIL']);

      if (isLive) {
        try {
          const result = await client.query(
            `INSERT INTO customers
              (account_number, last_name, first_name, address_street, address_city,
               address_state, address_zip, phone_mobile, phone_secondary,
               email_primary, imported_from_summit)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             RETURNING id`,
            [
              custId,
              lastName,
              clean(row['FIRST']),
              clean(row['ADDRESS']),
              clean(row['CITY']),
              clean(row['STATE']),
              clean(row['ZIP']),
              clean(row['PHONE 1']),
              clean(row['PHONE 2']),
              email,
            ]
          );
          custIdToDbId[custId] = result.rows[0].id;
          console.log(`  IMPORTED customer ${custId}: ${clean(row['FIRST']) || ''} ${lastName}`);
          counts.customers.imported++;
        } catch (err) {
          logError('Customer', custId, err.message);
          counts.customers.errors++;
        }
      } else {
        custIdToDbId[custId] = -1; // placeholder
        console.log(`  [DRY RUN] Would import customer ${custId}: ${clean(row['FIRST']) || ''} ${lastName}`);
        counts.customers.imported++;
      }
    }

    // ── Phase 2: Import Units ────────────────────────────────────────────
    console.log('\n── Phase 2: Importing Units ──');

    // Deduplicate by CUST ID + VIN (blank VINs each get their own record)
    // Track: custId+vin → db unit id
    const unitKey = (custId, vin) => vin ? `${custId}::${vin}` : null;
    const unitKeyToDbId = {};
    // For WOs with blank VIN, map WO → unit id
    const woToUnitId = {};

    // First pass: collect unique units
    const uniqueUnits = []; // { custId, row, woNum }
    const seenUnitKeys = new Set();

    for (const row of woHeaders) {
      const custId = clean(row['CUST ID']);
      const vin = clean(row['VIN']);
      const woNum = clean(row['W.O.']);

      if (!custId || !custIdToDbId[custId]) continue;

      const key = unitKey(custId, vin);
      if (key && seenUnitKeys.has(key)) {
        // Already have this unit, just record the WO mapping
        continue;
      }
      if (key) seenUnitKeys.add(key);
      uniqueUnits.push({ custId, row, woNum, vin, key });
    }

    for (const { custId, row, woNum, vin, key } of uniqueUnits) {
      const customerId = custIdToDbId[custId];

      if (isLive) {
        try {
          const result = await client.query(
            `INSERT INTO units
              (customer_id, year, make, model, vin, license_plate, imported_from_summit)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING id`,
            [
              customerId,
              cleanNum(row['YEAR']),
              clean(row['MAKE']),
              clean(row['MODEL']),
              vin,
              clean(row['LICENSE']),
            ]
          );
          const unitId = result.rows[0].id;
          if (key) unitKeyToDbId[key] = unitId;
          woToUnitId[woNum] = unitId;
          console.log(`  IMPORTED unit for customer ${custId}: ${clean(row['YEAR']) || ''} ${clean(row['MAKE']) || ''} ${clean(row['MODEL']) || ''}`);
          counts.units.imported++;
        } catch (err) {
          logError('Unit', `WO ${woNum}`, err.message);
          counts.units.errors++;
        }
      } else {
        const unitId = -1;
        if (key) unitKeyToDbId[key] = unitId;
        woToUnitId[woNum] = unitId;
        console.log(`  [DRY RUN] Would import unit for customer ${custId}: ${clean(row['YEAR']) || ''} ${clean(row['MAKE']) || ''} ${clean(row['MODEL']) || ''}`);
        counts.units.imported++;
      }
    }

    // Second pass: map all WOs to their unit IDs (for deduped units)
    for (const row of woHeaders) {
      const woNum = clean(row['W.O.']);
      if (woToUnitId[woNum]) continue; // already mapped

      const custId = clean(row['CUST ID']);
      const vin = clean(row['VIN']);
      const key = unitKey(custId, vin);
      if (key && unitKeyToDbId[key]) {
        woToUnitId[woNum] = unitKeyToDbId[key];
      }
    }

    // ── Phase 3: Import Records ──────────────────────────────────────────
    console.log('\n── Phase 3: Importing Records ──');

    const recordNumToDbId = {};

    for (const row of woHeaders) {
      const woNum = clean(row['W.O.']);
      if (!woNum) continue;

      const recordNumber = parseInt(woNum, 10);
      if (isNaN(recordNumber)) {
        logError('Record', woNum, 'Invalid W.O. number');
        counts.records.errors++;
        continue;
      }

      if (existingRecords.has(recordNumber)) {
        console.log(`  SKIP record ${recordNumber} (already exists)`);
        counts.records.skipped++;
        continue;
      }

      const custId = clean(row['CUST ID']);
      const customerId = custIdToDbId[custId];
      const unitId = woToUnitId[woNum];

      if (!customerId) {
        logError('Record', woNum, `No customer found for CUST ID ${custId}`);
        counts.records.errors++;
        continue;
      }
      if (!unitId) {
        logError('Record', woNum, `No unit found for WO ${woNum}`);
        counts.records.errors++;
        continue;
      }

      const createdAt = parseExcelDate(row['DATE']);
      const completionDate = parseExcelDate(row['COMPLETION DATE']);
      const insuranceCompany = clean(row['INSURANCE']);
      const claimNumber = clean(row['CLAIM NO.']);
      const isInsurance = !!(insuranceCompany || claimNumber);
      const laborSubtotal = cleanNum(row['LABOR']) || 0;
      const partsSubtotal = cleanNum(row['PART']) || 0;
      const taxAmount = cleanNum(row['TAX']) || 0;
      const shopSupplies = cleanNum(row['SHOP SUPPLIES']) || 0;
      const totalSales = cleanNum(row['TOTAL']) || 0;
      const discount = cleanNum(row['DISCOUNT']) || 0;
      const mileage = cleanNum(row['MILEAGE']);

      if (isLive) {
        try {
          const result = await client.query(
            `INSERT INTO records
              (record_number, customer_id, unit_id, status, created_at,
               actual_completion_date, is_insurance_job, insurance_company,
               claim_number, labor_subtotal, parts_subtotal, tax_amount,
               shop_supplies_amount, total_sales, total_collected, amount_due,
               mileage_at_intake, no_charge_amount, quickbooks_synced_at,
               imported_from_summit)
             VALUES ($1, $2, $3, 'paid', COALESCE($4::timestamptz, NOW()),
                     $5, $6, $7, $8, $9, $10, $11, $12, $13,
                     $13, 0, $14, $15, NULL, true)
             RETURNING id`,
            [
              recordNumber,        // $1
              customerId,          // $2
              unitId,              // $3
              createdAt,           // $4
              completionDate,      // $5
              isInsurance,         // $6
              insuranceCompany,    // $7
              claimNumber,         // $8
              laborSubtotal,       // $9
              partsSubtotal,       // $10
              taxAmount,           // $11
              shopSupplies,        // $12
              totalSales,          // $13 (total_sales AND total_collected)
              mileage,             // $14
              discount,            // $15 → no_charge_amount
            ]
          );
          recordNumToDbId[woNum] = result.rows[0].id;
          console.log(`  IMPORTED record ${recordNumber}`);
          counts.records.imported++;
        } catch (err) {
          logError('Record', recordNumber, err.message);
          counts.records.errors++;
        }
      } else {
        recordNumToDbId[woNum] = -1;
        console.log(`  [DRY RUN] Would import record ${recordNumber} (total=$${totalSales})`);
        counts.records.imported++;
      }
    }

    // ── Phase 4: Import Labor Lines ──────────────────────────────────────
    console.log('\n── Phase 4: Importing Labor Lines ──');

    for (const row of lineItems) {
      const wo = clean(row['W.O.']);
      const type = clean(row['TYPE']);
      if (!wo || !type || type.toUpperCase() !== 'LABOR') continue;

      const recordId = recordNumToDbId[wo];
      if (!recordId) {
        // Record was skipped or errored — skip line
        counts.labor.skipped++;
        continue;
      }

      const description = clean(row['DESCRIPTION']) || 'Labor';
      const hours = cleanNum(row['QTY']) || 0;
      const rate = cleanNum(row['COST']) || 0;
      const lineTotal = cleanNum(row['TOTAL']) || 0;
      const techName = clean(row['TECHNICIAN']);

      // Try to match technician
      let techId = summitTechId;
      let descWithTech = description;
      if (techName) {
        const matchedId = techMap[techName.toLowerCase()];
        if (matchedId) {
          techId = matchedId;
        } else {
          // Append technician name to description
          descWithTech = `${description} [Tech: ${techName}]`;
        }
      }

      if (isLive) {
        try {
          await client.query(
            `INSERT INTO record_labor_lines
              (record_id, technician_id, description, hours, rate, line_total)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [recordId, techId, descWithTech, hours, rate, lineTotal]
          );
          counts.labor.imported++;
        } catch (err) {
          logError('Labor', `WO ${wo}`, err.message);
          counts.labor.errors++;
        }
      } else {
        console.log(`  [DRY RUN] Would import labor line for WO ${wo}: ${descWithTech.substring(0, 50)}...`);
        counts.labor.imported++;
      }
    }

    // ── Phase 5: Import Parts Lines ──────────────────────────────────────
    console.log('\n── Phase 5: Importing Parts Lines ──');

    for (const row of lineItems) {
      const wo = clean(row['W.O.']);
      const type = clean(row['TYPE']);
      if (!wo || !type || type.toUpperCase() !== 'PART') continue;

      const recordId = recordNumToDbId[wo];
      if (!recordId) {
        counts.parts.skipped++;
        continue;
      }

      const partNumber = clean(row['PART NO.']);
      const vendor = clean(row['VENDOR']);
      const manufacturer = clean(row['MANUFACTURER']);
      const rawDescription = clean(row['DESCRIPTION']) || 'Part';
      const quantity = cleanNum(row['QTY']) || 1;
      const costEach = cleanNum(row['COST']) || 0;
      const lineTotal = cleanNum(row['TOTAL']) || 0;

      // Build description with manufacturer prefix and vendor note
      let description = rawDescription;
      if (manufacturer) {
        description = `[${manufacturer}] ${description}`;
      }
      // If vendor doesn't match enum, add to description
      const matchedVendor = matchVendor(vendor);
      if (vendor && !matchedVendor) {
        description = `${description} (Vendor: ${vendor})`;
      }

      // sale_price_each: derive from total/qty
      const salePriceEach = quantity > 0 ? parseFloat((lineTotal / quantity).toFixed(2)) : costEach;

      if (isLive) {
        try {
          await client.query(
            `INSERT INTO record_parts_lines
              (record_id, is_inventory_part, part_number, description,
               quantity, cost_each, sale_price_each, line_total, taxable)
             VALUES ($1, false, $2, $3, $4, $5, $6, $7, true)`,
            [recordId, partNumber, description, quantity, costEach, salePriceEach, lineTotal]
          );
          counts.parts.imported++;
        } catch (err) {
          logError('Part', `WO ${wo}`, err.message);
          counts.parts.errors++;
        }
      } else {
        console.log(`  [DRY RUN] Would import part line for WO ${wo}: ${description.substring(0, 50)}...`);
        counts.parts.imported++;
      }
    }

    // ── Commit or Rollback ───────────────────────────────────────────────
    if (isLive) {
      await client.query('COMMIT');
      console.log('\n✓ Transaction committed.');
    } else {
      console.log('\n[DRY RUN] No changes were made to the database.');
    }

  } catch (err) {
    if (isLive) {
      await client.query('ROLLBACK');
      console.error('\n✗ Transaction rolled back due to error.');
    }
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    client.release();
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  MIGRATION SUMMARY');
  console.log('========================================');
  console.log(`  Customers:    ${counts.customers.imported} imported, ${counts.customers.skipped} skipped, ${counts.customers.errors} errors`);
  console.log(`  Units:        ${counts.units.imported} imported, ${counts.units.skipped} skipped, ${counts.units.errors} errors`);
  console.log(`  Records:      ${counts.records.imported} imported, ${counts.records.skipped} skipped, ${counts.records.errors} errors`);
  console.log(`  Labor Lines:  ${counts.labor.imported} imported, ${counts.labor.skipped} skipped, ${counts.labor.errors} errors`);
  console.log(`  Parts Lines:  ${counts.parts.imported} imported, ${counts.parts.skipped} skipped, ${counts.parts.errors} errors`);
  console.log('========================================');

  if (errors.length > 0) {
    console.log(`\n  ${errors.length} total errors (see above for details)`);
  }

  console.log(`\n  Mode: ${isLive ? '*** LIVE — changes committed ***' : 'DRY RUN — no changes made'}`);
  if (!isLive) {
    console.log('  Run with --live flag to actually import.');
  }
  console.log('');

  await pool.end();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
