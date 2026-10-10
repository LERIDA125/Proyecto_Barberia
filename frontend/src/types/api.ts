export type Rol = "cliente" | "barbero" | "admin";

export type EstadoTurno = "pendiente" | "confirmado" | "cancelado" | "completado";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  createdAt?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracionMin: number;
  precio: number;
  activo: boolean;
}

export interface ServicioInput {
  nombre: string;
  descripcion?: string | null;
  duracionMin: number;
  precio: number;
  activo?: boolean;
}

export interface Barbero {
  id: string;
  nombre: string | null;
  especialidad: string | null;
  activo: boolean;
}

export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export interface Disponibilidad {
  fecha: string;
  barberoId: string;
  servicioId: string;
  franjas: FranjaHoraria[];
}

export interface TurnoInput {
  barberoId: string;
  servicioId: string;
  fechaInicio: string;
  notas?: string;
}

export interface Turno {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoTurno;
  notas: string | null;
  googleEventId: string | null;
  createdAt: string;
  servicio?: Pick<Servicio, "id" | "nombre" | "duracionMin" | "precio">;
  barbero?: { id: string; nombre: string | null };
  cliente?: { id: string; nombre: string; email: string; telefono?: string | null };
}
