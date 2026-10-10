import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center">
      <h1 className="text-7xl font-black uppercase tracking-tighter text-neutral-800 md:text-9xl">
        404
      </h1>
      <h2 className="mt-6 text-2xl font-medium tracking-tight text-white md:text-3xl">
        Esta silla está vacía.
      </h2>
      <p className="mt-4 max-w-md text-sm text-neutral-400">
        La página que buscás no existe o fue movida. Volvé al inicio para seguir
        reservando tu turno.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-none bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
