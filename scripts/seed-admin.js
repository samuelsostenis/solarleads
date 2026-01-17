#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@solarleads.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

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
    console.log('Connected to database for seeding admin');

    // Ensure users table exists (idempotent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const res = await client.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    if (res.rows.length > 0) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      await client.end();
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

    await client.query(
      `INSERT INTO users(email, password_hash, name, role) VALUES($1, $2, $3, 'admin')`,
      [ADMIN_EMAIL, hash, ADMIN_NAME]
    );

    console.log(`Created admin user: ${ADMIN_EMAIL} (password from ADMIN_PASSWORD env variable)`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Seeding admin failed:', err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

run();
