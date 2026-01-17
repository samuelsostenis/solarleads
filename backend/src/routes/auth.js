const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../database');
const { generateToken, verifyTokenMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/auth');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Ensure users table exists
async function ensureUsersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    await ensureUsersTable();

    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at`,
      [email, hash, name, role]
    );

    const user = result.rows[0];
    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('Erro register:', err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    await ensureUsersTable();

    const result = await query('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token } });
  } catch (err) {
    console.error('Erro login:', err);
    res.status(500).json({ error: 'Erro ao autenticar usuário' });
  }
});

// GET /api/auth/me - retorna dados do usuário autenticado
router.get('/me', verifyTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro me:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

module.exports = router;
