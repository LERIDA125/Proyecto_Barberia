const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const prisma = require('../config/prisma');
const asistenteService = require('../services/asistente.service');
const conversaciones = require('../agent/conversations');

const metodosOriginales = {
  create: prisma.conversacion.create,
  findUnique: prisma.conversacion.findUnique,
  update: prisma.conversacion.update,
  deleteMany: prisma.conversacion.deleteMany,
};

let registros;

test.beforeEach(() => {
  registros = new Map();
  prisma.conversacion.create = async ({ data }) => {
    const registro = {
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      mensajes: data.mensajes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    registros.set(registro.id, registro);
    return registro;
  };
  prisma.conversacion.findUnique = async ({ where }) => registros.get(where.id) ?? null;
  prisma.conversacion.update = async ({ where, data }) => {
    const registro = registros.get(where.id);
    if (!registro) throw new Error('Conversación inexistente');
    registro.mensajes = data.mensajes;
    registro.updatedAt = new Date();
    return registro;
  };
  prisma.conversacion.deleteMany = async ({ where }) => {
    const registro = registros.get(where.id);
    if (registro?.usuarioId === where.usuarioId) {
      registros.delete(where.id);
      return { count: 1 };
    }
    return { count: 0 };
  };
});

test.after(() => {
  prisma.conversacion.create = metodosOriginales.create;
  prisma.conversacion.findUnique = metodosOriginales.findUnique;
  prisma.conversacion.update = metodosOriginales.update;
  prisma.conversacion.deleteMany = metodosOriginales.deleteMany;
});

async function crearConversacionConMensajes(usuarioId) {
  const conv = await conversaciones.crearConversacion(usuarioId);
  conv.messages.push(
    { role: 'user', content: 'Hola' },
    { role: 'assistant', content: 'Hola, ¿cómo puedo ayudarte?' }
  );
  await conversaciones.guardar(conv);
  return conv;
}

test('historial: recupera mensajes persistidos desde una nueva instancia del repositorio', async () => {
  const conv = await crearConversacionConMensajes('u1');
  const rutaRepositorio = require.resolve('../agent/conversations');
  delete require.cache[rutaRepositorio];
  const nuevaInstanciaRepositorio = require('../agent/conversations');

  const recuperada = await nuevaInstanciaRepositorio.cargar(conv.conversation_id);

  assert.deepEqual(recuperada.messages, conv.messages);
  assert.equal(recuperada.usuarioId, 'u1');
});

test('limpiarHistorial: borra la conversación propia y deja el historial vacío', async () => {
  const conv = await crearConversacionConMensajes('u1');

  await asistenteService.limpiarHistorial(conv.conversation_id, 'u1');

  assert.equal(registros.has(conv.conversation_id), false);
  assert.deepEqual(await asistenteService.historial(conv.conversation_id, 'u1'), []);
});

test('historial: rechaza una conversación ajena con 403', async () => {
  const conv = await crearConversacionConMensajes('u1');

  await assert.rejects(
    () => asistenteService.historial(conv.conversation_id, 'u2'),
    (err) => err.status === 403
  );
  assert.equal(registros.has(conv.conversation_id), true);
});

test('limpiarHistorial: rechaza una conversación ajena con 403 y no la borra', async () => {
  const conv = await crearConversacionConMensajes('u1');

  await assert.rejects(
    () => asistenteService.limpiarHistorial(conv.conversation_id, 'u2'),
    (err) => err.status === 403
  );
  assert.equal(registros.has(conv.conversation_id), true);
});

test('historial: devuelve una lista vacía si no hay sesión o la conversación no existe', async () => {
  assert.deepEqual(await asistenteService.historial(undefined, 'u1'), []);
  assert.deepEqual(
    await asistenteService.historial(crypto.randomUUID(), 'u1'),
    []
  );
});

test('limpiarHistorial: no falla si no hay sesión o la conversación no existe', async () => {
  await assert.doesNotReject(() => asistenteService.limpiarHistorial(undefined, 'u1'));
  await assert.doesNotReject(() =>
    asistenteService.limpiarHistorial(crypto.randomUUID(), 'u1')
  );
});
