const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { recalculateTotals } = require('../db/calculations');
const { sendEmail } = require('../services/email');

function brandedPage(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Master Tech RV</title>
<style>
  body { margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif; }
  .wrap { max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1); }
  .header { background:#1e3a5f;padding:20px 32px;text-align:center; }
  .header h1 { color:#fff;margin:0;font-size:18px; }
  .header p { color:#93c5fd;margin:4px 0 0;font-size:11px;font-style:italic; }
  .content { padding:32px; }
  .footer { background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center; }
  .footer p { margin:0;color:#6b7280;font-size:12px; }
  table { border-collapse:collapse;width:100%;margin:16px 0; }
  th { text-align:left;padding:8px 10px;background:#f3f4f6;border:1px solid #ddd;font-size:13px; }
  td { padding:8px 10px;border:1px solid #ddd;font-size:13px; }
  .cb-cell { text-align:center;width:40px; }
  .right { text-align:right; }
  .btn { display:inline-block;background:#1e3a5f;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;border:none;cursor:pointer; }
  .btn:hover { background:#2d5a8c; }
  .total-row { font-weight:bold;background:#f0fdf4; }
  input[type=checkbox] { width:18px;height:18px;cursor:pointer; }
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>MASTER TECH RV REPAIR &amp; STORAGE</h1>
    <p>Our Service Makes Happy Campers!</p>
  </div>
  <div class="content">${body}</div>
  <div class="footer">
    <p>6590 East 49th Avenue, Commerce City, CO 80022<br/>(303) 557-2214 | service@mastertechrvrepair.com</p>
  </div>
</div></body></html>`;
}

// ---------------------------------------------------------------------------
// GET /api/estimate-lines/approve/:token — Show line-level approval page
// ---------------------------------------------------------------------------
router.get('/:token', async (req, res) => {
  try {
    // Validate token; pull r.total_sales so the customer can see what the
    // work order is already at, and what the new total will be once the
    // additional inspection items they approve are added.
    const { rows: tokenRows } = await pool.query(
      `SELECT ela.*, r.record_number, r.id AS record_id,
              r.total_sales AS existing_total,
              r.tax_rate, r.shop_supplies_exempt,
              c.first_name
       FROM estimate_line_approvals ela
       JOIN records r ON r.id = ela.record_id
       JOIN customers c ON c.id = r.customer_id
       WHERE ela.approval_token = $1`,
      [req.params.token]
    );

    if (tokenRows.length === 0) {
      return res.send(brandedPage('Invalid Link',
        `<div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
         <h2 style="color:#dc2626;">Invalid or Expired Link</h2>
         <p style="color:#6b7280;">This approval link is invalid or has expired.<br/>Please contact Master Tech RV Repair &amp; Storage.</p>
         <p><strong>(303) 557-2214</strong></p>`
      ));
    }

    const token = tokenRows[0];

    // Check expiration
    if (new Date(token.expires_at) < new Date()) {
      return res.send(brandedPage('Link Expired',
        `<div style="font-size:48px;margin-bottom:16px;">&#9200;</div>
         <h2 style="color:#92400e;">Approval Link Expired</h2>
         <p style="color:#6b7280;">This link has expired. Please contact us.</p>
         <p><strong>(303) 557-2214</strong></p>`
      ));
    }

    // Get NEW estimate lines (inspection findings waiting on approval)
    const { rows: laborLines } = await pool.query(
      `SELECT id, description, hours, rate, line_total, customer_approved
       FROM record_labor_lines
       WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL
       ORDER BY sort_order`,
      [token.record_id]
    );
    const { rows: partsLines } = await pool.query(
      `SELECT id, description, quantity, sale_price_each, line_total, taxable, customer_approved
       FROM record_parts_lines
       WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL
       ORDER BY sort_order`,
      [token.record_id]
    );
    // Get EXISTING (already-approved / committed) work lines so the customer
    // sees the full picture, not just the new findings.
    const { rows: existingLabor } = await pool.query(
      `SELECT description, hours, rate, line_total
       FROM record_labor_lines
       WHERE record_id = $1 AND is_estimate_line = FALSE AND deleted_at IS NULL
       ORDER BY sort_order`,
      [token.record_id]
    );
    const { rows: existingParts } = await pool.query(
      `SELECT description, quantity, sale_price_each, line_total
       FROM record_parts_lines
       WHERE record_id = $1 AND is_estimate_line = FALSE AND deleted_at IS NULL
       ORDER BY sort_order`,
      [token.record_id]
    );

    if (laborLines.length === 0 && partsLines.length === 0) {
      return res.send(brandedPage('No Estimate Items',
        `<h2 style="color:#374151;">No Estimate Items</h2>
         <p style="color:#6b7280;">There are no estimate items pending approval for this work order.</p>`
      ));
    }

    // Build the form
    let laborHtml = '';
    if (laborLines.length > 0) {
      laborHtml = `<h3 style="margin:20px 0 8px;color:#1e3a5f;">Labor</h3>
        <table><tr><th class="cb-cell">Approve</th><th>Description</th><th class="right">Hours</th><th class="right">Rate</th><th class="right">Total</th></tr>`;
      laborLines.forEach(l => {
        const checked = 'checked'; // pre-selected by default; customer unchecks to decline
        const lt = parseFloat(l.line_total);
        laborHtml += `<tr>
          <td class="cb-cell"><input type="checkbox" name="labor_${l.id}" value="${l.id}" ${checked} class="estimate-cb" data-type="labor" data-amount="${lt.toFixed(2)}"></td>
          <td>${l.description}</td>
          <td class="right">${parseFloat(l.hours).toFixed(1)}</td>
          <td class="right">$${parseFloat(l.rate).toFixed(2)}</td>
          <td class="right">$${lt.toFixed(2)}</td>
        </tr>`;
      });
      laborHtml += '</table>';
    }

    let partsHtml = '';
    if (partsLines.length > 0) {
      partsHtml = `<h3 style="margin:20px 0 8px;color:#1e3a5f;">Parts</h3>
        <table><tr><th class="cb-cell">Approve</th><th>Description</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr>`;
      partsLines.forEach(p => {
        const checked = 'checked'; // pre-selected by default; customer unchecks to decline
        const lt = parseFloat(p.line_total);
        const tax = p.taxable ? '1' : '0';
        partsHtml += `<tr>
          <td class="cb-cell"><input type="checkbox" name="parts_${p.id}" value="${p.id}" ${checked} class="estimate-cb" data-type="parts" data-taxable="${tax}" data-amount="${lt.toFixed(2)}"></td>
          <td>${p.description}</td>
          <td class="right">${parseFloat(p.quantity)}</td>
          <td class="right">$${parseFloat(p.sale_price_each).toFixed(2)}</td>
          <td class="right">$${lt.toFixed(2)}</td>
        </tr>`;
      });
      partsHtml += '</table>';
    }

    // Starting selection totals (every box checked by default).
    let startingLabor = 0;
    laborLines.forEach(l => startingLabor += parseFloat(l.line_total));
    let startingParts = 0;
    let startingPartsTaxable = 0;
    partsLines.forEach(p => {
      const lt = parseFloat(p.line_total);
      startingParts += lt;
      if (p.taxable) startingPartsTaxable += lt;
    });

    const taxRate = parseFloat(token.tax_rate || 0); // e.g. 0.0905
    const shopSuppliesRate = 0.05;                   // 5% of labor
    const shopExempt = !!token.shop_supplies_exempt;

    const startingShop = shopExempt ? 0 : startingLabor * shopSuppliesRate;
    const startingTax  = startingPartsTaxable * taxRate;
    const totalEstimate = startingLabor + startingParts + startingShop + startingTax;

    const existingTotal = parseFloat(token.existing_total || 0);
    const startingNewTotal = existingTotal + totalEstimate;

    // Build the "Already Approved Work" section so the customer sees the
    // full picture (existing committed lines + new inspection findings)
    // rather than only the new findings on their own.
    let existingHtml = '';
    if (existingLabor.length > 0 || existingParts.length > 0) {
      existingHtml = `<h3 style="margin:20px 0 8px;color:#1e3a5f;">Already Approved Work</h3>
        <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">This is what we agreed to up front. No action needed on these.</p>
        <table>
          <tr><th>Description</th><th class="right">Qty/Hrs</th><th class="right">Rate</th><th class="right">Total</th></tr>`;
      existingLabor.forEach(l => {
        existingHtml += `<tr>
          <td>${l.description}</td>
          <td class="right">${parseFloat(l.hours).toFixed(1)}</td>
          <td class="right">$${parseFloat(l.rate).toFixed(2)}</td>
          <td class="right">$${parseFloat(l.line_total).toFixed(2)}</td>
        </tr>`;
      });
      existingParts.forEach(p => {
        existingHtml += `<tr>
          <td>${p.description}</td>
          <td class="right">${parseFloat(p.quantity)}</td>
          <td class="right">$${parseFloat(p.sale_price_each).toFixed(2)}</td>
          <td class="right">$${parseFloat(p.line_total).toFixed(2)}</td>
        </tr>`;
      });
      existingHtml += '</table>';
    }

    const body = `
      <h2 style="color:#1e3a5f;margin:0 0 8px;">Estimate Review</h2>
      <p style="color:#374151;margin:0 0 4px;">Work Order: <strong>#${token.record_number}</strong></p>
      <p style="color:#6b7280;margin:0 0 20px;">Hi${token.first_name ? ' ' + token.first_name : ''}, please review the inspection findings below. Every item is checked by default. Uncheck anything you would like us to skip, then click Approve.</p>
      ${existingHtml}
      <h3 style="margin:20px 0 8px;color:#92400e;">Inspection Findings — Needs Your Approval</h3>
      <div style="display:flex;gap:8px;margin:0 0 10px;">
        <button type="button" id="approve-all" style="background:#1e3a5f;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Approve All</button>
        <button type="button" id="deselect-all" style="background:#fff;color:#1e3a5f;border:1px solid #1e3a5f;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Deselect All</button>
      </div>
      <form method="POST" action="/api/estimate-lines/approve/${req.params.token}">
        ${laborHtml}
        ${partsHtml}

        <div style="margin:24px 0 12px;padding:16px 18px;background:#f0fdf4;border:2px solid #065f46;border-radius:10px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#374151;margin-bottom:4px;">
            <span>Labor selected</span><span>$<span id="sel-labor">${startingLabor.toFixed(2)}</span></span>
          </div>
          ${!shopExempt ? `
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:4px;">
            <span style="padding-left:14px;">+ Shop Supplies (5% of labor)</span><span>$<span id="sel-shop">${startingShop.toFixed(2)}</span></span>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#374151;margin-top:8px;margin-bottom:4px;">
            <span>Parts selected</span><span>$<span id="sel-parts">${startingParts.toFixed(2)}</span></span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:10px;">
            <span style="padding-left:14px;">+ Sales Tax (${(taxRate*100).toFixed(2)}% on taxable parts)</span><span>$<span id="sel-tax">${startingTax.toFixed(2)}</span></span>
          </div>
          ${existingTotal > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:14px;color:#374151;border-top:1px solid #86efac;padding-top:8px;">
              <span>Existing WO balance</span><span>$${existingTotal.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:14px;color:#374151;margin-bottom:10px;">
              <span>Additional items total</span><span>+ $<span id="sel-additional">${totalEstimate.toFixed(2)}</span></span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;color:#065f46;border-top:2px solid #065f46;padding-top:10px;">
              <span>New work order total</span><span>$<span id="new-total">${startingNewTotal.toFixed(2)}</span></span>
            </div>
          ` : `
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;color:#065f46;border-top:2px solid #065f46;padding-top:10px;">
              <span>Total of selected items</span><span>$<span id="sel-additional">${totalEstimate.toFixed(2)}</span></span>
            </div>
          `}
          <p style="color:#6b7280;font-size:11px;margin:10px 0 0;">Totals update live as you check or uncheck items.</p>
        </div>

        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">Only checked items will be added to your work order. Uncheck any you would like to decline.</p>
        <button type="submit" class="btn">Approve Selected Items</button>
      </form>
      <script>
        (function() {
          var existingTotal = ${existingTotal.toFixed(2)};
          var taxRate = ${taxRate};
          var shopRate = ${shopExempt ? 0 : shopSuppliesRate};
          var cbs = document.querySelectorAll('.estimate-cb');
          var s = {
            labor:      document.getElementById('sel-labor'),
            shop:       document.getElementById('sel-shop'),
            parts:      document.getElementById('sel-parts'),
            tax:        document.getElementById('sel-tax'),
            additional: document.getElementById('sel-additional'),
            newTotal:   document.getElementById('new-total')
          };
          function recalc() {
            var labor = 0, parts = 0, partsTaxable = 0;
            for (var i = 0; i < cbs.length; i++) {
              if (!cbs[i].checked) continue;
              var amt = parseFloat(cbs[i].dataset.amount || 0);
              if (cbs[i].dataset.type === 'labor') labor += amt;
              else {
                parts += amt;
                if (cbs[i].dataset.taxable === '1') partsTaxable += amt;
              }
            }
            var shop = labor * shopRate;
            var tax = partsTaxable * taxRate;
            var additional = labor + shop + parts + tax;
            if (s.labor) s.labor.textContent = labor.toFixed(2);
            if (s.shop)  s.shop.textContent = shop.toFixed(2);
            if (s.parts) s.parts.textContent = parts.toFixed(2);
            if (s.tax)   s.tax.textContent = tax.toFixed(2);
            if (s.additional) s.additional.textContent = additional.toFixed(2);
            if (s.newTotal)   s.newTotal.textContent = (existingTotal + additional).toFixed(2);
          }
          for (var j = 0; j < cbs.length; j++) cbs[j].addEventListener('change', recalc);
          var approveAll = document.getElementById('approve-all');
          var deselectAll = document.getElementById('deselect-all');
          if (approveAll) approveAll.addEventListener('click', function() {
            for (var k = 0; k < cbs.length; k++) cbs[k].checked = true;
            recalc();
          });
          if (deselectAll) deselectAll.addEventListener('click', function() {
            for (var k = 0; k < cbs.length; k++) cbs[k].checked = false;
            recalc();
          });
        })();
      </script>
    `;

    res.send(brandedPage('Estimate Review', body));
  } catch (err) {
    console.error('GET estimate-line-approval error:', err);
    res.status(500).send(brandedPage('Error', '<h2 style="color:#dc2626;">Something went wrong</h2><p>Please contact us directly.</p>'));
  }
});

// ---------------------------------------------------------------------------
// POST /api/estimate-lines/approve/:token — Process line-level approvals
// ---------------------------------------------------------------------------
router.post('/:token', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    // Validate token
    const { rows: tokenRows } = await pool.query(
      `SELECT ela.*, r.record_number, r.id AS record_id,
              c.first_name, c.last_name, c.email_primary,
              c.id AS customer_id
       FROM estimate_line_approvals ela
       JOIN records r ON r.id = ela.record_id
       JOIN customers c ON c.id = r.customer_id
       WHERE ela.approval_token = $1 AND ela.expires_at > NOW()`,
      [req.params.token]
    );

    if (tokenRows.length === 0) {
      return res.send(brandedPage('Invalid Link',
        `<div style="font-size:48px;margin-bottom:16px;">&#10060;</div>
         <h2 style="color:#dc2626;">Invalid or Expired Link</h2>
         <p style="color:#6b7280;">Please contact Master Tech RV Repair &amp; Storage.</p>`
      ));
    }

    const tokenData = tokenRows[0];
    tokenData.customer_name = `${tokenData.first_name || ''} ${tokenData.last_name || ''}`.trim() || 'the customer';
    const recordId = tokenData.record_id;

    // Parse checked items from form body
    const approvedLaborIds = [];
    const approvedPartsIds = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('labor_')) approvedLaborIds.push(parseInt(value));
      if (key.startsWith('parts_')) approvedPartsIds.push(parseInt(value));
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Reset all estimate lines to unapproved first
      await client.query(
        `UPDATE record_labor_lines SET customer_approved = FALSE, customer_approved_at = NULL
         WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL`,
        [recordId]
      );
      await client.query(
        `UPDATE record_parts_lines SET customer_approved = FALSE, customer_approved_at = NULL
         WHERE record_id = $1 AND is_estimate_line = TRUE AND deleted_at IS NULL`,
        [recordId]
      );

      // Approve the selected ones AND promote them into the main work order
      // (is_estimate_line = FALSE moves them out of the Estimate section)
      if (approvedLaborIds.length > 0) {
        await client.query(
          `UPDATE record_labor_lines SET customer_approved = TRUE, customer_approved_at = NOW(), is_estimate_line = FALSE
           WHERE record_id = $1 AND id = ANY($2) AND is_estimate_line = TRUE AND deleted_at IS NULL`,
          [recordId, approvedLaborIds]
        );
      }
      if (approvedPartsIds.length > 0) {
        // Decrement inventory for any approved parts lines tied to an
        // inventory item. Inspection findings don't touch inventory; once
        // approved they become real WO lines and the stock leaves the shelf.
        const { rows: invLines } = await client.query(
          `SELECT inventory_id, quantity
             FROM record_parts_lines
            WHERE record_id = $1 AND id = ANY($2)
              AND is_estimate_line = TRUE AND deleted_at IS NULL
              AND is_inventory_part = TRUE AND inventory_id IS NOT NULL`,
          [recordId, approvedPartsIds]
        );
        for (const pl of invLines) {
          await client.query(
            'UPDATE inventory SET qty_on_hand = qty_on_hand - $1 WHERE id = $2',
            [parseFloat(pl.quantity), pl.inventory_id]
          );
        }
        await client.query(
          `UPDATE record_parts_lines SET customer_approved = TRUE, customer_approved_at = NOW(), is_estimate_line = FALSE
           WHERE record_id = $1 AND id = ANY($2) AND is_estimate_line = TRUE AND deleted_at IS NULL`,
          [recordId, approvedPartsIds]
        );
      }

      await recalculateTotals(recordId, client);

      // If the customer approved at least one line, move an estimate record
      // to "approved" status (leaves in-progress/further records unchanged).
      if (approvedLaborIds.length + approvedPartsIds.length > 0) {
        await client.query(
          `UPDATE records
             SET status = 'approved',
                 approved_by_customer_at = NOW(),
                 intake_date = COALESCE(intake_date, CURRENT_DATE)
           WHERE id = $1 AND status = 'estimate'`,
          [recordId]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Log to communication_log
    const totalApproved = approvedLaborIds.length + approvedPartsIds.length;
    try {
      await pool.query(
        `INSERT INTO communication_log (customer_id, record_id, channel, trigger_event, message_content)
         VALUES ($1, $2, 'email', 'estimate_lines_approved_by_customer', $3)`,
        [tokenData.customer_id, recordId,
         `Customer approved ${totalApproved} estimate line(s) for WO #${tokenData.record_number} via email link`]
      );
    } catch (e) { console.error('Comm log error:', e.message); }

    // Notify staff
    const backendUrl = process.env.FRONTEND_URL || 'https://mastertech-erp.vercel.app';
    sendEmail({
      to: 'service@mastertechrvrepair.com',
      subject: `Estimate Lines Approved — WO #${tokenData.record_number} (${tokenData.customer_name})`,
      html: `<p><strong>${tokenData.customer_name}</strong> approved <strong>${totalApproved}</strong> estimate line(s) for WO #${tokenData.record_number}.</p>
             <p>Labor items approved: ${approvedLaborIds.length}<br/>Parts items approved: ${approvedPartsIds.length}</p>
             <p><a href="${backendUrl}/records/${recordId}">View Record</a></p>`,
    }).catch(e => console.error('Staff notification error:', e.message));

    // Confirmation page
    res.send(brandedPage('Items Approved',
      `<div style="font-size:64px;margin-bottom:16px;">&#9989;</div>
       <h2 style="color:#065f46;">Thank You!</h2>
       <p style="color:#374151;">You approved <strong>${totalApproved}</strong> item(s) for Work Order <strong>#${tokenData.record_number}</strong>.</p>
       <p style="color:#6b7280;">We'll get started on the approved work and keep you updated.</p>
       <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;">
         <p style="margin:0;color:#374151;"><strong>(303) 557-2214</strong></p>
         <p style="margin:4px 0 0;color:#6b7280;">service@mastertechrvrepair.com</p>
       </div>`
    ));
  } catch (err) {
    console.error('POST estimate-line-approval error:', err);
    res.status(500).send(brandedPage('Error', '<h2 style="color:#dc2626;">Something went wrong</h2><p>Please contact us directly.</p>'));
  }
});

module.exports = router;
