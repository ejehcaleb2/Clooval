#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const env = process.env.DATABASE_URL || require('dotenv').config().parsed && require('dotenv').config().parsed.DATABASE_URL;
if (!env) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: env });

async function main() {
  const sqlPath = path.join(process.cwd(), 'db', 'create_tables.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('create_tables.sql not found');
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Migrations applied successfully');
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
