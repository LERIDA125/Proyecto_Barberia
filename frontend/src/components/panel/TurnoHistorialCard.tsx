"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { formatearFechaHora, formatearHora, formatearPrecio } from "@/lib/utils/format";
import type { Turno } from "@/types/api";

interface TurnoHistorialCardProps {
  turno: Turno;
  onGuardar: (notas: string) => Promise<void>;
}

export function TurnoHistorialCard({ turno, onGuardar }: TurnoHistorialCardProps) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tieneNotas = Boolean(turno.notas && turno.notas.trim());

  function iniciarEdicion() {
    setValor(turno.notas ?? "");
    setError(null);
    setEditando(true);
  }

  function cancelar() {
    setEditando(false);
    setError(null);
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(valor.trim());
      setEditando(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la nota");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <article className="border border-gray-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {formatearFechaHora(turno.fechaInicio)}
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {turno.servicio?.nombre ?? "Servicio"}
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {formatearHora(turno.fechaInicio)}–{formatearHora(turno.fechaFin)}
        </p>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-slate-500 dark:text-slate-500">Barbero:</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-200">
            {turno.barbero?.nombre ?? "Sin asignar"}
          </dd>
        </div>
        {turno.servicio && (
          <div className="flex gap-2">
            <dt className="text-slate-500 dark:text-slate-500">Precio:</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">
              {formatearPrecio(turno.servicio.precio)}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-slate-800">
        {editando ? (
          <div className="flex flex-col gap-3">
            <Textarea
              label="Notas del servicio"
              rows={3}
              value={valor}
              maxLength={1000}
              placeholder="Detalles del corte, productos usados, preferencias del cliente…"
              onChange={(evento) => setValor(evento.target.value)}
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={() => void guardar()} cargando={guardando} className="px-3 py-1.5">
                Guardar
              </Button>
              <Button
                variante="ghost"
                onClick={cancelar}
                disabled={guardando}
                className="px-3 py-1.5"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : tieneNotas ? (
          <div className="flex flex-col gap-2">
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {turno.notas}
            </p>
            <div>
              <Button variante="ghost" onClick={iniciarEdicion} className="px-3 py-1.5">
                Editar nota
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm italic text-slate-400 dark:text-slate-500">
              Sin notas registradas.
            </p>
            <Button variante="secondary" onClick={iniciarEdicion} className="px-3 py-1.5">
              Agregar nota
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
