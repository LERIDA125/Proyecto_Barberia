"use client";

import { useCallback, useEffect, useState } from "react";
import { getMiAgenda } from "@/lib/api/barberos";
import { cambiarEstadoTurno } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import type { EstadoTurno, Turno } from "@/types/api";

interface DatosAgenda {
  firma: string;
  turnos: Turno[];
  error: string | null;
}

const ERROR_CARGA = "No se pudo cargar la agenda del día";

export function useMiAgenda(habilitado = true) {
  const [datos, setDatos] = useState<DatosAgenda>({ firma: "", turnos: [], error: null });
  const [refetch, setRefetch] = useState(0);

  const firma = habilitado ? `agenda-${refetch}` : "";

  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    getMiAgenda()
      .then((data) => {
        if (activo) setDatos({ firma, turnos: data, error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            turnos: [],
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [habilitado, firma]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const cambiarEstado = useCallback(async (id: string, estado: EstadoTurno) => {
    const actualizado = await cambiarEstadoTurno(id, estado);
    setDatos((prev) => ({
      ...prev,
      turnos: prev.turnos.map((turno) => (turno.id === id ? actualizado : turno)),
    }));
    return actualizado;
  }, []);

  const loading = habilitado && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const turnos = datos.firma === firma ? datos.turnos : [];

  return { turnos, loading, error, recargar, cambiarEstado };
}
