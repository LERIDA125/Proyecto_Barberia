const AppError = require('../utils/AppError');
const { getSessionCookie, verificarToken } = require('../utils/session');
const prisma = require('../config/prisma');

async function cargarUsuarioDesdeCookie(req) {
  const token = getSessionCookie(req);
  const usuarioId = token ? verificarToken(token) : null;
  if (!usuarioId) return null;

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario || !usuario.activo) return null;
  return usuario;
}

async function authOpcional(req, res, next) {
  try {
    req.usuario = await cargarUsuarioDesdeCookie(req);
    next();
  } catch (err) {
    next(err);
  }
}

async function requiereAuth(req, res, next) {
  try {
    const usuario = await cargarUsuarioDesdeCookie(req);
    if (!usuario) throw new AppError(401, 'No autenticado');
    req.usuario = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return next(new AppError(401, 'No autenticado'));
    if (!roles.includes(req.usuario.rol)) return next(new AppError(403, 'No autorizado'));
    return next();
  };
}

module.exports = { authOpcional, requiereAuth, requiereRol };
