"use client";

import { useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useMetricas } from "@/lib/hooks/useMetricas";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { claveFechaLocal, formatearPrecio } from "@/lib/utils/format";

export default function MetricasPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const esAdmin = usuario?.rol === "admin";

  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const rangoInicial = {
    desde: claveFechaLocal(primerDiaMes),
    hasta: claveFechaLocal(hoy),
  };

  const [desdeInput, setDesdeInput] = useState(rangoInicial.desde);
  const [hastaInput, setHastaInput] = useState(rangoInicial.hasta);
  const [rango, setRango] = useState(rangoInicial);

  const { metricas, cargando, error, recargar } = useMetricas(rango, esAdmin);

  const servicios = metricas?.serviciosMasPedidos ?? [];
  const maxCantidad = Math.max(1, ...servicios.map((s) => s.cantidad));

  function actualizar() {
    setRango({ desde: desdeInput, hasta: hastaInput });
    recargar();
  }

  if (sesionCargando) {
    return (
      <div className="mx-auto max-w-3xl bg-neutral-950 px-6 py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-8 h-64" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl rounded-none border border-neutral-800 bg-neutral-900 p-8 ">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter text-white ">
            Iniciá sesión para ver las métricas
          </h1>
          <p className="text-sm text-neutral-400 ">
            El tablero de métricas está disponible para administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="rounded-none bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-neutral-300 "
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <StatusMessage
          tipo="error"
          mensaje="No autorizado: las métricas son exclusivas para administradores."
        />
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm uppercase tracking-widest text-neutral-400 underline hover:text-white "
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const porEstado = metricas?.turnos.porEstado;

  return (
    <div className="mx-auto max-w-3xl min-h-screen bg-neutral-950 px-6 py-10 ">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white ">
            Métricas
          </h1>
          <p className="mt-1 text-sm text-neutral-400 ">
            Ingresos, ocupación y servicios más pedidos en el rango elegido.
          </p>
        </div>
        <Link
          href="/panel"
          className="text-sm uppercase tracking-widest text-neutral-400 underline hover:text-white "
        >
          Volver al panel
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="desde"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Desde
          </label>
          <input
            id="desde"
            type="date"
            value={desdeInput}
            onChange={(e) => setDesdeInput(e.target.value)}
            className="rounded-none border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition [color-scheme:dark] focus:border-neutral-500 focus:ring-0"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="hasta"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Hasta
          </label>
          <input
            id="hasta"
            type="date"
            value={hastaInput}
            onChange={(e) => setHastaInput(e.target.value)}
            className="rounded-none border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition [color-scheme:dark] focus:border-neutral-500 focus:ring-0"
          />
        </div>
        <Button variante="secondary" onClick={actualizar} disabled={cargando}>
          Actualizar
        </Button>
      </div>

      {cargando ? (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="mt-8 flex flex-col items-start gap-3">
          <StatusMessage tipo="error" mensaje={error} />
          <Button variante="secondary" onClick={() => void recargar()}>
            Reintentar
          </Button>
        </div>
      ) : !metricas || metricas.turnos.total === 0 ? (
        <div className="mt-8">
          <EmptyState
            titulo="Sin turnos en el rango"
            descripcion="Probá con otro rango de fechas para ver las métricas del negocio."
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border border-neutral-800 bg-neutral-900 p-5">
              <span className="block text-xs uppercase tracking-widest text-neutral-500">
                Ingresos
              </span>
              <span className="mt-2 block font-mono text-3xl font-black tabular-nums text-white">
                {formatearPrecio(metricas.ingresos.monto)}
              </span>
              <span className="mt-1 block text-xs text-neutral-500">
                {metricas.ingresos.completados} turnos completados
              </span>
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-5">
              <span className="block text-xs uppercase tracking-widest text-neutral-500">
                Ocupación
              </span>
              <span className="mt-2 block font-mono text-3xl font-black tabular-nums text-white">
                {metricas.ocupacion.porcentaje.toFixed(1)} %
              </span>
              <span className="mt-1 block text-xs text-neutral-500">
                {metricas.ocupacion.horasOcupadas.toFixed(1)} h ocupadas de{" "}
                {metricas.ocupacion.horasDisponibles} h
              </span>
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-5">
              <span className="block text-xs uppercase tracking-widest text-neutral-500">
                Turnos
              </span>
              <span className="mt-2 block font-mono text-3xl font-black tabular-nums text-white">
                {metricas.turnos.total}
              </span>
              {porEstado && (
                <span className="mt-1 block text-xs text-neutral-500">
                  Pendientes: {porEstado.pendiente} · Confirmados: {porEstado.confirmado} ·
                  Completados: {porEstado.completado}
                </span>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xs uppercase tracking-widest text-neutral-500">
              Servicios más pedidos
            </h2>
            {servicios.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  titulo="Sin servicios en el rango"
                  descripcion="Cuando haya turnos cargados, vas a ver acá los servicios más pedidos."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {servicios.map((servicio, indice) => {
                  const pct = (servicio.cantidad / maxCantidad) * 100;
                  return (
                    <div
                      key={servicio.servicioId}
                      className="border border-neutral-800 bg-neutral-900 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-baseline gap-3">
                          <span className="font-mono text-sm tabular-nums text-neutral-500">
                            {indice + 1}
                          </span>
                          <span className="truncate text-sm font-bold uppercase tracking-wide text-white">
                            {servicio.nombre}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="border border-neutral-800 px-2 py-1 text-xs uppercase tracking-widest text-neutral-400">
                            {servicio.cantidad} turnos
                          </span>
                          <span className="font-mono text-sm tabular-nums text-neutral-200">
                            {formatearPrecio(servicio.ingresos)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 h-2 w-full bg-neutral-800">
                        <div className="h-full bg-white" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
