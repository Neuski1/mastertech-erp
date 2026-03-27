import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import VendorSelect from '../components/VendorSelect';

const LOCATIONS = ['Front Closet', 'Back Room', 'Shop', 'unassigned'];


const emptyForm = {
  part_number: '',
  description: '',
  vendor: '',
  vendor_part_number: '',
  category: '',
  location: 'unassigned',
  qty_on_hand: '0',
  reorder_level: '',
  cost_each: '',
  sale_price_each: '',
};

export default function InventoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [fetchingPartNum, setFetchingPartNum] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.getInventoryCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const item = await api.getInventoryItem(id);
        setForm({
          part_number: item.part_number || '',
          description: item.description || '',
          vendor: item.vendor || '',
          vendor_part_number: item.vendor_part_number || '',
          category: item.category || '',
          location: item.location || 'unassigned',
          qty_on_hand: item.qty_on_hand != null ? String(item.qty_on_hand) : '0',
          reorder_level: item.reorder_level != null ? String(item.reorder_level) : '',
          cost_each: item.cost_each != null ? String(item.cost_each) : '',
          sale_price_each: item.sale_price_each != null ? String(item.sale_price_each) : '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;
    setForm(f => ({ ...f, category: newCategory }));

    // Auto-fetch next part number for new items only
    if (!isEdit && newCategory) {
      setFetchingPartNum(true);
      try {
        const result = await api.getNextPartNumber(newCategory);
        setForm(f => ({ ...f, part_number: result.part_number }));
      } catch (err) {
        console.error('Failed to fetch next part number:', err);
      } finally {
        setFetchingPartNum(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...form,
        qty_on_hand: form.qty_on_hand !== '' ? parseFloat(form.qty_on_hand) : 0,
        reorder_level: form.reorder_level !== '' ? parseFloat(form.reorder_level) : null,
        cost_each: form.cost_each !== '' ? parseFloat(form.cost_each) : null,
        sale_price_each: parseFloat(form.sale_price_each),
        vendor: form.vendor || null,
        vendor_part_number: form.vendor_part_number || null,
        category: form.category || null,
      };

      if (isEdit) {
        await api.updateInventoryItem(id, payload);
      } else {
        await api.createInventoryItem(payload);
      }

      navigate('/inventory');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteInventoryItem(id);
      navigate('/inventory');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/inventory')} style={linkBtn}>
        &larr; Back to Inventory
      </button>

      <div style={card}>
        <h1 style={{ margin: '0 0 24px 0' }}>
          {isEdit ? 'Edit Part' : 'New Part'}
        </h1>

        {error && (
          <div style={errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Category and Part # */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                style={inputStyle}
              >
                <option value="">-- Select --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.prefix}>{c.name} ({c.prefix})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '0 0 220px' }}>
              <label style={labelStyle}>Part Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="part_number"
                  value={form.part_number}
                  onChange={handleChange}
                  placeholder={!isEdit ? 'Select a category to auto-assign' : 'Part number'}
                  style={{
                    ...inputStyle,
                    backgroundColor: fetchingPartNum ? '#f3f4f6' : undefined,
                  }}
                />
                {fetchingPartNum && (
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#9ca3af' }}>...</span>
                )}
              </div>
              {!isEdit && (
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                  Auto-assigned based on category. You may override if needed.
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Description */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Description *</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 3: Vendor Part # */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Vendor / Mfr Part #</label>
              <input
                name="vendor_part_number"
                value={form.vendor_part_number}
                onChange={handleChange}
                placeholder="Manufacturer or vendor part number"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 4: Vendor, Location */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Vendor</label>
              <VendorSelect value={form.vendor} onChange={(v) => setForm(f => ({ ...f, vendor: v }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                style={inputStyle}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Qty, Reorder Level */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Qty on Hand</label>
              <input
                name="qty_on_hand"
                type="number"
                step="0.01"
                min="0"
                value={form.qty_on_hand}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Reorder Level</label>
              <input
                name="reorder_level"
                type="number"
                step="1"
                min="0"
                value={form.reorder_level}
                onChange={handleChange}
                placeholder="0 (enter minimum stock threshold)"
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'block' }}>
                Set to 1 or more to enable low stock alerts for this item. Leave at 0 for no alert.
              </span>
            </div>
          </div>

          {/* Row 6: Cost, Sale Price */}
          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cost Each ($)</label>
              <input
                name="cost_each"
                type="number"
                step="0.01"
                min="0"
                value={form.cost_each}
                onChange={handleChange}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sale Price Each ($) *</label>
              <input
                name="sale_price_each"
                type="number"
                step="0.01"
                min="0"
                value={form.sale_price_each}
                onChange={handleChange}
                required
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Margin preview */}
          {form.cost_each && form.sale_price_each && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
              Margin: ${(parseFloat(form.sale_price_each) - parseFloat(form.cost_each)).toFixed(2)}
              {' '}({((1 - parseFloat(form.cost_each) / parseFloat(form.sale_price_each)) * 100).toFixed(1)}%)
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : isEdit ? 'Update Part' : 'Create Part'}
            </button>
            <button type="button" onClick={() => navigate('/inventory')} style={btnSecondary}>
              Cancel
            </button>

            {isEdit && (
              <div style={{ marginLeft: 'auto' }}>
                {showDelete ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#dc2626' }}>Delete this part?</span>
                    <button type="button" onClick={handleDelete} style={btnDanger}>Yes, Delete</button>
                    <button type="button" onClick={() => setShowDelete(false)} style={btnSecondary}>No</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowDelete(true)} style={btnDangerOutline}>
                    Delete Part
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const card = {
  backgroundColor: '#fff', borderRadius: '8px', padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '12px',
};
const row = {
  display: 'flex', gap: '16px', marginBottom: '16px',
};
const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em',
};
const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '6px', fontSize: '0.875rem', outline: 'none',
};
const linkBtn = {
  background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
  fontSize: '0.875rem', padding: '0', marginBottom: '8px',
};
const errorBox = {
  padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626',
  borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem',
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#1e3a5f', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnSecondary = {
  padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
const btnDanger = {
  padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
const btnDangerOutline = {
  padding: '8px 16px', backgroundColor: 'transparent', color: '#dc2626',
  border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};
