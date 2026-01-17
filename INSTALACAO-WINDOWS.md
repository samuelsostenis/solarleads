# 🪟 Guia de Instalação - Windows 10/11

## 📋 Checklist de Pré-requisitos

Antes de começar, você precisa ter instalado:

- [ ] Node.js 18 ou superior
- [ ] PostgreSQL 14 ou superior  
- [ ] Git (opcional, mas recomendado)

---

## 🔧 PASSO 1: Instalar Node.js

### Download e Instalação

1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Deixe todas as opções marcadas (incluindo chocolatey)
5. Clique em "Install"

### Verificar Instalação

Abra o **Prompt de Comando** (Win + R → digite `cmd`) e execute:

```cmd
node --version
```

Deve mostrar algo como: `v18.19.0` ou superior

```cmd
npm --version
```

Deve mostrar algo como: `10.2.3` ou superior

---

## 🐘 PASSO 2: Instalar PostgreSQL

### Download e Instalação

1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador do **PostgreSQL 16**
3. Execute o instalador
4. **IMPORTANTE:** Anote a senha que você criar!
   - Usuário: `postgres`
   - Senha: (escolha uma senha forte)
   - Porta: `5432`
5. Marque todas as opções (PostgreSQL Server, pgAdmin, Stack Builder)

### Verificar Instalação

1. Abra o **pgAdmin** (instalado junto com PostgreSQL)
2. Clique em "Servers" → "PostgreSQL 16"
3. Digite a senha que você criou
4. Se conectou, está funcionando! ✅

---

## 📥 PASSO 3: Baixar o Projeto

### Opção A: Já tem a pasta do projeto

Se você já tem a pasta `solarleads`, pule para o **PASSO 4**.

### Opção B: Clonar via Git

Se tem Git instalado:

```cmd
git clone [URL_DO_SEU_REPOSITORIO]
cd solarleads
```

---

## 📦 PASSO 4: Instalar Dependências do Projeto

### 4.1 - Abrir Terminal na Pasta do Projeto

1. Abra a pasta `solarleads` no **Explorador de Arquivos**
2. Na barra de endereço, digite `cmd` e pressione Enter
3. Um Prompt de Comando abrirá na pasta correta

### 4.2 - Instalar Dependências

```cmd
:: Instalar dependências do Backend
cd backend
npm install
cd ..

:: Instalar dependências do Frontend
cd frontend
npm install
cd ..

:: Voltar para a raiz
```

⏰ **Isso pode levar de 2 a 5 minutos dependendo da sua internet.**

---

## 🗄️ PASSO 5: Configurar o Banco de Dados

### 5.1 - Criar o Banco de Dados

1. Abra o **pgAdmin**
2. Clique com botão direito em "Databases" → "Create" → "Database"
3. Nome: `solarleads`
4. Owner: `postgres`
5. Clique em "Save"

### 5.2 - Criar o Usuário

1. No pgAdmin, clique em "solarleads" → "Query Tool"
2. Cole este SQL e execute (F5):

```sql
-- Criar usuário
CREATE USER solarleads WITH PASSWORD 'password';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE solarleads TO solarleads;
GRANT ALL ON SCHEMA public TO solarleads;
```

### 5.3 - Executar o Schema (Criar Tabelas)

1. Ainda no Query Tool, clique em "File" → "Open File"
2. Navegue até `solarleads/database/schema.sql`
3. Clique em "Open"
4. Execute o script (F5)

✅ **Você deve ver mensagens de sucesso:**
- CREATE TABLE leads
- CREATE TABLE messages
- CREATE TABLE campaigns
- etc.

### 5.4 - Verificar se Funcionou

Execute esta query:

```sql
SELECT COUNT(*) as total_leads FROM leads;
```

Se retornar um número (ex: 5), funcionou! ✅

---

## ⚙️ PASSO 6: Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado, mas vamos verificar:

1. Abra `solarleads/.env` no **Bloco de Notas**
2. Verifique estas linhas:

```env
DATABASE_URL=postgresql://solarleads:password@localhost:5432/solarleads
PORT=3000
VITE_API_URL=http://localhost:3000
```

3. Se você usou uma senha diferente de `password` no PostgreSQL, altere aqui:

```env
DATABASE_URL=postgresql://solarleads:SUA_SENHA_AQUI@localhost:5432/solarleads
```

---

## 🚀 PASSO 7: Iniciar o Sistema

### 7.1 - Iniciar o Backend (API)

1. Abra um **Prompt de Comando** na pasta `solarleads`
2. Execute:

```cmd
cd backend
npm run dev
```

✅ **Deve aparecer:**
```
╔═══════════════════════════════════════════════════════╗
║       🌞 SOLARLEADS BACKEND API                      ║
╚═══════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:3000
📡 API disponível em: http://localhost:3000/api
```

