const express = require('express');
const router = express.Router();
const db = require('../database');
const verifyTokenMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// Listar automações
router.get('/', verifyTokenMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM automations ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM automations ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      automations: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erro ao listar automações:', error);
    res.status(500).json({ error: 'Erro ao listar automações' });
  }
});

// Buscar automação por ID
router.get('/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM automations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar automação:', error);
    res.status(500).json({ error: 'Erro ao buscar automação' });
  }
});

// Criar automação
router.post('/', verifyTokenMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, trigger_type, trigger_config, action_type, action_config, status } = req.body;

    if (!name || !trigger_type || !action_type) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await db.query(
      `INSERT INTO automations (name, trigger_type, trigger_config, action_type, action_config, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, trigger_type, trigger_config || {}, action_type, action_config || {}, status || 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar automação:', error);
    res.status(500).json({ error: 'Erro ao criar automação' });
  }
});

// Atualizar automação
router.put('/:id', verifyTokenMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, trigger_type, trigger_config, action_type, action_config, status } = req.body;

    const result = await db.query(
      `UPDATE automations 
       SET name = COALESCE($1, name),
           trigger_type = COALESCE($2, trigger_type),
           trigger_config = COALESCE($3, trigger_config),
           action_type = COALESCE($4, action_type),
           action_config = COALESCE($5, action_config),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, trigger_type, trigger_config, action_type, action_config, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar automação:', error);
    res.status(500).json({ error: 'Erro ao atualizar automação' });
  }
});

// Deletar automação
router.delete('/:id', verifyTokenMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM automations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automação não encontrada' });
    }

    res.json({ message: 'Automação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar automação:', error);
    res.status(500).json({ error: 'Erro ao deletar automação' });
  }
});

// Toggle status automação
router.patch('/:id/toggle', verifyTokenMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE automations 
       SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao alternar status da automação:', error);
    res.status(500).json({ error: 'Erro ao alternar status da automação' });
  }
});

module.exports = router;
