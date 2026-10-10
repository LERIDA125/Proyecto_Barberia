const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { validarUUID } = require('../utils/validators');
const { serializarTurno } = require('../utils/serializers');

const LIMITE_BUSQUEDA = 20;

function serializarCliente(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono ?? null,
    activo: usuario.activo,
  };
}

async function buscarClientes(q) {
  if (typeof q !== 'string' || q.trim().length < 2) {
    throw new AppError(400, 'El parámetro de búsqueda q debe tener al menos 2 caracteres');
  }

  const termino = q.trim();

  const clientes = await prisma.usuario.findMany({
    where: {
      rol: 'cliente',
      OR: [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { email: { contains: termino, mode: 'insensitive' } },
      ],
    },
    orderBy: { nombre: 'asc' },
    take: LIMITE_BUSQUEDA,
  });

  return clientes.map(serializarCliente);
}

async function obtenerHistorialCliente(usuarioId) {
  validarUUID(usuarioId, 'id');

  const cliente = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!cliente) throw new AppError(404, 'Cliente no encontrado');

  const turnos = await prisma.turno.findMany({
    where: {
      clienteId: usuarioId,
      fechaFin: { lt: new Date() },
    },
    include: {
      servicio: true,
      barbero: { include: { usuario: { select: { nombre: true } } } },
      cliente: { select: { id: true, nombre: true, email: true, telefono: true } },
    },
    orderBy: { fechaInicio: 'desc' },
  });

  return {
    cliente: serializarCliente(cliente),
    turnos: turnos.map(serializarTurno),
  };
}

module.exports = { buscarClientes, obtenerHistorialCliente };
