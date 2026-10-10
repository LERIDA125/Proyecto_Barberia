const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const {
  requerirCampos,
  validarEnteroPositivo,
  validarNumeroNoNegativo,
} = require('../utils/validators');

function serializar(servicio) {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    duracionMin: servicio.duracionMin,
    precio: Number(servicio.precio),
    activo: servicio.activo,
  };
}

async function obtenerCrudo(id) {
  const servicio = await prisma.servicio.findUnique({ where: { id } });
  if (!servicio) throw new AppError(404, 'Servicio no encontrado');
  return servicio;
}

function normalizar(datos) {
  const limpio = {};

  if (datos.nombre !== undefined) {
    if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
      throw new AppError(400, 'nombre no puede estar vacío');
    }
    limpio.nombre = datos.nombre.trim();
  }
  if (datos.duracionMin !== undefined) {
    limpio.duracionMin = validarEnteroPositivo(datos.duracionMin, 'duracionMin');
  }
  if (datos.precio !== undefined) {
    limpio.precio = validarNumeroNoNegativo(datos.precio, 'precio');
  }
  if (datos.descripcion !== undefined) {
    limpio.descripcion = datos.descripcion === null ? null : String(datos.descripcion).trim();
  }
  if (datos.activo !== undefined) {
    limpio.activo = Boolean(datos.activo);
  }

  return limpio;
}

async function listar({ incluirInactivos = false } = {}) {
  const servicios = await prisma.servicio.findMany({
    where: incluirInactivos ? {} : { activo: true },
    orderBy: { nombre: 'asc' },
  });
  return servicios.map(serializar);
}

async function obtenerPorId(id) {
  return serializar(await obtenerCrudo(id));
}

async function crear(datos) {
  requerirCampos(datos, ['nombre', 'duracionMin', 'precio']);
  const limpio = normalizar(datos);

  const existente = await prisma.servicio.findUnique({ where: { nombre: limpio.nombre } });
  if (existente) throw new AppError(409, 'Ya existe un servicio con ese nombre');

  const servicio = await prisma.servicio.create({ data: limpio });
  return serializar(servicio);
}

async function actualizar(id, datos) {
  await obtenerCrudo(id);
  const limpio = normalizar(datos);

  if (Object.keys(limpio).length === 0) {
    throw new AppError(400, 'No se enviaron campos para actualizar');
  }

  if (limpio.nombre) {
    const existente = await prisma.servicio.findUnique({ where: { nombre: limpio.nombre } });
    if (existente && existente.id !== id) {
      throw new AppError(409, 'Ya existe un servicio con ese nombre');
    }
  }

  const servicio = await prisma.servicio.update({ where: { id }, data: limpio });
  return serializar(servicio);
}

async function desactivar(id) {
  await obtenerCrudo(id);
  const servicio = await prisma.servicio.update({ where: { id }, data: { activo: false } });
  return serializar(servicio);
}

module.exports = { listar, obtenerPorId, crear, actualizar, desactivar };
