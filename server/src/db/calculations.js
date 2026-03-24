const pool = require('./pool');

async function getSetting(key) {
  const { rows } = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key = $1',
    [key]
  );
  return rows[0] ? parseFloat(rows[0].setting_value) : null;
}

async function recalculateTotals(recordId, client) {
  const db = client || pool;

  const laborRes = await db.query(
    `SELECT COALESCE(SUM(line_total), 0) AS labor_subtotal,
            COALESCE(SUM(hours), 0) AS total_hours
     FROM record_labor_lines
     WHERE record_id = $1 AND deleted_at IS NULL`,
    [recordId]
  );
  const laborSubtotal = parseFloat(laborRes.rows[0].labor_subtotal);
  const totalHours = parseFloat(laborRes.rows[0].total_hours);

  const partsRes = await db.query(
    `SELECT COALESCE(SUM(line_total), 0) AS parts_subtotal
     FROM record_parts_lines
     WHERE record_id = $1 AND deleted_at IS NULL`,
    [recordId]
  );
  const partsSubtotal = parseFloat(partsRes.rows[0].parts_subtotal);

  const freightRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS freight_subtotal
     FROM record_freight_lines
     WHERE record_id = $1 AND deleted_at IS NULL`,
    [recordId]
  );
  const freightSubtotal = parseFloat(freightRes.rows[0].freight_subtotal);

  const recRes = await db.query(
    `SELECT r.shop_supplies_exempt, r.cc_fee_applied, r.tax_rate,
            r.under_warranty_amount, r.no_charge_amount, r.deposit_amount,
            r.tax_waived,
            c.tax_exempt
     FROM records r
     JOIN customers c ON c.id = r.customer_id
     WHERE r.id = $1`,
    [recordId]
  );
  const rec = recRes.rows[0];
  const underWarranty = parseFloat(rec.under_warranty_amount) || 0;
  const noCharge = parseFloat(rec.no_charge_amount) || 0;

  const shopSuppliesRate = await getSetting('shop_supplies_rate');
  const shopSuppliesAmount = rec.shop_supplies_exempt
    ? 0
    : parseFloat((laborSubtotal * shopSuppliesRate).toFixed(2));

  const ccFeeRate = await getSetting('cc_fee_rate');
  const ccFeeAmount = rec.cc_fee_applied
    ? parseFloat(((laborSubtotal + partsSubtotal + freightSubtotal + shopSuppliesAmount) * ccFeeRate).toFixed(2))
    : 0;

  const subtotalOthers = parseFloat((shopSuppliesAmount + ccFeeAmount).toFixed(2));

  let taxAmount = 0;
  if (!rec.tax_exempt && !rec.tax_waived) {
    const taxRes = await db.query(
      `SELECT COALESCE(SUM(line_total), 0) AS taxable_total
       FROM record_parts_lines
       WHERE record_id = $1 AND deleted_at IS NULL AND taxable = TRUE`,
      [recordId]
    );
    const taxableTotal = parseFloat(taxRes.rows[0].taxable_total);
    taxAmount = parseFloat((taxableTotal * parseFloat(rec.tax_rate)).toFixed(2));
  }

  const totalSales = parseFloat(
    (laborSubtotal + partsSubtotal + freightSubtotal + subtotalOthers + taxAmount).toFixed(2)
  );

  const payRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_collected
     FROM payments
     WHERE record_id = $1 AND deleted_at IS NULL`,
    [recordId]
  );
  const totalCollected = parseFloat(payRes.rows[0].total_collected);
  const amountDue = parseFloat(
    (totalSales - underWarranty - noCharge - totalCollected).toFixed(2)
  );

  await db.query(
    `UPDATE records SET
       labor_subtotal = $2, total_hours = $3,
       shop_supplies_amount = $4, parts_subtotal = $5,
       tax_amount = $6, cc_fee_amount = $7, subtotal_others = $8,
       total_sales = $9, total_collected = $10, amount_due = $11,
       freight_subtotal = $12
     WHERE id = $1`,
    [recordId, laborSubtotal, totalHours, shopSuppliesAmount,
     partsSubtotal, taxAmount, ccFeeAmount, subtotalOthers,
     totalSales, totalCollected, amountDue, freightSubtotal]
  );

  return { laborSubtotal, totalHours, shopSuppliesAmount, partsSubtotal,
           freightSubtotal, taxAmount, ccFeeAmount, subtotalOthers, totalSales,
           totalCollected, amountDue };
}

module.exports = { getSetting, recalculateTotals };
