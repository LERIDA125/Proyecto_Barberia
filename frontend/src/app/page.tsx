import Link from "next/link";

export default function HomePage() {
  return (
    <div className="px-6 py-20 bg-white max-w-5xl mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900">
          Tu barbería, ordenada.
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600">
          Reservá turnos, gestioná el catálogo de servicios y administrá la agenda de los
          barberos desde un solo lugar.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/servicios"
          className="rounded-none bg-black text-white hover:bg-gray-800 px-6 py-3 text-sm uppercase tracking-widest">
          Ver catálogo de servicios
        </Link>
        <Link
          href="/registro"
          className="rounded-none border border-slate-300 px-6 py-3 text-sm uppercase tracking-widest text-slate-800 hover:bg-gray-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-gray-200">
          Crear cuenta con passkey
        </Link>
      </div>
    </div>
  );
}