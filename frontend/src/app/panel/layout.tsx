"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSesion } from "@/lib/hooks/useSesion";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import type { Rol } from "@/types/api";

const ROLES_PANEL: Rol[] = ["barbero", "admin"];

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { usuario, loading } = useSesion();
  const autorizado = Boolean(usuario && ROLES_PANEL.includes(usuario.rol));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12">
        <div className="w-full max-w-xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-48" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="mt-10 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl border border-neutral-800 bg-neutral-950 p-8">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-widest text-neutral-100">
            Iniciá sesión para ver el panel
          </h1>
          <p className="text-sm text-neutral-400">
            El panel de control está disponible para barberos y administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-neutral-200"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 py-12 text-center">
        <StatusMessage
          tipo="error"
          mensaje="No autorizado: el panel es exclusivo para barberos y administradores."
        />
        <div className="mt-4">
          <Link href="/" className="text-sm uppercase tracking-widest text-neutral-100 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}