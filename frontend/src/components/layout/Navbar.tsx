"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion, useSesion } from "@/lib/hooks/useSesion";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
];

const LINKS_USUARIO = [
  { href: "/reservar", label: "Reservar" },
  { href: "/mis-turnos", label: "Mis turnos" },
];

const LINKS_PANEL = [
  { href: "/panel", label: "Mi Panel" },
  { href: "/panel/clientes", label: "Clientes" },
];

const LINKS_ADMIN = [{ href: "/panel/configuracion", label: "Configuración" }];

export function Navbar() {
  const { usuario, loading } = useSesion();
  const pathname = usePathname();

  const puedeVerPanel = Boolean(
    usuario && (usuario.rol === "barbero" || usuario.rol === "admin"),
  );
  const links = [
    ...LINKS,
    ...(usuario ? LINKS_USUARIO : []),
    ...(puedeVerPanel ? LINKS_PANEL : []),
    ...(usuario?.rol === "admin" ? LINKS_ADMIN : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-neutral-950">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black uppercase tracking-widest text-white"
          >
            Barbería
          </Link>
          <ul className="flex items-center gap-2">
            {links.map((link) => {
              const activo = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium uppercase tracking-widest transition-colors ${
                      activo
                        ? "text-white"
                        : "text-neutral-400 hover:text-white"
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
              <NotificationBell />
              <span className="hidden text-sm text-neutral-400 sm:inline">
                {usuario.nombre}
                <span className="ml-2 rounded-none border border-neutral-800 px-2 py-0.5 text-xs capitalize text-neutral-500">
                  {usuario.rol}
                </span>
              </span>
              <Button
                variante="secondary"
                onClick={() => void cerrarSesion()}
                className="rounded-none border-neutral-800 px-3 py-1 text-neutral-300 hover:bg-neutral-900 hover:text-white"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-none bg-white px-4 py-2 text-sm font-medium uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
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
