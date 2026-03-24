/**
 * One-time migration: backfill phone data from Summit export (customer history detail.xlsx)
 *
 * Reads CUST ID (col K), PHONE 1 (col H), PHONE 2 (col I)
 * Formats phone integers as XXX-XXX-XXXX
 * Updates customers by account_number match
 * Only updates phone_primary if currently NULL/empty
 * Always overwrites phone_secondary if source has a value
 */
const XLSX = require('xlsx');
const path = require('path');
const pool = require('../db/pool');

function formatPhone(raw) {
  if (!raw && raw !== 0) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Return as-is if not standard 10-digit
  return digits.length > 0 ? digits : null;
}

async function run() {
  const filePath = path.resolve(__dirname, '..', '..', '..', 'customer history detail.xlsx');
  console.log('Reading:', filePath);

  const workbook = XLSX.readFile(filePath);
  // Sheet2 has customer data with PHONE 1 (col H=7), PHONE 2 (col I=8), CUST ID (col K=10)
  const sheet = workbook.Sheets['Sheet2'] || workbook.Sheets[workbook.SheetNames[1]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find header row to identify columns
  // Expected: Col H = PHONE 1, Col I = PHONE 2, Col K = CUST ID
  // Using 0-indexed: H=7, I=8, K=10
  console.log('Header row:', rows[0]);

  // Collect unique CUST ID → first non-null phone values
  const customerPhones = new Map(); // account_number → { phone1, phone2 }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const custId = row[10]; // Column K (0-indexed = 10)
    const phone1Raw = row[7]; // Column H
    const phone2Raw = row[8]; // Column I

    if (!custId) continue;

    const acctNum = String(custId).trim();
    if (!customerPhones.has(acctNum)) {
      customerPhones.set(acctNum, { phone1: null, phone2: null });
    }

    const entry = customerPhones.get(acctNum);
    const p1 = formatPhone(phone1Raw);
    const p2 = formatPhone(phone2Raw);

    // Use first non-null value per customer
    if (!entry.phone1 && p1) entry.phone1 = p1;
    if (!entry.phone2 && p2) entry.phone2 = p2;
  }

  console.log(`Found ${customerPhones.size} unique customers with phone data`);

  let updated = 0;
  let skipped = 0;

  for (const [acctNum, phones] of customerPhones) {
    if (!phones.phone1 && !phones.phone2) { skipped++; continue; }

    const updates = [];
    const values = [];
    let idx = 1;

    // Only update phone_primary if currently NULL or empty
    if (phones.phone1) {
      updates.push(`phone_primary = CASE WHEN phone_primary IS NULL OR phone_primary = '' THEN $${idx++} ELSE phone_primary END`);
      values.push(phones.phone1);
    }

    // Always update phone_secondary if source has a value
    if (phones.phone2) {
      updates.push(`phone_secondary = $${idx++}`);
      values.push(phones.phone2);
    }

    if (updates.length === 0) { skipped++; continue; }

    values.push(acctNum);

    try {
      const result = await pool.query(
        `UPDATE customers SET ${updates.join(', ')} WHERE account_number = $${idx}`,
        values
      );
      if (result.rowCount > 0) {
        updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`Error updating account ${acctNum}:`, err.message);
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
