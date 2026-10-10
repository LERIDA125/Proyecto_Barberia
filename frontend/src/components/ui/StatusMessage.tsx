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
    info: "border-l-4 border-l-neutral-500",
  } as const;

  return (
    <p
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-none border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm uppercase tracking-widest text-white ${estilos[tipo]}`}
    >
      {mensaje}
    </p>
  );
}