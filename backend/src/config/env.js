require('dotenv').config();

const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';

// SESSION_SECRET firma las cookies de sesión (HMAC-SHA256). En producción no se
// admite ningún valor por defecto: un secreto conocido permite forjar sesiones
// de cualquier usuario. Sin secreto, la aplicación no debe levantar.
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (nodeEnv === 'production') {
    throw new Error(
      'SESSION_SECRET es obligatoria en producción (NODE_ENV=production). ' +
        'Definí un valor largo y aleatorio en el entorno o en el archivo .env.'
    );
  }
  sessionSecret = 'dev-secret-cambiar-en-produccion';
  console.warn('[config] SESSION_SECRET no definida: usando secreto de desarrollo. No usar en producción.');
}

// Orígenes permitidos para CORS (lista separada por comas).
// Si no se define, app.js aplica los defaults locales (3000/3001).
const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret,
  corsOrigins,
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
  calendarMcpUrl: process.env.CALENDAR_MCP_URL || '',
  mcpCalendarToken: process.env.MCP_CALENDAR_TOKEN || '',
  mcpCalendarId: process.env.MCP_CALENDAR_ID || process.env.CALENDAR_ID || 'primary',
  mcpCalendarTimeoutMs: Number(process.env.MCP_CALENDAR_TIMEOUT_MS || 5000),
  timezone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires',
};
