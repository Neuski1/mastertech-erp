import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RecordList from './pages/RecordList';
import RecordDetail from './pages/RecordDetail';
import RecordNew from './pages/RecordNew';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';
import Schedule from './pages/Schedule';
import AppointmentForm from './pages/AppointmentForm';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Storage from './pages/Storage';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import PartsSalesList from './pages/PartsSalesList';
import PartsSaleDetail from './pages/PartsSaleDetail';
import CampaignList from './pages/CampaignList';
import CampaignEditor from './pages/CampaignEditor';
import Reports from './pages/Reports';
import ActiveWorkOrdersReport from './pages/ActiveWorkOrdersReport';
import QBStatusDot from './components/QBStatusDot';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppLayout() {
  const { user, logout, canManageUsers, canManageSettings } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const roleLabelMap = {
    admin: 'Admin',
    service_writer: 'Service Writer',
    technician: 'Technician',
    bookkeeper: 'Bookkeeper',
  };

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Track mobile breakpoint
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  // Nav links: all pages, always active and clickable
  const allNavLinks = [
    { to: '/customers', label: 'Customers' },
    { to: '/records', label: 'Records' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/parts-sales', label: 'Parts Sale' },
    { to: '/storage', label: 'Storage' },
    ...(canManageSettings ? [{ to: '/marketing', label: 'Marketing' }] : []),
    ...(canManageSettings ? [{ to: '/reports', label: 'Reports' }] : []),
    ...(canManageSettings ? [{ to: '/settings', label: 'Settings' }] : []),
    ...(canManageUsers ? [{ to: '/users', label: 'Users' }] : []),
  ];

  const mobileNavLinkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '14px 0',
    display: 'block',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    opacity: 1,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header — fixed to top on all screen sizes */}
      <header className="print-hide" style={{
        backgroundColor: '#1e3a5f',
        padding: isMobile ? '8px 12px' : '0 24px',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        flexWrap: 'wrap',
        minHeight: isMobile ? '48px' : '56px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{
              background: 'none', border: 'none', color: '#fff',
              fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px',
              lineHeight: 1, minHeight: '36px',
            }}
          >
            {mobileNavOpen ? '\u2715' : '\u2630'}
          </button>
        )}

        <Link to="/records" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.025em' }}>
          MASTER TECH ERP
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ marginLeft: '32px', display: 'flex', gap: '20px' }}>
            {allNavLinks.map(link => (
              <Link key={link.to} to={link.to} style={navLink}>{link.label}</Link>
            ))}
          </nav>
        )}

        <div className="header-user-info" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isMobile && <span className="qb-dot"><QBStatusDot /></span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isMobile && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {user?.name} <span style={{ opacity: 0.7 }}>({roleLabelMap[user?.role] || user?.role})</span>
              </span>
            )}
            <button onClick={logout} style={logoutBtn}>Logout</button>
          </div>
        </div>

        {/* Mobile nav drawer — full width below header row */}
        {isMobile && mobileNavOpen && (
          <nav style={{
            width: '100%',
            marginTop: '8px', paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            {allNavLinks.map(link => (
              <Link key={link.to} to={link.to} style={mobileNavLinkStyle} onClick={closeMobileNav}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Content — padded below fixed header */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', paddingTop: isMobile ? '60px' : '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/records" />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/records/new" element={<RecordNew />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/new" element={<InventoryForm />} />
          <Route path="/inventory/:id" element={<InventoryForm />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/schedule/new" element={<AppointmentForm />} />
          <Route path="/schedule/:id" element={<AppointmentForm />} />
          <Route path="/parts-sales" element={<PartsSalesList />} />
          <Route path="/parts-sales/:id" element={<PartsSaleDetail />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/marketing" element={canManageSettings ? <CampaignList /> : <Navigate to="/records" />} />
          <Route path="/marketing/new" element={canManageSettings ? <CampaignEditor /> : <Navigate to="/records" />} />
          <Route path="/marketing/:id" element={canManageSettings ? <CampaignEditor /> : <Navigate to="/records" />} />
          <Route path="/reports" element={canManageSettings ? <Reports /> : <Navigate to="/records" />} />
          <Route path="/reports/active-workorders" element={<ActiveWorkOrdersReport />} />
          <Route path="/settings" element={canManageSettings ? <Settings /> : <Navigate to="/records" />} />
          <Route path="/users" element={canManageUsers ? <UserManagement /> : <Navigate to="/records" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  if (user) return <Navigate to="/records" replace />;
  return <Login />;
}

const navLink = {
  color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem',
  fontWeight: 500, padding: '4px 0', borderBottom: '2px solid transparent',
};

const logoutBtn = {
  padding: '4px 12px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#cbd5e1',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.75rem',
};

export default App;
