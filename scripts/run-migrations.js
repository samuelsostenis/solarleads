#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

async function ensureMigrationsTable(client) {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await client.query(createTableSql);
}

async function getAppliedMigrations(client) {
  const res = await client.query('SELECT filename FROM migrations');
  const set = new Set(res.rows.map(r => r.filename));
  return set;
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || process.env.DB_HOST,
    port: process.env.PGPORT || process.env.DB_PORT,
    user: process.env.PGUSER || process.env.DB_USER,
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
    database: process.env.PGDATABASE || process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);

    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping already-applied migration: ${file}`);
        continue;
      }

      const fullPath = path.join(MIGRATIONS_DIR, file);
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(fullPath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations(filename) VALUES($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied: ${file}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }

    console.log('Migrations completed');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.end(); } catch(e){}
    process.exit(1);
  }
}

run();
