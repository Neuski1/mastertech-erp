-- ============================================================================
-- Migration 005: Seed initial admin user
-- Password: admin123 (change immediately after first login)
-- bcrypt hash generated with 10 rounds
-- ============================================================================

-- The password_hash below is for 'admin123' — MUST be changed on first use.
-- We cannot generate bcrypt in plain SQL, so this will be inserted via the
-- server's seed script or manually. This migration is a placeholder reminder.

-- To create the admin user, run the server seed endpoint or use:
-- POST /api/auth/seed-admin
-- This will only work if no admin user exists yet.
