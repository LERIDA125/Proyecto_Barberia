const { Router } = require('express');
const serviciosController = require('../controllers/servicios.controller');
const { authOpcional, requiereAuth, requiereRol } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authOpcional, serviciosController.listar);
router.get('/:id', serviciosController.obtener);
router.post('/', requiereAuth, requiereRol('admin'), serviciosController.crear);
router.patch('/:id', requiereAuth, requiereRol('admin'), serviciosController.actualizar);
router.delete('/:id', requiereAuth, requiereRol('admin'), serviciosController.desactivar);

module.exports = router;
