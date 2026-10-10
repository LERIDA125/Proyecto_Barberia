"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <form onSubmit={onSubmit} className="flex flex-col gap-6 px-6 py-8 max-w-md w-full">
      {!soportado && (
        <StatusMessage
          tipo="error"
          mensaje="Tu navegador o dispositivo no soporta passkeys (WebAuthn). Probá con un navegador moderno."
        />
      )}

      <Input
        label="Nombre"
        name="nombre"
        value={form.nombre}
        autoComplete="name"
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="rounded-none bg-surface border-none px-4 py-4 text-base text-foreground outline-none transition focus:ring-2 focus:ring-accent/30 "
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        autoComplete="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-none bg-surface border-none px-4 py-4 text-base text-foreground outline-none transition focus:ring-2 focus:ring-accent/30 "
      />
      <Input
        label="Teléfono (opcional)"
        name="telefono"
        value={form.telefono}
        autoComplete="tel"
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className="rounded-none bg-surface border-none px-4 py-4 text-base text-foreground outline-none transition focus:ring-2 focus:ring-accent/30 "
      />

      {error && <StatusMessage tipo="error" mensaje={error} />}

      <Button type="submit" cargando={cargando} disabled={!soportado} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90">
        Crear cuenta con passkey
      </Button>

      <p className="text-center text-sm text-muted ">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium uppercase tracking-widest text-foreground underline">
          Ingresá
        </Link>
      </p>
    </form>
  );
}