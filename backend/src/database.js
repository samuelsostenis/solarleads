require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

// Configuração do Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'solarleads',
  user: process.env.DB_USER || 'solarleads',
  password: process.env.DB_PASSWORD || 'samuel',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Eventos do Pool
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro PostgreSQL:', err);
});

// Testar conexão ao iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao testar conexão:', err.message);
  } else {
    console.log('✅ PostgreSQL funcionando! Hora do servidor:', res.rows[0].now);
  }
});

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG === 'true') {
      console.log(`⚡ Query em ${duration}ms`);
    }
    return result;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    throw error;
  }
};

module.exports = { pool, query };