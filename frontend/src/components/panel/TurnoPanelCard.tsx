"use client";

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
  onCambiarEstado: (turno: Turno, estado: EstadoTurno) => void;
  onSincronizado?: (resultado: SincronizacionTurno) => void;
}

export function TurnoPanelCard({
  turno,
  actualizando = false,
  puedeSincronizar = false,
  onCambiarEstado,
  onSincronizado,
}: TurnoPanelCardProps) {
  const acciones = accionesDisponibles(turno.estado);
  const mostrarSync =
    puedeSincronizar && (turno.estado === "pendiente" || turno.estado === "confirmado");

  return (
    <article className="flex flex-col border border-border bg-surface p-5 transition-shadow hover:shadow-sm ">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-black leading-none tracking-tight text-foreground ">
            {formatearHora(turno.fechaInicio)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted ">
            hasta {formatearHora(turno.fechaFin)}
          </p>
        </div>
        <EstadoBadge estado={turno.estado} />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-base font-semibold text-foreground ">
          {turno.cliente?.nombre ?? "Cliente sin nombre"}
        </p>
        <p className="text-sm text-muted ">
          {turno.servicio?.nombre ?? "Servicio"}
          {turno.servicio
            ? ` · ${formatearDuracion(turno.servicio.duracionMin)} · ${formatearPrecio(turno.servicio.precio)}`
            : ""}
        </p>
        {turno.notas && (
          <p className="truncate text-xs text-muted " title={turno.notas}>
            {turno.notas}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {acciones.length === 0 && !mostrarSync ? (
          <p className="text-xs uppercase tracking-widest text-muted ">
            Sin acciones disponibles
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
