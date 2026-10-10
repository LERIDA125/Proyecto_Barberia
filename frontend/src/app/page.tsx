import Link from "next/link";

export default function HomePage() {
  return (
    <div className="px-6 py-20 bg-surface max-w-5xl mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-widest text-foreground">
          Tu barbería, ordenada.
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted">
          Reservá turnos, gestioná el catálogo de servicios y administrá la agenda de los
          barberos desde un solo lugar.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/servicios"
          className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-6 py-3 text-sm uppercase tracking-widest">
          Ver catálogo de servicios
        </Link>
        <Link
          href="/registro"
          className="rounded-none border border-border px-6 py-3 text-sm uppercase tracking-widest text-foreground hover:bg-foreground/5 ">
          Crear cuenta con passkey
        </Link>
      </div>
    </div>
  );
}