**NÃO FECHE ESTE TERMINAL!**

### 7.2 - Iniciar o Frontend (Interface)

1. Abra **OUTRO** Prompt de Comando na pasta `solarleads`
2. Execute:

```cmd
cd frontend
npm run dev
```

✅ **Deve aparecer:**
```
  VITE v5.4.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**NÃO FECHE ESTE TERMINAL TAMBÉM!**

### 7.3 - Abrir no Navegador

1. Abra seu navegador (Chrome, Edge, Firefox)
2. Acesse: **http://localhost:5173**

✅ **Você deve ver:**
- Logo "SolarLeads" no topo
- 8 abas: Dashboard, Pipeline, WhatsApp, Leads, etc.
- Estatísticas de leads

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### Teste 1: Dashboard Carrega

- Na página inicial, você deve ver:
  - Total de Leads
  - Leads Hoje
  - Taxa de Conversão
  - Gráficos (em desenvolvimento)

### Teste 2: Ver Leads

- Clique na aba **"Leads"**
- Deve aparecer uma tabela com 5 leads de exemplo

### Teste 3: Ver Pipeline

- Clique na aba **"Pipeline"**
- Deve aparecer 6 colunas: Novos, Contatados, Qualificados, etc.
- Leads devem estar distribuídos nas colunas

### Teste 4: API Funcionando

- Abra: **http://localhost:3000/api/leads**
- Deve aparecer um JSON com os leads

---

## 🎉 PRONTO! Sistema Instalado e Funcionando!

### 📊 O que você pode fazer agora:

- ✅ Ver dashboard com estatísticas
- ✅ Gerenciar leads (criar, editar, deletar)
- ✅ Ver pipeline de vendas
- ✅ Explorar a interface

### ⚠️ O que ainda não funciona:

- ❌ WhatsApp Bot (precisa configurar)
- ❌ Automações (em desenvolvimento)
- ❌ Campanhas (em desenvolvimento)
- ❌ Webhooks (em desenvolvimento)

---

## 🔧 Problemas Comuns

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se o PostgreSQL está rodando:
   - Win + R → digite `services.msc`
   - Procure "postgresql-x64-16"
   - Status deve estar "Running"
2. Verifique a senha no `.env`

### Erro: "Port 3000 is already in use"

**Solução:**
1. Feche todos os terminais
2. Abra o Gerenciador de Tarefas (Ctrl + Shift + Esc)
3. Aba "Detalhes"
4. Procure por "node.exe"
5. Clique com botão direito → "Finalizar tarefa"
6. Tente iniciar novamente

### Erro: "npm install falhou"

**Solução:**
1. Limpe o cache do npm:
```cmd
npm cache clean --force
```
2. Delete as pastas `node_modules`
3. Tente novamente:
```cmd
npm install
```

### Frontend não carrega dados

**Solução:**
1. Verifique se o backend está rodando (Terminal 1)
2. Abra o Console do navegador (F12)
3. Veja se há erros de conexão
4. Verifique se `VITE_API_URL` está correto no `.env`

---

## 🆘 Precisa de Ajuda?

Se encontrar algum erro:

1. **Anote a mensagem de erro exata**
2. **Tire um print da tela**
3. **Verifique qual etapa deu erro**

---

## 📱 Próximos Passos

Após o sistema funcionar localmente:

1. **Explorar a interface** - Familiarize-se com cada aba
2. **Adicionar seus próprios leads** - Via interface ou API
3. **Configurar WhatsApp Bot** - (guia separado)
4. **Instalar Ollama** - Para IA (guia separado)
5. **Deploy em VPS** - Para produção (guia separado)

---

**Parabéns! 🎉 Seu SolarLeads está rodando!**

---

## `.env.example` e Execução Rápida

Para padronizar variáveis de ambiente, copie o arquivo de exemplo e ajuste os valores:

```cmd
cd c:\Projetos\solarleads
copy .env.example .env

:: Edite .env com sua senha do PostgreSQL, JWT_SECRET e outras variáveis
notepad .env
```

Valores importantes a revisar em `.env`:
- `DATABASE_URL` — credenciais do PostgreSQL
- `JWT_SECRET` — segredo para tokens (mude para produção)
- `VITE_API_URL` — URL da API que o frontend consumirá

Depois de ajustar, inicie os serviços (em terminais separados):

```cmd
:: Backend
cd backend
npm install
npm run dev

:: Frontend
cd ..\frontend
npm install
npm run dev

:: (Opcional) WhatsApp service
cd ..\whatsapp-service
npm install
npm run dev
```

Abra o frontend em: http://localhost:5173

