"use client";

import { useCallback, useEffect, useState } from "react";
import { getClientes } from "@/lib/api/clientes";
import { ApiError } from "@/lib/api/client";
import type { Cliente } from "@/types/api";

interface DatosClientes {
  firma: string;
  clientes: Cliente[];
  error: string | null;
}

const ERROR_CARGA = "No se pudieron cargar los clientes";

export function useClientes(habilitado = true) {
  const [datos, setDatos] = useState<DatosClientes>({ firma: "", clientes: [], error: null });
  const [refetch, setRefetch] = useState(0);

  const firma = habilitado ? `clientes-${refetch}` : "";

  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    getClientes()
      .then((data) => {
        if (activo) setDatos({ firma, clientes: data, error: null });
      })
      .catch((err) => {
        if (activo) {
          setDatos({
            firma,
            clientes: [],
            error: err instanceof ApiError ? err.message : ERROR_CARGA,
          });
        }
      });
    return () => {
      activo = false;
    };
  }, [habilitado, firma]);

  const recargar = useCallback(() => setRefetch((n) => n + 1), []);

  const cargando = habilitado && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const clientes = datos.firma === firma ? datos.clientes : [];

  return { clientes, cargando, error, recargar };
}
