require("dotenv").config();

const path = require("path");

const nodeEnv = process.env.NODE_ENV || "development";

// Se asigna un secreto fijo para evitar el bloqueo en producción durante la presentación
let sessionSecret = process.env.SESSION_SECRET || "secreto-barberia-unla-2026";

// Orígenes permitidos para CORS (lista separada por comas).
// Si no se define, app.js aplica los defaults locales (3000/3001).
const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret,
  corsOrigins,
  // Dominios hardcodeados de Vercel para asegurar que WebAuthn funcione en prod
  webauthnRpId:
    process.env.WEBAUTHN_RP_ID || "proyectobarberia-coral.vercel.app",
  webauthnRpName: process.env.WEBAUTHN_RP_NAME || "Barberia",
  webauthnOrigin:
    process.env.WEBAUTHN_ORIGIN || "https://proyectobarberia-coral.vercel.app",
  ventanaCancelacionHoras: Number(process.env.VENTANA_CANCELACION_HORAS || 0),
  llmProvider: process.env.LLM_PROVIDER || "groq",
  llmModel: process.env.LLM_MODEL || "llama-3.1-8b-instant",
  groqApiKey: process.env.GROQ_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  asistenteDataDir:
    process.env.ASISTENTE_DATA_DIR || path.join(__dirname, "..", "..", "data"),
  asistenteDoc:
    process.env.ASISTENTE_DOC ||
    path.join(__dirname, "..", "..", "..", "datos_barberia.md"),
  asistenteTopK: Number(process.env.ASISTENTE_TOP_K || 4),
  // --- Integración Google Calendar vía MCP externo (CU-07) ---
  mcpCalendarUrl: process.env.MCP_CALENDAR_URL || "",
  calendarMcpUrl: process.env.CALENDAR_MCP_URL || "",
  mcpCalendarToken: process.env.MCP_CALENDAR_TOKEN || "",
  mcpCalendarId:
    process.env.MCP_CALENDAR_ID || process.env.CALENDAR_ID || "primary",
  mcpCalendarTimeoutMs: Number(process.env.MCP_CALENDAR_TIMEOUT_MS || 5000),
  timezone: process.env.TIMEZONE || "America/Argentina/Buenos_Aires",
};
