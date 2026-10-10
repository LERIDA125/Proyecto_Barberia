const prisma = require('../config/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { validarUUID } = require('../utils/validators');
const googleCalendar = require('../mcp/google-calendar');

const INCLUDE_TURNO = {
  servicio: true,
  barbero: { include: { usuario: { select: { nombre: true } } } },
  cliente: { select: { id: true, nombre: true } },
};

function pendiente(motivo) {
  return { sincronizado: false, eventId: null, pendiente: true, motivo };
}

function construirResumen({ servicio, cliente }) {
  return `Turno: ${servicio ?? 'Servicio'} - ${cliente ?? 'Cliente'}`;
}

function construirDescripcion({ servicio, barbero, cliente, notas }) {
  const partes = [];
  if (barbero) partes.push(`Barbero: ${barbero}`);
  if (servicio) partes.push(`Servicio: ${servicio}`);
  if (cliente) partes.push(`Cliente: ${cliente}`);
  if (notas) partes.push(`Notas: ${notas}`);
  return partes.join('\n');
}

// --- Operaciones base contra el MCP (propagan McpError) ---

async function realizarAlta({ turnoId, titulo, inicio, fin, descripcion }) {
  const resultado = await googleCalendar.crearEvento({ titulo, inicio, fin, descripcion });
  const eventId = resultado?.eventId ?? null;
  if (eventId) {
    await prisma.turno.update({ where: { id: turnoId }, data: { googleEventId: eventId } });
  }
  return {
    sincronizado: Boolean(eventId),
    eventId,
    pendiente: !eventId,
    motivo: eventId ? null : 'El servidor MCP no devolvió un eventId',
  };
}

async function realizarReprogramacion({ turnoId, googleEventId, titulo, inicio, fin, descripcion }) {
  if (!googleEventId) {
    return realizarAlta({ turnoId, titulo, inicio, fin, descripcion });
  }
  await googleCalendar.actualizarEvento({ eventId: googleEventId, inicio, fin, titulo, descripcion });
  return { sincronizado: true, eventId: googleEventId, pendiente: false, motivo: null };
}

async function realizarCancelacion({ turnoId, googleEventId }) {
  if (!googleEventId) {
    return { sincronizado: false, eventId: null, pendiente: false, motivo: 'El turno no tenía evento' };
  }
  await googleCalendar.eliminarEvento({ eventId: googleEventId });
  await prisma.turno.update({ where: { id: turnoId }, data: { googleEventId: null } });
  return { sincronizado: true, eventId: null, pendiente: false, motivo: null };
}

// --- Envoltorios resilientes para los flujos de turnos (NUNCA lanzan) ---

async function sincronizarAlta(datos) {
  if (!googleCalendar.configurado()) return pendiente('La integración no está configurada');
  try {
    return await realizarAlta(datos);
  } catch (err) {
    console.warn('[integraciones] no se pudo crear el evento:', err.message);
    return pendiente(err.message);
  }
}

async function sincronizarReprogramacion(datos) {
  if (!googleCalendar.configurado()) return pendiente('La integración no está configurada');
  try {
    return await realizarReprogramacion(datos);
  } catch (err) {
    console.warn('[integraciones] no se pudo actualizar el evento:', err.message);
    return pendiente(err.message);
  }
}

async function sincronizarCancelacion(datos) {
  if (!googleCalendar.configurado()) {
    return { sincronizado: false, eventId: null, pendiente: false, motivo: 'La integración no está configurada' };
  }
  try {
    return await realizarCancelacion(datos);
  } catch (err) {
    console.warn('[integraciones] no se pudo eliminar el evento:', err.message);
    return pendiente(err.message);
  }
}

// --- Endpoints (Admin / Barbero) ---

async function estado() {
  const configurado = googleCalendar.configurado();

  const ultimo = await prisma.turno
    .findFirst({
      where: { googleEventId: { not: null } },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    })
    .catch(() => null);

  let conectado = false;
  if (configurado) {
    try {
      const resultado = await googleCalendar.verificarConexion();
      conectado = Boolean(resultado?.conectado);
    } catch (err) {
      console.warn('[integraciones] verificación de conexión falló:', err.message);
    }
  }

  return {
    conectado,
    configurado,
    calendarId: env.mcpCalendarId,
    ultimaSync: ultimo?.updatedAt ?? null,
  };
}

async function listarEventos({ desde, hasta, calendarId }) {
  return googleCalendar.consultarEventos({
    desde: desde || null,
    hasta: hasta || null,
    calendarId: calendarId || env.mcpCalendarId,
  });
}

async function reconectar() {
  if (!googleCalendar.configurado()) {
    throw new AppError(503, 'La integración con Google Calendar no está configurada');
  }
  const resultado = await googleCalendar.verificarConexion();
  return { reconectado: Boolean(resultado?.conectado), ...(await estado()) };
}

async function sincronizarTurno(turnoId) {
  validarUUID(turnoId, 'turnoId');

  const turno = await prisma.turno.findUnique({ where: { id: turnoId }, include: INCLUDE_TURNO });
  if (!turno) throw new AppError(404, 'Turno no encontrado');
  if (!googleCalendar.configurado()) {
    throw new AppError(503, 'La integración con Google Calendar no está configurada');
  }

  const datos = {
    turnoId: turno.id,
    googleEventId: turno.googleEventId,
    titulo: construirResumen({ servicio: turno.servicio?.nombre, cliente: turno.cliente?.nombre }),
    inicio: turno.fechaInicio.toISOString(),
    fin: turno.fechaFin.toISOString(),
    descripcion: construirDescripcion({
      servicio: turno.servicio?.nombre,
      barbero: turno.barbero?.usuario?.nombre,
      cliente: turno.cliente?.nombre,
      notas: turno.notas,
    }),
  };

  if (turno.estado === 'cancelado') {
    return realizarCancelacion(datos);
  }
  if (turno.estado === 'pendiente' || turno.estado === 'confirmado') {
    return realizarReprogramacion(datos);
  }
  throw new AppError(409, 'El estado del turno no es sincronizable');
}

module.exports = {
  estado,
  listarEventos,
  reconectar,
  sincronizarTurno,
  sincronizarAlta,
  sincronizarReprogramacion,
  sincronizarCancelacion,
  construirResumen,
  construirDescripcion,
};
