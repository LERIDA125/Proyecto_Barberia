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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-widest text-foreground "
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
                    className={`px-4 py-2 text-sm font-medium uppercase tracking-widest transition ${
                      activo
                        ? "bg-accent/15 text-foreground"
                        : "text-foreground hover:text-foreground "
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
              <span className="hidden text-sm text-muted sm:inline ">
                {usuario.nombre}
                <span className="ml-2 bg-surface text-foreground capitalize text-xs px-2 py-0.5">
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
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest text-foreground hover:bg-accent/15 "
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="px-4 py-2 text-sm font-medium uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
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
