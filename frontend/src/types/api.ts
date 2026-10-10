export type Rol = "cliente" | "barbero" | "admin";

export type EstadoTurno = "pendiente" | "confirmado" | "cancelado" | "completado" | "ausente";

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

export interface Bloqueo {
  id: string;
  barberoId: string;
  inicio: string;
  fin: string;
  motivo: string | null;
}

export interface BloqueoInput {
  inicio: string;
  fin: string;
  motivo?: string;
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

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
}

export interface HistorialCliente {
  cliente: Cliente;
  turnos: Turno[];
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

export interface CalendarEstado {
  conectado: boolean;
  configurado: boolean;
  calendarId: string;
  ultimaSync: string | null;
}

export interface ReconectarCalendar extends CalendarEstado {
  reconectado: boolean;
}

export interface SincronizacionTurno {
  sincronizado: boolean;
  eventId: string | null;
  pendiente: boolean;
  motivo: string | null;
}

export interface RespuestaChat {
  respuesta: string;
  conversacionId?: string;
  toolInvocadas?: string[];
}
