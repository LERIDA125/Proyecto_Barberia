const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { validarUUID, validarEnteroPositivo } = require('../utils/validators');
const { serializarTurno } = require('../utils/serializers');

const LIMITE_BUSQUEDA = 20;
const LIMITE_CLIENTES_DEFAULT = 200;
const LIMITE_CLIENTES_MAX = 500;

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

function resolverLimite(limite) {
  if (limite === undefined || limite === null || limite === '') {
    return LIMITE_CLIENTES_DEFAULT;
  }
  const numero = validarEnteroPositivo(limite, 'limite');
  return Math.min(numero, LIMITE_CLIENTES_MAX);
}

async function listarClientes({ limite } = {}) {
  const take = resolverLimite(limite);

  const clientes = await prisma.usuario.findMany({
    where: { rol: 'cliente' },
    orderBy: { nombre: 'asc' },
    take,
    include: { _count: { select: { turnos: true } } },
  });

  return clientes.map((usuario) => ({
    ...serializarCliente(usuario),
    totalTurnos: usuario._count.turnos,
  }));
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

  const completados = turnos.filter((turno) => turno.estado === 'completado');

  const resumen = {
    totalTurnos: turnos.length,
    completados: completados.length,
    totalGastado: completados.reduce((suma, turno) => suma + Number(turno.servicio.precio), 0),
    ultimaVisita: turnos[0]?.fechaInicio ?? null,
  };

  return {
    cliente: serializarCliente(cliente),
    turnos: turnos.map(serializarTurno),
    resumen,
  };
}

module.exports = { buscarClientes, listarClientes, obtenerHistorialCliente };
