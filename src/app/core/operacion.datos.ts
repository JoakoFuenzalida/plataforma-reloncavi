import type { Habitacion, Huesped, Reserva } from "./operacion.modelos";

// Personas ficticias utilizadas en la demostración.
export const HUESPEDES_INICIALES: Huesped[] = [
  {
    id: "huesped-james",
    nombres: "James",
    apellidos: "Wilson",
    correo: "james@example.com",
    telefono: "+44 7700 900456",
    nacionalidad: "Reino Unido",
    idioma: "en",
    preferencias: ["Excursiones guiadas"],
  },
  {
    id: "huesped-camilo",
    nombres: "Camilo",
    apellidos: "Soto",
    correo: "camilo@example.com",
    telefono: "+56 912345678",
    nacionalidad: "Chile",
    idioma: "es",
    preferencias: [],
  },
  {
    id: "huesped-emily",
    nombres: "Emily",
    apellidos: "Carter",
    correo: "emily.carter@example.com",
    telefono: "+44 7700 900123",
    nacionalidad: "Reino Unido",
    idioma: "en",
    preferencias: ["Habitación tranquila"],
  },
];

// Muestra de habitaciones para el recorrido de demostración.
// No representa el inventario completo de las 140 habitaciones del hotel.
export const HABITACIONES_INICIALES: Habitacion[] = [
  {
    id: "pm-204",
    hotelId: "puerto-montt",
    numero: "204",
    tipoCodigo: "STD",
    estado: "ocupada",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
  {
    id: "pm-401",
    hotelId: "puerto-montt",
    numero: "401",
    tipoCodigo: "STE",
    estado: "disponible",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
  {
    id: "pm-201",
    hotelId: "puerto-montt",
    numero: "201",
    tipoCodigo: "STD",
    estado: "pendiente-limpieza",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
  {
    id: "pm-202",
    hotelId: "puerto-montt",
    numero: "202",
    tipoCodigo: "STD",
    estado: "disponible",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
  {
    id: "pm-301",
    hotelId: "puerto-montt",
    numero: "301",
    tipoCodigo: "SUP",
    estado: "disponible",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
  {
    id: "pm-203",
    hotelId: "puerto-montt",
    numero: "203",
    tipoCodigo: "STD",
    estado: "pendiente-inspeccion",
    prioridadLimpieza: "normal",
    motivoPrioridad: null,
    responsableLimpiezaId: null,
    motivoBloqueo: null,
  },
];

export const RESERVAS_INICIALES: Reserva[] = [
  {
    id: "reserva-demo-001",
    codigo: "REL-2029-0001",
    hotelId: "puerto-montt",
    tipoHabitacionCodigo: "STD",
    habitacionId: "pm-201",

    reservanteId: "huesped-emily",
    pagadorId: "huesped-emily",
    huespedesIds: ["huesped-emily"],

    llegada: "2029-01-18",
    salida: "2029-01-21",
    adultos: 1,
    estado: "confirmada",

    tarifaNocheClp: 84000,
    totalAlojamientoClp: 252000,
    pagoReserva: "aprobado",

    registrosPrevios: [],
    creadaEn: "2029-01-15T14:30:00-03:00",
  },
];
