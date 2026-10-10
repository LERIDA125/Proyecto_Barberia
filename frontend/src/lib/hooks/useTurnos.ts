"use client";

import { useCallback, useEffect, useState } from "react";
import { getTurnos } from "@/lib/api/turnos";
import { ApiError } from "@/lib/api/client";
import type { Turno } from "@/types/api";

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const data = await getTurnos();
        if (activo) {
          setTurnos(data);
          setError(null);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar tus turnos");
        }
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const recargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTurnos();
      setTurnos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar tus turnos");
    } finally {
      setLoading(false);
    }
  }, []);

  return { turnos, loading, error, recargar };
}