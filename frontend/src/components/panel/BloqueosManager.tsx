"use client";

import { useState, type FormEvent } from "react";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/api/client";
import { crearBloqueo, eliminarBloqueo } from "@/lib/api/barberos";
import { useMisBloqueos } from "@/lib/hooks/useMisBloqueos";
import { formatearFechaHora } from "@/lib/utils/format";
import type { Bloqueo } from "@/types/api";

const FORM_INICIAL = { inicio: "", fin: "", motivo: "" };

interface ErroresForm {
  inicio?: string;
  fin?: string;
}

function aIso(valor: string): string | null {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString();
}

function IconoBasura() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function BloqueosManager() {
  const { bloqueos, referencia, loading, error, recargar, agregar, quitar } = useMisBloqueos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState<ErroresForm>({});
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aEliminar, setAEliminar] = useState<Bloqueo | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const proximos = bloqueos.filter(
    (bloqueo) => new Date(bloqueo.fin).getTime() >= referencia,
  );

  function abrirModal() {
    setForm(FORM_INICIAL);
    setErrores({});
    setErrorForm(null);
    setModalAbierto(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nuevos: ErroresForm = {};
    const inicioIso = form.inicio ? aIso(form.inicio) : null;
    const finIso = form.fin ? aIso(form.fin) : null;

    if (!form.inicio) nuevos.inicio = "Indicá la fecha y hora de inicio";
    else if (!inicioIso) nuevos.inicio = "Fecha de inicio inválida";
    if (!form.fin) nuevos.fin = "Indicá la fecha y hora de fin";
    else if (!finIso) nuevos.fin = "Fecha de fin inválida";

    if (inicioIso && finIso && new Date(finIso) <= new Date(inicioIso)) {
      nuevos.fin = "La fecha de fin debe ser posterior a la de inicio";
    }

    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0 || !inicioIso || !finIso) return;

    setGuardando(true);
    setErrorForm(null);
    try {
      const creado = await crearBloqueo({
        inicio: inicioIso,
        fin: finIso,
        motivo: form.motivo.trim() || undefined,
      });
      agregar(creado);
      setModalAbierto(false);
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : "No se pudo crear el bloqueo");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorAccion(null);
    try {
      await eliminarBloqueo(aEliminar.id);
      quitar(aEliminar.id);
      setAEliminar(null);
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : "No se pudo eliminar el bloqueo");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <section aria-label="Gestión de bloqueos">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">
            Bloqueos de agenda
          </h2>
          <p className="text-sm text-neutral-400">
            Marcá ausencias o descansos para que esas franjas dejen de estar disponibles.
          </p>
        </div>
        <Button onClick={abrirModal}>Bloquear Horario</Button>
      </div>

      {errorAccion && (
        <div className="mt-4">
          <StatusMessage tipo="error" mensaje={errorAccion} />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <StatusMessage tipo="error" mensaje={error} />
            <Button variante="secondary" onClick={() => void recargar()}>
              Reintentar
            </Button>
          </div>
        ) : proximos.length === 0 ? (
          <EmptyState
            titulo="Sin bloqueos activos"
            descripcion="No tenés ausencias ni descansos programados para los próximos días."
          />
        ) : (
          <ul className="flex flex-col">
            {proximos.map((bloqueo) => (
              <li
                key={bloqueo.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">
                    {formatearFechaHora(bloqueo.inicio)}
                    <span className="text-neutral-500"> → </span>
                    {formatearFechaHora(bloqueo.fin)}
                  </p>
                  {bloqueo.motivo && (
                    <p className="truncate text-xs text-neutral-500">
                      {bloqueo.motivo}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variante="ghost"
                  aria-label="Eliminar bloqueo"
                  onClick={() => {
                    setErrorAccion(null);
                    setAEliminar(bloqueo);
                  }}
                  className="gap-2 px-3 py-1.5"
                >
                  <IconoBasura />
                  Cancelar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal abierto={modalAbierto} titulo="Bloquear horario" onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Inicio"
            name="inicio"
            type="datetime-local"
            value={form.inicio}
            error={errores.inicio}
            onChange={(e) => setForm({ ...form, inicio: e.target.value })}
          />
          <Input
            label="Fin"
            name="fin"
            type="datetime-local"
            value={form.fin}
            error={errores.fin}
            onChange={(e) => setForm({ ...form, fin: e.target.value })}
          />
          <Input
            label="Motivo (opcional)"
            name="motivo"
            value={form.motivo}
            placeholder="Ej.: turno médico, descanso, feriado"
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          />

          {errorForm && <StatusMessage tipo="error" mensaje={errorForm} />}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variante="secondary"
              onClick={() => setModalAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" cargando={guardando}>
              Crear bloqueo
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar bloqueo"
        mensaje="¿Querés liberar esta franja horaria? Los clientes van a poder reservar en ese rango nuevamente."
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
