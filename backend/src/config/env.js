require('dotenv').config();

const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-cambiar-en-produccion',
  webauthnRpId: process.env.WEBAUTHN_RP_ID || 'localhost',
  webauthnRpName: process.env.WEBAUTHN_RP_NAME || 'Barberia',
  webauthnOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
  ventanaCancelacionHoras: Number(process.env.VENTANA_CANCELACION_HORAS || 0),
  llmProvider: process.env.LLM_PROVIDER || 'groq',
  llmModel: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
  groqApiKey: process.env.GROQ_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  asistenteDataDir: process.env.ASISTENTE_DATA_DIR || path.join(__dirname, '..', '..', 'data'),
  asistenteDoc:
    process.env.ASISTENTE_DOC || path.join(__dirname, '..', '..', '..', 'datos_barberia.md'),
  asistenteTopK: Number(process.env.ASISTENTE_TOP_K || 4),
  // --- Integración Google Calendar vía MCP externo (CU-07) ---
  mcpCalendarUrl: process.env.MCP_CALENDAR_URL || '',
  mcpCalendarToken: process.env.MCP_CALENDAR_TOKEN || '',
  mcpCalendarId: process.env.MCP_CALENDAR_ID || process.env.CALENDAR_ID || 'primary',
  mcpCalendarTimeoutMs: Number(process.env.MCP_CALENDAR_TIMEOUT_MS || 5000),
  timezone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires',
};
