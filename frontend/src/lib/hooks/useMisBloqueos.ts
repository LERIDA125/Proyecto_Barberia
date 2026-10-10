"use client";

import { useCallback, useEffect, useState } from "react";
import { getMisBloqueos } from "@/lib/api/barberos";
import { ApiError } from "@/lib/api/client";
import type { Bloqueo } from "@/types/api";

interface DatosBloqueos {
  firma: string;
  bloqueos: Bloqueo[];
  referencia: number;
  error: string | null;
}

const ERROR_CARGA = "No se pudieron cargar los bloqueos";

export function useMisBloqueos() {
  const [datos, setDatos] = useState<DatosBloqueos>({
    firma: "",
    bloqueos: [],
    referencia: 0,
    error: null,
  });
  const [refetch, setRefetch] = useState(0);

  const firma = `bloqueos-${refetch}`;

  useEffect(() => {
    let activo = true;
    getMisBloqueos()
      .then((data) => {
        if (activo) setDatos({ firma, bloqueos: data, referencia: Date.now(), error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            bloqueos: [],
            referencia: 0,
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [firma]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const agregar = useCallback((bloqueo: Bloqueo) => {
    setDatos((prev) => ({
      ...prev,
      bloqueos: [...prev.bloqueos, bloqueo].sort((a, b) => a.inicio.localeCompare(b.inicio)),
    }));
  }, []);

  const quitar = useCallback((id: string) => {
    setDatos((prev) => ({
      ...prev,
      bloqueos: prev.bloqueos.filter((bloqueo) => bloqueo.id !== id),
    }));
  }, []);

  const loading = datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const bloqueos = datos.firma === firma ? datos.bloqueos : [];
  const referencia = datos.firma === firma ? datos.referencia : 0;

  return { bloqueos, referencia, loading, error, recargar, agregar, quitar };
}
