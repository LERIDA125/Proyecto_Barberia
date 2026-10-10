import { apiFetch } from "./client";
import type { Cliente, HistorialCliente } from "@/types/api";

export function buscarClientes(query: string) {
  const qs = new URLSearchParams({ q: query }).toString();
  return apiFetch<Cliente[]>(`/api/clientes/buscar?${qs}`);
}

export function getHistorialCliente(id: string) {
  return apiFetch<HistorialCliente>(`/api/clientes/${id}/historial`);
}
