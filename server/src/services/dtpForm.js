// ---------------------------------------------------------------------------
// Direction to Pay: the form an insurance customer signs at drop-off telling
// their insurer to pay the shop, not them.
//
// The wording is Business Setting `wo_dtp_terms` (one paragraph per line) so
// Carol can change it without a deploy. Tokens are filled from the record:
// {customer} {insurer} {claim} {policy} {unit} {vin} {wo} plus the company
// tokens from db/company.js ({company} {address} {phone} {email}).
//
// renderDtp() is the ONE place the text is built. The signing modal reads it
// through GET /api/records/:id/dtp, and the signed PDF prints the same
// paragraphs, so what the customer reads on screen is what lands in the PDF.
// ---------------------------------------------------------------------------

const PDFDocument = require('pdfkit');
const settings = require('../db/settings');
const company = require('../db/company');

const DTP_TERMS_FALLBACK = require('./dtpFormText');

function customerName(r) {
  const n = `${r.first_name || ''} ${r.last_name || ''}`.trim();
  return r.company_name ? (n ? `${n} (${r.company_name})` : r.company_name) : (n || 'the customer');
}
function unitText(r) {
  return [r.unit_year || r.year, r.unit_make || r.make, r.unit_model || r.model].filter(Boolean).join(' ') || 'RV';
}

// Returns { title, paragraphs[], customer, missing[] }. missing lists the
// facts the form names but the record does not have yet; the route refuses to
// sign while the insurer is missing, since the form would direct nobody.
function renderDtp(r) {
  const raw = settings.str('wo_dtp_terms', DTP_TERMS_FALLBACK);
  const missing = [];
  if (!r.insurance_company) missing.push('insurance company');
  const fill = (s) => company.fillTokens(String(s)
    .replace(/\{customer\}/g, customerName(r))
    .replace(/\{insurer\}/g, r.insurance_company || '________________')
    .replace(/\{claim\}/g, r.claim_number || '________________ (to be assigned)')
    .replace(/\{policy\}/g, r.policy_number || '________________')
    .replace(/\{unit\}/g, unitText(r))
    .replace(/\{vin\}/g, r.vin || 'not on file')
    .replace(/\{wo\}/g, String(r.record_number || '')));
  const paragraphs = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(fill);
  return { title: 'Direction to Pay', paragraphs, customer: customerName(r), missing };
}

// Builds the signed PDF. signatureData is a PNG data URL from the canvas.
function buildSignedDtpPdf(r, { signatureData, signerName, signedAt, signedBy }) {
  const { title, paragraphs } = renderDtp(r);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 54, bottom: 54, left: 60, right: 60 } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 120;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('MASTER TECH RV REPAIR & STORAGE', { align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#374151')
      .text(`${company.fullAddress()}  |  ${company.phone()}  |  ${company.email()}`, { align: 'center' });
    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#111').text(title.toUpperCase(), { align: 'center' });
    doc.moveDown(1);

    // Claim facts box
    const rows = [
      ['Insured / Owner', customerName(r)],
      ['Insurance Company', r.insurance_company || ''],
      ['Claim #', r.claim_number || '(to be assigned)'],
      ['Policy #', r.policy_number || ''],
      ['Adjuster', [r.insurance_contact_name, r.insurance_email, r.insurance_phone].filter(Boolean).join('  |  ')],
      ['RV', `${unitText(r)}${r.vin ? '   VIN ' + r.vin : ''}`],
      ['Work Order #', String(r.record_number || '')],
    ];
    doc.fontSize(10);
    rows.forEach(([k, v]) => {
      const y = doc.y;
      doc.font('Helvetica-Bold').fillColor('#374151').text(k, 60, y, { width: 130 });
      doc.font('Helvetica').fillColor('#111').text(v || ' ', 195, y, { width: W - 135 });
      doc.moveDown(0.35);
    });
    doc.moveDown(0.8);
    doc.x = 60;

    doc.font('Helvetica').fontSize(11).fillColor('#111');
    paragraphs.forEach(p => { doc.text(p, { width: W, align: 'left', lineGap: 2 }); doc.moveDown(0.7); });
    doc.moveDown(0.6);

    try {
      const b64 = String(signatureData).replace(/^data:image\/png;base64,/, '');
      doc.image(Buffer.from(b64, 'base64'), 60, doc.y, { width: 220, height: 66 });
      doc.y += 70;
    } catch (e) {
      doc.text('[signature image could not be embedded]');
    }
    doc.moveTo(60, doc.y).lineTo(320, doc.y).lineWidth(0.7).strokeColor('#111').stroke();
    doc.moveDown(0.3);
    const when = signedAt.toLocaleString('en-US', { timeZone: 'America/Denver', dateStyle: 'long', timeStyle: 'short' });
    doc.font('Helvetica').fontSize(9).fillColor('#374151')
      .text(`Signed by ${signerName} on ${when} (Mountain Time), in person at Master Tech RV Repair & Storage.`, 60, doc.y, { width: W });
    if (signedBy) doc.text(`Witnessed by: ${signedBy}`, { width: W });
    doc.end();
  });
}

module.exports = { renderDtp, buildSignedDtpPdf, DTP_TERMS_FALLBACK };
