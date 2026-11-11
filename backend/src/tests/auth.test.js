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
const bcrypt = require('bcryptjs');

const HASH_VALIDO = bcrypt.hashSync('clave-correcta', 4);

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

function restaurarEntorno(valor) {
  if (valor === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = valor;
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

test('verificarLoginDev: autentica solo con email y registra el aviso de bypass', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFindUnique = prisma.usuario.findUnique;
  const originalWarn = console.warn;
  const avisos = [];
  let consulta = null;

  process.env.NODE_ENV = 'development';
  prisma.usuario.findUnique = async (args) => {
    consulta = args;
    return USUARIO;
  };
  console.warn = (...args) => avisos.push(args.join(' '));

  try {
    const usuario = await authService.verificarLoginDev({ email: '  FELIZ@TEST.COM ' });

    assert.strictEqual(usuario.id, 'u1');
    assert.strictEqual(usuario.email, 'feliz@test.com');
    assert.strictEqual(usuario.credenciales, undefined);
    assert.deepStrictEqual(consulta, { where: { email: 'feliz@test.com' } });
    assert.strictEqual(avisos.length, 1);
    assert.match(avisos[0], /Bypass de WebAuthn activado por entorno de desarrollo/);
    assert.match(avisos[0], /feliz@test\.com/);
  } finally {
    restaurarEntorno(originalEnv);
    prisma.usuario.findUnique = originalFindUnique;
    console.warn = originalWarn;
  }
});

test('verificarLoginDev: devuelve 404 si el usuario no existe', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFindUnique = prisma.usuario.findUnique;

  process.env.NODE_ENV = 'development';
  prisma.usuario.findUnique = async () => null;

  try {
    await assert.rejects(
      () => authService.verificarLoginDev({ email: 'nadie@test.com' }),
      (err) => err.status === 404
    );
  } finally {
    restaurarEntorno(originalEnv);
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginDev: devuelve 400 si el email es inválido', async () => {
  const originalEnv = process.env.NODE_ENV;

  process.env.NODE_ENV = 'development';

  try {
    await assert.rejects(
      () => authService.verificarLoginDev({ email: 'no-es-un-email' }),
      (err) => err.status === 400 && /Email inválido/.test(err.message)
    );
  } finally {
    restaurarEntorno(originalEnv);
  }
});

test('verificarLoginDev: rechaza el bypass fuera de desarrollo sin consultar la base', async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFindUnique = prisma.usuario.findUnique;
  let consulto = false;

  process.env.NODE_ENV = 'production';
  prisma.usuario.findUnique = async () => {
    consulto = true;
    return USUARIO;
  };

  try {
    await assert.rejects(
      () => authService.verificarLoginDev({ email: 'feliz@test.com' }),
      (err) => err.status === 403
    );
    assert.strictEqual(consulto, false);
  } finally {
    restaurarEntorno(originalEnv);
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginClasico: happy path autentica contra el hash y no lo expone', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  let consulta = null;

  prisma.usuario.findUnique = async (args) => {
    consulta = args;
    return { ...USUARIO, passwordHash: HASH_VALIDO };
  };

  try {
    const usuario = await authService.verificarLoginClasico({
      email: ' FELIZ@test.com ',
      password: 'clave-correcta',
    });

    assert.strictEqual(usuario.id, 'u1');
    assert.strictEqual(usuario.email, 'feliz@test.com');
    assert.strictEqual(usuario.passwordHash, undefined);
    assert.deepStrictEqual(consulta, { where: { email: 'feliz@test.com' } });
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginClasico: devuelve 401 si la contraseña es incorrecta', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  prisma.usuario.findUnique = async () => ({ ...USUARIO, passwordHash: HASH_VALIDO });

  try {
    await assert.rejects(
      () => authService.verificarLoginClasico({ email: 'feliz@test.com', password: 'clave-incorrecta' }),
      (err) => err.status === 401 && /Email o contrase\u00f1a incorrectos/.test(err.message)
    );
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginClasico: devuelve 401 si el usuario no tiene contraseña registrada', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  prisma.usuario.findUnique = async () => ({ ...USUARIO, passwordHash: null });

  try {
    await assert.rejects(
      () => authService.verificarLoginClasico({ email: 'feliz@test.com', password: 'cualquiera' }),
      (err) => err.status === 401 && /Email o contrase\u00f1a incorrectos/.test(err.message)
    );
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginClasico: usuario inexistente recibe el mismo 401 sin revelar existencia', async () => {
  const originalFindUnique = prisma.usuario.findUnique;
  prisma.usuario.findUnique = async () => null;

  try {
    await assert.rejects(
      () => authService.verificarLoginClasico({ email: 'nadie@test.com', password: 'cualquiera' }),
      (err) => err.status === 401 && /Email o contrase\u00f1a incorrectos/.test(err.message)
    );
  } finally {
    prisma.usuario.findUnique = originalFindUnique;
  }
});

test('verificarLoginClasico: devuelve 400 si falta la contraseña', async () => {
  await assert.rejects(
    () => authService.verificarLoginClasico({ email: 'feliz@test.com' }),
    (err) => err.status === 400 && /Faltan campos obligatorios/.test(err.message)
  );
});
