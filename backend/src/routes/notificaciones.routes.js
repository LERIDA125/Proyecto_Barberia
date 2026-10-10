const { Router } = require('express');
const notificacionesController = require('../controllers/notificaciones.controller');
const { requiereAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requiereAuth, notificacionesController.listar);
router.patch('/leer-todas', requiereAuth, notificacionesController.marcarTodasLeidas);
router.patch('/:id/leer', requiereAuth, notificacionesController.marcarLeida);

module.exports = router;
