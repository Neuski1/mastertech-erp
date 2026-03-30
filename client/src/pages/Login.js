import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#1e3a5f', margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            MASTER TECH
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.85rem' }}>
            RV Repair & Storage ERP
          </p>
        </div>

        {error && (
          <div style={errorStyle}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f3f4f6',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '40px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  border: '1px solid #e5e7eb',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#1e3a5f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const errorStyle = {
  padding: '10px 14px',
  backgroundColor: '#fee2e2',
  color: '#dc2626',
  borderRadius: '6px',
  fontSize: '0.85rem',
  marginBottom: '16px',
  border: '1px solid #fecaca',
};
