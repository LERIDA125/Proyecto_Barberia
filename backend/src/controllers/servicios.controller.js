const serviciosService = require('../services/servicios.service');

async function listar(req, res, next) {
  try {
    const pideInactivos = req.query.incluirInactivos === 'true';
    const esAdmin = Boolean(req.usuario && req.usuario.rol === 'admin');
    const servicios = await serviciosService.listar({ incluirInactivos: pideInactivos && esAdmin });
    res.json(servicios);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const servicio = await serviciosService.obtenerPorId(req.params.id);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const servicio = await serviciosService.crear(req.body);
    res.status(201).json(servicio);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const servicio = await serviciosService.actualizar(req.params.id, req.body);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const servicio = await serviciosService.desactivar(req.params.id);
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
