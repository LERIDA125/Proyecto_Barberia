const turnosService = require('../services/turnos.service');
const { validar, schemas } = require('../utils/validation');

async function crear(req, res, next) {
  try {
    validar(schemas.crearTurno, req.body);
    const esAdmin = req.usuario.rol === 'admin';
    const clienteId = esAdmin && req.body.clienteId ? req.body.clienteId : req.usuario.id;

    const turno = await turnosService.crear({
      clienteId,
      barberoId: req.body.barberoId,
      servicioId: req.body.servicioId,
      fechaInicio: req.body.fechaInicio,
      notas: req.body.notas,
    });

    res.status(201).json(turno);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const turnos = await turnosService.listar({ usuario: req.usuario, filtros: req.query });
    res.json(turnos);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const turno = await turnosService.obtenerPorId(req.params.id, req.usuario);
    res.json(turno);
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    validar(schemas.cancelarTurno, req.body);
    const turno = await turnosService.cancelar({
      id: req.params.id,
      usuario: req.usuario,
      motivo: req.body.motivo,
    });
    res.json(turno);
  } catch (err) {
    next(err);
  }
}

async function reprogramar(req, res, next) {
  try {
    validar(schemas.reprogramarTurno, req.body);
    const turno = await turnosService.reprogramar({
      id: req.params.id,
      usuario: req.usuario,
      nuevaFechaInicio: req.body.nuevaFechaInicio,
    });
    res.json(turno);
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    validar(schemas.cambiarEstado, req.body);
    const turno = await turnosService.cambiarEstado({
      id: req.params.id,
      usuario: req.usuario,
      estado: req.body.estado,
    });
    res.json(turno);
  } catch (err) {
    next(err);
  }
}

async function actualizarNotas(req, res, next) {
  try {
    validar(schemas.actualizarNotas, req.body);
    const turno = await turnosService.actualizarNotas({
      id: req.params.id,
      usuario: req.usuario,
      notas: req.body.notas,
    });
    res.json(turno);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, obtener, cancelar, reprogramar, cambiarEstado, actualizarNotas };