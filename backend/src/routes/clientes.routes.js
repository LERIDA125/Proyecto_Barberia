const { Router } = require('express');
const clientesController = require('../controllers/clientes.controller');
const { requiereAuth, requiereRol } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requiereAuth, requiereRol('barbero', 'admin'), clientesController.listarClientes);
router.get('/buscar', requiereAuth, requiereRol('barbero', 'admin'), clientesController.buscarClientes);
router.get('/:id/historial', requiereAuth, requiereRol('barbero', 'admin'), clientesController.obtenerHistorialCliente);

module.exports = router;
