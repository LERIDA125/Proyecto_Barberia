const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { requerirCampos, validarUUID, validarFecha, parseFechaTexto } = require('../utils/validators');
const { serializarTurno } = require('../utils/serializers');
const { ESTADOS, ESTADOS_OCUPADOS, validarHorario } = require('./barberos.service');
const notificacionesService = require('./notificaciones.service');

const TRANSICIONES_VALIDAS = {
  pendiente: ['confirmado', 'cancelado', 'ausente'],
  confirmado: ['completado', 'cancelado', 'ausente'],
  ausente: [],
  completado: [],
  cancelado: [],
};

const INCLUDE_DETALLE = {
  servicio: true,
  barbero: { include: { usuario: { select: { nombre: true } } } },
  cliente: { select: { id: true, nombre: true, email: true, telefono: true } },
};

function formatearFechaNotificacion(fecha) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha);
}

function notificacionPorEstado(estado, turno, fecha) {
  const servicio = turno.servicio?.nombre ?? 'tu servicio';
  switch (estado) {
    case 'confirmado':
      return { titulo: 'Turno Confirmado', mensaje: `Tu turno de ${servicio} del ${fecha} fue confirmado.` };
    case 'completado':
      return { titulo: 'Turno Completado', mensaje: `Tu turno de ${servicio} del ${fecha} fue marcado como completado.` };
    case 'cancelado':
      return { titulo: 'Turno Cancelado', mensaje: `Tu turno de ${servicio} del ${fecha} fue cancelado.` };
    case 'ausente':
      return { titulo: 'Turno Ausente', mensaje: `Registramos tu ausencia al turno de ${servicio} del ${fecha}.` };
    default:
      return null;
  }
}

function verificarPropietario(turno, usuario) {
  const esDueno = turno.clienteId === usuario.id;
  const esAdmin = usuario.rol === 'admin';
  if (!esDueno && !esAdmin) {
    throw new AppError(403, 'No autorizado para gestionar este turno');
  }
}

function validarVentanaCancelacion(fechaInicio) {
  const horas = Number(env.ventanaCancelacionHoras) || 0;
  if (horas <= 0) return;
  const limite = new Date(Date.now() + horas * 3600000);
  if (fechaInicio < limite) {
    throw new AppError(422, `No se puede cancelar con menos de ${horas} horas de anticipación`);
  }
}

async function crear({ clienteId, barberoId, servicioId, fechaInicio, notas }) {
  requerirCampos(
    { clienteId, barberoId, servicioId, fechaInicio },
    ['clienteId', 'barberoId', 'servicioId', 'fechaInicio']
  );
  validarUUID(clienteId, 'clienteId');
  validarUUID(barberoId, 'barberoId');
  validarUUID(servicioId, 'servicioId');

  const inicio = validarFecha(fechaInicio, 'fechaInicio');
  if (inicio <= new Date()) {
    throw new AppError(400, 'La fecha del turno debe ser futura');
  }

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) throw new AppError(404, 'Servicio no encontrado');
  if (!servicio.activo) throw new AppError(400, 'El servicio no está disponible');

  const barbero = await prisma.barbero.findUnique({
    where: { id: barberoId },
    include: { usuario: { select: { id: true, nombre: true } } },
  });
  if (!barbero) throw new AppError(404, 'Barbero no encontrado');
  if (!barbero.activo) throw new AppError(400, 'El barbero no está disponible');

  const cliente = await prisma.usuario.findUnique({ where: { id: clienteId } });
  if (!cliente) throw new AppError(404, 'Cliente no encontrado');

  const fin = new Date(inicio.getTime() + servicio.duracionMin * 60000);
  validarHorario(barbero, inicio, fin);

  const turno = await prisma.$transaction(async (tx) => {
    const cruce = await tx.turno.findFirst({
      where: {
        barberoId,
        estado: { in: ESTADOS_OCUPADOS },
        fechaInicio: { lt: fin },
        fechaFin: { gt: inicio },
      },
    });
    if (cruce) throw new AppError(409, 'La franja horaria ya está ocupada');

    const bloqueo = await tx.bloqueo.findFirst({
      where: {
        barberoId,
        inicio: { lt: fin },
        fin: { gt: inicio },
      },
    });
    if (bloqueo) {
      throw new AppError(400, 'El horario seleccionado ha sido bloqueado por el barbero');
    }

    const creado = await tx.turno.create({
      data: {
        clienteId,
        barberoId,
        servicioId,
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'confirmado',
        googleEventId: null,
        notas: notas ? String(notas) : null,
      },
    });

    const fecha = formatearFechaNotificacion(inicio);
    await notificacionesService.crearNotificacion(
      {
        usuarioId: clienteId,
        titulo: 'Turno Confirmado',
        mensaje: `Tu turno de ${servicio.nombre} con ${barbero.usuario.nombre} quedó confirmado para el ${fecha}.`,
      },
      tx
    );
    await notificacionesService.crearNotificacion(
      {
        usuarioId: barbero.usuarioId,
        titulo: 'Nuevo Turno Agendado',
        mensaje: `${cliente.nombre} reservó ${servicio.nombre} para el ${fecha}.`,
      },
      tx
    );

    return creado;
  });

  return serializarTurno(turno);
}

