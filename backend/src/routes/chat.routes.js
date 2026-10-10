const { Router } = require('express');
const { enviar } = require('../controllers/asistente.controller');

const router = Router();

router.post('/', enviar);

module.exports = router;