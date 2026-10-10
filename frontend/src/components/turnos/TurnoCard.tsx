"use client";

import { Button } from "@/components/ui/Button";
import { formatearDuracion, formatearHora, formatearPrecio } from "@/lib/utils/format";
import type { Turno } from "@/types/api";

interface TurnoCardProps {
  turno: Turno;
  onCancelar?: (turno: Turno) => void;
  onReprogramar?: (turno: Turno) => void;
}

export function TurnoCard({ turno, onCancelar, onReprogramar }: TurnoCardProps) {
  const fecha = new Date(turno.fechaInicio);
  const diaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(fecha);
  const mes = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(fecha);

  return (
    <div className="border-t border-border pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
        <div className="sm:w-32 sm:shrink-0 sm:flex-col sm:gap-0 sm:border-r sm:border-border sm:pr-6 sm:text-center">
          <span className="block text-3xl font-bold leading-none text-foreground">{fecha.getDate()}</span>
          <span className="block text-sm text-muted">
            {diaSemana.slice(0, 1).toUpperCase() + diaSemana.slice(1)} · {mes}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold uppercase tracking-widest text-foreground">
              {turno.servicio?.nombre ?? "Turno"}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/15 text-foreground text-xs uppercase rounded-none">
              {turno.estado}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted">
            {turno.barbero?.nombre ?? "Barbero"} ·{ " "}
            {turno.servicio
              ? `${formatearDuracion(turno.servicio.duracionMin)} · ${formatearPrecio(turno.servicio.precio)}`
              : "Sin servicio"}
          </p>
          {turno.notas && (
            <p className="mt-1 truncate text-xs text-muted">{turno.notas}</p>
          )}
        </div>
      </div>

      {(onCancelar || onReprogramar) && (
        <div className="flex shrink-0 gap-2 mt-4">
          {onReprogramar && (
            <Button onClick={() => onReprogramar(turno)}>Reprogramar</Button>
          )}
          {onCancelar && (
            <Button variante="ghost" onClick={() => onCancelar(turno)}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}