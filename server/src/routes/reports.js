const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireRole } = require('../middleware/auth');

// GET /api/reports/financial — Financial report for date range
router.get('/financial', requireRole('admin', 'bookkeeper'), async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to dates required' });

  try {
    // Revenue from paid records in date range (by actual_completion_date or created_at)
    const { rows: [revenue] } = await pool.query(`
      SELECT
        COUNT(*) AS total_records,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
        COUNT(*) FILTER (WHERE status NOT IN ('paid', 'void')) AS open_count,
        COALESCE(SUM(labor_subtotal) FILTER (WHERE status = 'paid'), 0) AS labor,
        COALESCE(SUM(parts_subtotal) FILTER (WHERE status = 'paid'), 0) AS parts,
        COALESCE(SUM(freight_subtotal) FILTER (WHERE status = 'paid'), 0) AS misc,
        COALESCE(SUM(shop_supplies_amount) FILTER (WHERE status = 'paid'), 0) AS shop_supplies,
        COALESCE(SUM(tax_amount) FILTER (WHERE status = 'paid'), 0) AS tax,
        COALESCE(SUM(cc_fee_amount) FILTER (WHERE status = 'paid'), 0) AS cc_fees,
        COALESCE(SUM(total_sales) FILTER (WHERE status = 'paid'), 0) AS gross_revenue,
        COALESCE(AVG(total_sales) FILTER (WHERE status = 'paid'), 0) AS avg_invoice,
        COALESCE(MAX(total_sales) FILTER (WHERE status = 'paid'), 0) AS max_invoice
      FROM records
      WHERE deleted_at IS NULL
      AND COALESCE(actual_completion_date, created_at::date) BETWEEN $1 AND $2
    `, [from, to]);

    // Payments by method in date range
    const { rows: payments } = await pool.query(`
      SELECT payment_method, COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE deleted_at IS NULL
      AND payment_date BETWEEN $1 AND $2
      GROUP BY payment_method
      ORDER BY total DESC
    `, [from, to]);

    const totalPayments = payments.reduce((s, p) => s + parseFloat(p.total), 0);

    // Storage revenue in date range
    const { rows: [storage] } = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total,
        COUNT(*) AS charge_count
      FROM storage_charges
      WHERE charge_date BETWEEN $1 AND $2
    `, [from, to]);

    // Top customers by revenue
    const { rows: topCustomers } = await pool.query(`
      SELECT c.id, c.first_name, c.last_name, c.company_name,
             COUNT(r.id) AS record_count,
             SUM(r.total_sales) AS total_revenue
      FROM records r
      JOIN customers c ON c.id = r.customer_id
      WHERE r.deleted_at IS NULL AND r.status = 'paid'
      AND COALESCE(r.actual_completion_date, r.created_at::date) BETWEEN $1 AND $2
      GROUP BY c.id, c.first_name, c.last_name, c.company_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [from, to]);

    res.json({
      dateRange: { from, to },
      revenue: {
        labor: parseFloat(revenue.labor),
        parts: parseFloat(revenue.parts),
        misc: parseFloat(revenue.misc),
        shopSupplies: parseFloat(revenue.shop_supplies),
        tax: parseFloat(revenue.tax),
        ccFees: parseFloat(revenue.cc_fees),
        grossRevenue: parseFloat(revenue.gross_revenue),
        avgInvoice: parseFloat(revenue.avg_invoice),
        maxInvoice: parseFloat(revenue.max_invoice),
      },
      storage: {
        total: parseFloat(storage.total),
        chargeCount: parseInt(storage.charge_count),
      },
      workOrders: {
        total: parseInt(revenue.total_records),
        paid: parseInt(revenue.paid_count),
        open: parseInt(revenue.open_count),
      },
      payments: payments.map(p => ({
        method: p.payment_method,
        total: parseFloat(p.total),
        percent: totalPayments > 0 ? Math.round(parseFloat(p.total) / totalPayments * 100) : 0,
      })),
      totalPayments,
      topCustomers: topCustomers.map(c => ({
        id: c.id,
        name: `${c.last_name || ''}${c.first_name ? ', ' + c.first_name : ''}`,
        company: c.company_name,
        records: parseInt(c.record_count),
        revenue: parseFloat(c.total_revenue),
      })),
    });
  } catch (err) {
    console.error('GET /api/reports/financial error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
