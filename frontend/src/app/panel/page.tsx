"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useMiAgenda } from "@/lib/hooks/useMiAgenda";
import { TurnoPanelCard } from "@/components/panel/TurnoPanelCard";
import { BloqueosManager } from "@/components/panel/BloqueosManager";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { formatearFechaCorta } from "@/lib/utils/format";
import type { EstadoTurno, Turno } from "@/types/api";

const VACIO: Record<EstadoTurno, number> = {
  pendiente: 0,
  confirmado: 0,
  completado: 0,
  cancelado: 0,
  ausente: 0,
};

export default function PanelPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const puedeOperar = Boolean(usuario && (usuario.rol === "barbero" || usuario.rol === "admin"));
  const { turnos, loading, error, recargar, cambiarEstado } = useMiAgenda(puedeOperar);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const resumen = useMemo(() => {
    const conteo = { ...VACIO };
    for (const turno of turnos) conteo[turno.estado] += 1;
    return conteo;
  }, [turnos]);

  async function manejarCambioEstado(turno: Turno, estado: EstadoTurno) {
    setAccionError(null);
    setActualizandoId(turno.id);
    try {
      await cambiarEstado(turno.id, estado);
    } catch (err) {
      setAccionError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el estado del turno",
      );
    } finally {
      setActualizandoId(null);
    }
  }

  if (sesionCargando) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-48" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl bg-gray-100 p-8 dark:bg-slate-900">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Iniciá sesión para ver el panel
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            El panel de control está disponible para barberos y administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="bg-black px-6 py-3 text-sm uppercase tracking-widest text-white hover:bg-gray-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!puedeOperar) {
    return (
      <div className="mx-auto max-w-md px-6 py-12 text-center">
        <StatusMessage tipo="error" mensaje="No autorizado: este panel es exclusivo para barberos." />
        <div className="mt-4">
          <Link href="/" className="text-sm uppercase tracking-widest text-slate-900 underline dark:text-slate-100">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-white px-6 py-10 dark:bg-slate-950">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Panel del barbero
          </h1>
          <p className="text-sm capitalize text-slate-600 dark:text-slate-400">
            {formatearFechaCorta(new Date().toISOString())}
          </p>
        </div>
        <Button variante="secondary" onClick={() => void recargar()} disabled={loading}>
          Actualizar
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(
          [
            ["Turnos", turnos.length, "text-slate-900 dark:text-slate-100"],
            ["Pendientes", resumen.pendiente, "text-slate-900 dark:text-slate-100"],
            ["Confirmados", resumen.confirmado, "text-slate-900 dark:text-slate-100"],
            ["Completados", resumen.completado, "text-green-700 dark:text-green-400"],
            ["Ausentes", resumen.ausente, "text-slate-500 dark:text-slate-400"],
          ] as const
        ).map(([etiqueta, valor, color]) => (
          <div
            key={etiqueta}
            className="flex items-center gap-2 border border-gray-100 bg-gray-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className={`text-lg font-bold ${color}`}>{valor}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {etiqueta}
            </span>
          </div>
        ))}
      </div>

      {accionError && (
        <div className="mt-6">
          <StatusMessage tipo="error" mensaje={accionError} />
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={() => void recargar()}>
              Reintentar
            </Button>
          </div>
        ) : turnos.length === 0 ? (
          <EmptyState
            titulo="No tenés turnos para hoy"
            descripcion="Cuando el calendario tenga reservas, van a aparecer acá para gestionarlas."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {turnos.map((turno) => (
              <TurnoPanelCard
                key={turno.id}
                turno={turno}
                actualizando={actualizandoId === turno.id}
                onCambiarEstado={manejarCambioEstado}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8 dark:border-slate-800">
        <BloqueosManager />
      </div>
    </div>
  );
}
