/**
 * Nightly production database backup to OneDrive.
 *
 * Usage:  node scripts/backup-db.js
 *
 * Reads PRODUCTION_DATABASE_URL from .env, runs pg_dump,
 * compresses to .gz, saves to OneDrive, prunes old backups.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Config ──────────────────────────────────────────────────────────────────
const BACKUP_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\servi', 'OneDrive', 'MasterTech ERP Backups');
const MAX_BACKUPS = 30;

function log(msg) {
  const ts = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
  console.log(`[${ts}] ${msg}`);
}

async function run() {
  // Load .env
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  }

  const dbUrl = process.env.PRODUCTION_DATABASE_URL;
  if (!dbUrl) {
    log('ERROR: PRODUCTION_DATABASE_URL not set');
    process.exit(1);
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`Created backup directory: ${BACKUP_DIR}`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const sqlFile = path.join(BACKUP_DIR, `mastertech-erp-backup-${dateStr}.sql`);
  const gzFile = sqlFile + '.gz';

  log('Starting database backup...');

  try {
    // Export via node pg — avoids pg_dump version mismatch (local v16, Railway v18)
    const { Pool } = require('pg');
    const backupPool = new Pool({ connectionString: dbUrl });

    // Get all table names
    const { rows: tables } = await backupPool.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );

    let sql = '-- Master Tech ERP Database Backup\n';
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += '-- Source: PRODUCTION_DATABASE_URL\n\n';
    sql += 'BEGIN;\n\n';

    for (const { tablename } of tables) {
      // Get column info
      const { rows: cols } = await backupPool.query(
        "SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
        [tablename]
      );

      // Get row data
      const { rows: data } = await backupPool.query(`SELECT * FROM "${tablename}"`);

      sql += `-- Table: ${tablename} (${data.length} rows)\n`;

      if (data.length > 0) {
        const colNames = cols.map(c => `"${c.column_name}"`).join(', ');
        for (const row of data) {
          const values = cols.map(c => {
            const val = row[c.column_name];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (typeof val === 'number') return String(val);
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sql += `INSERT INTO "${tablename}" (${colNames}) VALUES (${values});\n`;
        }
      }
      sql += '\n';
    }

    // Get sequences
    const { rows: seqs } = await backupPool.query(
      "SELECT sequencename, last_value FROM pg_sequences WHERE schemaname = 'public'"
    );
    for (const seq of seqs) {
      if (seq.last_value) {
        sql += `SELECT setval('"${seq.sequencename}"', ${seq.last_value});\n`;
      }
    }

    sql += '\nCOMMIT;\n';
    await backupPool.end();

    fs.writeFileSync(sqlFile, sql, 'utf8');

    const sqlSize = fs.statSync(sqlFile).size;
    log(`pg_dump complete: ${(sqlSize / 1024 / 1024).toFixed(2)} MB`);

    // Compress to .gz
    const input = fs.readFileSync(sqlFile);
    const compressed = zlib.gzipSync(input, { level: 9 });
    fs.writeFileSync(gzFile, compressed);
    fs.unlinkSync(sqlFile); // remove uncompressed

    const gzSize = fs.statSync(gzFile).size;
    const ratio = ((1 - gzSize / sqlSize) * 100).toFixed(0);
    log(`Compressed: ${(gzSize / 1024 / 1024).toFixed(2)} MB (${ratio}% reduction)`);
    log(`Saved to: ${gzFile}`);

    // Prune old backups — keep only the latest MAX_BACKUPS
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('mastertech-erp-backup-') && f.endsWith('.sql.gz'))
      .sort()
      .reverse();

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      for (const f of toDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
        log(`Pruned old backup: ${f}`);
      }
    }

    log(`Backup complete. ${files.length} backups on file (max ${MAX_BACKUPS}).`);
  } catch (err) {
    // Clean up partial files
    if (fs.existsSync(sqlFile)) fs.unlinkSync(sqlFile);
    if (fs.existsSync(gzFile)) fs.unlinkSync(gzFile);
    log(`BACKUP FAILED: ${err.message}`);
    process.exit(1);
  }
}

run();
