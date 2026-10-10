import { apiFetch } from "./client";
import type { Notificacion } from "@/types/api";

export function getMisNotificaciones() {
  return apiFetch<Notificacion[]>("/api/notificaciones");
}

export function marcarLeida(id: string) {
  return apiFetch<Notificacion>(`/api/notificaciones/${id}/leer`, {
    method: "PATCH",
  });
}

export function marcarTodasLeidas() {
  return apiFetch<{ actualizadas: number }>("/api/notificaciones/leer-todas", {
    method: "PATCH",
  });
}
