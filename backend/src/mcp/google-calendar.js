const env = require('../config/env');
const { McpHttpClient, McpError } = require('./client');

let cliente = null;
let urlActual = null;

function resolverUrl() {
  if (env.mcpCalendarUrl) return env.mcpCalendarUrl;
  if (!env.calendarMcpUrl) return '';

  const base = env.calendarMcpUrl.endsWith('/')
    ? env.calendarMcpUrl
    : `${env.calendarMcpUrl}/`;
  return new URL('sse', base).toString();
}

function configurado() {
  return Boolean(env.mcpCalendarUrl || env.calendarMcpUrl);
}

function obtenerCliente() {
  if (!configurado()) {
    throw new McpError('La integración con Google Calendar no está configurada', 503);
  }
  const url = resolverUrl();
  if (!cliente || urlActual !== url) {
    cliente = new McpHttpClient(url, {
      token: env.mcpCalendarToken,
      timeoutMs: env.mcpCalendarTimeoutMs,
    });
    urlActual = url;
  }
  return cliente;
}

function contexto(extra = {}) {
  return {
    calendarId: env.mcpCalendarId,
    timezone: env.timezone,
    ...extra,
  };
}

async function crearEvento({ titulo, inicio, fin, descripcion, asistentes }) {
  return obtenerCliente().llamarTool(
    'crearEvento',
    contexto({ titulo, inicio, fin, descripcion, asistentes })
  );
}

async function actualizarEvento({ eventId, inicio, fin, titulo, descripcion }) {
  return obtenerCliente().llamarTool(
    'actualizarEvento',
    contexto({ eventId, inicio, fin, titulo, descripcion })
  );
}

async function eliminarEvento({ eventId }) {
  return obtenerCliente().llamarTool('eliminarEvento', contexto({ eventId }));
}

async function consultarEventos({ desde, hasta, calendarId }) {
  return obtenerCliente().llamarTool(
    'consultarEventos',
    contexto({ desde, hasta, calendarId })
  );
}

async function verificarConexion() {
  return obtenerCliente().llamarTool('verificarConexion', contexto());
}

module.exports = {
  configurado,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  consultarEventos,
  verificarConexion,
};
