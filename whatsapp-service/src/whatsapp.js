import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';

class WhatsAppClient {
  constructor() {
    this.sock = null;
    this.store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    this.qr = null;
    this.isConnected = false;
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      getMessage: async (key) => {
        if (this.store) {
          const msg = await this.store.loadMessage(key.remoteJid, key.id);
          return msg?.message || undefined;
        }
        return undefined;
      }
    });

    this.store?.bind(this.sock.ev);

    // Event: Connection update
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('📱 Escaneie o QR Code abaixo com WhatsApp:');
        qrcode.generate(qr, { small: true });
        this.qr = qr;
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('❌ Conexão fechada. Reconectando:', shouldReconnect);
        this.isConnected = false;
        if (shouldReconnect) {
          await this.start();
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp conectado com sucesso!');
        this.isConnected = true;
        this.qr = null;
      }
    });

    // Event: Credentials update
    this.sock.ev.on('creds.update', saveCreds);

    // Event: Incoming messages
    this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const timestamp = new Date(msg.messageTimestamp * 1000);

        console.log(`📩 Mensagem recebida de ${from}: ${text}`);

        // Salvar no backend
        try {
          await axios.post(`${BACKEND_URL}/api/messages`, {
            phone: from.replace('@s.whatsapp.net', ''),
            message: text,
            direction: 'inbound',
            status: 'delivered',
            timestamp: timestamp.toISOString()
          });
          console.log('✅ Mensagem salva no backend');
        } catch (error) {
          console.error('❌ Erro ao salvar mensagem:', error.message);
        }
      }
    });
  }

  async sendMessage(to, message) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp não está conectado');
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text: message });
    console.log(`📤 Mensagem enviada para ${jid}: ${message}`);

    // Salvar no backend
    try {
      await axios.post(`${BACKEND_URL}/api/messages`, {
        phone: to.replace('@s.whatsapp.net', ''),
        message,
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem enviada:', error.message);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      qr: this.qr
    };
  }
}

export default WhatsAppClient;
