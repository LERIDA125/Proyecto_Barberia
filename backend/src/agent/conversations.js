const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

const DIR = () => path.join(env.asistenteDataDir, 'conversaciones');
const RUTA = (conversationId) => path.join(DIR(), `${conversationId}.json`);

// Los ids de conversación son UUID v4 (crypto.randomUUID). Validar el formato
// antes de armar la ruta impide que un sesionId manipulado (ej. "../algo")
// escape del directorio de conversaciones.
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idValido(conversationId) {
  return typeof conversationId === 'string' && RE_UUID.test(conversationId);
}

function crearConversacion(usuarioId = null) {
  const conv = {
    conversation_id: crypto.randomUUID(),
    usuarioId: usuarioId ?? null,
    messages: [],
  };
  guardar(conv);
  return conv;
}

function cargar(conversationId) {
  if (!idValido(conversationId)) return null;
  if (!fs.existsSync(RUTA(conversationId))) return null;
  return JSON.parse(fs.readFileSync(RUTA(conversationId), 'utf8'));
}

function guardar(conv) {
  fs.mkdirSync(DIR(), { recursive: true });
  fs.writeFileSync(RUTA(conv.conversation_id), JSON.stringify(conv, null, 2), 'utf8');
}

function eliminar(conversationId) {
  if (!idValido(conversationId)) return;
  const ruta = RUTA(conversationId);
  if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
}

// Una conversación pertenece a un usuario solo si fue creada con su id.
// Las conversaciones previas al control de propiedad (sin usuarioId) no
// se consideran de nadie: nadie puede leerlas ni borrarlas.
function perteneceA(conv, usuarioId) {
  return Boolean(conv) && Boolean(usuarioId) && conv.usuarioId === usuarioId;
}

function formatearHistorial(mensajes) {
  return mensajes
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`)
    .join('\n');
}

module.exports = { crearConversacion, cargar, guardar, eliminar, perteneceA, formatearHistorial };
