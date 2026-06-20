const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const env = process.env.DATABASE_URL;
if (!env) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: env });

async function applySql(relativePath) {
  const sqlPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log(`Applied ${relativePath}`);
  } catch (err) {
    console.error(`Failed to apply ${relativePath}:`, err.message || err);
    process.exit(1);
  }
}

async function main() {
  try {
    await applySql(path.join('db', 'add_request_hash.sql'));
    await applySql(path.join('db', 'add_push_subscriptions.sql'));
    console.log('All migrations applied');
  } finally {
    await pool.end();
  }
}

main();
