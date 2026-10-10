const { Router } = require('express');
const barberosController = require('../controllers/barberos.controller');
const { requiereAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/me/agenda', requiereAuth, barberosController.miAgenda);
router.get('/me/disponibilidad', requiereAuth, barberosController.miDisponibilidad);
router.put('/me/disponibilidad', requiereAuth, barberosController.actualizarMiDisponibilidad);
router.get('/me/metricas', requiereAuth, barberosController.misMetricas);
router.get('/me/bloqueos', requiereAuth, barberosController.misBloqueos);
router.post('/me/bloqueos', requiereAuth, barberosController.crearBloqueo);
router.delete('/me/bloqueos/:id', requiereAuth, barberosController.eliminarBloqueo);
router.get('/', requiereAuth, barberosController.listar);
router.get('/:id/agenda', requiereAuth, barberosController.agendaDeBarbero);
router.get('/:id/disponibilidad', requiereAuth, barberosController.disponibilidad);

module.exports = router;
