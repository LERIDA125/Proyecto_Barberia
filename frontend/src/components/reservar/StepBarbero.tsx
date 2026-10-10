"use client";

import { OpcionSeleccionable } from "./OpcionSeleccionable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "@/components/ui/Button";
import type { Barbero } from "@/types/api";

interface StepBarberoProps {
  barberos: Barbero[];
  seleccionadoId: string;
  cargando: boolean;
  error: string | null;
  onSeleccionar: (id: string) => void;
  onReintentar: () => void;
}

export function StepBarbero({
  barberos,
  seleccionadoId,
  cargando,
  error,
  onSeleccionar,
  onReintentar,
}: StepBarberoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black uppercase tracking-tighter text-white">
        ¿Con quién querés atenderte?
      </h2>
      <p className="text-sm text-neutral-400">Cada barbero tiene su especialidad y su agenda propia.</p>

      <div className="grid gap-3">
        {cargando ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-none border border-neutral-800 bg-neutral-900 p-4"
              >
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={onReintentar}>Reintentar</Button>
          </div>
        ) : barberos.length === 0 ? (
          <StatusMessage tipo="info" mensaje="No hay barberos disponibles en este momento." />
        ) : (
          <div className="grid gap-3">
            {barberos.map((barbero) => (
              <OpcionSeleccionable
                key={barbero.id}
                titulo={barbero.nombre ?? "Barbero"}
                detalle={barbero.especialidad || "Sin especialidad cargada."}
                seleccionado={seleccionadoId === barbero.id}
                onSeleccionar={() => onSeleccionar(barbero.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}