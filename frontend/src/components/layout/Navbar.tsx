"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion, useSesion } from "@/lib/hooks/useSesion";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
];

const LINKS_USUARIO = [
  { href: "/reservar", label: "Reservar" },
  { href: "/mis-turnos", label: "Mis turnos" },
];

export function Navbar() {
  const { usuario, loading } = useSesion();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:border-gray-900 dark:bg-slate-950">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-widest text-slate-900 dark:text-slate-100"
          >
            Barbería
          </Link>
          <ul className="flex items-center gap-2">
            {[...LINKS, ...(usuario ? LINKS_USUARIO : [])].map((link) => {
              const activo = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium uppercase tracking-widest transition ${
                      activo
                        ? "bg-blue-100 text-slate-900"
                        : "text-slate-900 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          {loading ? null : usuario ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">
                {usuario.nombre}
                <span className="ml-2 bg-gray-100 text-slate-700 capitalize text-xs px-2 py-0.5">
                  {usuario.rol}
                </span>
              </span>
              <Button
                onClick={() => void cerrarSesion()}
                className="px-3 py-1 rounded-none"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest text-slate-900 hover:bg-blue-100 dark:text-slate-100 dark:hover:text-slate-100"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest bg-slate-900 text-white hover:bg-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
