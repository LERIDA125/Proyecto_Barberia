const PROTOCOL_VERSION = '2024-11-05';
const NOMBRE_CLIENTE = 'barberia-backend';
const VERSION_CLIENTE = '1.0.0';

class McpError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'McpError';
    this.status = status;
  }
}

function parsearBloqueSse(bloque) {
  const data = bloque
    .split(/\r?\n/)
    .filter((linea) => linea.startsWith('data:'))
    .map((linea) => linea.slice(5).replace(/^ /, ''))
    .join('\n');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function leerSse(res, id) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let indice;
      while ((indice = buffer.indexOf('\n\n')) !== -1) {
        const bloque = buffer.slice(0, indice);
        buffer = buffer.slice(indice + 2);
        const mensaje = parsearBloqueSse(bloque);
        if (mensaje && mensaje.id === id) return mensaje;
      }
    }
    if (buffer.trim()) {
      const mensaje = parsearBloqueSse(buffer);
      if (mensaje && mensaje.id === id) return mensaje;
    }
    return null;
  } finally {
    reader.cancel().catch(() => {});
  }
}

function extraerTexto(result) {
  const contenido = Array.isArray(result?.content) ? result.content : [];
  return contenido
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')
    .trim();
}

function extraerResultado(result) {
  if (!result) return null;
  if (result.structuredContent) return result.structuredContent;
  const texto = extraerTexto(result);
  if (!texto) return result;
  try {
    return JSON.parse(texto);
  } catch {
    return { texto };
  }
}

/**
 * Cliente MCP mínimo sobre transporte Streamable HTTP (JSON-RPC 2.0).
 * No depende de SDKs externos: usa el `fetch` global de Node 18+.
 */
class McpHttpClient {
  constructor(url, { token, timeoutMs = 5000 } = {}) {
    this.url = url;
    this.token = token;
    this.timeoutMs = timeoutMs;
    this.sessionId = null;
    this.contador = 0;
    this.inicializado = null;
  }

  cabeceras() {
    const cabeceras = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': PROTOCOL_VERSION,
    };
    if (this.sessionId) cabeceras['Mcp-Session-Id'] = this.sessionId;
    if (this.token) cabeceras.Authorization = `Bearer ${this.token}`;
    return cabeceras;
  }

  async leerRespuesta(res, id) {
    const tipo = res.headers.get('content-type') || '';
    if (tipo.includes('text/event-stream')) return leerSse(res, id);
    const texto = await res.text();
    if (!texto) return null;
    return JSON.parse(texto);
  }

  async pedir(method, params, { conId = true } = {}) {
    const id = conId ? (this.contador += 1) : undefined;
    const cuerpo = { jsonrpc: '2.0', method };
    if (conId) cuerpo.id = id;
    if (params !== undefined) cuerpo.params = params;

    const controller = new AbortController();
    const temporizador = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(this.url, {
        method: 'POST',
        signal: controller.signal,
        headers: this.cabeceras(),
        body: JSON.stringify(cuerpo),
      });

      const sid = res.headers.get('mcp-session-id');
      if (sid) this.sessionId = sid;

      if (!res.ok) {
        if (res.status === 401) {
          throw new McpError('Credenciales de la integración con Google Calendar inválidas', 401);
        }
        throw new McpError(`El servidor MCP respondió con estado ${res.status}`, 502);
      }

      if (!conId) return null;

      const mensaje = await this.leerRespuesta(res, id);
      if (!mensaje) throw new McpError('Respuesta vacía del servidor MCP', 502);
      if (mensaje.error) {
        throw new McpError(mensaje.error.message || 'El servidor MCP devolvió un error', 502);
      }
      return mensaje.result;
    } catch (err) {
      if (err instanceof McpError) throw err;
      if (err.name === 'AbortError') {
        throw new McpError('Se agotó el tiempo de espera al contactar al servidor MCP', 502);
      }
      throw new McpError(`No se pudo contactar al servidor MCP: ${err.message}`, 502);
    } finally {
      clearTimeout(temporizador);
    }
  }

  async inicializar() {
    if (!this.inicializado) {
      this.inicializado = (async () => {
        await this.pedir('initialize', {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: NOMBRE_CLIENTE, version: VERSION_CLIENTE },
        });
        await this.pedir('notifications/initialized', undefined, { conId: false });
      })().catch((err) => {
        this.inicializado = null;
        throw err;
      });
    }
    return this.inicializado;
  }

  async llamarTool(nombre, args = {}) {
    await this.inicializar();
    const result = await this.pedir('tools/call', { name: nombre, arguments: args });
    if (result?.isError) {
      throw new McpError(extraerTexto(result) || `La tool ${nombre} falló`, 502);
    }
    return extraerResultado(result);
  }
}

module.exports = { McpHttpClient, McpError };
