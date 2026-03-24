import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const ROLES = ['admin', 'service_writer', 'technician', 'bookkeeper'];

const ROLE_LABELS = {
  admin: 'Admin',
  service_writer: 'Service Writer',
  technician: 'Technician',
  bookkeeper: 'Bookkeeper',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'service_writer' });
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'service_writer' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const updates = { name: form.name, email: form.email, role: form.role };
        if (form.password) updates.password = form.password;
        await api.updateUser(editingId, updates);
        setActionMsg('User updated');
      } else {
        if (!form.password) { setError('Password is required for new users'); return; }
        await api.createUser(form);
        setActionMsg('User created');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
    setError('');
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'deactivate' : 'reactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
    try {
      await api.updateUser(user.id, { is_active: !user.is_active });
      setActionMsg(`User ${action}d`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(user.id);
      setActionMsg('User deleted');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>User Management</h1>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}>
            + New User
          </button>
        )}
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', color: '#065f46', borderRadius: '6px', marginBottom: '16px', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
          {actionMsg}
          <button onClick={() => setActionMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>x</button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e3a5f' }}>
            {editingId ? 'Edit User' : 'Create User'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={formGrid}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{editingId ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingId} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={btnPrimary}>{editingId ? 'Save Changes' : 'Create User'}</button>
              <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, width: '120px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={tdStyle}><strong>{u.name}</strong></td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>
                    <span style={roleBadge(u.role)}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: u.is_active ? '#065f46' : '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(u)} style={btnTiny}>Edit</button>
                    <button onClick={() => handleToggleActive(u)} style={btnTinyGray}>
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => handleDelete(u)} style={btnTinyDanger}>Del</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No users</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const ROLE_COLORS = {
  admin: { bg: '#dbeafe', color: '#1e40af' },
  service_writer: { bg: '#e0e7ff', color: '#3730a3' },
  technician: { bg: '#fef3c7', color: '#92400e' },
  bookkeeper: { bg: '#d1fae5', color: '#065f46' },
};

const roleBadge = (role) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '10px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: (ROLE_COLORS[role] || ROLE_COLORS.admin).bg,
  color: (ROLE_COLORS[role] || ROLE_COLORS.admin).color,
});

const cardStyle = {
  marginBottom: '20px', padding: '20px', backgroundColor: '#fff',
  borderRadius: '8px', border: '1px solid #e5e7eb',
};
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
const thStyle = { textAlign: 'left', padding: '10px 12px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' };
const btnPrimary = { padding: '8px 16px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' };
const btnTiny = { padding: '2px 8px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', marginRight: '4px' };
const btnTinyGray = { padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', marginRight: '4px' };
const btnTinyDanger = { padding: '2px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem' };
