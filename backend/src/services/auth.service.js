const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const challengeStore = require('../utils/challengeStore');
const { requerirCampos, validarEmail } = require('../utils/validators');

function serializarUsuario(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
  };
}

async function opcionesRegistro(body) {
  requerirCampos(body, ['nombre', 'email']);
  const email = validarEmail(body.email);
  const nombre = String(body.nombre).trim();

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new AppError(409, 'El email ya está registrado');

  const opciones = await generateRegistrationOptions({
    rpName: env.webauthnRpName,
    rpID: env.webauthnRpId,
    userName: email,
    userDisplayName: nombre,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  });

  challengeStore.guardar(`registro:${email}`, opciones.challenge);
  return opciones;
}

async function verificarRegistro(body) {
  requerirCampos(body, ['nombre', 'email', 'response']);
  const email = validarEmail(body.email);
  const nombre = String(body.nombre).trim();
  const telefono = body.telefono ? String(body.telefono).trim() : null;

  const challenge = challengeStore.consumir(`registro:${email}`);
  if (!challenge) throw new AppError(400, 'El registro expiró, volvé a intentar');

  let verificacion;
  try {
    verificacion = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge,
      expectedOrigin: env.webauthnOrigin,
      expectedRPID: env.webauthnRpId,
    });
  } catch (err) {
    throw new AppError(400, 'No se pudo verificar la passkey');
  }

  if (!verificacion.verified) throw new AppError(400, 'Verificación de passkey fallida');

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new AppError(409, 'El email ya está registrado');

  const credencial = verificacion.registrationInfo.credential;

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      telefono,
      rol: 'cliente',
      credenciales: {
        create: {
          credentialId: credencial.id,
          publicKey: isoBase64URL.fromBuffer(credencial.publicKey),
          counter: credencial.counter,
          transports: credencial.transports || [],
        },
      },
    },
  });

  return serializarUsuario(usuario);
}

async function opcionesLogin(body) {
  requerirCampos(body, ['email']);
  const email = validarEmail(body.email);

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { credenciales: true },
  });
  if (!usuario) throw new AppError(404, 'Usuario no encontrado');
  if (usuario.credenciales.length === 0) throw new AppError(400, 'El usuario no tiene passkeys registradas');

  const opciones = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    userVerification: 'preferred',
    allowCredentials: usuario.credenciales.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    })),
  });

  challengeStore.guardar(`login:${email}`, opciones.challenge);
  return opciones;
}

async function verificarLogin(body) {
  requerirCampos(body, ['email', 'response']);
  const email = validarEmail(body.email);

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { credenciales: true },
  });
  if (!usuario) throw new AppError(404, 'Usuario no encontrado');

  const challenge = challengeStore.consumir(`login:${email}`);
  if (!challenge) throw new AppError(400, 'El inicio de sesión expiró, volvé a intentar');

  const credencial = usuario.credenciales.find((c) => c.credentialId === body.response.id);
  if (!credencial) throw new AppError(400, 'Credencial desconocida');

  let verificacion;
  try {
    verificacion = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge,
      expectedOrigin: env.webauthnOrigin,
      expectedRPID: env.webauthnRpId,
      credential: {
        id: credencial.credentialId,
        publicKey: isoBase64URL.toBuffer(credencial.publicKey),
        counter: credencial.counter,
        transports: credencial.transports,
      },
    });
  } catch (err) {
    throw new AppError(400, 'No se pudo verificar la passkey');
  }

  if (!verificacion.verified) throw new AppError(400, 'Autenticación fallida');

  await prisma.credencialPasskey.update({
    where: { id: credencial.id },
    data: { counter: verificacion.authenticationInfo.newCounter },
  });

  return serializarUsuario(usuario);
}

async function usuarioActual(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new AppError(404, 'Usuario no encontrado');
  return serializarUsuario(usuario);
}

module.exports = {
  opcionesRegistro,
  verificarRegistro,
  opcionesLogin,
  verificarLogin,
  usuarioActual,
  serializarUsuario,
};
