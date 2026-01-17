import ollama from './ollama.js';

class LeadQualifier {
  async qualifyLead(leadData, conversationHistory = []) {
    const prompt = this.buildQualificationPrompt(leadData, conversationHistory);
    
    try {
      const response = await ollama.generate(prompt, {
        temperature: 0.3,
        max_tokens: 500
      });

      return this.parseQualificationResponse(response);
    } catch (error) {
      console.error('Erro ao qualificar lead:', error);
      return {
        score: 0,
        status: 'error',
        reason: 'Erro ao processar qualificação'
      };
    }
  }

  buildQualificationPrompt(leadData, conversationHistory) {
    const conversationText = conversationHistory
      .map(msg => `${msg.direction === 'inbound' ? 'Cliente' : 'Atendente'}: ${msg.message}`)
      .join('\n');

    return `Você é um especialista em qualificação de leads para empresas de energia solar.

Analise as informações do lead e classifique-o em uma das categorias:
- QUENTE (score 80-100): Lead com alto interesse, orçamento definido, decisão rápida
- MORNO (score 50-79): Lead com interesse moderado, precisa mais informações
- FRIO (score 0-49): Lead sem interesse real ou sem budget

DADOS DO LEAD:
Nome: ${leadData.name || 'N/A'}
Telefone: ${leadData.phone || 'N/A'}
Email: ${leadData.email || 'N/A'}
Consumo kWh: ${leadData.consumo_kwh || 'N/A'}
Valor da conta: R$ ${leadData.valor_conta || 'N/A'}
Status: ${leadData.status || 'N/A'}

HISTÓRICO DE CONVERSAS:
${conversationText || 'Nenhuma conversa ainda'}

Responda APENAS no formato JSON:
{
  "score": <número de 0 a 100>,
  "category": "<QUENTE|MORNO|FRIO>",
  "reason": "<explicação curta>",
  "next_action": "<próxima ação sugerida>"
}`;
  }

  parseQualificationResponse(response) {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 0,
          category: parsed.category || 'FRIO',
          reason: parsed.reason || '',
          next_action: parsed.next_action || ''
        };
      }
    } catch (error) {
      console.error('Erro ao parsear resposta:', error);
    }

    // Fallback para análise simples baseada em palavras-chave
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('quente') || lowerResponse.includes('alto interesse')) {
      return { score: 85, category: 'QUENTE', reason: 'Lead demonstra alto interesse', next_action: 'Agendar visita técnica' };
    } else if (lowerResponse.includes('morno') || lowerResponse.includes('moderado')) {
      return { score: 65, category: 'MORNO', reason: 'Lead precisa mais informações', next_action: 'Enviar materiais educativos' };
    } else {
      return { score: 30, category: 'FRIO', reason: 'Lead sem interesse aparente', next_action: 'Aguardar contato futuro' };
    }
  }

  async generateResponse(leadData, userMessage) {
    const prompt = `Você é um atendente especializado em energia solar.

Cliente pergunta: "${userMessage}"

Dados do cliente:
- Consumo: ${leadData.consumo_kwh || 'não informado'} kWh
- Conta de luz: R$ ${leadData.valor_conta || 'não informado'}

Responda de forma profissional, clara e objetiva em até 3 frases. Seja educado e técnico.`;

    try {
      const response = await ollama.generate(prompt, {
        temperature: 0.7,
        max_tokens: 200
      });
      return response.trim();
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, estou com dificuldades para responder no momento. Um atendente humano entrará em contato em breve.';
    }
  }
}

export default new LeadQualifier();
