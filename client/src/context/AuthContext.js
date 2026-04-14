import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if token exists in localStorage (persists across tab/app closes; JWT 10h expiry governs session length)
  useEffect(() => {
    const savedToken = localStorage.getItem('erp_token');
    if (savedToken) {
      api.setToken(savedToken);
      setToken(savedToken);
      // Validate token by fetching user info
      api.getMe()
        .then(u => { setUser(u); setLoading(false); })
        .catch(() => {
          localStorage.removeItem('erp_token');
          api.setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    api.setToken(data.token);
    localStorage.setItem('erp_token', data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('erp_token');
  }, []);

  // Auto-refresh token to keep session alive during active work days.
  // Refreshes every 9 hours (before the 10h server-side expiry).
  useEffect(() => {
    if (!token) return;
    const REFRESH_INTERVAL = 9 * 60 * 60 * 1000; // 9 hours in ms
    const interval = setInterval(async () => {
      try {
        const data = await api.refreshToken();
        setToken(data.token);
        api.setToken(data.token);
        localStorage.setItem('erp_token', data.token);
      } catch {
        // Token expired or invalid — will be caught by 401 handler
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [token]);

  // Role check helpers
  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const isBookkeeper = user?.role === 'bookkeeper';
  const isServiceWriter = user?.role === 'service_writer';

  // Can this user see financial data (dollar amounts)?
  const canSeeFinancials = isAdmin || isServiceWriter || isBookkeeper || isTechnician;

  // Can this user edit records (labor/parts/status/fields)?
  const canEditRecords = isAdmin || isServiceWriter || isTechnician;

  // Can this user post payments?
  const canPostPayments = isAdmin || isServiceWriter || isBookkeeper || isTechnician;

  // Can this user manage users?
  const canManageUsers = isAdmin;

  // Can this user manage settings (QB connection)?
  const canManageSettings = isAdmin;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      hasRole, isAdmin, isTechnician, isBookkeeper, isServiceWriter,
      canSeeFinancials, canEditRecords, canPostPayments, canManageUsers, canManageSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
