import express from 'express';
import WhatsAppClient from './whatsapp.js';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

// Inicializar WhatsApp client
const whatsappClient = new WhatsAppClient();
whatsappClient.start().catch(console.error);

// Health check
app.get('/health', (req, res) => {
  const status = whatsappClient.getConnectionStatus();
  res.json({
    status: 'ok',
    whatsapp: status
  });
});

// Get QR Code
app.get('/qr', (req, res) => {
  const status = whatsappClient.getConnectionStatus();
  if (status.qr) {
    res.json({ qr: status.qr });
  } else if (status.isConnected) {
    res.json({ message: 'WhatsApp já está conectado' });
  } else {
    res.status(503).json({ error: 'QR Code não disponível no momento' });
  }
});

// Send message
app.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Campos "to" e "message" são obrigatórios' });
    }

    await whatsappClient.sendMessage(to, message);
    res.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      to,
      text: message
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      error: 'Erro ao enviar mensagem', 
      details: error.message 
    });
  }
});

// Webhook para receber notificações (para integrações futuras)
app.post('/webhook', (req, res) => {
  console.log('📥 Webhook recebido:', req.body);
  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║       📱 WHATSAPP SERVICE                            ║ 
╚═══════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}
❤️  Health Check: http://localhost:${PORT}/health
📷 QR Code: http://localhost:${PORT}/qr
📤 Enviar mensagem: POST http://localhost:${PORT}/send

⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}
`);
});
