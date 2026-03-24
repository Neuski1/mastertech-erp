const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const {
  oauthClient,
  saveTokens,
  loadTokens,
  clearTokens,
  qbRequest,
} = require('../services/quickbooks');
const { requireRole } = require('../middleware/auth');

// Payment method mapping: ERP → QuickBooks
const PAYMENT_METHOD_MAP = {
  credit_card: 'CreditCard',
  check: 'Check',
  cash: 'Cash',
  zelle: 'Other',
};

// ---------------------------------------------------------------------------
// GET /api/quickbooks/auth — Redirect to Intuit OAuth2 login
// ---------------------------------------------------------------------------
router.get('/auth', requireRole('admin'), (req, res) => {
  const authUri = oauthClient.authorizeUri({
    scope: [
      oauthClient.scopes.Accounting,
    ],
    state: 'mastertech-erp',
  });

  res.json({ authUri });
});

// ---------------------------------------------------------------------------
// GET /api/quickbooks/callback — Handle OAuth2 callback from Intuit
// ---------------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  try {
    const authResponse = await oauthClient.createToken(req.url);
    const tokenData = authResponse.getJson();

    await saveTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      realmId: req.query.realmId,
    });

    // Redirect to frontend settings or a success page
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings?qb=connected`);
  } catch (err) {
    console.error('QB OAuth callback error:', err);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings?qb=error&message=${encodeURIComponent(err.message)}`);
  }
});

