"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useClientes } from "@/lib/hooks/useClientes";
import { FichaCliente } from "@/components/panel/FichaCliente";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Cliente } from "@/types/api";

type OrdenClientes = "nombre" | "turnos";

function etiquetaTurnos(total: number): string {
  return `${total} ${total === 1 ? "turno" : "turnos"}`;
}

export default function ClientesPanelPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const puedeOperar = Boolean(usuario && (usuario.rol === "barbero" || usuario.rol === "admin"));

  const [query, setQuery] = useState("");
  const [orden, setOrden] = useState<OrdenClientes>("nombre");
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const { clientes, cargando, error, recargar } = useClientes(puedeOperar);

  const clientesVisibles = useMemo(() => {
    const termino = query.trim().toLowerCase();
    const filtrados = termino
      ? clientes.filter((cliente) =>
          `${cliente.nombre} ${cliente.email}`.toLowerCase().includes(termino),
        )
      : clientes;
    return [...filtrados].sort((a, b) =>
      orden === "turnos"
        ? (b.totalTurnos ?? 0) - (a.totalTurnos ?? 0)
        : a.nombre.localeCompare(b.nombre, "es"),
    );
  }, [clientes, query, orden]);

  if (sesionCargando) {
    return (
      <div className="mx-auto max-w-7xl bg-neutral-950 px-6 py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl rounded-none border border-neutral-800 bg-neutral-900 p-8 ">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter text-white ">
            Iniciá sesión para ver las fichas
          </h1>
          <p className="text-sm text-neutral-400 ">
            El historial de clientes está disponible para barberos y administradores.
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

  if (!puedeOperar) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <StatusMessage
          tipo="error"
          mensaje="No autorizado: las fichas de cliente son exclusivas para barberos y administradores."
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

  return (
    <div className="mx-auto max-w-7xl bg-neutral-950 px-6 py-10 ">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white ">
            Fichas de clientes
          </h1>
          <p className="mt-1 text-sm text-neutral-400 ">
            Filtrá y ordená a tus clientes para ver su ficha y su historial de visitas.
          </p>
        </div>
        <Link
          href="/panel"
          className="text-sm uppercase tracking-widest text-neutral-400 underline hover:text-white "
        >
          Volver al panel
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <Input
            label="Filtrar clientes"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Nombre o email…"
            value={query}
            onChange={(evento) => setQuery(evento.target.value)}
          />

          <div className="mt-4 flex flex-col gap-1">
            <label
              htmlFor="ordenClientes"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Ordenar por
            </label>
            <select
              id="ordenClientes"
              value={orden}
              onChange={(evento) => setOrden(evento.target.value as OrdenClientes)}
              className="rounded-none border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none transition focus:border-neutral-500 focus:ring-0"
            >
              <option value="nombre">Nombre (A–Z)</option>
              <option value="turnos">Más turnos</option>
            </select>
          </div>

          <div className="mt-4">
            {cargando ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-start gap-3">
                <StatusMessage tipo="error" mensaje={error} />
                <Button variante="secondary" onClick={() => void recargar()}>
                  Reintentar
                </Button>
              </div>
            ) : clientes.length === 0 ? (
              <EmptyState
                titulo="Sin clientes registrados"
                descripcion="Cuando se registren clientes van a aparecer acá para consultar su ficha."
              />
            ) : clientesVisibles.length === 0 ? (
              <EmptyState
                titulo="Sin coincidencias"
                descripcion="Ningún cliente coincide con el filtro. Probá con otro nombre o email."
              />
            ) : (
              <ul className="divide-y divide-neutral-800 border border-neutral-800 ">
                {clientesVisibles.map((cliente) => {
                  const activa = seleccionado?.id === cliente.id;
                  return (
                    <li key={cliente.id}>
                      <button
                        type="button"
                        onClick={() => setSeleccionado(cliente)}
                        aria-current={activa ? "true" : undefined}
                        className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors ${
                          activa
                            ? "bg-neutral-800 "
                            : "hover:bg-neutral-900 "
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold uppercase tracking-widest text-white ">
                            {cliente.nombre}
                          </span>
                          <span className="block truncate text-xs text-neutral-500 ">
                            {cliente.email}
                          </span>
                        </span>
                        <span className="shrink-0 border border-neutral-800 px-2 py-1 font-mono text-xs tabular-nums text-neutral-400 ">
                          {etiquetaTurnos(cliente.totalTurnos ?? 0)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          {seleccionado ? (
            <FichaCliente key={seleccionado.id} cliente={seleccionado} />
          ) : (
            <EmptyState
              titulo="Seleccioná un cliente"
              descripcion="Elegí un cliente de la lista para ver su ficha y su historial de turnos."
            />
          )}
        </div>
      </div>
    </div>
  );
}
