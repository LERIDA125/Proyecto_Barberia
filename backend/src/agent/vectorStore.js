const fs = require('fs');
const path = require('path');
const { Document } = require('@langchain/core/documents');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { getEmbeddings } = require('./embeddings');
const env = require('../config/env');

const VECTOR_DB = () => path.join(env.asistenteDataDir, 'vector_db.json');
const FUENTE_MD = () => env.asistenteDoc;

let storePromise = null;

function persistir(registro) {
  fs.mkdirSync(path.dirname(VECTOR_DB()), { recursive: true });
  fs.writeFileSync(VECTOR_DB(), JSON.stringify(registro, null, 2), 'utf8');
}

function leerRegistro() {
  return JSON.parse(fs.readFileSync(VECTOR_DB(), 'utf8'));
}

async function cargarMemoria() {
  const { documents, vectors } = leerRegistro();
  const store = new MemoryVectorStore(getEmbeddings());
  await store.addVectors(
    vectors,
    documents.map((d) => new Document({ pageContent: d.pageContent, metadata: d.metadata || {} }))
  );
  return store;
}

async function ingestarArchivo(mdPath) {
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Archivo de conocimiento no encontrado: ${mdPath}`);
  }

  const raw = fs.readFileSync(mdPath, 'utf8');
  const doc = new Document({ pageContent: raw, metadata: { source: path.basename(mdPath) } });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n## ', '\n### ', '\n', '. ', ' '],
  });
  const chunks = await splitter.splitDocuments([doc]);

  const embeddings = getEmbeddings();
  const vectors = await embeddings.embedDocuments(chunks.map((c) => c.pageContent));

  persistir({
    model: 'Xenova/all-MiniLM-L6-v2',
    documents: chunks.map((c) => ({ pageContent: c.pageContent, metadata: c.metadata })),
    vectors,
  });

  const store = new MemoryVectorStore(embeddings);
  await store.addVectors(vectors, chunks);

  return { store, chunks: chunks.length };
}

async function obtenerStore() {
  if (!storePromise) {
    storePromise = (async () => {
      if (fs.existsSync(VECTOR_DB())) return cargarMemoria();
      if (fs.existsSync(FUENTE_MD())) {
        await ingestarArchivo(FUENTE_MD());
        return cargarMemoria();
      }
      throw new Error('BASE_VACIA');
    })();
  }
  return storePromise;
}

function resetStore() {
  storePromise = null;
}

module.exports = { ingestarArchivo, obtenerStore, cargarMemoria, resetStore, VECTOR_DB, FUENTE_MD };