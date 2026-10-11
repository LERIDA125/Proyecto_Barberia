const { Router } = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const serviciosRoutes = require('./servicios.routes');
const barberosRoutes = require('./barberos.routes');
const turnosRoutes = require('./turnos.routes');
const clientesRoutes = require('./clientes.routes');
const disponibilidadRoutes = require('./disponibilidad.routes');
const asistenteRoutes = require('./asistente.routes');
const chatRoutes = require('./chat.routes');
const notificacionesRoutes = require('./notificaciones.routes');
const integracionesRoutes = require('./integraciones.routes');
const metricasRoutes = require('./metricas.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/barberos', barberosRoutes);
router.use('/turnos', turnosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/disponibilidad', disponibilidadRoutes);
router.use('/asistente', asistenteRoutes);
router.use('/chat', chatRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/integraciones', integracionesRoutes);
router.use('/metricas', metricasRoutes);

module.exports = router;
