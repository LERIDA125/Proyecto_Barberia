const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { requerirCampos, validarUUID, parseFechaTexto, validarFecha } = require('../utils/validators');
const { serializarTurno } = require('../utils/serializers');

const ESTADOS_OCUPADOS = ['pendiente', 'confirmado'];
const ESTADOS = ['pendiente', 'confirmado', 'cancelado', 'completado', 'ausente'];
const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

function serializarBarbero(barbero) {
  return {
    id: barbero.id,
    nombre: barbero.usuario ? barbero.usuario.nombre : null,
    especialidad: barbero.especialidad,
    activo: barbero.activo,
  };
}

function combinarFechaHora(fecha, hora) {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    hora.getUTCHours(),
    hora.getUTCMinutes(),
    0,
    0
  );
}

function formatearHora(fecha) {
  if (!fecha) return null;
  const valor = new Date(fecha);
  return `${String(valor.getUTCHours()).padStart(2, '0')}:${String(valor.getUTCMinutes()).padStart(2, '0')}`;
}

function parseHora(valor, campo) {
  if (typeof valor !== 'string' || !RE_HORA.test(valor)) {
    throw new AppError(400, `${campo} inválido (formato HH:MM)`);
  }
  const [horas, minutos] = valor.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(horas), Number(minutos), 0, 0));
}

function validarHorario(barbero, inicio, fin) {
  if (!barbero.horarioInicio || !barbero.horarioFin || barbero.diasLaborales.length === 0) {
    throw new AppError(422, 'El barbero no tiene horario configurado');
  }

  if (!barbero.diasLaborales.includes(inicio.getDay())) {
    throw new AppError(422, 'El barbero no atiende ese día');
  }

  const inicioJornada = new Date(inicio);
  inicioJornada.setHours(barbero.horarioInicio.getUTCHours(), barbero.horarioInicio.getUTCMinutes(), 0, 0);

  const finJornada = new Date(inicio);
  finJornada.setHours(barbero.horarioFin.getUTCHours(), barbero.horarioFin.getUTCMinutes(), 0, 0);

  if (inicio < inicioJornada || fin > finJornada) {
    throw new AppError(422, 'El horario solicitado está fuera de la jornada del barbero');
  }
}

function rangoFechas(desde, hasta) {
  const hoy = new Date();
  const inicio = desde
    ? parseFechaTexto(desde)
    : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);

  let fin;
  if (hasta) {
    fin = parseFechaTexto(hasta);
    fin.setHours(23, 59, 59, 999);
  } else {
    fin = new Date(inicio);
    fin.setHours(23, 59, 59, 999);
  }

  if (inicio > fin) throw new AppError(400, 'Rango de fechas inválido');
  return { inicio, fin };
}

async function resolverBarberoDeUsuario(usuarioId) {
  const barbero = await prisma.barbero.findUnique({ where: { usuarioId } });
  if (!barbero) throw new AppError(403, 'El usuario no es un barbero');
  return barbero;
}

async function listar() {
  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    include: { usuario: { select: { nombre: true } } },
    orderBy: { usuario: { nombre: 'asc' } },
  });
  return barberos.map(serializarBarbero);
}

