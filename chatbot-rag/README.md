# Chatbot RAG — Prototipo Python

Prototipo **standalone** del asistente conversacional del proyecto (CU-06). Es la prueba de concepto del pipeline RAG que después se implementó en el backend.

> **No es código productivo.** El asistente real vive en `backend/src/agent/` y `backend/src/services/asistente.service.js`. Este prototipo se conserva como referencia y banco de pruebas del pipeline RAG.

## Qué contiene

| Archivo | Rol |
|---------|-----|
| `ingest.py` | Convierte un `.md` en base vectorial ChromaDB: MD → texto → chunks → embeddings → Chroma |
| `chat.py` | Chat RAG por consola con persistencia de conversaciones en JSON (modo interactivo y pregunta única) |
| `requirements.txt` | Dependencias Python del prototipo |

## Pipeline

```
ingest.py:  Markdown → TextLoader → RecursiveCharacterTextSplitter → HuggingFaceEmbeddings → ChromaDB
chat.py:    Pregunta → Embedding → Búsqueda top-k en ChromaDB → Contexto + Historial + Prompt → LLM → Respuesta
```

El LLM es configurable vía `LLM_PROVIDER`: `ollama` (local) o `groq` (cloud).

## Instalación

```bash
pip install -r requirements.txt
```

## Uso

```bash
# 1. Construir la base vectorial desde un documento
python ingest.py ../datos_barberia.md

# 2. Conversar
python chat.py
```

## ⚠️ Rutas relativas — leer antes de ejecutar

Ambos scripts usan rutas **relativas al directorio de trabajo**, no al archivo:

| Variable | Valor | Archivo |
|----------|-------|---------|
| `CHROMA_DIR` | `./chroma_db` | `ingest.py` |
| `CONVERSATIONS_DIR` | `./conversaciones` | `chat.py` |

Esto significa que **la base vectorial se crea donde ejecutás el comando**, no donde vive el script. Si querés reutilizar el índice del backend, ejecutá desde la raíz del repo apuntando al directorio correcto, o ajustá las constantes.

El índice del backend vive en `../backend/data/vector_db.json` (formato distinto — JSON, no ChromaDB).

## Relación con el código productivo

| Prototipo (Python) | Productivo (Node.js) |
|--------------------|----------------------|
| `ingest.py` | `backend/scripts/ingest.js` |
| `chat.py` | `backend/src/services/asistente.service.js` |
| `PROMPT_TEMPLATE` | `backend/src/agent/prompts.js` |
| ChromaDB (`chroma_db/`) | `backend/data/vector_db.json` |
| — | `backend/src/agent/tools.js` (las 4 tools) |

> El prototipo **no tiene tools**: solo RAG de consulta. El productivo agrega `consultar_disponibilidad`, `reservar_turno`, `consultar_mis_turnos` y `cancelar_turno`.
