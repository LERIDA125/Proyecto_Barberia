"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ENLACES = [
  { href: "/servicios", label: "Servicios" },
  { href: "/reservar", label: "Reservar" },
  { href: "/mis-turnos", label: "Mis turnos" },
];

const ANIO_FALLBACK = 2026;

export function Footer() {
  const [anio, setAnio] = useState(0);

  useEffect(() => {
    setAnio(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-neutral-900 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-neutral-600 sm:flex-row">
        <p>
          © {anio || ANIO_FALLBACK} Barbería. Todos los derechos reservados.
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
