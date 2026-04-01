import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import NewCustomerModal from '../components/NewCustomerModal';
import { formatPhone } from '../utils/formatPhone';

export default function Storage() {
  const { isAdmin, canEditRecords, canSeeFinancials } = useAuth();
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

  // Billing report
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportLoading, setReportLoading] = useState(false);

  // Billing run
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingPreview, setBillingPreview] = useState(null);
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResults, setBillingResults] = useState(null);

  // Add space modal
  const [showAddSpace, setShowAddSpace] = useState(false);

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

  const handleSpaceClick = (space) => {
    setSelectedSpace(space);
    if (space.billing_id) {
      setShowDetail(true);
    } else if (canEditRecords) {
      setShowAssign(true);
    }
  };

  const handleOpenBilling = async () => {
    try {
      const preview = await api.getBillingPreview();
      setBillingPreview(preview);
      setShowBillingModal(true);
    } catch (err) {
      setError(err.message);
    }
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ margin: 0 }}>Storage</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {canSeeFinancials && (
            <button onClick={() => { setShowReport(!showReport); if (!showReport) fetchReport(); }} style={btnSecondary}>
              {showReport ? 'Hide Report' : 'Billing Report'}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowAddSpace(true)} style={btnSecondary}>+ Add Space</button>
          )}
          {isAdmin && (
            <button onClick={handleOpenBilling} style={btnPrimary}>
              Run Monthly Billing
            </button>
          )}
        </div>
      </div>

      {error && <div style={errorBanner}>{error} <button onClick={() => setError('')} style={closeBtnStyle}>x</button></div>}
      {actionMsg && <div style={successBanner}>{actionMsg} <button onClick={() => setActionMsg('')} style={closeBtnStyle}>x</button></div>}

      {/* Summary Bar */}
      {summary && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <SummaryCard label="Outdoor" occupied={summary.outdoor.occupied} total={summary.outdoor.total} color="#f59e0b" />
          <SummaryCard label="Indoor" occupied={summary.indoor.occupied} total={summary.indoor.total} color="#3b82f6" />
          <SummaryCard label="Total" occupied={summary.outdoor.occupied + summary.indoor.occupied} total={summary.total} color="#1e3a5f" />
        </div>
      )}

      {/* Outdoor Grid */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Outdoor Spaces ({outdoor.filter(s => s.billing_id).length}/{outdoor.length} occupied)</h2>
        <div style={gridStyle}>
          {outdoor.map(space => (
            <SpaceCard key={space.id} space={space} onClick={() => handleSpaceClick(space)} canSeeFinancials={canSeeFinancials} />
          ))}
        </div>
      </div>

      {/* Indoor Grid */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Indoor Spaces ({indoor.filter(s => s.billing_id).length}/{indoor.length} occupied)</h2>
        <div style={gridStyle}>
          {indoor.map(space => (
            <SpaceCard key={space.id} space={space} onClick={() => handleSpaceClick(space)} canSeeFinancials={canSeeFinancials} />
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
                    <th style={thStyle}>Square ID</th>
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
                      <td style={tdStyle}>{b.billing_start_date}</td>
                      <td style={tdStyle}>{b.square_customer_id || <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>Not linked</span>}</td>
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

      {/* Assign Modal */}
      {showAssign && selectedSpace && (
        <AssignModal
          space={selectedSpace}
          rates={rates}
          onClose={() => { setShowAssign(false); setSelectedSpace(null); }}
          onAssigned={() => { setShowAssign(false); setSelectedSpace(null); setActionMsg('Space assigned'); fetchSpaces(); }}
        />
      )}

      {/* Add Space Modal */}
      {showAddSpace && (
        <AddSpaceModal
          onClose={() => setShowAddSpace(false)}
          onCreated={() => { setShowAddSpace(false); setActionMsg('Space added'); fetchSpaces(); }}
        />
      )}

      {/* Detail Modal */}
      {showDetail && selectedSpace && (
        <DetailModal
          space={selectedSpace}
          canEdit={canEditRecords}
          isAdmin={isAdmin}
          canSeeFinancials={canSeeFinancials}
          onClose={() => { setShowDetail(false); setSelectedSpace(null); }}
          onUpdated={() => { setShowDetail(false); setSelectedSpace(null); setActionMsg('Storage updated'); fetchSpaces(); }}
        />
      )}

      {/* Billing Confirmation Modal */}
      {showBillingModal && billingPreview && (
        <BillingConfirmModal
          preview={billingPreview}
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
function SpaceCard({ space, onClick, canSeeFinancials }) {
  const occupied = !!space.billing_id;
  const label = space.label.replace(/^(Outdoor|Indoor)\s*/, '');

  return (
    <div onClick={onClick} style={{
      ...spaceCardStyle,
      backgroundColor: occupied ? '#fef2f2' : '#f0fdf4',
      borderColor: occupied ? '#fca5a5' : '#86efac',
      cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: occupied ? '#991b1b' : '#065f46', marginBottom: '4px' }}>
        {label}
      </div>
      {occupied ? (
        <div style={{ fontSize: '0.7rem', color: '#6b7280', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>
            {space.last_name}{space.first_name ? `, ${space.first_name}` : ''}
          </div>
          {space.unit_year && (
            <div>{[space.unit_year, space.unit_make, space.unit_model].filter(Boolean).join(' ')}</div>
          )}
          {canSeeFinancials && <div style={{ color: '#059669' }}>${parseFloat(space.monthly_rate).toFixed(0)}/mo</div>}
        </div>
      ) : (
        <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>Available</div>
      )}
    </div>
  );
}

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
function AssignModal({ space, rates, onClose, onAssigned }) {
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [units, setUnits] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [form, setForm] = useState({
    unit_id: '',
    monthly_rate: space.space_type === 'indoor' ? rates.indoor_monthly : rates.outdoor_monthly,
    due_day: 1,
    square_customer_id: '',
    square_sub_id: '',
    billing_start_date: new Date().toISOString().split('T')[0],
    notes: '',
    space_type: space.space_type,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef(null);

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
    setSaving(true);
    setError('');
    try {
      await api.assignStorage({
        space_id: space.id,
        customer_id: selectedCustomer.id,
        unit_id: form.unit_id ? parseInt(form.unit_id) : null,
        monthly_rate: parseFloat(form.monthly_rate),
        due_day: parseInt(form.due_day),
        square_customer_id: form.square_customer_id || null,
        square_sub_id: form.square_sub_id || null,
        billing_start_date: form.billing_start_date || null,
        notes: form.notes || null,
      });
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
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>Assign — {space.label}</h2>
          <button onClick={onClose} style={closeBtnLargeStyle}>X</button>
        </div>

        {error && <div style={errorBannerSmall}>{error}</div>}

        <form onSubmit={handleSubmit}>
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

          {/* Unit */}
          {selectedCustomer && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Unit (optional)</label>
              <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })} style={inputStyleFull}>
                <option value="">No unit selected</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {[u.year, u.make, u.model].filter(Boolean).join(' ')} {u.license_plate ? `— ${u.license_plate}` : ''}
                  </option>
                ))}
              </select>
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving || !selectedCustomer} style={btnPrimary}>
              {saving ? 'Assigning...' : 'Assign Space'}
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
function DetailModal({ space, canEdit, isAdmin, canSeeFinancials, onClose, onUpdated }) {
  const [form, setForm] = useState({
    space_type: space.space_type || 'outdoor',
    monthly_rate: parseFloat(space.monthly_rate) || 0,
    billing_start_date: space.billing_start_date ? (space.billing_start_date.includes('T') ? space.billing_start_date.split('T')[0] : space.billing_start_date) : '',
    notes: space.billing_notes || '',
    square_sub_id: space.square_sub_id || '',
    square_customer_id: space.square_customer_id || '',
    due_day: space.due_day || 1,
    end_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const customerName = `${space.last_name || ''}${space.first_name ? `, ${space.first_name}` : ''}` +
    (space.company_name ? ` (${space.company_name})` : '');
  const unitInfo = [space.unit_year, space.unit_make, space.unit_model].filter(Boolean).join(' ') || '—';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateStorage(space.billing_id, {
        space_type: form.space_type,
        monthly_rate: parseFloat(form.monthly_rate),
        billing_start_date: form.billing_start_date || undefined,
        notes: form.notes,
        square_sub_id: form.square_sub_id || null,
        square_customer_id: form.square_customer_id || null,
        due_day: parseInt(form.due_day),
      });
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEndStorage = async () => {
    const endDate = form.end_date || new Date().toISOString().split('T')[0];
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
          <InfoField label="Unit" value={unitInfo} />
          {space.license_plate && <InfoField label="License Plate" value={space.license_plate} />}
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

            {/* End date */}
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <label style={{ ...labelStyle, color: '#dc2626' }}>Move-out / End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={inputStyleFull} />
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>Set a date and click "End Storage" to close this assignment</div>
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
function BillingConfirmModal({ preview, running, onClose, onConfirm, formatCurrency }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

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
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem' }} />
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
          <button onClick={() => onConfirm(month)} disabled={running} style={btnPrimary}>
            {running ? 'Recording...' : `Record Billing for ${month}`}
          </button>
          <button onClick={onClose} disabled={running} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddSpaceModal({ onClose, onCreated }) {
  const [spaceNumber, setSpaceNumber] = useState('');
  const [spaceType, setSpaceType] = useState('outdoor');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spaceNumber.trim()) { setError('Space number is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.createStorageSpace({ space_number: spaceNumber.trim(), space_type: spaceType, notes: notes || null });
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
        <form onSubmit={handleSubmit}>
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
