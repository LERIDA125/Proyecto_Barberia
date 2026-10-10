import type { ReactNode } from "react";

export function EmptyState({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-dashed border-border bg-surface px-6 py-12 text-center ">
      <h3 className="text-base font-semibold text-foreground ">{titulo}</h3>
      {descripcion && (
        <p className="max-w-md text-sm text-muted ">{descripcion}</p>
      )}
      {accion}
    </div>
  );
}