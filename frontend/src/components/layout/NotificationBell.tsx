"use client";

import { useEffect, useRef, useState } from "react";
import { useNotificaciones } from "@/lib/hooks/useNotificaciones";
import { formatearTiempoRelativo } from "@/lib/utils/format";
import { ApiError } from "@/lib/api/client";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";

export function NotificationBell() {
  const [abierto, setAbierto] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);

  const { notificaciones, noLeidas, ahora, cargando, error, marcarUna, marcarTodas } =
    useNotificaciones(true);

  useEffect(() => {
    if (!abierto) return;
    function alPresionar(evento: MouseEvent) {
      if (contenedor.current && !contenedor.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", alPresionar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alPresionar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  async function manejarMarcarUna(id: string) {
    setAccionError(null);
    try {
      await marcarUna(id);
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : "No se pudo marcar como leída");
    }
  }

  async function manejarMarcarTodas() {
    setAccionError(null);
    try {
      await marcarTodas();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : "No se pudieron marcar como leídas");
    }
  }

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-label={noLeidas > 0 ? `Notificaciones (${noLeidas} sin leer)` : "Notificaciones"}
        className="relative flex h-10 w-10 items-center justify-center rounded-none text-slate-700 transition hover:bg-blue-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
              Notificaciones
            </h2>
            <button
              type="button"
              onClick={() => void manejarMarcarTodas()}
              disabled={noLeidas === 0}
              className="text-[11px] uppercase tracking-widest text-slate-600 underline transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Marcar todas
            </button>
          </div>

          {accionError && (
            <div className="px-4 py-2">
              <StatusMessage tipo="error" mensaje={accionError} />
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4">
                <StatusMessage tipo="error" mensaje={error} />
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-900">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-slate-400 dark:text-slate-500"
                    aria-hidden
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Todo tranquilo por acá
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No tenés notificaciones por ahora.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {notificaciones.map((notificacion) => (
                  <li key={notificacion.id}>
                    <button
                      type="button"
                      onClick={() => void manejarMarcarUna(notificacion.id)}
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition ${
                        notificacion.leida
                          ? "bg-white hover:bg-gray-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                          : "bg-blue-50 hover:bg-blue-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {!notificacion.leida && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden />
                        )}
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {notificacion.titulo}
                        </span>
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {notificacion.mensaje}
                      </span>
                      <span className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {formatearTiempoRelativo(notificacion.createdAt, ahora)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
