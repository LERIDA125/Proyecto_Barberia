const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

try {
  require('dotenv').config();
} catch {
  // dotenv es opcional para este servidor.
}

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'google-calendar-mcp', version: '1.0.0' };

const PORT = Number(process.env.MCP_PORT || 8000);
const CALENDAR_ID = process.env.CALENDAR_ID || 'primary';
const TIMEZONE = process.env.TIMEZONE || 'America/Argentina/Buenos_Aires';
const CREDENCIALES_PATH =
  process.env.GOOGLE_CREDENTIALS_PATH ||
  path.join(__dirname, '..', '..', '..', 'google-credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let auth = null;
let calendarClient = null;
let credencialesError = null;

// ---------------------------------------------------------------------------
// Credenciales y cliente de Google Calendar
// ---------------------------------------------------------------------------

function cargarCredenciales() {
  const credencialesEnv = process.env.GOOGLE_CREDENTIALS_JSON;
  if (credencialesEnv) {
    try {
      return JSON.parse(credencialesEnv);
    } catch {
      credencialesError = 'La variable GOOGLE_CREDENTIALS_JSON debe contener JSON válido';
      return null;
    }
  }

  try {
    const raw = fs.readFileSync(CREDENCIALES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    credencialesError = `No se pudieron leer las credenciales en "${CREDENCIALES_PATH}": ${err.message}`;
    return null;
  }
}

function crearAuth(credenciales) {
  // Service Account (recomendado: compartir el calendario con el client_email).
  if (credenciales.type === 'service_account' || credenciales.private_key) {
    return new google.auth.GoogleAuth({ credentials: credenciales, scopes: SCOPES });
  }

  // OAuth2 instalado/web con refresh token.
  const config = credenciales.installed || credenciales.web || credenciales;
  const refreshToken = credenciales.refresh_token || process.env.GOOGLE_REFRESH_TOKEN;
  const oauth2 = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    (config.redirect_uris && config.redirect_uris[0]) || undefined
  );
  if (refreshToken) oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function inicializarAuth() {
  const credenciales = cargarCredenciales();
  if (!credenciales) return;
  try {
    auth = crearAuth(credenciales);
  } catch (err) {
    credencialesError = `Credenciales inválidas: ${err.message}`;
  }
}

function obtenerCalendar() {
  if (calendarClient) return calendarClient;
  if (!auth) {
    throw new Error(credencialesError || 'Credenciales de Google Calendar no cargadas');
  }
  calendarClient = google.calendar({ version: 'v3', auth });
  return calendarClient;
}

inicializarAuth();

// ---------------------------------------------------------------------------
// Herramientas (tools)
// ---------------------------------------------------------------------------

function normalizarAsistentes(asistentes) {
  if (!Array.isArray(asistentes)) return undefined;
  const mapeados = asistentes
    .map((a) => (typeof a === 'string' ? { email: a } : a))
    .filter((a) => a && (a.email || a.id));
  return mapeados.length ? mapeados : undefined;
}

function aFecha(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) throw new Error(`Fecha inválida: ${valor}`);
  return fecha.toISOString();
}

async function crearEvento(args = {}) {
  const { titulo, inicio, fin, descripcion, asistentes, calendarId, timezone } = args;
  if (!titulo || !inicio || !fin) {
    throw new Error('crearEvento requiere "titulo", "inicio" y "fin"');
  }
  const calendar = obtenerCalendar();
  const res = await calendar.events.insert({
    calendarId: calendarId || CALENDAR_ID,
    requestBody: {
      summary: titulo,
      description: descripcion || undefined,
      start: { dateTime: aFecha(inicio), timeZone: timezone || TIMEZONE },
      end: { dateTime: aFecha(fin), timeZone: timezone || TIMEZONE },
      attendees: normalizarAsistentes(asistentes),
    },
  });
  return { eventId: res.data.id, htmlLink: res.data.htmlLink || null };
}

async function actualizarEvento(args = {}) {
  const { eventId, inicio, fin, titulo, descripcion, calendarId, timezone } = args;
  if (!eventId) throw new Error('actualizarEvento requiere "eventId"');

  const requestBody = {};
  if (titulo !== undefined) requestBody.summary = titulo;
  if (descripcion !== undefined) requestBody.description = descripcion;
  if (inicio) requestBody.start = { dateTime: aFecha(inicio), timeZone: timezone || TIMEZONE };
  if (fin) requestBody.end = { dateTime: aFecha(fin), timeZone: timezone || TIMEZONE };

  const calendar = obtenerCalendar();
  const res = await calendar.events.patch({
    calendarId: calendarId || CALENDAR_ID,
    eventId,
    requestBody,
  });
  return { eventId: res.data.id, actualizado: true };
}

async function eliminarEvento(args = {}) {
  const { eventId, calendarId } = args;
  if (!eventId) throw new Error('eliminarEvento requiere "eventId"');

  const calendar = obtenerCalendar();
  try {
    await calendar.events.delete({ calendarId: calendarId || CALENDAR_ID, eventId });
  } catch (err) {
    const status = err.code || (err.response && err.response.status);
    if (status === 404 || status === 410) {
      // Idempotente: el evento ya no existe.
      return { eliminado: true, yaNoExistia: true };
    }
    throw err;
  }
  return { eliminado: true };
}

async function consultarEventos(args = {}) {
  const { desde, hasta, calendarId } = args;
  const calendar = obtenerCalendar();
  const res = await calendar.events.list({
    calendarId: calendarId || CALENDAR_ID,
    timeMin: desde ? aFecha(desde) : new Date().toISOString(),
    timeMax: hasta ? aFecha(hasta) : undefined,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  return (res.data.items || []).map((evento) => ({
    id: evento.id,
    titulo: evento.summary || null,
    inicio: (evento.start && (evento.start.dateTime || evento.start.date)) || null,
    fin: (evento.end && (evento.end.dateTime || evento.end.date)) || null,
    descripcion: evento.description || null,
    htmlLink: evento.htmlLink || null,
  }));
}

async function verificarConexion(args = {}) {
  const calendarId = args.calendarId || CALENDAR_ID;
  try {
    const calendar = obtenerCalendar();
    await calendar.calendars.get({ calendarId });
    return { conectado: true, calendarId };
  } catch (err) {
    return { conectado: false, calendarId, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Definición de tools (MCP tools/list)
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'crearEvento',
    description: 'Crea un evento en Google Calendar y devuelve su identificador.',
    inputSchema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título/summary del evento.' },
        inicio: { type: 'string', description: 'Fecha-hora de inicio (ISO 8601).' },
        fin: { type: 'string', description: 'Fecha-hora de fin (ISO 8601).' },
        descripcion: { type: 'string' },
        asistentes: { type: 'array', items: { type: 'string' } },
        calendarId: { type: 'string' },
        timezone: { type: 'string' },
      },
      required: ['titulo', 'inicio', 'fin'],
    },
  },
  {
    name: 'actualizarEvento',
    description: 'Actualiza parcialmente un evento existente de Google Calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        titulo: { type: 'string' },
        inicio: { type: 'string' },
        fin: { type: 'string' },
        descripcion: { type: 'string' },
        calendarId: { type: 'string' },
        timezone: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'eliminarEvento',
    description: 'Elimina un evento de Google Calendar (idempotente).',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        calendarId: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'consultarEventos',
    description: 'Lista eventos del calendario entre dos fechas.',
    inputSchema: {
      type: 'object',
      properties: {
        desde: { type: 'string' },
        hasta: { type: 'string' },
        calendarId: { type: 'string' },
      },
    },
  },
  {
    name: 'verificarConexion',
    description: 'Verifica el acceso al calendario configurado.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const MANEJADORES = {
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  consultarEventos,
  verificarConexion,
};

// ---------------------------------------------------------------------------
// Protocolo JSON-RPC / MCP
// ---------------------------------------------------------------------------

function envolver(resultado) {
  const respuesta = { content: [{ type: 'text', text: JSON.stringify(resultado ?? null) }] };
  if (resultado && typeof resultado === 'object' && !Array.isArray(resultado)) {
    respuesta.structuredContent = resultado;
  }
  return respuesta;
}

async function invocarTool(nombre, args = {}) {
  const manejador = MANEJADORES[nombre];
  if (!manejador) {
    return { content: [{ type: 'text', text: `Tool desconocida: ${nombre}` }], isError: true };
  }
  try {
    return envolver(await manejador(args));
  } catch (err) {
    console.error(`[mcp] error en tool "${nombre}":`, err.message);
    return { content: [{ type: 'text', text: err.message || 'Error ejecutando la tool' }], isError: true };
  }
}

function respuestaError(id, code, message) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function procesarMensaje(mensaje) {
  if (!mensaje || typeof mensaje !== 'object' || !mensaje.method) {
    return null;
  }
  const { id, method, params } = mensaje;
  const esNotificacion = id === undefined || id === null;

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: { listChanged: false } },
            serverInfo: SERVER_INFO,
          },
        };
      case 'notifications/initialized':
      case 'notifications/cancelled':
        return null;
      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };
      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
      case 'tools/call':
        return {
          jsonrpc: '2.0',
          id,
          result: await invocarTool(params && params.name, (params && params.arguments) || {}),
        };
      default:
        if (esNotificacion) return null;
        return respuestaError(id, -32601, `Método no soportado: ${method}`);
    }
  } catch (err) {
    console.error(`[mcp] error procesando "${method}":`, err.message);
    if (esNotificacion) return null;
    return respuestaError(id, -32603, err.message || 'Error interno del servidor MCP');
  }
}

