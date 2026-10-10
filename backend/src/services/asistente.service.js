const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const env = require('../config/env');
const { getLlm } = require('../agent/llm');
const { PROMPT_TEMPLATE } = require('../agent/prompts');
const { obtenerStore } = require('../agent/vectorStore');
const {
  crearConversacion,
  cargar,
  guardar,
  eliminar,
  formatearHistorial,
} = require('../agent/conversations');

const MENSAJE_DISULPA =
  'Disculpá, tuve un problema para procesar el mensaje. Podés consultar el catálogo y los horarios en la sección Servicios.';

async function responder(pregunta, sesionId) {
  const store = await obtenerStore();
  const llm = getLlm();

  let conv = sesionId ? cargar(sesionId) : null;
  if (!conv) conv = crearConversacion();

  const recuperados = await store.similaritySearch(pregunta, env.asistenteTopK);
  const contexto = recuperados.map((d) => d.pageContent).join('\n\n');
  const historial = formatearHistorial(conv.messages.slice(-10));

  const prompt = ChatPromptTemplate.fromTemplate(PROMPT_TEMPLATE);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  let respuesta;
  try {
    respuesta = await chain.invoke({ context: contexto, history: historial, question: pregunta });
  } catch (err) {
    console.error('[asistente] fallo del proveedor LLM:', err.message);
    respuesta = MENSAJE_DISULPA;
  }

  conv.messages.push({ role: 'user', content: pregunta });
  conv.messages.push({ role: 'assistant', content: respuesta });
  guardar(conv);

  return {
    respuesta,
    conversacionId: conv.conversation_id,
    toolInvocadas: [],
  };
}

function historial(sesionId) {
  const conv = sesionId ? cargar(sesionId) : null;
  return conv ? conv.messages : [];
}

function limpiarHistorial(sesionId) {
  if (sesionId) eliminar(sesionId);
}

module.exports = { responder, historial, limpiarHistorial };