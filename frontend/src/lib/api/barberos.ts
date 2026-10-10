import { apiFetch } from "./client";
import type { Barbero, Disponibilidad } from "@/types/api";

export function getBarberos() {
  return apiFetch<Barbero[]>("/api/barberos");
}

export function getDisponibilidad(barberoId: string, fecha: string, servicioId: string) {
  const query = new URLSearchParams({ fecha, servicioId }).toString();
  return apiFetch<Disponibilidad>(`/api/barberos/${barberoId}/disponibilidad?${query}`);
}
