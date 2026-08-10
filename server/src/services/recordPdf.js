// Server-side PDF for a work order / estimate / invoice, generated with pdfkit.
// Fast one-click download (no browser "Save as PDF" round trip).

const PDFDocument = require('pdfkit');

const SHOP = {
  name: 'Master Tech RV Repair & Storage',
  addr: '6590 East 49th Avenue, Commerce City, CO 80022',
  phone: '(303) 557-2214',
  email: 'service@mastertechrvrepair.com',
};
const NAVY = '#1a2a4a';

const money = (v) => {
  const n = parseFloat(v) || 0;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(String(d).includes('T') ? d : d + 'T12:00:00');
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { timeZone: 'America/Denver' });
};

function docTitleFor(status) {
  if (status === 'estimate') return { title: 'ESTIMATE', color: '#2e7d32' };
  if (['complete', 'payment_pending', 'partial', 'paid'].includes(status)) return { title: 'INVOICE', color: '#4a235a' };
  return { title: 'WORK ORDER', color: NAVY };
}

function generateRecordPdf(r) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'LETTER', margins: { top: 46, bottom: 54, left: 46, right: 46 } });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const width = right - left;
      const { title, color } = docTitleFor(r.status);

      // ---- Header ----
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(15).text(SHOP.name, left, 46);
      doc.font('Helvetica').fontSize(8.5).fillColor('#555')
        .text(SHOP.addr, left, 64).text(`${SHOP.phone}  |  ${SHOP.email}`, left);
      doc.font('Helvetica-Bold').fontSize(22).fillColor(color).text(title, left, 46, { width, align: 'right' });
      doc.font('Helvetica').fontSize(9).fillColor('#111')
        .text(`No. ${r.record_number || ''}`, left, 74, { width, align: 'right' });
      const intake = r.intake_date || r.created_at;
      doc.text(`Date: ${fmtDate(intake)}`, { width, align: 'right' });

      doc.moveTo(left, 96).lineTo(right, 96).strokeColor(color).lineWidth(2).stroke();

      // ---- Bill To + RV ----
      let y = 104;
      const colW = width / 2 - 8;
      const custName = `${r.last_name || ''}${r.first_name ? ', ' + r.first_name : ''}`;
      const addr = [r.address_street, [r.address_city, r.address_state, r.address_zip].filter(Boolean).join(', ')].filter(Boolean);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY).text('BILL TO', left, y);
      doc.font('Helvetica').fontSize(9).fillColor('#111');
      let cy = y + 13;
      doc.text(r.company_name || custName, left, cy); cy += 12;
      if (r.company_name && custName) { doc.text(custName, left, cy); cy += 12; }
      addr.forEach(a => { doc.text(a, left, cy); cy += 12; });
      if (r.phone_primary) { doc.text(r.phone_primary, left, cy); cy += 12; }
      if (r.email_primary) { doc.text(r.email_primary, left, cy); cy += 12; }

      const rvX = left + colW + 16;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY).text('RV / UNIT', rvX, y);
      doc.font('Helvetica').fontSize(9).fillColor('#111');
      let ry = y + 13;
      const rv = [r.year, r.make, r.model].filter(Boolean).join(' ');
      if (rv) { doc.text(rv, rvX, ry); ry += 12; }
      if (r.vin) { doc.text(`VIN: ${r.vin}`, rvX, ry); ry += 12; }
      if (r.license_plate) { doc.text(`Plate: ${r.license_plate}`, rvX, ry); ry += 12; }

      y = Math.max(cy, ry) + 8;

      // ---- Job description ----
      if (r.job_description && String(r.job_description).trim()) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY).text('JOB DESCRIPTION', left, y);
        y += 13;
        doc.font('Helvetica').fontSize(9).fillColor('#111').text(String(r.job_description).trim(), left, y, { width });
        y = doc.y + 8;
      }

      // ---- committed lines only (approved work) ----
      const isCommitted = (l) => !l.is_estimate_line || l.customer_approved;
      const labor = (r.labor_lines || []).filter(isCommitted);
      const parts = (r.parts_lines || []).filter(isCommitted);
      const freight = r.freight_lines || [];

      const drawTableHeader = (cols, yy) => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff');
        doc.rect(left, yy, width, 15).fill(NAVY);
        doc.fillColor('#fff');
        cols.forEach(c => doc.text(c.label, c.x, yy + 4, { width: c.w, align: c.align || 'left' }));
        return yy + 15;
      };
      const ensureSpace = (yy, need = 60) => {
        if (yy + need > doc.page.height - doc.page.margins.bottom) { doc.addPage(); return doc.page.margins.top; }
        return yy;
      };

      // Labor table
      if (labor.length) {
        y = ensureSpace(y);
        const cols = [
          { label: 'LABOR', x: left + 4, w: width - 210 },
          { label: 'HRS', x: right - 200, w: 50, align: 'right' },
          { label: 'RATE', x: right - 140, w: 60, align: 'right' },
          { label: 'AMOUNT', x: right - 74, w: 70, align: 'right' },
        ];
        y = drawTableHeader(cols, y);
        doc.font('Helvetica').fontSize(8.5).fillColor('#111');
        labor.forEach(l => {
          y = ensureSpace(y, 26);
          const desc = (l.description || '') + (l.no_charge ? '  [N/C]' : '') + (l.technician_name ? `\nTech: ${l.technician_name}` : '');
          const h = doc.heightOfString(desc, { width: cols[0].w }) + 6;
          doc.fillColor('#111').text(desc, cols[0].x, y + 3, { width: cols[0].w });
          doc.text(parseFloat(l.hours || 0).toFixed(2), cols[1].x, y + 3, { width: cols[1].w, align: 'right' });
          doc.text(l.no_charge ? '—' : money(l.rate), cols[2].x, y + 3, { width: cols[2].w, align: 'right' });
          doc.text(l.no_charge ? money(0) : money(l.line_total), cols[3].x, y + 3, { width: cols[3].w, align: 'right' });
          y += h;
          doc.moveTo(left, y).lineTo(right, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        });
        const totalHours = labor.reduce((s, l) => s + (parseFloat(l.hours) || 0), 0);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#374151').text(`Total Hours: ${totalHours.toFixed(2)}`, left, y + 3, { width: width - 80 });
        y += 18;
      }

      // Parts table
      if (parts.length) {
        y = ensureSpace(y);
        const cols = [
          { label: 'PARTS', x: left + 4, w: width - 210 },
          { label: 'QTY', x: right - 200, w: 50, align: 'right' },
          { label: 'PRICE', x: right - 140, w: 60, align: 'right' },
          { label: 'AMOUNT', x: right - 74, w: 70, align: 'right' },
        ];
        y = drawTableHeader(cols, y);
        doc.font('Helvetica').fontSize(8.5).fillColor('#111');
        parts.forEach(p => {
          y = ensureSpace(y, 26);
          const desc = (p.part_number ? p.part_number + ' — ' : '') + (p.description || '');
          const h = doc.heightOfString(desc, { width: cols[0].w }) + 6;
          doc.fillColor('#111').text(desc, cols[0].x, y + 3, { width: cols[0].w });
          doc.text(String(parseFloat(p.quantity || 0)), cols[1].x, y + 3, { width: cols[1].w, align: 'right' });
          doc.text(money(p.sale_price_each), cols[2].x, y + 3, { width: cols[2].w, align: 'right' });
          doc.text(money(p.line_total), cols[3].x, y + 3, { width: cols[3].w, align: 'right' });
          y += h;
          doc.moveTo(left, y).lineTo(right, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        });
        y += 4;
      }

      // Freight
      if (freight.length) {
        y = ensureSpace(y);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY).text('SHIPPING / FREIGHT', left, y); y += 13;
        doc.font('Helvetica').fontSize(8.5).fillColor('#111');
        freight.forEach(f => {
          doc.text(f.description || 'Shipping', left + 4, y, { width: width - 90 });
          doc.text(money(f.amount), right - 74, y, { width: 70, align: 'right' });
          y += 13;
        });
        y += 2;
      }

      // ---- Totals ----
      y = ensureSpace(y, 150);
      const tl = right - 230, tvx = right - 90, tvw = 86;
      const row = (label, val, bold) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9).fillColor(bold ? NAVY : '#374151');
        doc.text(label, tl, y, { width: 130, align: 'right' });
        doc.text(val, tvx, y, { width: tvw, align: 'right' });
        y += bold ? 16 : 13;
      };
      doc.moveTo(tl, y).lineTo(right, y).strokeColor('#d1d5db').lineWidth(1).stroke(); y += 6;
      if (parseFloat(r.labor_subtotal)) row('Labor', money(r.labor_subtotal));
      if (parseFloat(r.parts_subtotal)) row('Parts', money(r.parts_subtotal));
      if (parseFloat(r.freight_subtotal)) row('Shipping', money(r.freight_subtotal));
      if (parseFloat(r.shop_supplies_amount)) row('Shop Supplies', money(r.shop_supplies_amount));
      if (parseFloat(r.discount_amount)) row(r.discount_description || 'Discount', '-' + money(r.discount_amount));
      if (parseFloat(r.under_warranty_amount)) row('Under Warranty', '-' + money(r.under_warranty_amount));
      const taxLabel = r.tax_waived ? 'Tax (waived)' : `Tax${r.tax_rate ? ' (' + (parseFloat(r.tax_rate) * 100).toFixed(2) + '%)' : ''}`;
      row(taxLabel, money(r.tax_amount));
      if (parseFloat(r.cc_fee_amount)) row('Card Fee', money(r.cc_fee_amount));
      doc.moveTo(tl, y).lineTo(right, y).strokeColor('#d1d5db').lineWidth(1).stroke(); y += 6;
      row('TOTAL', money(r.total_sales), true);
      if (parseFloat(r.deposit_amount)) row('Deposit', '-' + money(r.deposit_amount));
      if (parseFloat(r.total_collected)) row('Paid', '-' + money(r.total_collected));
      const bal = parseFloat(r.amount_due);
      if (!isNaN(bal)) row('BALANCE DUE', money(bal), true);

      // ---- Payments detail (invoice stage) ----
      const payments = r.payments || [];
      if (['complete', 'payment_pending', 'partial', 'paid'].includes(r.status) && payments.length) {
        y = ensureSpace(y + 10, 60);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY).text('PAYMENTS', left, y); y += 14;
        doc.font('Helvetica').fontSize(8.5).fillColor('#111');
        const methodLabels = { credit_card: 'Card', check: 'Check', cash: 'Cash', zelle: 'Zelle', mobile_deposit: 'Mobile Deposit' };
        payments.forEach(p => {
          doc.text(fmtDate(p.payment_date), left, y, { width: 90 });
          doc.text(methodLabels[p.payment_method] || p.payment_method || '—', left + 95, y, { width: 120 });
          doc.text(p.check_number || '', left + 220, y, { width: 120 });
          doc.text(money(p.amount), right - 74, y, { width: 70, align: 'right' });
          y += 13;
        });
      }

      // ---- Footer terms ----
      const bottom = doc.page.height - doc.page.margins.bottom;
      if (y < bottom - 40) {
        doc.font('Helvetica').fontSize(7.5).fillColor('#9ca3af')
          .text('Master Tech RV Repair & Storage warrants workmanship for 60 days. Thank you for your business.', left, bottom - 24, { width, align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateRecordPdf };
