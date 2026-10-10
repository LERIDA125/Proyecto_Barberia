"use client";

import { useCallback, useEffect, useState } from "react";
import { getServicios } from "@/lib/api/servicios";
import { ApiError } from "@/lib/api/client";
import type { Servicio } from "@/types/api";

function mensajeDe(err: unknown): string {
  return err instanceof ApiError ? err.message : "Error al cargar los servicios";
}

export function useServicios(incluirInactivos = false) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const data = await getServicios({ incluirInactivos });
        if (activo) {
          setServicios(data);
          setError(null);
        }
      } catch (err) {
        if (activo) setError(mensajeDe(err));
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [incluirInactivos]);

  const recargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getServicios({ incluirInactivos });
      setServicios(data);
      setError(null);
    } catch (err) {
      setError(mensajeDe(err));
    } finally {
      setLoading(false);
    }
  }, [incluirInactivos]);

  return { servicios, loading, error, recargar };
}
