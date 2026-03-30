/**
 * One-time script: Update admin credentials + create shared technician login.
 *
 * Usage:
 *   node server/scripts/setup-users.js
 *
 * Reads DATABASE_URL from .env in project root.
 * Generates strong passwords and prints them ONCE to the terminal.
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

function generatePassword(length = 16) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  let pw = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pw += chars[bytes[i] % chars.length];
  }
  return pw;
}

async function main() {
  const client = await pool.connect();

  try {
    // ── 1. Update admin credentials ──────────────────────────────────
    const adminPassword = generatePassword();
    const adminHash = await bcrypt.hash(adminPassword, 10);

    const { rows: adminRows } = await client.query(
      `UPDATE users
         SET password_hash = $1,
             email = 'carol@mastertechrvrepair.com',
             updated_at = NOW()
       WHERE role = 'admin' AND deleted_at IS NULL
       RETURNING id, name, email, role`,
      [adminHash]
    );

    if (adminRows.length === 0) {
      console.log('⚠  No admin user found — creating one...');
      const { rows: newAdmin } = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Carol', $1, $2, 'admin')
         RETURNING id, name, email, role`,
        ['carol@mastertechrvrepair.com', adminHash]
      );
      console.log('   Created admin:', newAdmin[0]);
    } else {
      console.log('   Updated admin:', adminRows[0]);
    }

    console.log('');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│  ADMIN LOGIN                                    │');
    console.log('│  Email:    carol@mastertechrvrepair.com          │');
    console.log(`│  Password: ${adminPassword.padEnd(37)}│`);
    console.log('└─────────────────────────────────────────────────┘');
    console.log('');

    // ── 2. Create shared technician account ──────────────────────────
    const techPassword = generatePassword();
    const techHash = await bcrypt.hash(techPassword, 10);

    // Check if technician account already exists
    const { rows: existingTech } = await client.query(
      `SELECT id FROM users WHERE email = 'tech@mastertechrvrepair.com' AND deleted_at IS NULL`
    );

    if (existingTech.length > 0) {
      // Update existing
      await client.query(
        `UPDATE users SET password_hash = $1, name = 'Tech Team', is_active = TRUE, updated_at = NOW()
         WHERE email = 'tech@mastertechrvrepair.com' AND deleted_at IS NULL`,
        [techHash]
      );
      console.log('   Updated existing technician account');
    } else {
      const { rows: techRows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ('Tech Team', 'tech@mastertechrvrepair.com', $1, 'technician', TRUE)
         RETURNING id, name, email, role`,
        [techHash]
      );
      console.log('   Created technician:', techRows[0]);
    }

    console.log('');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│  TECHNICIAN LOGIN (shared by all techs)         │');
    console.log('│  Email:    tech@mastertechrvrepair.com           │');
    console.log(`│  Password: ${techPassword.padEnd(37)}│`);
    console.log('└─────────────────────────────────────────────────┘');
    console.log('');
    console.log('Copy these passwords now — they will NOT be shown again.');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
