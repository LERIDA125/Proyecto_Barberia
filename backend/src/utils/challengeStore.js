const store = new Map();
const TTL_MS = 5 * 60 * 1000;

function guardar(clave, challenge) {
  store.set(clave, { challenge, expira: Date.now() + TTL_MS });
}

function consumir(clave) {
  const entrada = store.get(clave);
  if (!entrada) return null;
  store.delete(clave);
  if (entrada.expira < Date.now()) return null;
  return entrada.challenge;
}

module.exports = { guardar, consumir };
