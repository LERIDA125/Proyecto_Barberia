const AppError = require('../utils/AppError');
const barberosService = require('../services/barberos.service');
const turnosService = require('../services/turnos.service');

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ESTADOS_ACTIVOS = ['pendiente', 'confirmado'];

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'consultar_disponibilidad',
      description:
        'Devuelve las franjas horarias libres de un barbero para una fecha. Usá el barberoId del catálogo. Si el cliente indicó un servicio, pasá también su servicioId para respetar la duración.',
      parameters: {
        type: 'object',
        properties: {
          barberoId: { type: 'string', description: 'ID (UUID) del barbero.' },
          fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD.' },
          servicioId: { type: 'string', description: 'ID (UUID) del servicio (opcional).' },
        },
        required: ['barberoId', 'fecha'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reservar_turno',
      description:
        'Crea un turno para el cliente autenticado. Requiere confirmación previa del cliente. El turno queda a nombre del usuario de la sesión: no envíes datos del cliente ni su id.',
      parameters: {
        type: 'object',
        properties: {
          barberoId: { type: 'string', description: 'ID (UUID) del barbero.' },
          servicioId: { type: 'string', description: 'ID (UUID) del servicio.' },
          fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD.' },
          hora: { type: 'string', description: 'Hora en formato HH:MM (24 horas).' },
        },
        required: ['barberoId', 'servicioId', 'fecha', 'hora'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'consultar_mis_turnos',
      description:
        'Devuelve los turnos activos o futuros del cliente autenticado. No requiere parámetros: el usuario se toma de la sesión. Usala para que el cliente vea sus próximos turnos.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancelar_turno',
      description:
        'Cancela un turno del cliente autenticado. Requiere confirmación explícita previa. Pedí el turnoId con consultar_mis_turnos; no inventes ni pidas el id del cliente.',
      parameters: {
        type: 'object',
        properties: {
          turnoId: { type: 'string', description: 'ID (UUID) del turno a cancelar.' },
          motivo: { type: 'string', description: 'Motivo de la cancelación (opcional).' },
        },
        required: ['turnoId'],
        additionalProperties: false,
      },
    },
  },
];

async function consultarDisponibilidad(args) {
  const { barberoId, fecha, servicioId } = args || {};
  return barberosService.disponibilidad({ barberoId, fecha, servicioId });
}

async function reservarTurno(args, usuario) {
  const { barberoId, servicioId, fecha, hora } = args || {};

  if (!usuario || !usuario.id) {
    throw new AppError(401, 'No hay una sesión autenticada para reservar');
  }
  if (typeof fecha !== 'string' || !RE_FECHA.test(fecha)) {
    throw new AppError(400, 'fecha inválida (formato YYYY-MM-DD)');
  }
  if (typeof hora !== 'string' || !RE_HORA.test(hora)) {
    throw new AppError(400, 'hora inválida (formato HH:MM)');
  }

  const fechaInicio = new Date(`${fecha}T${hora}:00`);

  // El clienteId SIEMPRE proviene de la sesión, nunca de la entrada del modelo.
  return turnosService.crear({
    clienteId: usuario.id,
    barberoId,
    servicioId,
    fechaInicio,
  });
}

function compactarTurno(turno) {
  return {
    id: turno.id,
    servicio: turno.servicio?.nombre ?? null,
    barbero: turno.barbero?.nombre ?? null,
    fechaInicio: turno.fechaInicio,
    estado: turno.estado,
  };
}

async function consultarMisTurnos(_args, usuario) {
  if (!usuario || !usuario.id) {
    throw new AppError(401, 'No hay una sesión autenticada para consultar tus turnos');
  }

  const turnos = await turnosService.listar({ usuario });
  const ahora = Date.now();

  return turnos
    .filter(
      (turno) =>
        ESTADOS_ACTIVOS.includes(turno.estado) &&
        new Date(turno.fechaInicio).getTime() >= ahora
    )
    .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
    .slice(0, 10)
    .map(compactarTurno);
}

async function cancelarTurno(args, usuario) {
  const { turnoId, motivo } = args || {};

  if (!usuario || !usuario.id) {
    throw new AppError(401, 'No hay una sesión autenticada para cancelar el turno');
  }
  if (typeof turnoId !== 'string' || !RE_UUID.test(turnoId)) {
    throw new AppError(400, 'turnoId inválido (debe ser un UUID)');
  }

  // turnosService.cancelar verifica que el turno pertenezca al usuario de la sesión.
  const turno = await turnosService.cancelar({ id: turnoId, usuario, motivo });
  return compactarTurno(turno);
}

const EJECUTORES = {
  consultar_disponibilidad: consultarDisponibilidad,
  reservar_turno: reservarTurno,
  consultar_mis_turnos: consultarMisTurnos,
  cancelar_turno: cancelarTurno,
};

async function ejecutarTool(nombre, args, usuario) {
  const ejecutor = EJECUTORES[nombre];
  if (!ejecutor) {
    return { error: `Herramienta desconocida: ${nombre}` };
  }

  try {
    return await ejecutor(args, usuario);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    console.error(`[asistente] error en tool ${nombre}:`, err.message);
    return { error: 'Ocurrió un error al ejecutar la herramienta.' };
  }
}

module.exports = { TOOLS, ejecutarTool };
