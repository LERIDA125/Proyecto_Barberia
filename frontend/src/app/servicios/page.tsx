"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServicios } from "@/lib/hooks/useServicios";
import { useSesion } from "@/lib/hooks/useSesion";
import { ServicioCard } from "@/components/servicios/ServicioCard";
import { ServicioFormModal } from "@/components/servicios/ServicioFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <div className="px-6 py-12 bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">
            Catálogo de servicios
          </h1>
          <p className="mt-1 text-sm text-muted">Conocé qué ofrece la barbería antes de reservar.</p>
        </div>
        {esAdmin && (
          <Button onClick={abrirCrear} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
            Nuevo servicio
          </Button>
        )}
      </div>

      {errorAccion && (
        <div className="mt-6">
          <span className="bg-accent/15 text-foreground px-4 py-2 rounded-none text-sm uppercase tracking-widest">Error</span>
          <p className="mt-2 text-sm text-foreground">{errorAccion}</p>
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServicioCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <span className="bg-red-900/30 text-red-300 px-4 py-2 rounded-none text-sm uppercase tracking-widest">Error</span>
            <p className="text-sm text-foreground">{error}</p>
            <Button variante="secondary" onClick={() => void recargar()}>Reintentar</Button>
          </div>
        ) : servicios.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-widest">Todavía no hay servicios</h2>
            <p className="mt-2 text-muted">Cuando se carguen servicios, van a aparecer en este catálogo.</p>
            {esAdmin ? (
              <Button onClick={abrirCrear} className="mt-6 rounded-none bg-foreground text-background hover:bg-foreground/90">Crear el primero</Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

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
  );
}
