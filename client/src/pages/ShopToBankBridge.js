import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Ledger cutover. Jan-Apr 2026 is QBO summary data in historical_pnl, so those
// months have no journal lines to reconcile against at the penny.
const FIRST_TIEABLE = { 2026: 5 };

function fmt(v) {
  const n = parseFloat(v || 0);
  if (n === 0) return '—';
  const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `(${s})` : s;
}

const TH = {
  padding: '4px 6px', textAlign: 'right', fontWeight: 600, fontSize: '0.7rem',
  borderBottom: '2px solid #1e3a5f', whiteSpace: 'nowrap',
};
const TD = { padding: '3px 6px', textAlign: 'right', fontSize: '0.72rem', whiteSpace: 'nowrap' };
const LABEL = { ...TD, textAlign: 'left', width: '230px' };

function Row({ label, values, total, bold, indent, note, tone }) {
  const bg = tone === 'head' ? '#f1f5f9' : tone === 'total' ? '#f8fafc' : 'transparent';
  const color = tone === 'bad' ? '#b91c1c' : tone === 'good' ? '#15803d' : 'inherit';
  return (
    <tr style={{ backgroundColor: bg, borderTop: bold ? '1px solid #cbd5e1' : 'none' }}>
      <td style={{ ...LABEL, fontWeight: bold ? 700 : 400, paddingLeft: indent ? '20px' : '6px', color }}>
        {label}
        {note && <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.65rem' }}> {note}</span>}
      </td>
      {values.map((v, i) => (
        <td key={i} style={{ ...TD, fontWeight: bold ? 700 : 400, color }}>{fmt(v)}</td>
      ))}
      <td style={{ ...TD, fontWeight: 700, borderLeft: '2px solid #1e3a5f', color }}>{fmt(total)}</td>
    </tr>
  );
}

function SectionHead({ title, sub }) {
  return (
    <tr style={{ backgroundColor: '#1e3a5f' }}>
      <td colSpan={14} style={{ padding: '5px 8px', color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}>
        {title}
        {sub && <span style={{ fontWeight: 400, opacity: 0.75 }}>  {sub}</span>}
      </td>
    </tr>
  );
}

export default function ShopToBankBridge() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (y) => {
    setLoading(true); setError('');
    try {
      setData(await api.getShopToBankBridge(y));
    } catch (e) {
      setError(e.message); setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(year); }, [year, load]);

  const col = (fn) => (data ? data.months.map(fn) : []);
  const sum = (fn) => (data ? data.months.reduce((a, m) => a + parseFloat(fn(m) || 0), 0) : 0);
  const cutover = FIRST_TIEABLE[year] || 1;

  return (
    <div style={{ padding: '16px 20px', maxWidth: '100%' }}>
      <style>{`@media print {
        .no-print { display: none !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { size: landscape; margin: 0.35in; }
      }`}</style>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '4px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#1e3a5f' }}>Shop to Bank Bridge</h1>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          What the shop produced, reconciled to what the books received. Whole dollars.
        </span>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '10px 0 14px' }}>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
          {[thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Print
        </button>
        <a href="/reports" style={{ fontSize: '0.85rem', color: '#0d9488' }}>Back to Reports</a>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading…</p>}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      {data && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ ...TH, textAlign: 'left' }}>{data.year}</th>
                  {MONTHS.map((m, i) => (
                    <th key={m} style={{ ...TH, color: i + 1 < cutover ? '#94a3b8' : '#1e3a5f' }}>{m}</th>
                  ))}
                  <th style={{ ...TH, borderLeft: '2px solid #1e3a5f' }}>Year</th>
                </tr>
              </thead>
              <tbody>
                <SectionHead title="PRODUCED" sub="what the shop finished, ex tax and card fee" />
                <Row label="Work orders completed" indent values={col((m) => m.produced.workOrders)} total={sum((m) => m.produced.workOrders)} />
                <Row label="Storage billed" indent values={col((m) => m.produced.storage)} total={sum((m) => m.produced.storage)} />
                <Row label="Parts counter sales" indent values={col((m) => m.produced.parts)} total={sum((m) => m.produced.parts)} />
                <Row label="Total produced" bold tone="total" values={col((m) => m.produced.total)} total={sum((m) => m.produced.total)} />

                <SectionHead title="COLLECTED" sub="cash in the door, by payment date. Storage is rent only, the card fee never reaches the bank" />
                <Row label="Work order payments" indent values={col((m) => m.collected.workOrders)} total={sum((m) => m.collected.workOrders)} />
                <Row label="Storage collected" indent note="rent only" values={col((m) => m.collected.storage)} total={sum((m) => m.collected.storage)} />
                <Row label="Parts sales collected" indent values={col((m) => m.collected.parts)} total={sum((m) => m.collected.parts)} />
                <Row label="Cash collected" bold tone="total" values={col((m) => m.collected.grossTotal)} total={sum((m) => m.collected.grossTotal)} />
                <Row label="of which deposits on open jobs" indent note="memo" values={col((m) => m.collected.deposits)} total={sum((m) => m.collected.deposits)} />
                <Row label="of which refunds" indent note="memo" values={col((m) => m.collected.refunds)} total={sum((m) => m.collected.refunds)} />

                <SectionHead title="BRIDGE TO THE BOOKS" sub="strip what is not income, then compare to the general ledger" />
                <Row label="Less sales tax collected" indent note="liability, not income" values={col((m) => -m.adjustments.salesTaxCollected)} total={-sum((m) => m.adjustments.salesTaxCollected)} />
                <Row label="Card surcharge in the above" indent note="memo, work orders and parts only" values={col((m) => m.adjustments.cardSurchargeCollected)} total={sum((m) => m.adjustments.cardSurchargeCollected)} />
                <Row label="Expected income, cash basis" bold tone="total" values={col((m) => m.adjustments.netRevenueCash)} total={sum((m) => m.adjustments.netRevenueCash)} />
                <Row label="Income per the general ledger" bold values={col((m) => m.books.glIncome)} total={sum((m) => m.books.glIncome)} />
                {data.months.map((m) => m.variance.unexplained).some((v) => v !== 0) && (
                  <Row
                    label="UNEXPLAINED"
                    bold
                    note={`tolerance $${data.tolerance}`}
                    tone={Math.abs(sum((m) => m.variance.unexplained)) > data.tolerance ? 'bad' : 'good'}
                    values={col((m) => m.variance.unexplained)}
                    total={sum((m) => m.variance.unexplained)}
                  />
                )}

                <SectionHead title="UNCOLLECTED ROLL-FORWARD" sub="the control. Opening + invoiced - collected must equal closing" />
                <Row label="Opening uncollected" indent values={col((m) => m.rollForward.openingUncollected)} total={data.rollForward.openingUncollected} />
                <Row label="Plus invoiced, gross" indent values={col((m) => m.rollForward.invoicedGross)} total={sum((m) => m.rollForward.invoicedGross)} />
                <Row label="Less collected, gross" indent values={col((m) => -m.rollForward.collectedGross)} total={-sum((m) => m.rollForward.collectedGross)} />
                <Row label="Closing uncollected" bold tone="total" values={col((m) => m.rollForward.closingUncollected)} total={data.rollForward.closingUncollected} />
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
            <Card
              title="Roll-forward check"
              tone={Math.abs(data.rollForward.drift) > 1 ? 'bad' : 'good'}
              lines={[
                ['Computed closing', fmt(data.rollForward.closingUncollected)],
                ['Actual open invoices', `${fmt(data.rollForward.actualOpenNow)} (${data.rollForward.openInvoiceCount})`],
                ['Drift', fmt(data.rollForward.drift)],
              ]}
              foot={Math.abs(data.rollForward.drift) > 1
                ? 'The roll-forward lost something: a record voided after payment, a deleted payment, or a total changed after collection. Fix before trusting a month.'
                : 'Roll-forward ties to the open invoice list.'}
            />
            <Card
              title="Year to date"
              lines={[
                ['Produced', fmt(data.totals.produced)],
                ['Cash collected', fmt(data.totals.collectedGross)],
                ['Income per the books', fmt(data.totals.glIncome)],
                ['Unexplained', fmt(data.totals.unexplained)],
              ]}
              foot="Produced above collected means the shop is financing customers. Below means it is collecting last month's work."
            />
            <Card
              title="Read this first"
              lines={[]}
              foot={`Months before ${MONTHS[cutover - 1]} ${data.year} are QBO summary data in historical_pnl, not journal lines, so they carry a produced side but cannot be tied at the penny. Storage is booked rent only, without the 3.5% convenience fee, so it lines up with the bank deposit; the produced row above it is billed rent, same basis. Storage cash is dated by when the card was charged. Parts counter sales use the sale date because that table has no payment date.`}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, lines, foot, tone }) {
  const border = tone === 'bad' ? '#b91c1c' : tone === 'good' ? '#15803d' : '#cbd5e1';
  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', flex: '1 1 280px', minWidth: '260px' }}>
      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e3a5f', marginBottom: '6px' }}>{title}</div>
      {lines.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '1px 0' }}>
          <span style={{ color: '#475569' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ))}
      {foot && <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', lineHeight: 1.35 }}>{foot}</div>}
    </div>
  );
}
