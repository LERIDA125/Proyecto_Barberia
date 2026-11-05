import { apiFetch } from "./client";
import type { Cliente, HistorialCliente } from "@/types/api";

export function buscarClientes(query: string) {
  const qs = new URLSearchParams({ q: query }).toString();
  return apiFetch<Cliente[]>(`/api/clientes/buscar?${qs}`);
}

export function getClientes(limite?: number) {
  const params = new URLSearchParams();
  if (limite !== undefined) params.set("limite", String(limite));
  const qs = params.toString();
  return apiFetch<Cliente[]>(`/api/clientes${qs ? `?${qs}` : ""}`);
}

export function getHistorialCliente(id: string) {
  return apiFetch<HistorialCliente>(`/api/clientes/${id}/historial`);
}
