const { ChatGroq } = require('@langchain/groq');
const { ChatOllama } = require('@langchain/ollama');
const env = require('../config/env');

function getLlm() {
  const provider = env.llmProvider.toLowerCase();

  if (provider === 'groq') {
    if (!env.groqApiKey || !env.groqApiKey.startsWith('gsk_')) {
      throw new Error('GROQ_API_KEY no configurada o inválida');
    }
    return new ChatGroq({ model: env.llmModel, temperature: 0, apiKey: env.groqApiKey });
  }

  if (provider === 'ollama') {
    return new ChatOllama({ baseUrl: env.ollamaBaseUrl, model: env.llmModel, temperature: 0 });
  }

  throw new Error(`LLM_PROVIDER desconocido: ${provider}`);
}

module.exports = { getLlm };