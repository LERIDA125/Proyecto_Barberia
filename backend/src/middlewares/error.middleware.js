const { Prisma } = require('@prisma/client');

module.exports = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Registro duplicado' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Recurso no encontrado' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Referencia inválida' });
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  return res.status(status).json({ error: err.message });
};
