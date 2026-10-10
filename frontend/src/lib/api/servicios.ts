import { apiFetch } from "./client";
import type { Servicio, ServicioInput } from "@/types/api";

export function getServicios(opts?: { incluirInactivos?: boolean }) {
  const query = opts?.incluirInactivos ? "?incluirInactivos=true" : "";
  return apiFetch<Servicio[]>(`/api/servicios${query}`);
}

export function getServicio(id: string) {
  return apiFetch<Servicio>(`/api/servicios/${id}`);
}

export function crearServicio(input: ServicioInput) {
  return apiFetch<Servicio>("/api/servicios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function actualizarServicio(id: string, input: Partial<ServicioInput>) {
  return apiFetch<Servicio>(`/api/servicios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function desactivarServicio(id: string) {
  return apiFetch<Servicio>(`/api/servicios/${id}`, { method: "DELETE" });
}
