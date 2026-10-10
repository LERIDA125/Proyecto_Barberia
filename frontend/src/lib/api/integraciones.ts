import { apiFetch } from "./client";
import type { CalendarEstado, ReconectarCalendar, SincronizacionTurno } from "@/types/api";

export function getCalendarEstado() {
  return apiFetch<CalendarEstado>("/api/integraciones/calendar/estado");
}

export function reconectarCalendar() {
  return apiFetch<ReconectarCalendar>("/api/integraciones/calendar/reconectar", {
    method: "POST",
  });
}

export function sincronizarTurno(turnoId: string) {
  return apiFetch<SincronizacionTurno>(
    `/api/integraciones/calendar/sincronizar/${turnoId}`,
    { method: "POST" },
  );
}
