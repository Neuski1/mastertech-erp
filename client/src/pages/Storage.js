import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { useAuth } from '../context/AuthContext';
import NewCustomerModal from '../components/NewCustomerModal';
import HelpYouSellTab from '../components/HelpYouSellTab';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';
import { formatDate, formatDateTime } from '../utils/dateFormat';

// Billing visibility for one storage box: what invoice actually went out, and
// what the card actually did. Added Aug 31, 2026 — before this there was no way
// to see either without waiting for the 3rd-of-month payment summary email.
const BILLING_MONTHS = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];

const TONE = {
  ok:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#065f46' },
  warn: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  bad:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
};

function billingLines(space) {
  const money = (n) => '$' + Number(n || 0).toFixed(2);
  const when = (v) => v
    ? new Date(v).toLocaleString('en-US', { timeZone: 'America/Denver',
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;
  const period = space.inv_month ? `${BILLING_MONTHS[space.inv_month - 1]} ${space.inv_year}` : null;

  const invoice = space.inv_sent_at
    ? { tone: 'ok', text: `${period} invoice, ${money(space.inv_total)}, emailed ${when(space.inv_sent_at)}` }
    : { tone: 'warn', text: 'No invoice has ever been emailed for this space' };

  // A decline for the current period is always worth showing, even after the
  // box has been taken off autopay, otherwise the reason silently disappears.
  const samePeriod = space.charge_year === space.inv_year && space.charge_month === space.inv_month;
  const thisPeriodCharge = space.charge_status && samePeriod ? space.charge_status : null;
  let charge;
  if (thisPeriodCharge === 'paid') {
    charge = { tone: 'ok', text: `Card charged ${money(space.charge_amount)} on ${when(space.charge_attempted_at)}` };
  } else if (space.paid_status === 'paid') {
    charge = { tone: 'ok', text: `Marked paid${space.paid_source ? ` (${space.paid_source})` : ''}` };
  } else if (thisPeriodCharge === 'failed' || thisPeriodCharge === 'failed_final') {
    const tail = thisPeriodCharge === 'failed_final'
      ? ' Retried once and gave up.'
      : space.autopay_enabled ? ' Will retry in about 3 days.' : ' Autopay is now off for this space.';
    charge = { tone: 'bad', text: `Card DECLINED ${when(space.charge_attempted_at)} — ${space.charge_error || 'no reason recorded'}.${tail}` };
  } else if (thisPeriodCharge === 'pending') {
    charge = { tone: 'bad', text: 'Charge started and never finished — check Square before retrying' };
  } else if (!space.autopay_enabled) {
    charge = { tone: 'warn', text: 'Not on autopay — waiting on the customer to pay' };
  } else {
    charge = { tone: 'warn', text: `No charge has been attempted for ${period || 'this period'}` };
  }
  return { invoice, charge };
}

function BillingStatusPanel({ space, compact }) {
  if (!space || !space.billing_id) return null;
  const { invoice, charge } = billingLines(space);
  const row = (item, label) => (
    <div style={{ fontSize: compact ? '0.75rem' : '0.8rem', padding: '6px 9px', borderRadius: '4px',
                  marginBottom: '6px', backgroundColor: TONE[item.tone].bg,
                  border: `1px solid ${TONE[item.tone].border}`, color: TONE[item.tone].text }}>
      <strong>{label}: </strong>{item.text}
    </div>
  );
  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc',
                  borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing</div>
      {row(invoice, 'Invoice')}
      {row(charge, 'Payment')}
    </div>
  );
}

export default function Storage() {
  const { isAdmin, canEditRecords, canSeeFinancials } = useAuth();
  const location = useLocation();
  const [waitlistPrefill, setWaitlistPrefill] = useState(null);
  const [showRateIncrease, setShowRateIncrease] = useState(false);
  const [spaces, setSpaces] = useState([]);
  const [summary, setSummary] = useState(null);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Modal state
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Inline per-box editor: id of the occupied space expanded in place (no modal).
  const [expandedId, setExpandedId] = useState(null);
  const [emailSpace, setEmailSpace] = useState(null); // storage box whose customer we are emailing

  // Billing report
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportLoading, setReportLoading] = useState(false);

  // Billing run
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingPreview, setBillingPreview] = useState(null);
  const [billingMonth, setBillingMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [previewLoading, setPreviewLoading] = useState(false);
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResults, setBillingResults] = useState(null);

  // Add space modal
  const [showAddSpace, setShowAddSpace] = useState(false);

  // Waitlist state
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'waitlist' | 'helpyousell'
  const [waitlist, setWaitlist] = useState([]);
  const [waitlistCounts, setWaitlistCounts] = useState({ indoor: 0, outdoor: 0 });
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [notifyEntry, setNotifyEntry] = useState(null);
  const [showAddWaitlist, setShowAddWaitlist] = useState(false);
  const [showWaitlistDetail, setShowWaitlistDetail] = useState(null);
  const [waitlistFilter, setWaitlistFilter] = useState('all'); // 'all' | 'indoor' | 'outdoor'

  const fetchWaitlist = useCallback(async () => {
    setWaitlistLoading(true);
    try {
      const params = {};
      if (waitlistFilter !== 'all') params.space_type = waitlistFilter;
      const data = await api.getStorageWaitlist(params);
      setWaitlist(data.entries);
      setWaitlistCounts(data.counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setWaitlistLoading(false);
    }
  }, [waitlistFilter]);

  useEffect(() => { if (activeTab === 'waitlist') fetchWaitlist(); }, [activeTab, fetchWaitlist]);
  useEffect(() => {
    const fromLead = location.state?.addWaitlistFromLead;
    if (fromLead) {
      setActiveTab('waitlist');
      setWaitlistPrefill(fromLead);
      setShowAddWaitlist(true);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move a waitlist person to a new rank. The backend resequences the whole
  // active list to stay contiguous, so we just refetch afterward.
  const handleRankChange = useCallback(async (entryId, currentRank, value) => {
    const newRank = parseInt(value, 10);
    if (isNaN(newRank) || newRank === currentRank) return;
    try {
      await api.updateWaitlistEntry(entryId, { position: newRank });
      await fetchWaitlist();
    } catch (err) {
      setError(err.message);
      fetchWaitlist();
    }
  }, [fetchWaitlist]);

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStorageSpaces();
      setSpaces(data.spaces);
      setSummary(data.summary);
      setRates(data.rates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  // --- Payment grid (12-month Paid/Unpaid/Partial per box) ---
  const [grid, setGrid] = useState({ months: [], byBilling: {} });
  const [gridSyncing, setGridSyncing] = useState(false);

  const fetchGrid = useCallback(async () => {
    try {
      const data = await api.getStoragePaymentGrid();
      const byBilling = {};
      (data.boxes || []).forEach(b => { byBilling[b.billing_id] = b; });
      setGrid({ months: data.months || [], byBilling });
    } catch (err) {
      // Non-fatal — the grid simply won't render.
      console.error('Payment grid load failed:', err.message);
    }
  }, []);

  useEffect(() => { fetchGrid(); }, [fetchGrid]);

  // Refresh everything the spaces tab shows (boxes + payment grid) after any
  // create/update, so the view always reflects fresh server data — mirrors the
  // records module's single refetch-after-mutation pattern. A charge edit or a
  // billing run changes both the box and its payment grid, so both must reload.
  const refreshSpaces = useCallback(async () => {
    await Promise.all([fetchSpaces(), fetchGrid()]);
  }, [fetchSpaces, fetchGrid]);

  // Keep spaces/payment grid current across computers without a manual refresh.
  useAutoRefresh(refreshSpaces);

  const handleSyncSquare = async () => {
    setGridSyncing(true);
    try {
      const data = await api.syncStoragePaymentGrid();
      const byBilling = {};
      (data.boxes || []).forEach(b => { byBilling[b.billing_id] = b; });
      setGrid({ months: data.months || [], byBilling });
      const s = data.sync || {};
      setActionMsg(`Square sync: matched ${s.matched || 0} invoice(s) to ${s.boxesSynced || 0}/${s.boxes || 0} box(es); ${s.cellsUpserted || 0} month(s) updated; ${s.unmatched || 0} unmatched (of ${s.invoicesScanned || 0} scanned).`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGridSyncing(false);
    }
  };

  // Click cycles the manual override: auto → paid → partial → unpaid → auto
  const nextManualStatus = (cell) => {
    if (cell.source !== 'manual') return 'paid';
    if (cell.status === 'paid') return 'partial';
    if (cell.status === 'partial') return 'unpaid';
    return 'auto'; // manual unpaid → clear back to auto
  };

  const handleCellToggle = async (billingId, cell) => {
    if (!canEditRecords) return;
    const status = nextManualStatus(cell);

    // Marking a month collected posts income to the books, so it needs the
    // amount that actually landed. A Zelle or check is rarely the invoice
    // figure to the penny. Prefill with whatever the cell already knows.
    let amount;
    if (status === 'paid' || status === 'partial') {
      const suggested = cell.amount != null ? Number(cell.amount).toFixed(2) : '';
      const entered = window.prompt(
        `Amount actually collected for ${cell.month}/${cell.year}?`,
        suggested
      );
      if (entered === null) return; // cancelled, leave the cell alone
      const parsed = Number(String(entered).replace(/[$,\s]/g, ''));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError('Enter a dollar amount, for example 124.25');
        return;
      }
      amount = parsed;
    }

    try {
      await api.setStoragePaymentOverride({
        storage_billing_id: billingId,
        year: cell.year,
        month: cell.month,
        status,
        ...(amount !== undefined ? { amount } : {}),
      });
      await fetchGrid();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSpaceClick = (space) => {
    if (space.billing_id) {
      // Occupied: toggle the inline editor in place (no modal).
      setExpandedId((prev) => (prev === space.id ? null : space.id));
    } else if (canEditRecords) {
      setSelectedSpace(space);
      setShowAssign(true);
    }
  };

  // Open the full DetailModal (End storage, contract, Square IDs) from the inline editor.
  const handleOpenFull = (space) => {
    setSelectedSpace(space);
    setShowDetail(true);
  };

  const fetchBillingPreview = async (m) => {
    setPreviewLoading(true);
    try {
      const preview = await api.getBillingPreview(m);
      setBillingPreview(preview);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenBilling = async () => {
    await fetchBillingPreview(billingMonth);
    setShowBillingModal(true);
  };

  const handleBillingMonthChange = (m) => {
    setBillingMonth(m);
    fetchBillingPreview(m);
  };

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const data = await api.getStorageBillingReport({ month: reportMonth });
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!report || !report.billings) return;
    const money = (v) => '$' + (parseFloat(v) || 0).toFixed(2);
    const dt = (d) => d ? new Date(String(d).split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—';
    const rows = report.billings.map(b => {
      const cust = `${b.last_name || ''}${b.first_name ? ', ' + b.first_name : ''}${b.company_name ? ' (' + b.company_name + ')' : ''}`;
      const unit = [b.unit_year, b.unit_make, b.unit_model].filter(Boolean).join(' ') || '—';
      const linked = (b.square_sub_id && String(b.square_sub_id).trim()) ? 'Linked' : 'Not linked';
      return `<tr><td>${b.space_label || ''}</td><td>${b.space_type || ''}</td><td>${cust}</td><td>${unit}</td><td style="text-align:right">${money(b.monthly_rate)}</td><td>${dt(b.billing_start_date)}</td><td>${linked}</td></tr>`;
    }).join('');
    const html = `<!doctype html><html><head><title>Storage Billing Report — ${reportMonth}</title>
      <style>body{font-family:Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px;margin:0 0 4px}.sub{color:#555;font-size:13px;margin:0 0 16px}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f0f0f0}
      tfoot td{font-weight:bold}@media print{button{display:none}}</style></head>
      <body><h1>Master Tech RV — Storage Billing Report</h1>
      <p class="sub">Month: ${reportMonth} &nbsp;|&nbsp; Active billings: ${report.total_active} &nbsp;|&nbsp; Total monthly: ${money(report.total_monthly_revenue)}</p>
      <table><thead><tr><th>Space</th><th>Type</th><th>Customer</th><th>Unit</th><th style="text-align:right">Rate</th><th>Start</th><th>Square Sync</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4">Total (${report.total_active} customers)</td><td style="text-align:right">${money(report.total_monthly_revenue)}</td><td colspan="2"></td></tr></tfoot></table>
      <script>window.onload=function(){window.print();}</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const numSort = (a, b) => {
    const na = parseInt((a.label || '').replace(/\D/g, '')) || Infinity;
    const nb = parseInt((b.label || '').replace(/\D/g, '')) || Infinity;
    return na - nb;
  };
  const outdoor = spaces.filter(s => s.space_type === 'outdoor').sort(numSort);
  const indoor = spaces.filter(s => s.space_type === 'indoor').sort(numSort);

  // Only show the full-page loader on the FIRST load. Refetches (e.g. after an
  // inline edit) keep the grid mounted so the scroll position is preserved.
  if (loading && spaces.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ margin: 0 }}>Storage</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activeTab === 'spaces' && canSeeFinancials && (
            <button onClick={() => { setShowReport(!showReport); if (!showReport) fetchReport(); }} style={btnSecondary}>
              {showReport ? 'Hide Report' : 'Billing Report'}
            </button>
          )}
          {activeTab === 'spaces' && canEditRecords && (
            <button onClick={handleSyncSquare} disabled={gridSyncing} style={{ ...btnSecondary, opacity: gridSyncing ? 0.6 : 1 }}>
              {gridSyncing ? 'Syncing…' : '⟳ Sync from Square'}
            </button>
          )}
          {activeTab === 'spaces' && (isAdmin || canEditRecords) && (
            <button onClick={() => { setSelectedSpace(null); setShowAssign(true); }} style={btnPrimary}>+ New Contract</button>
          )}
          {activeTab === 'spaces' && isAdmin && (
            <button onClick={() => setShowAddSpace(true)} style={btnSecondary}>+ Add Space</button>
          )}
          {activeTab === 'spaces' && isAdmin && (
            <button onClick={() => setShowRateIncrease(true)} style={btnSecondary}>Rate Increase</button>
          )}
          {activeTab === 'spaces' && isAdmin && (
            <button onClick={handleOpenBilling} style={btnPrimary}>
              Run Monthly Billing
            </button>
          )}
          {activeTab === 'waitlist' && (isAdmin || canEditRecords) && (
            <button onClick={() => setShowAddWaitlist(true)} style={btnPrimary}>
              + Add to Waitlist
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <button onClick={() => setActiveTab('spaces')} style={{
          padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
          border: 'none', borderBottom: activeTab === 'spaces' ? '2px solid #1e3a5f' : '2px solid transparent',
          color: activeTab === 'spaces' ? '#1e3a5f' : '#6b7280',
          backgroundColor: 'transparent', marginBottom: '-2px',
        }}>Spaces</button>
        <button onClick={() => setActiveTab('waitlist')} style={{
          padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
          border: 'none', borderBottom: activeTab === 'waitlist' ? '2px solid #1e3a5f' : '2px solid transparent',
          color: activeTab === 'waitlist' ? '#1e3a5f' : '#6b7280',
          backgroundColor: 'transparent', marginBottom: '-2px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          Waitlist
          {(waitlistCounts.indoor + waitlistCounts.outdoor) > 0 && (
            <span style={{
              backgroundColor: '#f59e0b', color: '#fff', borderRadius: '10px',
              padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
            }}>{waitlistCounts.indoor + waitlistCounts.outdoor}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('helpyousell')} style={{
          padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
          border: 'none', borderBottom: activeTab === 'helpyousell' ? '2px solid #1e3a5f' : '2px solid transparent',
          color: activeTab === 'helpyousell' ? '#1e3a5f' : '#6b7280',
          backgroundColor: 'transparent', marginBottom: '-2px',
        }}>Help You Sell</button>
      </div>

      {error && <div style={errorBanner}>{error} <button onClick={() => setError('')} style={closeBtnStyle}>x</button></div>}
      {actionMsg && <div style={successBanner}>{actionMsg} <button onClick={() => setActionMsg('')} style={closeBtnStyle}>x</button></div>}

      {activeTab === 'spaces' && <>
      {/* Summary Bar */}
      {summary && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <SummaryCard label="Outdoor" occupied={summary.outdoor.occupied} total={summary.outdoor.total} color="#f59e0b" />
          <SummaryCard label="Indoor" occupied={summary.indoor.occupied} total={summary.indoor.total} color="#3b82f6" />
          <SummaryCard label="Total" occupied={summary.outdoor.occupied + summary.indoor.occupied} total={summary.total} color="#1e3a5f" />
        </div>
      )}

      {/* Billing Report */}
      {showReport && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ ...sectionTitle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Billing Report</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} style={inputStyle} />
              <button onClick={fetchReport} disabled={reportLoading} style={btnSmall}>
                {reportLoading ? '...' : 'Load'}
              </button>
              <button onClick={handlePrintReport} disabled={!report || reportLoading} style={btnSmall}>Print</button>
            </div>
          </div>
          {report && (
            <>
              <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280' }}>
                Active billings: {report.total_active} — Total monthly: {formatCurrency(report.total_monthly_revenue)}
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Space</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Unit</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Rate</th>
                    <th style={thStyle}>Start</th>
                    <th style={thStyle}>Square Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {report.billings.map(b => (
                    <tr key={b.id}>
                      <td style={tdStyle}>{b.space_label}</td>
                      <td style={tdStyle}>{b.space_type}</td>
                      <td style={tdStyle}>
                        {b.last_name}{b.first_name ? `, ${b.first_name}` : ''}
                        {b.company_name && <span style={{ color: '#6b7280', marginLeft: '4px' }}>({b.company_name})</span>}
                      </td>
                      <td style={tdStyle}>{[b.unit_year, b.unit_make, b.unit_model].filter(Boolean).join(' ') || '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(b.monthly_rate)}</td>
                      <td style={tdStyle}>{b.billing_start_date ? new Date(String(b.billing_start_date).split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '\u2014'}</td>
                      <td style={tdStyle}>{(b.square_sub_id && String(b.square_sub_id).trim()) ? <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>Linked</span> : <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>Not linked</span>}</td>
                    </tr>
                  ))}
                  {report.billings.length === 0 && (
                    <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No billings for this month</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Payment grid legend */}
      <PaymentLegend />

      {/* Outdoor Grid */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Outdoor Spaces ({outdoor.filter(s => s.billing_id).length}/{outdoor.length} occupied)</h2>
        <div style={gridStyle}>
          {outdoor.map(space => (
            <React.Fragment key={space.id}>
              <SpaceCard space={space} onClick={() => handleSpaceClick(space)} canSeeFinancials={canSeeFinancials}
                gridBox={grid.byBilling[space.billing_id]} gridMonths={grid.months}
                canEdit={canEditRecords} onCellToggle={handleCellToggle}
                isExpanded={expandedId === space.id} onEmail={setEmailSpace} />
              {expandedId === space.id && space.billing_id && canEditRecords && (
                <div style={expandedEditorStyle}>
                  <InlineBoxEditor space={space} canSeeFinancials={canSeeFinancials}
                    onChanged={refreshSpaces} onOpenFull={() => handleOpenFull(space)} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Indoor Grid */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Indoor Spaces ({indoor.filter(s => s.billing_id).length}/{indoor.length} occupied)</h2>
        <div style={gridStyle}>
          {indoor.map(space => (
            <React.Fragment key={space.id}>
              <SpaceCard space={space} onClick={() => handleSpaceClick(space)} canSeeFinancials={canSeeFinancials}
                gridBox={grid.byBilling[space.billing_id]} gridMonths={grid.months}
                canEdit={canEditRecords} onCellToggle={handleCellToggle}
                isExpanded={expandedId === space.id} onEmail={setEmailSpace} />
              {expandedId === space.id && space.billing_id && canEditRecords && (
                <div style={expandedEditorStyle}>
                  <InlineBoxEditor space={space} canSeeFinancials={canSeeFinancials}
                    onChanged={refreshSpaces} onOpenFull={() => handleOpenFull(space)} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Billing Run Results */}
      {billingResults && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={sectionTitle}>Billing Run Results — {billingResults.charge_month}</h2>
            <button onClick={() => setBillingResults(null)} style={btnSecondary}>Dismiss</button>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.85rem' }}>
            <span style={{ color: '#065f46' }}>Recorded: {billingResults.recorded}</span>
            <span style={{ fontWeight: 600 }}>Total: {formatCurrency(billingResults.total_amount)}</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Space</th>
                <th style={thStyle}>Customer</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {billingResults.results.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.space}</td>
                  <td style={tdStyle}>{r.customer}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      </>}

      {/* ===== WAITLIST TAB ===== */}
      {activeTab === 'waitlist' && (
        <div>
          {/* Waitlist Summary */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div onClick={() => setWaitlistFilter('all')} style={{
              flex: '1', minWidth: '120px', padding: '14px 18px', borderRadius: '8px',
              backgroundColor: waitlistFilter === 'all' ? '#1e3a5f' : '#fff',
              color: waitlistFilter === 'all' ? '#fff' : '#1e3a5f',
              border: '1px solid #e5e7eb', cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{waitlistCounts.indoor + waitlistCounts.outdoor}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Waiting</div>
            </div>
            <div onClick={() => setWaitlistFilter('outdoor')} style={{
              flex: '1', minWidth: '120px', padding: '14px 18px', borderRadius: '8px',
              backgroundColor: waitlistFilter === 'outdoor' ? '#f59e0b' : '#fff',
              color: waitlistFilter === 'outdoor' ? '#fff' : '#92400e',
              border: '1px solid #e5e7eb', cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{waitlistCounts.outdoor}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Outdoor</div>
            </div>
            <div onClick={() => setWaitlistFilter('indoor')} style={{
              flex: '1', minWidth: '120px', padding: '14px 18px', borderRadius: '8px',
              backgroundColor: waitlistFilter === 'indoor' ? '#3b82f6' : '#fff',
              color: waitlistFilter === 'indoor' ? '#fff' : '#1e40af',
              border: '1px solid #e5e7eb', cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{waitlistCounts.indoor}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Indoor</div>
            </div>
          </div>

          {/* Waitlist Table */}
          <div style={sectionStyle}>
            <h2 style={sectionTitle}>
              {waitlistFilter === 'all' ? 'All Waitlist' : waitlistFilter === 'indoor' ? 'Indoor Waitlist' : 'Outdoor Waitlist'}
            </h2>
            {waitlistLoading ? <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Loading...</div> : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>RV</th>
                    <th style={thStyle}>Length</th>
                    <th style={thStyle}>Requested Start</th>
                    <th style={thStyle}>Notes</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry, idx) => {
                    const name = entry.cust_first ? `${entry.cust_first} ${entry.cust_last}` : entry.contact_name || '—';
                    const phone = entry.cust_phone || entry.contact_phone || '';
                    const emailAddr = entry.cust_email || entry.contact_email || '';
                    const rv = [entry.rv_year, entry.rv_make, entry.rv_model].filter(Boolean).join(' ') || '—';
                    return (
                      <React.Fragment key={entry.id}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => setShowWaitlistDetail(entry)}>
                        <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                          {(isAdmin || canEditRecords) ? (
                            <input
                              type="number"
                              min="1"
                              defaultValue={idx + 1}
                              key={`rank-${entry.id}-${idx + 1}`}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                              onBlur={(e) => handleRankChange(entry.id, idx + 1, e.target.value)}
                              style={{ width: '44px', padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center' }}
                            />
                          ) : (idx + 1)}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{name}</td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.8rem' }}>{formatPhone(phone)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emailAddr}</div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: entry.space_type === 'indoor' ? '#dbeafe' : '#fef3c7',
                            color: entry.space_type === 'indoor' ? '#1e40af' : '#92400e',
                          }}>{entry.space_type}</span>
                        </td>
                        <td style={tdStyle}>{rv}</td>
                        <td style={tdStyle}>{entry.rv_length_feet ? `${entry.rv_length_feet} ft` : '—'}</td>
                        <td style={tdStyle}>
                          {entry.preferred_start ? (() => {
                            const raw = entry.preferred_start.toString().slice(0, 10);
                            const d = new Date(raw + 'T00:00:00');
                            if (isNaN(d)) return '—';
                            const now = new Date(); now.setHours(0,0,0,0);
                            return (
                              <span style={{
                                fontWeight: 600,
                                color: d <= now ? '#dc2626' : '#065f46',
                              }}>
                                {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            );
                          })() : '—'}
                        </td>
                        <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#6b7280' }}>
                          {entry.notes || '—'}
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: entry.status === 'waiting' ? '#f0fdf4' : entry.status === 'notified' ? '#fefce8' : '#f3f4f6',
                            color: entry.status === 'waiting' ? '#065f46' : entry.status === 'notified' ? '#854d0e' : '#6b7280',
                          }}>{entry.status}</span>
                        </td>
                        <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {(entry.status === 'waiting' || entry.status === 'notified') && (
                              <button onClick={() => setNotifyEntry(entry)}
                                      style={{ ...btnTinyGray, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>
                                {entry.status === 'notified' ? 'Re-notify' : 'Notify'}
                              </button>
                            )}
                            <button onClick={async () => {
                              if (window.confirm('Remove from waitlist?')) {
                                try {
                                  await api.removeFromWaitlist(entry.id);
                                  setActionMsg('Removed from waitlist');
                                  fetchWaitlist();
                                } catch (err) { setError(err.message); }
                              }
                            }} style={btnTinyGray}>Remove</button>
                          </div>
                        </td>
                      </tr>
                      </React.Fragment>
                    );
                  })}
                  {waitlist.length === 0 && (
                    <tr><td colSpan={11} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                      No one on the waitlist{waitlistFilter !== 'all' ? ` for ${waitlistFilter} storage` : ''}
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===== HELP YOU SELL TAB ===== */}
      {activeTab === 'helpyousell' && (
        <HelpYouSellTab flash={(msg) => setActionMsg(msg)} />
      )}

      {/* Email a storage customer */}
      {emailSpace && (
        <EmailCustomerModal
          space={emailSpace}
          onClose={() => setEmailSpace(null)}
          onSent={(msg) => { setEmailSpace(null); setActionMsg(msg); }}
        />
      )}

      {/* Waitlist Edit Modal */}
      {showWaitlistDetail && (
        <EditWaitlistModal
          rates={rates}
          entry={showWaitlistDetail}
          onClose={() => setShowWaitlistDetail(null)}
          onSaved={() => { setShowWaitlistDetail(null); setActionMsg('Waitlist entry updated'); fetchWaitlist(); }}
        />
      )}

      {/* Waitlist Notify Modal — optional personal message before send */}
      {notifyEntry && (
        <WaitlistNotifyModal
          entry={notifyEntry}
          onClose={() => setNotifyEntry(null)}
          onSent={(msg) => { setNotifyEntry(null); setActionMsg(msg); fetchWaitlist(); }}
        />
      )}

      {/* Add to Waitlist Modal */}
      {showAddWaitlist && (
        <AddWaitlistModal
          rates={rates}
          prefill={waitlistPrefill}
          onClose={() => { setShowAddWaitlist(false); setWaitlistPrefill(null); }}
          onAdded={async () => {
            setShowAddWaitlist(false);
            setActionMsg('Added to waitlist');
            fetchWaitlist();
            if (waitlistPrefill?.leadId) {
              try { await api.deleteLead(waitlistPrefill.leadId); } catch (e) {}
            }
            setWaitlistPrefill(null);
          }}
        />
      )}

      {/* Assign Modal (also the standalone New Contract builder) */}
      {showAssign && (
        <AssignModal
          space={selectedSpace}
          allSpaces={spaces}
          rates={rates}
          onClose={() => { setShowAssign(false); setSelectedSpace(null); }}
          onAssigned={() => { setShowAssign(false); setSelectedSpace(null); setActionMsg(selectedSpace ? 'Space assigned' : 'Contract created'); refreshSpaces(); }}
        />
      )}

      {showRateIncrease && (
        <RateIncreaseModal
          onClose={() => setShowRateIncrease(false)}
          onApplied={() => { setShowRateIncrease(false); refreshSpaces(); fetchWaitlist(); }}
        />
      )}

      {/* Add Space Modal */}
      {showAddSpace && (
        <AddSpaceModal
          onClose={() => setShowAddSpace(false)}
          onCreated={() => { setShowAddSpace(false); setActionMsg('Space added'); refreshSpaces(); }}
        />
      )}

      {/* Detail Modal */}
      {showDetail && selectedSpace && (
        <DetailModal
          space={selectedSpace}
          allSpaces={spaces}
          canEdit={canEditRecords}
          isAdmin={isAdmin}
          canSeeFinancials={canSeeFinancials}
          onClose={() => { setShowDetail(false); setSelectedSpace(null); }}
          onUpdated={() => { setShowDetail(false); setSelectedSpace(null); setActionMsg('Storage updated'); refreshSpaces(); }}
        />
      )}

      {/* Billing Confirmation Modal */}
      {showBillingModal && billingPreview && (
        <BillingConfirmModal
          preview={billingPreview}
          month={billingMonth}
          loading={previewLoading}
          onMonthChange={handleBillingMonthChange}
          running={billingRunning}
          onClose={() => { setShowBillingModal(false); setBillingPreview(null); }}
          onConfirm={async (month) => {
            setBillingRunning(true);
            try {
              const results = await api.runBilling({ charge_month: month });
              setBillingResults(results);
              setActionMsg(`Billing recorded for ${month}: ${results.recorded} entries, ${formatCurrency(results.total_amount)} total`);
              setShowBillingModal(false);
              setBillingPreview(null);
              await refreshSpaces();
            } catch (err) {
              setError(err.message);
            } finally {
              setBillingRunning(false);
            }
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpaceCard component
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Payment grid colors / labels
// ---------------------------------------------------------------------------
const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = {
  paid:    { bg: '#16a34a', text: '#fff' }, // green
  unpaid:  { bg: '#dc2626', text: '#fff' }, // red
  partial: { bg: '#eab308', text: '#422006' }, // yellow
};
const SOURCE_LABELS = { square: 'Square', manual: 'Manual', auto: 'Autopay' };

function PaymentLegend() {
  const Item = ({ color, label }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#374151' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, display: 'inline-block' }} />
      {label}
    </span>
  );
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', margin: '0 0 16px', padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Payment grid</span>
      <Item color={STATUS_COLORS.paid.bg} label="Paid" />
      <Item color={STATUS_COLORS.unpaid.bg} label="Unpaid" />
      <Item color={STATUS_COLORS.partial.bg} label="Partial" />
      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Hover a cell for source · click to set a manual override (cycles paid → partial → unpaid → auto) · the boxed month is the current month; months to its right are future — mark them paid to record advance payments</span>
    </div>
  );
}

function PaymentMonthGrid({ box, months, canEdit, onToggle }) {
  if (!box || !months || months.length === 0) return null;
  const cellsByKey = {};
  (box.cells || []).forEach(c => { cellsByKey[`${c.year}-${c.month}`] = c; });
  const nowStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  const nowYear = parseInt(nowStr.slice(0, 4), 10);
  const nowMonth = parseInt(nowStr.slice(5, 7), 10);

  return (
    <div style={{ marginTop: '8px', borderTop: '1px dashed #e5e7eb', paddingTop: '6px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
        {months.map(({ year, month }) => {
          const cell = cellsByKey[`${year}-${month}`] || { year, month, status: 'unpaid', source: null };
          const colors = STATUS_COLORS[cell.status] || STATUS_COLORS.unpaid;
          const isCurrent = year === nowYear && month === nowMonth;
          const srcLabel = cell.source ? SOURCE_LABELS[cell.source] : 'No data';
          const title = `${MONTH_ABBR[month]} ${year} — ${cell.status.charAt(0).toUpperCase() + cell.status.slice(1)} (${srcLabel})`;
          return (
            <div
              key={`${year}-${month}`}
              title={title}
              onClick={(e) => { e.stopPropagation(); onToggle(box.billing_id, cell); }}
              style={{
                width: '20px', height: '20px', borderRadius: '3px',
                backgroundColor: colors.bg, color: colors.text,
                fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canEdit ? 'pointer' : 'default',
                // Manual overrides get a dark ring so they stand out.
                outline: cell.source === 'manual' ? '2px solid #1e3a5f' : 'none',
                outlineOffset: '-2px',
                border: isCurrent ? '2px solid #111827' : 'none',
                boxSizing: 'border-box',
              }}
            >
              {month}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpaceCard({ space, onClick, canSeeFinancials, gridBox, gridMonths, canEdit, onCellToggle, isExpanded, onEmail }) {
  const occupied = !!space.billing_id;
  const label = space.label.replace(/^(Outdoor|Indoor)\s*/, '');
  const linearFt = space.space_linear_feet || space.unit_linear_feet;
  const canEmail = !!(space.email_primary && !space.email_invalid);

  return (
    <div onClick={onClick} style={{
      ...spaceCardStyle,
      backgroundColor: occupied ? '#fef2f2' : '#f0fdf4',
      // Highlight the selected box; the editor renders as a full-width panel
      // below (a separate grid item), so the card never changes position.
      borderColor: isExpanded ? '#1e3a5f' : (occupied ? '#fca5a5' : '#86efac'),
      cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: occupied ? '#991b1b' : '#065f46', marginBottom: '4px' }}>
        {label}
      </div>
      {linearFt && (
        <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '2px' }}>{parseFloat(linearFt)} ft</div>
      )}
      {occupied ? (
        <div style={{ fontSize: '0.7rem', color: '#6b7280', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>
            {space.last_name}{space.first_name ? `, ${space.first_name}` : ''}
          </div>
          {/* Phone and a one-click email, so the box answers "who do I call"
              without opening the customer record. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', margin: '1px 0 2px' }}>
            {space.phone_primary ? (
              <a href={`tel:${String(space.phone_primary).replace(/[^\d+]/g, '')}`}
                 onClick={(e) => e.stopPropagation()}
                 style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 600 }}>
                {formatPhone(space.phone_primary)}
              </a>
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '0.68rem' }}>No phone</span>
            )}
            <button
              type="button"
              disabled={!canEmail}
              title={canEmail ? `Email ${space.email_primary}`
                              : (space.email_invalid ? 'Email on file is flagged bad' : 'No email on file')}
              onClick={(e) => { e.stopPropagation(); if (canEmail && onEmail) onEmail(space); }}
              style={{
                padding: '1px 7px', fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px',
                border: '1px solid ' + (canEmail ? '#1e3a5f' : '#e5e7eb'),
                backgroundColor: canEmail ? '#1e3a5f' : '#f3f4f6',
                color: canEmail ? '#fff' : '#9ca3af',
                cursor: canEmail ? 'pointer' : 'not-allowed', lineHeight: 1.6,
              }}
            >
              Email
            </button>
          </div>
          {space.unit_year && (
            <div>{[space.unit_year, space.unit_make, space.unit_model].filter(Boolean).join(' ')}</div>
          )}
          {canSeeFinancials && <div style={{ color: '#059669' }}>${parseFloat(space.monthly_rate).toFixed(0)}/mo</div>}
          {space.billing_start_date && (() => {
            const sd = new Date(String(space.billing_start_date).split('T')[0] + 'T00:00:00');
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const future = sd > today;
            return future ? (
              <div style={{ marginTop: '2px', display: 'inline-block', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '1px 5px', fontSize: '0.62rem', fontWeight: 700 }}>
                Starts {sd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '0.62rem' }}>Since {sd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
            );
          })()}
          {space.scheduled_move_out && (
            <div style={{ marginTop: '2px', display: 'inline-block', backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: '4px', padding: '1px 5px', fontSize: '0.62rem', fontWeight: 700 }}>
              Ending {new Date(String(space.scheduled_move_out).split('T')[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          <PaymentMonthGrid box={gridBox} months={gridMonths} canEdit={canEdit} onToggle={onCellToggle} />
        </div>
      ) : (
        <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>Available</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InlineBoxEditor — edit a box's fields in place (no modal, no edit mode).
//
// Box fields (monthly_rate, due day, type, start, notes, Square IDs, unit,
// linear feet) autosave via PATCH /storage/:id — these change FUTURE billing
// runs and have no ledger row. Posted monthly charges autosave via
// PATCH /storage/charges/:id, which mirrors to the GL ledger (account 4000),
// so correcting a past amount stays in sync with the books.
// ---------------------------------------------------------------------------
function InlineBoxEditor({ space, canSeeFinancials, onChanged, onOpenFull }) {
  const [spaceType, setSpaceType] = useState(space.space_type || 'outdoor');
  const [unitId, setUnitId] = useState(space.unit_id ? String(space.unit_id) : '');
  const [units, setUnits] = useState([]);
  const [charges, setCharges] = useState(null); // null = loading
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const initialLinearFeet = space.unit_linear_feet ? String(parseFloat(space.unit_linear_feet)) : '';

  useEffect(() => {
    if (space.customer_id) {
      api.getCustomerUnits(space.customer_id).then(setUnits).catch(() => setUnits([]));
    }
    api.getStorageCharges({ customer_id: space.customer_id })
      .then((data) => {
        const all = Array.isArray(data) ? data : (data.charges || []);
        // Only this box's charges (by billing, or by space for ad-hoc charges).
        setCharges(all.filter(
          (c) => (c.billing_id && c.billing_id === space.billing_id) ||
                 (c.space_id && c.space_id === space.id)
        ));
      })
      .catch(() => setCharges([]));
  }, [space.customer_id, space.billing_id, space.id]);

  // Lazy-load tenancy history for this physical space the first time it's
  // expanded. Loaded here (not in DetailModal alone) because clicking an
  // occupied box opens THIS inline editor, not the modal.
  useEffect(() => {
    if (historyOpen && !historyLoaded && space.id) {
      api.getStorageSpaceHistory(space.id)
        .then(rows => { setHistory(rows || []); setHistoryLoaded(true); })
        .catch(() => { setHistory([]); setHistoryLoaded(true); });
    }
  }, [historyOpen, historyLoaded, space.id]);

  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(''), 2000); };

  // Save a single storage_billing field (future billing — no ledger row).
  const saveBilling = async (patch, label) => {
    try {
      await api.updateStorage(space.billing_id, patch);
      flash(`Saved ${label}`);
      onChanged && onChanged();
    } catch (err) { flash('Error: ' + err.message); }
  };

  // Save a posted charge amount — mirrors to the GL ledger via the PATCH path.
  const saveChargeAmount = async (chargeId, value) => {
    const amount = parseFloat(value);
    if (Number.isNaN(amount)) return;
    try {
      const updated = await api.updateStorageCharge(chargeId, { amount });
      setCharges((prev) => prev.map((c) => (c.id === chargeId ? { ...c, amount: updated.amount ?? amount } : c)));
      flash('Charge updated (ledger synced)');
      onChanged && onChanged();
    } catch (err) { flash('Error: ' + err.message); }
  };

  const fieldWrap = { marginBottom: '8px' };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ cursor: 'default', fontSize: '0.75rem' }}>
      {status && <div style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 600, marginBottom: '6px' }}>{status}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
        {canSeeFinancials && (
          <div style={fieldWrap}>
            <label style={labelStyle}>Monthly Rate ($)</label>
            <input type="number" step="0.01" defaultValue={parseFloat(space.monthly_rate) || 0}
              onBlur={(e) => saveBilling({ monthly_rate: parseFloat(e.target.value) }, 'monthly rate')}
              style={inputStyleFull} />
          </div>
        )}
        <div style={fieldWrap}>
          <label style={labelStyle}>Due Day</label>
          <input type="number" min="1" max="28" defaultValue={space.due_day || 1}
            onBlur={(e) => saveBilling({ due_day: parseInt(e.target.value) }, 'due day')}
            style={inputStyleFull} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Space Type</label>
          <select value={spaceType} onChange={(e) => { setSpaceType(e.target.value); saveBilling({ space_type: e.target.value }, 'space type'); }} style={inputStyleFull}>
            <option value="outdoor">Outdoor</option>
            <option value="indoor">Indoor</option>
          </select>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Start Date</label>
          <input type="date"
            defaultValue={space.billing_start_date ? (String(space.billing_start_date).includes('T') ? String(space.billing_start_date).split('T')[0] : space.billing_start_date) : ''}
            onBlur={(e) => e.target.value && saveBilling({ billing_start_date: e.target.value }, 'start date')}
            style={inputStyleFull} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Unit</label>
          <select value={unitId} onChange={(e) => {
            const v = e.target.value;
            setUnitId(v);
            saveBilling({ unit_id: v ? parseInt(v) : null }, 'unit');
          }} style={inputStyleFull}>
            <option value="">— No unit —</option>
            {units.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {[u.year, u.make, u.model].filter(Boolean).join(' ') || `Unit #${u.id}`}{u.license_plate ? ` — ${u.license_plate}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Linear Feet</label>
          <input type="number" step="0.5" min="0" defaultValue={initialLinearFeet}
            onBlur={(e) => {
              if (!unitId) { flash('Select a unit to set linear feet'); return; }
              if (e.target.value === initialLinearFeet) return;
              api.updateUnit(parseInt(unitId), { linear_feet: e.target.value ? parseFloat(e.target.value) : null })
                .then(() => { flash('Saved linear feet'); onChanged && onChanged(); })
                .catch((err) => flash('Error: ' + err.message));
            }}
            style={inputStyleFull} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Square Series ID</label>
          <input defaultValue={space.square_sub_id || ''} placeholder="e.g. 1550"
            onBlur={(e) => saveBilling({ square_sub_id: e.target.value || null }, 'Square series ID')}
            style={inputStyleFull} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Payment Method</label>
          <select
            value={space.payment_method || ''}
            onChange={(e) => saveBilling({ payment_method: e.target.value || null }, 'payment method')}
            style={inputStyleFull}
          >
            <option value="">— not set —</option>
            <option value="credit_card">Credit card (adds 3.5% fee)</option>
            <option value="ach">Bank transfer / ACH (adds 1% fee)</option>
            <option value="zelle">Zelle</option>
            <option value="check">Check</option>
            <option value="cash">Cash</option>
          </select>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 3 }}>
            {space.payment_method === 'credit_card'
              ? 'Monthly invoice will show a 3.5% card processing fee.'
              : space.payment_method === 'ach'
                ? 'Monthly invoice will show a 1% bank transfer fee ($1 minimum).'
                : 'No processing fee added to the monthly invoice.'}
          </div>
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <textarea defaultValue={space.billing_notes || ''}
          onBlur={(e) => saveBilling({ notes: e.target.value }, 'notes')}
          style={{ ...inputStyleFull, minHeight: '44px' }} />
      </div>

      {/* Posted monthly charges — ledger-synced. */}
      {canSeeFinancials && (
        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '6px' }}>
            Posted monthly charges <span style={{ fontWeight: 400, color: '#6b7280' }}>— edits post to the GL ledger (acct 4000)</span>
          </div>
          {charges === null ? (
            <div style={{ color: '#9ca3af' }}>Loading…</div>
          ) : charges.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>No posted charges yet. Use "Record & Post Storage Billing" to generate them.</div>
          ) : (
            charges.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ minWidth: '64px', fontWeight: 600, color: '#374151' }}>{c.charge_month}</span>
                <span style={{ color: '#6b7280' }}>$</span>
                <input type="number" step="0.01" defaultValue={parseFloat(c.amount) || 0}
                  onBlur={(e) => { if (parseFloat(e.target.value) !== parseFloat(c.amount)) saveChargeAmount(c.id, e.target.value); }}
                  style={{ ...inputStyleFull, maxWidth: '120px' }} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Box History — every customer who's ever rented this physical space */}
      <div style={{ marginTop: '14px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
        <button onClick={() => setHistoryOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', fontWeight: 600, fontSize: '0.85rem', padding: 0 }}>
          {historyOpen ? '▼' : '▶'} Box History
        </button>
        {historyOpen && (
          <div style={{ marginTop: '8px' }}>
            {!historyLoaded && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Loading…</div>}
            {historyLoaded && history.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>No tenant history recorded.</div>
            )}
            {historyLoaded && history.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb' }}>Customer</th>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb' }}>Unit</th>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb' }}>Start</th>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb' }}>End</th>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Months Paid</th>
                    {canSeeFinancials && <th style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Total Paid</th>}
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const isActive = !h.billing_end_date && !h.deleted_at;
                    const name = `${h.last_name || ''}${h.first_name ? ', ' + h.first_name : ''}${h.company_name ? ' (' + h.company_name + ')' : ''}`;
                    const unit = [h.unit_year, h.unit_make, h.unit_model].filter(Boolean).join(' ') || '—';
                    const fmtDate = (d) => d ? (d.includes('T') ? d.split('T')[0] : d) : '—';
                    return (
                      <tr key={h.billing_id} style={{ backgroundColor: isActive ? '#ecfdf5' : 'transparent' }}>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>
                          <a href={`/customers/${h.customer_id}`} style={{ color: '#1e3a5f', textDecoration: 'underline' }}>{name}</a>
                          {isActive && <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>CURRENT</span>}
                        </td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>{unit}</td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>{fmtDate(h.billing_start_date)}</td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>{fmtDate(h.billing_end_date)}</td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>${parseFloat(h.monthly_rate || 0).toFixed(2)}</td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>
                          {h.paid_months}{h.unpaid_months > 0 ? <span style={{ color: '#dc2626' }}> ({h.unpaid_months} unpaid)</span> : ''}
                        </td>
                        {canSeeFinancials && (
                          <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 600 }}>
                            ${parseFloat(h.paid_total || 0).toFixed(2)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <BillingStatusPanel space={space} compact />

      {/* Contract status + Special Terms — visible right here in the inline
          editor so Carol doesn't have to dig into Full details to see what's
          been sent / accepted / needs editing. */}
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contract</div>
        <div style={{ fontSize: '0.78rem', marginBottom: '10px', padding: '7px 10px', borderRadius: '4px',
                      backgroundColor: space.contract_accepted_at ? '#f0fdf4' : space.contract_sent_at ? '#fffbeb' : '#f9fafb',
                      border: `1px solid ${space.contract_accepted_at ? '#bbf7d0' : space.contract_sent_at ? '#fcd34d' : '#e5e7eb'}`,
                      color: space.contract_accepted_at ? '#065f46' : space.contract_sent_at ? '#92400e' : '#6b7280',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div>
            <strong>Status: </strong>
            {space.contract_accepted_at
              ? `Accepted ${new Date(space.contract_accepted_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' })}`
              : space.contract_sent_at
                ? `Sent ${new Date(space.contract_sent_at).toLocaleDateString('en-US', { timeZone: 'America/Denver' })} — pending acceptance`
                : 'Not sent yet'}
          </div>
          {(space.contract_sent_at || space.contract_accepted_at) && (
            <button onClick={async () => {
              const w = window.open('about:blank', '_blank');
              try {
                const { viewUrl } = await api.getStorageContractPreviewUrl(space.billing_id);
                if (w) w.location.href = viewUrl; else window.open(viewUrl, '_blank', 'noopener');
              } catch (err) { if (w) w.close(); flash('Error: ' + err.message); }
            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', textDecoration: 'underline', fontSize: '0.72rem', fontWeight: 600, padding: 0 }}>
              View Contract
            </button>
          )}
        </div>
        <label style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Special Terms (optional)
        </label>
        <textarea
          defaultValue={space.special_terms || ''}
          onBlur={async (e) => {
            const v = e.target.value;
            if ((v || '') === (space.special_terms || '')) return;
            try {
              await api.updateStorage(space.billing_id, { special_terms: v });
              flash('Special terms saved');
              onChanged && onChanged();
            } catch (err) { flash('Error: ' + err.message); }
          }}
          placeholder="Custom clause for this customer's contract (saves on blur)"
          rows={2}
          style={{ ...inputStyleFull, fontFamily: 'inherit', resize: 'vertical', marginTop: '4px' }}
        />
        <label style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '10px' }}>
          Lease Start Date
        </label>
        <input type="date"
          defaultValue={space.billing_start_date ? (String(space.billing_start_date).includes('T') ? String(space.billing_start_date).split('T')[0] : space.billing_start_date) : ''}
          onBlur={(e) => e.target.value && saveBilling({ billing_start_date: e.target.value }, 'lease start date')}
          style={{ ...inputStyleFull, marginTop: '4px' }} />
        <div style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '2px 0 4px' }}>Edit before sending — this is the start date printed on the contract. Saves automatically.</div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={async () => {
            const w = window.open('about:blank', '_blank');
            try {
              const { viewUrl } = await api.getStorageContractPreviewUrl(space.billing_id);
              if (w) w.location.href = viewUrl; else window.open(viewUrl, '_blank', 'noopener');
              flash('Preview opened in a new tab');
            } catch (err) { if (w) w.close(); flash('Error: ' + err.message); }
          }} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#f3f4f6', color: '#1e3a5f', border: '1px solid #d1d5db' }}>
            Preview Contract
          </button>
          <button onClick={async () => {
            if (!window.confirm('Send this contract to the customer? They will receive an email with a link to review and accept.')) return;
            try {
              await api.emailStorageContract(space.billing_id);
              flash('Contract emailed to customer');
              onChanged && onChanged();
            } catch (err) { flash('Error: ' + err.message); }
          }} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>
            {space.contract_sent_at ? 'Resend Contract' : 'Email Contract'}
          </button>
          {space.has_signed_contract && (
          <button onClick={async () => {
            const w = window.open('about:blank', '_blank');
            try {
              const blob = await api.getStorageSignedContract(space.billing_id);
              const url = URL.createObjectURL(blob);
              if (w) w.location.href = url; else window.open(url, '_blank', 'noopener');
              flash('Signed contract opened - use your browser to print');
            } catch (err) { if (w) w.close(); flash('Error: ' + err.message); }
          }} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#dcfce7', color: '#065f46', border: '1px solid #86efac' }}>
            Print Signed Contract
          </button>
          )}
          <button onClick={() => {
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            window.open(`${apiBase}/storage-contract/guidelines-preview`, '_blank', 'noopener');
          }} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
            Preview Guidelines
          </button>
          <button onClick={async () => {
            if (!window.confirm('Email the storage guidelines to this customer?')) return;
            try {
              const res = await api.sendStorageGuidelines({ billing_id: space.billing_id });
              flash(res.message || 'Guidelines emailed');
            } catch (err) { flash('Error: ' + err.message); }
          }} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#fde68a', color: '#92400e', border: '1px solid #f59e0b' }}>
            Send Guidelines
          </button>
        </div>
      </div>

      <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
        <button onClick={() => onOpenFull && onOpenFull()} style={{ ...btnTinyGray, padding: '4px 10px' }}>
          Full details / End storage…
        </button>
        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Changes save automatically.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RateIncreaseModal — bulk per-linear-foot storage rate increase, with preview
// ---------------------------------------------------------------------------
function RateIncreaseModal({ onClose, onApplied }) {
  const [perFoot, setPerFoot] = useState('1.00');
  const [includeWaitlist, setIncludeWaitlist] = useState(true);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const money = (n) => `$${(parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const runPreview = async () => {
    const v = parseFloat(perFoot);
    if (!(v > 0)) { setError('Enter a dollar amount per linear foot.'); return; }
    setLoading(true); setError('');
    try {
      setPreview(await api.previewStorageRateIncrease(v));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const apply = async () => {
    const v = parseFloat(perFoot);
    if (!preview) return;
    if (!window.confirm(`Apply a ${money(v)}/linear-foot increase now? This changes ${preview.summary.space_count} active spaces` + (includeWaitlist ? ' and the waitlist' : '') + '. This takes effect immediately.')) return;
    setApplying(true); setError('');
    try {
      await api.applyStorageRateIncrease(v, includeWaitlist);
      onApplied();
    } catch (e) { setError(e.message); setApplying(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, width: '760px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Storage Rate Increase</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 0 }}>
          Raises every active space by this amount times its linear feet (a 24&#8209;ft unit goes up 24&#215; this amount). Preview first — nothing changes until you click Apply. Run it on the day the increase takes effect.
        </p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
            $ per linear foot:&nbsp;
            <input type="number" step="0.25" min="0" value={perFoot} onChange={(e) => { setPerFoot(e.target.value); setPreview(null); }}
              style={{ width: '90px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }} />
          </label>
          <label style={{ fontSize: '0.85rem', color: '#374151', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={includeWaitlist} onChange={(e) => setIncludeWaitlist(e.target.checked)} />
            Also raise waitlist quotes
          </label>
          <button onClick={runPreview} disabled={loading} style={btnSecondary}>{loading ? 'Loading…' : 'Preview'}</button>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</div>}

        {preview && (
          <>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <div><strong>{preview.summary.space_count}</strong> spaces</div>
              <div>Now: <strong>{money(preview.summary.current_monthly_total)}</strong>/mo</div>
              <div>After: <strong>{money(preview.summary.new_monthly_total)}</strong>/mo</div>
              <div style={{ color: '#065f46' }}>+{money(preview.summary.monthly_increase)}/mo</div>
              {preview.summary.spaces_without_linear_feet > 0 && (
                <div style={{ color: '#b91c1c' }}>{preview.summary.spaces_without_linear_feet} skipped (no linear feet)</div>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '14px' }}>
              <thead><tr style={{ background: '#1e3a5f', color: '#fff' }}>
                <th style={rmTh}>Space</th><th style={rmTh}>Customer</th><th style={{ ...rmTh, textAlign: 'right' }}>Ft</th>
                <th style={{ ...rmTh, textAlign: 'right' }}>Now</th><th style={{ ...rmTh, textAlign: 'right' }}>After</th>
              </tr></thead>
              <tbody>
                {preview.spaces.map(r => (
                  <tr key={r.billing_id} style={{ borderBottom: '1px solid #eee', background: r.no_linear_feet ? '#fef2f2' : undefined }}>
                    <td style={rmTd}>{r.space_type === 'indoor' ? 'In' : 'Out'} {r.label}</td>
                    <td style={rmTd}>{r.customer}</td>
                    <td style={{ ...rmTd, textAlign: 'right' }}>{r.no_linear_feet ? '—' : r.linear_feet}</td>
                    <td style={{ ...rmTd, textAlign: 'right' }}>{money(r.current_rate)}</td>
                    <td style={{ ...rmTd, textAlign: 'right', fontWeight: 700 }}>{r.no_linear_feet ? 'no change' : money(r.new_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {includeWaitlist && preview.waitlist.length > 0 && (
              <>
                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '0.85rem', margin: '0 0 6px' }}>Waitlist quotes</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '14px' }}>
                  <thead><tr style={{ background: '#3949ab', color: '#fff' }}>
                    <th style={rmTh}>Name</th><th style={{ ...rmTh, textAlign: 'right' }}>Ft</th>
                    <th style={{ ...rmTh, textAlign: 'right' }}>Now</th><th style={{ ...rmTh, textAlign: 'right' }}>After</th>
                  </tr></thead>
                  <tbody>
                    {preview.waitlist.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #eee', background: r.no_data ? '#fef2f2' : undefined }}>
                        <td style={rmTd}>{r.contact_name}</td>
                        <td style={{ ...rmTd, textAlign: 'right' }}>{r.linear_feet ?? '—'}</td>
                        <td style={{ ...rmTd, textAlign: 'right' }}>{r.current_budget != null ? money(r.current_budget) : '—'}</td>
                        <td style={{ ...rmTd, textAlign: 'right', fontWeight: 700 }}>{r.no_data ? 'no change' : money(r.new_budget)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={apply} disabled={applying} style={{ ...btnPrimary, backgroundColor: '#065f46' }}>
                {applying ? 'Applying…' : `Apply Increase`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const rmTh = { padding: '6px 8px', textAlign: 'left', fontSize: '0.72rem' };
const rmTd = { padding: '5px 8px' };

// ---------------------------------------------------------------------------
// SummaryCard component
// ---------------------------------------------------------------------------
function SummaryCard({ label, occupied, total, color }) {
  return (
    <div style={{
      flex: 1, padding: '16px', backgroundColor: '#fff',
      borderRadius: '8px', border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{occupied}<span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>/{total}</span></div>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{total - occupied} available</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssignModal — form to assign a customer/unit to a space
// ---------------------------------------------------------------------------
function AssignModal({ space, rates, onClose, onAssigned, allSpaces = [] }) {
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [units, setUnits] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [form, setForm] = useState({
    unit_id: '',
    monthly_rate: space ? (space.space_type === 'indoor' ? rates.indoor_monthly : rates.outdoor_monthly) : '',
    due_day: 1,
    square_customer_id: '',
    square_sub_id: '',
    billing_start_date: new Date().toISOString().split('T')[0],
    notes: '',
    space_type: space ? space.space_type : 'outdoor',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sendContract, setSendContract] = useState(true);
  const [sendGuidelines, setSendGuidelines] = useState(false);
  const searchTimeout = useRef(null);
  // Space picker (when opened as a standalone New Contract, no space preset)
  const [space1Id, setSpace1Id] = useState(space ? String(space.id) : '');
  // Second space + unit on the same contract (multi-unit lease)
  const [addSecond, setAddSecond] = useState(false);
  const [secondSpaceId, setSecondSpaceId] = useState('');
  const [secondUnitId, setSecondUnitId] = useState('');
  const [secondRate, setSecondRate] = useState('');
  const unoccupied = (allSpaces || []).filter(sp => !sp.billing_id);
  const primarySpaceId = space ? space.id : (space1Id ? parseInt(space1Id) : null);

  const handleCustomerSearch = (q) => {
    setCustomerSearch(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setCustomers([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await api.getCustomers({ search: q, limit: 10 });
        setCustomers(results.customers || []);
      } catch (err) { console.error(err); }
    }, 300);
  };

  const selectCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setCustomers([]);
    setCustomerSearch('');
    try {
      const unitList = await api.getCustomerUnits(cust.id);
      setUnits(unitList);
      if (unitList.length === 1) setForm(f => ({ ...f, unit_id: String(unitList[0].id) }));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { setError('Select a customer'); return; }
    if (!primarySpaceId) { setError('Select a space'); return; }
    if (addSecond && !secondSpaceId) { setError('Select the second space (or turn off the second unit)'); return; }
    setSaving(true);
    setError('');
    try {
      const groupId = (addSecond && secondSpaceId)
        ? ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID()
           : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
        : null;
      const result = await api.assignStorage({
        space_id: primarySpaceId,
        customer_id: selectedCustomer.id,
        unit_id: form.unit_id ? parseInt(form.unit_id) : null,
        monthly_rate: parseFloat(form.monthly_rate),
        due_day: parseInt(form.due_day),
        square_customer_id: form.square_customer_id || null,
        square_sub_id: form.square_sub_id || null,
        billing_start_date: form.billing_start_date || null,
        notes: form.notes || null,
        contract_group: groupId,
      });
      if (groupId) {
        const sp2 = unoccupied.find(x => String(x.id) === String(secondSpaceId));
        const u2 = units.find(u => String(u.id) === String(secondUnitId));
        const ft2 = (u2 && u2.linear_feet) ? parseFloat(u2.linear_feet) : 0;
        const rate2 = (parseFloat(secondRate) > 0) ? parseFloat(secondRate)
          : (ft2 > 0 ? ft2 * perFootRate(rates, sp2 && sp2.space_type) : 0);
        await api.assignStorage({
          space_id: parseInt(secondSpaceId),
          customer_id: selectedCustomer.id,
          unit_id: secondUnitId ? parseInt(secondUnitId) : null,
          monthly_rate: rate2,
          due_day: parseInt(form.due_day),
          billing_start_date: form.billing_start_date || null,
          notes: form.notes || null,
          contract_group: groupId,
        });
      }
      // Preview the contract for Carol's review BEFORE the customer email
      // fires, then ask before sending. Guidelines stay automatic.
      const billingId = result?.id;
      if (billingId) {
        if (sendContract) {
          // Prepare the lease as a draft (ensure its token exists) but do NOT
          // email it, so it can be reviewed first. Review with "Preview
          // Contract" and send with "Email Contract" from the space box.
          try { await api.getStorageContractPreviewUrl(billingId); } catch (e) { /* token ensured */ }
        }
        if (sendGuidelines) api.sendStorageGuidelines({ billing_id: billingId }).catch(err => console.error('Guidelines email error:', err));
      }
      onAssigned();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>{space ? `Assign — ${space.label}` : 'New Storage Contract'}</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>

        {error && <div style={errorBannerSmall}>{error}</div>}

        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
          {/* Customer Search */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={labelStyle}>Customer</label>
            {selectedCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>
                  {selectedCustomer.last_name}{selectedCustomer.first_name ? `, ${selectedCustomer.first_name}` : ''}
                  {selectedCustomer.company_name && ` (${selectedCustomer.company_name})`}
                </span>
                <button type="button" onClick={() => { setSelectedCustomer(null); setUnits([]); }} style={btnTinyGray}>Change</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    autoFocus
                    style={{ ...inputStyleFull, flex: 1 }}
                  />
                  <button type="button" onClick={() => setShowNewCustomer(true)} style={btnTinyGray}>+ New</button>
                </div>
                {customers.length > 0 && (
                  <div style={dropdownStyle}>
                    {customers.map(c => (
                      <div key={c.id} onClick={() => selectCustomer(c)} style={dropdownItem}>
                        <strong>{c.last_name}{c.first_name ? `, ${c.first_name}` : ''}</strong>
                        {c.company_name && <span style={{ color: '#6b7280', marginLeft: '6px' }}>({c.company_name})</span>}
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '8px' }}>#{c.account_number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {showNewCustomer && (
              <NewCustomerModal
                onClose={() => setShowNewCustomer(false)}
                onCreated={(customer) => {
                  setShowNewCustomer(false);
                  selectCustomer(customer);
                }}
              />
            )}
          </div>

          {/* Space (standalone New Contract only) */}
          {!space && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Space</label>
              <select value={space1Id} onChange={(e) => { setSpace1Id(e.target.value); const sp = unoccupied.find(x => String(x.id) === e.target.value); if (sp) setForm(f => ({ ...f, space_type: sp.space_type })); }} style={inputStyleFull}>
                <option value="">-- Select a space --</option>
                {unoccupied.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.label} — {sp.space_type} ({sp.linear_feet ? parseFloat(sp.linear_feet) + ' ft' : 'no size'})</option>
                ))}
              </select>
              {unoccupied.length === 0 && <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#dc2626' }}>No available spaces. Add a space first.</div>}
            </div>
          )}

          {/* Unit */}
          {selectedCustomer && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Unit (optional)</label>
              <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })} style={inputStyleFull}>
                <option value="">No unit selected</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {[u.year, u.make, u.model].filter(Boolean).join(' ')} {u.license_plate ? `— ${u.license_plate}` : ''} {u.linear_feet ? `(${parseFloat(u.linear_feet)} ft)` : ''}
                  </option>
                ))}
              </select>
              {form.unit_id && (() => {
                const sel = units.find(u => String(u.id) === form.unit_id);
                return sel?.linear_feet ? (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#1e3a5f', fontWeight: 600 }}>
                    Linear Feet: {parseFloat(sel.linear_feet)} ft
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Space Type & Start Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Space Type</label>
              <select value={form.space_type} onChange={(e) => setForm({ ...form, space_type: e.target.value })} style={inputStyleFull}>
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={form.billing_start_date} onChange={(e) => setForm({ ...form, billing_start_date: e.target.value })} style={inputStyleFull} />
            </div>
          </div>

          {/* Rate and Due Day */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Monthly Rate ($)</label>
              <input type="number" step="0.01" value={form.monthly_rate} onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })} style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Due Day</label>
              <input type="number" min="1" max="28" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} style={inputStyleFull} />
            </div>
          </div>

          {/* Second space + unit on the same contract (rates summed) */}
          <div style={{ marginBottom: '16px', borderTop: '1px dashed #d1d5db', paddingTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={addSecond} onChange={(e) => setAddSecond(e.target.checked)} disabled={!selectedCustomer} /> Add a second space &amp; RV to this contract
            </label>
            {!selectedCustomer && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Select a customer first.</div>}
            {addSecond && selectedCustomer && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <label style={labelStyle}>Second Space</label>
                <select value={secondSpaceId} onChange={(e) => setSecondSpaceId(e.target.value)} style={inputStyleFull}>
                  <option value="">-- Select a space --</option>
                  {unoccupied.filter(sp => String(sp.id) !== String(primarySpaceId)).map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.label} — {sp.space_type} ({sp.linear_feet ? parseFloat(sp.linear_feet) + ' ft' : 'no size'})</option>
                  ))}
                </select>
                <label style={{ ...labelStyle, marginTop: '10px' }}>Second Unit (optional)</label>
                <select value={secondUnitId} onChange={(e) => setSecondUnitId(e.target.value)} style={inputStyleFull}>
                  <option value="">No unit selected</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{[u.year, u.make, u.model].filter(Boolean).join(' ')} {u.linear_feet ? `(${parseFloat(u.linear_feet)} ft)` : ''}</option>
                  ))}
                </select>
                <label style={{ ...labelStyle, marginTop: '10px' }}>Second Space Rate ($/mo)</label>
                <input type="number" step="0.01" value={secondRate} onChange={(e) => setSecondRate(e.target.value)} placeholder="Auto from unit length if blank" style={inputStyleFull} />
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>Leave blank to auto-calc from the unit's length. The contract total is both rates combined.</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." style={{ ...inputStyleFull, minHeight: '60px' }} />
          </div>

          {/* Square IDs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Square Customer ID</label>
              <input value={form.square_customer_id} onChange={(e) => setForm({ ...form, square_customer_id: e.target.value })} placeholder="Optional" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Square Subscription ID</label>
              <input value={form.square_sub_id} onChange={(e) => setForm({ ...form, square_sub_id: e.target.value })} placeholder="Optional" style={inputStyleFull} />
            </div>
          </div>

          {/* Contract & Guidelines checkboxes */}
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px', textTransform: 'uppercase' }}>After Assignment</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '6px', fontSize: '0.85rem', color: '#374151' }}>
              <input type="checkbox" checked={sendContract} onChange={(e) => setSendContract(e.target.checked)} />
              Prepare Storage Contract (review, then send from the space box)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
              <input type="checkbox" checked={sendGuidelines} onChange={(e) => setSendGuidelines(e.target.checked)} />
              Email Storage Guidelines
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving || !selectedCustomer || !primarySpaceId || (addSecond && !secondSpaceId)} style={btnPrimary}>
              {saving ? 'Saving...' : (space ? 'Assign Space' : 'Create Contract')}
            </button>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailModal — editable occupied space details, end storage, charge
// ---------------------------------------------------------------------------
function DetailModal({ space, allSpaces = [], canEdit, isAdmin, canSeeFinancials, onClose, onUpdated }) {
  const [form, setForm] = useState({
    space_type: space.space_type || 'outdoor',
    monthly_rate: parseFloat(space.monthly_rate) || 0,
    billing_start_date: space.billing_start_date ? (space.billing_start_date.includes('T') ? space.billing_start_date.split('T')[0] : space.billing_start_date) : '',
    notes: space.billing_notes || '',
    square_sub_id: space.square_sub_id || '',
    square_customer_id: space.square_customer_id || '',
    due_day: space.due_day || 1,
    unit_id: space.unit_id ? String(space.unit_id) : '',
    linear_feet: space.unit_linear_feet ? String(parseFloat(space.unit_linear_feet)) : '',
    end_date: '',
    scheduled_move_out: space.scheduled_move_out ? (String(space.scheduled_move_out).includes('T') ? String(space.scheduled_move_out).split('T')[0] : String(space.scheduled_move_out)) : '',
  });
  const [initialLinearFeet] = useState(space.unit_linear_feet ? String(parseFloat(space.unit_linear_feet)) : '');
  const [customerUnits, setCustomerUnits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contractMsg, setContractMsg] = useState('');
  const [moveTargetId, setMoveTargetId] = useState('');
  const [moving, setMoving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load customer's units for the dropdown
  useEffect(() => {
    if (space.customer_id) {
      api.getCustomerUnits(space.customer_id).then(setCustomerUnits).catch(() => {});
    }
  }, [space.customer_id]);

  // Lazy-load tenancy history when the section is first expanded
  useEffect(() => {
    if (historyOpen && !historyLoaded && space.id) {
      api.getStorageSpaceHistory(space.id)
        .then(rows => { setHistory(rows || []); setHistoryLoaded(true); })
        .catch(err => { setError('History load failed: ' + err.message); setHistoryLoaded(true); });
    }
  }, [historyOpen, historyLoaded, space.id]);

  const customerName = `${space.last_name || ''}${space.first_name ? `, ${space.first_name}` : ''}` +
    (space.company_name ? ` (${space.company_name})` : '');

  const selectedUnit = customerUnits.find(u => String(u.id) === form.unit_id);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const promises = [
        api.updateStorage(space.billing_id, {
          space_type: form.space_type,
          monthly_rate: parseFloat(form.monthly_rate),
          billing_start_date: form.billing_start_date || undefined,
          notes: form.notes,
          square_sub_id: form.square_sub_id || null,
          square_customer_id: form.square_customer_id || null,
          due_day: parseInt(form.due_day),
          unit_id: form.unit_id ? parseInt(form.unit_id) : null,
          scheduled_move_out: form.scheduled_move_out || null,
        }),
      ];

      // If linear feet changed and a unit is selected, update the unit record
      const unitId = form.unit_id ? parseInt(form.unit_id) : null;
      if (unitId && form.linear_feet !== initialLinearFeet) {
        promises.push(
          api.updateUnit(unitId, { linear_feet: form.linear_feet ? parseFloat(form.linear_feet) : null })
        );
      }

      await Promise.all(promises);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async () => {
    if (!moveTargetId) { setError('Pick a space to move to'); return; }
    const target = (allSpaces || []).find(sp => String(sp.id) === String(moveTargetId));
    if (!window.confirm(`Move ${customerName} from ${space.label} to ${target ? target.label : 'the selected space'}? The customer, RV, rate, and payment history stay the same.`)) return;
    setMoving(true);
    setError('');
    try {
      await api.moveStorage(space.billing_id, parseInt(moveTargetId));
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setMoving(false);
    }
  };

  const [autopayMsg, setAutopayMsg] = useState('');
  const [autopayBusy, setAutopayBusy] = useState(false);
  // Resend one month's invoice. Defaults to the current month, which is what a
  // customer saying "I never got my invoice" is asking about.
  const [resendMonth, setResendMonth] = useState(() =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }).slice(0, 7));
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const handleAutopayLink = async () => {
    setAutopayBusy(true); setAutopayMsg('');
    try {
      const { url } = await api.getStorageAutopayLink(space.billing_id);
      try { await navigator.clipboard.writeText(url); setAutopayMsg('Autopay link copied to clipboard \u2014 text or email it to the customer.'); }
      catch { setAutopayMsg(url); }
    } catch (err) { setAutopayMsg('Error: ' + (err.message || 'could not create link')); }
    finally { setAutopayBusy(false); }
  };
  const handleAutopayDisable = async () => {
    if (!window.confirm('Turn off autopay and remove the saved card for this space?')) return;
    setAutopayBusy(true); setAutopayMsg('');
    try { await api.disableStorageAutopay(space.billing_id); setAutopayMsg('Autopay turned off.'); onUpdated(); }
    catch (err) { setAutopayMsg('Error: ' + (err.message || 'could not disable')); }
    finally { setAutopayBusy(false); }
  };

  const handleEndStorage = async () => {
    const endDate = form.end_date || form.scheduled_move_out || new Date().toISOString().split('T')[0];
    if (!window.confirm(`End storage for ${space.label}? End date: ${endDate}`)) return;
    setSaving(true);
    setError('');
    try {
      await api.endStorage(space.billing_id, { end_date: endDate });
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>{space.label}</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>

        {error && <div style={errorBannerSmall}>{error}</div>}

        {/* Read-only customer info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div>
            <div style={labelStyle}>Customer</div>
            <a href={`/customers/${space.customer_id}`} style={{ fontSize: '0.875rem', color: '#1e3a5f', fontWeight: 600, textDecoration: 'underline' }}>
              {customerName}
            </a>
          </div>
          <InfoField label="Account #" value={space.account_number || '—'} />
          <InfoField label="Phone" value={formatPhone(space.phone_primary) || '—'} />
          {canEdit ? (
            <div>
              <div style={labelStyle}>Unit</div>
              <select value={form.unit_id} onChange={(e) => {
                const newUnitId = e.target.value;
                const unit = customerUnits.find(u => String(u.id) === newUnitId);
                setForm({ ...form, unit_id: newUnitId, linear_feet: unit?.linear_feet ? String(parseFloat(unit.linear_feet)) : '' });
              }} style={inputStyleFull}>
                <option value="">— No unit selected —</option>
                {customerUnits.map(u => (
                  <option key={u.id} value={String(u.id)}>
                    {[u.year, u.make, u.model].filter(Boolean).join(' ') || `Unit #${u.id}`}
                    {u.license_plate ? ` — ${u.license_plate}` : ''}
                    {u.linear_feet ? ` (${parseFloat(u.linear_feet)} ft)` : ''}
                  </option>
                ))}
              </select>
              {customerUnits.length === 0 && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>No units on file for this customer</div>}
            </div>
          ) : (
            <InfoField label="Unit" value={[space.unit_year, space.unit_make, space.unit_model].filter(Boolean).join(' ') || '—'} />
          )}
          {space.license_plate && <InfoField label="License Plate" value={space.license_plate} />}
          {canEdit ? (
            <div>
              <label style={labelStyle}>Linear Feet</label>
              <input type="number" step="0.5" min="0" value={form.linear_feet} onChange={(e) => setForm({ ...form, linear_feet: e.target.value })} placeholder="e.g. 22.5" style={inputStyleFull} />
            </div>
          ) : (selectedUnit?.linear_feet || space.unit_linear_feet) ? (
            <InfoField label="Linear Feet" value={`${parseFloat(selectedUnit?.linear_feet || space.unit_linear_feet)} ft`} />
          ) : null}
        </div>

        {/* Editable fields */}
        {canEdit ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Space Type</label>
                <select value={form.space_type} onChange={(e) => setForm({ ...form, space_type: e.target.value })} style={inputStyleFull}>
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" value={form.billing_start_date} onChange={(e) => setForm({ ...form, billing_start_date: e.target.value })} style={inputStyleFull} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Monthly Rate ($)</label>
                <input type="number" step="0.01" value={form.monthly_rate} onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })} style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Due Day</label>
                <input type="number" min="1" max="28" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: e.target.value })} style={inputStyleFull} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyleFull, minHeight: '60px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Square Customer ID</label>
                <input value={form.square_customer_id} onChange={(e) => setForm({ ...form, square_customer_id: e.target.value })} placeholder="Optional" style={inputStyleFull} />
              </div>
              <div>
                <label style={labelStyle}>Square Subscription ID</label>
                <input value={form.square_sub_id} onChange={(e) => setForm({ ...form, square_sub_id: e.target.value })} placeholder="Optional" style={inputStyleFull} />
              </div>
            </div>

            {/* Move to another space (e.g. promote overflow to a permanent spot) */}
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <label style={{ ...labelStyle, color: '#1e40af' }}>Move to Another Space</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={moveTargetId} onChange={(e) => setMoveTargetId(e.target.value)} style={{ ...inputStyleFull, flex: 1 }}>
                  <option value="">-- Select an open space --</option>
                  {(allSpaces || []).filter(sp => sp.is_active && !sp.billing_id && String(sp.id) !== String(space.id)).map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.label} — {sp.space_type} ({sp.space_linear_feet ? parseFloat(sp.space_linear_feet) + ' ft' : 'no size'})</option>
                  ))}
                </select>
                <button type="button" onClick={handleMove} disabled={moving || !moveTargetId} style={{ ...btnPrimary, opacity: (moving || !moveTargetId) ? 0.5 : 1 }}>
                  {moving ? 'Moving...' : 'Move'}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '4px' }}>Keeps the customer, RV, rate, and payment history. Use this to move an overflow customer into a permanent spot.</div>
            </div>

            {/* Storage autopay (card on file, auto-charged monthly by Square) */}
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <label style={{ ...labelStyle, color: '#065f46' }}>Monthly Autopay</label>
              {space.autopay_enabled ? (
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  <strong>ON</strong> \u2014 {space.autopay_card_brand || 'Card'}{space.autopay_card_last4 ? ' ending ' + space.autopay_card_last4 : ''} on file.
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={handleAutopayLink} disabled={autopayBusy} style={{ ...btnTinyGray, padding: '5px 12px' }}>Resend setup link</button>
                    <button type="button" onClick={handleAutopayDisable} disabled={autopayBusy} style={{ ...btnTinyGray, padding: '5px 12px', backgroundColor: '#fff', color: '#991b1b', border: '1px solid #fca5a5' }}>Turn off autopay</button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                  Not set up. Send the customer a secure link to save a card so rent is charged automatically each month.
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={handleAutopayLink} disabled={autopayBusy} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem' }}>{autopayBusy ? 'Working...' : 'Get autopay setup link'}</button>
                    <button type="button" disabled={autopayBusy}
                      onClick={async () => {
                        if (!window.confirm('Email this customer a reminder to pay by the 5th (or a $25 late fee applies)?')) return;
                        setAutopayBusy(true); setAutopayMsg('');
                        try { const r = await api.sendStorageReminder(space.billing_id); setAutopayMsg('Reminder sent to ' + r.sent_to); }
                        catch (err) { setAutopayMsg('Error: ' + (err.message || 'could not send')); }
                        finally { setAutopayBusy(false); }
                      }}
                      style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem', backgroundColor: '#b45309' }}>
                      Send payment reminder
                    </button>
                  </div>
                </div>
              )}
              {autopayMsg && <div style={{ marginTop: '8px', fontSize: '0.78rem', color: autopayMsg.startsWith('Error') ? '#991b1b' : '#065f46', wordBreak: 'break-all' }}>{autopayMsg}</div>}
            </div>

            {/* Resend an invoice the customer says they never got. Same
                invoice, same number, same amount — not a second bill. */}
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <label style={{ ...labelStyle, color: '#1e40af' }}>Resend Invoice</label>
              <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: '8px' }}>
                Emails this customer their storage invoice for the month you pick, at the rate on this box. Same invoice number as the original, so it does not read as a second bill.
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="month" value={resendMonth} onChange={(e) => setResendMonth(e.target.value)}
                       style={{ ...inputStyle, width: '160px' }} />
                <button type="button" disabled={resendBusy || !resendMonth}
                  onClick={async () => {
                    const [y, m] = resendMonth.split('-').map(Number);
                    if (!window.confirm(`Email this customer their storage invoice for ${BILLING_MONTHS[m - 1]} ${y}?`)) return;
                    setResendBusy(true); setResendMsg('');
                    try {
                      const r = await api.resendStorageInvoice({ billing_id: space.billing_id, year: y, month: m });
                      setResendMsg(`Invoice ${r.invoice} for $${Number(r.total).toFixed(2)} sent to ${r.email}`);
                    } catch (err) {
                      setResendMsg('Error: ' + (err.message || 'could not send'));
                    } finally { setResendBusy(false); }
                  }}
                  style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem' }}>
                  {resendBusy ? 'Sending...' : 'Resend invoice'}
                </button>
              </div>
              {resendMsg && <div style={{ marginTop: '8px', fontSize: '0.78rem', color: resendMsg.startsWith('Error') ? '#991b1b' : '#1e40af', wordBreak: 'break-word' }}>{resendMsg}</div>}
            </div>

            {/* Scheduled move-out (saved with Save) + immediate End Storage */}
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #fed7aa' }}>
              <label style={{ ...labelStyle, color: '#c2410c' }}>Scheduled Move-Out Date</label>
              <input type="date" value={form.scheduled_move_out} onChange={(e) => setForm({ ...form, scheduled_move_out: e.target.value })} style={inputStyleFull} />
              <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '4px' }}>Click <strong>Save</strong> to record this date. The space stays occupied and keeps billing until the RV actually leaves. On move-out day, click <strong>End Storage</strong> below to free the space and stop billing.</div>
            </div>
          </>
        ) : (
          /* Read-only for non-editors */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {canSeeFinancials && (
              <>
                <InfoField label="Monthly Rate" value={`$${parseFloat(space.monthly_rate).toFixed(2)}`} />
                <InfoField label="Due Day" value={`${space.due_day || 1}st of each month`} />
                <InfoField label="Start Date" value={space.billing_start_date || '—'} />
                <InfoField label="Square Customer ID" value={space.square_customer_id || 'Not linked'} />
                <InfoField label="Square Subscription" value={space.square_sub_id || 'Not linked'} />
              </>
            )}
            {space.billing_notes && <InfoField label="Notes" value={space.billing_notes} />}
          </div>
        )}

        {/* Contract & Guidelines */}
        {canEdit && (
          <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contract & Guidelines</div>
            {contractMsg && <div style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '8px', fontWeight: 600 }}>{contractMsg}</div>}

            {/* Special Terms — free-text addendum for THIS contract only.
                Boilerplate stays standardized; this lets Carol add a custom
                clause (deposit terms, promotional rate, access notes, etc.)
                before sending or resending. Auto-saves on blur. */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, color: '#1e3a5f', fontWeight: 600 }}>
                Special Terms (optional — appears as a highlighted block in the contract)
              </label>
              <textarea
                defaultValue={space.special_terms || ''}
                onBlur={async (e) => {
                  const v = e.target.value;
                  if ((v || '') === (space.special_terms || '')) return;
                  try {
                    await api.updateStorage(space.billing_id, { special_terms: v });
                    setContractMsg('Special terms saved — preview or resend to push changes to the customer');
                  } catch (err) { setContractMsg('Error saving: ' + err.message); }
                }}
                placeholder="e.g. First-month free promotional rate, no access after 9pm, etc."
                rows={3}
                style={{ ...inputStyleFull, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <BillingStatusPanel space={space} />

            {/* Contract status — always visible so Carol can see what's been
                sent and accepted without hunting through emails. */}
            <div style={{ fontSize: '0.8rem', marginBottom: '10px', padding: '8px 10px', borderRadius: '4px',
                          backgroundColor: space.contract_accepted_at ? '#f0fdf4' : space.contract_sent_at ? '#fffbeb' : '#f9fafb',
                          border: `1px solid ${space.contract_accepted_at ? '#bbf7d0' : space.contract_sent_at ? '#fcd34d' : '#e5e7eb'}`,
                          color: space.contract_accepted_at ? '#065f46' : space.contract_sent_at ? '#92400e' : '#6b7280' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div>
                  <strong>Contract status: </strong>
                  {space.contract_accepted_at
                    ? `Accepted ${formatDateTime(space.contract_accepted_at)}`
                    : space.contract_sent_at
                      ? `Sent ${formatDateTime(space.contract_sent_at)} — pending acceptance`
                      : 'Not sent yet'}
                </div>
                {(space.contract_sent_at || space.contract_accepted_at) && (
                  <button onClick={async () => {
                    try {
                      const { viewUrl } = await api.getStorageContractPreviewUrl(space.billing_id);
                      window.open(viewUrl, '_blank', 'noopener');
                    } catch (err) { setContractMsg('Error: ' + err.message); }
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', textDecoration: 'underline', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}>
                    View Contract
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={async () => {
                try {
                  setContractMsg('Generating...');
                  const blob = await api.generateStorageContract({ billing_id: space.billing_id });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                  setContractMsg('Contract PDF opened');
                } catch (err) { setContractMsg('Error: ' + err.message); }
              }} style={{ ...btnTinyGray, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '6px 14px' }}>
                Download Contract
              </button>
              {space.has_signed_contract && (
              <button onClick={async () => {
                const w = window.open('about:blank', '_blank');
                try {
                  setContractMsg('Opening signed contract...');
                  const blob = await api.getStorageSignedContract(space.billing_id);
                  const url = URL.createObjectURL(blob);
                  if (w) w.location.href = url; else window.open(url, '_blank', 'noopener');
                  setContractMsg('Signed contract opened - use your browser to print');
                } catch (err) { if (w) w.close(); setContractMsg('Error: ' + err.message); }
              }} style={{ ...btnTinyGray, backgroundColor: '#dcfce7', color: '#065f46', border: '1px solid #86efac', padding: '6px 14px' }}>
                Print Signed Contract
              </button>
              )}
              <button onClick={async () => {
                try {
                  setContractMsg('Loading preview...');
                  const { viewUrl } = await api.getStorageContractPreviewUrl(space.billing_id);
                  // Open the same page the customer would see in a new tab.
                  // Carol can scroll through the full contract before deciding
                  // to fire the email — kills the "I have no idea what I just
                  // sent" problem.
                  window.open(viewUrl, '_blank', 'noopener');
                  setContractMsg('Preview opened in a new tab — review then click Email Contract to send');
                } catch (err) { setContractMsg('Error: ' + err.message); }
              }} style={{ ...btnTinyGray, backgroundColor: '#f3f4f6', color: '#1e3a5f', border: '1px solid #d1d5db', padding: '6px 14px' }}>
                Preview Contract
              </button>
              <button onClick={async () => {
                if (!window.confirm('Send this contract to the customer? They will receive an email with a link to review and accept.')) return;
                try {
                  setContractMsg('Emailing contract...');
                  const res = await api.emailStorageContract(space.billing_id);
                  setContractMsg(res.message || 'Contract emailed with accept link');
                } catch (err) { setContractMsg('Error: ' + err.message); }
              }} style={{ ...btnTinyGray, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '6px 14px' }}>
                Email Contract
              </button>
              <button onClick={async () => {
                try {
                  setContractMsg('Sending guidelines...');
                  const res = await api.sendStorageGuidelines({ billing_id: space.billing_id });
                  setContractMsg(res.message || 'Guidelines emailed');
                } catch (err) { setContractMsg('Error: ' + err.message); }
              }} style={{ ...btnTinyGray, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '6px 14px' }}>
                Send Guidelines
              </button>
            </div>
          </div>
        )}

        {/* Box History — prior tenants of this same physical space */}
        <div style={{ marginTop: '20px', marginBottom: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <button onClick={() => setHistoryOpen(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', fontWeight: 600, fontSize: '0.9rem', padding: 0 }}>
            {historyOpen ? '▼' : '▶'} Box History
          </button>
          {historyOpen && (
            <div style={{ marginTop: '10px' }}>
              {!historyLoaded && <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Loading…</div>}
              {historyLoaded && history.length === 0 && (
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>No prior tenants.</div>
              )}
              {historyLoaded && history.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Customer</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Unit</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>Start</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>End</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Months Paid</th>
                      {canSeeFinancials && <th style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Total Paid</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => {
                      const isActive = !h.billing_end_date && !h.deleted_at;
                      const name = `${h.last_name || ''}${h.first_name ? ', ' + h.first_name : ''}${h.company_name ? ' (' + h.company_name + ')' : ''}`;
                      const unit = [h.unit_year, h.unit_make, h.unit_model].filter(Boolean).join(' ') || '—';
                      const fmtDate = (d) => d ? (d.includes('T') ? d.split('T')[0] : d) : '—';
                      return (
                        <tr key={h.billing_id} style={{ backgroundColor: isActive ? '#ecfdf5' : 'transparent' }}>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                            <a href={`/customers/${h.customer_id}`} style={{ color: '#1e3a5f', textDecoration: 'underline' }}>{name}</a>
                            {isActive && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>CURRENT</span>}
                          </td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{unit}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{fmtDate(h.billing_start_date)}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{fmtDate(h.billing_end_date)}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>${parseFloat(h.monthly_rate || 0).toFixed(2)}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>
                            {h.paid_months}{h.unpaid_months > 0 ? <span style={{ color: '#dc2626' }}> ({h.unpaid_months} unpaid)</span> : ''}
                          </td>
                          {canSeeFinancials && (
                            <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 600 }}>
                              ${parseFloat(h.paid_total || 0).toFixed(2)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button onClick={handleSave} disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          {canEdit && (
            <button onClick={handleEndStorage} disabled={saving} style={btnDanger}>End Storage</button>
          )}
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddSpaceModal — create new storage space (admin only)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// BillingConfirmModal — preview and confirm monthly billing run
// ---------------------------------------------------------------------------
function BillingConfirmModal({ preview, month, loading, onMonthChange, running, onClose, onConfirm, formatCurrency }) {

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Run Monthly Billing</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Active Customers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f' }}>{preview.count}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Amount</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(preview.total_amount)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Billing Month</label>
          <input type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }} />
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, position: 'sticky', top: 0, backgroundColor: '#f9fafb' }}>Space</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, backgroundColor: '#f9fafb' }}>Customer</th>
                <th style={{ ...thStyle, position: 'sticky', top: 0, backgroundColor: '#f9fafb', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {preview.billings.map((b, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{b.space}</td>
                  <td style={tdStyle}>{b.customer}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(b.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onConfirm(month)} disabled={running || loading} style={btnPrimary}>
            {running ? 'Recording...' : loading ? 'Loading...' : `Record & Post Storage Billing for ${month}`}
          </button>
          <button onClick={onClose} disabled={running} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function WaitlistNotifyModal({ entry, onClose, onSent }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const name = entry.first_name || entry.contact_name || 'Customer';
  const email = entry.email_primary || entry.contact_email || null;
  const phone = entry.phone_primary || entry.contact_phone || null;
  const typeLabel = entry.space_type === 'indoor' ? 'Indoor' : 'Outdoor';

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const res = await api.notifyWaitlistEntry(entry.id, { personalMessage: message });
      const parts = [];
      if (res.results?.email === 'sent') parts.push('Email sent');
      if (res.results?.sms === 'sent') parts.push('SMS sent');
      onSent(parts.length ? parts.join(' + ') : 'Notified (no contact method available)');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Notify Waitlist — {name}</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
          {typeLabel} space &middot; {email ? `Email: ${email}` : 'No email on file'}{phone ? ` · SMS: ${phone}` : ''}
        </div>
        {error && <div style={errorBannerSmall}>{error}</div>}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Personal Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${name}, an ${typeLabel.toLowerCase()} space just opened up. Let me know if you'd like it.`}
            rows={5}
            autoFocus
            style={{ ...inputStyleFull, minHeight: '110px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
            Email: shown as a highlighted block above the standard availability message. SMS: replaces the canned text. Leave blank to send the default messages.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={sending} style={btnSecondary}>Cancel</button>
          <button onClick={handleSend} disabled={sending} style={btnPrimary}>
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmailCustomerModal — plain email to one storage customer. Sends through the
// ERP's own mail service and lands in that customer's Communication History,
// so an ad-hoc note is on the record the same as an invoice or a reminder.
// ---------------------------------------------------------------------------
function EmailCustomerModal({ space, onClose, onSent }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const name = [space.first_name, space.last_name].filter(Boolean).join(' ') || 'Customer';
  const boxLabel = space.label;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { setError('Subject and message are both required.'); return; }
    setSending(true);
    setError('');
    try {
      const res = await api.sendCustomerEmail({
        customer_id: space.customer_id,
        subject: subject.trim(),
        body: body.trim(),
      });
      onSent(`Email sent to ${res.to}`);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Email {name}</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
          {boxLabel} &middot; To: {space.email_primary}
          {space.phone_primary ? ` · ${formatPhone(space.phone_primary)}` : ''}
        </div>
        {error && <div style={errorBannerSmall}>{error}</div>}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus
                 placeholder={`Your RV in ${boxLabel}`} style={inputStyleFull} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9}
                    placeholder={`Hi ${space.first_name || 'there'},`}
                    style={{ ...inputStyleFull, minHeight: '170px', fontFamily: 'inherit', resize: 'vertical' }} />
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
            Sent on Master Tech letterhead and logged to this customer's Communication History. Blank lines become paragraph breaks.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={sending} style={btnSecondary}>Cancel</button>
          <button onClick={handleSend} disabled={sending} style={btnPrimary}>
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

function perFootRate(rates, type) {
  return type === 'indoor'
    ? (parseFloat(rates && rates.indoor_per_foot) || 23)
    : (parseFloat(rates && rates.outdoor_per_foot) || 6);
}

function EditWaitlistModal({ entry, onClose, onSaved, rates }) {
  const [form, setForm] = useState({
    contact_name: entry.contact_name || (entry.cust_first ? `${entry.cust_first} ${entry.cust_last}` : ''),
    contact_phone: entry.contact_phone || entry.cust_phone || '',
    contact_email: entry.contact_email || entry.cust_email || '',
    space_type: entry.space_type || 'indoor',
    rv_year: entry.rv_year || '',
    rv_make: entry.rv_make || '',
    rv_model: entry.rv_model || '',
    rv_length_feet: entry.rv_length_feet || '',
    preferred_start: entry.preferred_start ? entry.preferred_start.slice(0, 10) : '',
    budget_monthly: entry.budget_monthly || '',
    notes: entry.notes || '',
    status: entry.status || 'waiting',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // ── Customer units (for RV prefill) ──
  const [custUnits, setCustUnits] = useState([]);
  useEffect(() => {
    if (entry.customer_id) {
      api.getCustomerUnits(entry.customer_id).then(setCustUnits).catch(() => setCustUnits([]));
    }
  }, [entry.customer_id]);

  const prefillUnit = (u) => {
    setForm(f => ({
      ...f,
      rv_year: u.year || '',
      rv_make: u.make || '',
      rv_model: u.model || '',
      rv_length_feet: u.linear_feet ? String(parseFloat(u.linear_feet)) : '',
    }));
  };

  // ── Set Up Contract flow ──
  const [contractMode, setContractMode] = useState(false);
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [contractStartDate, setContractStartDate] = useState(form.preferred_start || new Date().toISOString().split('T')[0]);
  const [sendContract, setSendContract] = useState(true);
  const [sendGuidelines, setSendGuidelines] = useState(true);
  const [contractSaving, setContractSaving] = useState(false);
  const [contractSuccess, setContractSuccess] = useState('');
  // Second space/RV (multi-unit contract)
  const [addSecond, setAddSecond] = useState(false);
  const [allAvailSpaces, setAllAvailSpaces] = useState([]);
  const [secondSpaceId, setSecondSpaceId] = useState('');
  const [secondRv, setSecondRv] = useState({ year: '', make: '', model: '', length: '' });
  const [secondRate, setSecondRate] = useState('');

  const startContractSetup = async () => {
    setErr('');
    if (!form.contact_name) { setErr('Contact name is required'); return; }
    if (!form.space_type) { setErr('Storage type is required'); return; }
    try {
      const data = await api.getStorageSpaces();
      // A space is "available" when it has no active billing (billing_id NULL).
      // The backend doesn't expose a status field — earlier code filtered
      // on s.status === 'available' which is always false, so the available
      // list always came back empty even when open spaces existed.
      const spaces = (data.spaces || data || []).filter(s =>
        s.space_type === form.space_type && !s.billing_id
      );
      setAvailableSpaces(spaces);
      setAllAvailSpaces((data.spaces || data || []).filter(sp => !sp.billing_id));
      if (spaces.length === 1) setSelectedSpaceId(String(spaces[0].id));
      setContractMode(true);
    } catch (e) { setErr('Failed to load spaces: ' + e.message); }
  };

  const handleSetupContract = async () => {
    if (!selectedSpaceId) { setErr('Please select a space'); return; }
    if (addSecond && !secondSpaceId) { setErr('Select the second space (or turn off the second unit)'); return; }
    setContractSaving(true);
    setErr('');
    try {
      // 1. Create customer if not already linked
      let customerId = entry.customer_id;
      if (!customerId) {
        const nameParts = form.contact_name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const newCust = await api.createCustomer({
          first_name: firstName,
          last_name: lastName,
          phone_primary: form.contact_phone || null,
          email_primary: form.contact_email || null,
          is_storage_customer: true,
        });
        customerId = newCust.id;
      } else {
        // Mark existing customer as storage customer
        try { await api.updateCustomer(customerId, { is_storage_customer: true }); } catch {}
      }

      // 2-4. Create unit(s) + assign space(s). With a second space/RV, both
      // billings share a contract_group so they form one lease (rates summed).
      const groupId = (addSecond && secondSpaceId)
        ? ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID()
           : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
        : null;

      const makeUnit = async (rv) => {
        if (!(rv.year || rv.make || rv.model)) return null;
        const u = await api.createUnit({
          customer_id: customerId,
          year: rv.year || null, make: rv.make || null, model: rv.model || null,
          linear_feet: rv.length ? parseFloat(rv.length) : null,
        });
        return u.id;
      };

      const unit1Id = await makeUnit({ year: form.rv_year, make: form.rv_make, model: form.rv_model, length: form.rv_length_feet });
      const ft1 = parseFloat(form.rv_length_feet) || 0;
      const quoted1 = parseFloat(form.budget_monthly);
      const rate1 = (quoted1 > 0) ? quoted1 : (ft1 > 0 ? ft1 * perFootRate(rates, form.space_type) : 0);

      const result = await api.assignStorage({
        space_id: parseInt(selectedSpaceId), customer_id: customerId, unit_id: unit1Id,
        monthly_rate: rate1, due_day: 1, billing_start_date: contractStartDate || null,
        notes: form.notes || null, contract_group: groupId,
      });

      if (groupId) {
        const space2 = allAvailSpaces.find(sp => String(sp.id) === String(secondSpaceId));
        const unit2Id = await makeUnit(secondRv);
        const ft2 = parseFloat(secondRv.length) || 0;
        const quoted2 = parseFloat(secondRate);
        const rate2 = (quoted2 > 0) ? quoted2 : (ft2 > 0 ? ft2 * perFootRate(rates, space2 && space2.space_type) : 0);
        await api.assignStorage({
          space_id: parseInt(secondSpaceId), customer_id: customerId, unit_id: unit2Id,
          monthly_rate: rate2, due_day: 1, billing_start_date: contractStartDate || null,
          notes: form.notes || null, contract_group: groupId,
        });
      }

      // 5. Open a preview of the contract in a new tab so Carol can review
      //    the actual document BEFORE the customer email is sent. The
      //    customer-facing email only fires after she confirms in the dialog.
      const billingId = result?.id;
      if (billingId) {
        if (sendContract) {
          // Prepare the lease as a draft (ensure its token exists) but do NOT
          // email it, so it can be reviewed first. Review and send it from the
          // Storage page (Preview Contract, then Email Contract).
          try { await api.getStorageContractPreviewUrl(billingId); } catch (e) { /* token ensured */ }
        }
        if (sendGuidelines) api.sendStorageGuidelines({ billing_id: billingId }).catch(e => console.error('Guidelines email error:', e));
      }

      // 6. Update waitlist entry to "assigned"
      await api.updateWaitlistEntry(entry.id, { ...form, status: 'assigned', customer_id: customerId });

      setContractSuccess('Customer assigned. Contract handling complete — check the storage box if you want to resend.');
      setTimeout(() => onSaved(), 2000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setContractSaving(false);
    }
  };

  const up = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.contact_name) { setErr('Name is required'); return; }
    setSaving(true);
    try {
      const ft = parseFloat(form.rv_length_feet) || 0;
      const calcRate = ft && form.space_type ? ft * (perFootRate(rates, form.space_type)) : null;
      await api.updateWaitlistEntry(entry.id, {
        ...form,
        rv_length_feet: form.rv_length_feet ? parseFloat(form.rv_length_feet) : null,
        budget_monthly: (form.budget_monthly !== '' && form.budget_monthly != null) ? parseFloat(form.budget_monthly) : calcRate,
      });
      onSaved();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>Edit Waitlist Entry</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>×</button>
        </div>
        {err && <div style={errorBannerSmall}>{err}</div>}
        <form onSubmit={handleSave} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
          {/* Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Contact Name *</label>
            <input value={form.contact_name} onChange={(e) => up('contact_name', e.target.value)}
              style={inputStyleFull} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.contact_phone} onChange={(e) => up('contact_phone', handlePhoneInput(e.target.value))}
                placeholder="(303) 555-1212" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.contact_email} onChange={(e) => up('contact_email', e.target.value)}
                style={inputStyleFull} />
            </div>
          </div>

          {/* Storage Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Storage Type *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['indoor', 'outdoor'].map(t => (
                <button key={t} type="button" onClick={() => up('space_type', t)} style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', textTransform: 'capitalize',
                  border: form.space_type === t ? '2px solid' : '1px solid #d1d5db',
                  backgroundColor: form.space_type === t ? (t === 'indoor' ? '#dbeafe' : '#fef3c7') : '#fff',
                  color: form.space_type === t ? (t === 'indoor' ? '#1e40af' : '#92400e') : '#6b7280',
                  borderColor: form.space_type === t ? (t === 'indoor' ? '#3b82f6' : '#f59e0b') : '#d1d5db',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Unit Selector (if customer has RVs on file) */}
          {custUnits.length > 1 && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Select RV / Unit</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {custUnits.map(u => {
                  const label = [u.year, u.make, u.model].filter(Boolean).join(' ') || 'Unknown Unit';
                  const isSelected = form.rv_year === (u.year || '') && form.rv_make === (u.make || '') && form.rv_model === (u.model || '');
                  return (
                    <button key={u.id} type="button" onClick={() => prefillUnit(u)} style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #1e3a5f' : '1px solid #d1d5db',
                      backgroundColor: isSelected ? '#dbeafe' : '#fff',
                      color: isSelected ? '#1e3a5f' : '#374151',
                    }}>
                      {label}{u.linear_feet ? ` (${parseFloat(u.linear_feet)} ft)` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RV Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>RV Year</label>
              <input value={form.rv_year} onChange={(e) => up('rv_year', e.target.value)}
                placeholder="2024" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>RV Make</label>
              <input value={form.rv_make} onChange={(e) => up('rv_make', e.target.value)}
                placeholder="Airstream" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>RV Model</label>
              <input value={form.rv_model} onChange={(e) => up('rv_model', e.target.value)}
                placeholder="Basecamp" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Linear Feet</label>
              <input type="number" value={form.rv_length_feet} onChange={(e) => { const val = e.target.value; setForm(f => { const ft = parseFloat(val) || 0; const sug = ft && f.space_type ? (ft * (perFootRate(rates, f.space_type))).toFixed(2) : ''; const budget = (f.budget_monthly === '' || f.budget_monthly == null) ? sug : f.budget_monthly; return { ...f, rv_length_feet: val, budget_monthly: budget }; }); }}
                placeholder="22" style={inputStyleFull} />
            </div>
          </div>

          {/* Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Requested Start Date</label>
              <input type="date" value={form.preferred_start} onChange={(e) => up('preferred_start', e.target.value)}
                style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Monthly Storage Rate</label>
              <input type="number" step="0.01" min="0"
                value={form.budget_monthly}
                onChange={(e) => up('budget_monthly', e.target.value)}
                placeholder="e.g. 168.00"
                style={{ ...inputStyleFull, backgroundColor: '#f0fdf4', fontWeight: 600 }} />
              <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '2px' }}>Auto-fills from linear feet. Type over it to quote a different rate.</div>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={(e) => up('status', e.target.value)} style={inputStyleFull}>
              <option value="waiting">Waiting</option>
              <option value="notified">Notified</option>
              {/* "Assigned" is set only by the Set Up Contract flow (which builds the
                  billing). It's not manually selectable — picking it here used to
                  hide the person with no contract and no way back. */}
              {form.status === 'assigned' && <option value="assigned" disabled>Assigned (use Set Up Contract)</option>}
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={(e) => up('notes', e.target.value)}
              rows={3} style={{ ...inputStyleFull, resize: 'vertical' }} placeholder="e.g. check size, needs June 2026..." />
          </div>

          {/* Set Up Contract Section */}
          {contractMode && (
            <div style={{ marginBottom: '18px', padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 12px', color: '#1e3a5f', fontSize: '0.95rem' }}>Set Up Contract</h3>
              {contractSuccess ? (
                <div style={{ padding: '12px', backgroundColor: '#d1fae5', borderRadius: '6px', color: '#065f46', fontWeight: 600, textAlign: 'center' }}>
                  ✓ {contractSuccess}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Select Available Space *</label>
                    {availableSpaces.length === 0 ? (
                      <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px', color: '#dc2626', fontSize: '0.85rem' }}>
                        No available {form.space_type} spaces. Please add a space first.
                      </div>
                    ) : (
                      <select value={selectedSpaceId} onChange={(e) => setSelectedSpaceId(e.target.value)} style={inputStyleFull}>
                        <option value="">-- Select a space --</option>
                        {availableSpaces.map(s => (
                          <option key={s.id} value={s.id}>{s.label} — {s.space_type} ({s.linear_feet ? s.linear_feet + ' ft' : 'no size'})</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)} style={inputStyleFull} />
                  </div>

                  {/* Second space + RV on the same contract (rates are summed) */}
                  <div style={{ marginBottom: '12px', borderTop: '1px dashed #d1d5db', paddingTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
                      <input type="checkbox" checked={addSecond} onChange={(e) => setAddSecond(e.target.checked)} /> Add a second space &amp; RV to this contract
                    </label>
                  </div>
                  {addSecond && (
                    <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <label style={labelStyle}>Second Space</label>
                      <select value={secondSpaceId} onChange={(e) => setSecondSpaceId(e.target.value)} style={inputStyleFull}>
                        <option value="">-- Select a space --</option>
                        {allAvailSpaces.filter(s => String(s.id) !== String(selectedSpaceId)).map(s => (
                          <option key={s.id} value={s.id}>{s.label} — {s.space_type} ({s.linear_feet ? s.linear_feet + ' ft' : 'no size'})</option>
                        ))}
                      </select>
                      <label style={{ ...labelStyle, marginTop: '10px' }}>Second RV</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input placeholder="Year" value={secondRv.year} onChange={(e) => setSecondRv({ ...secondRv, year: e.target.value })} style={{ ...inputStyleFull, flex: '0 0 70px' }} />
                        <input placeholder="Make" value={secondRv.make} onChange={(e) => setSecondRv({ ...secondRv, make: e.target.value })} style={inputStyleFull} />
                        <input placeholder="Model" value={secondRv.model} onChange={(e) => setSecondRv({ ...secondRv, model: e.target.value })} style={inputStyleFull} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <input placeholder="Length (ft)" value={secondRv.length} onChange={(e) => setSecondRv({ ...secondRv, length: e.target.value })} style={inputStyleFull} />
                        <input placeholder="Rate $/mo (auto)" value={secondRate} onChange={(e) => setSecondRate(e.target.value)} style={inputStyleFull} />
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>Leave rate blank to auto-calc from length &times; the per-foot rate for that space type.</p>
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
                      <input type="checkbox" checked={sendContract} onChange={(e) => setSendContract(e.target.checked)} /> Prepare contract (review before sending)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', marginTop: '6px' }}>
                      <input type="checkbox" checked={sendGuidelines} onChange={(e) => setSendGuidelines(e.target.checked)} /> Email storage guidelines
                    </label>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem', color: '#065f46' }}>
                    <strong>Summary:</strong> {form.contact_name} → {form.space_type} storage
                    {form.rv_length_feet && ` • ${form.rv_length_feet} ft`}
                    {(() => {
                      const r1 = (parseFloat(form.budget_monthly) > 0) ? parseFloat(form.budget_monthly) : (parseFloat(form.rv_length_feet) || 0) * perFootRate(rates, form.space_type);
                      const space2 = allAvailSpaces.find(s => String(s.id) === String(secondSpaceId));
                      const r2 = (addSecond && secondSpaceId) ? ((parseFloat(secondRate) > 0) ? parseFloat(secondRate) : (parseFloat(secondRv.length) || 0) * perFootRate(rates, space2 && space2.space_type)) : 0;
                      const total = r1 + r2;
                      if (!total) return null;
                      return (addSecond && secondSpaceId)
                        ? ` • 2 spaces • $${r1.toFixed(2)} + $${r2.toFixed(2)} = $${total.toFixed(2)}/mo`
                        : ` • $${total.toFixed(2)}/mo`;
                    })()}
                    {!entry.customer_id && ' • New customer record will be created'}
                  </div>
                  <button type="button" onClick={handleSetupContract} disabled={contractSaving || !selectedSpaceId || (addSecond && !secondSpaceId)}
                    style={{ ...btnPrimary, width: '100%', padding: '12px', backgroundColor: '#065f46', opacity: (!selectedSpaceId || contractSaving || (addSecond && !secondSpaceId)) ? 0.5 : 1 }}>
                    {contractSaving ? 'Setting up...' : 'Assign Space & Send Contract'}
                  </button>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Added {formatDate(entry.created_at)}
                {entry.notified_at && ` · Notified ${formatDate(entry.notified_at)}`}
              </div>
              {!contractMode && entry.status !== 'assigned' && (
                <button type="button" onClick={startContractSetup}
                  style={{ padding: '6px 14px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  Set Up Contract
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddWaitlistModal({ onClose, onAdded, prefill, rates }) {
  const [form, setForm] = useState(() => ({
    contact_name: prefill?.contactName || '', contact_phone: prefill?.contactPhone || '', contact_email: prefill?.contactEmail || '',
    space_type: prefill?.spaceType || 'indoor', rv_year: prefill?.rvYear || '', rv_make: prefill?.rvMake || '', rv_model: prefill?.rvModel || '',
    rv_length_feet: prefill?.lengthFt || '', preferred_start: prefill?.preferred || '', budget_monthly: '', notes: prefill?.notes || prefill?.message || '',
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  // Customer search
  const [custSearch, setCustSearch] = useState('');
  const [custResults, setCustResults] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [custUnits, setCustUnits] = useState([]);
  const searchTimeout = useRef(null);

  const searchCustomers = (q) => {
    setCustSearch(q);
    setSelectedCust(null);
    setCustUnits([]);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setCustResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await api.getCustomers({ search: q });
        setCustResults((data.customers || data).slice(0, 8));
      } catch (_) {}
    }, 300);
  };

  const prefillUnit = (u) => {
    setForm(f => ({
      ...f,
      rv_year: u.year || '',
      rv_make: u.make || '',
      rv_model: u.model || '',
      rv_length_feet: u.linear_feet ? String(parseFloat(u.linear_feet)) : '',
    }));
  };

  const selectCustomer = async (c) => {
    setSelectedCust(c);
    setCustSearch(`${c.first_name} ${c.last_name}`);
    setCustResults([]);
    setForm(f => ({
      ...f,
      contact_name: `${c.first_name} ${c.last_name}`,
      contact_phone: c.phone_primary || f.contact_phone,
      contact_email: c.email_primary || f.contact_email,
    }));
    // Fetch customer's units and prefill RV info
    try {
      const units = await api.getCustomerUnits(c.id);
      setCustUnits(units);
      if (units.length === 1) {
        prefillUnit(units[0]);
      }
    } catch (_) { setCustUnits([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name && !selectedCust) { setErr('Name is required'); return; }
    if (!form.space_type) { setErr('Storage type is required'); return; }
    setSaving(true);
    try {
      const ft = parseFloat(form.rv_length_feet) || 0;
      const calcRate = ft && form.space_type ? ft * (perFootRate(rates, form.space_type)) : null;
      await api.addToWaitlist({
        ...form,
        customer_id: selectedCust?.id || null,
        rv_length_feet: form.rv_length_feet ? parseFloat(form.rv_length_feet) : null,
        budget_monthly: (form.budget_monthly !== '' && form.budget_monthly != null) ? parseFloat(form.budget_monthly) : calcRate,
      });
      onAdded();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  };

  const up = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>Add to Storage Waitlist</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>×</button>
        </div>
        {err && <div style={errorBannerSmall}>{err}</div>}
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
          {/* Customer Search */}
          <div style={{ marginBottom: '14px', position: 'relative' }}>
            <label style={labelStyle}>Customer / Name *</label>
            <input value={custSearch} onChange={(e) => searchCustomers(e.target.value)}
              placeholder="Search existing customers or type a name..."
              style={inputStyleFull} />
            {custResults.length > 0 && (
              <div style={dropdownStyle}>
                {custResults.map(c => (
                  <div key={c.id} onClick={() => selectCustomer(c)} style={dropdownItem}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}>
                    {c.first_name} {c.last_name} {c.phone_primary ? `— ${c.phone_primary}` : ''}
                  </div>
                ))}
              </div>
            )}
            {!selectedCust && custSearch.length >= 2 && custResults.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                No customer found — entry will be saved with the name below
              </div>
            )}
          </div>

          {/* Contact Name (if no customer selected) */}
          {!selectedCust && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Contact Name *</label>
              <input value={form.contact_name} onChange={(e) => up('contact_name', e.target.value)}
                style={inputStyleFull} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.contact_phone} onChange={(e) => up('contact_phone', handlePhoneInput(e.target.value))}
                placeholder="(303) 555-1212" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.contact_email} onChange={(e) => up('contact_email', e.target.value)}
                style={inputStyleFull} />
            </div>
          </div>

          {/* Storage Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Storage Type *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['indoor', 'outdoor'].map(t => (
                <button key={t} type="button" onClick={() => up('space_type', t)} style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', textTransform: 'capitalize',
                  border: form.space_type === t ? '2px solid' : '1px solid #d1d5db',
                  backgroundColor: form.space_type === t ? (t === 'indoor' ? '#dbeafe' : '#fef3c7') : '#fff',
                  color: form.space_type === t ? (t === 'indoor' ? '#1e40af' : '#92400e') : '#6b7280',
                  borderColor: form.space_type === t ? (t === 'indoor' ? '#3b82f6' : '#f59e0b') : '#d1d5db',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Unit Selector (if customer has multiple RVs) */}
          {custUnits.length > 1 && (
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Select RV / Unit</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {custUnits.map(u => {
                  const label = [u.year, u.make, u.model].filter(Boolean).join(' ') || 'Unknown Unit';
                  const isSelected = form.rv_year === (u.year || '') && form.rv_make === (u.make || '') && form.rv_model === (u.model || '');
                  return (
                    <button key={u.id} type="button" onClick={() => prefillUnit(u)} style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #1e3a5f' : '1px solid #d1d5db',
                      backgroundColor: isSelected ? '#dbeafe' : '#fff',
                      color: isSelected ? '#1e3a5f' : '#374151',
                    }}>
                      {label}{u.linear_feet ? ` (${parseFloat(u.linear_feet)} ft)` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RV Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>RV Year</label>
              <input value={form.rv_year} onChange={(e) => up('rv_year', e.target.value)}
                placeholder="2024" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>RV Make</label>
              <input value={form.rv_make} onChange={(e) => up('rv_make', e.target.value)}
                placeholder="Airstream" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>RV Model</label>
              <input value={form.rv_model} onChange={(e) => up('rv_model', e.target.value)}
                placeholder="Basecamp" style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Linear Feet</label>
              <input type="number" value={form.rv_length_feet} onChange={(e) => { const val = e.target.value; setForm(f => { const ft = parseFloat(val) || 0; const sug = ft && f.space_type ? (ft * (perFootRate(rates, f.space_type))).toFixed(2) : ''; const budget = (f.budget_monthly === '' || f.budget_monthly == null) ? sug : f.budget_monthly; return { ...f, rv_length_feet: val, budget_monthly: budget }; }); }}
                placeholder="22" style={inputStyleFull} />
            </div>
          </div>

          {/* Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Requested Start Date</label>
              <input type="date" value={form.preferred_start} onChange={(e) => up('preferred_start', e.target.value)}
                style={inputStyleFull} />
            </div>
            <div>
              <label style={labelStyle}>Monthly Storage Rate</label>
              <input type="number" step="0.01" min="0"
                value={form.budget_monthly}
                onChange={(e) => up('budget_monthly', e.target.value)}
                placeholder="e.g. 168.00"
                style={{ ...inputStyleFull, backgroundColor: '#f0fdf4', fontWeight: 600 }} />
              <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '2px' }}>Auto-fills from linear feet. Type over it to quote a different rate.</div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={(e) => up('notes', e.target.value)}
              rows={2} style={{ ...inputStyleFull, resize: 'vertical' }} placeholder="e.g. check size, needs June 2026..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? 'Adding...' : 'Add to Waitlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSpaceModal({ onClose, onCreated }) {
  const [spaceNumber, setSpaceNumber] = useState('');
  const [spaceType, setSpaceType] = useState('outdoor');
  const [linearFeet, setLinearFeet] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spaceNumber.trim()) { setError('Space number is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.createStorageSpace({ space_number: spaceNumber.trim(), space_type: spaceType, notes: notes || null, linear_feet: linearFeet ? parseFloat(linearFeet) : null });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Add Storage Space</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>
        {error && <div style={errorBannerSmall}>{error}</div>}
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Space Number / Label</label>
            <input type="text" value={spaceNumber} onChange={(e) => setSpaceNumber(e.target.value)} placeholder='e.g. 27, A1, OVERFLOW-1' style={inputStyleFull} autoFocus />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Type</label>
            <select value={spaceType} onChange={(e) => setSpaceType(e.target.value)} style={inputStyleFull}>
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Linear Feet (optional)</label>
            <input type="number" step="0.1" min="0" value={linearFeet} onChange={(e) => setLinearFeet(e.target.value)} placeholder="e.g. 45.0" style={inputStyleFull} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyleFull, minHeight: '60px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Creating...' : 'Add Space'}</button>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '0.875rem' }}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const sectionStyle = {
  marginBottom: '24px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const sectionTitle = {
  fontSize: '1rem', fontWeight: 700, color: '#1e3a5f',
  marginTop: 0, marginBottom: '16px', paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb',
};
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
};
const spaceCardStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid',
  minHeight: '80px',
  transition: 'transform 0.1s',
};
// Full-width panel for the expanded inline editor. It is its own grid item
// (grid-column: 1 / -1), so the clicked card keeps its position and the page
// does not jump on expand.
const expandedEditorStyle = {
  gridColumn: '1 / -1',
  backgroundColor: '#fff',
  border: '2px solid #1e3a5f',
  borderRadius: '8px',
  padding: '12px',
};
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '28px',
  width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = {
  textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280',
};
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' };
const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em',
};
const inputStyle = {
  padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px',
  fontSize: '0.875rem',
};
const inputStyleFull = {
  ...inputStyle, width: '100%', boxSizing: 'border-box',
};
const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0,
  backgroundColor: '#fff', border: '1px solid #d1d5db',
  borderRadius: '4px', maxHeight: '200px', overflowY: 'auto',
  zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
const dropdownItem = {
  padding: '8px 12px', cursor: 'pointer',
  borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem',
};
const btnPrimary = {
  padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const btnDanger = {
  padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626',
  border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSmall = {
  padding: '6px 12px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
};
const btnTinyGray = {
  padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem',
};
const errorBanner = {
  padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626',
  borderRadius: '6px', marginBottom: '16px', border: '1px solid #fecaca',
  fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const successBanner = {
  padding: '10px 14px', backgroundColor: '#f0fdf4', color: '#065f46',
  borderRadius: '6px', marginBottom: '16px', border: '1px solid #bbf7d0',
  fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const errorBannerSmall = {
  padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626',
  borderRadius: '4px', marginBottom: '12px', fontSize: '0.8rem',
};
const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
  color: 'inherit', fontSize: '0.85rem',
};
const closeBtnLargeStyle = {
  background: 'none', border: '1px solid #d1d5db', borderRadius: '4px',
  cursor: 'pointer', padding: '4px 10px', fontSize: '0.85rem', color: '#6b7280',
};
