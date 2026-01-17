import axios from 'axios';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

class OllamaClient {
  async chat(messages, options = {}) {
    try {
      const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        ...options
      });
      return response.data.message.content;
    } catch (error) {
      console.error('Erro ao chamar Ollama:', error.message);
      throw new Error('Serviço de IA não disponível');
    }
  }

  async generate(prompt, options = {}) {
    try {
      const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        ...options
      });
      return response.data.response;
    } catch (error) {
      console.error('Erro ao gerar com Ollama:', error.message);
      throw new Error('Serviço de IA não disponível');
    }
  }

  async checkStatus() {
    try {
      await axios.get(`${OLLAMA_HOST}/api/tags`);
      return { available: true, model: OLLAMA_MODEL };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

export default new OllamaClient();
