import React from 'react';
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

  const roleLabelMap = {
    admin: 'Admin',
    service_writer: 'Service Writer',
    technician: 'Technician',
    bookkeeper: 'Bookkeeper',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1e3a5f', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: '56px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <Link to="/records" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.025em' }}>
          MASTER TECH ERP
        </Link>
        <nav style={{ marginLeft: '32px', display: 'flex', gap: '20px' }}>
          <Link to="/customers" style={navLink}>Customers</Link>
          <Link to="/records" style={navLink}>Records</Link>
          <Link to="/inventory" style={navLink}>Inventory</Link>
          <Link to="/schedule" style={navLink}>Schedule</Link>
          <Link to="/parts-sales" style={navLink}>Parts Sale</Link>
          <Link to="/storage" style={navLink}>Storage</Link>
          {canManageSettings && <Link to="/settings" style={navLink}>Settings</Link>}
          {canManageUsers && <Link to="/users" style={navLink}>Users</Link>}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <QBStatusDot />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {user?.name} <span style={{ opacity: 0.7 }}>({roleLabelMap[user?.role] || user?.role})</span>
            </span>
            <button onClick={logout} style={logoutBtn}>Logout</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
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
