"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServicios } from "@/lib/hooks/useServicios";
import { useSesion } from "@/lib/hooks/useSesion";
import { ServicioCard } from "@/components/servicios/ServicioCard";
import { ServicioFormModal } from "@/components/servicios/ServicioFormModal";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ServicioCardSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { desactivarServicio } from "@/lib/api/servicios";
import { ApiError } from "@/lib/api/client";
import type { Servicio } from "@/types/api";

export default function ServiciosPage() {
  const router = useRouter();
  const { usuario } = useSesion();
  const esAdmin = usuario?.rol === "admin";
  const { servicios, loading, error, recargar } = useServicios(esAdmin);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [aDesactivar, setADesactivar] = useState<Servicio | null>(null);
  const [desactivando, setDesactivando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  function abrirCrear() {
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(servicio: Servicio) {
    setEditando(servicio);
    setModalAbierto(true);
  }

  async function confirmarDesactivar() {
    if (!aDesactivar) return;
    setDesactivando(true);
    setErrorAccion(null);
    try {
      await desactivarServicio(aDesactivar.id);
      setADesactivar(null);
      await recargar();
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo desactivar el servicio");
    } finally {
      setDesactivando(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="border-b border-neutral-800 pb-10">
          <h1 className="text-5xl font-bold uppercase tracking-tighter text-white md:text-7xl">
            Nuestros servicios
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-neutral-400">
            Conocé qué ofrece la barbería antes de reservar.
          </p>
          {esAdmin && (
            <div className="mt-6">
              <Button
                onClick={abrirCrear}
                className="rounded-none bg-white px-4 py-3 text-xs uppercase tracking-widest text-black hover:bg-neutral-300"
              >
                Nuevo servicio
              </Button>
            </div>
          )}
        </header>

        {errorAccion && (
          <div className="mt-8">
            <StatusMessage tipo="error" mensaje={errorAccion} />
          </div>
        )}

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ServicioCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={() => void recargar()}>
              Reintentar
            </Button>
          </div>
        ) : servicios.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
              Todavía no hay servicios
            </h2>
            <p className="mt-2 text-neutral-400">
              Cuando se carguen servicios, van a aparecer en este catálogo.
            </p>
            {esAdmin ? (
              <Button
                onClick={abrirCrear}
                className="mt-6 rounded-none bg-white px-4 py-3 text-xs uppercase tracking-widest text-black hover:bg-neutral-300"
              >
                Crear el primero
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {servicios.map((servicio) => (
              <ServicioCard
                key={servicio.id}
                servicio={servicio}
                esAdmin={esAdmin}
                onEditar={abrirEditar}
                onDesactivar={setADesactivar}
                onReservar={(s) => router.push(`/reservar?servicio=${s.id}`)}
              />
            ))}
          </div>
        )}

      {modalAbierto && (
        <ServicioFormModal
          key={editando?.id ?? "nuevo"}
          servicio={editando}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={() => {
            setModalAbierto(false);
            void recargar();
          }}
        />
      )}

      <ConfirmDialog
        abierto={Boolean(aDesactivar)}
        titulo="Desactivar servicio"
        mensaje={
          aDesactivar
            ? `"${aDesactivar.nombre}" dejará de mostrarse en el catálogo público. Los turnos existentes se conservan.`
            : ""
        }
        textoConfirmar="Desactivar"
        cargando={desactivando}
        onConfirmar={() => void confirmarDesactivar()}
        onCancelar={() => setADesactivar(null)}
      />
      </div>
    </div>
  );
}
