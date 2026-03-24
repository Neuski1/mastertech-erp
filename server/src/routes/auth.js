const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { requireAuth, requireRole, JWT_SECRET, JWT_EXPIRY } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// POST /api/auth/login — Authenticate user, return JWT
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: payload,
    });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout — No-op (JWT is stateless, client discards token)
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me — Return current user info from JWT
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/seed-admin — Create initial admin user (one-time setup)
// Only works if no admin user exists yet
// ---------------------------------------------------------------------------
router.post('/seed-admin', async (req, res) => {
  try {
    // Check if any admin exists
    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1"
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [name, email.toLowerCase().trim(), hash]
    );

    res.status(201).json({ message: 'Admin user created', user: rows[0] });
  } catch (err) {
    console.error('POST /api/auth/seed-admin error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// User Management (admin only)
// ---------------------------------------------------------------------------

// GET /api/auth/users — List all users
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users WHERE deleted_at IS NULL
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/users — Create a new user
router.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required' });
  }

  const validRoles = ['admin', 'service_writer', 'technician', 'bookkeeper'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email.toLowerCase().trim(), hash, role]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    console.error('POST /api/auth/users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/users/:id — Update user (name, email, role, is_active, password)
router.patch('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, role, is_active, password } = req.body;

  const updates = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { updates.push(`email = $${idx++}`); values.push(email.toLowerCase().trim()); }
  if (role !== undefined) {
    const validRoles = ['admin', 'service_writer', 'technician', 'bookkeeper'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role` });
    }
    updates.push(`role = $${idx++}`);
    values.push(role);
  }
  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    updates.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING id, name, email, role, is_active, created_at`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id — Soft delete user
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  // Prevent deleting yourself
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE users SET deleted_at = NOW(), is_active = FALSE
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name, email`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
