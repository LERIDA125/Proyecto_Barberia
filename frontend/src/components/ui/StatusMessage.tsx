export function StatusMessage({
  tipo,
  mensaje,
}: {
  tipo: "error" | "success" | "info";
  mensaje: string;
}) {
  const estilos = {
    error: "bg-red-100 text-red-800 px-3 py-2 rounded-none border border-red-200 text-sm uppercase tracking-widest",
    success: "bg-green-100 text-green-800 px-3 py-2 rounded-none border border-green-200 text-sm uppercase tracking-widest",
    info: "bg-blue-100 text-slate-900 px-3 py-2 rounded-none border border-blue-200 text-sm uppercase tracking-widest",
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