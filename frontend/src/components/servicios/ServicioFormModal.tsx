"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { ApiError } from "@/lib/api/client";
import { actualizarServicio, crearServicio } from "@/lib/api/servicios";
import type { Servicio, ServicioInput } from "@/types/api";

interface ServicioFormModalProps {
  servicio: Servicio | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

interface Errores {
  nombre?: string;
  duracionMin?: string;
  precio?: string;
}

export function ServicioFormModal({ servicio, onCerrar, onGuardado }: ServicioFormModalProps) {
  const [form, setForm] = useState(() => ({
    nombre: servicio?.nombre ?? "",
    descripcion: servicio?.descripcion ?? "",
    duracionMin: String(servicio?.duracionMin ?? 30),
    precio: String(servicio?.precio ?? 0),
    activo: servicio?.activo ?? true,
  }));
  const [errores, setErrores] = useState<Errores>({});
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function validar(): Errores {
    const nuevos: Errores = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    const duracion = Number(form.duracionMin);
    if (!Number.isInteger(duracion) || duracion <= 0) {
      nuevos.duracionMin = "La duración debe ser mayor a 0";
    }
    const precio = Number(form.precio);
    if (!Number.isFinite(precio) || precio < 0) {
      nuevos.precio = "El precio debe ser mayor o igual a 0";
    }
    return nuevos;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validacion = validar();
    setErrores(validacion);
    if (Object.keys(validacion).length > 0) return;

    const payload: ServicioInput = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      duracionMin: Number(form.duracionMin),
      precio: Number(form.precio),
      activo: form.activo,
    };

    setGuardando(true);
    setErrorApi(null);
    try {
      if (servicio) {
        await actualizarServicio(servicio.id, payload);
      } else {
        await crearServicio(payload);
      }
      onGuardado();
    } catch (err) {
      setErrorApi(err instanceof ApiError ? err.message : "No se pudo guardar el servicio");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo={servicio ? "Editar servicio" : "Nuevo servicio"}
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          name="nombre"
          value={form.nombre}
          error={errores.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <Textarea
          label="Descripción"
          name="descripcion"
          rows={3}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duración (min)"
            name="duracionMin"
            type="number"
            min={1}
            value={form.duracionMin}
            error={errores.duracionMin}
            onChange={(e) => setForm({ ...form, duracionMin: e.target.value })}
          />
          <Input
            label="Precio"
            name="precio"
            type="number"
            min={0}
            step="0.01"
            value={form.precio}
            error={errores.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </div>

        {servicio && (
          <label className="flex items-center gap-2 text-sm text-foreground ">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Servicio activo (visible en el catálogo)
          </label>
        )}

        {errorApi && <StatusMessage tipo="error" mensaje={errorApi} />}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variante="secondary" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            {servicio ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
