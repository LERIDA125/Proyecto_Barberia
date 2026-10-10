"use client";

import { useEffect, useState } from "react";
import { buscarClientes } from "@/lib/api/clientes";
import { ApiError } from "@/lib/api/client";
import type { Cliente } from "@/types/api";

interface DatosBusqueda {
  firma: string;
  clientes: Cliente[];
  error: string | null;
}

const ERROR_BUSQUEDA = "No se pudieron buscar clientes";
const RETARDO_MS = 350;
const MINIMO_CARACTERES = 2;

export function useBusquedaClientes(query: string) {
  const [datos, setDatos] = useState<DatosBusqueda>({ firma: "", clientes: [], error: null });

  const termino = query.trim();
  const activo = termino.length >= MINIMO_CARACTERES;
  const firma = activo ? termino : "";

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    const temporizador = setTimeout(() => {
      buscarClientes(termino)
        .then((data) => {
          if (vigente) setDatos({ firma, clientes: data, error: null });
        })
        .catch((err) => {
          if (vigente) {
            setDatos({
              firma,
              clientes: [],
              error: err instanceof ApiError ? err.message : ERROR_BUSQUEDA,
            });
          }
        });
    }, RETARDO_MS);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [activo, termino, firma]);

  const cargando = activo && datos.firma !== firma;
  const error = datos.firma === firma ? datos.error : null;
  const clientes = datos.firma === firma ? datos.clientes : [];

  return { clientes, cargando, error, activo };
}
