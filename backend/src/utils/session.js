const crypto = require('crypto');
const { sessionSecret, nodeEnv } = require('../config/env');

const NOMBRE_COOKIE = 'sesion';
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

function firmar(payload) {
  return crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function crearToken(usuarioId) {
  const expira = Date.now() + DURACION_MS;
  const payload = `${usuarioId}.${expira}`;
  return `${payload}.${firmar(payload)}`;
}

function verificarToken(token) {
  if (typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;

  const [usuarioId, expira, firma] = partes;
  const firmaEsperada = firmar(`${usuarioId}.${expira}`);
  const bufferFirma = Buffer.from(firma);
  const bufferEsperado = Buffer.from(firmaEsperada);

  if (bufferFirma.length !== bufferEsperado.length) return null;
  if (!crypto.timingSafeEqual(bufferFirma, bufferEsperado)) return null;
  if (Number(expira) < Date.now()) return null;

  return usuarioId;
}

function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    maxAge: DURACION_MS,
    path: '/',
  };
}

function setSessionCookie(res, usuarioId) {
  res.cookie(NOMBRE_COOKIE, crearToken(usuarioId), opcionesCookie());
}

function clearSessionCookie(res) {
  const { maxAge, ...opciones } = opcionesCookie();
  res.clearCookie(NOMBRE_COOKIE, opciones);
}

function getSessionCookie(req) {
  return req.cookies ? req.cookies[NOMBRE_COOKIE] : undefined;
}

module.exports = {
  NOMBRE_COOKIE,
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  verificarToken,
};
