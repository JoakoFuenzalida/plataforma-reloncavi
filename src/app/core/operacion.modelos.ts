import type { Idioma } from './demo-state';

// Fechas de estadía: formato YYYY-MM-DD.
export type FechaISO = string;

export type EstadoReserva =
  | 'confirmada'
  | 'alojado'
  | 'finalizada'
  | 'cancelada';

export type EstadoHabitacion =
  | 'disponible'
  | 'ocupada'
  | 'pendiente-limpieza'
  | 'en-limpieza'
  | 'pendiente-inspeccion'
  | 'bloqueada';

export interface Huesped {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  nacionalidad: string;
  idioma: Idioma;
  preferencias: string[];
}

export interface RegistroPrevio {
  huespedId: string;
  tipoDocumento: 'cedula' | 'pasaporte';
  numeroDocumento: string;
  archivoDocumentoNombre: string | null;
  firmaAceptada: boolean;
  consentimientoDatos: boolean;
  solicitaExencionIva: boolean;
  evidenciaExencionNombre: string | null;
  estado: 'borrador' | 'enviado' | 'verificado';
}

export interface Habitacion {
  id: string;
  hotelId: string;
  numero: string;

  // Coincide con los códigos de hoteles.ts: STD, SUP, STE, LDG, LDS.
  tipoCodigo: string;

  estado: EstadoHabitacion;
  prioridadLimpieza: 'normal' | 'alta';
  motivoPrioridad: string | null;
  responsableLimpiezaId: string | null;
  motivoBloqueo: string | null;
}

export interface Reserva {
  id: string;
  codigo: string;
  hotelId: string;
  tipoHabitacionCodigo: string;
  habitacionId: string | null;

  // Se distingue quién reserva, quién paga y quién se aloja.
  reservanteId: string;
  pagadorId: string;
  huespedesIds: string[];

  llegada: FechaISO;
  salida: FechaISO;
  adultos: number;
  estado: EstadoReserva;

  // Importes base en CLP; la interfaz aplica la conversión visual.
  tarifaNocheClp: number;
  totalAlojamientoClp: number;
  // Conserva el abono original cuando una extensión cambia el total.
  alojamientoPagadoClp?: number;
  salidaReal?: FechaISO;

  pagoReserva: 'pendiente' | 'aprobado' | 'rechazado';
  registrosPrevios: RegistroPrevio[];
  creadaEn: string;
}

export interface Cargo {
  id: string;
  reservaId: string;
  concepto: string;
  montoClp: number;
  creadoEn: string;
  sincronizacion: 'pendiente' | 'sincronizado';
}
