const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const directorioTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'barberia-chat-'));
process.env.ASISTENTE_DATA_DIR = directorioTemporal;

const asistenteService = require('../services/asistente.service');
const { crearConversacion, guardar } = require('../agent/conversations');

function crearConversacionConMensajes(usuarioId) {
  const conv = crearConversacion(usuarioId);
  conv.messages.push({ role: 'user', content: 'Hola' });
  conv.messages.push({ role: 'assistant', content: 'Hola, ¿cómo puedo ayudarte?' });
  guardar(conv);
  return conv;
}

function rutaConversacion(conversationId) {
  return path.join(directorioTemporal, 'conversaciones', `${conversationId}.json`);
}

test.after(() => {
  fs.rmSync(directorioTemporal, { recursive: true, force: true });
});

test('historial: devuelve los mensajes de una conversación propia', () => {
  const conv = crearConversacionConMensajes('u1');

  const mensajes = asistenteService.historial(conv.conversation_id, 'u1');

  assert.strictEqual(mensajes.length, 2);
  assert.strictEqual(mensajes[0].content, 'Hola');
});

test('limpiarHistorial: borra la conversación propia y deja el historial vacío', () => {
  const conv = crearConversacionConMensajes('u1');

  asistenteService.limpiarHistorial(conv.conversation_id, 'u1');

  assert.strictEqual(fs.existsSync(rutaConversacion(conv.conversation_id)), false);
  assert.deepStrictEqual(asistenteService.historial(conv.conversation_id, 'u1'), []);
});

test('historial: rechaza una conversación ajena con 403', () => {
  const conv = crearConversacionConMensajes('u1');

  assert.throws(
    () => asistenteService.historial(conv.conversation_id, 'u2'),
    (err) => err.status === 403
  );
  assert.strictEqual(fs.existsSync(rutaConversacion(conv.conversation_id)), true);
});

test('limpiarHistorial: rechaza una conversación ajena con 403 y no la borra', () => {
  const conv = crearConversacionConMensajes('u1');

  assert.throws(
    () => asistenteService.limpiarHistorial(conv.conversation_id, 'u2'),
    (err) => err.status === 403
  );
  assert.strictEqual(fs.existsSync(rutaConversacion(conv.conversation_id)), true);
});

test('historial: devuelve una lista vacía si no hay sesión o la conversación no existe', () => {
  assert.deepStrictEqual(asistenteService.historial(undefined, 'u1'), []);
  assert.deepStrictEqual(
    asistenteService.historial(crypto.randomUUID(), 'u1'),
    []
  );
});

test('limpiarHistorial: no falla si no hay sesión o la conversación no existe', () => {
  assert.doesNotThrow(() => asistenteService.limpiarHistorial(undefined, 'u1'));
  assert.doesNotThrow(() =>
    asistenteService.limpiarHistorial(crypto.randomUUID(), 'u1')
  );
});
