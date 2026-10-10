# chat.py
# Chat RAG por consola con persistencia de conversaciones en JSON.
# Soporta modo interactivo y modo pregunta-unica (para endpoint).
#
# Flujo por cada pregunta:
#   Pregunta -> Embedding -> Busqueda en ChromaDB (top-k) -> Contexto + Historial + Prompt -> LLM -> Respuesta

import os
import json
import uuid
import warnings
from dotenv import load_dotenv

load_dotenv()

warnings.filterwarnings("ignore", module="urllib3")

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

CHROMA_DIR = "./chroma_db"
CONVERSATIONS_DIR = "./conversaciones"

# El prompt incluye {history} para mantener el hilo de la conversacion
PROMPT_TEMPLATE = """Eres un asistente que responde preguntas usando exclusivamente el contexto proporcionado.

Contexto:
{context}

Historial de la conversacion:
{history}

Pregunta: {question}

Respuesta util y precisa basada en el contexto:"""


# ---- Funciones de persistencia (JSON) ----

def crear_conversacion():
    """Crea una conversacion nueva con un UUID unico."""
    conv = {
        "conversation_id": str(uuid.uuid4()),
        "messages": [],
    }
    guardar_conversacion(conv)
    return conv


def cargar_conversacion(conversation_id):
    """Carga una conversacion existente desde su archivo JSON."""
    path = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def guardar_conversacion(conv):
    """Guarda la conversacion a disco como JSON."""
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)
    path = os.path.join(CONVERSATIONS_DIR, f"{conv['conversation_id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)


def formatear_historial(messages):
    """Convierte la lista de mensajes en texto para el prompt."""
    lines = []
    for msg in messages:
        role = "Usuario" if msg["role"] == "user" else "Asistente"
        lines.append(f"{role}: {msg['content']}")
    return "\n".join(lines)


def formatear_contexto(docs):
    return "\n\n".join(d.page_content for d in docs)


# ---- Funcion para crear el LLM segun configuracion ----

def get_llm():
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()

    if provider == "groq":
        return ChatGroq(
            model=os.getenv("LLM_MODEL", "llama3-70b-8192"),
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY"),
        )

    return ChatOllama(
        model=os.getenv("LLM_MODEL", "llama3.2"),
        temperature=0,
    )


def responder(chain, conversation, question):
    """Ejecuta una pregunta sobre una conversacion y retorna la respuesta."""
    history = conversation["messages"][-10:]  # ultimos 10 mensajes para no saturar

    response = chain.invoke({
        "question": question,
        "history": history,
    })

    conversation["messages"].append({"role": "user", "content": question})
    conversation["messages"].append({"role": "assistant", "content": response})
    guardar_conversacion(conversation)

    return response


# ---- CLI ----

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Chat RAG por consola")
    parser.add_argument("--question", help="Pregunta unica (modo API). Omítelo para modo interactivo.")
    parser.add_argument("--conversation-id", help="ID de conversacion existente para continuar.")
    parser.add_argument("--top-k", type=int, default=4, help="Chunks a recuperar (default: 4)")
    args = parser.parse_args()

    if not os.path.exists(CHROMA_DIR):
        print("No se encontro la base vectorial. Ejecuta 'python ingest.py <archivo.md>' primero.")
        exit(1)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = Chroma(
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": args.top_k})

    llm = get_llm()

    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

    chain = (
        {
            "context": lambda x: formatear_contexto(retriever.invoke(x["question"])),
            "history": lambda x: formatear_historial(x["history"]),
            "question": lambda x: x["question"],
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    # Cargar o crear conversacion
    if args.conversation_id:
        conversation = cargar_conversacion(args.conversation_id)
        if not conversation:
            print(f"No se encontro la conversacion '{args.conversation_id}'.")
            exit(1)
    else:
        conversation = crear_conversacion()
        print(f"Nueva conversacion iniciada. ID: {conversation['conversation_id']}")

    # Modo pregunta-unica (para endpoint)
    if args.question:
        respuesta = responder(chain, conversation, args.question)
        print(json.dumps({
            "conversation_id": conversation["conversation_id"],
            "answer": respuesta,
        }, ensure_ascii=False))
        exit(0)

    # Modo interactivo
    print("RAG Chat listo (escribi 'exit' para salir)\n")

    while True:
        question = input("Vos: ").strip()
        if question.lower() in ("exit", "quit", "salir", "chau"):
            break
        if not question:
            continue

        respuesta = responder(chain, conversation, question)

        print("IA: ", end="", flush=True)
        print(respuesta)
