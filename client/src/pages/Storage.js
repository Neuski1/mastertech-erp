import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import NewCustomerModal from '../components/NewCustomerModal';
import { formatPhone, handlePhoneInput } from '../utils/formatPhone';

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

  // Waitlist state
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'waitlist'
  const [waitlist, setWaitlist] = useState([]);
  const [waitlistCounts, setWaitlistCounts] = useState({ indoor: 0, outdoor: 0 });
  const [waitlistLoading, setWaitlistLoading] = useState(false);
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
          {activeTab === 'spaces' && canSeeFinancials && (
            <button onClick={() => { setShowReport(!showReport); if (!showReport) fetchReport(); }} style={btnSecondary}>
              {showReport ? 'Hide Report' : 'Billing Report'}
            </button>
          )}
          {activeTab === 'spaces' && isAdmin && (
            <button onClick={() => setShowAddSpace(true)} style={btnSecondary}>+ Add Space</button>
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
                    const prevType = idx > 0 ? waitlist[idx - 1].space_type : null;
                    const showDivider = waitlistFilter === 'all' && prevType && prevType !== entry.space_type;
                    return (
                      <React.Fragment key={entry.id}>
                      {showDivider && (
                        <tr><td colSpan={11} style={{ padding: 0 }}>
                          <hr style={{ border: 'none', borderTop: '3px solid #1e3a5f', margin: '8px 0' }} />
                        </td></tr>
                      )}
                      <tr style={{ cursor: 'pointer' }} onClick={() => setShowWaitlistDetail(entry)}>
                        <td style={tdStyle}>{idx + 1}</td>
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
                            {entry.status === 'waiting' && (
                              <button onClick={async () => {
                                try {
                                  const res = await api.notifyWaitlistEntry(entry.id);
                                  const msgs = [];
                                  if (res.results?.email === 'sent') msgs.push('Email sent');
                                  if (res.results?.sms === 'sent') msgs.push('SMS sent');
                                  setActionMsg(msgs.length ? msgs.join(' + ') : 'Notified (no contact method available)');
                                  fetchWaitlist();
                                } catch (err) { setError(err.message); }
                              }} style={{ ...btnTinyGray, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>
                                Notify
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

      {/* Waitlist Edit Modal */}
      {showWaitlistDetail && (
        <EditWaitlistModal
          entry={showWaitlistDetail}
          onClose={() => setShowWaitlistDetail(null)}
          onSaved={() => { setShowWaitlistDetail(null); setActionMsg('Waitlist entry updated'); fetchWaitlist(); }}
        />
      )}

      {/* Add to Waitlist Modal */}
      {showAddWaitlist && (
        <AddWaitlistModal
          onClose={() => setShowAddWaitlist(false)}
          onAdded={() => { setShowAddWaitlist(false); setActionMsg('Added to waitlist'); fetchWaitlist(); }}
        />
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
  const linearFt = space.space_linear_feet || space.unit_linear_feet;

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
      {linearFt && (
        <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '2px' }}>{parseFloat(linearFt)} ft</div>
      )}
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
  const [sendContract, setSendContract] = useState(true);
  const [sendGuidelines, setSendGuidelines] = useState(false);
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
      const result = await api.assignStorage({
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
      // Fire contract email and/or guidelines in background
      const billingId = result?.id;
      if (billingId) {
        if (sendContract) api.emailStorageContract(billingId).catch(err => console.error('Contract email error:', err));
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
              Email Storage Contract (with digital accept link)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
              <input type="checkbox" checked={sendGuidelines} onChange={(e) => setSendGuidelines(e.target.checked)} />
              Email Storage Guidelines
            </label>
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
    unit_id: space.unit_id ? String(space.unit_id) : '',
    linear_feet: space.unit_linear_feet ? String(parseFloat(space.unit_linear_feet)) : '',
    end_date: '',
  });
  const [initialLinearFeet] = useState(space.unit_linear_feet ? String(parseFloat(space.unit_linear_feet)) : '');
  const [customerUnits, setCustomerUnits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contractMsg, setContractMsg] = useState('');

  // Load customer's units for the dropdown
  useEffect(() => {
    if (space.customer_id) {
      api.getCustomerUnits(space.customer_id).then(setCustomerUnits).catch(() => {});
    }
  }, [space.customer_id]);

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

        {/* Contract & Guidelines */}
        {canEdit && (
          <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contract & Guidelines</div>
            {contractMsg && <div style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '8px', fontWeight: 600 }}>{contractMsg}</div>}
            {space.contract_accepted_at && (
              <div style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#f0fdf4', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                Contract accepted on {new Date(space.contract_accepted_at).toLocaleString()}
              </div>
            )}
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
              <button onClick={async () => {
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

function EditWaitlistModal({ entry, onClose, onSaved }) {
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

  const startContractSetup = async () => {
    setErr('');
    if (!form.contact_name) { setErr('Contact name is required'); return; }
    if (!form.space_type) { setErr('Storage type is required'); return; }
    try {
      const data = await api.getStorageSpaces();
      const spaces = (data.spaces || data || []).filter(s =>
        s.space_type === form.space_type && s.status === 'available'
      );
      setAvailableSpaces(spaces);
      if (spaces.length === 1) setSelectedSpaceId(String(spaces[0].id));
      setContractMode(true);
    } catch (e) { setErr('Failed to load spaces: ' + e.message); }
  };

  const handleSetupContract = async () => {
    if (!selectedSpaceId) { setErr('Please select a space'); return; }
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

      // 2. Create unit from RV details
      let unitId = null;
      if (form.rv_year || form.rv_make || form.rv_model) {
        const newUnit = await api.createUnit({
          customer_id: customerId,
          year: form.rv_year || null,
          make: form.rv_make || null,
          model: form.rv_model || null,
          linear_feet: form.rv_length_feet ? parseFloat(form.rv_length_feet) : null,
        });
        unitId = newUnit.id;
      }

      // 3. Calculate monthly rate
      const ft = parseFloat(form.rv_length_feet) || 0;
      const perFoot = form.space_type === 'indoor' ? 22 : 6;
      const monthlyRate = ft > 0 ? ft * perFoot : 0;

      // 4. Assign space (creates billing record)
      const result = await api.assignStorage({
        space_id: parseInt(selectedSpaceId),
        customer_id: customerId,
        unit_id: unitId,
        monthly_rate: monthlyRate,
        due_day: 1,
        billing_start_date: contractStartDate || null,
        notes: form.notes || null,
      });

      // 5. Email contract & guidelines
      const billingId = result?.id;
      if (billingId) {
        if (sendContract) api.emailStorageContract(billingId).catch(e => console.error('Contract email error:', e));
        if (sendGuidelines) api.sendStorageGuidelines({ billing_id: billingId }).catch(e => console.error('Guidelines email error:', e));
      }

      // 6. Update waitlist entry to "assigned"
      await api.updateWaitlistEntry(entry.id, { ...form, status: 'assigned', customer_id: customerId });

      setContractSuccess(`Customer created, assigned to Space, and contract ${sendContract ? 'emailed' : 'ready'}!`);
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
      const calcRate = ft && form.space_type ? ft * (form.space_type === 'indoor' ? 22 : 6) : null;
      await api.updateWaitlistEntry(entry.id, {
        ...form,
        rv_length_feet: form.rv_length_feet ? parseFloat(form.rv_length_feet) : null,
        budget_monthly: calcRate,
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
        <form onSubmit={handleSave}>
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
              <input type="number" value={form.rv_length_feet} onChange={(e) => up('rv_length_feet', e.target.value)}
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
              <input type="text" readOnly
                value={(() => {
                  const ft = parseFloat(form.rv_length_feet);
                  if (!ft || !form.space_type) return '';
                  const rate = form.space_type === 'indoor' ? 22 : 6;
                  return `$${(ft * rate).toFixed(2)}`;
                })()}
                placeholder="Enter linear feet & type above"
                style={{ ...inputStyleFull, backgroundColor: '#f0fdf4', fontWeight: 600 }} />
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={(e) => up('status', e.target.value)} style={inputStyleFull}>
              <option value="waiting">Waiting</option>
              <option value="notified">Notified</option>
              <option value="assigned">Assigned</option>
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
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
                      <input type="checkbox" checked={sendContract} onChange={(e) => setSendContract(e.target.checked)} /> Email contract to customer
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', marginTop: '6px' }}>
                      <input type="checkbox" checked={sendGuidelines} onChange={(e) => setSendGuidelines(e.target.checked)} /> Email storage guidelines
                    </label>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem', color: '#065f46' }}>
                    <strong>Summary:</strong> {form.contact_name} → {form.space_type} storage
                    {form.rv_length_feet && ` • ${form.rv_length_feet} ft • $${(parseFloat(form.rv_length_feet) * (form.space_type === 'indoor' ? 22 : 6)).toFixed(2)}/mo`}
                    {!entry.customer_id && ' • New customer record will be created'}
                  </div>
                  <button type="button" onClick={handleSetupContract} disabled={contractSaving || !selectedSpaceId}
                    style={{ ...btnPrimary, width: '100%', padding: '12px', backgroundColor: '#065f46', opacity: (!selectedSpaceId || contractSaving) ? 0.5 : 1 }}>
                    {contractSaving ? 'Setting up...' : 'Assign Space & Send Contract'}
                  </button>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Added {new Date(entry.created_at).toLocaleDateString()}
                {entry.notified_at && ` · Notified ${new Date(entry.notified_at).toLocaleDateString()}`}
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

function AddWaitlistModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    contact_name: '', contact_phone: '', contact_email: '',
    space_type: 'indoor', rv_year: '', rv_make: '', rv_model: '',
    rv_length_feet: '', preferred_start: '', budget_monthly: '', notes: '',
  });
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
      const calcRate = ft && form.space_type ? ft * (form.space_type === 'indoor' ? 22 : 6) : null;
      await api.addToWaitlist({
        ...form,
        customer_id: selectedCust?.id || null,
        rv_length_feet: form.rv_length_feet ? parseFloat(form.rv_length_feet) : null,
        budget_monthly: calcRate,
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
        <form onSubmit={handleSubmit}>
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
              <input type="number" value={form.rv_length_feet} onChange={(e) => up('rv_length_feet', e.target.value)}
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
              <input type="text" readOnly
                value={(() => {
                  const ft = parseFloat(form.rv_length_feet);
                  if (!ft || !form.space_type) return '';
                  const rate = form.space_type === 'indoor' ? 22 : 6;
                  return `$${(ft * rate).toFixed(2)}`;
                })()}
                placeholder="Enter linear feet & type above"
                style={{ ...inputStyleFull, backgroundColor: '#f0fdf4', fontWeight: 600 }} />
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
