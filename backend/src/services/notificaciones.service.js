const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { validarUUID } = require('../utils/validators');

function serializarNotificacion(notificacion) {
  return {
    id: notificacion.id,
    usuarioId: notificacion.usuarioId,
    titulo: notificacion.titulo,
    mensaje: notificacion.mensaje,
    leida: notificacion.leida,
    createdAt: notificacion.createdAt,
  };
}

async function listar(usuarioId) {
  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'desc' },
  });
  return notificaciones.map(serializarNotificacion);
}

async function marcarLeida({ id, usuarioId }) {
  validarUUID(id, 'id');

  const notificacion = await prisma.notificacion.findUnique({ where: { id } });
  if (!notificacion) throw new AppError(404, 'Notificación no encontrada');
  if (notificacion.usuarioId !== usuarioId) {
    throw new AppError(403, 'No autorizado para modificar esta notificación');
  }

  const actualizada = await prisma.notificacion.update({
    where: { id },
    data: { leida: true },
  });

  return serializarNotificacion(actualizada);
}

async function marcarTodasLeidas(usuarioId) {
  const resultado = await prisma.notificacion.updateMany({
    where: { usuarioId, leida: false },
    data: { leida: true },
  });
  return { actualizadas: resultado.count };
}

async function crearNotificacion({ usuarioId, titulo, mensaje }, cliente = prisma) {
  if (!usuarioId || !titulo || !mensaje) return null;
  return cliente.notificacion.create({
    data: { usuarioId, titulo, mensaje },
  });
}

module.exports = {
  listar,
  marcarLeida,
  marcarTodasLeidas,
  crearNotificacion,
  serializarNotificacion,
};
