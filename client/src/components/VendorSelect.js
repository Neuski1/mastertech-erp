import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function VendorSelect({ value, onChange, style }) {
  const [inventoryVendors, setInventoryVendors] = useState([]);
  const [miscVendors, setMiscVendors] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef();

  useEffect(() => {
    api.getVendors().then(v => setInventoryVendors(v || [])).catch(() => {});
    api.getVendorDetails().then(details => {
      const misc = (details || []).filter(d => d.supplier_type === 'misc');
      setMiscVendors(misc);
    }).catch(() => {});
  }, []);

  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Merge inventory vendors and misc suppliers into one list, deduped
  const allVendors = (() => {
    const nameSet = new Set();
    const merged = [];
    inventoryVendors.forEach(v => {
      const key = v.name.toLowerCase().trim();
      if (!nameSet.has(key)) { nameSet.add(key); merged.push({ name: v.name, type: 'inventory' }); }
    });
    miscVendors.forEach(v => {
      const key = (v.vendor_name || '').toLowerCase().trim();
      if (!nameSet.has(key)) { nameSet.add(key); merged.push({ name: v.vendor_name, type: 'misc' }); }
    });
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  })();

  const lowerQuery = query.toLowerCase();
  const filteredInventory = allVendors.filter(v => v.type === 'inventory' && v.name.toLowerCase().includes(lowerQuery));
  const filteredMisc = allVendors.filter(v => v.type === 'misc' && v.name.toLowerCase().includes(lowerQuery));
  const hasResults = filteredInventory.length > 0 || filteredMisc.length > 0;
  const exactMatch = allVendors.some(v => v.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleCreateMisc = async () => {
    if (!query.trim() || creating) return;
    setCreating(true);
    try {
      await api.updateVendorDetails(query.trim(), { supplier_type: 'misc' });
      const newMisc = { vendor_name: query.trim(), supplier_type: 'misc' };
      setMiscVendors(prev => [...prev, newMisc]);
      handleSelect(query.trim());
    } catch (err) {
      console.error('Create misc supplier error:', err);
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
        placeholder="Type to search suppliers..."
        style={style}
      />
      {open && query.length > 0 && (
        <div style={dropdownStyle}>
          {/* Inventory suppliers */}
          {filteredInventory.length > 0 && (
            <>
              <div style={sectionHeader}>Parts Suppliers</div>
              {filteredInventory.slice(0, 8).map(v => (
                <div key={v.name} onClick={() => handleSelect(v.name)} style={itemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  {v.name}
                </div>
              ))}
            </>
          )}

          {/* Misc suppliers */}
          {filteredMisc.length > 0 && (
            <>
              <div style={sectionHeader}>Misc Suppliers</div>
              {filteredMisc.slice(0, 8).map(v => (
                <div key={v.name} onClick={() => handleSelect(v.name)} style={itemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <span>{v.name}</span>
                  <span style={miscBadge}>misc</span>
                </div>
              ))}
            </>
          )}

          {!hasResults && (
            <div style={{ padding: '6px 10px', color: '#9ca3af', fontSize: '0.8rem' }}>No suppliers found</div>
          )}

          {/* Add new misc supplier option */}
          {query.trim() && !exactMatch && (
            <div onClick={handleCreateMisc} style={{ ...itemStyle, borderTop: '1px solid #e5e7eb', color: '#1e3a5f', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {creating ? 'Creating...' : `+ Add New Misc Supplier: "${query.trim()}"`}
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
  borderRadius: '0 0 4px 4px', maxHeight: '280px', overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};
const itemStyle = {
  padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const sectionHeader = {
  padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#6b7280',
  textTransform: 'uppercase', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb',
  letterSpacing: '0.05em',
};
const miscBadge = {
  fontSize: '0.6rem', fontWeight: 600, color: '#6366f1', backgroundColor: '#eef2ff',
  padding: '1px 6px', borderRadius: '3px',
};
