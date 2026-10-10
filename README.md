# RAG Chat — Demo

Demo mínima de RAG (Retrieval Augmented Generation) por consola.

## Requisitos

- Python 3.11+

## Instalación

```bash
cd rag-chat
python3 -m venv .venv

En Mac o linux:
source .venv/bin/activate
En windows:
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

## Configuración

El LLM se configura con variables de entorno:

| Variable | Default | Descripción |
|---|---|---|
| `LLM_PROVIDER` | `ollama` | `ollama` (local) o `groq` (cloud, requiere API key) |
| `LLM_MODEL` | `llama3.2` | Nombre del modelo según el provider |
| `GROQ_API_KEY` | — | Solo necesaria si usás Groq |

### Ollama (default, local)

Instalá [Ollama](https://ollama.ai) y descargá un modelo:

```bash
ollama pull qwen2.5:3b
```

### Groq (cloud, gratis)

Conseguí una API key en [console.groq.com](https://console.groq.com) y exportala:

```bash
export LLM_PROVIDER=groq
export LLM_MODEL=llama3-70b-8192
export GROQ_API_KEY=gsk_...
```

## Uso

### 1. Ingesta

```bash
python ingest.py politicas-rh.md
```

### 2. Chat RAG

```bash
python chat.py
```

Opciones:

- `--top-k 4` — cantidad de chunks a recuperar (default: 4)

Escribí `exit` para salir.

## Salir del entorno virtual

```bash
deactivate
```