// ---------------------------------------------------------------------------
// Aplicación Express
// ---------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Transporte Streamable HTTP (el backend lo consume con POST) -----------

async function manejarStreamable(req, res) {
  const entrada = req.body;
  const mensajes = Array.isArray(entrada) ? entrada : [entrada];

  const respuestas = [];
  for (const mensaje of mensajes) {
    const respuesta = await procesarMensaje(mensaje);
    if (respuesta) respuestas.push(respuesta);
  }

  const esInitialize = mensajes.some((m) => m && m.method === 'initialize');
  if (esInitialize && !req.headers['mcp-session-id']) {
    res.setHeader('Mcp-Session-Id', crypto.randomUUID());
  }
  res.setHeader('MCP-Protocol-Version', PROTOCOL_VERSION);

  if (respuestas.length === 0) return res.status(202).end();

  const cuerpo = Array.isArray(entrada) ? respuestas : respuestas[0];

  const aceptaSse = (req.headers.accept || '').includes('text/event-stream');
  if (!aceptaSse) return res.status(200).json(cuerpo);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  for (const respuesta of respuestas) {
    res.write(`event: message\ndata: ${JSON.stringify(respuesta)}\n\n`);
  }
  res.end();
}

app.post('/sse', manejarStreamable);
app.post('/mcp', manejarStreamable);

