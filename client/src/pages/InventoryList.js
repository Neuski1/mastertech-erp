import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const VENDORS = [
  'Amazon', 'NTP', 'Torklift', 'Interstate', 'Lippert', 'Renogy',
  'Iron', 'Woodstream', 'Adfas', 'TMC', 'Home Depot', 'Airstream', 'Other',
];

const LOCATIONS = ['Front Closet', 'Back Room', 'Shop', 'unassigned'];

const CATEGORIES = [
  { label: 'Airstream', value: 'AIRSTREAM', prefix: 'AS' },
  { label: 'Awning', value: 'AWNING', prefix: 'AWN' },
  { label: 'Battery', value: 'BATTERY', prefix: 'BAT' },
  { label: 'Doors/Windows', value: 'DOORS/WINDOWS', prefix: 'DOOR' },
  { label: 'Electrical', value: 'ELECTRICAL', prefix: 'ELEC' },
  { label: 'Hardware', value: 'HARDWARE', prefix: 'HDWR' },
  { label: 'HVAC', value: 'HVAC', prefix: 'HVAC' },
  { label: 'Misc/Shop Supplies', value: 'MISC/SHOP SUPPLIES', prefix: 'MISC' },
  { label: 'Plumbing', value: 'PLUMBING', prefix: 'PLMB' },
  { label: 'Roofing', value: 'ROOFING', prefix: 'ROOF' },
  { label: 'Solar', value: 'SOLAR', prefix: 'SOLR' },
  { label: 'Suspension', value: 'SUSPENSION', prefix: 'SUSP' },
  { label: 'Towing/Chassis', value: 'TOWING/CHASSIS', prefix: 'TOW' },
];

const CATEGORY_LABELS = {};
CATEGORIES.forEach(c => { CATEGORY_LABELS[c.value] = c.label; });

