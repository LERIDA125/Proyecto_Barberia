import type { ReactNode } from "react";

interface OpcionSeleccionableProps {
  titulo: string;
  detalle?: ReactNode;
  pie?: ReactNode;
  seleccionado?: boolean;
  onSeleccionar: () => void;
}

export function OpcionSeleccionable({
  titulo,
  detalle,
  pie,
  seleccionado = false,
  onSeleccionar,
}: OpcionSeleccionableProps) {
  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={onSeleccionar}
      className={`flex w-full flex-col items-start gap-1 rounded-none border border-gray-200 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-100 ${
        seleccionado
          ? "border-slate-900 bg-blue-100"
          : "hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"}
      }`}
    >
      <span className="text-base font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{titulo}</span>
      {detalle && <span className="text-sm text-slate-600 dark:text-slate-300">{detalle}</span>}
      {pie && <span className="text-xs text-slate-500 dark:text-slate-400">{pie}</span>}
    </button>
  );
}