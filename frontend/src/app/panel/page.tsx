"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
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

  const navItems = [
    { href: "/panel", label: "Agenda" },
    { href: "/panel/clientes", label: "Clientes" },
    ...(usuario?.rol === "admin"
      ? [{ href: "/panel/configuracion", label: "Configuración" }]
      : []),
  ];

  if (sesionCargando) {
    return (
      <div className="min-h-screen bg-neutral-950 px-6 py-12 lg:px-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-48" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="mt-10 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl border border-neutral-800 bg-neutral-950 p-8">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-widest text-neutral-100">
            Iniciá sesión para ver el panel
          </h1>
          <p className="text-sm text-neutral-400">
            El panel de control está disponible para barberos y administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-neutral-200"
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 py-12 text-center">
        <StatusMessage tipo="error" mensaje="No autorizado: este panel es exclusivo para barberos." />
        <div className="mt-4">
          <Link href="/" className="text-sm uppercase tracking-widest text-neutral-100 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-800 px-4 py-8 md:flex">
        <p className="mb-6 px-3 text-xs uppercase tracking-widest text-neutral-500">
          Panel
        </p>
        {navItems.map((item) => {
          const activo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm uppercase tracking-widest transition-colors ${
                activo
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="px-6 py-10 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-neutral-100">
                Panel del barbero
              </h1>
              <p className="text-sm capitalize text-neutral-500">
                {formatearFechaCorta(new Date().toISOString())}
              </p>
            </div>
            <Button variante="secondary" onClick={() => void recargar()} disabled={loading}>
              Actualizar
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                ["Turnos", turnos.length, "text-foreground "],
                ["Pendientes", resumen.pendiente, "text-foreground "],
                ["Confirmados", resumen.confirmado, "text-foreground "],
                ["Completados", resumen.completado, "text-green-300 "],
                ["Ausentes", resumen.ausente, "text-muted "],
              ] as const
            ).map(([etiqueta, valor]) => (
              <div
                key={etiqueta}
                className="border border-neutral-800 bg-transparent p-5"
              >
                <span className="block font-mono text-3xl font-black tabular-nums text-neutral-100">
                  {valor}
                </span>
                <span className="mt-1 block text-xs uppercase tracking-widest text-neutral-500">
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

          <div className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">
              Agenda de hoy
            </h2>
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : error ? (
              <div className="mt-4 flex flex-col items-start gap-3">
                <StatusMessage tipo="error" mensaje={error} />
                <Button variante="secondary" onClick={() => void recargar()}>
                  Reintentar
                </Button>
              </div>
            ) : turnos.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  titulo="No tenés turnos para hoy"
                  descripcion="Cuando el calendario tenga reservas, van a aparecer acá para gestionarlas."
                />
              </div>
            ) : (
              <div className="mt-4 border-t border-neutral-900">
                {turnos.map((turno) => (
                  <TurnoPanelCard
                    key={turno.id}
                    turno={turno}
                    actualizando={actualizandoId === turno.id}
                    puedeSincronizar={usuario.rol === "admin"}
                    onCambiarEstado={manejarCambioEstado}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 border-t border-neutral-800 pt-8">
            <BloqueosManager />
          </div>
        </div>
      </div>
    </div>
  );
}
