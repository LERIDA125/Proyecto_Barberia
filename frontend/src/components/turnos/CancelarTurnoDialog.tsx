"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { cancelarTurno } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import { formatearFechaHora } from "@/lib/utils/format";
import type { Turno } from "@/types/api";

interface CancelarTurnoDialogProps {
  turno: Turno | null;
  onCerrar: () => void;
  onCancelada: () => void;
}

export function CancelarTurnoDialog({ turno, onCerrar, onCancelada }: CancelarTurnoDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual = turno;
  if (!actual) return null;

  async function confirmar() {
    if (!actual) return;
    setCargando(true);
    setError(null);
    try {
      await cancelarTurno(actual.id, motivo);
      onCancelada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar el turno");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal abierto titulo="Cancelar turno" onCerrar={onCerrar}>
      <p className="text-sm text-neutral-400 ">
        Se cancelará <strong>{actual.servicio?.nombre ?? "el turno"}</strong> del{" "}
        <strong>{formatearFechaHora(actual.fechaInicio)}</strong>.
      </p>
      <div className="mt-4">
        <Textarea
          label="Motivo (opcional)"
          name="motivo"
          rows={2}
          placeholder="¿Algún motivo que quieras dejar registrado?"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>
      {error && (
        <div>
          <StatusMessage tipo="error" mensaje={error} />
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onCerrar} disabled={cargando}>Volver</Button>
        <Button variante="danger" onClick={() => void confirmar()} cargando={cargando}>
          Cancelar turno
        </Button>
      </div>
    </Modal>
  );
}