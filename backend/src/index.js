require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

// ============================================
// CONFIGURAÇÃO DO SERVIDOR
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SEGURANÇA
// ============================================

// Helmet - Proteção de headers HTTP
app.use(helmet());

// CORS - Permitir requisições do frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - Prevenir ataques DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de 100 requisições
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// ============================================
// MIDDLEWARES GERAIS
// ============================================

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger de requisições
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// ROTAS
// ============================================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'SolarLeads API',
    version: '1.0.0',
    description: 'API REST para gestão de leads de energia solar',
    docs: '/api/docs',
    health: '/health'
  });
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Error Handler Global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║       🌞 SOLARLEADS BACKEND API                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}\n`);
  });
}

// Tratamento de sinais de terminação
process.on('SIGTERM', () => {
  console.log('\n⚠️  Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

module.exports = app;
