const { Router } = require('express');
const metricasController = require('../controllers/metricas.controller');
const { requiereAuth, requiereRol } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requiereAuth, requiereRol('admin'), metricasController.obtenerMetricas);

module.exports = router;
