/**
 * Shop-to-Bank Bridge — monthly reconciliation of operating production to
 * cash in the books.
 *
 * Two modules answer "revenue" differently and neither is wrong:
 *   Reports    = what the shop PRODUCED (work completed, storage billed, parts sold)
 *   Bookkeeping = what the bank RECEIVED (pure cash basis, journal_lines only)
 *
 * The gap between them is working capital: work finished but unpaid, deposits
 * held on open jobs, sales tax and card surcharge riding along in the deposit,
 * and processor settlement timing. This report names every step of that gap and
 * ends on an "unexplained" line with a hard tolerance.
 *
 * IMPORTANT — what "the books" means here. Journal entries are created ONLY by
 * the cowork-admin endpoint, i.e. posted at close from the bank statements. The
 * `transactions` table (Plaid feed + the storage ledger mirror) is a
 * categorisation staging area and does NOT feed the P&L. So the cash column of
 * this bridge reads journal_lines, exactly like the P&L, and never `payments`.
 * Tying to `payments` would prove nothing: that table is not the book of record.
 *
 * Ledger cutover is May 1, 2026. Jan-Apr 2026 lives in `historical_pnl` as QBO
 * summary data, so those months carry a produced side and a books side but
 * cannot be reconciled at the penny. `tieable` is false on them.
 */

const pool = require('../db/pool');

// 4000 Income - Service, 4002 Income - Storage, 4100 Sales of Product Income.
// 7000/7010 (cashback, interest) are Other Income and are NOT customer cash,
// so they stay out of a bridge that starts at work produced.
const INCOME_ACCOUNTS = ['4000', '4002', '4100'];

// Statuses that never represent produced work.
const NON_PRODUCING = ['void', 'estimate', 'filed'];

// Dollars of unexplained variance that are acceptable in a month.
const TOLERANCE = 100;

const zeros = () => Array(12).fill(0);
const num = (v) => Number(v || 0);
const r2 = (v) => Math.round(num(v) * 100) / 100;

