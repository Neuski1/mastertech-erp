// ---------------------------------------------------------------------------
// Migration 066 — Business Settings: owner-editable configuration.
//
// Idempotent, like every other boot migration. It does three things:
//
//   1. Widens system_settings with the metadata the editor needs and the
//      stamp columns the audit trail needs.
//   2. Creates system_settings_audit — one row per change, never deleted.
//   3. Seeds every catalog entry. The critical detail: an existing
//      setting_value is NEVER overwritten. Only the metadata columns are
//      refreshed, so a redeploy cannot reset a rate Carol changed last week
//      back to the developer's default.
//
// Seeding uses the catalog's fallback, which is the same literal the code
// reads when the row is missing. So the first boot after this ships leaves
// every number exactly where it already was: nothing about the money changes
// on the deploy, only who can change it afterwards.
// ---------------------------------------------------------------------------

const { SETTINGS } = require('./settingsCatalog');

async function installBusinessSettings(pool) {
  try {
    // The table predates this feature and already exists in production, but
    // create it for a fresh database so a local clone boots clean.
    await pool.query(`CREATE TABLE IF NOT EXISTS system_settings (
      setting_key   VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      description   TEXT
    )`);

    await pool.query(`ALTER TABLE system_settings ALTER COLUMN setting_value TYPE TEXT`);
    await pool.query(`ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ`);
    await pool.query(`ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_by INTEGER`);
    await pool.query(`ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_by_name VARCHAR(255)`);

    await pool.query(`CREATE TABLE IF NOT EXISTS system_settings_audit (
      id               SERIAL PRIMARY KEY,
      setting_key      VARCHAR(100) NOT NULL,
      setting_label    VARCHAR(255),
      old_value        TEXT,
      new_value        TEXT,
      changed_by       INTEGER,
      changed_by_name  VARCHAR(255),
      changed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source           VARCHAR(20) NOT NULL DEFAULT 'edit',
      reverted_at      TIMESTAMPTZ,
      reverted_by      INTEGER,
      reverted_by_name VARCHAR(255)
    )`);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_settings_audit_key_time
         ON system_settings_audit (setting_key, changed_at DESC)`
    );

    // Seed. DO NOTHING on conflict: an existing value is the owner's, not ours.
    for (const def of SETTINGS) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, description)
              VALUES ($1, $2, $3)
         ON CONFLICT (setting_key) DO UPDATE
            SET description = EXCLUDED.description`,
        [def.key, String(def.fallback), def.help || def.label]
      );
    }

    console.log(`Migration 066 (business settings) ready — ${SETTINGS.length} settings seeded`);
  } catch (err) {
    console.error('Migration 066 error:', err.message);
  }
}

module.exports = { installBusinessSettings };
