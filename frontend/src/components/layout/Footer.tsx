import Link from "next/link";

const ENLACES = [
  { href: "/servicios", label: "Servicios" },
  { href: "/reservar", label: "Reservar" },
  { href: "/mis-turnos", label: "Mis turnos" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-neutral-600 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Barbería. Todos los derechos reservados.
        </p>
        <nav className="flex items-center gap-6">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="text-neutral-600 transition-colors hover:text-white"
            >
              {enlace.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
