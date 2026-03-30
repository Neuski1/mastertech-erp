/**
 * One-time script: Update admin credentials + create shared technician login.
 *
 * Usage:
 *   railway run node server/scripts/setup-users.js
 *
 * Connects to DATABASE_URL (set by Railway environment).
 * Generates strong passwords and prints them ONCE to the terminal.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function generatePassword() {
  return crypto.randomBytes(12).toString('base64');
}

async function main() {
  const client = await pool.connect();

  try {
    // ── 1. Update admin account ─────────────────────────────────────
    const adminPassword = generatePassword();
    const adminHash = await bcrypt.hash(adminPassword, 10);

    const { rows: adminRows } = await client.query(
      `UPDATE users
         SET email = 'carol@mastertechrvrepair.com',
             password_hash = $1,
             updated_at = NOW()
       WHERE email = 'admin@mastertechrvrepair.com' AND deleted_at IS NULL
       RETURNING id, name, email, role`,
      [adminHash]
    );

    if (adminRows.length === 0) {
      // Try finding by role if email doesn't match
      const { rows: byRole } = await client.query(
        `UPDATE users
           SET email = 'carol@mastertechrvrepair.com',
               password_hash = $1,
               updated_at = NOW()
         WHERE role = 'admin' AND deleted_at IS NULL
         RETURNING id, name, email, role`,
        [adminHash]
      );

      if (byRole.length === 0) {
        console.log('No admin user found — creating one...');
        await client.query(
          `INSERT INTO users (name, email, password_hash, role, is_active)
           VALUES ('Carol', 'carol@mastertechrvrepair.com', $1, 'admin', TRUE)`,
          [adminHash]
        );
      } else {
        console.log('Updated admin (found by role):', byRole[0]);
      }
    } else {
      console.log('Updated admin:', adminRows[0]);
    }

    // ── 2. Create shared technician account ─────────────────────────
    const techPassword = generatePassword();
    const techHash = await bcrypt.hash(techPassword, 10);

    const { rows: existingTech } = await client.query(
      `SELECT id FROM users WHERE email = 'tech@mastertechrvrepair.com' AND deleted_at IS NULL`
    );

    if (existingTech.length > 0) {
      await client.query(
        `UPDATE users SET password_hash = $1, name = 'Tech Team', is_active = TRUE, updated_at = NOW()
         WHERE email = 'tech@mastertechrvrepair.com' AND deleted_at IS NULL`,
        [techHash]
      );
      console.log('Updated existing technician account');
    } else {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ('Tech Team', 'tech@mastertechrvrepair.com', $1, 'technician', TRUE)`,
        [techHash]
      );
      console.log('Created technician account');
    }

    // ── 3. Display credentials ──────────────────────────────────────
    console.log('');
    console.log('================================');
    console.log('ADMIN LOGIN:');
    console.log('  Email:    carol@mastertechrvrepair.com');
    console.log('  Password: ' + adminPassword);
    console.log('');
    console.log('TECHNICIAN LOGIN:');
    console.log('  Email:    tech@mastertechrvrepair.com');
    console.log('  Password: ' + techPassword);
    console.log('');
    console.log('SAVE THESE NOW — they will not be shown again.');
    console.log('================================');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
