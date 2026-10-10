import { apiFetch } from "./client";
import type { EstadoTurno, Turno, TurnoInput } from "@/types/api";

export function getTurnos() {
  return apiFetch<Turno[]>("/api/turnos");
}

export function getTurno(id: string) {
  return apiFetch<Turno>(`/api/turnos/${id}`);
}

export function crearTurno(input: TurnoInput) {
  return apiFetch<Turno>("/api/turnos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelarTurno(id: string, motivo?: string) {
  return apiFetch<Turno>(`/api/turnos/${id}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo: motivo?.trim() || undefined }),
  });
}

export function reprogramarTurno(id: string, nuevaFechaInicio: string) {
  return apiFetch<Turno>(`/api/turnos/${id}/reprogramar`, {
    method: "PATCH",
    body: JSON.stringify({ nuevaFechaInicio }),
  });
}

export function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
  return apiFetch<Turno>(`/api/turnos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function actualizarNotaTurno(id: string, notas: string) {
  return apiFetch<Turno>(`/api/turnos/${id}/notas`, {
    method: "PATCH",
    body: JSON.stringify({ notas }),
  });
}