export default function InventoryList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reorderCount, setReorderCount] = useState(0);
  const [sortField, setSortField] = useState('qty_on_hand');
  const [sortDirection, setSortDirection] = useState('desc');
  const [reportsOpen, setReportsOpen] = useState(false);
  const reportsRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Close reports dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reportsRef.current && !reportsRef.current.contains(e.target)) {
        setReportsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLowStockReport = async () => {
    setReportsOpen(false);
    let data;
    try {
      data = await api.getLowStockReport();
    } catch (err) {
      alert('Failed to load low stock report: ' + err.message);
      return;
    }

    const reportItems = data.items;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let totalNeedToOrder = 0;
    const rows = reportItems.map((item, i) => {
      const qty = parseFloat(item.qty_on_hand) || 0;
      const reorder = parseFloat(item.reorder_level) || 0;
      const need = Math.max(0, reorder - qty);
      totalNeedToOrder += need;
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f3f4f6'}">
        <td style="padding:4px 8px;border:1px solid #d1d5db;font-family:monospace;font-size:9px">${item.part_number || '—'}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;font-size:9px">${item.description || ''}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;font-size:9px">${CATEGORY_LABELS[item.category] || item.category || '—'}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;font-size:9px">${item.vendor || '—'}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;text-align:right;font-size:9px;font-weight:700;color:#dc2626">${qty}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;text-align:right;font-size:9px">${reorder}</td>
        <td style="padding:4px 8px;border:1px solid #d1d5db;text-align:right;font-size:9px;font-weight:700;color:#1e3a5f">${need}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>Low Stock Inventory Report</title>
<style>
  @media print {
    @page { size: landscape; margin: 0.5in; }
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .no-print { display: none !important; }
  }
  body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .header-left img { height: 60px; }
  .header-left h1 { font-size: 18px; color: #1e3a5f; margin: 0; }
  .header-right { text-align: right; font-size: 11px; color: #6b7280; }
  hr { border: none; border-top: 2px solid #1e3a5f; margin: 12px 0 16px; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th { background: #1e3a5f; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px;
       text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid #1e3a5f; }
  .summary { margin-top: 20px; padding: 12px 16px; background: #f0f4f8; border-radius: 6px;
             display: flex; gap: 40px; font-size: 12px; }
  .summary strong { color: #1e3a5f; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 20px;
            font-size: 8px; color: #9ca3af; display: flex; justify-content: space-between; }
  @media print {
    .footer { position: running(footer); }
    @page { @bottom-center { content: element(footer); } }
  }
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="/master-rvtech-logo-dark.jpg" alt="Master Tech RV" onerror="this.style.display='none'" />
    <h1>Low Stock Inventory Report</h1>
  </div>
  <div class="header-right">Generated: ${dateStr}</div>
</div>
<hr />
<table>
  <thead><tr>
    <th>Part #</th><th>Description</th><th>Category</th><th>Vendor</th>
    <th style="text-align:right">On Hand</th><th style="text-align:right">Reorder Level</th>
    <th style="text-align:right">Need to Order</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="summary">
  <div><strong>Total Items Low on Stock:</strong> ${reportItems.length}</div>
  <div><strong>Total Units Needed to Order:</strong> ${totalNeedToOrder}</div>
</div>
<div class="footer">
  <span>Master Tech RV Repair & Storage — Confidential</span>
</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const handleInStockReport = async () => {
    setReportsOpen(false);
    let data;
    try {
      data = await api.getInStockReport();
    } catch (err) {
      alert('Failed to load in-stock report: ' + err.message);
      return;
    }

    const reportItems = data.items;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const userName = user?.name || user?.email || 'Unknown';

    // Group by category
    const groups = {};
    reportItems.forEach(item => {
      const cat = item.category || 'UNCATEGORIZED';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    const categoryKeys = Object.keys(groups).sort();

    let rows = '';
    categoryKeys.forEach(cat => {
      const catItems = groups[cat];
      const catLabel = CATEGORY_LABELS[cat] || cat;
      rows += `<tr><td colspan="7" style="padding:8px 10px;background:#e8eef5;font-weight:700;font-size:10px;color:#1e3a5f;border:1px solid #d1d5db;">
        \u258C ${catLabel} (${catItems.length} item${catItems.length !== 1 ? 's' : ''})
      </td></tr>`;
      catItems.forEach((item, i) => {
        const qty = parseFloat(item.qty_on_hand) || 0;
        rows += `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
          <td style="padding:5px 8px;border:1px solid #d1d5db;font-family:monospace;font-size:9px">${item.part_number || '—'}</td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;font-size:9px">${item.description || ''}</td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;font-size:9px">${catLabel}</td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;font-size:9px">${item.location || '—'}</td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;text-align:right;font-size:9px;font-weight:600">${qty}</td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;min-width:80px;background:#fafafa"></td>
          <td style="padding:5px 8px;border:1px solid #d1d5db;min-width:100px;background:#fafafa"></td>
        </tr>`;
      });
    });

    const html = `<!DOCTYPE html><html><head><title>Parts In Stock — Physical Count Sheet</title>
<style>
  @media print {
    @page { size: portrait; margin: 0.4in; }
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
  body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 16px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .header-left img { height: 50px; }
  .header-left h1 { font-size: 16px; color: #1e3a5f; margin: 0; }
  .header-right { text-align: right; font-size: 11px; color: #6b7280; }
  hr { border: none; border-top: 2px solid #1e3a5f; margin: 10px 0 12px; }
  .instructions { font-style: italic; font-size: 10px; color: #6b7280; margin-bottom: 10px; }
  .summary-box { display: flex; gap: 32px; padding: 8px 14px; background: #f0f4f8;
                  border-radius: 6px; font-size: 10px; margin-bottom: 14px; }
  .summary-box strong { color: #1e3a5f; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th { background: #1e3a5f; color: #fff; padding: 5px 8px; text-align: left; font-size: 8px;
       text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid #1e3a5f; }
  .footer { margin-top: 16px; font-size: 8px; color: #9ca3af; text-align: center; }
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="/master-rvtech-logo-dark.jpg" alt="Master Tech RV" onerror="this.style.display='none'" />
    <h1>Parts In Stock — Physical Count Sheet</h1>
  </div>
  <div class="header-right">Generated: ${dateStr}</div>
</div>
<hr />
<div class="instructions">
  Use this sheet to verify physical inventory. Check each item and note any discrepancies in the Count column.
</div>
<div class="summary-box">
  <div><strong>Total Categories:</strong> ${categoryKeys.length}</div>
  <div><strong>Total Part Numbers In Stock:</strong> ${reportItems.length}</div>
  <div><strong>Generated By:</strong> ${userName}</div>
  <div><strong>Date:</strong> ${dateStr}</div>
</div>
<table>
  <thead><tr>
    <th>Part #</th><th>Description</th><th>Category</th><th>Location</th>
    <th style="text-align:right">System Qty</th>
    <th style="text-align:center">Physical Count</th>
    <th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">Master Tech RV Repair & Storage — Confidential</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50, sort: sortField, order: sortDirection };
      if (search) params.search = search;
      if (vendor) params.vendor = vendor;
      if (category) params.category = category;
      if (location) params.location = location;
      if (lowStockOnly) params.low_stock = 'true';
      const data = await api.getInventory(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [search, vendor, category, location, lowStockOnly, page, sortField, sortDirection]);

  const fetchReorderCount = useCallback(async () => {
    try {
      const data = await api.getReorderAlerts();
      setReorderCount(data.count);
    } catch (err) {
      console.error('Failed to load reorder alerts:', err);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchReorderCount(); }, [fetchReorderCount]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  // No client-side sort needed — API returns pre-sorted results

  const sortArrow = (field) => {
    if (sortField !== field) return ' \u2195';
    return sortDirection === 'asc' ? ' \u2191' : ' \u2193';
  };

  const handlePrintInventory = async () => {
    // Fetch ALL items matching current filters (not just current page)
    const params = { page: 1, limit: 99999 };
    if (search) params.search = search;
    if (vendor) params.vendor = vendor;
    if (category) params.category = category;
    if (location) params.location = location;
    if (lowStockOnly) params.low_stock = 'true';

    let allItems;
    let grandTotal;
    try {
      const data = await api.getInventory(params);
      allItems = data.items;
      // Get unfiltered total for "X of Y" display
      const unfilteredData = await api.getInventory({ page: 1, limit: 1 });
      grandTotal = unfilteredData.total;
    } catch (err) {
      alert('Failed to load inventory for printing: ' + err.message);
      return;
    }

    // Sort using current sort settings
    const printItems = [...allItems].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (['qty_on_hand', 'cost_each', 'sale_price_each'].includes(sortField)) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    const now = new Date();
    const datePrinted = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const activeFilters = [];
    if (search) activeFilters.push(`Search: "${search}"`);
    if (vendor) activeFilters.push(`Vendor: ${vendor}`);
    if (category) activeFilters.push(`Category: ${CATEGORY_LABELS[category] || category}`);
    if (location) activeFilters.push(`Location: ${location}`);
    if (lowStockOnly) activeFilters.push('Low Stock Only');

    const hasFilters = activeFilters.length > 0;
    const reportTitle = hasFilters
      ? `Filtered Inventory Report — ${activeFilters.join(', ')} (${printItems.length} of ${grandTotal} total items)`
      : `Complete Inventory Report — All Items (${printItems.length} total)`;

    const fmtCur = (v) => {
      const n = parseFloat(v) || 0;
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    let totalInvValue = 0;
    let totalRetailValue = 0;
    const rows = printItems.map((item, i) => {
      const qty = parseFloat(item.qty_on_hand) || 0;
      const cost = parseFloat(item.cost_each) || 0;
      const sale = parseFloat(item.sale_price_each) || 0;
      totalInvValue += qty * cost;
      totalRetailValue += qty * sale;
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:3px 6px;border:1px solid #ddd;font-family:monospace;font-size:8px">${item.part_number || '—'}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;font-size:8px">${item.description || ''}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;font-size:8px">${item.vendor_part_number || '—'}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;font-size:8px">${item.vendor || '—'}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;font-size:8px">${CATEGORY_LABELS[item.category] || item.category || '—'}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;text-align:right;font-size:8px;font-weight:600">${qty}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;text-align:right;font-size:8px">${item.reorder_level != null ? parseFloat(item.reorder_level) : '—'}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;text-align:right;font-size:8px">${fmtCur(cost)}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;text-align:right;font-size:8px">${fmtCur(sale)}</td>
        <td style="padding:3px 6px;border:1px solid #ddd;font-size:8px">${item.location || '—'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>Inventory List</title>
<style>
  @media print { @page { size: landscape; margin: 0.4in; } }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #333; margin: 0; padding: 16px; }
  h1 { font-size: 14px; color: #1e3a5f; margin: 0 0 4px; }
  .report-title { font-size: 11px; font-weight: 600; color: #374151; margin: 4px 0 2px; }
  .meta { font-size: 9px; color: #666; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e3a5f; color: #fff; padding: 4px 6px; text-align: left; font-size: 8px; text-transform: uppercase; border: 1px solid #1e3a5f; }
  .summary { margin-top: 12px; font-size: 10px; display: flex; gap: 24px; }
  .summary strong { color: #1e3a5f; }
</style></head><body>
<h1>MASTER TECH RV REPAIR &amp; STORAGE — INVENTORY LIST</h1>
<div class="report-title">${reportTitle}</div>
<div class="meta">Printed: ${datePrinted}</div>
<table>
  <thead><tr>
    <th>Part #</th><th>Description</th><th>Vendor Part #</th><th>Vendor</th><th>Category</th>
    <th style="text-align:right">Qty</th><th style="text-align:right">Reorder</th>
    <th style="text-align:right">Cost</th><th style="text-align:right">Sale Price</th><th>Location</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="summary">
  <div><strong>Total Items:</strong> ${printItems.length}</div>
  <div><strong>Total Inventory Value:</strong> ${fmtCur(totalInvValue)}</div>
  <div><strong>Total Retail Value:</strong> ${fmtCur(totalRetailValue)}</div>
</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return parseFloat(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0 }}>Inventory</h1>
          {reorderCount > 0 && (
            <button
              onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
              style={{
                ...alertBadge,
                backgroundColor: lowStockOnly ? '#dc2626' : '#fef2f2',
                color: lowStockOnly ? '#fff' : '#dc2626',
              }}
            >
              {reorderCount} Low Stock
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div ref={reportsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              style={{
                ...btnSecondary,
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: reportsOpen ? '#e5e7eb' : '#f3f4f6',
              }}
            >
              Reports {reportsOpen ? '\u25B2' : '\u25BC'}
            </button>
            {reportsOpen && (
              <div style={dropdownStyle}>
                <button onClick={handleLowStockReport} style={dropdownItemStyle}>
                  Low Stock Report
                </button>
                <button onClick={handleInStockReport} style={dropdownItemStyle}>
                  Parts In Stock Report
                </button>
                <div style={dropdownDivider} />
                <span style={dropdownComingSoon}>Full Inventory Report — Coming Soon</span>
                <span style={dropdownComingSoon}>Inventory by Category — Coming Soon</span>
                <span style={dropdownComingSoon}>Zero Stock Report — Coming Soon</span>
                <span style={dropdownComingSoon}>Inventory Valuation Report — Coming Soon</span>
              </div>
            )}
          </div>
          <button onClick={handlePrintInventory} style={btnSecondary}>Print Inventory</button>
          <button onClick={() => navigate('/inventory/new')} style={btnPrimary}>+ New Part</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by part # or description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select
          value={vendor}
          onChange={(e) => { setVendor(e.target.value); setPage(1); }}
          style={inputStyle}
        >
          <option value="">All Vendors</option>
          {VENDORS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={inputStyle}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          style={inputStyle}
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {/* Top Pagination */}
      {total > 50 && (
        <div style={paginationStyle}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnSecondary}>Previous</button>
          <span style={{ padding: '8px', color: '#666', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 50)} ({total} items)</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} style={btnSecondary}>Next</button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thSortable} onClick={() => handleSort('part_number')}>Part #{sortArrow('part_number')}</th>
              <th style={thSortable} onClick={() => handleSort('description')}>Description{sortArrow('description')}</th>
              <th style={thSortable} onClick={() => handleSort('vendor_part_number')}>Vendor Part #{sortArrow('vendor_part_number')}</th>
              <th style={thSortable} onClick={() => handleSort('vendor')}>Vendor{sortArrow('vendor')}</th>
              <th style={thSortable} onClick={() => handleSort('category')}>Category{sortArrow('category')}</th>
              <th style={thSortable} onClick={() => handleSort('location')}>Location{sortArrow('location')}</th>
              <th style={{ ...thSortable, textAlign: 'right' }} onClick={() => handleSort('qty_on_hand')}>Qty{sortArrow('qty_on_hand')}</th>
              <th style={{ ...thSortable, textAlign: 'right' }} onClick={() => handleSort('cost_each')}>Cost{sortArrow('cost_each')}</th>
              <th style={{ ...thSortable, textAlign: 'right' }} onClick={() => handleSort('sale_price_each')}>Sale Price{sortArrow('sale_price_each')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No inventory items found</td></tr>
            ) : items.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/inventory/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {item.part_number || '—'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <strong>{item.description}</strong>
                </td>
                <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.vendor_part_number || '—'}</span></td>
                <td style={tdStyle}>{item.vendor || '—'}</td>
                <td style={tdStyle}>{CATEGORY_LABELS[item.category] || item.category || '—'}</td>
                <td style={tdStyle}>{item.location || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <span style={{
                    fontWeight: 600,
                    color: item.low_stock ? '#dc2626' : '#111827',
                    backgroundColor: item.low_stock ? '#fef2f2' : 'transparent',
                    padding: item.low_stock ? '2px 8px' : '0',
                    borderRadius: '4px',
                  }}>
                    {parseFloat(item.qty_on_hand)}
                  </span>
                  {item.reorder_level !== null && (
                    <span style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '4px' }}>
                      / {parseFloat(item.reorder_level)}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.cost_each)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.sale_price_each)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      {total > 50 && (
        <div style={paginationStyle}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnSecondary}>Previous</button>
          <span style={{ padding: '8px', color: '#666', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 50)} ({total} items)</span>
          <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} style={btnSecondary}>Next</button>
        </div>
      )}
      {total <= 50 && (
        <div style={{ marginTop: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
          {total} item{total !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}

// Styles
const inputStyle = {
  padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.875rem', outline: 'none',
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const paginationStyle = {
  display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center',
  margin: '12px 0',
};
const alertBadge = {
  padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem',
  fontWeight: 600, border: 'none', cursor: 'pointer',
};
const tableStyle = {
  width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff',
  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};
const thStyle = {
  textAlign: 'left', padding: '12px 16px', backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.75rem', fontWeight: 600,
  textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em',
};
const thSortable = {
  ...thStyle, cursor: 'pointer', userSelect: 'none',
};
const tdStyle = {
  padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem',
};
const dropdownStyle = {
  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
  backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, minWidth: '260px',
  padding: '6px 0',
};
const dropdownItemStyle = {
  display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px',
  border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem',
  color: '#1e3a5f', fontWeight: 500,
};
const dropdownDivider = {
  borderTop: '1px solid #e5e7eb', margin: '4px 0',
};
const dropdownComingSoon = {
  display: 'block', padding: '6px 16px', fontSize: '0.8rem',
  color: '#9ca3af', fontStyle: 'italic',
};
