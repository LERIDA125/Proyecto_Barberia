"use client";

import { useEffect, useState } from "react";
import { getDisponibilidad } from "@/lib/api/barberos";
import { ApiError } from "@/lib/api/client";
import type { FranjaHoraria } from "@/types/api";

interface DatosCarga {
  firma: string;
  franjas: FranjaHoraria[];
  error: string | null;
}

export function useDisponibilidad(
  activo: boolean,
  barberoId?: string,
  servicioId?: string,
  fecha?: string,
  refetch = 0,
) {
  const [datos, setDatos] = useState<DatosCarga>({ firma: "", franjas: [], error: null });

  const firma = activo ? `${barberoId}|${servicioId}|${fecha}` : "";

  useEffect(() => {
    if (!activo || !barberoId || !servicioId || !fecha) return;
    let activoLocal = true;
    getDisponibilidad(barberoId, fecha, servicioId)
      .then((data) => {
        if (activoLocal) setDatos({ firma, franjas: data.franjas, error: null });
      })
      .catch((err) => {
        if (activoLocal) {
          setDatos({
            firma,
            franjas: [],
            error: err instanceof ApiError ? err.message : "No se pudo consultar la disponibilidad",
          });
        }
      });
    return () => {
      activoLocal = false;
    };
  }, [activo, barberoId, servicioId, fecha, refetch, firma]);

  const cargando = activo && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const franjas = datos.firma === firma ? datos.franjas : [];

  return { franjas, cargando, error };
}