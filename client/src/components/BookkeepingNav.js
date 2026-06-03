import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/bookkeeping',                     label: 'Bank Connections' },
  { to: '/bookkeeping/journal-entries',     label: 'Journal Entries' },
  { to: '/bookkeeping/chart',               label: 'Chart of Accounts' },
  { to: '/bookkeeping/reports/pnl',         label: 'P&L Report' },
  { to: '/bookkeeping/reports/balance-sheet', label: 'Balance Sheet' },
];

export default function BookkeepingNav() {
  const loc = useLocation();
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #1a2a4a', paddingBottom: 0 }}>
      {links.map(l => {
        const isActive = loc.pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            style={{
              padding: '10px 18px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? '#fff' : '#1a2a4a',
              background: isActive ? '#1a2a4a' : '#f0f0f0',
              borderRadius: '6px 6px 0 0',
              border: '1px solid #d0d0d0',
              borderBottom: isActive ? 'none' : '1px solid #d0d0d0',
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
