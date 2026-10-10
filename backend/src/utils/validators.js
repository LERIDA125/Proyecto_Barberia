const AppError = require('./AppError');

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function esStringNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function requerirCampos(obj, campos) {
  const faltantes = campos.filter((campo) => {
    const valor = obj[campo];
    return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');
  });
  if (faltantes.length > 0) {
    throw new AppError(400, `Faltan campos obligatorios: ${faltantes.join(', ')}`);
  }
}

function validarEmail(valor) {
  if (typeof valor !== 'string' || !RE_EMAIL.test(valor.trim())) {
    throw new AppError(400, 'Email inválido');
  }
  return valor.trim().toLowerCase();
}

function validarUUID(valor, campo) {
  if (typeof valor !== 'string' || !RE_UUID.test(valor)) {
    throw new AppError(400, `${campo} inválido`);
  }
  return valor;
}

function validarEnteroPositivo(valor, campo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError(400, `${campo} debe ser un entero mayor a 0`);
  }
  return numero;
}

function validarNumeroNoNegativo(valor, campo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new AppError(400, `${campo} debe ser mayor o igual a 0`);
  }
  return numero;
}

function validarFecha(valor, campo) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new AppError(400, `${campo} inválida`);
  }
  return fecha;
}

function parseFechaTexto(valor) {
  const texto = RE_FECHA.test(valor) ? `${valor}T00:00:00` : valor;
  return validarFecha(texto, 'fecha');
}

module.exports = {
  esStringNoVacio,
  requerirCampos,
  validarEmail,
  validarUUID,
  validarEnteroPositivo,
  validarNumeroNoNegativo,
  validarFecha,
  parseFechaTexto,
};
