export function StatusMessage({
  tipo,
  mensaje,
}: {
  tipo: "error" | "success" | "info";
  mensaje: string;
}) {
  const estilos = {
    error: "border-l-4 border-l-red-900",
    success: "border-l-4 border-l-emerald-900",
    info: "border-l-4 border-l-neutral-600",
  } as const;

  return (
    <p
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-none border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs uppercase tracking-widest text-neutral-200 ${estilos[tipo]}`}
    >
      {mensaje}
    </p>
  );
}