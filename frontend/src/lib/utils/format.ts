export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function formatearFechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatearHora(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatearFechaCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function formatearDiaCorto(fecha: Date): string {
  const dia = new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(fecha);
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

export function claveFechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function generarDias(desde: Date, cantidad: number): { clave: string; fecha: Date }[] {
  const base = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + i);
    return { clave: claveFechaLocal(fecha), fecha };
  });
}

export function esFuturo(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}
