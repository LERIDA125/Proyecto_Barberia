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
      <h1 className="text-4xl font-black uppercase tracking-widest text-foreground mb-2">Turno confirmado</h1>
      <p className="text-sm text-muted mb-8">Te esperamos. Podés verlo o gestionarlo desde Mis turnos.</p>

      <dl className="mx-auto max-w-md border-t border-border pb-4">
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-muted uppercase tracking-widest">Servicio</dt>
          <dd className="text-right text-sm font-medium text-foreground">
            {turno.servicio?.nombre ?? "—"}
            {turno.servicio && (
              <span className="block text-xs font-normal text-muted">
                {formatearDuracion(turno.servicio.duracionMin)} · {formatearPrecio(turno.servicio.precio)}
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-muted uppercase tracking-widest">Barbero</dt>
          <dd className="text-right text-sm font-medium text-foreground">
            {turno.barbero?.nombre ?? "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-muted uppercase tracking-widest">Cuándo</dt>
          <dd className="text-right text-sm font-medium text-foreground">
            {formatearFechaHora(turno.fechaInicio)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/mis-turnos"
          className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-6 py-3 text-sm uppercase tracking-widest">
          Ver mis turnos
        </Link>
        <Button variante="secondary" onClick={onNuevaReserva}>
          Reservar otro turno
        </Button>
      </div>
    </div>
  );
}