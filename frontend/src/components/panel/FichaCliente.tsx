"use client";

import { useHistorialCliente } from "@/lib/hooks/useHistorialCliente";
import { TurnoHistorialCard } from "@/components/panel/TurnoHistorialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatearFechaHora, formatearPrecio } from "@/lib/utils/format";
import type { Cliente, ResumenCliente } from "@/types/api";

interface FichaClienteProps {
  cliente: Cliente;
}

function ResumenFicha({ resumen }: { resumen: ResumenCliente }) {
  const estadisticas = [
    { etiqueta: "Total turnos", valor: String(resumen.totalTurnos) },
    { etiqueta: "Completados", valor: String(resumen.completados) },
    { etiqueta: "Total gastado", valor: formatearPrecio(resumen.totalGastado) },
    {
      etiqueta: "Última visita",
      valor: resumen.ultimaVisita ? formatearFechaHora(resumen.ultimaVisita) : "—",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {estadisticas.map((stat) => (
        <div key={stat.etiqueta} className="border border-neutral-800 bg-neutral-900 p-4 ">
          <dt className="text-xs uppercase tracking-widest text-neutral-500 ">
            {stat.etiqueta}
          </dt>
          <dd className="mt-1 break-words text-lg font-black tabular-nums text-white ">
            {stat.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FichaCliente({ cliente }: FichaClienteProps) {
  const { historial, cargando, error, guardarNota } = useHistorialCliente(cliente.id);

  return (
    <section aria-live="polite">
      <header className="border-b border-neutral-800 pb-4 ">
        <h2 className="text-xl font-black uppercase tracking-tighter text-white ">
          {cliente.nombre}
        </h2>
        <p className="mt-1 text-sm text-neutral-400 ">
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
        ) : (
          <>
            {historial?.resumen && <ResumenFicha resumen={historial.resumen} />}
            {!historial || historial.turnos.length === 0 ? (
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
          </>
        )}
      </div>
    </section>
  );
}
