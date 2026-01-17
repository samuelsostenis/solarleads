# 🌞 SolarLeads - Guia de Execução

## Problema Identificado e Corrigido

O **backend não estava exposto corretamente** para o CRM frontend porque:

1. ❌ **URLs hardcoded com porta errada**: Frontend apontava para `http://localhost:3000/api` enquanto backend rodava em `http://localhost:3005`
2. ❌ **Falta de configuração de ambiente**: Sem arquivo `.env` para definir porta e CORS
3. ❌ **Componentes não usando proxy Vite**: `LeadsTable.jsx` e `Pipeline.jsx` faziam requisições diretas em vez de usar o proxy local

## Solução Implementada

### 1. Corrigidas URLs do Frontend
- `App.jsx`: Agora usa `import.meta.env.VITE_API_URL || '/api'`
- `LeadsTable.jsx`: Usa variável `API_URL` em vez de hardcode
- `Pipeline.jsx`: Usa variável `API_URL` em vez de hardcode

### 2. Criados Arquivos `.env`

**`backend/.env`**
```env
NODE_ENV=development
PORT=3005
DB_HOST=localhost
DB_PORT=5432
DB_NAME=solarleads
DB_USER=solarleads
DB_PASSWORD=samuel
CORS_ORIGIN=http://localhost:5173
DEBUG=false
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3005/api
```

### 3. Vite Proxy Configurado
O arquivo `frontend/vite.config.js` já estava configurado corretamente:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3005',
    changeOrigin: true,
  }
}
```

## Como Executar

### Opção 1: Desenvolvimento (Backend + Frontend em paralelo)

```bash
cd c:\Projetos\solarleads
npm install
npm run dev
```

Isso iniciará:
- 🌞 **Backend** em `http://localhost:3005`
- 🌐 **Frontend** em `http://localhost:5173`

### Opção 2: Separado (se preferir)

#### Terminal 1 - Backend:
```bash
cd c:\Projetos\solarleads\backend
npm install
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd c:\Projetos\solarleads\frontend
npm install
npm run dev
```

## Endpoints Disponíveis

### Leads
- `GET /api/leads` - Listar todos os leads
- `GET /api/leads/:id` - Buscar lead por ID
- `POST /api/leads` - Criar novo lead
- `PUT /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Deletar lead

### Mensagens
- `GET /api/messages` - Listar mensagens
- `POST /api/messages` - Criar mensagem

### Pipeline
- `GET /api/pipeline/stages` - Buscar estágios do pipeline
- `GET /api/pipeline/deals` - Listar todos os deals

### Estatísticas
- `GET /api/stats` - Estatísticas gerais (total leads, conversão, etc.)

### Campanhas
- `GET /api/campaigns` - Listar campanhas
- `POST /api/campaigns` - Criar campanha

### Health Check
- `GET /health` - Verificar se servidor está rodando

## Testando Endpoints

Via `curl`:

```powershell
# Listar leads
curl http://localhost:3005/api/leads

# Verificar saúde do servidor
curl http://localhost:3005/health

# Buscar estatísticas
curl http://localhost:3005/api/stats

# Buscar pipeline
curl http://localhost:3005/api/pipeline/deals
```

## Dados do Banco de Dados

O backend está **conectado ao PostgreSQL** e retornando dados reais:
- ✅ 5 leads encontrados na tabela
- ✅ Dados com campos: `id`, `phone`, `name`, `email`, `valor_conta`, `consumo_kwh`, etc.
- ✅ CRM (Frontend) carregando dados do Dashboard, Pipeline e Tabela de Leads

## Verificação

Abra o navegador em **http://localhost:5173** e veja:
1. Dashboard com estatísticas (Total: **5 leads**) ✅
2. Aba **Pipeline** mostrando leads por estágio ✅
3. Aba **Leads** listando todos os leads com detalhes ✅

---

**Status**: ✅ Backend exposto corretamente e CRM carregando dados com sucesso!

---

## Usando `.env.example`

Para padronizar as variáveis de ambiente antes de executar localmente:

```powershell
cd c:\Projetos\solarleads
copy .env.example .env
notepad .env   # ajuste DATABASE_URL, JWT_SECRET, VITE_API_URL, etc.
```

Em seguida, inicie o backend e frontend em terminais separados:

```powershell
cd backend
npm install
npm run dev

cd ..\frontend
npm install
npm run dev
```

Se usar o `whatsapp-service`, abra outro terminal e rode:

```powershell
cd whatsapp-service
npm install
npm run dev
```

Verifique em `http://localhost:5173` (frontend) e `http://localhost:3005/health` (backend).
