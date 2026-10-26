"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api/client";
import { useSesion } from "@/lib/hooks/useSesion";
import type { HistorialChat, RespuestaChat } from "@/types/api";

type Rol = "usuario" | "asistente";

interface Mensaje {
  id: number;
  rol: Rol;
  texto: string;
  herramientas?: string[];
}

const BIENVENIDA: Mensaje = {
  id: 0,
  rol: "asistente",
  texto:
    "¡Hola! Soy el asistente de la barbería. Podés consultarme por servicios, precios y horarios, y reservar tu turno.",
};

const MENSAJE_ERROR =
  "No se pudo conectar con el asistente. Intentá nuevamente en unos segundos.";

const MENSAJE_SESION_EXPIRADA =
  "Tu sesión expiró. Iniciá sesión nuevamente para seguir chateando.";

const MENSAJE_ERROR_REINICIO =
  "No se pudo iniciar una nueva conversación. Intentá nuevamente en unos segundos.";

const CLAVE_SESION_CHAT = "barberia:chat:sesionId";

const ETIQUETA_HERRAMIENTA: Record<string, string> = {
  consultar_disponibilidad: "Consultó la agenda",
  reservar_turno: "Creó el turno",
  consultar_mis_turnos: "Consultó tus turnos",
  cancelar_turno: "Canceló el turno",
};

function etiquetaHerramienta(nombre: string) {
  return ETIQUETA_HERRAMIENTA[nombre] ?? "Usó una herramienta";
}

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

function IconoReiniciar() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconoHerramienta() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function EtiquetaHerramienta({ nombre }: { nombre: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted ">
      <IconoHerramienta />
      {etiquetaHerramienta(nombre)}
    </span>
  );
}

function IndicadorPensando() {
  return (
    <div className="flex items-center gap-2" role="status">
      <span
        aria-hidden
        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground"
      />
      <span className="text-xs text-muted ">
        El asistente está consultando la agenda…
      </span>
    </div>
  );
}

function CuerpoSinSesion() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted "
      >
        <IconoChat />
      </span>
      <p className="text-sm font-semibold text-foreground ">
        Inicia sesión para chatear con nuestro asistente
      </p>
      <p className="text-xs text-muted ">
        Podrás consultar disponibilidad y reservar tu turno en lenguaje natural.
      </p>
      <Link
        href="/login"
        className="mt-1 rounded-none bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent "
      >
        Ingresar
      </Link>
    </div>
  );
}

function CuerpoCargandoSesion() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <span className="text-xs uppercase tracking-widest text-muted ">
        Verificando sesión…
      </span>
    </div>
  );
}

