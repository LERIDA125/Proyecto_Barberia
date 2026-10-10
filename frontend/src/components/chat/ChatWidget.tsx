"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ApiError } from "@/lib/api/client";

type Rol = "usuario" | "asistente";

interface Mensaje {
  id: number;
  rol: Rol;
  texto: string;
}

interface RespuestaChat {
  respuesta: string;
  conversacionId?: string;
  toolInvocadas?: string[];
}

const BIENVENIDA: Mensaje = {
  id: 0,
  rol: "asistente",
  texto:
    "¡Hola! Soy el asistente de la barbería. Podés consultarme por servicios, precios y horarios.",
};

const MENSAJE_ERROR =
  "No se pudo conectar con el asistente. Intentá nuevamente en unos segundos.";

function IconoChat() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconoEnviar() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function IndicadorEscritura() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 dark:bg-slate-800">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.9s",
            }}
          />
        ))}
        <span className="sr-only">El asistente está escribiendo…</span>
      </div>
      <span className="mb-1 text-xs text-slate-400 dark:text-slate-500">
        escribiendo…
      </span>
    </div>
  );
}

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sesionId, setSesionId] = useState<string | null>(null);

  const siguienteId = useRef(1);
  const historialRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = historialRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando, abierto]);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;

    setMensajes((prev) => [
      ...prev,
      { id: siguienteId.current++, rol: "usuario", texto: pregunta },
    ]);
    setTexto("");
    setCargando(true);

    try {
      const response = await fetch("http://127.0.0.1:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta,
          ...(sesionId ? { sesionId } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = (await response.json()) as RespuestaChat;

      if (data.conversacionId) setSesionId(data.conversacionId);

      setMensajes((prev) => [
        ...prev,
        {
          id: siguienteId.current++,
          rol: "asistente",
          texto: data.respuesta?.trim() || MENSAJE_ERROR,
        },
      ]);
    } catch (err) {
      const mensaje =
        err instanceof ApiError && err.message ? err.message : MENSAJE_ERROR;
      setMensajes((prev) => [
        ...prev,
        { id: siguienteId.current++, rol: "asistente", texto: mensaje },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function manejarTeclas(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={
          abierto ? "Cerrar asistente virtual" : "Abrir asistente virtual"
        }
        aria-expanded={abierto}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:scale-95 dark:bg-white dark:text-slate-900"
      >
        {abierto ? <IconoCerrar /> : <IconoChat />}
      </button>

      {abierto && (
        <section
          aria-label="Chat con el asistente virtual"
          className="fixed bottom-24 right-6 z-50 flex h-[26rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex items-center gap-3 border-b border-slate-200 bg-black px-4 py-3 text-white dark:border-slate-700 dark:bg-slate-800">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold"
            >
              IA
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                Asistente de la barbería
              </p>
              <p className="flex items-center gap-1.5 text-xs text-slate-300 dark:text-slate-400">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-emerald-400"
                />
                En línea
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <IconoCerrar />
            </button>
          </header>

          <div
            ref={historialRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[80%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    m.rol === "usuario"
                      ? "rounded-2xl rounded-br-md bg-black text-white dark:bg-white dark:text-slate-900"
                      : "rounded-2xl rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.texto}
                </p>
              </div>
            ))}

            {cargando && <IndicadorEscritura />}
          </div>

          <form
            onSubmit={enviar}
            className="flex items-end gap-2 border-t border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <label htmlFor="chat-input" className="sr-only">
              Escribí tu mensaje
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={manejarTeclas}
              placeholder="Escribí tu mensaje…"
              disabled={cargando}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={cargando || !texto.trim()}
              aria-label="Enviar mensaje"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <IconoEnviar />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
