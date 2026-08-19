/**
 * Nightly production database backup to OneDrive.
 *
 * Usage:  node scripts/backup-db.js
 *
 * Downloads a full gzipped SQL dump from the ERP's backup endpoint (which runs
 * with Railway's always-current DATABASE_URL), saves it to OneDrive, prunes old
 * backups. No local database password needed, so a rotated Postgres password
 * can never break the nightly backup again (it silently failed June 4 through
 * August 19, 2026 for exactly that reason).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const BACKUP_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\servi', 'OneDrive', 'MasterTech ERP Backups');
const MAX_BACKUPS = 30;
const BACKUP_URL = 'https://mastertech-erp-production.up.railway.app/api/cowork-admin/db-backup';

function log(msg) {
  const ts = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
  console.log(`[${ts}] ${msg}`);
}

function fetchBackup(url, key) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'X-Cowork-Key': key }, timeout: 300000 }, (res) => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`)));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Backup download timed out')); });
    req.on('error', reject);
  });
}

async function run() {
  // Load .env for COWORK_API_KEY
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  }

  const key = process.env.COWORK_API_KEY;
  if (!key) {
    log('ERROR: COWORK_API_KEY not set in .env');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`Created backup directory: ${BACKUP_DIR}`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const gzFile = path.join(BACKUP_DIR, `mastertech-erp-backup-${dateStr}.sql.gz`);

  log('Starting database backup (server-side dump)...');

  try {
    const gz = await fetchBackup(BACKUP_URL, key);
    if (gz.length < 10000) {
      throw new Error(`Backup suspiciously small (${gz.length} bytes) — refusing to save`);
    }
    fs.writeFileSync(gzFile, gz);
    log(`Saved to: ${gzFile} (${(gz.length / 1024 / 1024).toFixed(2)} MB compressed)`);

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

    log(`Backup complete. ${Math.min(files.length, MAX_BACKUPS)} backups on file (max ${MAX_BACKUPS}).`);
  } catch (err) {
    if (fs.existsSync(gzFile)) fs.unlinkSync(gzFile);
    log(`BACKUP FAILED: ${err.message}`);
    process.exit(1);
  }
}

run();
