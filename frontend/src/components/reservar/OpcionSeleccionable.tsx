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
      className={`flex w-full flex-col items-start gap-1 rounded-none border border-border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        seleccionado
          ? "border-accent bg-accent/15"
          : "hover:border-accent "}
      }`}
    >
      <span className="text-base font-semibold text-foreground uppercase tracking-widest">{titulo}</span>
      {detalle && <span className="text-sm text-muted ">{detalle}</span>}
      {pie && <span className="text-xs text-muted ">{pie}</span>}
    </button>
  );
}