// server/src/routes/storage-revenue.js
//
// Pulls storage revenue (and Square processing fees) from Square Invoices.
// Per Carol: every Square invoice = storage. Square is only used for storage
// invoicing; service is collected via Square Terminal which is NOT invoiced.
//
// Endpoint:
//   GET /api/bookkeeping/storage-revenue?year=2026&month=5
//   -> { gross, fees, net, invoiceCount, invoices: [...] }

const express = require('express');
const { client, locationId } = require('../services/square');

const router = express.Router();

function monthRange(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

router.get('/', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const { startISO, endISO } = monthRange(year, month);

    // 1) List invoices for this location. Square SDK v44 returns iterators.
    const invoices = [];
    const pager = await client.invoices.list({ locationId });
    for await (const inv of pager) {
      if (!inv) continue;
      // Filter invoices that have a payment in our date range
      // Use updated_at as a proxy; we filter by payment time below
      invoices.push(inv);
    }

    // 2) For each invoice, find paid payment requests in this month
    let gross = 0;
    let fees = 0;
    const matched = [];

    for (const inv of invoices) {
      if (!inv.paymentRequests) continue;
      for (const pr of inv.paymentRequests) {
        // Check the most recent computed paid date
        // Square stores total in pr.totalCompletedAmountMoney
        const paidAmt = pr.totalCompletedAmountMoney?.amount;
        if (!paidAmt) continue;

        // Get payment time from associated payment if available
        // Use inv.timezone but Square offers paid_at via invoice.status updates
        // Practical approach: filter using invoice.updated_at after status PAID
        const updated = inv.updatedAt || inv.createdAt;
        if (!updated) continue;
        const ts = new Date(updated).toISOString();
        if (ts < startISO || ts > endISO) continue;
        if (inv.status !== 'PAID' && inv.status !== 'PARTIALLY_PAID') continue;

        const cents = Number(paidAmt);
        gross += cents;

        // Look up the linked payment to get processing fee
        try {
          // Square API: invoice payments are referenced by invoice_id on payment
          // Simpler approach: list payments by invoice_id via SearchPayments
          const payments = await client.payments.search({
            query: {
              filter: { customerIds: inv.primaryRecipient?.customerId ? [inv.primaryRecipient.customerId] : undefined,
                        createdAt: { startAt: startISO, endAt: endISO } },
            },
          });
          for await (const p of payments) {
            // Match payment to this invoice via note or amount
            if (p?.totalMoney?.amount && Number(p.totalMoney.amount) === cents) {
              const fee = (p.processingFee || []).reduce((s, f) => s + Number(f.amountMoney?.amount || 0), 0);
              fees += fee;
              matched.push({
                invoiceId: inv.id,
                paymentId: p.id,
                amount: cents / 100,
                fee: fee / 100,
                sourceType: p.sourceType,
              });
              break;
            }
          }
        } catch (e) {
          // Fee lookup failed - leave as 0 for this invoice
          matched.push({ invoiceId: inv.id, amount: cents / 100, fee: 0, sourceType: 'unknown', feeError: e.message });
        }
      }
    }

    res.json({
      year, month,
      gross: gross / 100,
      fees: fees / 100,
      net: (gross - fees) / 100,
      invoiceCount: matched.length,
      invoices: matched,
    });
  } catch (err) {
    console.error('storage-revenue error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
