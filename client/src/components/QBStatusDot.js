import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function QBStatusDot() {
  const [connected, setConnected] = useState(null);
  const { canManageSettings } = useAuth();

  useEffect(() => {
    api.qbGetStatus()
      .then(s => setConnected(s.connected))
      .catch(() => setConnected(false));
  }, []);

  if (connected === null) return null;

  const dot = (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={connected ? 'QuickBooks: Connected' : 'QuickBooks: Not Connected'}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        backgroundColor: connected ? '#22c55e' : '#ef4444',
        display: 'inline-block',
      }} />
      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>QB</span>
    </span>
  );

  if (canManageSettings) {
    return <Link to="/settings" style={{ textDecoration: 'none' }}>{dot}</Link>;
  }

  return dot;
}
