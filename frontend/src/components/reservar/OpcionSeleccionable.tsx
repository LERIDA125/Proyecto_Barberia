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
      className={`flex w-full flex-col items-start gap-1 rounded-none border bg-transparent p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        seleccionado
          ? "border-white bg-neutral-900"
          : "border-neutral-800 hover:border-neutral-300 hover:bg-neutral-900"}
      }`}
    >
      <span className="text-base font-semibold uppercase tracking-widest text-neutral-100">{titulo}</span>
      {detalle && <span className="text-sm text-neutral-400">{detalle}</span>}
      {pie && <span className="text-xs text-neutral-400">{pie}</span>}
    </button>
  );
}