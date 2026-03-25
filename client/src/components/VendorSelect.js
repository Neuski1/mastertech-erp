import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function VendorSelect({ value, onChange, style }) {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef();

  useEffect(() => {
    api.getVendors().then(setVendors).catch(() => {});
  }, []);

  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = vendors.some(v => v.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!query.trim() || creating) return;
    setCreating(true);
    try {
      const vendor = await api.createVendor(query.trim());
      setVendors(prev => [...prev, vendor].sort((a, b) => a.name.localeCompare(b.name)));
      handleSelect(vendor.name);
    } catch (err) {
      console.error('Create vendor error:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Type to search vendors..."
        style={style}
      />
      {open && query.length > 0 && (
        <div style={dropdownStyle}>
          {filtered.length > 0 ? (
            filtered.slice(0, 10).map(v => (
              <div key={v.id} onClick={() => handleSelect(v.name)} style={itemStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {v.name}
              </div>
            ))
          ) : (
            <div style={{ padding: '6px 10px', color: '#9ca3af', fontSize: '0.8rem' }}>No vendors found</div>
          )}
          {query.trim() && !exactMatch && (
            <div onClick={handleCreate} style={{ ...itemStyle, borderTop: '1px solid #e5e7eb', color: '#1e3a5f', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {creating ? 'Creating...' : `+ Add New Vendor: "${query.trim().toUpperCase()}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
  backgroundColor: '#fff', border: '1px solid #d1d5db', borderTop: 'none',
  borderRadius: '0 0 4px 4px', maxHeight: '200px', overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
const itemStyle = {
  padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem',
};