async function listar({ usuario, filtros = {} }) {
  const where = {};

  if (usuario.rol === 'admin' && filtros.clienteId) {
    validarUUID(filtros.clienteId, 'clienteId');
    where.clienteId = filtros.clienteId;
  } else {
    where.clienteId = usuario.id;
  }

  if (filtros.estado) {
    if (!ESTADOS.includes(filtros.estado)) throw new AppError(400, 'estado inválido');
    where.estado = filtros.estado;
  }

  if (filtros.desde || filtros.hasta) {
    where.fechaInicio = {};
    if (filtros.desde) where.fechaInicio.gte = parseFechaTexto(filtros.desde);
    if (filtros.hasta) {
      const hasta = parseFechaTexto(filtros.hasta);
      hasta.setHours(23, 59, 59, 999);
      where.fechaInicio.lte = hasta;
    }
  }

  const turnos = await prisma.turno.findMany({
    where,
    include: INCLUDE_DETALLE,
    orderBy: { fechaInicio: 'desc' },
  });

  return turnos.map(serializarTurno);
}

async function obtenerPorId(id, usuario) {
  validarUUID(id, 'id');

  const turno = await prisma.turno.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!turno) throw new AppError(404, 'Turno no encontrado');

  const esDueno = turno.clienteId === usuario.id;
  const esAdmin = usuario.rol === 'admin';

  let esBarbero = false;
  if (!esDueno && !esAdmin && usuario.rol === 'barbero') {
    const barbero = await prisma.barbero.findUnique({ where: { usuarioId: usuario.id } });
    esBarbero = Boolean(barbero && barbero.id === turno.barberoId);
  }

  if (!esDueno && !esBarbero && !esAdmin) {
    throw new AppError(403, 'No autorizado');
  }

  return serializarTurno(turno);
}

async function cancelar({ id, usuario, motivo }) {
  validarUUID(id, 'id');

  const turno = await prisma.turno.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!turno) throw new AppError(404, 'Turno no encontrado');

  verificarPropietario(turno, usuario);

  if (turno.estado === 'cancelado') throw new AppError(409, 'El turno ya está cancelado');
  if (turno.estado === 'completado') throw new AppError(409, 'No se puede cancelar un turno completado');
  if (turno.fechaInicio <= new Date()) throw new AppError(409, 'No se puede cancelar un turno que ya pasó');

  validarVentanaCancelacion(turno.fechaInicio);

  const notas = motivo
    ? `${turno.notas ? `${turno.notas}\n` : ''}[Cancelación] ${String(motivo).trim()}`
    : turno.notas;

  const actualizado = await prisma.$transaction(async (tx) => {
    const turnoActualizado = await tx.turno.update({
      where: { id },
      data: { estado: 'cancelado', notas },
      include: INCLUDE_DETALLE,
    });

    const fecha = formatearFechaNotificacion(turno.fechaInicio);
    const motivoTexto = motivo ? ` Motivo: ${String(motivo).trim()}.` : '';

    if (turno.clienteId !== usuario.id) {
      await notificacionesService.crearNotificacion(
        {
          usuarioId: turno.clienteId,
          titulo: 'Turno Cancelado',
          mensaje: `Tu turno de ${turno.servicio.nombre} del ${fecha} fue cancelado.${motivoTexto}`,
        },
        tx
      );
    }

    if (turno.barbero && turno.barbero.usuarioId !== usuario.id) {
      await notificacionesService.crearNotificacion(
        {
          usuarioId: turno.barbero.usuarioId,
          titulo: 'Turno Cancelado',
          mensaje: `El turno de ${turno.cliente.nombre} del ${fecha} fue cancelado.${motivoTexto}`,
        },
        tx
      );
    }

    return turnoActualizado;
  });

  return serializarTurno(actualizado);
}

