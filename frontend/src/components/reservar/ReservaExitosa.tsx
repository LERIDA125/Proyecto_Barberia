"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatearDuracion, formatearFechaHora, formatearPrecio } from "@/lib/utils/format";
import type { Turno } from "@/types/api";

interface ReservaExitosaProps {
  turno: Turno;
  onNuevaReserva: () => void;
}

export function ReservaExitosa({ turno, onNuevaReserva }: ReservaExitosaProps) {
  return (
    <div className="mx-auto py-12 text-center">
      <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900 mb-2">Turno confirmado</h1>
      <p className="text-sm text-slate-600 mb-8">Te esperamos. Podés verlo o gestionarlo desde Mis turnos.</p>

      <dl className="mx-auto max-w-md border-t border-gray-100 pb-4">
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-slate-500 uppercase tracking-widest">Servicio</dt>
          <dd className="text-right text-sm font-medium text-slate-900">
            {turno.servicio?.nombre ?? "—"}
            {turno.servicio && (
              <span className="block text-xs font-normal text-slate-500">
                {formatearDuracion(turno.servicio.duracionMin)} · {formatearPrecio(turno.servicio.precio)}
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-slate-500 uppercase tracking-widest">Barbero</dt>
          <dd className="text-right text-sm font-medium text-slate-900">
            {turno.barbero?.nombre ?? "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-slate-500 uppercase tracking-widest">Cuándo</dt>
          <dd className="text-right text-sm font-medium text-slate-900">
            {formatearFechaHora(turno.fechaInicio)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/mis-turnos"
          className="rounded-none bg-black text-white hover:bg-gray-800 px-6 py-3 text-sm uppercase tracking-widest">
          Ver mis turnos
        </Link>
        <Button variante="secondary" onClick={onNuevaReserva}>
          Reservar otro turno
        </Button>
      </div>
    </div>
  );
}