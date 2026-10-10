const notificacionesService = require('../services/notificaciones.service');

async function listar(req, res, next) {
  try {
    const notificaciones = await notificacionesService.listar(req.usuario.id);
    res.json(notificaciones);
  } catch (err) {
    next(err);
  }
}

async function marcarLeida(req, res, next) {
  try {
    const notificacion = await notificacionesService.marcarLeida({
      id: req.params.id,
      usuarioId: req.usuario.id,
    });
    res.json(notificacion);
  } catch (err) {
    next(err);
  }
}

async function marcarTodasLeidas(req, res, next) {
  try {
    const resultado = await notificacionesService.marcarTodasLeidas(req.usuario.id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, marcarLeida, marcarTodasLeidas };
