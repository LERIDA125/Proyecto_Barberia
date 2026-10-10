"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getSesion, logout as apiLogout } from "@/lib/api/auth";
import type { Usuario } from "@/types/api";

interface SesionEstado {
  usuario: Usuario | null;
  loading: boolean;
  inicializado: boolean;
}

let estado: SesionEstado = { usuario: null, loading: true, inicializado: false };
const oyentes = new Set<() => void>();

function emitir(nuevo: SesionEstado) {
  estado = nuevo;
  for (const oyente of oyentes) oyente();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  if (!estado.inicializado) void cargarSesion();
  return () => {
    oyentes.delete(oyente);
  };
}

function getSnapshot() {
  return estado;
}

function getServerSnapshot() {
  return estado;
}

export async function cargarSesion(silencioso = false) {
  if (!silencioso) emitir({ ...estado, loading: true });
  try {
    const usuario = await getSesion();
    emitir({ usuario, loading: false, inicializado: true });
  } catch {
    emitir({ usuario: null, loading: false, inicializado: true });
  }
}

export function refrescarSesion() {
  return cargarSesion(true);
}

export function iniciarSesion(usuario: Usuario) {
  emitir({ usuario, loading: false, inicializado: true });
}

export async function cerrarSesion() {
  try {
    await apiLogout();
  } finally {
    emitir({ usuario: null, loading: false, inicializado: true });
  }
}

export function useSesion() {
  const sesion = useSyncExternalStore(suscribir, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!sesion.inicializado) return;
    function alVolver() {
      if (document.visibilityState === "visible") void refrescarSesion();
    }
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [sesion.inicializado]);

  return sesion;
}