module.exports = async function shopToBankBridge(req, res) {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const jan1 = `${year}-01-01`;

  try {
    // ---- 1. PRODUCED: work orders completed in the month ------------------
    // Attribution is actual_completion_date, NOT payment date. This is the
    // operating question ("what did the shop finish") and is deliberately a
    // different basis from the cash side. That difference is the whole report.
    const wo = await pool.query(
      `SELECT EXTRACT(MONTH FROM r.actual_completion_date)::int AS m,
              COALESCE(SUM(r.total_sales), 0)   AS gross,
              COALESCE(SUM(r.tax_amount), 0)    AS tax,
              COALESCE(SUM(r.cc_fee_amount), 0) AS fee,
              COUNT(*)                          AS n
         FROM records r
        WHERE r.deleted_at IS NULL
          AND r.status <> ALL($2)
          AND r.actual_completion_date IS NOT NULL
          AND EXTRACT(YEAR FROM r.actual_completion_date) = $1
        GROUP BY 1`,
      [year, NON_PRODUCING]
    );

    // ---- 2. COLLECTED: work-order cash, by PAYMENT date -------------------
    // Tax and surcharge are embedded in the payment, so each payment is split
    // proportionally against its record's own tax and fee ratio. A partial
    // payment therefore carries its fair share of tax, which is what a cash
    // basis needs.
    const woCash = await pool.query(
      `SELECT EXTRACT(MONTH FROM p.payment_date)::int AS m,
              COALESCE(SUM(p.amount), 0) AS gross,
              COALESCE(SUM(p.amount * COALESCE(r.tax_amount, 0)
                           / NULLIF(r.total_sales, 0)), 0) AS tax,
              COALESCE(SUM(p.amount * COALESCE(r.cc_fee_amount, 0)
                           / NULLIF(r.total_sales, 0)), 0) AS fee,
              COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'deposit'), 0) AS deposits,
              COALESCE(SUM(p.amount) FILTER (WHERE p.amount < 0), 0) AS refunds
         FROM payments p
         JOIN records r ON r.id = p.record_id
        WHERE p.deleted_at IS NULL
          AND r.deleted_at IS NULL
          AND EXTRACT(YEAR FROM p.payment_date) = $1
        GROUP BY 1`,
      [year]
    );

    // ---- 3. Storage billed for the month (the produced side) --------------
    const stBilled = await pool.query(
      `SELECT si.month::int AS m, COALESCE(SUM(si.rent), 0) AS billed, COUNT(*) AS n
         FROM storage_invoices si
        WHERE si.year = $1
        GROUP BY 1`,
      [year]
    );

    // ---- 4. Storage collected, by COLLECTION date -------------------------
    // storage_charges carries charge_date (when the money was taken) and the
    // amount actually charged including the card fee. storage_payment_status is
    // keyed to the billing month with no payment date, so it is the wrong basis
    // for cash and is returned only as a cross-check.
    const stCash = await pool.query(
      `SELECT EXTRACT(MONTH FROM sc.charge_date)::int AS m,
              COALESCE(SUM(sc.amount), 0) AS collected, COUNT(*) AS n
         FROM storage_charges sc
        WHERE EXTRACT(YEAR FROM sc.charge_date) = $1
        GROUP BY 1`,
      [year]
    );

    const stGrid = await pool.query(
      `SELECT sps.month::int AS m,
              COALESCE(SUM(COALESCE(sps.amount, sb.monthly_rate)), 0) AS marked_paid
         FROM storage_payment_status sps
         JOIN storage_billing sb ON sb.id = sps.storage_billing_id
        WHERE sps.status = 'paid' AND sps.year = $1
        GROUP BY 1`,
      [year]
    );

    // ---- 5. Parts counter sales -------------------------------------------
    // parts_sales has no payment-date column, so created_at is the only date
    // available for both sides. Over-the-counter sales are paid on the spot, so
    // the two bases coincide in practice, but this is the softest number here.
    const parts = await pool.query(
      `SELECT EXTRACT(MONTH FROM ps.created_at)::int AS m,
              COALESCE(SUM(ps.total_amount), 0)  AS gross,
              COALESCE(SUM(ps.tax_amount), 0)    AS tax,
              COALESCE(SUM(ps.cc_fee_amount), 0) AS fee,
              COALESCE(SUM(ps.amount_paid), 0)   AS paid,
              COUNT(*)                           AS n
         FROM parts_sales ps
        WHERE EXTRACT(YEAR FROM ps.created_at) = $1
        GROUP BY 1`,
      [year]
    );

    // ---- 6. THE BOOKS: income per the general ledger ----------------------
    const glLive = await pool.query(
      `SELECT EXTRACT(MONTH FROM je.entry_date)::int AS m,
              a.account_number,
              SUM(jl.credit - jl.debit) AS amount
         FROM journal_lines jl
         JOIN journal_entries je ON je.id = jl.journal_entry_id
         JOIN accounts a ON a.id = jl.account_id
        WHERE je.is_posted = TRUE
          AND a.account_number = ANY($2)
          AND EXTRACT(YEAR FROM je.entry_date) = $1
        GROUP BY 1, 2`,
      [year, INCOME_ACCOUNTS]
    );

    const glHist = await pool.query(
      `SELECT h.month::int AS m, h.account_number, SUM(h.amount) AS amount
         FROM historical_pnl h
        WHERE h.year = $1 AND h.account_number = ANY($2)
        GROUP BY 1, 2`,
      [year, INCOME_ACCOUNTS]
    );

    // ---- 7. Opening uncollected, everything before Jan 1 ------------------
    const { rows: [prior] } = await pool.query(
      `SELECT
         (SELECT COALESCE(SUM(r.total_sales), 0)
            FROM records r
           WHERE r.deleted_at IS NULL AND r.status <> ALL($2)
             AND r.actual_completion_date IS NOT NULL
             AND r.actual_completion_date < $1::date) AS invoiced_prior,
         (SELECT COALESCE(SUM(p.amount), 0)
            FROM payments p JOIN records r ON r.id = p.record_id
           WHERE p.deleted_at IS NULL AND r.deleted_at IS NULL
             AND r.status <> ALL($2)
             AND p.payment_date < $1::date) AS collected_prior`,
      [jan1, NON_PRODUCING]
    );

    // ---- 8. Actual open balance right now, the roll-forward's check -------
    const { rows: [openNow] } = await pool.query(
      `SELECT COALESCE(SUM(r.total_sales - COALESCE(r.total_collected, 0)), 0) AS open_amount,
              COUNT(*) AS n
         FROM records r
        WHERE r.deleted_at IS NULL AND r.status <> ALL($1)
          AND COALESCE(r.total_sales, 0) > COALESCE(r.total_collected, 0)`,
      [NON_PRODUCING]
    );

    // ---- assemble --------------------------------------------------------
    const put = (arr, rows, col) => {
      for (const row of rows) if (row.m >= 1 && row.m <= 12) arr[row.m - 1] = num(row[col]);
      return arr;
    };

    const woGross = put(zeros(), wo.rows, 'gross');
    const woTax = put(zeros(), wo.rows, 'tax');
    const woFee = put(zeros(), wo.rows, 'fee');
    const woCount = put(zeros(), wo.rows, 'n');

    const cashGross = put(zeros(), woCash.rows, 'gross');
    const cashTax = put(zeros(), woCash.rows, 'tax');
    const cashFee = put(zeros(), woCash.rows, 'fee');
    const cashDeposits = put(zeros(), woCash.rows, 'deposits');
    const cashRefunds = put(zeros(), woCash.rows, 'refunds');

    const storageBilled = put(zeros(), stBilled.rows, 'billed');
    const storageCash = put(zeros(), stCash.rows, 'collected');
    const storageGrid = put(zeros(), stGrid.rows, 'marked_paid');

    const partsGross = put(zeros(), parts.rows, 'gross');
    const partsTax = put(zeros(), parts.rows, 'tax');
    const partsFee = put(zeros(), parts.rows, 'fee');
    const partsPaid = put(zeros(), parts.rows, 'paid');

    const gl = { total: zeros(), byAccount: {} };
    for (const acct of INCOME_ACCOUNTS) gl.byAccount[acct] = zeros();
    for (const row of [...glLive.rows, ...glHist.rows]) {
      if (!(row.m >= 1 && row.m <= 12)) continue;
      const acct = String(row.account_number);
      if (!gl.byAccount[acct]) gl.byAccount[acct] = zeros();
      gl.byAccount[acct][row.m - 1] += num(row.amount);
      gl.total[row.m - 1] += num(row.amount);
    }

    // Roll-forward of uncollected work-order value. Opening balance can be
    // negative when deposits held exceed work invoiced, which is normal and
    // worth seeing rather than clamping to zero.
    let running = num(prior.invoiced_prior) - num(prior.collected_prior);
    const openingBalance = running;

    const months = [];
    for (let i = 0; i < 12; i++) {
      const producedWo = woGross[i] - woTax[i] - woFee[i];
      const producedStorage = storageBilled[i];
      const producedParts = partsGross[i] - partsTax[i] - partsFee[i];
      const totalProduced = producedWo + producedStorage + producedParts;

      const collectedGross = cashGross[i] + storageCash[i] + partsPaid[i];
      const taxCollected = cashTax[i] + partsTax[i];
      // Storage cash already includes its surcharge; the fee portion is not
      // separable from storage_charges.amount, so it is reported inside the
      // storage line rather than guessed at.
      const feeCollected = cashFee[i] + partsFee[i];
      const netRevenueCash = collectedGross - taxCollected;

      const openStart = running;
      running = running + woGross[i] - cashGross[i];
      const openEnd = running;

      const books = gl.total[i];
      const tieable = books !== 0 || totalProduced !== 0;
      const unexplained = netRevenueCash - books;

      months.push({
        month: i + 1,
        produced: {
          workOrders: r2(producedWo),
          storage: r2(producedStorage),
          parts: r2(producedParts),
          total: r2(totalProduced),
          workOrderCount: woCount[i],
        },
        collected: {
          workOrders: r2(cashGross[i]),
          storage: r2(storageCash[i]),
          parts: r2(partsPaid[i]),
          grossTotal: r2(collectedGross),
          deposits: r2(cashDeposits[i]),
          refunds: r2(cashRefunds[i]),
        },
        adjustments: {
          salesTaxCollected: r2(taxCollected),
          cardSurchargeCollected: r2(feeCollected),
          netRevenueCash: r2(netRevenueCash),
        },
        books: {
          glIncome: r2(books),
          byAccount: Object.fromEntries(
            Object.entries(gl.byAccount).map(([a, v]) => [a, r2(v[i])])
          ),
        },
        variance: {
          producedVsCollected: r2(totalProduced - netRevenueCash),
          unexplained: r2(unexplained),
          withinTolerance: Math.abs(unexplained) <= TOLERANCE,
          tieable,
        },
        rollForward: {
          openingUncollected: r2(openStart),
          invoicedGross: r2(woGross[i]),
          collectedGross: r2(cashGross[i]),
          closingUncollected: r2(openEnd),
        },
        crossCheck: {
          storageGridMarkedPaid: r2(storageGrid[i]),
          storageCashVsGrid: r2(storageCash[i] - storageGrid[i]),
        },
      });
    }

    const sum = (fn) => r2(months.reduce((a, m) => a + fn(m), 0));

    res.json({
      year,
      tolerance: TOLERANCE,
      // Months before the ledger cutover have no journal lines; historical_pnl
      // is QBO summary data and cannot be reconciled line by line.
      ledgerCutover: '2026-05-01',
      months,
      totals: {
        produced: sum((m) => m.produced.total),
        collectedGross: sum((m) => m.collected.grossTotal),
        salesTaxCollected: sum((m) => m.adjustments.salesTaxCollected),
        netRevenueCash: sum((m) => m.adjustments.netRevenueCash),
        glIncome: sum((m) => m.books.glIncome),
        unexplained: sum((m) => m.variance.unexplained),
      },
      rollForward: {
        openingUncollected: r2(openingBalance),
        closingUncollected: r2(running),
        actualOpenNow: r2(openNow.open_amount),
        openInvoiceCount: parseInt(openNow.n, 10),
        // If these disagree the roll-forward has lost something: a voided
        // record after payment, a deleted payment, or a record whose
        // total_sales changed after it was collected. Investigate before
        // trusting any month.
        drift: r2(num(running) - num(openNow.open_amount)),
      },
    });
  } catch (err) {
    console.error('GET /api/reports/shop-to-bank-bridge error:', err);
    res.status(500).json({ error: err.message });
  }
};
