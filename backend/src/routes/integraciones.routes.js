const { Router } = require('express');
const integracionesController = require('../controllers/integraciones.controller');
const { requiereAuth, requiereRol } = require('../middlewares/auth.middleware');

const router = Router();

router.get(
  '/calendar/estado',
  requiereAuth,
  requiereRol('admin'),
  integracionesController.estado
);
router.post(
  '/calendar/sincronizar/:turnoId',
  requiereAuth,
  requiereRol('admin'),
  integracionesController.sincronizar
);
router.get(
  '/calendar/eventos',
  requiereAuth,
  requiereRol('barbero', 'admin'),
  integracionesController.eventos
);
router.post(
  '/calendar/reconectar',
  requiereAuth,
  requiereRol('admin'),
  integracionesController.reconectar
);

module.exports = router;
