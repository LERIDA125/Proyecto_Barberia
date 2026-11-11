const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { requiereAuth, authOpcional } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/registro/opciones', authController.registroOpciones);
router.post('/registro/verificar', authController.registroVerificar);
router.post('/login', authController.loginClasico);
router.post('/login/opciones', authController.loginOpciones);
router.post('/login/verificar', authController.loginVerificar);
router.get('/sesion', requiereAuth, authController.sesion);
router.post('/logout', authOpcional, authController.logout);

module.exports = router;
