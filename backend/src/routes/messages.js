const express = require('express');
const router = express.Router();
const db = require('../database');
const verifyTokenMiddleware = require('../middleware/auth');
const axios = require('axios');

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3006';

// Listar mensagens com paginação e filtro
router.get('/', verifyTokenMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, phone, direction } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (phone) {
      params.push(`%${phone}%`);
      whereClause += ` AND phone LIKE $${params.length}`;
    }

    if (direction) {
      params.push(direction);
      whereClause += ` AND direction = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM messages ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      messages: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// Buscar mensagens de uma conversa específica
router.get('/conversation/:phone', verifyTokenMiddleware, async (req, res) => {
  try {
    const { phone } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT * FROM messages WHERE phone = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
      [phone, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM messages WHERE phone = $1`,
      [phone]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      messages: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// Enviar mensagem (via WhatsApp Service)
router.post('/send', verifyTokenMiddleware, async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Campos "phone" e "message" são obrigatórios' });
    }

    // Enviar via WhatsApp Service
    const whatsappResponse = await axios.post(`${WHATSAPP_SERVICE_URL}/send`, {
      to: phone,
      message
    });

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      whatsapp: whatsappResponse.data
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Erro ao enviar mensagem via WhatsApp',
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Criar mensagem (usado pelo WhatsApp Service para salvar mensagens)
router.post('/', async (req, res) => {
  try {
    const { phone, message, direction, status, timestamp } = req.body;

    if (!phone || !message || !direction) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await db.query(
      `INSERT INTO messages (phone, message, direction, status, created_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [phone, message, direction, status || 'sent', timestamp || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// Deletar mensagem
router.delete('/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ message: 'Mensagem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({ error: 'Erro ao deletar mensagem' });
  }
});

// Status do WhatsApp Service
router.get('/whatsapp-status', verifyTokenMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${WHATSAPP_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'WhatsApp Service não disponível',
      details: error.message
    });
  }
});

module.exports = router;
