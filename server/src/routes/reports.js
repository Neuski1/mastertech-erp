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

// GET /api/reports/technician-profitability — Technician profitability report
router.get('/technician-profitability', requireRole('admin'), async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to dates required' });

  try {
    const { rows } = await pool.query(`
      SELECT
        t.id AS technician_id,
        t.name AS technician_name,
        COALESCE(t.hourly_wage, 0) AS hourly_wage,
        COUNT(DISTINCT ll.record_id) AS job_count,
        COALESCE(SUM(ll.hours), 0) AS billed_hours,
        COALESCE(SUM(ll.line_total), 0) AS labor_revenue
      FROM technicians t
      LEFT JOIN record_labor_lines ll ON ll.technician_id = t.id
        AND ll.deleted_at IS NULL
        AND ll.record_id IN (
          SELECT id FROM records
          WHERE deleted_at IS NULL AND status NOT IN ('void')
          AND COALESCE(actual_completion_date, created_at::date) BETWEEN $1 AND $2
        )
      WHERE t.deleted_at IS NULL AND t.is_active = TRUE
      GROUP BY t.id, t.name, t.hourly_wage
      ORDER BY COALESCE(SUM(ll.line_total), 0) DESC
    `, [from, to]);

    const laborRate = 198; // system rate
    const techs = rows.map(r => {
      const hours = parseFloat(r.billed_hours);
      const revenue = parseFloat(r.labor_revenue);
      const wage = parseFloat(r.hourly_wage);
      const wageCost = hours * wage;
      const profit = revenue - wageCost;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
      return {
        id: r.technician_id,
        name: r.technician_name,
        hourlyWage: wage,
        jobs: parseInt(r.job_count),
        hours,
        revenue,
        wageCost: Math.round(wageCost * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin,
      };
    });

    const totals = {
      jobs: techs.reduce((s, t) => s + t.jobs, 0),
      hours: techs.reduce((s, t) => s + t.hours, 0),
      revenue: techs.reduce((s, t) => s + t.revenue, 0),
      wageCost: techs.reduce((s, t) => s + t.wageCost, 0),
    };
    totals.profit = Math.round((totals.revenue - totals.wageCost) * 100) / 100;
    totals.margin = totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 1000) / 10 : 0;
    totals.avgRate = totals.hours > 0 ? Math.round((totals.revenue / totals.hours) * 100) / 100 : 0;

    res.json({ technicians: techs, totals, laborRate });
  } catch (err) {
    console.error('GET /api/reports/technician-profitability error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
