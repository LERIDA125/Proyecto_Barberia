"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatearFechaHora } from "@/lib/utils/format";
import type { CalendarEstado } from "@/types/api";

interface Presentacion {
  emoji: string;
  etiqueta: string;
  detalle: string;
  clases: string;
}

function presentar(estado: CalendarEstado): Presentacion {
  if (!estado.configurado) {
    return {
      emoji: "🔴",
      etiqueta: "Desconectado",
      detalle: "La integración no está configurada. Definí MCP_CALENDAR_URL en el backend.",
      clases: "bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-300",
    };
  }
  if (estado.conectado) {
    return {
      emoji: "🟢",
      etiqueta: "Conectado",
      detalle: "El servidor MCP responde y el calendario es accesible.",
      clases: "bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-300",
    };
  }
  return {
    emoji: "⚠️",
    etiqueta: "Fallando",
    detalle: "La integración está configurada, pero el servidor MCP no responde.",
    clases: "bg-blue-100 text-slate-900 dark:bg-blue-800/40 dark:text-slate-100",
  };
}

interface CalendarStatusCardProps {
  estado: CalendarEstado | null;
  cargando: boolean;
  reconectando: boolean;
  onReconectar: () => void;
}

export function CalendarStatusCard({
  estado,
  cargando,
  reconectando,
  onReconectar,
}: CalendarStatusCardProps) {
  if (cargando || !estado) {
    return (
      <Card>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-4 w-56" />
        <Skeleton className="mt-2 h-4 w-48" />
        <Skeleton className="mt-6 h-10 w-60" />
      </Card>
    );
  }

  const vista = presentar(estado);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Estado de la conexión
          </p>
          <p className="mt-1 text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Google Calendar
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium ${vista.clases}`}
        >
          <span aria-hidden>{vista.emoji}</span>
          {vista.etiqueta}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{vista.detalle}</p>

      <dl className="mt-6 space-y-3 border-t border-gray-100 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Calendario
          </dt>
          <dd className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {estado.calendarId || "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Última sincronización
          </dt>
          <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {estado.ultimaSync ? formatearFechaHora(estado.ultimaSync) : "Sin sincronizaciones"}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <Button variante="secondary" cargando={reconectando} onClick={onReconectar}>
          Verificar conexión / Reconectar
        </Button>
      </div>
    </Card>
  );
}
