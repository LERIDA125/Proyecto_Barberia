"use client";

import { useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useBusquedaClientes } from "@/lib/hooks/useBusquedaClientes";
import { FichaCliente } from "@/components/panel/FichaCliente";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Cliente } from "@/types/api";

export default function ClientesPanelPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const puedeOperar = Boolean(usuario && (usuario.rol === "barbero" || usuario.rol === "admin"));

  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const { clientes, cargando, error, activo } = useBusquedaClientes(query);

  if (sesionCargando) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
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
      <div className="mx-auto max-w-md px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl bg-gray-100 p-8 dark:bg-slate-900">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Iniciá sesión para ver las fichas
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            El historial de clientes está disponible para barberos y administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="bg-black px-6 py-3 text-sm uppercase tracking-widest text-white hover:bg-gray-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
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
      <div className="mx-auto max-w-md px-6 py-12 text-center">
        <StatusMessage
          tipo="error"
          mensaje="No autorizado: las fichas de cliente son exclusivas para barberos."
        />
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm uppercase tracking-widest text-slate-900 underline dark:text-slate-100"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-white px-6 py-10 dark:bg-slate-950">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Fichas de clientes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Buscá un cliente por nombre o email para ver su historial de visitas.
          </p>
        </div>
        <Link
          href="/panel"
          className="text-sm uppercase tracking-widest text-slate-900 underline dark:text-slate-100"
        >
          Volver al panel
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <Input
            label="Buscar cliente"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Nombre o email…"
            value={query}
            onChange={(evento) => setQuery(evento.target.value)}
          />

          <div className="mt-4">
            {!activo ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Escribí al menos 2 caracteres para empezar a buscar.
              </p>
            ) : cargando ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : error ? (
              <StatusMessage tipo="error" mensaje={error} />
            ) : clientes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sin coincidencias para “{query.trim()}”.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 border border-gray-100 dark:divide-slate-800 dark:border-slate-800">
                {clientes.map((cliente) => {
                  const activa = seleccionado?.id === cliente.id;
                  return (
                    <li key={cliente.id}>
                      <button
                        type="button"
                        onClick={() => setSeleccionado(cliente)}
                        aria-current={activa ? "true" : undefined}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          activa
                            ? "bg-blue-100 dark:bg-slate-800"
                            : "hover:bg-gray-50 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {cliente.nombre}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {cliente.email}
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
              descripcion="Elegí un resultado de la búsqueda para ver su ficha y su historial de turnos."
            />
          )}
        </div>
      </div>
    </div>
  );
}
