const { SystemMessage, HumanMessage, AIMessage, ToolMessage } = require('@langchain/core/messages');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const { getLlm } = require('../agent/llm');
const { PROMPT_AGENTE } = require('../agent/prompts');
const { obtenerStore } = require('../agent/vectorStore');
const { TOOLS, ejecutarTool } = require('../agent/tools');
const barberosService = require('./barberos.service');
const serviciosService = require('./servicios.service');
const { crearConversacion, cargar, guardar, eliminar, perteneceA } = require('../agent/conversations');

const MENSAJE_DISULPA =
  'Disculpá, tuve un problema para procesar el mensaje. Podés consultar el catálogo y los horarios en la sección Servicios.';

const MAX_ITERACIONES_TOOL = 5;

async function construirCatalogo() {
  const [barberos, servicios] = await Promise.all([
    barberosService.listar(),
    serviciosService.listar(),
  ]);

  const lineas = ['Barberos:'];
  for (const barbero of barberos) {
    const especialidad = barbero.especialidad ? ` (${barbero.especialidad})` : '';
    lineas.push(`- id: ${barbero.id} — ${barbero.nombre}${especialidad}`);
  }

  lineas.push('', 'Servicios:');
  for (const servicio of servicios) {
    lineas.push(
      `- id: ${servicio.id} — ${servicio.nombre} — ${servicio.duracionMin} min — $${servicio.precio}`
    );
  }

  return lineas.join('\n');
}

function textoDeContenido(content) {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((parte) => (typeof parte === 'string' ? parte : parte?.text ?? ''))
      .join('')
      .trim();
  }
  return '';
}

async function responder(pregunta, sesionId, usuario) {
  const store = await obtenerStore();
  const llm = getLlm().bindTools(TOOLS);

  let conv = sesionId ? cargar(sesionId) : null;
  // Una conversación ajena (o previa al control de propiedad) nunca se reutiliza:
  // se arranca una nueva para no filtrar ni inyectar contexto de otro usuario.
  if (conv && !perteneceA(conv, usuario?.id)) conv = null;
  if (!conv) conv = crearConversacion(usuario?.id);

  const [recuperados, catalogo] = await Promise.all([
    store.similaritySearch(pregunta, env.asistenteTopK),
    construirCatalogo(),
  ]);
  const contexto = recuperados.map((d) => d.pageContent).join('\n\n');

  const system = PROMPT_AGENTE.replace('{context}', () => contexto || '(sin resultados)').replace(
    '{catalogo}',
    () => catalogo
  );

  const previos = conv.messages
    .slice(-10)
    .map((m) => (m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)));

  const mensajes = [new SystemMessage(system), ...previos, new HumanMessage(pregunta)];

  const toolInvocadas = [];
  let turnoCreado = null;
  let respuesta;

  try {
    let salida = await llm.invoke(mensajes);
    let iteraciones = 0;

    while (salida.tool_calls?.length && iteraciones < MAX_ITERACIONES_TOOL) {
      iteraciones += 1;
      mensajes.push(salida);

      for (const llamada of salida.tool_calls) {
        toolInvocadas.push(llamada.name);
        const resultado = await ejecutarTool(llamada.name, llamada.args, usuario);

        if (llamada.name === 'reservar_turno' && resultado && !resultado.error) {
          turnoCreado = resultado;
        }

        mensajes.push(
          new ToolMessage({
            content: JSON.stringify(resultado),
            tool_call_id: llamada.id,
            name: llamada.name,
          })
        );
      }

      salida = await llm.invoke(mensajes);
    }

    respuesta = textoDeContenido(salida.content) || MENSAJE_DISULPA;
  } catch (err) {
    console.error('[asistente] fallo del proveedor LLM:', err.message);
    respuesta = MENSAJE_DISULPA;
  }

  conv.messages.push({ role: 'user', content: pregunta });
  conv.messages.push({ role: 'assistant', content: respuesta });
  guardar(conv);

  const resultado = {
    respuesta,
    conversacionId: conv.conversation_id,
    toolInvocadas,
  };
  if (turnoCreado) resultado.turnoCreado = turnoCreado;
  return resultado;
}

function historial(sesionId, usuarioId) {
  const conv = sesionId ? cargar(sesionId) : null;
  if (!conv) return [];
  if (!perteneceA(conv, usuarioId)) {
    throw new AppError(403, 'No tenés acceso a esta conversación');
  }
  return conv.messages;
}

function limpiarHistorial(sesionId, usuarioId) {
  if (!sesionId) return;
  const conv = cargar(sesionId);
  if (!conv) return;
  if (!perteneceA(conv, usuarioId)) {
    throw new AppError(403, 'No tenés acceso a esta conversación');
  }
  eliminar(sesionId);
}

module.exports = { responder, historial, limpiarHistorial };
