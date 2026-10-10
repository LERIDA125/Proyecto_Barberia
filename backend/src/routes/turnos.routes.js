const { Router } = require('express');
const turnosController = require('../controllers/turnos.controller');
const { requiereAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', requiereAuth, turnosController.crear);
router.get('/', requiereAuth, turnosController.listar);
router.get('/:id', requiereAuth, turnosController.obtener);
router.patch('/:id/cancelar', requiereAuth, turnosController.cancelar);
router.patch('/:id/reprogramar', requiereAuth, turnosController.reprogramar);
router.patch('/:id/estado', requiereAuth, turnosController.cambiarEstado);

module.exports = router;
