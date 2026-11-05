const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');

const CODIGOS_DB_NO_DISPONIBLE = new Set(['P1001', 'P1002', 'P1017']);

module.exports = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (CODIGOS_DB_NO_DISPONIBLE.has(err.code)) {
      console.error('[db] PostgreSQL no disponible:', err.message);
      return res.status(503).json({ error: true, message: 'Base de datos no disponible' });
    }

    if (err.code === 'P2021') {
      console.error('[db] Tabla inexistente. Faltan migraciones:', err.meta);
      return res.status(500).json({
        error: true,
        message: 'Faltan migraciones de base de datos. Ejecutá `npx prisma migrate deploy`.',
      });
    }

    if (err.code === 'P2002') return res.status(409).json({ error: true, message: 'Registro duplicado' });
    if (err.code === 'P2025') return res.status(404).json({ error: true, message: 'Recurso no encontrado' });
    if (err.code === 'P2003') return res.status(400).json({ error: true, message: 'Referencia inválida' });
  }

  if (
    Prisma.PrismaClientInitializationError &&
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    console.error('[db] Inicialización de Prisma fallida:', err.message);
    return res.status(503).json({ error: true, message: 'Base de datos no disponible' });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
  return res.status(status).json({ error: true, message: err.message });
};
