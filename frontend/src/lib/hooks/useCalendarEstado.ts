"use client";

import { useCallback, useEffect, useState } from "react";
import { getCalendarEstado, reconectarCalendar } from "@/lib/api/integraciones";
import { ApiError } from "@/lib/api/client";
import type { CalendarEstado } from "@/types/api";

interface DatosEstado {
  firma: string;
  estado: CalendarEstado | null;
  error: string | null;
}

const ERROR_CARGA = "No se pudo consultar el estado de la integración";

export function useCalendarEstado(habilitado = true) {
  const [datos, setDatos] = useState<DatosEstado>({ firma: "", estado: null, error: null });
  const [refetch, setRefetch] = useState(0);

  const firma = habilitado ? `calendar-${refetch}` : "";

  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    getCalendarEstado()
      .then((data) => {
        if (activo) setDatos({ firma, estado: data, error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            estado: null,
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [habilitado, firma]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const reconectar = useCallback(async () => {
    const data = await reconectarCalendar();
    setDatos({ firma, estado: data, error: null });
    return data;
  }, [firma]);

  const loading = habilitado && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const estado = datos.firma === firma ? datos.estado : null;

  return { estado, loading, error, recargar, reconectar };
}
