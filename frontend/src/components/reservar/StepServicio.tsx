"use client";

import { OpcionSeleccionable } from "./OpcionSeleccionable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "@/components/ui/Button";
import { formatearDuracion, formatearPrecio } from "@/lib/utils/format";
import type { Servicio } from "@/types/api";

interface StepServicioProps {
  servicios: Servicio[];
  seleccionadoId: string;
  cargando: boolean;
  error: string | null;
  onSeleccionar: (id: string) => void;
  onReintentar: () => void;
}

export function StepServicio({
  servicios,
  seleccionadoId,
  cargando,
  error,
  onSeleccionar,
  onReintentar,
}: StepServicioProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">
        ¿Qué servicio necesitás?
      </h2>
      <p className="text-sm text-muted">Elegí uno del catálogo. La duración define el horario disponible.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {cargando ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-none bg-surface p-4 border border-border"
              >
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={onReintentar}>Reintentar</Button>
          </div>
        ) : (
          servicios.map((servicio) => (
            <OpcionSeleccionable
              key={servicio.id}
              titulo={servicio.nombre}
              detalle={servicio.descripcion || "Sin descripción."}
              pie={
                <>
                  {formatearDuracion(servicio.duracionMin)} · {formatearPrecio(servicio.precio)}
                </>
              }
              seleccionado={seleccionadoId === servicio.id}
              onSeleccionar={() => onSeleccionar(servicio.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}