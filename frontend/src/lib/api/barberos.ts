import { apiFetch } from "./client";
import type { Barbero, Bloqueo, BloqueoInput, Disponibilidad, Turno } from "@/types/api";

export function getBarberos() {
  return apiFetch<Barbero[]>("/api/barberos");
}

export function getDisponibilidad(barberoId: string, fecha: string, servicioId: string) {
  const query = new URLSearchParams({ fecha, servicioId }).toString();
  return apiFetch<Disponibilidad>(`/api/barberos/${barberoId}/disponibilidad?${query}`);
}

export function getMiAgenda(desde?: string, hasta?: string) {
  const query = new URLSearchParams();
  if (desde) query.set("desde", desde);
  if (hasta) query.set("hasta", hasta);
  const qs = query.toString();
  return apiFetch<Turno[]>(`/api/barberos/me/agenda${qs ? `?${qs}` : ""}`);
}

export function getMisBloqueos() {
  return apiFetch<Bloqueo[]>("/api/barberos/me/bloqueos");
}

export function crearBloqueo(input: BloqueoInput) {
  return apiFetch<Bloqueo>("/api/barberos/me/bloqueos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function eliminarBloqueo(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/barberos/me/bloqueos/${id}`, {
    method: "DELETE",
  });
}
