import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { formatearDuracion, formatearPrecio } from "@/lib/utils/format";
import type { Servicio } from "@/types/api";

const IMAGENES = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
];

function imagenPara(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % IMAGENES.length;
  return IMAGENES[hash];
}

interface ServicioCardProps {
  servicio: Servicio;
  esAdmin?: boolean;
  onEditar?: (servicio: Servicio) => void;
  onDesactivar?: (servicio: Servicio) => void;
  onReservar?: (servicio: Servicio) => void;
}

export function ServicioCard({
  servicio,
  esAdmin = false,
  onEditar,
  onDesactivar,
  onReservar,
}: ServicioCardProps) {
  return (
    <article className="flex flex-col rounded-none border border-neutral-800 bg-neutral-900/30 p-6">
      <div className="relative mb-5 h-40 w-full overflow-hidden">
        <Image
          src={imagenPara(servicio.id)}
          alt={servicio.nombre}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover grayscale"
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium text-white">{servicio.nombre}</h3>
        {!servicio.activo && (
          <span className="inline-flex items-center rounded-none border border-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neutral-400">
            Inactivo
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-neutral-400">
        {servicio.descripcion || "Sin descripción."}
      </p>

      <div className="mt-6 flex items-end justify-between border-t border-neutral-800 pt-4">
        <span className="font-mono text-sm text-neutral-400">
          {formatearDuracion(servicio.duracionMin)}
        </span>
        <span className="font-mono text-lg text-white">
          {formatearPrecio(servicio.precio)}
        </span>
      </div>

      <div className="mt-6">
        {esAdmin ? (
          <div className="flex gap-2">
            <Button
              variante="secondary"
              onClick={() => onEditar?.(servicio)}
              className="flex-1 rounded-none border-neutral-700"
            >
              Editar
            </Button>
            {servicio.activo && (
              <Button
                variante="danger"
                onClick={() => onDesactivar?.(servicio)}
                className="flex-1 rounded-none"
              >
                Desactivar
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onReservar?.(servicio)}
            className="w-full rounded-none bg-white px-4 py-3 text-xs uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
          >
            Reservar este servicio
          </Button>
        )}
      </div>
    </article>
  );
}
