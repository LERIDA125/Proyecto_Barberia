"use client";

import { useCallback, useEffect, useState } from "react";
import { getMisNotificaciones, marcarLeida, marcarTodasLeidas } from "@/lib/api/notificaciones";
import { ApiError } from "@/lib/api/client";
import type { Notificacion } from "@/types/api";

interface DatosNotificaciones {
  cargadas: boolean;
  ahora: number;
  notificaciones: Notificacion[];
  error: string | null;
}

const ERROR_CARGA = "No se pudieron cargar las notificaciones";

export function useNotificaciones(habilitado = true) {
  const [datos, setDatos] = useState<DatosNotificaciones>({
    cargadas: false,
    ahora: 0,
    notificaciones: [],
    error: null,
  });
  const [refetch, setRefetch] = useState(0);

  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    getMisNotificaciones()
      .then((data) => {
        if (activo) {
          setDatos({ cargadas: true, ahora: Date.now(), notificaciones: data, error: null });
        }
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            cargadas: true,
            ahora: Date.now(),
            notificaciones: [],
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [habilitado, refetch]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const marcarUna = useCallback(async (id: string) => {
    const actualizada = await marcarLeida(id);
    setDatos((prev) => ({
      ...prev,
      ahora: Date.now(),
      notificaciones: prev.notificaciones.map((notificacion) =>
        notificacion.id === id ? actualizada : notificacion,
      ),
    }));
    return actualizada;
  }, []);

  const marcarTodas = useCallback(async () => {
    await marcarTodasLeidas();
    setDatos((prev) => ({
      ...prev,
      ahora: Date.now(),
      notificaciones: prev.notificaciones.map((notificacion) => ({
        ...notificacion,
        leida: true,
      })),
    }));
  }, []);

  const cargando = habilitado && !datos.cargadas;
  const noLeidas = datos.notificaciones.filter((notificacion) => !notificacion.leida).length;

  return {
    notificaciones: datos.notificaciones,
    noLeidas,
    ahora: datos.ahora,
    cargando,
    error: datos.error,
    recargar,
    marcarUna,
    marcarTodas,
  };
}
