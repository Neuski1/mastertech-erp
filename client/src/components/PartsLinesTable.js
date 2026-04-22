import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import VendorSelect from './VendorSelect';

export default function PartsLinesTable({ recordId, partsLines, isEditable, onUpdate }) {
  const { canSeeFinancials } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInventory, setIsInventory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: '', part_number: '', quantity: '', sale_price_each: '', cost_each: '', vendor: '', markup: '50', taxable: true, inventory_id: null });
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [addToInvLine, setAddToInvLine] = useState(null); // line to add to inventory
  const [orderEditId, setOrderEditId] = useState(null);
  const [orderForm, setOrderForm] = useState({ order_status: 'ordered', order_eta: '', order_supplier: '', order_number: '', order_tracking: '' });
  const [allPartsFormVisible, setAllPartsFormVisible] = useState(false);
  const [pullFromStock, setPullFromStock] = useState(true);
  const [selectedItemQty, setSelectedItemQty] = useState(0);
  const searchTimeout = useRef(null);

  const formatCurrency = (val) =>
    parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const partsSubtotal = (partsLines || []).reduce((sum, l) => sum + parseFloat(l.line_total || 0), 0);

  const resetForm = () => {
    setForm({ description: '', part_number: '', quantity: '', sale_price_each: '', cost_each: '', vendor: '', markup: '50', taxable: true, inventory_id: null });
    setSearchQuery('');
    setSearchResults([]);
    setCatalogQuery('');
    setCatalogResults([]);
    setAllPartsFormVisible(false);
    setPullFromStock(true);
    setSelectedItemQty(0);
    setError('');
  };

  const openOrderEdit = (line) => {
    setOrderEditId(line.id);
    setOrderForm({
      order_status: line.order_status || 'ordered',
      order_eta: line.order_eta ? line.order_eta.toString().slice(0, 10) : '',
      order_supplier: line.order_supplier || line.vendor || '',
      order_number: line.order_number || '',
      order_tracking: line.order_tracking || ''
    });
  };

  const handleSaveOrder = async (lineId) => {
    try {
      await api.updatePart(recordId, lineId, orderForm);
      setOrderEditId(null);
      onUpdate();
    } catch (err) {
      console.error('Save order error:', err);
    }
  };

  const handleInventorySearch = (q) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await api.searchInventory(q);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  // Unified search for non-inventory (catalog + inventory)
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState([]);
  const catalogTimeout = useRef(null);

  const handleCatalogSearch = (q) => {
    setCatalogQuery(q);
    if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    if (q.length < 2) { setCatalogResults([]); return; }
    catalogTimeout.current = setTimeout(async () => {
      try {
        const results = await api.searchParts(q);
        setCatalogResults(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const selectCatalogItem = (item) => {
    if (item.source === 'inventory') {
      // Switch to inventory mode and select
      setIsInventory(true);
      selectInventoryItem(item);
    } else {
      // Calculate markup from existing cost/sale price
      const cost = parseFloat(item.cost_each) || 0;
      const sale = parseFloat(item.sale_price_each) || 0;
      let markup = '50';
      if (cost > 0 && sale > 0) {
        markup = Math.round(((sale - cost) / cost) * 100).toString();
      }
      // Fill non-inventory form from catalog
      setForm({
        description: item.description,
        part_number: '',
        quantity: '1',
        sale_price_each: item.sale_price_each ? parseFloat(item.sale_price_each).toFixed(2) : '',
        cost_each: item.cost_each ? parseFloat(item.cost_each).toFixed(2) : '',
        vendor: item.vendor || '',
        markup,
        taxable: true,
        inventory_id: null,
      });
    }
    setCatalogResults([]);
    setCatalogQuery('');
    setAllPartsFormVisible(true);
  };

  const selectInventoryItem = (item) => {
    const qty = parseFloat(item.qty_on_hand) || 0;
    setForm({
      description: item.description,
      part_number: item.part_number || '',
      quantity: '1',
      sale_price_each: parseFloat(item.sale_price_each).toFixed(2),
      cost_each: item.cost_each ? parseFloat(item.cost_each).toFixed(2) : '',
      vendor: item.vendor || '',
      markup: '0',
      taxable: true,
      inventory_id: item.id,
    });
    setSelectedItemQty(qty);
    setPullFromStock(qty > 0);
    setSearchResults([]);
    setSearchQuery('');
  };

  // For non-inventory: when cost or markup changes, recalculate sale price
  const handleCostChange = (newCost) => {
    const cost = parseFloat(newCost) || 0;
    const markup = parseFloat(form.markup) || 0;
    const salePrice = cost * (1 + markup / 100);
    setForm({ ...form, cost_each: newCost, sale_price_each: salePrice ? salePrice.toFixed(2) : '' });
  };

  const handleMarkupChange = (newMarkup) => {
    const cost = parseFloat(form.cost_each) || 0;
    const markup = parseFloat(newMarkup) || 0;
    const salePrice = cost * (1 + markup / 100);
    setForm({ ...form, markup: newMarkup, sale_price_each: salePrice ? salePrice.toFixed(2) : '' });
  };

  const handleAdd = async () => {
    if (!form.description || !form.quantity || !form.sale_price_each) {
      setError('Description, quantity, and sale price are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.addPart(recordId, {
        inventory_id: isInventory ? form.inventory_id : null,
        is_inventory_part: isInventory && !!form.inventory_id,
        part_number: form.part_number || null,
        vendor_part_number: !isInventory ? (form.part_number || null) : null,
        description: form.description,
        quantity: parseFloat(form.quantity),
        cost_each: form.cost_each ? parseFloat(form.cost_each) : null,
        sale_price_each: parseFloat(form.sale_price_each),
        taxable: form.taxable,
        vendor: !isInventory ? form.vendor : null,
        skip_deduct: isInventory && !!form.inventory_id && !pullFromStock,
      });
      setShowAddForm(false);
      resetForm();
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (line) => {
    setEditingId(line.id);
    const eCost = parseFloat(line.cost_each) || 0;
    const eSale = parseFloat(line.sale_price_each) || 0;
    const eMarkup = eCost > 0 && eSale > 0 ? Math.round(((eSale - eCost) / eCost) * 100).toString() : '50';
    setForm({
      description: line.description,
      part_number: line.part_number || '',
      quantity: parseFloat(line.quantity),
      sale_price_each: parseFloat(line.sale_price_each).toFixed(2),
      cost_each: line.cost_each ? parseFloat(line.cost_each).toFixed(2) : '',
      vendor: line.vendor || '',
      markup: eMarkup,
      taxable: line.taxable,
      inventory_id: line.inventory_id,
    });
    setError('');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updatePart(recordId, editingId, {
        description: form.description,
        quantity: parseFloat(form.quantity),
        sale_price_each: parseFloat(form.sale_price_each),
        cost_each: form.cost_each ? parseFloat(form.cost_each) : null,
        taxable: form.taxable,
      });
      setEditingId(null);
      resetForm();
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Inline save for qty/price without entering full edit mode
  const handleInlineSave = async (lineId, field, value) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) return;
    try {
      const data = {};
      if (field === 'quantity') data.quantity = numVal;
      if (field === 'sale_price_each') data.sale_price_each = numVal;
      if (field === 'cost_each') data.cost_each = numVal;
      await api.updatePart(recordId, lineId, data);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (lineId) => {
    if (!window.confirm('Delete this parts line?')) return;
    try {
      await api.deletePart(recordId, lineId);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={sectionTitle}>Parts</h2>
        {isEditable && !showAddForm && (
          <button onClick={() => { setShowAddForm(true); resetForm(); setIsInventory(false); }} style={btnSmallPrimary}>
            + Add Part
          </button>
        )}
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Add form */}
      {showAddForm && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => { setIsInventory(true); resetForm(); }}
              style={isInventory ? toggleActive : toggleInactive}
            >
              Inventory Part
            </button>
            <button
              onClick={() => { setIsInventory(false); resetForm(); }}
              style={!isInventory ? toggleActive : toggleInactive}
            >
              All Parts
            </button>
          </div>

          {/* Inventory search */}
          {isInventory && !form.inventory_id && (
            <div style={{ marginBottom: '12px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by description, part #, supplier part #, supplier..."
                value={searchQuery}
                onChange={(e) => handleInventorySearch(e.target.value)}
                style={{ ...inlineInput, width: '100%' }}
              />
              {searchResults.length > 0 && (
                <div style={dropdownStyle}>
                  {searchResults.map((item) => (
                    <div key={item.id} onClick={() => selectInventoryItem(item)} style={dropdownItem}>
                      <strong>{item.description}</strong>
                      <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: '8px' }}>
                        {item.part_number && `#${item.part_number} · `}
                        {formatCurrency(item.sale_price_each)} · Qty: {parseFloat(item.qty_on_hand).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected inventory item fields */}
          {isInventory && form.inventory_id && (
            <div style={formGrid}>
              <div>
                <label style={labelStyle}>Part #</label>
                <input value={form.part_number} disabled style={inlineInput} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Description</label>
                <input value={form.description} disabled style={inlineInput} />
              </div>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" step="1" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={inlineInput} />
              </div>
              <div>
                <label style={labelStyle}>Sale Price Each</label>
                <input type="number" step="0.01" value={form.sale_price_each} onChange={(e) => setForm({ ...form, sale_price_each: e.target.value })} style={inlineInput} />
                {form.cost_each && parseFloat(form.cost_each) > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                    Cost: {formatCurrency(form.cost_each)} | Markup: {((parseFloat(form.sale_price_each || 0) - parseFloat(form.cost_each)) / parseFloat(form.cost_each) * 100).toFixed(1)}%
                  </div>
                )}
                {(!form.cost_each || parseFloat(form.cost_each) <= 0) && (
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>Override inventory price if needed</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Line Total</label>
                <div style={{ padding: '6px 0', fontWeight: 600 }}>
                  {form.quantity && form.sale_price_each
                    ? formatCurrency(parseFloat(form.quantity) * parseFloat(form.sale_price_each))
                    : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                <input type="checkbox" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
                <label style={{ fontSize: '0.8rem' }}>Taxable</label>
              </div>
            </div>
          )}

          {/* Stock choice prompt for inventory items */}
          {isInventory && form.inventory_id && (
            <div style={{
              margin: '8px 0 4px', padding: '10px 14px', borderRadius: '6px',
              backgroundColor: selectedItemQty > 0 ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${selectedItemQty > 0 ? '#bae6fd' : '#fecaca'}`,
              fontSize: '0.82rem'
            }}>
              {selectedItemQty > 0 ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0c4a6e' }}>
                    {selectedItemQty} in stock — pull from inventory or order new?
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setPullFromStock(true)}
                      style={{
                        padding: '5px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        border: pullFromStock ? '2px solid #1e3a5f' : '1px solid #d1d5db',
                        backgroundColor: pullFromStock ? '#1e3a5f' : '#fff',
                        color: pullFromStock ? '#fff' : '#374151'
                      }}>
                      Pull from Stock
                    </button>
                    <button type="button" onClick={() => setPullFromStock(false)}
                      style={{
                        padding: '5px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        border: !pullFromStock ? '2px solid #b45309' : '1px solid #d1d5db',
                        backgroundColor: !pullFromStock ? '#b45309' : '#fff',
                        color: !pullFromStock ? '#fff' : '#374151'
                      }}>
                      Order New
                    </button>
                  </div>
                  {!pullFromStock && (
                    <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#92400e' }}>
                      Inventory will not be deducted. Part will be flagged as needing to be ordered.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#991b1b', fontWeight: 600 }}>
                  Out of stock — this part will be flagged as needing to be ordered.
                </div>
              )}
            </div>
          )}

          {/* All Parts tab — search then form */}
          {!isInventory && !allPartsFormVisible && (
            <div>
              {/* Search box + Enter Manually button on same row */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    value={catalogQuery}
                    onChange={(e) => handleCatalogSearch(e.target.value)}
                    placeholder="Search by description, part #, supplier part #, supplier..."
                    style={{ ...inlineInput, width: '100%' }}
                    autoFocus
                  />
                  {/* Results dropdown */}
                  {catalogResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', maxHeight: '260px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {/* Inventory results */}
                      {catalogResults.filter(r => r.source === 'inventory').length > 0 && (
                        <>
                          <div style={{ padding: '4px 12px', backgroundColor: '#d1fae5', fontSize: '0.7rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>In Inventory</div>
                          {catalogResults.filter(r => r.source === 'inventory').map(item => (
                            <div key={`inv-${item.id}`} onClick={() => selectCatalogItem(item)}
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{item.description}</strong>
                                <span style={{ color: '#065f46', fontSize: '0.75rem' }}>{formatCurrency(item.sale_price_each)}</span>
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                {item.part_number && <span>#{item.part_number}</span>}
                                {item.vendor && <span> &middot; {item.vendor}</span>}
                                <span> &middot; Qty: {parseFloat(item.qty_on_hand)}</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* Catalog results */}
                      {catalogResults.filter(r => r.source === 'catalog').length > 0 && (
                        <>
                          <div style={{ padding: '4px 12px', backgroundColor: '#f3f4f6', fontSize: '0.7rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Past Orders — Not in Inventory</div>
                          {catalogResults.filter(r => r.source === 'catalog').map(item => (
                            <div key={`cat-${item.id}`} onClick={() => selectCatalogItem(item)}
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{item.description}</strong>
                                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{item.sale_price_each ? `Last: ${formatCurrency(item.sale_price_each)}` : ''}</span>
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                {item.vendor_part_number && <span>MPN: {item.vendor_part_number}</span>}
                                {item.vendor && <span> &middot; {item.vendor}</span>}
                                {item.times_used && <span> &middot; Used {item.times_used}x</span>}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  {/* No results message */}
                  {catalogQuery.length >= 2 && catalogResults.length === 0 && (
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px' }}>
                      No matches found
                    </div>
                  )}
                </div>
                <button onClick={() => { setAllPartsFormVisible(true); setCatalogResults([]); setForm(f => ({ ...f, description: catalogQuery || '' })); }} style={{ ...btnSmallGray, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Enter Part Manually
                </button>
              </div>
            </div>
          )}

          {/* All Parts — form fields (shown after selection or manual entry) */}
          {!isInventory && allPartsFormVisible && (
            <div style={formGrid}>
              <div>
                <label style={labelStyle}>Part Number</label>
                <input value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} placeholder="Mfr or supplier part #" style={inlineInput} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Description *</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inlineInput} autoFocus={!form.description} />
              </div>
              <div>
                <label style={labelStyle}>Supplier</label>
                <VendorSelect value={form.vendor} onChange={(v) => setForm({ ...form, vendor: v })} style={inlineInput} />
              </div>
              <div>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" step="1" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={inlineInput} />
              </div>
              <div>
                <label style={labelStyle}>Cost Each</label>
                <input type="number" step="0.01" value={form.cost_each} onChange={(e) => handleCostChange(e.target.value)} style={inlineInput} placeholder="What we paid" />
              </div>
              <div>
                <label style={labelStyle}>Markup %</label>
                <input type="number" step="1" value={form.markup} onChange={(e) => handleMarkupChange(e.target.value)} style={inlineInput} placeholder="50" />
              </div>
              <div>
                <label style={labelStyle}>Sale Price Each *</label>
                <input type="number" step="0.01" value={form.sale_price_each} onChange={(e) => setForm({ ...form, sale_price_each: e.target.value })} style={inlineInput} />
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>Auto-calculated at 50% markup</div>
              </div>
              <div>
                <label style={labelStyle}>Line Total</label>
                <div style={{ padding: '6px 0', fontWeight: 600 }}>
                  {form.quantity && form.sale_price_each
                    ? formatCurrency(parseFloat(form.quantity) * parseFloat(form.sale_price_each))
                    : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                <input type="checkbox" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
                <label style={{ fontSize: '0.8rem' }}>Taxable</label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {(isInventory ? form.inventory_id : allPartsFormVisible) && (
              <button onClick={handleAdd} disabled={saving} style={btnSmallPrimary}>
                {saving ? 'Adding...' : 'Add Part'}
              </button>
            )}
            <button onClick={() => { setShowAddForm(false); resetForm(); }} style={btnSmallGray}>Cancel</button>
            {isInventory && form.inventory_id && (
              <button onClick={() => { setForm({ ...form, inventory_id: null }); setSearchQuery(''); }} style={btnSmallGray}>
                Change Item
              </button>
            )}
            {!isInventory && allPartsFormVisible && (
              <button onClick={() => { resetForm(); }} style={btnSmallGray}>
                Search Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Parts table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Part #</th>
            <th style={thStyle}>Description</th>
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'center' }}>Tax</th>}
            <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>}
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>}
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>}
            {canSeeFinancials && <th style={{ ...thStyle, textAlign: 'right' }}>Markup</th>}
            {isEditable && <th style={{ ...thStyle, width: '120px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {(partsLines || []).map((line) =>
            editingId === line.id ? (
              <tr key={line.id} style={{ backgroundColor: '#fffbeb' }}>
                <td style={tdStyle}>{line.part_number || '—'}</td>
                <td style={tdStyle}>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={inlineInput} />
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input type="checkbox" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="1" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={{ ...inlineInput, width: '60px', textAlign: 'right' }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.01" value={form.sale_price_each} onChange={(e) => setForm({ ...form, sale_price_each: e.target.value })}
                    style={{ ...inlineInput, width: '80px', textAlign: 'right' }} />
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>
                  {form.quantity && form.sale_price_each ? formatCurrency(parseFloat(form.quantity) * parseFloat(form.sale_price_each)) : '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#9ca3af', fontSize: '0.8rem' }}>
                  {line.cost_each ? formatCurrency(line.cost_each) : '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#9ca3af', fontSize: '0.8rem' }}>
                  {line.cost_each && parseFloat(line.cost_each) > 0 && form.sale_price_each
                    ? ((parseFloat(form.sale_price_each) - parseFloat(line.cost_each)) / parseFloat(line.cost_each) * 100).toFixed(1) + '%'
                    : '—'}
                </td>
                <td style={tdStyle}>
                  <button onClick={handleSaveEdit} disabled={saving} style={btnTiny}>Save</button>
                  <button onClick={() => { setEditingId(null); resetForm(); }} style={btnTinyGray}>Cancel</button>
                </td>
              </tr>
            ) : (
              <React.Fragment key={line.id}>
              <tr>
                <td style={tdStyle}>{line.part_number || '—'}</td>
                <td style={tdStyle}>
                  {line.description}
                  {line.is_inventory_part && <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>INV</span>}
                  {line.vendor && <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '1px 5px', borderRadius: '3px' }}>{line.vendor}</span>}
                </td>
                {canSeeFinancials && (
                  <td style={{ ...tdStyle, textAlign: 'center', color: line.taxable ? '#10b981' : '#9ca3af' }}>
                    {line.taxable ? '\u2713' : '\u2717'}
                  </td>
                )}
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {isEditable ? (
                    <input
                      type="number" step="1" min="1"
                      defaultValue={parseFloat(line.quantity)}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value);
                        if (v !== parseFloat(line.quantity)) handleInlineSave(line.id, 'quantity', e.target.value);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                      style={inlineEditableStyle}
                    />
                  ) : parseFloat(line.quantity).toFixed(2)}
                </td>
                {canSeeFinancials && (
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {isEditable ? (
                      <input
                        type="number" step="0.01" min="0"
                        defaultValue={parseFloat(line.sale_price_each).toFixed(2)}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value);
                          if (v !== parseFloat(line.sale_price_each)) handleInlineSave(line.id, 'sale_price_each', e.target.value);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                        style={inlineEditableStyle}
                      />
                    ) : formatCurrency(line.sale_price_each)}
                  </td>
                )}
                {canSeeFinancials && <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.line_total)}</td>}
                {canSeeFinancials && (
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {isEditable ? (
                      <input
                        type="number" step="0.01" min="0"
                        defaultValue={line.cost_each && parseFloat(line.cost_each) > 0 ? parseFloat(line.cost_each).toFixed(2) : ''}
                        placeholder="—"
                        onBlur={(e) => {
                          const v = e.target.value !== '' ? parseFloat(e.target.value) : 0;
                          const old = parseFloat(line.cost_each) || 0;
                          if (v !== old) handleInlineSave(line.id, 'cost_each', e.target.value || '0');
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                        style={inlineEditableStyle}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        {line.cost_each && parseFloat(line.cost_each) > 0 ? formatCurrency(line.cost_each) : '—'}
                      </span>
                    )}
                  </td>
                )}
                {canSeeFinancials && (
                  <td style={{ ...tdStyle, textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: (() => {
                    const cost = parseFloat(line.cost_each);
                    const sale = parseFloat(line.sale_price_each);
                    if (!cost || cost <= 0) return '#9ca3af';
                    const pct = ((sale - cost) / cost) * 100;
                    return pct >= 40 ? '#065f46' : pct >= 20 ? '#92400e' : '#dc2626';
                  })() }}>
                    {line.cost_each && parseFloat(line.cost_each) > 0
                      ? (((parseFloat(line.sale_price_each) - parseFloat(line.cost_each)) / parseFloat(line.cost_each)) * 100).toFixed(1) + '%'
                      : '—'}
                  </td>
                )}
                {isEditable && (
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(line)} style={btnTinyGray}>Edit</button>
                    {!line.is_inventory_part && !line.inventory_id && (
                      <button onClick={() => setAddToInvLine(line)} style={btnTinyInv}>+Inv</button>
                    )}
                    <button onClick={() => handleDelete(line.id)} style={btnTinyDanger}>Del</button>
                  </td>
                )}
              </tr>
              {/* Order tracking row for parts that are ordered or received */}
              {(line.order_status === 'ordered' || line.order_status === 'received' || orderEditId === line.id) && (
                <tr key={`order-${line.id}`} style={{ backgroundColor: line.order_status === 'received' ? '#f0fdf4' : '#fffbeb' }}>
                  <td colSpan={canSeeFinancials ? 10 : 4} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {orderEditId === line.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select value={orderForm.order_status} onChange={(e) => setOrderForm({ ...orderForm, order_status: e.target.value })}
                          style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem' }}>
                          <option value="not_ordered">Not Ordered</option>
                          <option value="ordered">Ordered</option>
                          <option value="received">Received</option>
                        </select>
                        <input type="text" value={orderForm.order_supplier} onChange={(e) => setOrderForm({ ...orderForm, order_supplier: e.target.value })}
                          placeholder="Supplier" style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '120px' }} />
                        <input type="text" value={orderForm.order_number} onChange={(e) => setOrderForm({ ...orderForm, order_number: e.target.value })}
                          placeholder="Order #" style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '100px' }} />
                        <input type="text" value={orderForm.order_tracking} onChange={(e) => setOrderForm({ ...orderForm, order_tracking: e.target.value })}
                          placeholder="Tracking #" style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '120px' }} />
                        <label style={{ fontSize: '0.8rem', color: '#374151' }}>ETA:</label>
                        <input type="date" value={orderForm.order_eta} onChange={(e) => setOrderForm({ ...orderForm, order_eta: e.target.value })}
                          style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem' }} />
                        <button onClick={() => handleSaveOrder(line.id)} style={{ padding: '3px 8px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setOrderEditId(null)} style={{ padding: '3px 8px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem',
                          backgroundColor: line.order_status === 'ordered' ? '#fef3c7' : '#d1fae5',
                          color: line.order_status === 'ordered' ? '#92400e' : '#065f46'
                        }}>
                          {line.order_status === 'ordered' ? 'ORDERED' : 'RECEIVED'}
                        </span>
                        {line.order_supplier && <span><strong>From:</strong> {line.order_supplier}</span>}
                        {line.order_number && <span><strong>Order#:</strong> {line.order_number}</span>}
                        {line.order_tracking && <span><strong>Tracking:</strong> {line.order_tracking}</span>}
                        {line.order_eta && <span><strong>ETA:</strong> {new Date(line.order_eta + 'T00:00:00').toLocaleDateString()}</span>}
                        {isEditable && (
                          <button onClick={() => openOrderEdit(line)} style={{ padding: '2px 6px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '3px', fontSize: '0.7rem', cursor: 'pointer', marginLeft: 'auto' }}>Edit</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
              {/* "Mark as Ordered" button for parts with no order status */}
              {(!line.order_status || line.order_status === 'not_ordered') && isEditable && orderEditId !== line.id && (
                <tr key={`order-btn-${line.id}`}>
                  <td colSpan={canSeeFinancials ? 10 : 4} style={{ padding: '2px 12px 6px', borderBottom: '1px solid #e5e7eb' }}>
                    <button onClick={() => openOrderEdit(line)} style={{ padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: '3px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                      Mark as Ordered
                    </button>
                  </td>
                </tr>
              )}
              </React.Fragment>
            )
          )}

          {(!partsLines || partsLines.length === 0) && !showAddForm && (
            <tr><td colSpan={99} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No parts yet</td></tr>
          )}
        </tbody>
        {canSeeFinancials && (
          <tfoot>
            <tr style={{ backgroundColor: '#f9fafb', fontWeight: 600 }}>
              <td colSpan={5} style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>SUBTOTAL — PARTS</td>
              <td style={{ ...tdStyle, textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>{formatCurrency(partsSubtotal)}</td>
              <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>
              <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>
              {isEditable && <td style={{ ...tdStyle, borderTop: '2px solid #e5e7eb' }}></td>}
            </tr>
          </tfoot>
        )}
      </table>

      {/* Add to Inventory Modal */}
      {addToInvLine && (
        <AddToInventoryModal
          line={addToInvLine}
          onClose={() => setAddToInvLine(null)}
        />
      )}
    </div>
  );
}

// ─── Add to Inventory Modal (2-step) ─────────────────────────────────────────
function AddToInventoryModal({ line, onClose }) {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.getInventoryCategories().then(setCategories).catch(() => {});
  }, []);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    description: line.description || '',
    vendor: line.vendor || '',
    vendor_part_number: '',
    cost_each: line.cost_each ? parseFloat(line.cost_each).toFixed(2) : '',
    sale_price_each: line.sale_price_each ? parseFloat(line.sale_price_each).toFixed(2) : '',
    qty_on_hand: '1',
    reorder_level: '2',
    category: '',
    location: '',
  });
  const [generatedPN, setGeneratedPN] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCategoryChange = async (prefix) => {
    setForm({ ...form, category: prefix });
    if (!prefix) { setGeneratedPN(''); return; }
    try {
      const data = await api.getNextPartNumber(prefix);
      setGeneratedPN(data.part_number);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    if (!form.description || !form.sale_price_each || !form.category) {
      setError('Description, sale price, and category are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.createInventoryItem({
        part_number: generatedPN,
        description: form.description,
        vendor: form.vendor || null,
        vendor_part_number: form.vendor_part_number || null,
        category: form.category,
        location: form.location || 'unassigned',
        qty_on_hand: parseFloat(form.qty_on_hand) || 0,
        reorder_level: parseFloat(form.reorder_level) || null,
        cost_each: form.cost_each ? parseFloat(form.cost_each) : null,
        sale_price_each: parseFloat(form.sale_price_each),
      });
      setSuccess(`Part added to inventory as ${generatedPN}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {success ? (
          <div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>&#9989;</div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#065f46' }}>{success}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onClose} style={btnSmallPrimary}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 4px', color: '#1e3a5f' }}>Add to Inventory</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: step === 1 ? '#1e3a5f' : '#d1fae5', color: step === 1 ? '#fff' : '#065f46' }}>Step 1: Info</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: step === 2 ? '#1e3a5f' : '#f3f4f6', color: step === 2 ? '#fff' : '#9ca3af' }}>Step 2: Category</span>
            </div>

            {error && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '0.85rem', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={modalLabel}>Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={modalInput} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={modalLabel}>Supplier</label>
                    <VendorSelect value={form.vendor} onChange={(v) => setForm({ ...form, vendor: v })} style={modalInput} />
                  </div>
                  <div>
                    <label style={modalLabel}>Supplier / Mfr Part #</label>
                    <input value={form.vendor_part_number} onChange={(e) => setForm({ ...form, vendor_part_number: e.target.value })} style={modalInput} placeholder="Optional" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={modalLabel}>Cost</label>
                    <input type="number" step="0.01" value={form.cost_each} onChange={(e) => setForm({ ...form, cost_each: e.target.value })} style={modalInput} />
                  </div>
                  <div>
                    <label style={modalLabel}>Sale Price</label>
                    <input type="number" step="0.01" value={form.sale_price_each} onChange={(e) => setForm({ ...form, sale_price_each: e.target.value })} style={modalInput} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={modalLabel}>Qty on Hand *</label>
                    <input type="number" min="0" value={form.qty_on_hand} onChange={(e) => setForm({ ...form, qty_on_hand: e.target.value })} style={modalInput} />
                  </div>
                  <div>
                    <label style={modalLabel}>Reorder Level</label>
                    <input type="number" min="0" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} style={modalInput} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button onClick={onClose} style={btnSmallGray}>Cancel</button>
                  <button onClick={() => setStep(2)} style={btnSmallPrimary}>Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={modalLabel}>Category *</label>
                  <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} style={modalInput}>
                    <option value="">— Select Category —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.prefix}>{c.name} ({c.prefix})</option>
                    ))}
                  </select>
                </div>
                {generatedPN && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <label style={modalLabel}>Generated Part Number</label>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: '#065f46' }}>{generatedPN}</div>
                  </div>
                )}
                <div>
                  <label style={modalLabel}>Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={modalInput} placeholder="e.g. Front Closet, Shop..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => setStep(1)} style={btnSmallGray}>Back</button>
                  <button onClick={handleSave} disabled={saving || !form.category} style={btnSmallPrimary}>
                    {saving ? 'Saving...' : 'Add to Inventory'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const sectionStyle = { marginBottom: '24px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' };
const thStyle = { textAlign: 'left', padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const inlineInput = { padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' };
const errorStyle = { color: 'red', marginBottom: '8px', padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '4px', fontSize: '0.8rem' };
const btnSmallPrimary = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const btnSmallGray = { padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const btnTiny = { padding: '2px 8px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const btnTinyGray = { padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px' };
const inlineEditableStyle = { padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '0.8rem', width: '70px', textAlign: 'right', boxSizing: 'border-box', backgroundColor: '#fefce8' };
const btnTinyDanger = { padding: '2px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' };
const btnTinyInv = { padding: '2px 8px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '4px', fontWeight: 600 };
const toggleActive = { padding: '6px 14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' };
const toggleInactive = { padding: '6px 14px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const dropdownStyle = { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const dropdownItem = { padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const modalLabel = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '3px' };
const modalInput = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' };
