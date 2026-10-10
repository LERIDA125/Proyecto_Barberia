"use client";

import { useSyncExternalStore } from "react";

const suscribir = () => () => {};

function getSnapshot() {
  return typeof window !== "undefined" && "PublicKeyCredential" in window;
}

function getServerSnapshot() {
  return true;
}

export function useWebAuthnSoportado() {
  return useSyncExternalStore(suscribir, getSnapshot, getServerSnapshot);
}
