const { Router } = require('express');
const { enviar } = require('../controllers/asistente.controller');
const { requiereAuth } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', requiereAuth, enviar);

module.exports = router;