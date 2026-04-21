import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Suppliers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suppliers');

  // Suppliers Tab State
  const [vendors, setVendors] = useState([]);
  const [vendorDetails, setVendorDetails] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [deleteModal, setDeleteModal] = useState(null); // { vendor, parts }
  const [deleteReassign, setDeleteReassign] = useState('');
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState(new Set());
  const [mergeInto, setMergeInto] = useState('');
  const [mergeSaving, setMergeSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Misc Supplier State
  const [addMiscModalOpen, setAddMiscModalOpen] = useState(false);
  const [miscForm, setMiscForm] = useState({ vendor_name: '', subcategory: '', website: '', contact_name: '', contact_phone: '', notes: '' });
  const [subcategories, setSubcategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState('');

  // Purchase Orders Tab State
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poTotal, setPoTotal] = useState(0);
  const [loadingPos, setLoadingPos] = useState(false);
  const [poStatusFilter, setPoStatusFilter] = useState('All');
  const [poVendorFilter, setPoVendorFilter] = useState('');
  const [createPoModalOpen, setCreatePoModalOpen] = useState(false);
  const [poDetailModalOpen, setPoDetailModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [newPo, setNewPo] = useState({
    vendor: '',
    order_date: new Date().toISOString().split('T')[0],
    order_number: '',
    tracking_number: '',
    shipping_cost: '',
    notes: '',
    line_items: []
  });
  const [currentLineItem, setCurrentLineItem] = useState({
    description: '',
    vendor_part_number: '',
    qty: '',
    cost_each: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (activeTab === 'purchase_orders') {
      fetchPurchaseOrders();
    }
  }, [activeTab, poStatusFilter, poVendorFilter]);

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const vendorsList = await api.getVendors();
      let vendorDetailsData = [];
      try { vendorDetailsData = await api.getVendorDetails(); } catch(e) {}
      let subcats = [];
      try { subcats = await api.getSupplierSubcategories(); } catch(e) {}
      setVendors(vendorsList || []);
      setVendorDetails(vendorDetailsData || []);
      setSubcategories(subcats || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  const fetchPurchaseOrders = useCallback(async () => {
    setLoadingPos(true);
    try {
      const filters = {};
      if (poStatusFilter !== 'All') filters.status = poStatusFilter.toLowerCase();
      if (poVendorFilter) filters.vendor = poVendorFilter;
      const result = await api.getPurchaseOrders(filters);
      setPurchaseOrders(result.orders || []);
      setPoTotal(result.total || 0);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoadingPos(false);
    }
  }, [poStatusFilter, poVendorFilter]);

  // Merge inventory vendors (from inventory table) with their detail records
  const mergedVendors = vendors.map(vendor => {
    const details = vendorDetails.find(d => d.vendor_name && d.vendor_name.toLowerCase() === vendor.name.toLowerCase());
    return { name: vendor.name, item_count: vendor.item_count || 0, supplier_type: 'inventory', ...details };
  });

  // Misc suppliers: vendor_details rows where supplier_type = 'misc' and NOT already in inventory vendors
  const inventoryNames = new Set(vendors.map(v => v.name.toLowerCase()));
  const miscSuppliers = vendorDetails
    .filter(d => d.supplier_type === 'misc' && !inventoryNames.has((d.vendor_name || '').toLowerCase()))
    .map(d => ({ name: d.vendor_name, item_count: 0, ...d }));

  // Group misc suppliers by subcategory
  const miscBySubcategory = {};
  miscSuppliers.forEach(s => {
    const cat = s.subcategory || 'Uncategorized';
    if (!miscBySubcategory[cat]) miscBySubcategory[cat] = [];
    miscBySubcategory[cat].push(s);
  });
  const sortedSubcats = Object.keys(miscBySubcategory).sort((a, b) => a === 'Uncategorized' ? 1 : b === 'Uncategorized' ? -1 : a.localeCompare(b));

  const totalSuppliers = mergedVendors.length + miscSuppliers.length;
  const totalInventoryValue = mergedVendors.reduce((sum, v) => sum + parseFloat(v.total_value || 0), 0);
  const totalPurchaseOrders = mergedVendors.reduce((sum, v) => sum + parseInt(v.po_count || 0), 0);

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      website: vendor.website || '',
      contact_name: vendor.contact_name || '',
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      account_number: vendor.account_number || '',
      notes: vendor.notes || '',
      supplier_type: vendor.supplier_type || 'inventory',
      subcategory: vendor.subcategory || ''
    });
    setEditModalOpen(true);
  };

  const handleAddMiscSupplier = async () => {
    const name = miscForm.vendor_name.trim();
    if (!name) { alert('Supplier name is required'); return; }
    const subcat = newSubcategory.trim() || miscForm.subcategory;
    try {
      await api.updateVendorDetails(name, {
        ...miscForm,
        supplier_type: 'misc',
        subcategory: subcat || null
      });
      setAddMiscModalOpen(false);
      setMiscForm({ vendor_name: '', subcategory: '', website: '', contact_name: '', contact_phone: '', notes: '' });
      setNewSubcategory('');
      await fetchVendors();
      setActionMsg(`Added misc supplier "${name}"`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteMiscSupplier = async (name) => {
    if (!window.confirm(`Delete misc supplier "${name}"?`)) return;
    try {
      await api.deleteVendorDetails(name);
      await fetchVendors();
      setActionMsg(`"${name}" removed`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSaveVendor = async () => {
    if (!editingVendor) return;
    try {
      const subcat = editFormData._newSubcategory ? editFormData._newSubcategory.trim() : editFormData.subcategory;
      const payload = { ...editFormData, subcategory: subcat || null };
      delete payload._newSubcategory;
      await api.updateVendorDetails(editingVendor.name, payload);
      setEditModalOpen(false);
      await fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const handleDeleteVendor = async (vendor) => {
    try {
      const parts = await api.getVendorParts(vendor.name);
      if (parts.length === 0) {
        if (window.confirm(`Delete supplier "${vendor.name}"? They have no inventory items.`)) {
          await api.deleteVendor(vendor.name);
          setActionMsg(`"${vendor.name}" removed`);
          await fetchVendors();
        }
      } else {
        setDeleteModal({ vendor, parts });
        setDeleteReassign('');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    if (!deleteReassign) { alert('Select a supplier to reassign parts to'); return; }
    setDeleteSaving(true);
    try {
      const updates = deleteModal.parts.map(p => ({ id: p.id, vendor: deleteReassign }));
      await api.bulkUpdateVendor(updates);
      await api.deleteVendor(deleteModal.vendor.name);
      setDeleteModal(null);
      setActionMsg(`"${deleteModal.vendor.name}" deleted. ${updates.length} parts reassigned to "${deleteReassign}".`);
      await fetchVendors();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleMerge = async () => {
    if (mergeSelected.size < 2) { alert('Select at least 2 suppliers to merge'); return; }
    if (!mergeInto) { alert('Choose which supplier name to keep'); return; }
    setMergeSaving(true);
    try {
      await api.mergeVendors(Array.from(mergeSelected), mergeInto);
      setMergeMode(false);
      setMergeSelected(new Set());
      setMergeInto('');
      setActionMsg(`Merged ${mergeSelected.size} suppliers into "${mergeInto}"`);
      await fetchVendors();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setMergeSaving(false);
    }
  };

  const toggleMergeSelect = (name) => {
    const next = new Set(mergeSelected);
    if (next.has(name)) next.delete(name); else next.add(name);
    setMergeSelected(next);
  };

  const addLineItem = () => {
    if (!currentLineItem.description || !currentLineItem.qty || !currentLineItem.cost_each) {
      alert('Please fill in description, quantity, and cost');
      return;
    }
    setNewPo({
      ...newPo,
      line_items: [
        ...newPo.line_items,
        {
          ...currentLineItem,
          qty: parseInt(currentLineItem.qty),
          cost_each: parseFloat(currentLineItem.cost_each),
          line_total: parseInt(currentLineItem.qty) * parseFloat(currentLineItem.cost_each)
        }
      ]
    });
    setCurrentLineItem({ description: '', vendor_part_number: '', qty: '', cost_each: '' });
  };

  const removeLineItem = (index) => {
    setNewPo({ ...newPo, line_items: newPo.line_items.filter((_, i) => i !== index) });
  };

  const handleCreatePo = async () => {
    if (!newPo.vendor || newPo.line_items.length === 0) {
      alert('Please select a supplier and add at least one line item');
      return;
    }
    try {
      await api.createPurchaseOrder({ ...newPo, shipping_cost: newPo.shipping_cost ? parseFloat(newPo.shipping_cost) : 0 });
      setCreatePoModalOpen(false);
      setNewPo({ vendor: '', order_date: new Date().toISOString().split('T')[0], order_number: '', tracking_number: '', shipping_cost: '', notes: '', line_items: [] });
      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error creating PO:', error);
      alert('Error creating purchase order');
    }
  };

  const handleMarkReceived = async (poId) => {
    if (!window.confirm('Mark this purchase order as received? This will update inventory quantities for matched items.')) return;
    try {
      await api.receivePurchaseOrder(poId);
      await fetchPurchaseOrders();
      setPoDetailModalOpen(false);
    } catch (error) {
      console.error('Error marking PO as received:', error);
      alert('Error: ' + (error.message || 'Could not mark as received'));
    }
  };

  const handleViewPoDetail = async (po) => {
    try {
      const full = await api.getPurchaseOrder(po.id);
      setSelectedPo(full);
      setPoDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Styles
  const cardStyle = { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
  const btnPrimary = { padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 };
  const btnSecondary = { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' };
  const btnSmall = { padding: '4px 8px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' };
  const btnDanger = { padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' };
  const inputStyle = { padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalStyle = { background: '#fff', borderRadius: '8px', padding: '30px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

  const badgeStyle = (status) => {
    const styles = {
      pending: { background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
      received: { background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
      cancelled: { background: '#e5e7eb', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }
    };
    return styles[status] || styles.pending;
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPhone = (value) => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div style={{ padding: '20px', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', margin: '0 0 10px 0' }}>
          Suppliers & Purchase Orders
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage supplier relationships and track incoming orders</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('suppliers')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'suppliers' ? '#1e3a5f' : '#fff',
            color: activeTab === 'suppliers' ? '#fff' : '#6b7280',
            border: '1px solid #d1d5db',
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('purchase_orders')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'purchase_orders' ? '#1e3a5f' : '#fff',
            color: activeTab === 'purchase_orders' ? '#fff' : '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '0 6px 6px 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          Purchase Orders
        </button>
      </div>

      {/* SUPPLIERS TAB */}
      {activeTab === 'suppliers' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={cardStyle}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Inventory Suppliers</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginTop: '8px' }}>{mergedVendors.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Misc. Suppliers</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0d9488', marginTop: '8px' }}>{miscSuppliers.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Inventory Value (Cost)</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginTop: '8px' }}>{formatCurrency(totalInventoryValue)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Purchase Orders</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginTop: '8px' }}>{totalPurchaseOrders}</div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ ...cardStyle, marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!mergeMode ? (
              <>
                <button onClick={() => { setMergeMode(true); setMergeSelected(new Set()); setMergeInto(''); }} style={btnSecondary}>
                  Merge Suppliers
                </button>
                <button onClick={() => { setMiscForm({ vendor_name: '', subcategory: '', website: '', contact_name: '', contact_phone: '', notes: '' }); setNewSubcategory(''); setAddMiscModalOpen(true); }} style={{ ...btnPrimary, background: '#0d9488' }}>
                  + Add Misc. Supplier
                </button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>Select suppliers to merge:</span>
                <select value={mergeInto} onChange={(e) => setMergeInto(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
                  <option value="">Keep which name?</option>
                  {Array.from(mergeSelected).map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={handleMerge} disabled={mergeSaving} style={{ ...btnPrimary, background: '#065f46' }}>
                  {mergeSaving ? 'Merging...' : `Merge (${mergeSelected.size} selected)`}
                </button>
                <button onClick={() => { setMergeMode(false); setMergeSelected(new Set()); }} style={btnSecondary}>Cancel</button>
              </>
            )}
            {actionMsg && (
              <div style={{ marginLeft: 'auto', padding: '6px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                {actionMsg}
              </div>
            )}
          </div>

          {loadingVendors ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#6b7280' }}>Loading suppliers...</div>
          ) : (
            <>
              {/* ═══════════ SECTION 1: INVENTORY SUPPLIERS ═══════════ */}
              <div style={{ background: '#1e3a5f', color: '#fff', padding: '10px 16px', borderRadius: '8px 8px 0 0', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inventory Suppliers</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({mergedVendors.length})</span>
              </div>
              {mergedVendors.length === 0 ? (
                <div style={{ ...cardStyle, borderRadius: '0 0 8px 8px', textAlign: 'center', color: '#6b7280' }}>No inventory suppliers found</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '15px', padding: '15px', background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
                  {mergedVendors.map((vendor) => (
                    <div key={vendor.name} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fafbfc' }}>
                      {/* Header: Name + Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {mergeMode && (
                            <input type="checkbox" checked={mergeSelected.has(vendor.name)} onChange={() => toggleMergeSelect(vendor.name)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                          )}
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f' }}>{vendor.name}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleEditVendor(vendor)} style={btnSmall}>Edit</button>
                          <button onClick={() => handleDeleteVendor(vendor)} style={{ ...btnSmall, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>Delete</button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '10px', background: '#f0f4f8', borderRadius: '6px', marginBottom: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Items</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e3a5f' }}>{vendor.item_count || 0}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Cost Value</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e3a5f' }}>{formatCurrency(vendor.total_value || 0)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>POs</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e3a5f' }}>{vendor.po_count || 0}</div>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div style={{ fontSize: '0.8rem', color: '#374151' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px 8px', lineHeight: '1.6' }}>
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>Website</span>
                          <span>{vendor.website ? <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{vendor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>Account #</span>
                          <span>{vendor.account_number || <span style={{ color: '#d1d5db' }}>—</span>}</span>
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>Contact</span>
                          <span>{vendor.contact_name || <span style={{ color: '#d1d5db' }}>—</span>}</span>
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>Email</span>
                          <span>{vendor.contact_email ? <a href={`mailto:${vendor.contact_email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{vendor.contact_email}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>Phone</span>
                          <span>{vendor.contact_phone ? <a href={`tel:${vendor.contact_phone.replace(/\D/g, '')}`} style={{ color: '#374151', textDecoration: 'none' }}>{vendor.contact_phone}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                        </div>
                        {vendor.notes && (
                          <div style={{ marginTop: '8px', padding: '8px', background: '#fffbeb', borderRadius: '4px', fontSize: '0.78rem', color: '#92400e', fontStyle: 'italic' }}>
                            {vendor.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══════════ SECTION 2: MISC. SUPPLIERS ═══════════ */}
              <div style={{ background: '#0d9488', color: '#fff', padding: '10px 16px', borderRadius: '8px 8px 0 0', marginTop: '30px', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Misc. Suppliers</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({miscSuppliers.length}) — Customer-specific parts</span>
              </div>
              {miscSuppliers.length === 0 ? (
                <div style={{ ...cardStyle, borderRadius: '0 0 8px 8px', textAlign: 'center', color: '#6b7280', padding: '30px' }}>
                  No misc suppliers yet. Click <strong>+ Add Misc. Supplier</strong> above to add one.
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb', borderTop: 'none', padding: '15px' }}>
                  {sortedSubcats.map(subcat => (
                    <div key={subcat} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ background: '#f0fdfa', color: '#0d9488', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #99f6e4' }}>
                          {subcat}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{miscBySubcategory[subcat].length} supplier{miscBySubcategory[subcat].length !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                        {miscBySubcategory[subcat].map(s => (
                          <div key={s.name} style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fafbfc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{s.name}</div>
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                <button onClick={() => handleEditVendor(s)} style={btnSmall}>Edit</button>
                                <button onClick={() => handleDeleteMiscSupplier(s.name)} style={{ ...btnSmall, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>Delete</button>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#374151', display: 'grid', gridTemplateColumns: '70px 1fr', gap: '2px 8px', lineHeight: '1.6' }}>
                              <span style={{ color: '#6b7280', fontWeight: 600 }}>Website</span>
                              <span>{s.website ? <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{s.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                              <span style={{ color: '#6b7280', fontWeight: 600 }}>Contact</span>
                              <span>{s.contact_name || <span style={{ color: '#d1d5db' }}>—</span>}</span>
                              <span style={{ color: '#6b7280', fontWeight: 600 }}>Email</span>
                              <span>{s.contact_email ? <a href={`mailto:${s.contact_email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{s.contact_email}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                              <span style={{ color: '#6b7280', fontWeight: 600 }}>Phone</span>
                              <span>{s.contact_phone ? <a href={`tel:${s.contact_phone.replace(/\D/g, '')}`} style={{ color: '#374151', textDecoration: 'none' }}>{s.contact_phone}</a> : <span style={{ color: '#d1d5db' }}>—</span>}</span>
                              <span style={{ color: '#6b7280', fontWeight: 600 }}>Account</span>
                              <span>{s.account_number || <span style={{ color: '#d1d5db' }}>—</span>}</span>
                            </div>
                            {s.notes && (
                              <div style={{ marginTop: '6px', padding: '6px 8px', background: '#fffbeb', borderRadius: '4px', fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>
                                {s.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PURCHASE ORDERS TAB */}
      {activeTab === 'purchase_orders' && (
        <div>
          {/* Filter Bar */}
          <div style={{ ...cardStyle, marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '5px' }}>Status</label>
              <select value={poStatusFilter} onChange={(e) => setPoStatusFilter(e.target.value)} style={{ ...inputStyle, width: '150px' }}>
                <option>All</option>
                <option>Pending</option>
                <option>Received</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '5px' }}>Supplier</label>
              <select value={poVendorFilter} onChange={(e) => setPoVendorFilter(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
                <option value="">All Suppliers</option>
                {vendors.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>
            <button onClick={() => setCreatePoModalOpen(true)} style={{ ...btnPrimary, marginLeft: 'auto' }}>
              + New Purchase Order
            </button>
          </div>

          {/* POs Table */}
          {loadingPos ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#6b7280' }}>Loading purchase orders...</div>
          ) : purchaseOrders.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
              No purchase orders found. Create one to start tracking incoming inventory.
            </div>
          ) : (
            <div style={cardStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>PO#</th>
                    <th style={thStyle}>Supplier</th>
                    <th style={thStyle}>Order Date</th>
                    <th style={thStyle}>Order #</th>
                    <th style={thStyle}>Items</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} style={{ cursor: 'pointer' }} onClick={() => handleViewPoDetail(po)}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1e3a5f' }}>{po.id}</td>
                      <td style={tdStyle}>{po.vendor}</td>
                      <td style={tdStyle}>{po.order_date ? new Date(po.order_date + 'T00:00:00').toLocaleDateString() : '—'}</td>
                      <td style={tdStyle}>{po.order_number || '—'}</td>
                      <td style={tdStyle}>{po.item_count || 0}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(po.total)}</td>
                      <td style={tdStyle}><span style={badgeStyle(po.status)}>{po.status}</span></td>
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        {po.status === 'pending' && (
                          <button onClick={() => handleMarkReceived(po.id)} style={{ ...btnSmall, background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editModalOpen && editingVendor && (
        <div style={modalOverlayStyle} onClick={() => setEditModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Edit Supplier: {editingVendor.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Supplier Type</label>
                <select value={editFormData.supplier_type || 'inventory'} onChange={(e) => setEditFormData({ ...editFormData, supplier_type: e.target.value })} style={inputStyle}>
                  <option value="inventory">Inventory Supplier</option>
                  <option value="misc">Misc. Supplier</option>
                </select>
              </div>
              {editFormData.supplier_type === 'misc' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Subcategory</label>
                  <select value={editFormData.subcategory || ''} onChange={(e) => { if (e.target.value === '__new__') { setEditFormData({ ...editFormData, subcategory: '', _newSubcategory: '' }); } else { setEditFormData({ ...editFormData, subcategory: e.target.value, _newSubcategory: '' }); } }} style={inputStyle}>
                    <option value="">None</option>
                    {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="__new__">+ New Subcategory...</option>
                  </select>
                  {editFormData.subcategory === '' && editFormData._newSubcategory !== undefined && (
                    <input type="text" value={editFormData._newSubcategory || ''} onChange={(e) => setEditFormData({ ...editFormData, _newSubcategory: e.target.value })} placeholder="Type new subcategory name..." style={{ ...inputStyle, marginTop: '6px' }} autoFocus />
                  )}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Website</label>
              <input type="text" value={editFormData.website} onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })} style={inputStyle} placeholder="https://example.com" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Contact Name</label>
              <input type="text" value={editFormData.contact_name} onChange={(e) => setEditFormData({ ...editFormData, contact_name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Contact Email</label>
              <input type="email" value={editFormData.contact_email} onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Contact Phone</label>
              <input type="tel" value={editFormData.contact_phone} onChange={(e) => setEditFormData({ ...editFormData, contact_phone: formatPhone(e.target.value) })} style={inputStyle} placeholder="(951) 293-1973" />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Account Number</label>
              <input type="text" value={editFormData.account_number} onChange={(e) => setEditFormData({ ...editFormData, account_number: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Notes</label>
              <textarea value={editFormData.notes} onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditModalOpen(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleSaveVendor} style={btnPrimary}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {createPoModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setCreatePoModalOpen(false)}>
          <div style={{ ...modalStyle, maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>New Purchase Order</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Supplier *</label>
                <select value={newPo.vendor} onChange={(e) => setNewPo({ ...newPo, vendor: e.target.value })} style={inputStyle}>
                  <option value="">Select supplier</option>
                  {vendors.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Order Date</label>
                <input type="date" value={newPo.order_date} onChange={(e) => setNewPo({ ...newPo, order_date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Order Number</label>
                <input type="text" value={newPo.order_number} onChange={(e) => setNewPo({ ...newPo, order_number: e.target.value })} style={inputStyle} placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Tracking Number</label>
                <input type="text" value={newPo.tracking_number} onChange={(e) => setNewPo({ ...newPo, tracking_number: e.target.value })} style={inputStyle} placeholder="Optional" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Shipping Cost</label>
                <input type="number" value={newPo.shipping_cost} onChange={(e) => setNewPo({ ...newPo, shipping_cost: e.target.value })} style={inputStyle} placeholder="0.00" step="0.01" />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Notes</label>
              <textarea value={newPo.notes} onChange={(e) => setNewPo({ ...newPo, notes: e.target.value })} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} />
            </div>

            {/* Line Items */}
            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1f2937' }}>Line Items</h3>

              {newPo.line_items.length > 0 && (
                <table style={{ ...tableStyle, marginBottom: '15px' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Part #</th>
                      <th style={thStyle}>Qty</th>
                      <th style={thStyle}>Cost</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newPo.line_items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{item.description}</td>
                        <td style={tdStyle}>{item.vendor_part_number || '—'}</td>
                        <td style={tdStyle}>{item.qty}</td>
                        <td style={tdStyle}>{formatCurrency(item.cost_each)}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                        <td style={tdStyle}><button onClick={() => removeLineItem(idx)} style={btnDanger}>X</button></td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>Subtotal:</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(newPo.line_items.reduce((s, i) => s + i.line_total, 0))}</td>
                      <td style={tdStyle}></td>
                    </tr>
                  </tbody>
                </table>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <input type="text" value={currentLineItem.description} onChange={(e) => setCurrentLineItem({ ...currentLineItem, description: e.target.value })} placeholder="Description *" style={{ ...inputStyle, flex: 3 }} />
                <input type="text" value={currentLineItem.vendor_part_number} onChange={(e) => setCurrentLineItem({ ...currentLineItem, vendor_part_number: e.target.value })} placeholder="Part #" style={{ ...inputStyle, flex: 1 }} />
                <input type="number" value={currentLineItem.qty} onChange={(e) => setCurrentLineItem({ ...currentLineItem, qty: e.target.value })} placeholder="Qty *" style={{ ...inputStyle, flex: 0.7 }} />
                <input type="number" value={currentLineItem.cost_each} onChange={(e) => setCurrentLineItem({ ...currentLineItem, cost_each: e.target.value })} placeholder="Cost *" step="0.01" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addLineItem} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}>+ Add</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setCreatePoModalOpen(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleCreatePo} style={btnPrimary}>Create Purchase Order</button>
            </div>
          </div>
        </div>
      )}

      {/* PO DETAIL MODAL */}
      {poDetailModalOpen && selectedPo && (
        <div style={modalOverlayStyle} onClick={() => setPoDetailModalOpen(false)}>
          <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>Purchase Order #{selectedPo.id}</h2>
              <span style={badgeStyle(selectedPo.status)}>{selectedPo.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Supplier</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{selectedPo.vendor}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Order Date</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{selectedPo.order_date ? new Date(selectedPo.order_date + 'T00:00:00').toLocaleDateString() : '—'}</div>
              </div>
              {selectedPo.order_number && <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Order #</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{selectedPo.order_number}</div>
              </div>}
              {selectedPo.tracking_number && <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Tracking #</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{selectedPo.tracking_number}</div>
              </div>}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e3a5f' }}>{formatCurrency(selectedPo.total)}</div>
              </div>
              {selectedPo.received_at && <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Received</div>
                <div style={{ fontSize: '1rem', color: '#065f46' }}>{new Date(selectedPo.received_at).toLocaleDateString()}</div>
              </div>}
            </div>

            {selectedPo.notes && (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#fffbeb', borderRadius: '4px', fontSize: '0.9rem' }}>
                <strong>Notes:</strong> {selectedPo.notes}
              </div>
            )}

            {selectedPo.line_items && selectedPo.line_items.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Line Items ({selectedPo.line_items.length})</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Part #</th>
                      <th style={thStyle}>Qty</th>
                      <th style={thStyle}>Cost</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}>Matched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPo.line_items.map((item) => (
                      <tr key={item.id}>
                        <td style={tdStyle}>{item.description}</td>
                        <td style={tdStyle}>{item.vendor_part_number || '—'}</td>
                        <td style={tdStyle}>{item.qty}</td>
                        <td style={tdStyle}>{formatCurrency(item.cost_each)}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                        <td style={tdStyle}>
                          {item.matched ? (
                            <span style={{ color: '#065f46', fontWeight: 600 }}>Yes</span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPoDetailModalOpen(false)} style={btnSecondary}>Close</button>
              {selectedPo.status === 'pending' && (
                <button onClick={() => handleMarkReceived(selectedPo.id)} style={{ ...btnPrimary, background: '#065f46' }}>
                  Mark Received
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD MISC SUPPLIER MODAL */}
      {addMiscModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setAddMiscModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0d9488' }}>Add Misc. Supplier</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Supplier Name *</label>
              <input type="text" value={miscForm.vendor_name} onChange={(e) => setMiscForm({ ...miscForm, vendor_name: e.target.value })} style={inputStyle} placeholder="e.g. Home Depot, Lowe's, local shop..." autoFocus />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Subcategory</label>
              <select value={miscForm.subcategory} onChange={(e) => { setMiscForm({ ...miscForm, subcategory: e.target.value }); if (e.target.value !== '__new__') setNewSubcategory(''); }} style={inputStyle}>
                <option value="">None</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__new__">+ Create New Subcategory...</option>
              </select>
              {miscForm.subcategory === '__new__' && (
                <input type="text" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Type new subcategory name (e.g. Awnings, Glass, Plumbing)..." style={{ ...inputStyle, marginTop: '6px' }} autoFocus />
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Website</label>
              <input type="text" value={miscForm.website} onChange={(e) => setMiscForm({ ...miscForm, website: e.target.value })} style={inputStyle} placeholder="https://example.com" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Contact Name</label>
                <input type="text" value={miscForm.contact_name} onChange={(e) => setMiscForm({ ...miscForm, contact_name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Contact Phone</label>
                <input type="tel" value={miscForm.contact_phone} onChange={(e) => setMiscForm({ ...miscForm, contact_phone: formatPhone(e.target.value) })} style={inputStyle} placeholder="(951) 293-1973" />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Notes</label>
              <textarea value={miscForm.notes} onChange={(e) => setMiscForm({ ...miscForm, notes: e.target.value })} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAddMiscModalOpen(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleAddMiscSupplier} style={{ ...btnPrimary, background: '#0d9488' }}>Add Supplier</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE VENDOR MODAL (reassign parts first) */}
      {deleteModal && (
        <div style={modalOverlayStyle} onClick={() => setDeleteModal(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Delete "{deleteModal.vendor.name}"</h2>
            <p style={{ color: '#374151', marginBottom: '15px' }}>
              This supplier has <strong>{deleteModal.parts.length} inventory item{deleteModal.parts.length !== 1 ? 's' : ''}</strong>.
              You need to reassign them to another supplier before deleting.
            </p>

            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Part #</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {deleteModal.parts.map(p => (
                    <tr key={p.id}>
                      <td style={tdStyle}>{p.part_number || '—'}</td>
                      <td style={tdStyle}>{p.description}</td>
                      <td style={tdStyle}>{p.qty_on_hand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                Reassign all parts to:
              </label>
              <select value={deleteReassign} onChange={(e) => setDeleteReassign(e.target.value)} style={inputStyle}>
                <option value="">Select a supplier</option>
                {vendors.filter(v => v.name !== deleteModal.vendor.name).map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.item_count} items)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModal(null)} style={btnSecondary}>Cancel</button>
              <button onClick={handleConfirmDelete} disabled={deleteSaving} style={{ ...btnPrimary, background: '#991b1b' }}>
                {deleteSaving ? 'Deleting...' : 'Reassign & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
