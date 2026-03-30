import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function PartsSaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Customer search
  const [customerMode, setCustomerMode] = useState('walkin'); // 'search' or 'walkin'
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [walkinName, setWalkinName] = useState('');
  const searchTimeout = useRef(null);

  // Add line form
  const [showAddLine, setShowAddLine] = useState(false);
  const [lineForm, setLineForm] = useState({ description: '', part_number: '', quantity: '1', unit_price: '', inventory_item_id: null, is_inventory_item: false });
  const [invSearch, setInvSearch] = useState('');
  const [invResults, setInvResults] = useState([]);
  const [editingLineId, setEditingLineId] = useState(null);
  const [saving, setSaving] = useState(false);
  const invTimeout = useRef(null);

  // Payment form
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ payment_method: 'cash', payment_reference: '', amount: '' });

  // Discount
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountForm, setDiscountForm] = useState({ amount: '', description: '' });

  const fetchSale = async () => {
    try {
      const data = await api.getPartsSale(id);
      setSale(data);
      if (data.customer_id) setCustomerMode('search');
      else if (data.customer_name) { setCustomerMode('walkin'); setWalkinName(data.customer_name); }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSale(); }, [id]);

  const formatCurrency = (val) =>
    parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── Customer search ───────────────────────────────────────────────
  const handleCustomerSearch = (q) => {
    setCustomerSearch(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setCustomerResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await api.getCustomers({ search: q, limit: 10 });
        setCustomerResults(data.customers || data);
      } catch (err) { console.error(err); }
    }, 300);
  };

  const selectCustomer = async (customer) => {
    try {
      await api.updatePartsSale(id, { customer_id: customer.id, customer_name: null });
      setCustomerResults([]);
      setCustomerSearch('');
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  const saveWalkinName = async () => {
    try {
      await api.updatePartsSale(id, { customer_id: null, customer_name: walkinName || null });
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  // ── Inventory search ──────────────────────────────────────────────
  const handleInvSearch = (q) => {
    setInvSearch(q);
    if (invTimeout.current) clearTimeout(invTimeout.current);
    if (q.length < 2) { setInvResults([]); return; }
    invTimeout.current = setTimeout(async () => {
      try {
        const results = await api.searchInventory(q);
        setInvResults(results);
      } catch (err) { console.error(err); }
    }, 300);
  };

  const selectInvItem = (item) => {
    setLineForm({
      description: item.description,
      part_number: item.part_number || '',
      quantity: '1',
      unit_price: parseFloat(item.sale_price_each).toFixed(2),
      inventory_item_id: item.id,
      is_inventory_item: true,
    });
    setInvResults([]);
    setInvSearch('');
  };

  const resetLineForm = () => {
    setLineForm({ description: '', part_number: '', quantity: '1', unit_price: '', inventory_item_id: null, is_inventory_item: false });
    setInvSearch('');
    setInvResults([]);
    setError('');
  };

  // ── Line CRUD ─────────────────────────────────────────────────────
  const handleAddLine = async () => {
    if (!lineForm.description || !lineForm.unit_price) { setError('Description and price are required'); return; }
    setSaving(true); setError('');
    try {
      await api.addPartsSaleLine(id, {
        inventory_item_id: lineForm.inventory_item_id,
        is_inventory_item: lineForm.is_inventory_item,
        part_number: lineForm.part_number || null,
        description: lineForm.description,
        quantity: parseInt(lineForm.quantity) || 1,
        unit_price: parseFloat(lineForm.unit_price),
      });
      setShowAddLine(false);
      resetLineForm();
      fetchSale();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const startEditLine = (line) => {
    setEditingLineId(line.id);
    setLineForm({
      description: line.description,
      part_number: line.part_number || '',
      quantity: String(line.quantity),
      unit_price: parseFloat(line.unit_price).toFixed(2),
      inventory_item_id: line.inventory_item_id,
      is_inventory_item: line.is_inventory_item,
    });
  };

  const handleSaveEditLine = async () => {
    setSaving(true); setError('');
    try {
      await api.updatePartsSaleLine(id, editingLineId, {
        description: lineForm.description,
        quantity: parseInt(lineForm.quantity) || 1,
        unit_price: parseFloat(lineForm.unit_price),
      });
      setEditingLineId(null);
      resetLineForm();
      fetchSale();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteLine = async (lineId) => {
    if (!window.confirm('Remove this line?')) return;
    try {
      await api.deletePartsSaleLine(id, lineId);
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  // ── CC Fee toggle ─────────────────────────────────────────────────
  const toggleCcFee = async () => {
    try {
      await api.updatePartsSale(id, { cc_fee_applied: !sale.cc_fee_applied });
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  // ── Discount ──────────────────────────────────────────────────────
  const saveDiscount = async () => {
    try {
      await api.updatePartsSale(id, { discount_amount: discountForm.amount || 0, discount_description: discountForm.description || '' });
      setEditingDiscount(false);
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  // ── Payment ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!payForm.amount) { setError('Amount is required'); return; }
    setSaving(true); setError('');
    try {
      await api.recordPartsSalePayment(id, {
        payment_method: payForm.payment_method,
        payment_reference: payForm.payment_reference || null,
        amount: parseFloat(payForm.amount),
      });
      setShowPayment(false);
      setPayForm({ payment_method: 'cash', payment_reference: '', amount: '' });
      fetchSale();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Void ──────────────────────────────────────────────────────────
  const handleVoid = async () => {
    if (!window.confirm('Void this parts sale? This will restore all inventory quantities.')) return;
    try {
      await api.voidPartsSale(id);
      fetchSale();
    } catch (err) { setError(err.message); }
  };

  // ── Print Receipt ─────────────────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to print'); return; }

    const s = sale;
    const custName = s.last_name ? `${s.last_name}${s.first_name ? ', ' + s.first_name : ''}` : (s.customer_name || 'Walk-in Customer');
    const fmtCur = (v) => parseFloat(v || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const paidInFull = parseFloat(s.amount_due) <= 0;

    const lineRows = (s.lines || []).map(l =>
      `<tr><td style="padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px">${l.part_number || ''}</td><td style="padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px">${l.description}</td><td style="padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px;text-align:right">${l.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px;text-align:right">${fmtCur(l.unit_price)}</td><td style="padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px;text-align:right">${fmtCur(l.line_total)}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><title>Parts Sale ${s.sale_number}</title>
<style>
  html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @media print { @page { margin: 0.5in; } }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 0; padding: 20px; max-width: 500px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #1a2a4a; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { color: #1a2a4a; margin: 0; font-size: 16px; }
  .header p { margin: 2px 0; font-size: 10px; color: #333; }
  table { width: 100%; border-collapse: collapse; }
  .totals { margin-top: 12px; text-align: right; }
  .totals .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
  .totals .row.bold { font-weight: bold; font-size: 13px; }
  .totals .row.divider { border-top: 2px solid #1a2a4a; margin-top: 4px; padding-top: 4px; }
</style></head><body>
<div class="header">
  <h1>MASTER TECH RV REPAIR & STORAGE</h1>
  <p>6590 East 49th Avenue, Commerce City CO 80022</p>
  <p>(303) 557-2214 &bull; service@mastertechrvrepair.com</p>
</div>
<div style="display:flex;justify-content:space-between;margin-bottom:16px">
  <div><strong>PARTS SALE ${s.sale_number}</strong></div>
  <div>${formatDate(s.sale_date)}</div>
</div>
<div style="margin-bottom:12px;font-size:12px"><strong>Customer:</strong> ${custName}</div>
<table>
  <thead><tr style="background:#1a2a4a"><th style="color:#fff;padding:6px 8px;text-align:left;font-size:11px">Part #</th><th style="color:#fff;padding:6px 8px;text-align:left;font-size:11px">Description</th><th style="color:#fff;padding:6px 8px;text-align:right;font-size:11px">Qty</th><th style="color:#fff;padding:6px 8px;text-align:right;font-size:11px">Price</th><th style="color:#fff;padding:6px 8px;text-align:right;font-size:11px">Total</th></tr></thead>
  <tbody>${lineRows}</tbody>
</table>
<div class="totals">
  <div class="row"><span>Subtotal</span><span>${fmtCur(s.subtotal)}</span></div>
  <div class="row"><span>Tax (${(parseFloat(s.tax_rate) * 100).toFixed(2)}%)</span><span>${fmtCur(s.tax_amount)}</span></div>
  ${s.cc_fee_applied ? `<div class="row"><span>CC Fee (3%)</span><span>${fmtCur(s.cc_fee_amount)}</span></div>` : ''}
  ${parseFloat(s.discount_amount) > 0 ? `<div class="row"><span>Discount${s.discount_description ? ' — ' + s.discount_description : ''}</span><span>-${fmtCur(s.discount_amount)}</span></div>` : ''}
  <div class="row bold divider"><span>TOTAL</span><span>${fmtCur(s.total_amount)}</span></div>
  <div class="row"><span>Paid</span><span>${fmtCur(s.amount_paid)}</span></div>
  <div class="row bold divider" style="color:${paidInFull ? '#065f46' : '#dc2626'}"><span>${paidInFull ? 'PAID IN FULL' : 'AMOUNT DUE'}</span><span>${paidInFull ? '' : fmtCur(s.amount_due)}</span></div>
  ${s.payment_method ? `<div class="row" style="font-size:10px;color:#666"><span>Payment: ${s.payment_method}${s.payment_reference ? ' #' + s.payment_reference : ''}</span></div>` : ''}
</div>
<div style="text-align:center;margin-top:24px;font-size:10px;color:#666">Thank you for your business!<br/>Our Service Makes Happy Campers!</div>
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  if (!sale) return <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>Sale not found</div>;

  const isOpen = sale.status === 'open';
  const isPaid = sale.status === 'paid';
  const isVoid = sale.status === 'void';
  const lines = sale.lines || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/parts-sales')} style={btnLink}>&larr; Back to Parts Sales</button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e3a5f' }}>Parts Sale #{sale.sale_number}</h1>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{formatDate(sale.sale_date)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {statusBadge(sale.status)}
          {isPaid && <span style={{ color: '#065f46', fontWeight: 700, fontSize: '1rem' }}>PAID IN FULL</span>}
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Customer Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Customer</h3>
        {sale.customer_id ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{sale.last_name}{sale.first_name ? ', ' + sale.first_name : ''}</strong>
              {sale.company_name && <span style={{ color: '#6b7280', marginLeft: '8px' }}>({sale.company_name})</span>}
              {sale.phone_primary && <span style={{ color: '#6b7280', marginLeft: '12px' }}>{sale.phone_primary}</span>}
              {sale.email_primary && <span style={{ color: '#6b7280', marginLeft: '12px' }}>{sale.email_primary}</span>}
            </div>
            {isOpen && <button onClick={() => { api.updatePartsSale(id, { customer_id: null }); fetchSale(); }} style={btnSmall}>Change</button>}
          </div>
        ) : (
          <div>
            {isOpen && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button onClick={() => setCustomerMode('search')} style={{ ...btnSmall, fontWeight: customerMode === 'search' ? 700 : 400, backgroundColor: customerMode === 'search' ? '#1e3a5f' : '#f3f4f6', color: customerMode === 'search' ? '#fff' : '#374151' }}>Search Customer</button>
                <button onClick={() => setCustomerMode('walkin')} style={{ ...btnSmall, fontWeight: customerMode === 'walkin' ? 700 : 400, backgroundColor: customerMode === 'walkin' ? '#1e3a5f' : '#f3f4f6', color: customerMode === 'walkin' ? '#fff' : '#374151' }}>Walk-in (No Account)</button>
              </div>
            )}
            {customerMode === 'search' && isOpen && (
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search by name, phone, email..." value={customerSearch} onChange={(e) => handleCustomerSearch(e.target.value)} style={{ ...inputStyle, width: '100%' }} autoComplete="off" />
                {customerResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {customerResults.map(c => (
                      <div key={c.id} onClick={() => selectCustomer(c)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                        <strong>{c.last_name}{c.first_name ? ', ' + c.first_name : ''}</strong>
                        <span style={{ color: '#6b7280', marginLeft: '8px' }}>{c.phone_primary || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {customerMode === 'walkin' && isOpen && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Customer name (optional)" value={walkinName} onChange={(e) => setWalkinName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={saveWalkinName} style={btnSmall}>Save</button>
              </div>
            )}
            {!isOpen && <span style={{ color: '#6b7280' }}>{sale.customer_name || 'Walk-in'}</span>}
          </div>
        )}
      </div>

      {/* Parts Lines */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Parts</h3>
          {isOpen && !showAddLine && (
            <button onClick={() => { setShowAddLine(true); resetLineForm(); }} style={btnSmallPrimary}>+ Add Part</button>
          )}
        </div>

        {/* Add line form */}
        {showAddLine && isOpen && (
          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <input type="text" placeholder="Search inventory..." value={invSearch} onChange={(e) => handleInvSearch(e.target.value)} style={{ ...inputStyle, width: '100%' }} autoComplete="off" />
              {invResults.length > 0 && (
                <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', backgroundColor: '#fff', marginTop: '4px' }}>
                  {invResults.map(item => (
                    <div key={item.id} onClick={() => selectInvItem(item)} style={{ padding: '6px 10px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem' }}>
                      <strong>{item.part_number}</strong> — {item.description}
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>{formatCurrency(item.sale_price_each)} ({item.qty_on_hand} in stock)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 70px 100px', gap: '8px', marginBottom: '8px' }}>
              <input type="text" placeholder="Part #" value={lineForm.part_number} onChange={(e) => setLineForm({ ...lineForm, part_number: e.target.value })} style={inputStyle} />
              <input type="text" placeholder="Description" value={lineForm.description} onChange={(e) => setLineForm({ ...lineForm, description: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Qty" value={lineForm.quantity} onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })} style={inputStyle} min="1" />
              <input type="number" step="0.01" placeholder="Price" value={lineForm.unit_price} onChange={(e) => setLineForm({ ...lineForm, unit_price: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddLine} disabled={saving} style={btnSmallPrimary}>{saving ? 'Adding...' : 'Add'}</button>
              <button onClick={() => { setShowAddLine(false); resetLineForm(); }} style={btnSmall}>Cancel</button>
            </div>
          </div>
        )}

        {/* Lines table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Part #</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              {isOpen && <th style={{ ...thStyle, width: '80px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr><td colSpan={isOpen ? 6 : 5} style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>No parts added yet</td></tr>
            )}
            {lines.map(line => (
              editingLineId === line.id ? (
                <tr key={line.id} style={{ backgroundColor: '#fffbeb' }}>
                  <td style={tdStyle}><input type="text" value={lineForm.part_number} onChange={(e) => setLineForm({ ...lineForm, part_number: e.target.value })} style={{ ...inputStyle, width: '80px' }} /></td>
                  <td style={tdStyle}><input type="text" value={lineForm.description} onChange={(e) => setLineForm({ ...lineForm, description: e.target.value })} style={{ ...inputStyle, width: '100%' }} /></td>
                  <td style={tdStyle}><input type="number" value={lineForm.quantity} onChange={(e) => setLineForm({ ...lineForm, quantity: e.target.value })} style={{ ...inputStyle, width: '60px', textAlign: 'right' }} min="1" /></td>
                  <td style={tdStyle}><input type="number" step="0.01" value={lineForm.unit_price} onChange={(e) => setLineForm({ ...lineForm, unit_price: e.target.value })} style={{ ...inputStyle, width: '80px', textAlign: 'right' }} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency((parseInt(lineForm.quantity) || 0) * (parseFloat(lineForm.unit_price) || 0))}</td>
                  <td style={tdStyle}>
                    <button onClick={handleSaveEditLine} disabled={saving} style={{ ...btnSmallPrimary, marginRight: '4px' }}>Save</button>
                    <button onClick={() => { setEditingLineId(null); resetLineForm(); }} style={btnSmall}>X</button>
                  </td>
                </tr>
              ) : (
                <tr key={line.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{line.part_number || ''}</td>
                  <td style={tdStyle}>{line.description}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{line.quantity}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.unit_price)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(line.line_total)}</td>
                  {isOpen && (
                    <td style={tdStyle}>
                      <button onClick={() => startEditLine(line)} style={{ ...btnSmall, marginRight: '4px' }}>Edit</button>
                      <button onClick={() => handleDeleteLine(line.id)} style={{ ...btnSmall, color: '#dc2626' }}>X</button>
                    </td>
                  )}
                </tr>
              )
            ))}
            {lines.length > 0 && (
              <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                <td colSpan={isOpen ? 4 : 3} style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>Parts Subtotal</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(sale.subtotal)}</td>
                {isOpen && <td></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Totals</h3>
        <div style={{ maxWidth: '350px', marginLeft: 'auto' }}>
          <div style={totalsRow}><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
          <div style={totalsRow}><span>Tax ({(parseFloat(sale.tax_rate) * 100).toFixed(2)}%)</span><span>{formatCurrency(sale.tax_amount)}</span></div>
          <div style={totalsRow}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isOpen ? 'pointer' : 'default' }}>
              {isOpen && <input type="checkbox" checked={sale.cc_fee_applied} onChange={toggleCcFee} />}
              CC Fee (3%)
            </label>
            <span>{sale.cc_fee_applied ? formatCurrency(sale.cc_fee_amount) : 'N/A'}</span>
          </div>

          {/* Discount */}
          <div style={totalsRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Discount
              {isOpen && !editingDiscount && (
                <button onClick={() => { setEditingDiscount(true); setDiscountForm({ amount: sale.discount_amount || '', description: sale.discount_description || '' }); }} style={{ ...btnSmall, fontSize: '0.7rem', padding: '1px 6px' }}>Edit</button>
              )}
            </span>
            <span>{parseFloat(sale.discount_amount) > 0 ? `-${formatCurrency(sale.discount_amount)}` : '$0.00'}</span>
          </div>
          {sale.discount_description && !editingDiscount && (
            <div style={{ ...totalsRow, fontSize: '0.75rem', color: '#6b7280', paddingLeft: '16px' }}><span>{sale.discount_description}</span></div>
          )}
          {editingDiscount && (
            <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px', marginBottom: '4px' }}>
              <input type="number" step="0.01" placeholder="Amount" value={discountForm.amount} onChange={(e) => setDiscountForm({ ...discountForm, amount: e.target.value })} style={{ ...inputStyle, width: '100px', marginRight: '8px' }} />
              <input type="text" placeholder="Description" value={discountForm.description} onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })} style={{ ...inputStyle, width: '150px', marginRight: '8px' }} />
              <button onClick={saveDiscount} style={btnSmallPrimary}>Save</button>
              <button onClick={() => setEditingDiscount(false)} style={{ ...btnSmall, marginLeft: '4px' }}>Cancel</button>
            </div>
          )}

          <div style={{ ...totalsRow, borderTop: '2px solid #1e3a5f', paddingTop: '8px', marginTop: '4px', fontWeight: 700, fontSize: '1.1rem' }}>
            <span>TOTAL</span><span>{formatCurrency(sale.total_amount)}</span>
          </div>
          {parseFloat(sale.amount_paid) > 0 && (
            <div style={totalsRow}><span>Paid</span><span>{formatCurrency(sale.amount_paid)}</span></div>
          )}
          <div style={{ ...totalsRow, fontWeight: 700, color: parseFloat(sale.amount_due) > 0 ? '#dc2626' : '#065f46' }}>
            <span>AMOUNT DUE</span><span>{formatCurrency(sale.amount_due)}</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {isOpen && parseFloat(sale.amount_due) > 0 && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Payment</h3>
            {!showPayment && (
              <button onClick={() => { setShowPayment(true); setPayForm({ ...payForm, amount: parseFloat(sale.amount_due).toFixed(2) }); }} style={btnSmallPrimary}>Record Payment</button>
            )}
          </div>
          {showPayment && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={labelStyle}>Method</label>
                <select value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })} style={inputStyle}>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Card</option>
                  <option value="zelle">Zelle</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Reference #</label>
                <input type="text" placeholder="Check # etc." value={payForm.payment_reference} onChange={(e) => setPayForm({ ...payForm, payment_reference: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
              </div>
              <div>
                <label style={labelStyle}>Amount</label>
                <input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} style={{ ...inputStyle, width: '120px' }} />
              </div>
              <button onClick={handlePayment} disabled={saving} style={btnPrimary}>{saving ? 'Processing...' : 'Record Payment'}</button>
              <button onClick={() => setShowPayment(false)} style={btnSmall}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button onClick={handlePrint} style={btnSecondary}>Print Receipt</button>
        {isOpen && <button onClick={handleVoid} style={{ ...btnSecondary, color: '#dc2626', borderColor: '#fca5a5' }}>Void Sale</button>}
      </div>
    </div>
  );
}

function statusBadge(status) {
  const colors = { open: { bg: '#fef3c7', color: '#92400e' }, paid: { bg: '#d1fae5', color: '#065f46' }, void: { bg: '#fee2e2', color: '#991b1b' } };
  const c = colors[status] || colors.open;
  return (
    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: c.bg, color: c.color, textTransform: 'uppercase' }}>
      {status}
    </span>
  );
}

const btnPrimary = { padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnSmall = { padding: '4px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' };
const btnSmallPrimary = { padding: '4px 10px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 };
const btnLink = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: 0 };
const inputStyle = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', boxSizing: 'border-box' };
const sectionStyle = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' };
const sectionTitle = { fontSize: '0.9rem', fontWeight: 700, color: '#1e3a5f', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' };
const thStyle = { padding: '8px 10px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' };
const tdStyle = { padding: '8px 10px', fontSize: '0.875rem' };
const totalsRow = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.875rem' };
const errorStyle = { padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca' };
