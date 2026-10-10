"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { loginConPasskey } from "@/lib/api/auth";
import { iniciarSesion } from "@/lib/hooks/useSesion";
import { useWebAuthnSoportado } from "@/lib/hooks/useWebAuthnSoportado";

export function LoginForm() {
  const router = useRouter();
  const soportado = useWebAuthnSoportado();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Ingresá tu email");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const usuario = await loginConPasskey(email.trim());
      iniciarSesion(usuario);
      router.push("/servicios");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Operación cancelada o no permitida por el dispositivo");
      } else {
        setError("No se pudo iniciar sesión con passkey");
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
        label="Email"
        name="email"
        type="email"
        autoComplete="username webauthn"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-none bg-gray-100 border-none px-4 py-4 text-base text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-100 dark:text-slate-100 dark:focus:ring-blue-200"
      />

      {error && <StatusMessage tipo="error" mensaje={error} />}

      <Button type="submit" cargando={cargando} disabled={!soportado} className="w-full rounded-none bg-black text-white hover:bg-gray-800">
        Entrar con passkey
      </Button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium uppercase tracking-widest text-slate-900 dark:text-slate-100 underline">
          Creá una con passkey
        </Link>
      </p>
    </form>
  );
}