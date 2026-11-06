import {
  startAuthentication,
  startRegistration,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import { apiFetch } from "./client";
import type { Usuario } from "@/types/api";

export interface DatosRegistro {
  nombre: string;
  email: string;
  telefono?: string;
}

export function getSesion() {
  return apiFetch<Usuario>("/api/auth/sesion");
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function registrarConPasskey(datos: DatosRegistro): Promise<Usuario> {
  const opciones = await apiFetch<PublicKeyCredentialCreationOptionsJSON>(
    "/api/auth/registro/opciones",
    { method: "POST", body: JSON.stringify(datos) }
  );

  const respuesta: RegistrationResponseJSON = await startRegistration({
    optionsJSON: opciones,
  });

  const resultado = await apiFetch<{ usuario: Usuario; ok: boolean }>(
    "/api/auth/registro/verificar",
    { method: "POST", body: JSON.stringify({ ...datos, response: respuesta }) }
  );

  return resultado.usuario;
}

export async function loginConPasskey(email: string): Promise<Usuario> {
  const opciones = await apiFetch<PublicKeyCredentialRequestOptionsJSON>(
    "/api/auth/login/opciones",
    { method: "POST", body: JSON.stringify({ email }) }
  );

  const respuesta: AuthenticationResponseJSON = await startAuthentication({
    optionsJSON: opciones,
  });

  const resultado = await apiFetch<{ usuario: Usuario }>("/api/auth/login/verificar", {
    method: "POST",
    body: JSON.stringify({ email, response: respuesta }),
  });

  return resultado.usuario;
}

export async function loginDev(email: string): Promise<Usuario> {
  const resultado = await apiFetch<{ usuario: Usuario }>("/api/auth/login/verificar", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  return resultado.usuario;
}
