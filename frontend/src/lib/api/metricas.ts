import { apiFetch } from "./client";
import type { Metricas } from "@/types/api";

export function getMetricas(params: { desde?: string; hasta?: string }) {
  const query = new URLSearchParams();
  if (params.desde) query.set("desde", params.desde);
  if (params.hasta) query.set("hasta", params.hasta);
  const qs = query.toString();
  return apiFetch<Metricas>(`/api/metricas${qs ? `?${qs}` : ""}`);
}
