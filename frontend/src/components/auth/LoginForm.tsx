"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { loginClasico, loginConPasskey, loginDev } from "@/lib/api/auth";
import { iniciarSesion, refrescarSesion } from "@/lib/hooks/useSesion";
import { useWebAuthnSoportado } from "@/lib/hooks/useWebAuthnSoportado";

const DEV_LOGIN_HABILITADO = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

const CLASE_INPUT =
  "w-full rounded-none border-0 border-b border-neutral-700 bg-transparent px-0 py-3 text-base text-white transition-colors placeholder:text-neutral-600 hover:border-white focus:border-white focus:outline-none focus:ring-0";

export function LoginForm() {
  const router = useRouter();
  const soportado = useWebAuthnSoportado();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [emailClasico, setEmailClasico] = useState("");
  const [password, setPassword] = useState("");
  const [errorClasico, setErrorClasico] = useState<string | null>(null);
  const [cargandoClasico, setCargandoClasico] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Ingresá tu email");
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const usuario = DEV_LOGIN_HABILITADO
        ? await loginDev(email.trim())
        : await loginConPasskey(email.trim());
      iniciarSesion(usuario);
      void refrescarSesion();
      router.push("/servicios");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Operación cancelada o no permitida por el dispositivo");
      } else {
        setError("No se pudo iniciar sesión");
      }
      setCargando(false);
    }
  }

  async function onSubmitClasico(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailClasico.trim() || !password) {
      setErrorClasico("Ingresá tu email y contraseña");
      return;
    }

    setCargandoClasico(true);
    setErrorClasico(null);
    try {
      const usuario = await loginClasico(emailClasico.trim(), password);
      iniciarSesion(usuario);
      void refrescarSesion();
      router.push("/servicios");
    } catch (err) {
      if (err instanceof ApiError) setErrorClasico(err.message);
      else setErrorClasico("No se pudo iniciar sesión");
      setCargandoClasico(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
        {!soportado && !DEV_LOGIN_HABILITADO && (
          <StatusMessage
            tipo="error"
            mensaje="Tu navegador o dispositivo no soporta passkeys (WebAuthn). Probá con un navegador moderno."
          />
        )}

        {DEV_LOGIN_HABILITADO && (
          <StatusMessage
            tipo="info"
            mensaje="Modo desarrollo: el login omite la verificación con passkey."
          />
        )}

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
            autoComplete="username webauthn"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={CLASE_INPUT}
          />
        </div>

        {error && <StatusMessage tipo="error" mensaje={error} />}

        <Button
          type="submit"
          cargando={cargando}
          disabled={!soportado && !DEV_LOGIN_HABILITADO}
          className="w-full rounded-none bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
        >
          {DEV_LOGIN_HABILITADO ? "Entrar (modo desarrollo)" : "Entrar con passkey"}
        </Button>
      </form>

      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-neutral-800" />
        <span className="text-xs uppercase tracking-widest text-neutral-600">o</span>
        <span className="h-px flex-1 bg-neutral-800" />
      </div>

      <form onSubmit={onSubmitClasico} className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email-clasico"
            className="text-xs uppercase tracking-widest text-neutral-500"
          >
            Email
          </label>
          <input
            id="email-clasico"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="tu@email.com"
            value={emailClasico}
            onChange={(e) => setEmailClasico(e.target.value)}
            className={CLASE_INPUT}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-widest text-neutral-500"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={CLASE_INPUT}
          />
        </div>

        {errorClasico && <StatusMessage tipo="error" mensaje={errorClasico} />}

        <Button
          type="submit"
          variante="secondary"
          cargando={cargandoClasico}
          className="w-full rounded-none border-neutral-600 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:border-neutral-300"
        >
          Ingresar (Clásico)
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-white"
        >
          Creá una con passkey
        </Link>
      </p>
    </div>
  );
}
