"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { registrarConPasskey } from "@/lib/api/auth";
import { iniciarSesion } from "@/lib/hooks/useSesion";
import { useWebAuthnSoportado } from "@/lib/hooks/useWebAuthnSoportado";

export function RegistroForm() {
  const router = useRouter();
  const soportado = useWebAuthnSoportado();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const usuario = await registrarConPasskey({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
      });
      iniciarSesion(usuario);
      router.push("/servicios");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Operación cancelada o no permitida por el dispositivo");
      } else {
        setError("No se pudo crear la cuenta con passkey");
      }
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
      {!soportado && (
        <StatusMessage
          tipo="error"
          mensaje="Tu navegador o dispositivo no soporta passkeys (WebAuthn). Probá con un navegador moderno."
        />
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nombre"
          className="text-xs uppercase tracking-widest text-neutral-500"
        >
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          value={form.nombre}
          autoComplete="name"
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full rounded-none border-0 border-b border-neutral-700 bg-transparent px-0 py-3 text-base text-white transition-colors placeholder:text-neutral-600 hover:border-white focus:border-white focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs uppercase tracking-widest text-neutral-500"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          autoComplete="email"
          placeholder="tu@email.com"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-none border-0 border-b border-neutral-700 bg-transparent px-0 py-3 text-base text-white transition-colors placeholder:text-neutral-600 hover:border-white focus:border-white focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="telefono"
          className="text-xs uppercase tracking-widest text-neutral-500"
        >
          Teléfono (opcional)
        </label>
        <input
          id="telefono"
          name="telefono"
          value={form.telefono}
          autoComplete="tel"
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          className="w-full rounded-none border-0 border-b border-neutral-700 bg-transparent px-0 py-3 text-base text-white transition-colors placeholder:text-neutral-600 hover:border-white focus:border-white focus:outline-none focus:ring-0"
        />
      </div>

      {error && <StatusMessage tipo="error" mensaje={error} />}

      <Button
        type="submit"
        cargando={cargando}
        disabled={!soportado}
        className="w-full rounded-none bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
      >
        Crear cuenta con passkey
      </Button>

      <p className="text-center text-sm text-neutral-500">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-white"
        >
          Ingresá
        </Link>
      </p>
    </form>
  );
}
