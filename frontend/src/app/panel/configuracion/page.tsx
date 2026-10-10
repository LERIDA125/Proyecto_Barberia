"use client";

import { useState } from "react";
import Link from "next/link";
import { useSesion } from "@/lib/hooks/useSesion";
import { useCalendarEstado } from "@/lib/hooks/useCalendarEstado";
import { CalendarStatusCard } from "@/components/integraciones/CalendarStatusCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";

interface Aviso {
  tipo: "success" | "error" | "info";
  mensaje: string;
}

export default function ConfiguracionPage() {
  const { usuario, loading: sesionCargando } = useSesion();
  const esAdmin = usuario?.rol === "admin";
  const { estado, loading, error, recargar, reconectar } = useCalendarEstado(esAdmin);

  const [reconectando, setReconectando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  async function manejarReconectar() {
    setAviso(null);
    setReconectando(true);
    try {
      const resultado = await reconectar();
      setAviso({
        tipo: resultado.conectado ? "success" : "error",
        mensaje: resultado.conectado
          ? "Conexión verificada con Google Calendar"
          : "No se pudo conectar con el servidor MCP",
      });
    } catch (err) {
      setAviso({
        tipo: "error",
        mensaje:
          err instanceof ApiError
            ? err.message
            : "No se pudo reconectar con Google Calendar",
      });
    } finally {
      setReconectando(false);
    }
  }

  if (sesionCargando) {
    return (
      <div className="mx-auto max-w-3xl bg-neutral-950 px-6 py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-8 h-64" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <div className="mx-auto mb-6 max-w-xl rounded-none border border-neutral-800 bg-neutral-900 p-8 ">
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tighter text-white ">
            Iniciá sesión para ver la configuración
          </h1>
          <p className="text-sm text-neutral-400 ">
            La configuración de la integración está disponible para administradores.
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="rounded-none bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-neutral-300 "
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className="mx-auto max-w-md bg-neutral-950 px-6 py-12 text-center">
        <StatusMessage
          tipo="error"
          mensaje="No autorizado: la configuración es exclusiva para administradores."
        />
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm uppercase tracking-widest text-neutral-400 underline hover:text-white "
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl min-h-screen bg-neutral-950 px-6 py-10 ">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white ">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-neutral-400 ">
            Estado de la integración con Google Calendar (servidor MCP).
          </p>
        </div>
        <Link
          href="/panel"
          className="text-sm uppercase tracking-widest text-neutral-400 underline hover:text-white "
        >
          Volver al panel
        </Link>
      </div>

      {error ? (
        <div className="mt-8 flex flex-col items-start gap-3">
          <StatusMessage tipo="error" mensaje={error} />
          <Button variante="secondary" onClick={() => void recargar()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <CalendarStatusCard
            estado={estado}
            cargando={loading}
            reconectando={reconectando}
            onReconectar={() => void manejarReconectar()}
          />
          {aviso && <StatusMessage tipo={aviso.tipo} mensaje={aviso.mensaje} />}
        </div>
      )}
    </div>
  );
}
