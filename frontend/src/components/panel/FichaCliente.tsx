"use client";

import { useHistorialCliente } from "@/lib/hooks/useHistorialCliente";
import { TurnoHistorialCard } from "@/components/panel/TurnoHistorialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Cliente } from "@/types/api";

interface FichaClienteProps {
  cliente: Cliente;
}

export function FichaCliente({ cliente }: FichaClienteProps) {
  const { historial, cargando, error, guardarNota } = useHistorialCliente(cliente.id);

  return (
    <section aria-live="polite">
      <header className="border-b border-border pb-4 ">
        <h2 className="text-xl font-black uppercase tracking-widest text-foreground ">
          {cliente.nombre}
        </h2>
        <p className="mt-1 text-sm text-muted ">
          {cliente.email}
          {cliente.telefono ? ` · ${cliente.telefono}` : ""}
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {cargando ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : error ? (
          <StatusMessage tipo="error" mensaje={error} />
        ) : !historial || historial.turnos.length === 0 ? (
          <EmptyState
            titulo="Sin visitas previas"
            descripcion="Este cliente todavía no tiene turnos finalizados en la barbería."
          />
        ) : (
          <ol className="space-y-4">
            {historial.turnos.map((turno) => (
              <li key={turno.id}>
                <TurnoHistorialCard
                  turno={turno}
                  onGuardar={async (notas) => {
                    await guardarNota(turno.id, notas);
                  }}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
