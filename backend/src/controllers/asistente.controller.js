const AppError = require('../utils/AppError');
const asistenteService = require('../services/asistente.service');

const MAX_LONGITUD = 2000;

function obtenerPregunta(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'El cuerpo de la petición es obligatorio');
  }
  const pregunta = body.pregunta ?? body.mensaje;
  if (typeof pregunta !== 'string' || !pregunta.trim()) {
    throw new AppError(400, 'La pregunta es obligatoria');
  }
  if (pregunta.trim().length > MAX_LONGITUD) {
    throw new AppError(400, `La pregunta no puede superar los ${MAX_LONGITUD} caracteres`);
  }
  return pregunta.trim();
}

function obtenerSesionId(body) {
  return body && typeof body.sesionId === 'string' && body.sesionId ? body.sesionId : null;
}

async function enviar(req, res, next) {
  try {
    const pregunta = obtenerPregunta(req.body);
    const sesionId = obtenerSesionId(req.body);
    const resultado = await asistenteService.responder(pregunta, sesionId, req.usuario);
    return res.status(200).json(resultado);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err.message === 'BASE_VACIA') {
      return next(
        new AppError(
          503,
          'El asistente todavía no tiene datos cargados. Ejecutá la ingesta del archivo de conocimiento.'
        )
      );
    }
    return next(err);
  }
}

function historial(req, res, next) {
  try {
    const sesionId = req.query.sesionId;
    const mensajes = asistenteService.historial(sesionId, req.usuario.id);
    return res.status(200).json({ conversacionId: sesionId, mensajes });
  } catch (err) {
    return next(err);
  }
}

function limpiar(req, res, next) {
  try {
    asistenteService.limpiarHistorial(req.query.sesionId, req.usuario.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { enviar, historial, limpiar };