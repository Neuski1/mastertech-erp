/**
 * Storage Contract PDF Generator
 * Generates the MTRV Storage Lease Agreement as a 2-page PDF using PDFKit
 */
const PDFDocument = require('pdfkit');

/**
 * Calculate prorated amount for mid-month start
 * @param {number} monthlyRate - Full monthly rate
 * @param {string} startDateStr - Start date string (e.g. "2026-04-15")
 * @returns {string} prorated dollar amount or empty string
 */
function calcProrated(monthlyRate, startDateStr) {
  if (!monthlyRate || !startDateStr) return '';
  const start = new Date(startDateStr);
  const day = start.getDate();
  if (day <= 1) return ''; // starts on the 1st, no proration
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - day + 1;
  const prorated = (monthlyRate / daysInMonth) * remainingDays;
  return prorated.toFixed(2);
}

/**
 * Generate a storage lease agreement PDF (2 pages)
 * @param {Object} data - Contract data
 * @returns {Promise<Buffer>} PDF buffer
 */
function generateContractPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 60, left: 65, right: 65 } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const w = 482; // content width (8.5" - 1.3" margins)
    const lineGap = 4;

    // ========== PAGE 1 ==========

    // --- Header ---
    doc.fontSize(18).font('Helvetica-Bold').text('MT RV REPAIR & STORAGE', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').text('6590 E. 49th Ave.', { align: 'center' });
    doc.text('Commerce City, CO  80022', { align: 'center' });
    doc.moveDown(1);

    // --- Title ---
    doc.fontSize(15).font('Helvetica-Bold').text('RV STORAGE LEASE AGREEMENT', { align: 'center' });
    doc.moveDown(1.2);

    // --- Lease intro ---
    const leaseDate = data.lease_date || '_______________';
    const lesseeName = data.lessee_name || '________________________________';
    doc.fontSize(10.5).font('Helvetica');
    doc.text(
      `This lease dated ${leaseDate}, is between Master Tech RV Repair & Storage, (hereafter referred to as \u201CLessor\u201D), and the undersigned ${lesseeName} (hereinafter referred to as \u201CLessee\u201D).  Lessor agrees to lease storage space to Lessee at the address above for:`,
      { width: w, lineGap }
    );
    doc.moveDown(0.8);

    // --- RV Info ---
    const rvInfo = [data.rv_year, data.rv_make, data.rv_model].filter(Boolean).join(' ') || '_________________________________';
    doc.font('Helvetica-Bold').text('RV Year, Make, Model: ', { continued: true });
    doc.font('Helvetica').text(rvInfo);
    doc.text('(also known as \u201CUnit\u201D) at a rate of:');
    doc.moveDown(0.8);

    // --- Storage Type (show only the selected type) ---
    const isIndoor = data.space_type === 'indoor';
    const perFootRate = isIndoor ? (data.indoor_rate || '22.00') : (data.outdoor_rate || '6.00');
    const storageLabel = isIndoor ? 'Indoor Storage' : 'Outdoor Storage';
    doc.font('Helvetica-Bold').fontSize(10.5).text(`${storageLabel}:  `, { continued: true });
    doc.font('Helvetica').text(`$${perFootRate} per linear foot`);
    doc.moveDown(0.8);

    // --- RV Length / License / VIN ---
    const rvLength = data.rv_length_feet || '________________';
    doc.font('Helvetica-Bold').text('RV LENGTH TOE to TOE:  ', { continued: true });
    doc.font('Helvetica').text(rvLength);
    doc.moveDown(0.3);
    const licensePlate = data.license_plate || '________________________';
    const vin = data.vin || '___________________________________';
    doc.font('Helvetica-Bold').text('RV LICENSE PLATE #:  ', { continued: true });
    doc.font('Helvetica').text(`${licensePlate}          `, { continued: true });
    doc.font('Helvetica-Bold').text('RV VIN #:  ', { continued: true });
    doc.font('Helvetica').text(vin);
    doc.moveDown(1);

    // --- Term & Monthly Amount ---
    const startDate = data.start_date || '_______________';
    const endDate = data.end_date || 'Open';
    doc.fontSize(10.5).text(
      `The term of this lease commences ${startDate} until ${endDate}, payable in advance of the period and without notice:`,
      { width: w, lineGap }
    );
    doc.moveDown(0.5);

    const monthlyAmount = data.monthly_amount || '____________';
    doc.text(`    Monthly  $${monthlyAmount}  on the 1st day for each calendar month during the term of this lease.`);
    doc.moveDown(0.5);

    // --- Prorated Amount ---
    const proratedAmount = data.prorated_amount || calcProrated(parseFloat(data.monthly_amount), data.start_date_raw) || '____________';
    doc.font('Helvetica-Bold').text(`*Prorated amount to be collected for current month:  $${proratedAmount}`);
    doc.moveDown(0.8);

    doc.font('Helvetica').text(
      'The contract is automatically renewed at the end of the rental period unless Lessee has made it known to Lessor, with 30 days written notice, that they no longer wish to store said unit and no monies are due.',
      { width: w, lineGap }
    );
    doc.moveDown(1);

    // --- Terms / Conditions ---
    doc.font('Helvetica-Bold').fontSize(11).text('By signing below, you have read and agree to the terms of this agreement:');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10.5);

    const terms = [
      'Pay the rent for the above-described Unit as it becomes due, in advance of the period without notice.',
      'No subletting of the space or assignment of this lease under any circumstances.',
      'RV insurance on your unit being stored is required. Understand that your property is covered by your insurance only and Lessor has no financial liability to Lessee.',
      'Lessee will not hold the Lessor responsible for any damage to the property for any reason.',
      'Lessee will not be able to use the unit during any period that rent is past due.',
    ];
    terms.forEach(t => {
      doc.text(`\u2022  ${t}`, { width: w, lineGap: 3, indent: 15 });
      doc.moveDown(0.4);
    });


    // ========== PAGE 2 ==========
    doc.addPage();

    // --- Payment Options (prominent section) ---
    doc.fontSize(13).font('Helvetica-Bold').text('Payment Options', { underline: true });
    doc.moveDown(0.8);

    // Autopay
    doc.fontSize(11).font('Helvetica-Bold').text('Autopay');
    doc.moveDown(0.3);
    doc.fontSize(10.5).font('Helvetica').text(
      'Autopay payments are processed via Square and are subject to a 3.5% credit card processing fee. An invoice will be generated on the last day of each month for the following month\u2019s storage fees. Upon making your first payment through Square, you will have the option to securely store your credit card on file for future automatic payments.',
      { width: w, lineGap }
    );
    doc.moveDown(0.8);

    // Check, Cash, Zelle
    doc.fontSize(11).font('Helvetica-Bold').text('Check, Cash, or Zelle');
    doc.moveDown(0.3);
    doc.fontSize(10.5).font('Helvetica').text(
      'We also accept payment by check, cash, or Zelle \u2014 all with no additional processing fee. Payments may be mailed or dropped off at our facility. For Zelle transfers, please send payment to carol@mastertechrvrepair.com.',
      { width: w, lineGap }
    );
    doc.moveDown(1.2);

    // --- Late Payment Penalty ---
    doc.fontSize(13).font('Helvetica-Bold').text('Late Payment Penalty', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10.5).font('Helvetica');
    doc.text('After 5 days late \u2014 $25 late fee', { lineGap: 3 });
    doc.text('After 10 days late \u2014 an additional $50 fee', { lineGap: 3 });
    doc.text('After 14 days late \u2014 $20/day charge up to 30 days late', { lineGap: 3 });
    doc.moveDown(0.6);
    doc.text(
      'If there has been no payment made for a 30-day period from the due date, Lessor is authorized to take possession of and sell said property for the purpose of reimbursement of all unpaid expenses.',
      { width: w, lineGap }
    );
    doc.moveDown(0.5);
    doc.text(
      'Lessor reserves the right to cancel this contract at any time the rent is past due, or Lessee violates any of the terms and conditions of the agreement or any provision of Colorado Law.',
      { width: w, lineGap }
    );
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('Lessee acknowledges that they have received a copy of the Storage Guidelines.');
    doc.moveDown(1.5);

    // --- EXECUTION ---
    // Draw a line
    doc.moveTo(65, doc.y).lineTo(547, doc.y).lineWidth(1).stroke();
    doc.moveDown(0.6);

    doc.fontSize(13).font('Helvetica-Bold').text('EXECUTION');
    doc.moveDown(0.8);
    doc.fontSize(10.5).font('Helvetica');

    const lesseeFillName = data.lessee_name || '___________________________________';
    const lesseeFillDate = data.lease_date || '_______________';
    const lesseePhone = data.lessee_phone || '________________________';
    const lesseeEmail = data.lessee_email || '________________________________';

    const lesseeDate = data.accepted_at ? new Date(data.accepted_at).toLocaleDateString('en-US') : lesseeFillDate;
    doc.font('Helvetica-Bold').text('Lessee Name:  ', { continued: true });
    doc.font('Helvetica').text(`${lesseeFillName}`, { continued: true });
    doc.text(`              Date: ${lesseeDate}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Cell Phone:  ', { continued: true });
    doc.font('Helvetica').text(`${lesseePhone}`, { continued: true });
    doc.text(`         Email: ${lesseeEmail}`);
    doc.moveDown(1);

    if (data.accepted_at) {
      // Digital acceptance stamp
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#065f46')
        .text(`\u2705  DIGITALLY ACCEPTED on ${data.accepted_at}`, { width: w });
      if (data.accepted_ip) {
        doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
          .text(`IP Address: ${data.accepted_ip}`);
      }
      doc.fillColor('#000000').fontSize(10.5);
      doc.moveDown(0.5);
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#374151')
        .text('Signer has digitally agreed to all rules and contract agreement, payment terms and conditions.');
      doc.fillColor('#000000').fontSize(10.5).font('Helvetica');
    } else {
      doc.text('Signature: ___________________________________________________');
      doc.moveDown(0.3);
      doc.font('Helvetica-Oblique').fontSize(9)
        .text('Signer agrees to all rules and contract agreement, payment terms and conditions');
      doc.font('Helvetica').fontSize(10.5);
    }
    doc.moveDown(1.5);

    // Lessor signature — preprinted
    doc.font('Helvetica-Bold').text('Lessor Signature:  ', { continued: true });
    doc.font('Helvetica-Oblique').fontSize(16).text('Carol Martinez', { continued: true });
    doc.font('Helvetica').fontSize(10.5).text(`         Date: ${data.lease_date || new Date().toLocaleDateString('en-US')}`);
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#6b7280').text('Owner, Master Tech RV Repair & Storage');
    doc.fillColor('#000000').fontSize(10.5);
    doc.moveDown(0.8);
    doc.text('Lessor Contact Info:');
    doc.text('Phone: (303) 557-2214');
    doc.text('Email: Carol@mastertechrvrepair.com');

    doc.end();
  });
}

/**
 * Build the storage guidelines HTML for email
 */
function getGuidelinesHTML() {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1e3a5f;padding:20px 32px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:18px;">MTRV REPAIR & STORAGE</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:11px;">6590 E. 49th Ave. &bull; Commerce City, CO 80022 &bull; (303) 557-2214</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
    <h2 style="color:#1e3a5f;margin:0 0 20px;font-size:18px;text-align:center;text-transform:uppercase;">Storage Guidelines</h2>

    <p style="color:#dc2626;font-weight:bold;margin:0 0 16px;">**APPOINTMENT ONLY SATURDAY, CLOSED SUNDAY AND MAJOR HOLIDAYS!</p>

    <ul style="color:#374151;font-size:14px;line-height:1.8;padding-left:20px;">
      <li>When requesting your unit to be pulled out, give us at least <strong>2 hours notice</strong> by call or text between the hours of <strong>9AM &ndash; 6PM Monday thru Friday</strong>.</li>
      <li>If you want your unit on <strong>Saturday</strong>, call or text us before <strong>4PM on Friday</strong>.</li>
      <li>When you drop off your storage unit, it must be dropped off at least <strong>30 minutes before we close</strong> so we have time to put it away.</li>
      <li>If you want to drop off your RV on <strong>Sunday</strong>, please let us know and park it in front of our building and drop the keys in the mail slot. We will attempt to move it into the facility that day or first thing Monday morning.</li>
      <li>Please advise if you will be leaving a vehicle when picking up a unit.</li>
      <li><strong>YOU MUST</strong> let us know when you leave permanently, or you will continue to be billed. We don&rsquo;t issue refunds for partial months.</li>
      <li>We offer <strong>Auto-Pay</strong> for storage payments. If you don&rsquo;t want to set up Auto-Pay, payment is due in advance of the period and without notice.</li>
      <li>We send invoices and receipts by email unless otherwise requested.</li>
    </ul>

    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;">
      <p style="margin:0;color:#374151;font-weight:bold;">(303) 557-2214</p>
      <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
    </div>
  </div>
</div>`;
}

module.exports = { generateContractPDF, getGuidelinesHTML, calcProrated };
