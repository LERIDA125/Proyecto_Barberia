const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parseFechaTexto } = require('../utils/validators');

const ESTADOS_OCUPADOS = ['pendiente', 'confirmado', 'completado', 'ausente'];

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

async function obtenerMetricas({ desde, hasta }) {
  const { inicio, fin } = rangoFechas(desde, hasta);

  const turnos = await prisma.turno.findMany({
    where: { fechaInicio: { gte: inicio, lte: fin } },
    select: {
      estado: true,
      fechaInicio: true,
      fechaFin: true,
      servicio: { select: { id: true, nombre: true, precio: true } },
    },
  });

  const porEstado = {
    pendiente: 0,
    confirmado: 0,
    completado: 0,
    cancelado: 0,
    ausente: 0,
  };
  for (const turno of turnos) {
    if (Object.prototype.hasOwnProperty.call(porEstado, turno.estado)) {
      porEstado[turno.estado] += 1;
    }
  }

  const ingresosCompletados = turnos.filter((turno) => turno.estado === 'completado');
  let monto = 0;
  for (const turno of ingresosCompletados) {
    if (turno.servicio && turno.servicio.precio != null) {
      monto += Number(turno.servicio.precio);
    }
  }

  const ocupados = turnos.filter((turno) => ESTADOS_OCUPADOS.includes(turno.estado));
  let horasOcupadas = 0;
  for (const turno of ocupados) {
    if (turno.fechaInicio && turno.fechaFin) {
      const diffMs = new Date(turno.fechaFin).getTime() - new Date(turno.fechaInicio).getTime();
      if (diffMs > 0) horasOcupadas += diffMs / 3600000;
    }
  }

  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    select: { horarioInicio: true, horarioFin: true, diasLaborales: true },
  });

  let horasDisponibles = 0;
  const primerDia = new Date(inicio);
  primerDia.setHours(0, 0, 0, 0);
  const ultimoDia = new Date(fin);
  ultimoDia.setHours(0, 0, 0, 0);
  for (let dia = new Date(primerDia); dia <= ultimoDia; dia = new Date(dia.getTime() + 86400000)) {
    const diaSemana = dia.getDay();
    for (const barbero of barberos) {
      if (!barbero.horarioInicio || !barbero.horarioFin || !barbero.diasLaborales) continue;
      if (!barbero.diasLaborales.includes(diaSemana)) continue;
      const horasInicio = new Date(barbero.horarioInicio).getUTCHours();
      const horasFin = new Date(barbero.horarioFin).getUTCHours();
      const diffHoras = horasFin - horasInicio;
      if (diffHoras > 0) horasDisponibles += diffHoras;
    }
  }

  const porcentaje =
    horasDisponibles > 0 ? Math.round((horasOcupadas / horasDisponibles) * 1000) / 10 : 0;

  const grupos = new Map();
  for (const turno of turnos) {
    if (turno.estado === 'cancelado') continue;
    if (!turno.servicio || !turno.servicio.id) continue;
    const key = turno.servicio.id;
    if (!grupos.has(key)) {
      grupos.set(key, {
        servicioId: turno.servicio.id,
        nombre: turno.servicio.nombre,
        cantidad: 0,
        ingresos: 0,
      });
    }
    const grupo = grupos.get(key);
    grupo.cantidad += 1;
    if (turno.estado === 'completado' && turno.servicio.precio != null) {
      grupo.ingresos += Number(turno.servicio.precio);
    }
  }

  const serviciosMasPedidos = Array.from(grupos.values())
    .sort((a, b) => {
      if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
      const nombreA = a.nombre || '';
      const nombreB = b.nombre || '';
      if (nombreA < nombreB) return -1;
      if (nombreA > nombreB) return 1;
      return 0;
    })
    .slice(0, 5);

  return {
    desde: inicio,
    hasta: fin,
    turnos: { total: turnos.length, porEstado },
    ingresos: { completados: ingresosCompletados.length, monto },
    ocupacion: {
      turnos: ocupados.length,
      horasOcupadas,
      horasDisponibles,
      porcentaje,
    },
    serviciosMasPedidos,
  };
}

module.exports = { obtenerMetricas };
