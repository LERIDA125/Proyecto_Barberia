const metricasService = require('../services/metricas.service');

async function obtenerMetricas(req, res, next) {
  try {
    const resultado = await metricasService.obtenerMetricas(req.query);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { obtenerMetricas };
