const authService = require('../services/auth.service');
const { setSessionCookie, clearSessionCookie } = require('../utils/session');
const { validar, schemas } = require('../utils/validation');

async function registroOpciones(req, res, next) {
  try {
    validar(schemas.registroOpciones, req.body);
    const opciones = await authService.opcionesRegistro(req.body);
    res.json(opciones);
  } catch (err) {
    next(err);
  }
}

async function registroVerificar(req, res, next) {
  try {
    validar(schemas.registroVerificar, req.body);
    const usuario = await authService.verificarRegistro(req.body);
    setSessionCookie(res, usuario);
    res.status(201).json({ usuario, ok: true });
  } catch (err) {
    next(err);
  }
}

async function loginOpciones(req, res, next) {
  try {
    validar(schemas.loginOpciones, req.body);
    const opciones = await authService.opcionesLogin(req.body);
    res.json(opciones);
  } catch (err) {
    next(err);
  }
}

async function loginVerificar(req, res, next) {
  try {
    validar(schemas.loginVerificar, req.body);
    const usuario = await authService.verificarLogin(req.body);
    setSessionCookie(res, usuario);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

async function sesion(req, res, next) {
  try {
    const usuario = await authService.usuarioActual(req.usuario.id);
    res.set('Cache-Control', 'no-store');
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { registroOpciones, registroVerificar, loginOpciones, loginVerificar, sesion, logout };
