"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SelectorFranjas } from "@/components/reservar/SelectorFranjas";
import { useDisponibilidad } from "@/lib/hooks/useDisponibilidad";
import { reprogramarTurno } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import { claveFechaLocal, formatearFechaHora, generarDias } from "@/lib/utils/format";
import type { FranjaHoraria, Turno } from "@/types/api";

interface ReprogramarDialogProps {
  turno: Turno | null;
  onCerrar: () => void;
  onReprogramado: () => void;
}

function mensajeDe(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function ReprogramarDialog({ turno, onCerrar, onReprogramado }: ReprogramarDialogProps) {
  const dias = useMemo(() => generarDias(new Date(), 14), []);
  const [fecha, setFecha] = useState(() => claveFechaLocal(new Date()));
  const [seleccion, setSeleccion] = useState<FranjaHoraria | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFinal, setErrorFinal] = useState<string | null>(null);
  const [refetch, setRefetch] = useState(0);

  const activo = Boolean(turno);
  const { franjas, cargando, error } = useDisponibilidad(
    activo,
    turno?.barberoId,
    turno?.servicioId,
    fecha,
    refetch,
  );

  const actual = turno;
  if (!actual) return null;

  function cambiarFecha(clave: string) {
    setFecha(clave);
    setSeleccion(null);
    setErrorFinal(null);
  }

  async function confirmar() {
    if (!actual || !seleccion) return;
    setGuardando(true);
    setErrorFinal(null);
    try {
      await reprogramarTurno(actual.id, seleccion.inicio);
      onReprogramado();
    } catch (err) {
      const msg = mensajeDe(err, "No se pudo reprogramar el turno");
      const esConflicto = err instanceof ApiError && err.status === 409;
      setErrorFinal(msg);
      if (esConflicto) {
        setSeleccion(null);
        setRefetch((n) => n + 1);
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto titulo="Reprogramar turno" onCerrar={onCerrar}>
      <p className="text-sm text-neutral-400 ">
        Estás cambiando <strong>{actual.servicio?.nombre ?? "el servicio"}</strong> del{" "}
        <strong>{formatearFechaHora(actual.fechaInicio)}</strong>.
      </p>

      <div>
        <SelectorFranjas
          dias={dias}
          fecha={fecha}
          franjas={franjas}
          franjaSeleccionada={seleccion}
          cargando={cargando}
          error={error}
          onSeleccionarFecha={cambiarFecha}
          onSeleccionarFranja={(f) => {
            setSeleccion(f);
            setErrorFinal(null);
          }}
          onReintentar={() => setRefetch((n) => n + 1)}
        />
      </div>

      {errorFinal && (
        <div>
          <StatusMessage tipo="error" mensaje={errorFinal} />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onCerrar} disabled={guardando}>Volver</Button>
        <Button onClick={() => void confirmar()} cargando={guardando} disabled={!seleccion || cargando}>
          Guardar nuevo horario
        </Button>
      </div>
    </Modal>
  );
}