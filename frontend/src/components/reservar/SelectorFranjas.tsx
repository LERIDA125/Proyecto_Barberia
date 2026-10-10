"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "@/components/ui/Button";
import { formatearDiaCorto, formatearHora } from "@/lib/utils/format";
import type { FranjaHoraria } from "@/types/api";

interface SelectorFranjasProps {
  dias: { clave: string; fecha: Date }[];
  fecha: string;
  franjas: FranjaHoraria[];
  franjaSeleccionada: FranjaHoraria | null;
  cargando: boolean;
  error: string | null;
  onSeleccionarFecha: (clave: string) => void;
  onSeleccionarFranja: (franja: FranjaHoraria) => void;
  onReintentar: () => void;
}

export function SelectorFranjas({
  dias,
  fecha,
  franjas,
  franjaSeleccionada,
  cargando,
  error,
  onSeleccionarFecha,
  onSeleccionarFranja,
  onReintentar,
}: SelectorFranjasProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground uppercase tracking-widest">Fecha</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dias.map((dia) => {
          const activo = dia.clave === fecha;
          return (
            <button
              key={dia.clave}
              type="button"
              aria-pressed={activo}
              onClick={() => onSeleccionarFecha(dia.clave)}
              className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-none border border-border py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                activo
                  ? "border-accent bg-accent/15 text-foreground"
                  : "hover:border-accent text-sm uppercase"}
              `}>
              <span className="text-xs font-medium">{formatearDiaCorto(dia.fecha)}</span>
              <span className="text-lg font-semibold">{dia.fecha.getDate()}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm font-medium text-foreground uppercase tracking-widest">Horario</p>
      <div className="mt-2">
        {cargando ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-none bg-surface" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={onReintentar}>Reintentar</Button>
          </div>
        ) : franjas.length === 0 ? (
          <EmptyState
            titulo="No hay turnos libres ese día"
            descripcion="Probá con otra fecha."
          />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {franjas.map((franja) => {
              const activo = franjaSeleccionada?.inicio === franja.inicio;
              return (
                <button
                  key={franja.inicio}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => onSeleccionarFranja(franja)}
                  className={`rounded-none border border-border px-2 py-2 font-mono text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    activo
                      ? "border-accent bg-accent/15 text-foreground"
                      : "hover:border-accent text-sm uppercase"}
                  `}>
                  {formatearHora(franja.inicio)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}