"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-lg rounded-none border border-border bg-surface p-6 shadow-none "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground ">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="p-1 text-muted transition hover:bg-foreground/5 hover:text-foreground "
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  cargando = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar}>
      <p className="text-sm text-muted ">{mensaje}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secondary" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </Button>
        <Button variante="danger" onClick={onConfirmar} cargando={cargando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}