async function disponibilidad({ barberoId, fecha, servicioId }) {
  requerirCampos({ barberoId, fecha, servicioId }, ['barberoId', 'fecha', 'servicioId']);
  validarUUID(barberoId, 'barberoId');
  validarUUID(servicioId, 'servicioId');
  const dia = parseFechaTexto(fecha);

  const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
  if (!barbero) throw new AppError(404, 'Barbero no encontrado');

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) throw new AppError(404, 'Servicio no encontrado');

  const franjas = [];

  if (!barbero.horarioInicio || !barbero.horarioFin || barbero.diasLaborales.length === 0) {
    return { fecha, barberoId, servicioId, franjas };
  }

  if (!barbero.diasLaborales.includes(dia.getDay())) {
    return { fecha, barberoId, servicioId, franjas };
  }

  const inicioJornada = combinarFechaHora(dia, barbero.horarioInicio);
  const finJornada = combinarFechaHora(dia, barbero.horarioFin);
  const duracionMs = servicio.duracionMin * 60000;

  if (inicioJornada >= finJornada) {
    return { fecha, barberoId, servicioId, franjas };
  }

  const finDia = new Date(inicioJornada);
  finDia.setHours(23, 59, 59, 999);

  const ocupados = await prisma.turno.findMany({
    where: {
      barberoId,
      estado: { in: ESTADOS_OCUPADOS },
      fechaInicio: { lt: finDia },
      fechaFin: { gt: inicioJornada },
    },
    select: { fechaInicio: true, fechaFin: true },
  });

  const bloqueos = await prisma.bloqueo.findMany({
    where: {
      barberoId,
      inicio: { lt: finDia },
      fin: { gt: inicioJornada },
    },
    select: { inicio: true, fin: true },
  });

  const ahora = new Date();

  for (
    let inicio = inicioJornada;
    inicio.getTime() + duracionMs <= finJornada.getTime();
    inicio = new Date(inicio.getTime() + duracionMs)
  ) {
    const fin = new Date(inicio.getTime() + duracionMs);
    if (inicio <= ahora) continue;
    const solapa =
      ocupados.some((turno) => inicio < turno.fechaFin && fin > turno.fechaInicio) ||
      bloqueos.some((bloqueo) => inicio < bloqueo.fin && fin > bloqueo.inicio);
    if (solapa) continue;
    franjas.push({ inicio: inicio.toISOString(), fin: fin.toISOString() });
  }

  return { fecha, barberoId, servicioId, franjas };
}

async function agendaBarbero(barberoId, desde, hasta) {
  const { inicio, fin } = rangoFechas(desde, hasta);
  const turnos = await prisma.turno.findMany({
    where: { barberoId, fechaInicio: { gte: inicio, lte: fin } },
    include: {
      servicio: true,
      cliente: { select: { id: true, nombre: true, email: true, telefono: true } },
    },
    orderBy: { fechaInicio: 'asc' },
  });
  return turnos.map(serializarTurno);
}

async function miAgenda({ usuario, desde, hasta }) {
  const barbero = await resolverBarberoDeUsuario(usuario.id);
  return agendaBarbero(barbero.id, desde, hasta);
}

async function agendaDeBarbero({ barberoId, usuario, desde, hasta }) {
  validarUUID(barberoId, 'id');

  if (usuario.rol !== 'admin') {
    const propio = await resolverBarberoDeUsuario(usuario.id);
    if (propio.id !== barberoId) throw new AppError(403, 'No autorizado');
  }

  const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
  if (!barbero) throw new AppError(404, 'Barbero no encontrado');

  return agendaBarbero(barbero.id, desde, hasta);
}

function serializarDisponibilidad(barbero) {
  return {
    barberoId: barbero.id,
    horarioInicio: formatearHora(barbero.horarioInicio),
    horarioFin: formatearHora(barbero.horarioFin),
    diasLaborales: barbero.diasLaborales,
  };
}

async function obtenerDisponibilidadConfig(usuarioId) {
  const barbero = await resolverBarberoDeUsuario(usuarioId);
  return serializarDisponibilidad(barbero);
}

async function actualizarDisponibilidad(usuarioId, datos) {
  requerirCampos(datos, ['horarioInicio', 'horarioFin', 'diasLaborales']);
  if (!Array.isArray(datos.diasLaborales)) {
    throw new AppError(400, 'diasLaborales debe ser un arreglo');
  }

  const dias = [...new Set(datos.diasLaborales.map((dia) => Number(dia)))].sort((a, b) => a - b);
  if (dias.some((dia) => !Number.isInteger(dia) || dia < 0 || dia > 6)) {
    throw new AppError(400, 'diasLaborales inválidos (deben ser 0-6)');
  }

  const horarioInicio = parseHora(datos.horarioInicio, 'horarioInicio');
  const horarioFin = parseHora(datos.horarioFin, 'horarioFin');
  if (horarioInicio >= horarioFin) {
    throw new AppError(400, 'horarioInicio debe ser menor que horarioFin');
  }

  const barbero = await resolverBarberoDeUsuario(usuarioId);
  const actualizado = await prisma.barbero.update({
    where: { id: barbero.id },
    data: { horarioInicio, horarioFin, diasLaborales: dias },
  });

  return serializarDisponibilidad(actualizado);
}

