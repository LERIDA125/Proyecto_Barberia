const prisma = require('../config/prisma');

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idValido(conversationId) {
  return typeof conversationId === 'string' && RE_UUID.test(conversationId);
}

function mapearConversacion(registro) {
  if (!Array.isArray(registro.mensajes)) {
    throw new Error(`El historial de la conversación ${registro.id} no tiene un formato válido`);
  }

  return {
    conversation_id: registro.id,
    usuarioId: registro.usuarioId,
    messages: registro.mensajes,
  };
}

async function crearConversacion(usuarioId) {
  if (typeof usuarioId !== 'string' || !usuarioId) {
    throw new TypeError('usuarioId es obligatorio para crear una conversación');
  }

  const registro = await prisma.conversacion.create({
    data: { usuarioId, mensajes: [] },
  });
  return mapearConversacion(registro);
}

async function cargar(conversationId) {
  if (!idValido(conversationId)) return null;

  const registro = await prisma.conversacion.findUnique({
    where: { id: conversationId },
  });
  return registro ? mapearConversacion(registro) : null;
}

async function guardar(conv) {
  if (!idValido(conv?.conversation_id) || !Array.isArray(conv.messages)) {
    throw new TypeError('La conversación no tiene un identificador o historial válido');
  }

  await prisma.conversacion.update({
    where: { id: conv.conversation_id },
    data: { mensajes: conv.messages },
  });
}

async function eliminar(conversationId, usuarioId) {
  if (!idValido(conversationId) || typeof usuarioId !== 'string' || !usuarioId) return;

  await prisma.conversacion.deleteMany({
    where: { id: conversationId, usuarioId },
  });
}

function perteneceA(conv, usuarioId) {
  return Boolean(conv) && Boolean(usuarioId) && conv.usuarioId === usuarioId;
}

function formatearHistorial(mensajes) {
  return mensajes
    .map((m) => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`)
    .join('\n');
}

module.exports = {
  crearConversacion,
  cargar,
  guardar,
  eliminar,
  perteneceA,
  formatearHistorial,
};