export function ChatWidget() {
  const { usuario, loading: sesionCargando } = useSesion();

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  const [sesion, setSesion] = useState<{ id: string; usuarioId: string } | null>(null);

  const siguienteId = useRef(1);
  const historialRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = historialRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando, abierto]);

  useEffect(() => {
    if (abierto && usuario) inputRef.current?.focus();
  }, [abierto, usuario]);

  useEffect(() => {
    if (sesionCargando || !usuario) return;
    let activo = true;

    const clave = `${CLAVE_SESION_CHAT}:${usuario.id}`;
    let guardado: string | null = null;
    try {
      guardado = window.localStorage.getItem(clave);
    } catch {
      guardado = null;
    }
    if (!guardado) return;
    const sesionGuardada = guardado;

    void (async () => {
      try {
        const data = await apiFetch<HistorialChat>(
          `/api/asistente/historial?sesionId=${encodeURIComponent(sesionGuardada)}`,
        );
        if (!activo) return;
        const restaurados: Mensaje[] = (data.mensajes ?? []).map((mensaje, indice) => ({
          id: indice + 1,
          rol: mensaje.role === "user" ? "usuario" : "asistente",
          texto: mensaje.content,
        }));
        siguienteId.current = restaurados.length + 1;
        setSesion({ id: data.conversacionId ?? sesionGuardada, usuarioId: usuario.id });
        setMensajes(restaurados.length > 0 ? [BIENVENIDA, ...restaurados] : [BIENVENIDA]);
      } catch {
        if (!activo) return;
        try {
          window.localStorage.removeItem(clave);
        } catch {
          // almacenamiento no disponible
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [usuario, sesionCargando]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || cargando || !usuario) return;

    const cambiaDeUsuario = Boolean(sesion && sesion.usuarioId !== usuario.id);
    const sesionActual = sesion && sesion.usuarioId === usuario.id ? sesion.id : null;
    if (cambiaDeUsuario) siguienteId.current = 1;

    setMensajes((prev) => [
      ...(cambiaDeUsuario ? [BIENVENIDA] : prev),
      { id: siguienteId.current++, rol: "usuario", texto: pregunta },
    ]);
    setTexto("");
    setCargando(true);

    try {
      const data = await apiFetch<RespuestaChat>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          pregunta,
          ...(sesionActual ? { sesionId: sesionActual } : {}),
        }),
      });

      if (data.conversacionId) {
        setSesion({ id: data.conversacionId, usuarioId: usuario.id });
        try {
          window.localStorage.setItem(
            `${CLAVE_SESION_CHAT}:${usuario.id}`,
            data.conversacionId,
          );
        } catch {
          // almacenamiento no disponible
        }
      }

      const herramientas = data.toolInvocadas?.filter(Boolean);

      setMensajes((prev) => [
        ...prev,
        {
          id: siguienteId.current++,
          rol: "asistente",
          texto: data.respuesta?.trim() || MENSAJE_ERROR,
          ...(herramientas && herramientas.length > 0 ? { herramientas } : {}),
        },
      ]);
    } catch (err) {
      const mensaje =
        err instanceof ApiError && err.status === 401
          ? MENSAJE_SESION_EXPIRADA
          : err instanceof ApiError && err.message
            ? err.message
            : MENSAJE_ERROR;
      setMensajes((prev) => [
        ...prev,
        { id: siguienteId.current++, rol: "asistente", texto: mensaje },
      ]);
    } finally {
      setCargando(false);
    }
  }

  async function reiniciarConversacion() {
    if (reiniciando || cargando || !usuario) return;

    const confirmado = window.confirm(
      "¿Iniciar una nueva conversación? Se borrará el historial de este chat.",
    );
    if (!confirmado) return;

    const sesionActual =
      sesion && sesion.usuarioId === usuario.id ? sesion.id : null;

    setReiniciando(true);

    try {
      if (sesionActual) {
        await apiFetch<{ ok: boolean }>(
          `/api/asistente/historial?sesionId=${encodeURIComponent(sesionActual)}`,
          { method: "DELETE" },
        );
      }

      try {
        window.localStorage.removeItem(`${CLAVE_SESION_CHAT}:${usuario.id}`);
      } catch {
        // almacenamiento no disponible
      }

      setSesion(null);
      setMensajes([BIENVENIDA]);
      siguienteId.current = 1;
      setTexto("");
    } catch (err) {
      const mensaje =
        err instanceof ApiError && err.status === 401
          ? MENSAJE_SESION_EXPIRADA
          : err instanceof ApiError && err.message
            ? err.message
            : MENSAJE_ERROR_REINICIO;
      setMensajes((prev) => [
        ...prev,
        { id: siguienteId.current++, rol: "asistente", texto: mensaje },
      ]);
    } finally {
      setReiniciando(false);
    }
  }

  function manejarTeclas(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const mensajesVisibles =
    sesion && usuario && sesion.usuarioId !== usuario.id ? [BIENVENIDA] : mensajes;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={
          abierto ? "Cerrar asistente virtual" : "Abrir asistente virtual"
        }
        aria-expanded={abierto}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 "
      >
        {abierto ? <IconoCerrar /> : <IconoChat />}
      </button>

      {abierto && (
        <section
          aria-label="Chat con el asistente virtual"
          className="fixed bottom-24 right-6 z-50 flex h-[26rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl "
        >
          <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 text-foreground ">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/15 text-sm font-semibold"
            >
              IA
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                Asistente de la barbería
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted ">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${
                    usuario ? "bg-emerald-400" : "bg-muted "
                  }`}
                />
                {usuario ? "En línea" : "Sin sesión"}
              </p>
            </div>
            {usuario && (
              <button
                type="button"
                onClick={() => void reiniciarConversacion()}
                disabled={cargando || reiniciando}
                aria-label={
                  reiniciando
                    ? "Reiniciando conversación"
                    : "Iniciar nueva conversación"
                }
                aria-busy={reiniciando}
                title="Iniciar nueva conversación"
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconoReiniciar />
              </button>
            )}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <IconoCerrar />
            </button>
          </header>

          {sesionCargando ? (
            <CuerpoCargandoSesion />
          ) : !usuario ? (
            <CuerpoSinSesion />
          ) : (
            <>
              <div
                ref={historialRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
              >
                {mensajesVisibles.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1.5 ${
                      m.rol === "usuario" ? "items-end" : "items-start"
                    }`}
                  >
                    <p
                      className={`max-w-[80%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        m.rol === "usuario"
                          ? "rounded-2xl rounded-br-md bg-foreground text-background"
                          : "rounded-2xl rounded-bl-md bg-surface text-foreground "
                      }`}
                    >
                      {m.texto}
                    </p>

                    {m.herramientas && m.herramientas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {m.herramientas.map((nombre, i) => (
                          <EtiquetaHerramienta key={`${m.id}-${nombre}-${i}`} nombre={nombre} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {cargando && <IndicadorPensando />}
              </div>

              <form
                onSubmit={enviar}
                className="flex items-end gap-2 border-t border-border bg-surface px-3 py-3 "
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
                  className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60 "
                />
                <button
                  type="submit"
                  disabled={cargando || !texto.trim()}
                  aria-label="Enviar mensaje"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 "
                >
                  <IconoEnviar />
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
}
