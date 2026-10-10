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
    <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/50">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
      {descripcion && (
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">{descripcion}</p>
      )}
      {accion}
    </div>
  );
}