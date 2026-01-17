# 🌞 SolarLeads - CRM Inteligente para Energia Solar

Sistema completo de gestão de leads com IA, WhatsApp Bot e automações para empresas de energia solar.

## 📋 Visão Geral

SolarLeads é um CRM AI-First que integra:
- 🤖 IA Conversacional (Ollama)
- 📱 WhatsApp Automation
- 📊 Dashboard Completo
- 🔄 Pipeline Visual
- ⚡ Automações Inteligentes
- 🔗 Webhooks e Integrações
- 📈 Análise de Campanhas

## 🚀 Quick Start (5 minutos)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ PostgreSQL 14+ ([Download](https://www.postgresql.org/download))
- ✅ Git ([Download](https://git-scm.com/downloads))

**Opcional:**
- Ollama (para IA) ([Download](https://ollama.com))
- Redis (para filas) ([Download](https://redis.io/download))

### 2. Instalação Rápida

```bash
# 1. Clone ou navegue até a pasta do projeto
cd solarleads

# 2. Instale TODAS as dependências
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configure o banco de dados
# Abra o pgAdmin ou psql e execute:
psql -U postgres
CREATE DATABASE solarleads;
CREATE USER solarleads WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE solarleads TO solarleads;
\q

# Execute o schema
psql -U solarleads -d solarleads -f database/schema.sql

# 4. Configure o arquivo .env (use o exemplo fornecido)

Para padronizar variáveis de ambiente, copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
# No Windows use: copy .env.example .env
```

Edite `.env` e atualize `DATABASE_URL`, `JWT_SECRET` e `VITE_API_URL` conforme necessário.

# 5. Inicie o projeto
# Terminal 1 - Backend:
cd backend
npm run dev

# Terminal 2 - Frontend:
cd frontend
npm run dev

# 6. Abra no navegador:
# Frontend: http://localhost:5173
# API: http://localhost:3005
```

## 🏗️ Arquitetura

```
USUÁRIO (Browser)
    ↓
FRONTEND (React + Vite) → localhost:5173
    ↓
BACKEND (Express.js) → localhost:3005
    ↓
┌────────────┬──────────┬───────────┬─────────┐
│PostgreSQL  │  Redis   │ WhatsApp  │ Ollama  │
│  :5432     │  :6379   │   Bot     │ :11434  │
└────────────┴──────────┴───────────┴─────────┘
```

## 📂 Estrutura do Projeto

```
solarleads/
├── frontend/           # Interface React
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── App.jsx     # Componente principal
│   │   └── main.jsx    # Entry point
│   └── package.json
│
├── backend/            # API REST
│   ├── src/
│   │   ├── routes/     # Rotas da API
│   │   ├── index.js    # Servidor Express
│   │   └── database.js # Conexão PostgreSQL
│   └── package.json
│
├── whatsapp-service/   # Bot WhatsApp
│   └── package.json
│
├── ai-agents/          # Agentes de IA
│   └── package.json
│
├── database/           # Scripts SQL
│   ├── schema.sql      # Estrutura do banco
│   └── migrations/     # Migrações
│
└── package.json        # Root package
```

## 🎯 Funcionalidades Implementadas

### ✅ 100% Prontas
- [x] Dashboard com estatísticas
- [x] Gestão de Leads (CRUD completo)
- [x] Pipeline Visual (6 estágios)
- [x] Tabela de Leads com filtros
- [x] API REST completa
- [x] Banco de dados PostgreSQL
- [x] Interface responsiva

### ⚙️ Em Desenvolvimento
- [ ] WhatsApp Bot (estrutura pronta, falta conectar)
- [ ] Automações (interface pronta, falta lógica)
- [ ] Campanhas (interface pronta, falta métricas)
- [ ] Webhooks (estrutura pronta, falta configurar)
- [ ] IA Conversacional (Ollama)
- [ ] Redis (filas)

## 📡 API Endpoints

### Leads
```bash
GET    /api/leads           # Listar todos os leads
GET    /api/leads/:id       # Buscar lead por ID
POST   /api/leads           # Criar novo lead
PUT    /api/leads/:id       # Atualizar lead
DELETE /api/leads/:id       # Deletar lead
```

### Mensagens
```bash
GET    /api/messages        # Listar mensagens
POST   /api/messages        # Criar mensagem
```

### Pipeline
```bash
GET    /api/pipeline/stages # Estágios do pipeline
GET    /api/pipeline/deals  # Todos os deals
```

### Estatísticas
```bash
GET    /api/stats           # Estatísticas gerais
```

### Campanhas
```bash
GET    /api/campaigns       # Listar campanhas
POST   /api/campaigns       # Criar campanha
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Iniciar frontend e backend
npm run dev:frontend        # Só frontend
npm run dev:backend         # Só backend

# Produção
npm run build              # Build do frontend
npm start                  # Iniciar servidor

# Database
npm run db:setup           # Configurar banco
npm run db:seed            # Popular com dados de exemplo
npm run db:reset           # Resetar banco

# Testes
npm test                   # Rodar todos os testes
npm run test:backend       # Testes do backend
```

## 🌐 Acessar o Sistema

Após iniciar, acesse:

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3005/api
- **Health Check:** http://localhost:3005/health

## 🗄️ Banco de Dados

### Tabelas Principais
- `leads` - Informações dos leads
- `messages` - Histórico de conversas
- `campaigns` - Campanhas de marketing
- `proposals` - Propostas enviadas
- `conversation_states` - Estados das conversas
- `analytics_events` - Eventos e métricas

### Conectar ao Banco

```bash
# Via psql
psql -U solarleads -d solarleads

# Via pgAdmin
Host: localhost
Port: 5432
Database: solarleads
Username: solarleads
Password: password
```

## 🎨 Interface

O sistema possui 8 módulos principais:

1. **Dashboard** - Visão geral e estatísticas
2. **Pipeline** - Funil de vendas visual
3. **WhatsApp** - Chat e automações
4. **Leads** - Gerenciamento completo
5. **Conversas** - Histórico de mensagens
6. **Automações** - Fluxos automáticos
7. **Campanhas** - Marketing e ROI
8. **Webhooks** - Integrações externas

## 🔐 Variáveis de Ambiente

O arquivo `.env` já está configurado com valores padrão para desenvolvimento local:

```env
# PostgreSQL
DATABASE_URL=postgresql://solarleads:password@localhost:5432/solarleads

# Backend
PORT=3005
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3005

# Ollama (opcional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"
```bash
# Verifique se o PostgreSQL está rodando
# Windows:
services.msc -> PostgreSQL

# Verifique credenciais no .env
DATABASE_URL=postgresql://solarleads:password@localhost:5432/solarleads
```

### Erro: "Port 3000 already in use"
```bash
# Mude a porta no .env
PORT=3001
```

### Frontend não carrega dados
```bash
# Verifique se o backend está rodando
curl http://localhost:3000/health

# Verifique o console do navegador (F12)
```

## 📚 Próximos Passos

### Curto Prazo (1-2 semanas)
1. Conectar WhatsApp Bot
2. Implementar automações completas
3. Adicionar métricas de campanhas
4. Configurar webhooks reais

### Médio Prazo (1 mês)
1. Integrar Ollama (IA)
2. Adicionar Redis (filas)
3. Deploy em VPS
4. Configurar HTTPS

### Longo Prazo (3-6 meses)
1. Sistema Multi-Agente IA
2. ERP completo
3. App Mobile
4. Integrações CRM

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento.

## 📝 Licença

MIT License - © 2025 SolarLeads

## 📞 Suporte

- **Documentação:** Veja a pasta `/docs`
- **Issues:** Abra uma issue no repositório
- **Email:** [seu-email@exemplo.com]

---

**Desenvolvido com ☀️ para revolucionar a gestão de leads de energia solar**
