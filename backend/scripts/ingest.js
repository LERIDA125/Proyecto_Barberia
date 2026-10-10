const path = require('path');
const { ingestarArchivo, VECTOR_DB } = require('../src/agent/vectorStore');

async function main() {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error('Uso: node scripts/ingest.js <archivo.md>');
    process.exit(1);
  }

  const ruta = path.resolve(archivo);
  const { chunks } = await ingestarArchivo(ruta);
  console.log(`${chunks} chunks generados desde ${ruta}`);
  console.log(`Base vectorial guardada en ${VECTOR_DB()}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});