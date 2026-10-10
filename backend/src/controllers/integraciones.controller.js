const integracionesService = require('../services/integraciones.service');
const { McpError } = require('../mcp/client');

function manejarError(err, res, next) {
  if (err instanceof McpError) {
    return res.status(err.status || 502).json({ error: err.message });
  }
  return next(err);
}

async function estado(req, res, next) {
  try {
    const resultado = await integracionesService.estado();
    res.json(resultado);
  } catch (err) {
    manejarError(err, res, next);
  }
}

async function sincronizar(req, res, next) {
  try {
    const resultado = await integracionesService.sincronizarTurno(req.params.turnoId);
    res.json(resultado);
  } catch (err) {
    manejarError(err, res, next);
  }
}

async function eventos(req, res, next) {
  try {
    const resultado = await integracionesService.listarEventos({
      desde: req.query.desde,
      hasta: req.query.hasta,
      calendarId: req.query.calendarId,
    });
    res.json(resultado);
  } catch (err) {
    manejarError(err, res, next);
  }
}

async function reconectar(req, res, next) {
  try {
    const resultado = await integracionesService.reconectar();
    res.json(resultado);
  } catch (err) {
    manejarError(err, res, next);
  }
}

module.exports = { estado, sincronizar, eventos, reconectar };
