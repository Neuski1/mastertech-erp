import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import NewCustomerModal from '../components/NewCustomerModal';
import { formatPhone } from '../utils/formatPhone';
import useIsMobile from '../utils/useIsMobile';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function CustomerList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const initialSearch = location.state?.searchTerm || '';
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    if (location.state?.searchTerm) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);
  const [showMarketing, setShowMarketing] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // Filters
  const [isStorage, setIsStorage] = useState('');
  const [hasOpenRecords, setHasOpenRecords] = useState(false);
  const [hasOpenEstimate, setHasOpenEstimate] = useState(false);
  const [lastServiceFrom, setLastServiceFrom] = useState('');
  const [lastServiceTo, setLastServiceTo] = useState('');
  const [unitMake, setUnitMake] = useState('');
  const [unitModel, setUnitModel] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignChannel, setCampaignChannel] = useState('Email');
  const [campaignNotes, setCampaignNotes] = useState('');
  const [campaignSaving, setCampaignSaving] = useState(false);

  const debouncedSetSearch = useMemo(() => debounce((val) => {
    setSearchTerm(val);
    setPage(1);
  }, 300), []);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (isStorage) params.is_storage = isStorage;
      if (hasOpenRecords) params.has_open_records = 'true';
      if (hasOpenEstimate) params.has_open_estimate = 'true';
      if (lastServiceFrom) params.last_service_from = lastServiceFrom;
      if (lastServiceTo) params.last_service_to = lastServiceTo;
      if (unitMake) params.unit_make = unitMake;
      if (unitModel) params.unit_model = unitModel;
      if (city) params.city = city;
      if (zip) params.zip = zip;
      const data = await api.getCustomers(params);
      setCustomers(data.customers);
      setTotal(data.total || data.customers.length);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, isStorage, hasOpenRecords, hasOpenEstimate, lastServiceFrom, lastServiceTo, unitMake, unitModel, city, zip]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleExportCSV = async () => {
    try {
      const params = { page: 1, limit: 10000 };
      if (searchTerm) params.search = searchTerm;
      if (isStorage) params.is_storage = isStorage;
      if (hasOpenRecords) params.has_open_records = 'true';
      if (hasOpenEstimate) params.has_open_estimate = 'true';
      if (lastServiceFrom) params.last_service_from = lastServiceFrom;
      if (lastServiceTo) params.last_service_to = lastServiceTo;
      if (unitMake) params.unit_make = unitMake;
      if (unitModel) params.unit_model = unitModel;
      if (city) params.city = city;
      if (zip) params.zip = zip;
      const data = await api.getCustomers(params);
      const rows = (data.customers || []).filter(c => c.email_primary);
      if (rows.length === 0) { alert('No customers with email in current filter'); return; }
      const csv = 'Name,Email\n' + rows.map(c =>
        `"${(c.last_name || '') + (c.first_name ? ', ' + c.first_name : '')}","${c.email_primary}"`
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer_emails_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert(err.message); }
  };

  const handleLogCampaign = async () => {
    if (!campaignName.trim()) return;
    setCampaignSaving(true);
    try {
      const params = { page: 1, limit: 10000 };
      if (searchTerm) params.search = searchTerm;
      if (isStorage) params.is_storage = isStorage;
      if (hasOpenRecords) params.has_open_records = 'true';
      if (hasOpenEstimate) params.has_open_estimate = 'true';
      if (lastServiceFrom) params.last_service_from = lastServiceFrom;
      if (lastServiceTo) params.last_service_to = lastServiceTo;
      if (unitMake) params.unit_make = unitMake;
      if (unitModel) params.unit_model = unitModel;
      if (city) params.city = city;
      if (zip) params.zip = zip;
      const data = await api.getCustomers(params);
      const ids = (data.customers || []).map(c => c.id);
      await api.logCampaign({
        customer_ids: ids,
        campaign_name: campaignName,
        channel: campaignChannel,
        notes: campaignNotes,
      });
      alert(`Campaign logged for ${ids.length} customers`);
      setShowCampaignModal(false);
      setCampaignName('');
      setCampaignNotes('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCampaignSaving(false);
    }
  };

  const totalPages = Math.ceil(total / 50);
  const hasAnyFilter = isStorage || hasOpenRecords || hasOpenEstimate || lastServiceFrom || lastServiceTo || unitMake || unitModel || city || zip;

  return (
    <div>
      <div className={isMobile ? 'page-header' : ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Customers</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {searchTerm ? `${customers.length} of ${total}` : `${total} total`}
          </span>
          {!isMobile && <button onClick={() => setShowNewCustomer(true)} style={btnPrimary}>+ New Customer</button>}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '12px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchInput}
            onChange={handleSearchChange}
            style={{ ...inputStyle, paddingRight: searchInput ? '32px' : '10px' }}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#9ca3af', padding: '2px 6px', lineHeight: 1 }}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={isStorage} onChange={(e) => setIsStorage(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: isMobile ? 'auto' : '160px', flex: isMobile ? 1 : undefined }}>
            <option value="">All Customers</option>
            <option value="true">Storage Customers</option>
            <option value="false">Non-Storage</option>
          </select>
          <button onClick={() => setShowMarketing(!showMarketing)} style={{ ...btnSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {showMarketing ? 'Hide Filters' : 'Marketing Filters'}
          </button>
        </div>
      </div>

      {/* Marketing Filter Panel */}
      {showMarketing && (
        <div style={{ padding: '16px', marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#0369a1' }}>Marketing Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={filterLabel}>Last Service After</label>
              <input type="date" value={lastServiceFrom} onChange={(e) => setLastServiceFrom(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabel}>Last Service Before</label>
              <input type="date" value={lastServiceTo} onChange={(e) => setLastServiceTo(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabel}>Unit Make</label>
              <input type="text" placeholder="e.g. Airstream" value={unitMake} onChange={(e) => setUnitMake(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabel}>Unit Model</label>
              <input type="text" placeholder="e.g. Classic" value={unitModel} onChange={(e) => setUnitModel(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabel}>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={filterLabel}>ZIP Code</label>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={hasOpenRecords} onChange={(e) => setHasOpenRecords(e.target.checked)} />
                Has Open Records
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={hasOpenEstimate} onChange={(e) => setHasOpenEstimate(e.target.checked)} />
                Has Open Estimate
              </label>
            </div>
          </div>
          {hasAnyFilter && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>{total} matches</span>
              <button onClick={handleExportCSV} style={{ ...btnPrimary, fontSize: '0.8rem', padding: '6px 12px' }}>Export Email List</button>
              <button onClick={() => setShowCampaignModal(true)} style={{ ...btnSecondary, fontSize: '0.8rem', padding: '6px 12px' }}>Log Campaign</button>
            </div>
          )}
        </div>
      )}

      {/* Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No customers found</div>
      ) : isMobile ? (
        <div>
          {customers.map(c => (
            <div key={c.id} className="mobile-customer-card" onClick={() => navigate(`/customers/${c.id}`, { state: searchTerm ? { searchTerm } : undefined })}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                {c.last_name}{c.first_name ? `, ${c.first_name}` : ''}
              </div>
              {c.company_name && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>{c.company_name}</div>}
              <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '2px' }}>
                {formatPhone(c.phone_primary) || 'No phone'}
              </div>
              {c.email_primary && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>{c.email_primary}</div>}
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#9ca3af' }}>
                <span>{c.unit_count || 0} units</span>
                <span>{c.record_count || 0} records</span>
                {parseInt(c.open_record_count) > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>{c.open_record_count} open</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Account #</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Phone 1</th>
                <th style={thStyle}>Phone 2</th>
                <th style={thStyle}>Email</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Units</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Records</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`, { state: searchTerm ? { searchTerm } : undefined })} style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}>{c.account_number || '—'}</td>
                  <td style={tdStyle}>
                    <strong>{c.last_name}{c.first_name ? `, ${c.first_name}` : ''}</strong>
                    {c.company_name && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.company_name}</div>}
                  </td>
                  <td style={tdStyle}>{formatPhone(c.phone_primary) || '—'}</td>
                  <td style={tdStyle}>{formatPhone(c.phone_secondary) || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '0.8rem' }}>{c.email_primary || '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{c.unit_count || 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {c.record_count || 0}
                    {parseInt(c.open_record_count) > 0 && (
                      <span style={{ marginLeft: '4px', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600 }}>
                        ({c.open_record_count} open)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <button className="mobile-fab" onClick={() => setShowNewCustomer(true)}>+</button>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...btnSecondary, fontSize: '0.8rem', padding: '6px 12px' }}>Prev</button>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Page {page} of {totalPages} ({total} total)</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ ...btnSecondary, fontSize: '0.8rem', padding: '6px 12px' }}>Next</button>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomer && (
        <NewCustomerModal
          onClose={() => setShowNewCustomer(false)}
          onCreated={(customer) => {
            setShowNewCustomer(false);
            navigate(`/customers/${customer.id}`);
          }}
        />
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Log Campaign</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 12px' }}>
              This will log a campaign entry for <strong>{total}</strong> filtered customers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={filterLabel}>Campaign Name *</label>
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} style={inputStyle} placeholder="e.g. Spring Service Special" />
              </div>
              <div>
                <label style={filterLabel}>Channel</label>
                <select value={campaignChannel} onChange={(e) => setCampaignChannel(e.target.value)} style={inputStyle}>
                  <option>Email</option>
                  <option>Postcard</option>
                  <option>Phone</option>
                  <option>SMS</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={filterLabel}>Notes</label>
                <textarea value={campaignNotes} onChange={(e) => setCampaignNotes(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowCampaignModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleLogCampaign} disabled={campaignSaving || !campaignName.trim()} style={btnPrimary}>
                {campaignSaving ? 'Logging...' : 'Log Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
const filterLabel = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' };
const btnPrimary = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle = { textAlign: 'left', padding: '10px 12px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
