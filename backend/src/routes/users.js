const express = require('express');
const router = express.Router();
const { query } = require('../database');

// GET /api/users - listar usuários (admin)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// PUT /api/users/:id/role - atualizar role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role é obrigatório' });

    const result = await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role', [role, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({ error: 'Erro ao atualizar role' });
  }
});

// DELETE /api/users/:id - deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ success: true, message: 'Usuário deletado' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

module.exports = router;
