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
    <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-dashed border-neutral-800 bg-neutral-900 px-6 py-12 text-center ">
      <h3 className="text-base font-black uppercase tracking-widest text-white ">{titulo}</h3>
      {descripcion && (
        <p className="max-w-md text-sm text-neutral-400 ">{descripcion}</p>
      )}
      {accion}
    </div>
  );
}