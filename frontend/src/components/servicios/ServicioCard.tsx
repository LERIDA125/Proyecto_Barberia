import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatearDuracion, formatearPrecio } from "@/lib/utils/format";
import type { Servicio } from "@/types/api";

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
    <Card className="border-t bg-white shadow-none">
      <div className="flex items-start justify-between gap-2 px-4 py-4">
        <h3 className="text-base font-semibold uppercase tracking-widest text-slate-900">
          {servicio.nombre}
        </h3>
        {!servicio.activo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-slate-900 text-xs uppercase rounded-none">
            Inactivo
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {servicio.descripcion || "Sin descripción."}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
        <span className="text-slate-500">
          {formatearDuracion(servicio.duracionMin)}
        </span>
        <span className="font-semibold text-slate-900">
          {formatearPrecio(servicio.precio)}
        </span>
      </div>

      <div className="mt-4">
        {esAdmin ? (
          <div className="flex gap-2">
            <Button className="flex-1 rounded-none bg-gray-100 text-slate-800 hover:bg-gray-200">
              Editar
            </Button>
            {servicio.activo && (
              <Button
                className="flex-1 rounded-none bg-red-600 text-white hover:bg-red-500"
              >
                Desactivar
              </Button>
            )}
          </div>
        ) : (
          <Button
            className="w-full rounded-none bg-black text-white hover:bg-gray-800"
          >
            Reservar
          </Button>
        )}
      </div>
    </Card>
  );
}
