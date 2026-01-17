import express from 'express';
import ollama from './ollama.js';
import leadQualifier from './leadQualifier.js';
import followUpAgent from './followUpAgent.js';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  const ollamaStatus = await ollama.checkStatus();
  res.json({
    status: 'ok',
    ollama: ollamaStatus
  });
});

// Qualificar lead
app.post('/qualify', async (req, res) => {
  try {
    const { leadData, conversationHistory } = req.body;

    if (!leadData) {
      return res.status(400).json({ error: 'leadData é obrigatório' });
    }

    const qualification = await leadQualifier.qualifyLead(leadData, conversationHistory || []);
    res.json(qualification);
  } catch (error) {
    console.error('Erro ao qualificar lead:', error);
    res.status(500).json({ error: 'Erro ao qualificar lead', details: error.message });
  }
});

// Gerar resposta automática
app.post('/generate-response', async (req, res) => {
  try {
    const { leadData, userMessage } = req.body;

    if (!leadData || !userMessage) {
      return res.status(400).json({ error: 'leadData e userMessage são obrigatórios' });
    }

    const response = await leadQualifier.generateResponse(leadData, userMessage);
    res.json({ response });
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    res.status(500).json({ error: 'Erro ao gerar resposta', details: error.message });
  }
});

// Trigger follow-up manual
app.post('/follow-up/trigger', async (req, res) => {
  try {
    await followUpAgent.checkPendingFollowUps();
    res.json({ message: 'Follow-ups processados com sucesso' });
  } catch (error) {
    console.error('Erro ao processar follow-ups:', error);
    res.status(500).json({ error: 'Erro ao processar follow-ups', details: error.message });
  }
});

// Chat genérico com IA
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages (array) é obrigatório' });
    }

    const response = await ollama.chat(messages);
    res.json({ response });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro no chat', details: error.message });
  }
});

// Iniciar scheduler de follow-ups
followUpAgent.startScheduler();

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║       🤖 AI AGENTS SERVICE                           ║ 
╚═══════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}
❤️  Health Check: http://localhost:${PORT}/health
🧠 Qualificar Lead: POST http://localhost:${PORT}/qualify
💬 Gerar Resposta: POST http://localhost:${PORT}/generate-response
📨 Follow-up: POST http://localhost:${PORT}/follow-up/trigger

⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}
`);
});
