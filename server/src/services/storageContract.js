/**
 * Storage Contract PDF Generator
 * Generates the MTRV Storage Lease Agreement as a PDF using PDFKit
 */
const PDFDocument = require('pdfkit');

/**
 * Generate a storage lease agreement PDF
 * @param {Object} data - Contract data
 * @returns {Promise<Buffer>} PDF buffer
 */
function generateContractPDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 60, right: 60 } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const w = 495; // content width

    // --- Header ---
    doc.fontSize(16).font('Helvetica-Bold').text('MT RV REPAIR & STORAGE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('6590 E. 49th Ave.', { align: 'center' });
    doc.text('Commerce City, CO  80022', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(14).font('Helvetica-Bold').text('RV STORAGE LEASE AGREEMENT', { align: 'center' });
    doc.moveDown(0.8);

    // --- Lease intro ---
    const leaseDate = data.lease_date || new Date().toLocaleDateString('en-US');
    const lesseeName = data.lessee_name || '________________';
    doc.fontSize(10).font('Helvetica');
    doc.text(
      `This lease dated ${leaseDate}, is between Master Tech RV Repair & Storage, (hereafter referred to as "Lessor"), and the undersigned ${lesseeName} (hereinafter referred to as "Lessee").  Lessor agrees to lease storage space to Lessee at the address above for:`,
      { width: w, lineGap: 3 }
    );
    doc.moveDown(0.5);

    // --- RV Info ---
    const rvInfo = [data.rv_year, data.rv_make, data.rv_model].filter(Boolean).join(' ') || '_________________';
    doc.font('Helvetica-Bold').text(`RV Year, Make, Model: ${rvInfo}`, { width: w });
    doc.font('Helvetica').text('(also known as "Unit") at a rate of:', { width: w });
    doc.moveDown(0.5);

    // --- SELECT ONE ---
    doc.font('Helvetica-Bold').text('SELECT ONE:');
    const indoorRate = data.indoor_rate || '22.00';
    const outdoorRate = data.outdoor_rate || '6.00';
    const isIndoor = data.space_type === 'indoor';
    const isOutdoor = data.space_type === 'outdoor';

    // Checkbox style
    doc.font('Helvetica').fontSize(10);
    const indoorCheck = isIndoor ? '☑' : '☐';
    const outdoorCheck = isOutdoor ? '☑' : '☐';
    doc.text(`${indoorCheck} $${indoorRate} per linear foot for Indoor Storage`);
    doc.text(`${outdoorCheck} $${outdoorRate} per linear foot for Outdoor Storage`);
    doc.moveDown(0.3);

    const rvLength = data.rv_length_feet || '_____________';
    const licensePlate = data.license_plate || '_________________';
    const vin = data.vin || '__________________________________';
    doc.font('Helvetica-Bold').text(`RV LENGTH TOE to TOE: ${rvLength}`);
    doc.font('Helvetica').text(`RV LICENSE PLATE #: ${licensePlate}      RV VIN #: ${vin}`);
    doc.moveDown(0.5);

    // --- Term ---
    const startDate = data.start_date || '___________';
    const endDate = data.end_date || '___________';
    const monthlyAmount = data.monthly_amount || '________';
    const proratedAmount = data.prorated_amount || '__________';
    doc.text(
      `The term of this lease commences ${startDate} until ${endDate}, payable in advance of the period and without notice:`,
      { width: w, lineGap: 3 }
    );
    doc.moveDown(0.3);
    doc.text(`  Monthly $${monthlyAmount} on the 1st day for each calendar month during the term of this lease.`);
    doc.text(`*Prorated amount to be collected for current month: $${proratedAmount}`);
    doc.moveDown(0.3);

    doc.text(
      'The contract is automatically renewed at the end of the rental period unless Lessee has made it known to Lessor, with 30 days written notice, that they no longer wish to store said unit and no monies are due.',
      { width: w, lineGap: 3 }
    );
    doc.moveDown(0.5);

    // --- Terms ---
    doc.font('Helvetica-Bold').text('By signing below, you have read and agree to the terms of this agreement:');
    doc.font('Helvetica').moveDown(0.3);

    const terms = [
      'Pay the rent for the above-described Unit as it becomes due, in advance of the period without notice.',
      'No subletting of the space or assignment of this lease under any circumstances.',
      'RV insurance on your unit being stored is required. Understand that your property is covered by your insurance only and Lessor has no financial liability to Lessee.',
      'Lessee will not hold the Lessor responsible for any damage to the property for any reason.',
      'Lessee will not be able to use the unit during any period that rent is past due.',
    ];
    terms.forEach(t => {
      doc.text(`• ${t}`, { width: w, lineGap: 2, indent: 10 });
      doc.moveDown(0.2);
    });
    doc.moveDown(0.3);

    // --- Payment Options ---
    doc.font('Helvetica-Bold').text('Payment Options', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Autopay ', { continued: true });
    doc.font('Helvetica').text(
      'Autopay payments are processed via Square and are subject to a 3.5% credit card processing fee. An invoice will be generated on the last day of each month for the following month\'s storage fees. Upon making your first payment through Square, you will have the option to securely store your credit card on file for future automatic payments.',
      { width: w, lineGap: 2 }
    );
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Check, Cash, or Zelle ', { continued: true });
    doc.font('Helvetica').text(
      'We also accept payment by check, cash, or Zelle — all with no additional processing fee. Payments may be mailed or dropped off at our facility. For Zelle transfers, please send payment to carol@mastertechrvrepair.com.',
      { width: w, lineGap: 2 }
    );
    doc.moveDown(0.5);

    // --- Late Payment ---
    doc.font('Helvetica-Bold').text('Late Payment penalty:');
    doc.font('Helvetica');
    doc.text('After 5 days late - $25 late fee');
    doc.text('After 10 days late - an additional $50 fee');
    doc.text('After 14 days late - $20/day charge up to 30 days late');
    doc.moveDown(0.3);
    doc.text(
      'If there has been no payment made for a 30-day period from the due date, Lessor is authorized to take possession of and sell said property for the purpose of reimbursement of all unpaid expenses.',
      { width: w, lineGap: 2 }
    );
    doc.moveDown(0.3);
    doc.text(
      'Lessor reserves the right to cancel this contract at any time the rent is past due, or Lessee violates any of the terms and conditions of the agreement or any provision of Colorado Law.',
      { width: w, lineGap: 2 }
    );
    doc.moveDown(0.3);
    doc.text('Lessee acknowledges that they have received a copy of the Storage Guidelines.');
    doc.moveDown(0.8);

    // --- Execution ---
    doc.font('Helvetica-Bold').text('EXECUTION:');
    doc.moveDown(0.5);
    doc.font('Helvetica');
    const lesseeFillName = data.lessee_name || '________________________';
    const lesseeFillDate = data.lease_date || '______________';
    const lesseePhone = data.lessee_phone || '_____________________';
    const lesseeEmail = data.lessee_email || '______________';

    doc.text(`Lessee Name: ${lesseeFillName}                    Date: ${lesseeFillDate}`);
    doc.moveDown(0.3);
    doc.text(`Cell Phone: ${lesseePhone}         Email: ${lesseeEmail}`);
    doc.moveDown(0.5);

    if (data.accepted_at) {
      // Digital acceptance
      doc.font('Helvetica-Bold').fillColor('#065f46')
        .text(`DIGITALLY ACCEPTED on ${data.accepted_at}`, { width: w });
      if (data.accepted_ip) doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
        .text(`IP: ${data.accepted_ip}`);
      doc.fillColor('#000000').fontSize(10);
    } else {
      doc.text('Signature: ____________________________________________');
      doc.text('Signer agrees to all rules and contract agreement, payment terms and conditions');
    }
    doc.moveDown(0.8);

    doc.text('Lessor Signature________________________________________         Date: __________________');
    doc.moveDown(0.3);
    doc.text('Lessor Contact Info: Phone: 303-557-2214');
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
      <li>When requesting your unit to be pulled out, give us at least <strong>2 hours notice</strong> by call or text between the hours of <strong>9AM – 6PM Monday thru Friday</strong>.</li>
      <li>If you want your unit on <strong>Saturday</strong>, call or text us before <strong>4PM on Friday</strong>.</li>
      <li>When you drop off your storage unit, it must be dropped off at least <strong>30 minutes before we close</strong> so we have time to put it away.</li>
      <li>If you want to drop off your RV on <strong>Sunday</strong>, please let us know and park it in front of our building and drop the keys in the mail slot. We will attempt to move it into the facility that day or first thing Monday morning.</li>
      <li>Please advise if you will be leaving a vehicle when picking up a unit.</li>
      <li><strong>YOU MUST</strong> let us know when you leave permanently, or you will continue to be billed. We don't issue refunds for partial months.</li>
      <li>We offer <strong>Auto-Pay</strong> for storage payments. If you don't want to set up Auto-Pay, payment is due in advance of the period and without notice.</li>
      <li>We send invoices and receipts by email unless otherwise requested.</li>
    </ul>

    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;">
      <p style="margin:0;color:#374151;font-weight:bold;">(303) 557-2214</p>
      <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
    </div>
  </div>
</div>`;
}

module.exports = { generateContractPDF, getGuidelinesHTML };
