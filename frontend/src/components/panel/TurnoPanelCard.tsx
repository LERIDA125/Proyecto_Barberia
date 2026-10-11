"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { SyncTurnoButton } from "@/components/integraciones/SyncTurnoButton";
import { formatearDuracion, formatearHora, formatearPrecio } from "@/lib/utils/format";
import type { EstadoTurno, SincronizacionTurno, Turno } from "@/types/api";

type VarianteAccion = "primary" | "secondary" | "ghost" | "danger";

interface AccionEstado {
  estado: EstadoTurno;
  etiqueta: string;
  variante: VarianteAccion;
}

function accionesDisponibles(estado: EstadoTurno): AccionEstado[] {
  switch (estado) {
    case "pendiente":
      return [
        { estado: "confirmado", etiqueta: "Confirmar", variante: "primary" },
        { estado: "ausente", etiqueta: "Ausente", variante: "danger" },
        { estado: "cancelado", etiqueta: "Cancelar", variante: "ghost" },
      ];
    case "confirmado":
      return [
        { estado: "completado", etiqueta: "Completar", variante: "primary" },
        { estado: "ausente", etiqueta: "Ausente", variante: "danger" },
        { estado: "cancelado", etiqueta: "Cancelar", variante: "ghost" },
      ];
    default:
      return [];
  }
}

interface TurnoPanelCardProps {
  turno: Turno;
  actualizando?: boolean;
  puedeSincronizar?: boolean;
  barberoNombre?: string;
  onCambiarEstado: (turno: Turno, estado: EstadoTurno) => void;
  onSincronizado?: (resultado: SincronizacionTurno) => void;
}

export function TurnoPanelCard({
  turno,
  actualizando = false,
  puedeSincronizar = false,
  barberoNombre,
  onCambiarEstado,
  onSincronizado,
}: TurnoPanelCardProps) {
  const acciones = accionesDisponibles(turno.estado);
  const mostrarSync =
    puedeSincronizar && (turno.estado === "pendiente" || turno.estado === "confirmado");

  return (
    <article className="grid grid-cols-1 items-center gap-4 border-b border-neutral-900 py-5 md:grid-cols-[7rem_minmax(0,1fr)_auto]">
      <div className="flex flex-col">
        <p className="font-mono text-xl font-bold leading-none tabular-nums text-white">
          {formatearHora(turno.fechaInicio)}
        </p>
        <p className="mt-1 font-mono text-xs tabular-nums text-neutral-500">
          hasta {formatearHora(turno.fechaFin)}
        </p>
      </div>

      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold text-white">
            {turno.cliente?.nombre ?? "Cliente sin nombre"}
          </p>
          {barberoNombre && <Badge tone="neutral">Barbero · {barberoNombre}</Badge>}
        </div>
        <p className="truncate text-sm text-neutral-400">
          {turno.servicio?.nombre ?? "Servicio"}
          {turno.servicio
            ? ` · ${formatearDuracion(turno.servicio.duracionMin)} · ${formatearPrecio(turno.servicio.precio)}`
            : ""}
        </p>
        {turno.notas && (
          <p className="truncate text-xs text-neutral-500" title={turno.notas}>
            {turno.notas}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <EstadoBadge estado={turno.estado} />
        {acciones.length === 0 && !mostrarSync ? (
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Sin acciones
          </p>
        ) : (
          <>
            {acciones.map((accion) => (
              <Button
                key={accion.estado}
                variante={accion.variante}
                disabled={actualizando}
                onClick={() => onCambiarEstado(turno, accion.estado)}
                className="px-3 py-1.5"
              >
                {actualizando ? "Guardando…" : accion.etiqueta}
              </Button>
            ))}
            {mostrarSync && (
              <SyncTurnoButton turnoId={turno.id} onSincronizado={onSincronizado} />
            )}
          </>
        )}
      </div>
    </article>
  );
}
