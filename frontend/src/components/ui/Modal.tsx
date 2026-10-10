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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-lg rounded-none border border-neutral-800 bg-neutral-900 p-6 shadow-none "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tighter text-white ">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="p-1 text-neutral-500 transition hover:text-white "
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
      <p className="text-sm text-neutral-400 ">{mensaje}</p>
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