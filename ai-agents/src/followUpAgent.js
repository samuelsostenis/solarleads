import ollama from './ollama.js';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';

class FollowUpAgent {
  constructor() {
    this.rules = [
      {
        id: 'sem_resposta_24h',
        trigger: 'no_response',
        delay_hours: 24,
        message: 'Olá! Notei que você demonstrou interesse em energia solar. Tem alguma dúvida que eu possa esclarecer?'
      },
      {
        id: 'proposta_enviada_48h',
        trigger: 'proposal_sent',
        delay_hours: 48,
        message: 'Oi! Você recebeu nossa proposta de energia solar. Gostaria de tirar alguma dúvida ou agendar uma visita técnica?'
      },
      {
        id: 'lead_frio_7dias',
        trigger: 'cold_lead',
        delay_hours: 168, // 7 dias
        message: 'Olá! Temos novidades sobre energia solar que podem te interessar. Que tal conversarmos?'
      }
    ];
  }

  async checkPendingFollowUps() {
    try {
      // Buscar leads que precisam de follow-up
      const response = await axios.get(`${BACKEND_URL}/api/leads`);
      const leads = response.data.leads || [];

      for (const lead of leads) {
        await this.processLeadFollowUp(lead);
      }
    } catch (error) {
      console.error('Erro ao verificar follow-ups:', error);
    }
  }

  async processLeadFollowUp(lead) {
    // Buscar última mensagem do lead
    try {
      const messagesResponse = await axios.get(`${BACKEND_URL}/api/messages/conversation/${lead.phone}`);
      const messages = messagesResponse.data.messages || [];

      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      const hoursSinceLastMessage = (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60);

      // Verificar se precisa de follow-up
      for (const rule of this.rules) {
        if (this.shouldTriggerRule(rule, lead, messages, hoursSinceLastMessage)) {
          await this.sendFollowUpMessage(lead, rule);
          break;
        }
      }
    } catch (error) {
      console.error(`Erro ao processar follow-up do lead ${lead.phone}:`, error);
    }
  }

  shouldTriggerRule(rule, lead, messages, hoursSinceLastMessage) {
    const lastMessage = messages[messages.length - 1];

    if (rule.trigger === 'no_response' && lastMessage.direction === 'outbound') {
      return hoursSinceLastMessage >= rule.delay_hours;
    }

    if (rule.trigger === 'proposal_sent' && lead.status === 'proposta') {
      return hoursSinceLastMessage >= rule.delay_hours;
    }

    if (rule.trigger === 'cold_lead' && lead.status === 'frio') {
      return hoursSinceLastMessage >= rule.delay_hours;
    }

    return false;
  }

  async sendFollowUpMessage(lead, rule) {
    try {
      // Personalizar mensagem com IA
      const personalizedMessage = await this.personalizeMessage(lead, rule.message);

      // Enviar via backend
      await axios.post(`${BACKEND_URL}/api/messages/send`, {
        phone: lead.phone,
        message: personalizedMessage
      });

      console.log(`✅ Follow-up enviado para ${lead.phone} (regra: ${rule.id})`);
    } catch (error) {
      console.error(`❌ Erro ao enviar follow-up para ${lead.phone}:`, error);
    }
  }

  async personalizeMessage(lead, templateMessage) {
    try {
      const prompt = `Personalize esta mensagem de follow-up para o lead:

Nome: ${lead.name || 'Cliente'}
Consumo: ${lead.consumo_kwh || 'não informado'} kWh
Status: ${lead.status}

Mensagem template: "${templateMessage}"

Responda APENAS com a mensagem personalizada, sem explicações.`;

      const response = await ollama.generate(prompt, {
        temperature: 0.5,
        max_tokens: 150
      });

      return response.trim() || templateMessage;
    } catch (error) {
      console.error('Erro ao personalizar mensagem:', error);
      return templateMessage;
    }
  }

  startScheduler() {
    // Rodar a cada 1 hora
    setInterval(() => {
      console.log('🤖 Verificando follow-ups pendentes...');
      this.checkPendingFollowUps();
    }, 60 * 60 * 1000);

    // Executar imediatamente na inicialização
    this.checkPendingFollowUps();
  }
}

export default new FollowUpAgent();