// --- Transporte SSE clásico (handshake + /messages) ------------------------

const sesiones = new Map();

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sessionId = crypto.randomUUID();
  sesiones.set(sessionId, res);

  res.write(`event: endpoint\ndata: /messages?sessionId=${sessionId}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sesiones.delete(sessionId);
  });
});

app.post('/messages', async (req, res) => {
  const sesionId = req.query.sessionId;
  const stream = sesiones.get(sesionId);
  if (!stream) {
    return res.status(404).json({ error: 'Sesión SSE no encontrada o expirada' });
  }

  res.status(202).end();

  const mensajes = Array.isArray(req.body) ? req.body : [req.body];
  for (const mensaje of mensajes) {
    const respuesta = await procesarMensaje(mensaje);
    if (respuesta) {
      stream.write(`event: message\ndata: ${JSON.stringify(respuesta)}\n\n`);
    }
  }
});

// --- Diagnóstico -----------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    serverInfo: SERVER_INFO,
    calendarId: CALENDAR_ID,
    timezone: TIMEZONE,
    credencialesCargadas: Boolean(auth),
    credencialesError,
  });
});

app.use((err, req, res, next) => {
  console.error('[mcp] error de request:', err.message);
  res.status(err.status || 400).json({ error: err.message });
});

const servidor = app.listen(PORT, () => {
  console.log(`[mcp] servidor Google Calendar escuchando en http://localhost:${PORT}`);
  console.log(`[mcp] calendario: ${CALENDAR_ID} · timezone: ${TIMEZONE}`);
  console.log(
    `[mcp] credenciales: ${auth ? 'OK' : `NO DISPONIBLES${credencialesError ? ` (${credencialesError})` : ''}`}`
  );
  console.log('[mcp] endpoints: GET /sse · POST /sse · POST /mcp · POST /messages · GET /health');
});

function cerrar() {
  console.log('[mcp] cerrando servidor...');
  for (const stream of sesiones.values()) {
    try {
      stream.end();
    } catch {
      // ignorar
    }
  }
  servidor.close(() => process.exit(0));
}

process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);

module.exports = app;

/*
 * -----------------------------------------------------------------------------
 * PAQUETE AUTÓNOMO (aislamiento CA-07.7 / SDD "MCP encapsulado"):
 *
 *   Este directorio es un paquete Node independiente. Sus dependencias
 *   (express, cors, googleapis, dotenv) NO forman parte de backend/package.json.
 *
 *   cd backend/src/mcp/google-calendar
 *   npm install
 *
 * EJECUCIÓN (desde este directorio):
 *
 *   npm start
 *   # o con recarga en caliente:
 *   npm run dev
 *
 * VARIABLES DE ENTORNO:
 *
 *   MCP_PORT=8000
 *   GOOGLE_CREDENTIALS_PATH=../../../google-credentials.json  # Service Account u OAuth2 (con refresh_token)
 *   CALENDAR_ID=primary
 *   TIMEZONE=America/Argentina/Buenos_Aires
 *
 * CONECTAR EL BACKEND (cliente MCP) A ESTE SERVIDOR:
 *
 *   MCP_CALENDAR_URL=http://localhost:8000/sse
 *
 * NOTA: googleapis sólo se usa AQUÍ (el servidor MCP). El backend (cliente MCP)
 * nunca importa googleapis; habla con este servidor por HTTP/SSE.
 * -----------------------------------------------------------------------------
 */