async function reprogramar({ id, usuario, nuevaFechaInicio }) {
  requerirCampos({ nuevaFechaInicio }, ['nuevaFechaInicio']);
  validarUUID(id, 'id');

  const inicio = validarFecha(nuevaFechaInicio, 'nuevaFechaInicio');
  if (inicio <= new Date()) {
    throw new AppError(400, 'La nueva fecha del turno debe ser futura');
  }

  const turno = await prisma.turno.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!turno) throw new AppError(404, 'Turno no encontrado');

  verificarPropietario(turno, usuario);

  if (turno.estado === 'cancelado') throw new AppError(409, 'No se puede reprogramar un turno cancelado');
  if (turno.estado === 'completado') throw new AppError(409, 'No se puede reprogramar un turno completado');
  if (turno.fechaInicio <= new Date()) throw new AppError(409, 'No se puede reprogramar un turno que ya pasó');

  const barbero = await prisma.barbero.findUnique({ where: { id: turno.barberoId } });
  if (!barbero) throw new AppError(404, 'Barbero no encontrado');

  const fin = new Date(inicio.getTime() + turno.servicio.duracionMin * 60000);
  validarHorario(barbero, inicio, fin);

  const actualizado = await prisma.$transaction(async (tx) => {
    const cruce = await tx.turno.findFirst({
      where: {
        id: { not: id },
        barberoId: turno.barberoId,
        estado: { in: ESTADOS_OCUPADOS },
        fechaInicio: { lt: fin },
        fechaFin: { gt: inicio },
      },
    });
    if (cruce) throw new AppError(409, 'La franja horaria ya está ocupada');

    const bloqueo = await tx.bloqueo.findFirst({
      where: {
        barberoId: turno.barberoId,
        inicio: { lt: fin },
        fin: { gt: inicio },
      },
    });
    if (bloqueo) {
      throw new AppError(400, 'El horario seleccionado ha sido bloqueado por el barbero');
    }

    return tx.turno.update({
      where: { id },
      data: { fechaInicio: inicio, fechaFin: fin },
      include: INCLUDE_DETALLE,
    });
  });

  return serializarTurno(actualizado);
}

async function cambiarEstado({ id, usuario, estado }) {
  requerirCampos({ estado }, ['estado']);
  validarUUID(id, 'id');
  if (!ESTADOS.includes(estado)) throw new AppError(400, 'estado inválido');

  const turno = await prisma.turno.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!turno) throw new AppError(404, 'Turno no encontrado');

  const esAdmin = usuario.rol === 'admin';
  let esBarberoAsignado = false;
  if (usuario.rol === 'barbero') {
    const barbero = await prisma.barbero.findUnique({ where: { usuarioId: usuario.id } });
    esBarberoAsignado = Boolean(barbero && barbero.id === turno.barberoId);
  }

  if (!esAdmin && !esBarberoAsignado) {
    throw new AppError(403, 'No autorizado para gestionar este turno');
  }

  const permitidos = TRANSICIONES_VALIDAS[turno.estado] || [];
  if (!permitidos.includes(estado)) {
    throw new AppError(409, `Transición de estado inválida: ${turno.estado} → ${estado}`);
  }

  const actualizado = await prisma.$transaction(async (tx) => {
    const turnoActualizado = await tx.turno.update({
      where: { id },
      data: { estado },
      include: INCLUDE_DETALLE,
    });

    if (turno.clienteId !== usuario.id) {
      const notificacion = notificacionPorEstado(
        estado,
        turno,
        formatearFechaNotificacion(turno.fechaInicio)
      );
      if (notificacion) {
        await notificacionesService.crearNotificacion(
          { usuarioId: turno.clienteId, ...notificacion },
          tx
        );
      }
    }

    return turnoActualizado;
  });

  return serializarTurno(actualizado);
}

async function actualizarNotas({ id, usuario, notas }) {
  validarUUID(id, 'id');

  if (typeof notas !== 'string') {
    throw new AppError(400, 'Las notas deben ser un texto');
  }

  const textoLimpio = notas.trim();
  if (textoLimpio.length > 1000) {
    throw new AppError(400, 'Las notas no pueden superar los 1000 caracteres');
  }

  const turno = await prisma.turno.findUnique({ where: { id }, include: INCLUDE_DETALLE });
  if (!turno) throw new AppError(404, 'Turno no encontrado');

  const esAdmin = usuario.rol === 'admin';
  let esBarberoAsignado = false;
  if (usuario.rol === 'barbero') {
    const barbero = await prisma.barbero.findUnique({ where: { usuarioId: usuario.id } });
    esBarberoAsignado = Boolean(barbero && barbero.id === turno.barberoId);
  }

  if (!esAdmin && !esBarberoAsignado) {
    throw new AppError(403, 'No autorizado para editar la nota de este turno');
  }

  const actualizado = await prisma.turno.update({
    where: { id },
    data: { notas: textoLimpio || null },
    include: INCLUDE_DETALLE,
  });

  return serializarTurno(actualizado);
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  cancelar,
  reprogramar,
  cambiarEstado,
  actualizarNotas,
  serializarTurno,
};