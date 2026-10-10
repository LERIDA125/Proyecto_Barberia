import { Badge } from "./Badge";
import type { EstadoTurno } from "@/types/api";

type Tono = "neutral" | "success" | "warning" | "danger" | "info";

const MAPA: Record<EstadoTurno, { tono: Tono; etiqueta: string }> = {
  pendiente: { tono: "warning", etiqueta: "Pendiente" },
  confirmado: { tono: "success", etiqueta: "Confirmado" },
  cancelado: { tono: "danger", etiqueta: "Cancelado" },
  completado: { tono: "info", etiqueta: "Completado" },
  ausente: { tono: "neutral", etiqueta: "Ausente" },
};

export function EstadoBadge({ estado }: { estado: EstadoTurno }) {
  const config = MAPA[estado];
  return <Badge tone={config.tono}>{config.etiqueta}</Badge>;
}