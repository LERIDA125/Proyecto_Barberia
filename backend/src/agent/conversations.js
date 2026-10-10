const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

const DIR = () => path.join(env.asistenteDataDir, 'conversaciones');
const RUTA = (conversationId) => path.join(DIR(), `${conversationId}.json`);

function crearConversacion() {
  const conv = { conversation_id: crypto.randomUUID(), messages: [] };
  guardar(conv);
  return conv;
}

function cargar(conversationId) {
  if (!fs.existsSync(RUTA(conversationId))) return null;
  return JSON.parse(fs.readFileSync(RUTA(conversationId), 'utf8'));
}

function guardar(conv) {
  fs.mkdirSync(DIR(), { recursive: true });
  fs.writeFileSync(RUTA(conv.conversation_id), JSON.stringify(conv, null, 2), 'utf8');
}

function eliminar(conversationId) {
  const ruta = RUTA(conversationId);
  if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
}

function formatearHistorial(mensajes) {
  return mensajes
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`)
    .join('\n');
}

module.exports = { crearConversacion, cargar, guardar, eliminar, formatearHistorial };