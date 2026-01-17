const express = require('express');
const router = express.Router();
const { query } = require('../database');

// ============================================
// IMPORTAR ROTAS DE SUBMÓDULOS (quando criados)
// ============================================

const authRoutes = require('./auth');
const usersRoutes = require('./users');
const messagesRoutes = require('./messages');
const automationsRoutes = require('./automations');
const validate = require('../middleware/validate');
const { verifyTokenMiddleware } = require('../middleware/auth');
const { messagesSchema } = require('../schemas/messages');
const { campaignSchema } = require('../schemas/campaigns');
const { requireRole } = require('../middleware/roles');
// const leadsRoutes = require('./leads');
// const pipelineRoutes = require('./pipeline');
// const campaignsRoutes = require('./campaigns');
// const webhooksRoutes = require('./webhooks');

// ============================================
// REGISTRAR ROTAS
// ============================================

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/automations', automationsRoutes);

// ============================================
// ROTAS DE LEADS
// ============================================

// GET /api/leads - Listar todos os leads
router.get('/leads', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    
    let queryText = 'SELECT * FROM leads';
    const params = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});

// GET /api/leads/:id - Buscar lead por ID
router.get('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM leads WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    res.status(500).json({ error: 'Erro ao buscar lead' });
  }
});

// POST /api/leads - Criar novo lead
router.post('/leads', async (req, res) => {
  try {
    const {
      phone,
      name,
      email,
      valor_conta,
      consumo_kwh,
      tipo_imovel,
      proprietario,
      localizacao,
      cidade,
      estado,
      interesse,
      status = 'new'
    } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }
    
    const result = await query(`
      INSERT INTO leads (
        phone, name, email, valor_conta, consumo_kwh, tipo_imovel,
        proprietario, localizacao, cidade, estado, interesse, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [phone, name, email, valor_conta, consumo_kwh, tipo_imovel, proprietario, localizacao, cidade, estado, interesse, status]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

// PUT /api/leads/:id - Atualizar lead
router.put('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    
    const result = await query(`
      UPDATE leads SET ${fields}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

// DELETE /api/leads/:id - Deletar lead
router.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Lead deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({ error: 'Erro ao deletar lead' });
  }
});

// ============================================
// ROTAS DE MENSAGENS
// ============================================

// GET /api/messages - Listar mensagens
router.get('/messages', async (req, res) => {
  try {
    const { lead_id, limit = 50 } = req.query;
    
    let queryText = 'SELECT * FROM messages';
    const params = [];
    
    if (lead_id) {
      queryText += ' WHERE lead_id = $1';
      params.push(lead_id);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    
    const result = await query(queryText, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// POST /api/messages - Criar mensagem
router.post('/messages', verifyTokenMiddleware, validate(messagesSchema), async (req, res) => {
  try {
    const { lead_id, message, direction, agent, metadata } = req.body;
    
    if (!lead_id || !message || !direction) {
      return res.status(400).json({ error: 'lead_id, message e direction são obrigatórios' });
    }
    
    const result = await query(`
      INSERT INTO messages (lead_id, message, direction, agent, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [lead_id, message, direction, agent, metadata]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// ============================================
// ROTAS DE PIPELINE
// ============================================

// GET /api/pipeline/stages - Buscar estágios do pipeline
router.get('/pipeline/stages', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT status, COUNT(*) as count
      FROM leads
      GROUP BY status
      ORDER BY 
        CASE status
          WHEN 'new' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'proposal' THEN 4
          WHEN 'negotiation' THEN 5
          WHEN 'closed_won' THEN 6
          WHEN 'closed_lost' THEN 7
          ELSE 8
        END
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar estágios:', error);
    res.status(500).json({ error: 'Erro ao buscar estágios do pipeline' });
  }
});

// GET /api/pipeline/deals - Buscar todos os deals (leads agrupados por estágio)
router.get('/pipeline/deals', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id, name, phone, email, status,
        valor_conta, interesse, created_at, updated_at
      FROM leads
      ORDER BY 
        CASE status
          WHEN 'new' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'proposal' THEN 4
          WHEN 'negotiation' THEN 5
          WHEN 'closed_won' THEN 6
          WHEN 'closed_lost' THEN 7
          ELSE 8
        END,
        created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar deals:', error);
    res.status(500).json({ error: 'Erro ao buscar deals' });
  }
});

// ============================================
// ROTAS DE DASHBOARD/ESTATÍSTICAS
// ============================================

// GET /api/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as leads_semana,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as leads_hoje,
        COUNT(*) FILTER (WHERE status = 'new') as novos,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualificados,
        COUNT(*) FILTER (WHERE status = 'closed_won') as convertidos,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'closed_won') * 100.0 / 
          NULLIF(COUNT(*), 0), 
          2
        ) as taxa_conversao
      FROM leads
    `);
    
    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// ============================================
// ROTAS DE CAMPANHAS
// ============================================

// GET /api/campaigns - Listar campanhas
router.get('/campaigns', async (req, res) => {
  try {
    const result = await query('SELECT * FROM campaigns ORDER BY created_at DESC');
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({ error: 'Erro ao buscar campanhas' });
  }
});

// POST /api/campaigns - Criar campanha
router.post('/campaigns', verifyTokenMiddleware, requireRole('admin'), validate(campaignSchema), async (req, res) => {
  try {
    const { name, description, status = 'draft' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome da campanha é obrigatório' });
    }
    
    const result = await query(`
      INSERT INTO campaigns (name, description, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, status]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({ error: 'Erro ao criar campanha' });
  }
});

// ============================================
// EXPORTAR ROUTER
// ============================================

// Rotas públicas/privadas
router.use('/auth', authRoutes);
// Rotas de gerenciamento de usuários (protegidas)
const usersRoutes = require('./users');
router.use('/users', verifyTokenMiddleware, requireRole('admin'), usersRoutes);

module.exports = router;

// Rota auxiliar protegida para testes e verificação de middleware
// GET /api/protected - retorna info do usuário autenticado
router.get('/protected', verifyTokenMiddleware, (req, res) => {
  res.json({ success: true, user: req.user || null });
});
