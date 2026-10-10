"use client";

import { StatusMessage } from "@/components/ui/StatusMessage";
import {
  formatearDuracion,
  formatearFechaCorta,
  formatearHora,
  formatearPrecio,
} from "@/lib/utils/format";
import type { Barbero, FranjaHoraria, Servicio } from "@/types/api";

interface StepConfirmacionProps {
  servicio?: Servicio;
  barbero?: Barbero;
  fecha: string;
  franja?: FranjaHoraria;
  error: string | null;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-neutral-400 uppercase tracking-widest">{etiqueta}</dt>
      <dd className="text-sm font-medium text-neutral-100">{valor}</dd>
    </div>
  );
}

export function StepConfirmacion({
  servicio,
  barbero,
  fecha,
  franja,
  error,
}: StepConfirmacionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold uppercase tracking-widest text-neutral-100">
        Revisá y confirmá
      </h2>
      <p className="text-sm text-neutral-400">
        Verificá los datos antes de reservar. Podés volver atrás para cambiar algo.
      </p>

      <div className="border border-neutral-800 bg-neutral-900 p-4">
        <div className="pb-2">
          <Fila etiqueta="Servicio" valor={servicio?.nombre ?? "—"} />
          {servicio && (
            <Fila
              etiqueta="Duración"
              valor={`${formatearDuracion(servicio.duracionMin)} · ${formatearPrecio(servicio.precio)}`}
            />
          )}
        </div>
        <div>
          <Fila etiqueta="Barbero" valor={barbero?.nombre ?? "—"} />
          {barbero?.especialidad && <Fila etiqueta="Especialidad" valor={barbero.especialidad} />}
        </div>
        <div>
          <Fila etiqueta="Fecha" valor={fecha ? formatearFechaCorta(`${fecha}T12:00:00`) : "—"} />
          <Fila
            etiqueta="Horario"
            valor={franja ? `${formatearHora(franja.inicio)} — ${formatearHora(franja.fin)}` : "—"}
          />
        </div>
      </div>

      {error && (
        <div>
          <StatusMessage tipo="error" mensaje={error} />
        </div>
      )}
    </div>
  );
}