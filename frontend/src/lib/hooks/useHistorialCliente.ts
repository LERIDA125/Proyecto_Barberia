"use client";

import { useCallback, useEffect, useState } from "react";
import { getHistorialCliente } from "@/lib/api/clientes";
import { actualizarNotaTurno } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import type { HistorialCliente, Turno } from "@/types/api";

interface DatosHistorial {
  firma: string;
  historial: HistorialCliente | null;
  error: string | null;
}

const ERROR_HISTORIAL = "No se pudo cargar el historial del cliente";

export function useHistorialCliente(clienteId: string | null) {
  const [datos, setDatos] = useState<DatosHistorial>({
    firma: "",
    historial: null,
    error: null,
  });

  const firma = clienteId ?? "";

  useEffect(() => {
    if (!clienteId) return;
    let activo = true;
    getHistorialCliente(clienteId)
      .then((data) => {
        if (activo) setDatos({ firma, historial: data, error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            historial: null,
            error: err instanceof ApiError ? err.message : ERROR_HISTORIAL,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [clienteId, firma]);

  const guardarNota = useCallback(async (turnoId: string, notas: string) => {
    const actualizado = await actualizarNotaTurno(turnoId, notas);
    setDatos((prev) => {
      if (!prev.historial) return prev;
      return {
        ...prev,
        historial: {
          ...prev.historial,
          turnos: prev.historial.turnos.map((turno: Turno) =>
            turno.id === turnoId ? actualizado : turno,
          ),
        },
      };
    });
    return actualizado;
  }, []);

  const cargando = Boolean(clienteId) && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const historial = datos.firma === firma ? datos.historial : null;

  return { historial, cargando, error, guardarNota };
}
