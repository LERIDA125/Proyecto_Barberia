# ingest.py
# Este script convierte un archivo Markdown en una base de datos vectorial (ChromaDB).
# La base vectorial permite buscar fragmentos del documento por similitud semantica.
#
# Flujo: MD -> Texto -> Fragmentos (chunks) -> Vectores (embeddings) -> ChromaDB

import argparse
import os
import warnings

# Silencia un warning de urllib3 relacionado con LibreSSL (inofensivo en macOS)
warnings.filterwarnings("ignore", module="urllib3")

# TextLoader: lee archivos de texto plano
from langchain_community.document_loaders import TextLoader

# RecursiveCharacterTextSplitter: divide el texto en fragmentos del mismo tamano
from langchain_text_splitters import RecursiveCharacterTextSplitter

# HuggingFaceEmbeddings: genera vectores (embeddings) a partir de texto
from langchain_huggingface import HuggingFaceEmbeddings

# Chroma: base de datos vectorial que guarda y busca por similitud
from langchain_chroma import Chroma

# Directorio donde se va a guardar la base vectorial
CHROMA_DIR = "./chroma_db"


def main():
    # --- 1. RECIBIR EL ARCHIVO POR LINEA DE COMANDOS ---
    parser = argparse.ArgumentParser(description="Ingesta de MD a base vectorial ChromaDB")
    parser.add_argument("file", help="Ruta al archivo .md")
    args = parser.parse_args()

    # Verificar que el archivo existe
    if not os.path.exists(args.file):
        print(f"Archivo no encontrado: {args.file}")
        return

    # --- 2. CARGAR EL DOCUMENTO ---
    # TextLoader lee el archivo y lo convierte en objetos Document
    # Cada Document tiene page_content (el texto) y metadata
    loader = TextLoader(args.file, encoding="utf-8")
    docs = loader.load()

    # --- 3. DIVIDIR EN FRAGMENTOS (CHUNKING) ---
    # El chunking es clave en RAG: fragmentos mas chicos = busqueda mas precisa
    # chunk_size: 500 caracteres por fragmento
    # chunk_overlap: 50 caracteres de solapamiento para no cortar ideas por la mitad
    # separators: prioridad de cortes (primero por titulo, luego salto de linea, etc.)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n", ". ", " "],
    )
    chunks = splitter.split_documents(docs)

    print(f"{len(chunks)} chunks generados desde {args.file}")

    # --- 4. CREAR EMBEDDINGS (VECTORIZAR) ---
    # Los embeddings convierten texto en vectores numericos
    # all-MiniLM-L6-v2 es un modelo liviano de Sentence Transformers (~80MB)
    # Dos textos parecidos semanticamente tendran vectores cercanos
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # --- 5. GUARDAR EN CHROMADB ---
    # Chroma.from_documents:
    #   1. Toma cada chunk
    #   2. Le calcula su embedding (vector)
    #   3. Guarda ambos (texto + vector) en una base SQLite persistente
    # persist_directory: donde se guarda la base en disco
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )
    print(f"Base vectorial guardada en {CHROMA_DIR}/")


if __name__ == "__main__":
    main()
