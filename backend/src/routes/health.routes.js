const { Router } = require('express');
const prisma = require('../config/prisma');

const router = Router();

router.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', servicio: 'barberia-api', db: 'ok' });
  } catch (err) {
    console.error('[health] Base de datos caída:', err.message);
    return res.status(503).json({ status: 'error', servicio: 'barberia-api', db: 'down' });
  }
});

module.exports = router;
