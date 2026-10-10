const { Router } = require('express');
const { enviar, historial, limpiar } = require('../controllers/asistente.controller');

const router = Router();

router.post('/mensaje', enviar);
router.get('/historial', historial);
router.delete('/historial', limpiar);

module.exports = router;