async function metricas({ usuario, barberoId, desde, hasta }) {
  let objetivoId = barberoId;

  if (objetivoId) {
    validarUUID(objetivoId, 'barberoId');
    if (usuario.rol !== 'admin') {
      const propio = await resolverBarberoDeUsuario(usuario.id);
      if (propio.id !== objetivoId) throw new AppError(403, 'No autorizado');
    }
    const existe = await prisma.barbero.findUnique({ where: { id: objetivoId } });
    if (!existe) throw new AppError(404, 'Barbero no encontrado');
  } else {
    objetivoId = (await resolverBarberoDeUsuario(usuario.id)).id;
  }

  const { inicio, fin } = rangoFechas(desde, hasta);
  const turnos = await prisma.turno.findMany({
    where: { barberoId: objetivoId, fechaInicio: { gte: inicio, lte: fin } },
    select: { estado: true },
  });

  const resumen = { pendiente: 0, confirmado: 0, completado: 0, cancelado: 0, ausente: 0 };
  for (const turno of turnos) resumen[turno.estado] += 1;

  return {
    barberoId: objetivoId,
    desde: inicio,
    hasta: fin,
    total: turnos.length,
    ...resumen,
  };
}

function serializarBloqueo(bloqueo) {
  return {
    id: bloqueo.id,
    barberoId: bloqueo.barberoId,
    inicio: bloqueo.inicio,
    fin: bloqueo.fin,
    motivo: bloqueo.motivo,
  };
}

async function listarBloqueos(usuarioId) {
  const barbero = await resolverBarberoDeUsuario(usuarioId);
  const bloqueos = await prisma.bloqueo.findMany({
    where: { barberoId: barbero.id },
    orderBy: { inicio: 'asc' },
  });
  return bloqueos.map(serializarBloqueo);
}

async function crearBloqueo(usuarioId, datos) {
  requerirCampos(datos, ['inicio', 'fin']);

  const inicio = validarFecha(datos.inicio, 'inicio');
  const fin = validarFecha(datos.fin, 'fin');

  if (fin <= inicio) {
    throw new AppError(400, 'La fecha de fin debe ser posterior a la fecha de inicio');
  }

  const barbero = await resolverBarberoDeUsuario(usuarioId);

  const bloqueo = await prisma.bloqueo.create({
    data: {
      barberoId: barbero.id,
      inicio,
      fin,
      motivo: datos.motivo != null ? String(datos.motivo).trim() || null : null,
    },
  });

  return serializarBloqueo(bloqueo);
}

async function eliminarBloqueo(usuarioId, id) {
  validarUUID(id, 'id');

  const barbero = await resolverBarberoDeUsuario(usuarioId);

  const bloqueo = await prisma.bloqueo.findUnique({ where: { id } });
  if (!bloqueo) throw new AppError(404, 'Bloqueo no encontrado');
  if (bloqueo.barberoId !== barbero.id) {
    throw new AppError(403, 'No autorizado para eliminar este bloqueo');
  }

  await prisma.bloqueo.delete({ where: { id } });
  return { ok: true };
}

module.exports = {
  ESTADOS,
  ESTADOS_OCUPADOS,
  listar,
  disponibilidad,
  validarHorario,
  serializarBarbero,
  resolverBarberoDeUsuario,
  miAgenda,
  agendaDeBarbero,
  obtenerDisponibilidadConfig,
  actualizarDisponibilidad,
  metricas,
  listarBloqueos,
  crearBloqueo,
  eliminarBloqueo,
};