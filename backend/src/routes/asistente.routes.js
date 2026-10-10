const { Router } = require('express');
const { enviar, historial, limpiar } = require('../controllers/asistente.controller');
const { requiereAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/mensaje', requiereAuth, enviar);
router.get('/historial', requiereAuth, historial);
router.delete('/historial', requiereAuth, limpiar);

module.exports = router;