const { z } = require('zod');

// Esquemas de validación de entrada compartidos (zod).
const emailSchema = z.string().trim().email('Email inválido');

const registroOpcionesSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  email: emailSchema,
});

const registroVerificarSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  email: emailSchema,
  telefono: z.string().trim().optional().nullable(),
  response: z.any(),
});

const loginOpcionesSchema = z.object({
  email: emailSchema,
});

const loginVerificarSchema = z.object({
  email: emailSchema,
  response: z.any(),
});

const crearTurnoSchema = z.object({
  barberoId: z.string().uuid('barberoId inválido'),
  servicioId: z.string().uuid('servicioId inválido'),
  fechaInicio: z.string().min(1, 'fechaInicio es obligatoria'),
  clienteId: z.string().uuid('clienteId inválido').optional(),
  notas: z.string().optional().nullable(),
});

const cancelarTurnoSchema = z.object({
  motivo: z.string().trim().max(500, 'motivo demasiado largo').optional().nullable(),
});

const reprogramarTurnoSchema = z.object({
  nuevaFechaInicio: z.string().min(1, 'nuevaFechaInicio es obligatoria'),
});

const cambiarEstadoSchema = z.object({
  estado: z.string().min(1, 'estado es obligatorio'),
});

const actualizarNotasSchema = z.object({
  notas: z.string().optional().nullable(),
});

// Parsea y valida; si hay error lanza ZodError que el error middleware formatea.
function validar(schema, data) {
  return schema.parse(data ?? {});
}

module.exports = {
  validar,
  schemas: {
    registroOpciones: registroOpcionesSchema,
    registroVerificar: registroVerificarSchema,
    loginOpciones: loginOpcionesSchema,
    loginVerificar: loginVerificarSchema,
    crearTurno: crearTurnoSchema,
    cancelarTurno: cancelarTurnoSchema,
    reprogramarTurno: reprogramarTurnoSchema,
    cambiarEstado: cambiarEstadoSchema,
    actualizarNotas: actualizarNotasSchema,
  },
};
