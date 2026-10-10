"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useTurnos } from "@/lib/hooks/useTurnos";
import { TurnoCard } from "@/components/turnos/TurnoCard";
import { CancelarTurnoDialog } from "@/components/turnos/CancelarTurnoDialog";
import { ReprogramarDialog } from "@/components/turnos/ReprogramarDialog";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "@/components/ui/Button";
import { esFuturo } from "@/lib/utils/format";
import type { Turno } from "@/types/api";

export default function MisTurnosPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const { turnos, loading, error, recargar } = useTurnos();
  const [aCancelar, setACancelar] = useState<Turno | null>(null);
  const [aReprogramar, setAReprogramar] = useState<Turno | null>(null);

  function puedeGestionar(turno: Turno): boolean {
    return (
      (turno.estado === "pendiente" || turno.estado === "confirmado") &&
      esFuturo(turno.fechaInicio)
    );
  }

  const { proximos, historial } = useMemo(() => {
    const proximos = turnos
      .filter((t) => esFuturo(t.fechaInicio))
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    const historial = turnos
      .filter((t) => !esFuturo(t.fechaInicio))
      .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
    return { proximos, historial };
  }, [turnos]);

  if (sesionCargando) {
    return (
      <div className="px-6 py-12 bg-surface max-w-4xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-16 w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="px-6 py-12 bg-surface max-w-md mx-auto text-center">
        <div className="rounded-none bg-surface p-8 max-w-xl mx-auto mb-6">
          <h1 className="text-4xl font-black uppercase tracking-widest text-foreground mb-2">Iniciá sesión para ver tus turnos</h1>
          <p className="text-sm text-muted">Tus reservas van a aparecer acá al ingresar con tu cuenta.</p>
          <div>
            <Link
              href="/login"
              className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-6 py-3 text-sm uppercase tracking-widest">
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 bg-surface max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Mis turnos</h1>
          <p className="text-sm text-muted">Tus próximas reservas y el historial de la barbería.</p>
        </div>
        <Link
          href="/reservar"
          className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-6 py-3 text-sm uppercase tracking-widest">
          Reservar turno
        </Link>
      </div>

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">Próximos</h2>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-none bg-surface" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-3">
                <StatusMessage tipo="error" mensaje={error} />
                <Button variante="secondary" onClick={() => void recargar()}>Reintentar</Button>
              </div>
            ) : proximos.length === 0 ? (
              <div className="py-8 text-center">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">No tenés turnos próximos</h2>
                <p className="mt-2 text-muted">Reservá un turno y lo vas a ver acá.</p>
                <Link
                  href="/reservar"
                  className="mt-4 rounded-none bg-foreground text-background hover:bg-foreground/90 px-6 py-3 text-sm uppercase tracking-widest">
                  Reservar turno
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {proximos.map((turno) => (
                  <TurnoCard key={turno.id} turno={turno} onCancelar={puedeGestionar(turno) ? setACancelar : undefined} onReprogramar={puedeGestionar(turno) ? setAReprogramar : undefined} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">Historial</h2>
          <div className="mt-4">
            {loading ? null : historial.length === 0 ? (
              <div className="py-8 text-center">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">Sin historial por ahora</h2>
                <p className="mt-2 text-muted">Acá vas a encontrar tus turnos pasados, cancelados y completados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((turno) => (
                  <TurnoCard key={turno.id} turno={turno} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <CancelarTurnoDialog
        key={`cancelar-${aCancelar?.id ?? "cerrado"}`}
        turno={aCancelar}
        onCerrar={() => setACancelar(null)}
        onCancelada={() => {
          setACancelar(null);
          void recargar();
        }}
      />
      <ReprogramarDialog
        key={`reprogramar-${aReprogramar?.id ?? "cerrado"}`}
        turno={aReprogramar}
        onCerrar={() => setAReprogramar(null)}
        onReprogramado={() => {
          setAReprogramar(null);
          void recargar();
        }}
      />
    </div>
  );
}