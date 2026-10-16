const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');

module.exports = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: true, message: 'Registro duplicado' });
    if (err.code === 'P2025') return res.status(404).json({ error: true, message: 'Recurso no encontrado' });
    if (err.code === 'P2003') return res.status(400).json({ error: true, message: 'Referencia inválida' });
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
