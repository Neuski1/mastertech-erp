/**
 * Help You Sell — Sales Facilitation Agreement PDF Generator
 *
 * Mirrors the Word original (Help you Sell Agreement.docx) exactly, with the
 * variable fields (client name/email/phone, RV description, storage rate,
 * commission %, cancellation %) substituted per agreement.
 *
 * Same PDFKit approach as services/storageContract.js so the two contracts
 * look like they came from the same shop.
 */
const PDFDocument = require('pdfkit');

const BLANK_LINE = '________________________________';

function money(n) {
  const v = parseFloat(n);
  if (!isFinite(v)) return '$______';
  return `$${v.toFixed(2)}`;
}

// Whole-dollar listing price with thousands separators. Blank if not a number.
function price(n) {
  const v = parseFloat(n);
  if (!isFinite(v)) return '';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function pct(n, fallback) {
  const v = parseFloat(n);
  if (!isFinite(v)) return `${fallback}%`;
  // 5 not 5.00, but 2.5 stays 2.5
  return `${(Math.round(v * 100) / 100).toString()}%`;
}

/**
 * @param {Object} d agreement data
 * @returns {Promise<Buffer>}
 */
function generateHelpYouSellPDF(d = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 60, left: 65, right: 65 } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const w = 482;
    const lineGap = 3;

    const clientName = d.client_name || BLANK_LINE;
    const clientEmail = d.client_email || '____________________';
    const clientPhone = d.client_phone || '____________________';
    const rvDesc = d.rv_description || '____________________';
    const rate = money(d.monthly_storage_rate);
    const commission = pct(d.commission_pct, 5);
    const cancelPct = pct(d.cancellation_fee_pct, 1);
    const noticeDays = parseInt(d.notice_days, 10) || 30;
    const payDays = parseInt(d.payment_days, 10) || 5;
    const agreementDate = d.agreement_date || new Date().toLocaleDateString('en-US');

    const h = (t) => { doc.moveDown(0.7); doc.fontSize(11.5).font('Helvetica-Bold').text(t, { width: w }); doc.moveDown(0.25); doc.fontSize(10.5).font('Helvetica'); };
    const p = (t, opts = {}) => doc.fontSize(10.5).font('Helvetica').text(t, { width: w, lineGap, ...opts });
    // Indented list item. Sets x explicitly so wrapped lines stay indented
    // (PDFKit's `indent` option only shifts the first line), then restores x.
    const bullet = (t) => {
      const left = doc.page.margins.left;
      doc.fontSize(10.5).font('Helvetica').text(t, left + 16, doc.y, { width: w - 16, lineGap });
      doc.x = left;
    };

    // ── Header ──
    doc.fontSize(18).font('Helvetica-Bold').text('MASTER TECH RV REPAIR & STORAGE', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').text('6590 E. 49th Ave., Commerce City, CO 80022', { align: 'center' });
    doc.text('(303) 557-2214  |  service@mastertechrvrepair.com', { align: 'center' });
    doc.moveDown(1.1);

    doc.fontSize(15).font('Helvetica-Bold').text('SALES FACILITATION AGREEMENT', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(10.5).font('Helvetica').text(`Date: ${agreementDate}`, { align: 'center' });
    doc.moveDown(0.8);

    // ── 1. Parties ──
    h('1.  Parties');
    p('Business:  Master Tech RV Repair and Storage');
    p('6590 E. 49th Ave., Commerce City, CO 80022');
    p('Phone: (303) 557-2214    Email: service@mastertechrvrepair.com');
    doc.moveDown(0.4);
    p(`Client:  ${clientName}`);
    p(`Email: ${clientEmail}    Phone: ${clientPhone}`);

    // ── 2. Recitals ──
    h('2.  Recitals');
    p(`The Client owns a ${rvDesc} (the “RV”).`);
    p('The Business agrees to provide sales-support services to help the Client sell the RV.');
    const askingPrice = price(d.asking_price);
    if (askingPrice) {
      p(`The Client intends to list the RV for ${askingPrice} (the “Asking Price”). The Client may change the listing price at any time.`);
    }

    // ── 3. Services ──
    h('3.  Services');
    p('The Business will, using its best efforts:');
    doc.moveDown(0.2);
    bullet('•  Schedule and coordinate viewing appointments.');
    bullet('•  Conduct guided walkthroughs to highlight the RV’s features, functions and benefits.');
    bullet('•  Photograph the RV for use in online and in-shop advertising.');
    bullet('•  Advise and assist in drafting social-media posts and in-shop flyers.');
    bullet('•  Provide a private office or meeting space for negotiation and closing.');

    // ── 4. Client Obligations ──
    h('4.  Client Obligations');
    p('The Client will:');
    doc.moveDown(0.2);
    bullet('a)  Maintain the RV in presentable condition for all showings. (By request, we can arrange cleaning the RV, inside and/or out.)');
    bullet('b)  Include Business’s phone number (303-557-2214) in all online ads and prospect communications.');
    bullet('c)  Direct all inquiries through the Business to ensure smooth scheduling.');
    bullet(`d)  Pay the monthly outdoor storage rate of ${rate}/month until the RV sells and/or the Client removes the RV from the lot.`);

    // ── 5. Commission & Payment ──
    h('5.  Commission & Payment');
    p(`Fee: ${commission} of the gross sale price (i.e., the total amount paid by the buyer, before taxes and fees).`);
    p(`Due Date: Payable to the Business at closing or within ${payDays} business days thereafter — by cash, check or credit card.`);

    // ── 6. Term & Termination ──
    h('6.  Term & Termination');
    p(`Term: This Agreement commences on the date above and continues until the earlier of (a) closing of the RV sale, or (b) ${noticeDays} days written notice by either party.`);
    const cancelPctNum = parseFloat(d.cancellation_fee_pct);
    const cancelAmount = (askingPrice && isFinite(cancelPctNum))
      ? ` Based on the Asking Price stated above, that fee is ${money(parseFloat(d.asking_price) * cancelPctNum / 100)}.`
      : '';
    p(`Early Termination: If Client terminates early without cause, Client owes Business a “good-faith” cancellation fee equal to ${cancelPct} of the last listed asking price.${cancelAmount}`);

    // ── 7. Indemnification ──
    h('7.  Indemnification');
    p('Client will indemnify and hold harmless Business from any third-party claims arising out of the RV’s condition or misrepresentation of its features.');

    // ── Optional special terms ──
    if (d.special_terms && String(d.special_terms).trim()) {
      h('8.  Special Terms');
      p(String(d.special_terms).trim());
    }

    // ── Signatures ──
    doc.moveDown(1);
    p('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written:');
    doc.moveDown(1.2);

    doc.fontSize(10.5).font('Helvetica-Bold').text('Master Tech RV Repair and Storage', { width: w });
    doc.moveDown(0.5);
    doc.font('Helvetica').text('By: ', { continued: true });
    doc.font('Times-Italic').fontSize(15).text('Carol Neu');
    doc.font('Helvetica').fontSize(10.5);
    doc.text('Name: Carol Neu');
    doc.text('Title: Co-Owner');
    doc.text(`Date: ${agreementDate}`);

    doc.moveDown(1.2);
    doc.fontSize(10.5).font('Helvetica-Bold').text(`Client — ${clientName}`, { width: w });
    doc.moveDown(0.5);
    doc.font('Helvetica').text('By: ', { continued: true });
    if (d.accepted_at) {
      doc.font('Times-Italic').fontSize(15).text(d.signature_name || clientName);
      doc.font('Helvetica').fontSize(10.5);
      doc.text(`Name: ${clientName}`);
      doc.moveDown(0.6);
      doc.fontSize(9).fillColor('#4b5563');
      doc.text(`Electronically signed on ${d.accepted_at}${d.accepted_ip ? `  ·  IP ${d.accepted_ip}` : ''}`, { width: w });
      doc.text('Signed online via the Master Tech RV customer portal. This electronic signature is intended by the parties to have the same force and effect as a handwritten signature.', { width: w, lineGap: 2 });
      doc.fillColor('#000000').fontSize(10.5);
    } else {
      doc.font('Helvetica').text('____________________________');
      doc.text(`Name: ${clientName}`);
      doc.text('Date: ____________________');
    }

    doc.end();
  });
}

module.exports = { generateHelpYouSellPDF };
