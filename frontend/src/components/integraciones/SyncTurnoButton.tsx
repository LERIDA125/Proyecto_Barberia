"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { sincronizarTurno } from "@/lib/api/integraciones";
import { ApiError } from "@/lib/api/client";
import type { SincronizacionTurno } from "@/types/api";

interface Aviso {
  tipo: "success" | "error" | "info";
  mensaje: string;
}

interface SyncTurnoButtonProps {
  turnoId: string;
  onSincronizado?: (resultado: SincronizacionTurno) => void;
}

export function SyncTurnoButton({ turnoId, onSincronizado }: SyncTurnoButtonProps) {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  async function sincronizar() {
    setAviso(null);
    setCargando(true);
    try {
      const resultado = await sincronizarTurno(turnoId);
      if (resultado.sincronizado) {
        setAviso({ tipo: "success", mensaje: "Sincronizado con Google Calendar" });
      } else {
        setAviso({ tipo: "info", mensaje: resultado.motivo ?? "Sincronización pendiente" });
      }
      onSincronizado?.(resultado);
    } catch (err) {
      setAviso({
        tipo: "error",
        mensaje:
          err instanceof ApiError
            ? err.message
            : "No se pudo sincronizar el turno con Google Calendar",
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variante="secondary"
        className="px-3 py-1.5"
        cargando={cargando}
        onClick={() => void sincronizar()}
      >
        {cargando ? "Sincronizando…" : "Sincronizar"}
      </Button>
      {aviso && <StatusMessage tipo={aviso.tipo} mensaje={aviso.mensaje} />}
    </div>
  );
}
