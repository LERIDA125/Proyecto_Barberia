export function StatusMessage({
  tipo,
  mensaje,
}: {
  tipo: "error" | "success" | "info";
  mensaje: string;
}) {
  const estilos = {
    error: "bg-red-900/30 text-red-300 px-3 py-2 rounded-none border border-red-900/40 text-sm uppercase tracking-widest",
    success: "bg-green-900/30 text-green-300 px-3 py-2 rounded-none border border-green-900/40 text-sm uppercase tracking-widest",
    info: "bg-accent/15 text-foreground px-3 py-2 rounded-none border border-accent/30 text-sm uppercase tracking-widest",
  } as const;

  return (
    <p
      role={tipo === "error" ? "alert" : "status"}
      className={estilos[tipo]}
    >
      {mensaje}
    </p>
  );
}