// ---------------------------------------------------------------------------
// GET /api/quickbooks/status — Connection status and token expiry
// ---------------------------------------------------------------------------
router.get('/status', async (req, res) => {
  try {
    const tokens = await loadTokens();

    if (!tokens.accessToken || !tokens.realmId) {
      return res.json({ connected: false });
    }

    const expiry = new Date(tokens.tokenExpiry);
    const now = new Date();
    const isExpired = expiry <= now;
    const expiresIn = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));

    res.json({
      connected: true,
      realmId: tokens.realmId,
      tokenExpiry: tokens.tokenExpiry,
      isExpired,
      expiresInSeconds: expiresIn,
      environment: process.env.QB_ENVIRONMENT || 'sandbox',
    });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/quickbooks/disconnect — Clear stored tokens
// ---------------------------------------------------------------------------
router.get('/disconnect', requireRole('admin'), async (req, res) => {
  try {
    await clearTokens();
    res.json({ message: 'QuickBooks disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/quickbooks/sync/:recordId — Sync a paid record to QB
// ---------------------------------------------------------------------------
router.post('/sync/:recordId', requireRole('admin', 'service_writer', 'bookkeeper'), async (req, res) => {
  const { recordId } = req.params;

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // 1. Fetch the full record
    const { rows: recRows } = await dbClient.query(
      `SELECT r.*, c.id AS cust_id, c.last_name, c.first_name, c.company_name,
              c.email_primary, c.phone_primary, c.quickbooks_customer_id,
              c.address_street, c.address_city, c.address_state, c.address_zip
       FROM records r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [recordId]
    );

    if (recRows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const record = recRows[0];

    // Guard: only sync paid records
    if (record.status !== 'paid') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: 'Only paid records can be synced to QuickBooks' });
    }

    // Guard: prevent double sync
    if (record.quickbooks_synced_at) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({
        error: 'Record already synced to QuickBooks',
        synced_at: record.quickbooks_synced_at,
        quickbooks_invoice_id: record.quickbooks_invoice_id,
      });
    }

    // 2. Ensure customer exists in QB
    let qbCustomerId = record.quickbooks_customer_id;

    if (!qbCustomerId) {
      const displayName = record.company_name
        || `${record.last_name}${record.first_name ? ', ' + record.first_name : ''}`;

      const custBody = {
        DisplayName: `${displayName} (${record.cust_id})`,
        GivenName: record.first_name || undefined,
        FamilyName: record.last_name,
        CompanyName: record.company_name || undefined,
        PrimaryEmailAddr: record.email_primary ? { Address: record.email_primary } : undefined,
        PrimaryPhone: record.phone_primary ? { FreeFormNumber: record.phone_primary } : undefined,
        BillAddr: record.address_street ? {
          Line1: record.address_street,
          City: record.address_city || undefined,
          CountrySubDivisionCode: record.address_state || undefined,
          PostalCode: record.address_zip || undefined,
        } : undefined,
      };

      const custResult = await qbRequest('POST', '/customer', custBody);
      qbCustomerId = String(custResult.Customer.Id);

      // Save QB customer ID back to ERP
      await dbClient.query(
        'UPDATE customers SET quickbooks_customer_id = $1 WHERE id = $2',
        [qbCustomerId, record.cust_id]
      );
    }

    // 3. Fetch labor lines, parts lines
    const [laborRes, partsRes] = await Promise.all([
      dbClient.query(
        `SELECT * FROM record_labor_lines
         WHERE record_id = $1 AND deleted_at IS NULL ORDER BY sort_order`,
        [recordId]
      ),
      dbClient.query(
        `SELECT * FROM record_parts_lines
         WHERE record_id = $1 AND deleted_at IS NULL ORDER BY sort_order`,
        [recordId]
      ),
    ]);

    // 4. Build QB Invoice line items
    const invoiceLines = [];
    let lineNum = 1;

    // Labor lines (non-taxable, use SalesItemLineDetail)
    for (const labor of laborRes.rows) {
      invoiceLines.push({
        LineNum: lineNum++,
        Amount: parseFloat(labor.line_total),
        Description: `Labor: ${labor.description}`,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: parseFloat(labor.hours),
          UnitPrice: parseFloat(labor.rate),
          TaxCodeRef: { value: 'NON' },
        },
      });
    }

    // Parts lines
    for (const part of partsRes.rows) {
      invoiceLines.push({
        LineNum: lineNum++,
        Amount: parseFloat(part.line_total),
        Description: `Part: ${part.description}${part.part_number ? ' (' + part.part_number + ')' : ''}`,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: parseFloat(part.quantity),
          UnitPrice: parseFloat(part.sale_price_each),
          TaxCodeRef: { value: part.taxable ? 'TAX' : 'NON' },
        },
      });
    }

    // Shop supplies line (non-taxable, omit if 0)
    const shopSupplies = parseFloat(record.shop_supplies_amount);
    if (shopSupplies > 0) {
      invoiceLines.push({
        LineNum: lineNum++,
        Amount: shopSupplies,
        Description: 'Shop Supplies',
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: shopSupplies,
          TaxCodeRef: { value: 'NON' },
        },
      });
    }

    // CC fee line (non-taxable, omit if 0)
    const ccFee = parseFloat(record.cc_fee_amount);
    if (ccFee > 0) {
      invoiceLines.push({
        LineNum: lineNum++,
        Amount: ccFee,
        Description: 'Credit Card Processing Fee',
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: ccFee,
          TaxCodeRef: { value: 'NON' },
        },
      });
    }

    // 5. Create QB Invoice
    const invoiceBody = {
      CustomerRef: { value: qbCustomerId },
      DocNumber: String(record.record_number),
      TxnDate: record.actual_completion_date || new Date().toISOString().split('T')[0],
      Line: invoiceLines,
      CustomerMemo: { value: record.job_description || `WO #${record.record_number}` },
    };

    const invoiceResult = await qbRequest('POST', '/invoice', invoiceBody);
    const qbInvoiceId = String(invoiceResult.Invoice.Id);

    // 6. Create QB Payment(s) linked to the invoice
    const { rows: payments } = await dbClient.query(
      `SELECT * FROM payments
       WHERE record_id = $1 AND deleted_at IS NULL
       ORDER BY payment_date, id`,
      [recordId]
    );

    for (const payment of payments) {
      const paymentBody = {
        CustomerRef: { value: qbCustomerId },
        TotalAmt: parseFloat(payment.amount),
        TxnDate: payment.payment_date,
        PaymentMethodRef: {
          value: PAYMENT_METHOD_MAP[payment.payment_method] || 'Other',
        },
        Line: [{
          Amount: parseFloat(payment.amount),
          LinkedTxn: [{
            TxnId: qbInvoiceId,
            TxnType: 'Invoice',
          }],
        }],
      };

      if (payment.check_number) {
        paymentBody.PaymentRefNum = payment.check_number;
      }

      await qbRequest('POST', '/payment', paymentBody);
    }

    // 7. Update ERP record with QB sync info
    await dbClient.query(
      `UPDATE records SET
         quickbooks_invoice_id = $1,
         quickbooks_synced_at = NOW()
       WHERE id = $2`,
      [qbInvoiceId, recordId]
    );

    await dbClient.query('COMMIT');

    // Refetch record for response
    const { rows: updated } = await pool.query(
      'SELECT quickbooks_invoice_id, quickbooks_synced_at FROM records WHERE id = $1',
      [recordId]
    );

    res.json({
      message: 'Successfully synced to QuickBooks',
      quickbooks_invoice_id: updated[0].quickbooks_invoice_id,
      quickbooks_synced_at: updated[0].quickbooks_synced_at,
      qb_customer_id: qbCustomerId,
      lines_synced: invoiceLines.length,
      payments_synced: payments.length,
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('POST /api/quickbooks/sync error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    dbClient.release();
  }
});

module.exports = router;
