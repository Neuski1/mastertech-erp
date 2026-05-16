require('dotenv').config();
const pool = require('./src/db/pool');
const fs = require('fs');
const sql = fs.readFileSync('../database/migrations/043_estimate_sections.sql', 'utf8');
pool.query(sql)
  .then(() => { console.log('Migration 043 complete'); pool.end(); })
  .catch(e => { console.error('ERR:', e.message); pool.end(); });
