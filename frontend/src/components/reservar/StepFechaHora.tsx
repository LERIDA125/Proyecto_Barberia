"use client";

import { SelectorFranjas } from "./SelectorFranjas";
import { formatearDuracion } from "@/lib/utils/format";
import type { Barbero, FranjaHoraria, Servicio } from "@/types/api";

interface StepFechaHoraProps {
  dias: { clave: string; fecha: Date }[];
  fecha: string;
  franjas: FranjaHoraria[];
  franjaSeleccionada: FranjaHoraria | null;
  cargando: boolean;
  error: string | null;
  servicio?: Servicio;
  barbero?: Barbero;
  onSeleccionarFecha: (clave: string) => void;
  onSeleccionarFranja: (franja: FranjaHoraria) => void;
  onReintentar: () => void;
}

export function StepFechaHora({
  dias,
  fecha,
  franjas,
  franjaSeleccionada,
  cargando,
  error,
  servicio,
  barbero,
  onSeleccionarFecha,
  onSeleccionarFranja,
  onReintentar,
}: StepFechaHoraProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold uppercase tracking-widest text-neutral-100">
        Elegí día y horario
      </h2>
      <p className="text-sm text-neutral-400">
        {servicio && barbero
          ? `${formatearDuracion(servicio.duracionMin)} con ${barbero.nombre}. Franjas libres según su agenda.`
          : "Seleccioná una fecha para ver las franjas libres."}
      </p>

      <div>
        <SelectorFranjas
          dias={dias}
          fecha={fecha}
          franjas={franjas}
          franjaSeleccionada={franjaSeleccionada}
          cargando={cargando}
          error={error}
          onSeleccionarFecha={onSeleccionarFecha}
          onSeleccionarFranja={onSeleccionarFranja}
          onReintentar={onReintentar}
        />
      </div>
    </div>
  );
}