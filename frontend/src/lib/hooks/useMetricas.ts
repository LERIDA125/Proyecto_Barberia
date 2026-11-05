"use client";

import { useCallback, useEffect, useState } from "react";
import { getMetricas } from "@/lib/api/metricas";
import { ApiError } from "@/lib/api/client";
import type { Metricas } from "@/types/api";

interface RangoMetricas {
  desde?: string;
  hasta?: string;
}

interface DatosMetricas {
  firma: string;
  metricas: Metricas | null;
  error: string | null;
}

const ERROR_CARGA = "No se pudieron cargar las métricas";

export function useMetricas({ desde, hasta }: RangoMetricas, habilitado = true) {
  const [datos, setDatos] = useState<DatosMetricas>({
    firma: "",
    metricas: null,
    error: null,
  });
  const [refetch, setRefetch] = useState(0);

  const firma = habilitado ? `metricas-${desde ?? ""}-${hasta ?? ""}-${refetch}` : "";

  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    getMetricas({ desde, hasta })
      .then((data) => {
        if (activo) setDatos({ firma, metricas: data, error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            metricas: null,
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [habilitado, firma, desde, hasta]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const cargando = habilitado && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const metricas = datos.firma === firma ? datos.metricas : null;

  return { metricas, cargando, error, recargar };
}
