const test = require('node:test');
const assert = require('node:assert');

// auth.service.js destructura @simplewebauthn/server al cargar el módulo,
// por eso los mocks se inyectan en el require.cache ANTES de requerir el service.
const rutaSimplewebauthn = require.resolve('@simplewebauthn/server');
const rutaHelpers = require.resolve('@simplewebauthn/server/helpers');

const llamadasVerify = [];

require.cache[rutaSimplewebauthn] = {
  id: rutaSimplewebauthn,
  filename: rutaSimplewebauthn,
  loaded: true,
  exports: {
    generateRegistrationOptions: async () => ({ challenge: 'challenge-registro' }),
    verifyRegistrationResponse: async () => ({
      verified: true,
      registrationInfo: { credential: { id: 'cred-nuevo', publicKey: Buffer.alloc(0), counter: 0 } },
    }),
    generateAuthenticationOptions: async () => ({ challenge: 'challenge-login' }),
    verifyAuthenticationResponse: async (args) => {
      llamadasVerify.push(args);
      return { verified: true, authenticationInfo: { newCounter: 7 } };
    },
  },
};

require.cache[rutaHelpers] = {
  id: rutaHelpers,
  filename: rutaHelpers,
  loaded: true,
  exports: {
    isoBase64URL: {
      fromBuffer: () => 'pk-b64',
      toBuffer: () => Buffer.from('pk-b64'),
    },
  },
};

const authService = require('../services/auth.service');
const prisma = require('../config/prisma');
const challengeStore = require('../utils/challengeStore');

const USUARIO = {
  id: 'u1',
  nombre: 'Fernando',
  email: 'feliz@test.com',
  telefono: null,
  rol: 'cliente',
  activo: true,
  createdAt: new Date('2026-10-01T10:00:00Z'),
  credenciales: [
    { id: 'cred-uuid-1', credentialId: 'cred-1', publicKey: 'pk-b64', counter: 3, transports: ['internal'] },
  ],
};

function cuerpoLogin(email, responseId) {
  return { email, response: { id: responseId, rawId: responseId, type: 'public-key' } };
}

test('verificarLogin: happy path verifica contra la credencial de la DB y actualiza el counter', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  const originalUpdate = prisma.credencialPasskey.update;
  const verifyAntes = llamadasVerify.length;
  let updateArgs = null;

  prisma.usuario.findUnique = async () => USUARIO;
  prisma.credencialPasskey.update = async (args) => {
    updateArgs = args;
    return { ...USUARIO.credenciales[0], counter: args.data.counter };
  };
  challengeStore.guardar('login:feliz@test.com', 'challenge-feliz');

  try {
    const usuario = await authService.verificarLogin(cuerpoLogin('feliz@test.com', 'cred-1'));

    assert.strictEqual(usuario.id, 'u1');
    assert.strictEqual(usuario.email, 'feliz@test.com');
    assert.strictEqual(usuario.credenciales, undefined);

    const verifyArgs = llamadasVerify[verifyAntes];
    assert.strictEqual(verifyArgs.credential.id, 'cred-1');
    assert(Buffer.isBuffer(verifyArgs.credential.publicKey));
    assert.strictEqual(verifyArgs.credential.counter, 3);
    assert.strictEqual(verifyArgs.expectedChallenge, 'challenge-feliz');

    assert.strictEqual(updateArgs.where.id, 'cred-uuid-1');
    assert.strictEqual(updateArgs.data.counter, 7);
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
    prisma.credencialPasskey.update = originalUpdate;
  }
});

test('verificarLogin: devuelve 404 si el usuario no existe', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  prisma.usuario.findUnique = async () => null;

  try {
    await assert.rejects(
      () => authService.verificarLogin(cuerpoLogin('nadie@test.com', 'cred-1')),
      (err) => err.status === 404
    );
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLogin: devuelve 400 si el challenge expiró o no existe', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  prisma.usuario.findUnique = async () => USUARIO;

  try {
    await assert.rejects(
      () => authService.verificarLogin(cuerpoLogin('sinchallenge@test.com', 'cred-1')),
      (err) => err.status === 400
    );
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLogin: devuelve 400 si la credencial del response no pertenece al usuario', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  const verifyAntes = llamadasVerify.length;

  prisma.usuario.findUnique = async () => USUARIO;
  challengeStore.guardar('login:otro@test.com', 'challenge-otro');

  try {
    await assert.rejects(
      () => authService.verificarLogin(cuerpoLogin('otro@test.com', 'cred-ajena')),
      (err) => err.status === 400 && /Credencial desconocida/.test(err.message)
    );
    assert.strictEqual(llamadasVerify.length, verifyAntes);
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});
