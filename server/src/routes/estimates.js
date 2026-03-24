const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { requireRole } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// POST /api/estimates/:id/sign — Customer sign-off on estimate
// Accepts drawn signature, generates PDF, saves to OneDrive, auto-approves
// ---------------------------------------------------------------------------
router.post('/:id/sign', requireRole('admin', 'service_writer'), async (req, res) => {
  const { signature_data } = req.body;

  if (!signature_data) {
    return res.status(400).json({ error: 'signature_data is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch full record with customer and unit info
    const { rows } = await client.query(
      `SELECT r.*,
              c.first_name, c.last_name, c.company_name, c.account_number,
              c.phone_primary, c.email_primary,
              c.address_street, c.address_city, c.address_state, c.address_zip,
              u.year, u.make, u.model, u.vin, u.license_plate
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       JOIN units u ON u.id = r.unit_id
       WHERE r.id = $1 AND r.deleted_at IS NULL
       FOR UPDATE OF r`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const record = rows[0];

    // Must be in estimate status to sign
    if (record.status !== 'estimate') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Record must be in 'estimate' status to sign. Current: '${record.status}'` });
    }

    // Fetch labor and parts lines for the PDF
    const [laborRes, partsRes] = await Promise.all([
      client.query(
        `SELECT ll.*, t.name AS technician_name
         FROM record_labor_lines ll
         JOIN technicians t ON t.id = ll.technician_id
         WHERE ll.record_id = $1 AND ll.deleted_at IS NULL
         ORDER BY ll.sort_order`,
        [req.params.id]
      ),
      client.query(
        `SELECT * FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL
         ORDER BY sort_order`,
        [req.params.id]
      ),
    ]);

    const now = new Date();

    // Save signature and advance status to approved
    const extraUpdates = [];
    const extraValues = [req.params.id];
    let idx = 2;

    extraUpdates.push(`authorization_signature = $${idx++}`);
    extraValues.push(signature_data);

    extraUpdates.push(`authorization_signed_at = $${idx++}`);
    extraValues.push(now.toISOString());

    extraUpdates.push(`status = $${idx++}`);
    extraValues.push('approved');

    // Auto-stamp intake_date if not set
    if (!record.intake_date) {
      extraUpdates.push(`intake_date = $${idx++}`);
      extraValues.push(now.toISOString().split('T')[0]);
    }

    await client.query(
      `UPDATE records SET ${extraUpdates.join(', ')} WHERE id = $1`,
      extraValues
    );

    // Recalculate totals
    await recalculateTotals(req.params.id, client);

    // Generate PDF
    const pdfPath = await generateEstimatePdf(record, laborRes.rows, partsRes.rows, signature_data, now);

    await client.query('COMMIT');

    res.json({
      message: 'Estimate signed and approved',
      pdf_path: pdfPath,
      authorization_signed_at: now.toISOString(),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/estimates/:id/sign error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// Generate Estimate PDF and save to OneDrive
// ---------------------------------------------------------------------------
async function generateEstimatePdf(record, laborLines, partsLines, signatureData, signedAt) {
  // Determine save directory — OneDrive Desktop > MasterTech Estimates
  const oneDrivePath = path.join(
    process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\servi',
    'OneDrive', 'Desktop', 'MasterTech Estimates'
  );

  // Ensure directory exists
  if (!fs.existsSync(oneDrivePath)) {
    fs.mkdirSync(oneDrivePath, { recursive: true });
  }

  const customerName = [record.last_name, record.first_name].filter(Boolean).join(', ');
  const safeCustomerName = customerName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
  const dateStr = signedAt.toISOString().split('T')[0];
  const fileName = `Estimate_${record.record_number}_${safeCustomerName}_${dateStr}.pdf`;
  const filePath = path.join(oneDrivePath, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MASTER TECH RV', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Service Estimate & Authorization', { align: 'center' });
    doc.moveDown(1.5);

    // Record info
    doc.fontSize(10).font('Helvetica-Bold').text(`Estimate #${record.record_number}`, { continued: true });
    doc.font('Helvetica').text(`    Date: ${dateStr}`, { align: 'right' });
    doc.moveDown(0.5);

    // Divider
    drawDivider(doc);

    // Customer info
    doc.fontSize(10).font('Helvetica-Bold').text('Customer Information');
    doc.fontSize(9).font('Helvetica');
    doc.text(`Name: ${customerName}${record.company_name ? '  (' + record.company_name + ')' : ''}`);
    if (record.account_number) doc.text(`Account #: ${record.account_number}`);
    if (record.phone_primary) doc.text(`Phone: ${record.phone_primary}`);
    if (record.email_primary) doc.text(`Email: ${record.email_primary}`);
    const address = [record.address_street, record.address_city, record.address_state, record.address_zip].filter(Boolean).join(', ');
    if (address) doc.text(`Address: ${address}`);
    doc.moveDown(0.5);

    // Unit info
    doc.fontSize(10).font('Helvetica-Bold').text('Unit Information');
    doc.fontSize(9).font('Helvetica');
    const unitDesc = [record.year, record.make, record.model].filter(Boolean).join(' ');
    doc.text(`Unit: ${unitDesc}`);
    if (record.vin) doc.text(`VIN: ${record.vin}`);
    if (record.license_plate) doc.text(`License Plate: ${record.license_plate}`);
    if (record.mileage_at_intake) doc.text(`Mileage at Intake: ${record.mileage_at_intake}`);
    doc.moveDown(0.5);

    drawDivider(doc);

    // Job Description
    if (record.job_description) {
      doc.fontSize(10).font('Helvetica-Bold').text('Job Description');
      doc.fontSize(9).font('Helvetica').text(record.job_description);
      doc.moveDown(0.5);
    }

    // Labor Lines
    if (laborLines.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('Labor');
      doc.fontSize(8).font('Helvetica');
      laborLines.forEach(line => {
        const rate = parseFloat(line.rate) || 0;
        const hours = parseFloat(line.hours) || 0;
        const total = rate * hours;
        doc.text(`  ${line.description || 'Labor'} — ${hours}h @ $${rate.toFixed(2)} = $${total.toFixed(2)}  (${line.technician_name})`);
      });
      doc.moveDown(0.5);
    }

    // Parts Lines
    if (partsLines.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('Parts');
      doc.fontSize(8).font('Helvetica');
      partsLines.forEach(line => {
        const price = parseFloat(line.unit_price) || 0;
        const qty = parseFloat(line.quantity) || 0;
        const total = price * qty;
        doc.text(`  ${line.description || 'Part'} — ${qty} x $${price.toFixed(2)} = $${total.toFixed(2)}`);
      });
      doc.moveDown(0.5);
    }

    drawDivider(doc);

    // Totals
    doc.fontSize(10).font('Helvetica-Bold').text('Estimate Totals');
    doc.fontSize(9).font('Helvetica');
    const fmt = (v) => (parseFloat(v) || 0).toFixed(2);
    doc.text(`Labor Subtotal:      $${fmt(record.labor_subtotal)}`);
    doc.text(`Parts Subtotal:      $${fmt(record.parts_subtotal)}`);
    doc.text(`Shop Supplies (5%):  $${fmt(record.shop_supplies_amount)}${record.shop_supplies_exempt ? '  (WAIVED)' : ''}`);
    doc.text(`Tax (9.75% on parts): $${fmt(record.tax_amount)}`);
    doc.font('Helvetica-Bold').text(`Estimated Total:     $${fmt(record.total_sales)}`);
    doc.moveDown(1);

    drawDivider(doc);

    // Legal authorization text
    doc.fontSize(10).font('Helvetica-Bold').text('Authorization');
    doc.moveDown(0.3);
    doc.fontSize(8).font('Helvetica');
    doc.text(
      'I hereby authorize Master Tech RV to perform the services and repairs described above on my vehicle/unit. ' +
      'I understand that the actual charges may vary from this estimate. Any additional repairs or charges beyond ' +
      'this estimate will require my further authorization before work is performed. I agree to pay for all authorized ' +
      'repairs upon completion. I understand that Master Tech RV is not responsible for loss or damage to the vehicle ' +
      'or articles left in the vehicle in the case of fire, theft, or any other cause beyond their control. ' +
      'I grant Master Tech RV permission to operate the vehicle/unit for the purposes of testing, inspection, ' +
      'and delivery at my risk. An express mechanic\'s lien is acknowledged on the above vehicle/unit to secure ' +
      'the amount of repairs thereto.',
      { align: 'justify', lineGap: 2 }
    );
    doc.moveDown(1);

    // Signature image
    if (signatureData) {
      try {
        // Remove data URL prefix if present
        const base64 = signatureData.replace(/^data:image\/png;base64,/, '');
        const sigBuffer = Buffer.from(base64, 'base64');
        doc.image(sigBuffer, doc.x, doc.y, { width: 200, height: 60 });
        doc.moveDown(4);
      } catch (sigErr) {
        console.error('Error embedding signature:', sigErr);
        doc.text('[Signature on file]');
        doc.moveDown(0.5);
      }
    }

    // Signature line
    doc.moveTo(doc.x, doc.y).lineTo(doc.x + 250, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(8).font('Helvetica').text(`Customer Signature    —    Date: ${signedAt.toLocaleDateString('en-US')} ${signedAt.toLocaleTimeString('en-US')}`);

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

function drawDivider(doc) {
  doc.moveTo(50, doc.y).lineTo(562, doc.y).lineWidth(0.5).stroke();
  doc.moveDown(0.5);
}

module.exports = router;
