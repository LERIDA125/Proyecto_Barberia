const barberosService = require('../services/barberos.service');

async function listar(req, res, next) {
  try {
    const barberos = await barberosService.listar();
    res.json(barberos);
  } catch (err) {
    next(err);
  }
}

async function disponibilidad(req, res, next) {
  try {
    const resultado = await barberosService.disponibilidad({
      barberoId: req.params.id,
      fecha: req.query.fecha,
      servicioId: req.query.servicioId,
    });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

async function miAgenda(req, res, next) {
  try {
    const turnos = await barberosService.miAgenda({
      usuario: req.usuario,
      desde: req.query.desde,
      hasta: req.query.hasta,
    });
    res.json(turnos);
  } catch (err) {
    next(err);
  }
}

async function agendaDeBarbero(req, res, next) {
  try {
    const turnos = await barberosService.agendaDeBarbero({
      barberoId: req.params.id,
      usuario: req.usuario,
      desde: req.query.desde,
      hasta: req.query.hasta,
    });
    res.json(turnos);
  } catch (err) {
    next(err);
  }
}

async function miDisponibilidad(req, res, next) {
  try {
    const config = await barberosService.obtenerDisponibilidadConfig(req.usuario.id);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

async function actualizarMiDisponibilidad(req, res, next) {
  try {
    const config = await barberosService.actualizarDisponibilidad(req.usuario.id, req.body);
    res.json(config);
  } catch (err) {
    next(err);
  }
}

async function misMetricas(req, res, next) {
  try {
    const resultado = await barberosService.metricas({
      usuario: req.usuario,
      barberoId: req.query.barberoId,
      desde: req.query.desde,
      hasta: req.query.hasta,
    });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  disponibilidad,
  miAgenda,
  agendaDeBarbero,
  miDisponibilidad,
  actualizarMiDisponibilidad,
  misMetricas,
};