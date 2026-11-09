import { computed, Injectable, signal } from "@angular/core";
import { DemoState } from "./demo-state";
import { inject } from "@angular/core";
import { HOTELES, hotelPorId, SIN_CUPO_DEMO } from "./hoteles";

import type {
  Cargo,
  Habitacion,
  Huesped,
  Reserva,
  RegistroPrevio,
} from "./operacion.modelos";

import {
  HABITACIONES_INICIALES,
  HUESPEDES_INICIALES,
  RESERVAS_INICIALES,
} from "./operacion.datos";

interface DatosOperacion {
  huespedes: Huesped[];
  habitaciones: Habitacion[];
  reservas: Reserva[];
  cargos: Cargo[];
}

function crearDatosIniciales(): DatosOperacion {
  // Cada reinicio obtiene una copia independiente de los datos.
  return {
    huespedes: structuredClone(HUESPEDES_INICIALES),
    habitaciones: [
      ...structuredClone(HABITACIONES_INICIALES),
      ...HOTELES.filter((h) => h.id !== "puerto-montt").flatMap((h) =>
        h.tipos.flatMap((t, i) =>
          [1, 2, 3].map((n) => ({
            id: `${h.id}-${t.codigo}-${n}`,
            hotelId: h.id,
            numero: `${i + 1}0${n}`,
            tipoCodigo: t.codigo,
            estado: "disponible" as const,
            prioridadLimpieza: "normal" as const,
            motivoPrioridad: null,
            responsableLimpiezaId: null,
            motivoBloqueo: null,
          })),
        ),
      ),
    ],
    reservas: [
      ...structuredClone(RESERVAS_INICIALES),
      {
        ...structuredClone(RESERVAS_INICIALES[0]),
        reservanteId: "huesped-james",
        pagadorId: "huesped-james",
        huespedesIds: ["huesped-james"],
        id: "reserva-lodge",
        codigo: "REL-2029-LODGE",
        hotelId: "lodge-aysen",
        habitacionId: "lodge-aysen-LDG-1",
        tipoHabitacionCodigo: "LDG",
        tarifaNocheClp: 368000,
        totalAlojamientoClp: 1104000,
      },
      {
        ...structuredClone(RESERVAS_INICIALES[0]),
        id: "reserva-alojada",
        codigo: "REL-2029-ALOJADO",
        reservanteId: "huesped-camilo",
        pagadorId: "huesped-camilo",
        huespedesIds: ["huesped-camilo"],
        habitacionId: "pm-204",
        llegada: "2029-01-17",
        salida: "2029-01-20",
        estado: "alojado",
      },
    ],
    cargos: [],
  };
}

@Injectable({ providedIn: "root" })
export class OperacionState {
  private readonly demo = inject(DemoState);

  private readonly datos = signal<DatosOperacion>(crearDatosIniciales());

  readonly huespedes = computed(() => this.datos().huespedes);
  readonly habitaciones = computed(() => this.datos().habitaciones);
  readonly reservas = computed(() => this.datos().reservas);
  readonly cargos = computed(() => this.datos().cargos);

  // Usa la misma fecha simulada que el resto del prototipo.
  readonly fechaOperativa = [
    this.demo.hoy.getFullYear(),
    String(this.demo.hoy.getMonth() + 1).padStart(2, "0"),
    String(this.demo.hoy.getDate()).padStart(2, "0"),
  ].join("-");

  readonly llegadasHoy = computed(() =>
    this.reservas().filter(
      (reserva) =>
        reserva.llegada === this.fechaOperativa &&
        reserva.estado === "confirmada",
    ),
  );

  readonly huespedesAlojados = computed(() =>
    this.reservas().filter((reserva) => reserva.estado === "alojado"),
  );

  huespedPorId(id: string): Huesped | undefined {
    return this.huespedes().find((huesped) => huesped.id === id);
  }

  reservaPorId(id: string): Reserva | undefined {
    return this.reservas().find((reserva) => reserva.id === id);
  }

  habitacionPorId(id: string): Habitacion | undefined {
    return this.habitaciones().find((habitacion) => habitacion.id === id);
  }

  habitacionesPorHotel(hotelId: string): Habitacion[] {
    return this.habitaciones().filter(
      (habitacion) => habitacion.hotelId === hotelId,
    );
  }

  cargosPorReserva(reservaId: string): Cargo[] {
    return this.cargos().filter((cargo) => cargo.reservaId === reservaId);
  }

  reiniciarDemostracion(): void {
    this.datos.set(crearDatosIniciales());
    this.borrador.set(null);
    this.enlaces.set({});
    this.cola.set([]);
    this.avisos.set([]);
    this.esperas.set([]);
    this.cobros.set({});
  }

  readonly enlaces = signal<Record<string, number>>({});
  readonly cola = signal<
    {
      id: string;
      hotelId: string;
      reservaId: string;
      descripcion: string;
      riesgo: string;
      estado: "pendiente" | "sincronizado";
    }[]
  >([]);
  readonly avisos = signal<string[]>([]);
  readonly esperas = signal<string[]>([]);
  sinEnlace(hotelId: string) {
    return this.enlaces()[hotelId] !== undefined;
  }
  limite(hotelId: string) {
    return hotelPorId(hotelId)?.tipo === "lodge" ? 96 : 24;
  }
  operable(hotelId: string) {
    return (
      !this.sinEnlace(hotelId) || this.enlaces()[hotelId] < this.limite(hotelId)
    );
  }
  desconectar(hotelId: string) {
    if (!this.sinEnlace(hotelId))
      this.enlaces.update((e) => ({ ...e, [hotelId]: 0 }));
  }
  avanzarHora(hotelId: string) {
    if (this.sinEnlace(hotelId))
      this.enlaces.update((e) => ({
        ...e,
        [hotelId]: Math.min(this.limite(hotelId), e[hotelId] + 12),
      }));
  }
  reconectar(hotelId: string) {
    this.enlaces.update((e) => {
      const copia = { ...e };
      delete copia[hotelId];
      return copia;
    });
    this.cola.update((q) =>
      q.map((o) =>
        o.hotelId === hotelId ? { ...o, estado: "sincronizado" } : o,
      ),
    );
    this.datos.update((d) => ({
      ...d,
      cargos: d.cargos.map((c) =>
        this.reservaPorId(c.reservaId)?.hotelId === hotelId
          ? { ...c, sincronizacion: "sincronizado" }
          : c,
      ),
    }));
  }
  private registrar(
    r: Reserva,
    descripcion: string,
    riesgo = "No aplica: operación sin cobro",
  ) {
    if (this.sinEnlace(r.hotelId))
      this.cola.update((q) => [
        ...q,
        {
          id: crypto.randomUUID(),
          hotelId: r.hotelId,
          reservaId: r.id,
          descripcion,
          riesgo,
          estado: "pendiente",
        },
      ]);
  }
  habitacionesElegibles(r: Reserva) {
    const hotel = hotelPorId(r.hotelId);
    const orden =
      hotel?.tipos.findIndex((t) => t.codigo === r.tipoHabitacionCodigo) ?? -1;
    return this.habitacionesPorHotel(r.hotelId).filter(
      (h) =>
        h.estado === "disponible" &&
        (hotel?.tipos.findIndex((t) => t.codigo === h.tipoCodigo) ?? -1) >=
          orden &&
        !this.reservas().some(
          (otra) =>
            otra.id !== r.id &&
            otra.habitacionId === h.id &&
            otra.estado !== "cancelada" &&
            otra.estado !== "finalizada" &&
            otra.llegada < r.salida &&
            otra.salida > r.llegada,
        ),
    );
  }
  prioridad(id: string) {
    const r = this.reservaPorId(id);
    if (!r?.habitacionId) return;
    this.datos.update((d) => ({
      ...d,
      habitaciones: d.habitaciones.map((h) =>
        h.id === r.habitacionId
          ? {
              ...h,
              prioridadLimpieza: "alta",
              motivoPrioridad: `Llegada ${r.codigo}`,
            }
          : h,
      ),
    }));
  }
  esperar(id: string) {
    if (!this.esperas().includes(id)) this.esperas.update((v) => [...v, id]);
  }
  limpiar(id: string, inspeccion = false) {
    const h = this.habitacionPorId(id);
    if (!h) return false;
    const siguiente =
      h.estado === "pendiente-limpieza"
        ? "en-limpieza"
        : h.estado === "en-limpieza"
          ? "pendiente-inspeccion"
          : h.estado === "pendiente-inspeccion" && inspeccion
            ? "disponible"
            : null;
    if (!siguiente) return false;
    this.datos.update((d) => ({
      ...d,
      habitaciones: d.habitaciones.map((v) =>
        v.id === id
          ? {
              ...v,
              estado: siguiente,
              responsableLimpiezaId: "marta",
              prioridadLimpieza:
                siguiente === "disponible" ? "normal" : v.prioridadLimpieza,
              motivoPrioridad:
                siguiente === "disponible" ? null : v.motivoPrioridad,
            }
          : v,
      ),
    }));
    if (siguiente === "disponible")
      for (const r of this.reservas().filter(
        (r) => r.habitacionId === id && this.esperas().includes(r.id),
      ))
        this.avisos.update((a) => [
          ...a,
          `${r.codigo}: habitación ${h.numero} lista. Aviso al huésped simulado.`,
        ]);
    return true;
  }
  checkin(
    id: string,
    habitacionId: string,
    documento: string,
    verificado: boolean,
    evidencia: boolean,
  ) {
    const r = this.reservaPorId(id);
    if (
      !r ||
      r.estado !== "confirmada" ||
      r.llegada !== this.fechaOperativa ||
      !this.operable(r.hotelId)
    )
      return "La reserva no admite check-in hoy o se alcanzó el límite sin enlace.";
    if (
      !verificado ||
      !documento.trim() ||
      r.registrosPrevios.some((p) => p.solicitaExencionIva && !evidencia)
    )
      return "Verifica el documento de todos los huéspedes y la evidencia de exención.";
    if (!this.habitacionesElegibles(r).some((h) => h.id === habitacionId))
      return "Selecciona una habitación lista y sin otra asignación.";
    this.datos.update((d) => ({
      ...d,
      reservas: d.reservas.map((v) =>
        v.id === id
          ? {
              ...v,
              estado: "alojado",
              habitacionId,
              registrosPrevios: v.registrosPrevios.map((p) => ({
                ...p,
                estado: "verificado",
              })),
            }
          : v,
      ),
      habitaciones: d.habitaciones.map((h) =>
        h.id === habitacionId ? { ...h, estado: "ocupada" } : h,
      ),
    }));
    this.registrar(r, `Check-in ${r.codigo}`);
    return "";
  }
  agregarCargo(id: string, concepto: string, monto: number) {
    const r = this.reservaPorId(id);
    if (
      !r ||
      r.estado !== "alojado" ||
      !this.operable(r.hotelId) ||
      !concepto.trim() ||
      !Number.isFinite(monto) ||
      monto <= 0 ||
      monto > 1000000
    )
      return false;
    this.datos.update((d) => ({
      ...d,
      cargos: [
        ...d.cargos,
        {
          id: crypto.randomUUID(),
          reservaId: id,
          concepto: concepto.trim(),
          montoClp: Math.round(monto),
          creadoEn: "2029-01-18T10:24:00-03:00",
          sincronizacion: this.sinEnlace(r.hotelId)
            ? "pendiente"
            : "sincronizado",
        },
      ],
    }));
    this.registrar(r, `Cargo ${concepto}: CLP ${Math.round(monto)}`);
    return true;
  }
  readonly cobros = signal<Record<string, number>>({});
  cobrar(id: string) {
    const r = this.reservaPorId(id);
    if (!r || r.estado !== "alojado" || !this.operable(r.hotelId)) return false;
    const total = this.cargosPorReserva(id).reduce((s, c) => s + c.montoClp, 0);
    const pendiente = total - (this.cobros()[id] ?? 0);
    if (pendiente <= 0 || total > 200000) return false;
    this.cobros.update((c) => ({ ...c, [id]: total }));
    this.registrar(
      r,
      `Cobro simulado contra preautorización: CLP ${pendiente}`,
      "Riesgo de rechazo diferido: autorización central no consultada",
    );
    return true;
  }

  guardarRegistro(
    id: string,
    registro: RegistroPrevio,
    idioma: "es" | "en",
    preferencias: string,
  ): void {
    if (
      !registro.numeroDocumento.trim() ||
      !registro.archivoDocumentoNombre ||
      !registro.firmaAceptada ||
      !registro.consentimientoDatos ||
      (registro.solicitaExencionIva && !registro.evidenciaExencionNombre)
    )
      return;
    this.datos.update((d) => ({
      ...d,
      reservas: d.reservas.map((r) =>
        r.id === id
          ? {
              ...r,
              registrosPrevios: [
                ...r.registrosPrevios.filter(
                  (p) => p.huespedId !== registro.huespedId,
                ),
                registro,
              ],
            }
          : r,
      ),
      huespedes: d.huespedes.map((h) =>
        h.id === registro.huespedId
          ? {
              ...h,
              idioma,
              preferencias: preferencias.trim() ? [preferencias.trim()] : [],
            }
          : h,
      ),
    }));
  }

  readonly borrador = signal<{
    hotelId: string;
    tipo: string;
    llegada: string;
    salida: string;
    adultos: number;
    huesped: Omit<Huesped, "id">;
  } | null>(null);

  cupos(
    hotelId: string,
    tipo: string,
    llegada: string,
    salida: string,
  ): number {
    if (SIN_CUPO_DEMO.has(hotelId)) return 0;
    // Partición de venta directa ficticia: tres unidades por categoría y noche.
    const ocupadas = this.reservas().filter(
      (r) =>
        r.hotelId === hotelId &&
        r.tipoHabitacionCodigo === tipo &&
        r.estado !== "cancelada" &&
        r.llegada < salida &&
        r.salida > llegada,
    ).length;
    return Math.max(0, 3 - ocupadas);
  }

  confirmarReserva(): Reserva | null {
    const b = this.borrador();
    const tipo = hotelPorId(b?.hotelId ?? "")?.tipos.find(
      (t) => t.codigo === b?.tipo,
    );
    if (!b || !tipo || !this.cupos(b.hotelId, b.tipo, b.llegada, b.salida))
      return null;
    const id = crypto.randomUUID();
    // No se fusionan identidades automáticamente por coincidencia de correo.
    const h: Huesped = { ...b.huesped, id: "h-" + id };
    const dias = (Date.parse(b.salida) - Date.parse(b.llegada)) / 86400000;
    if (
      !Number.isInteger(dias) ||
      dias < 1 ||
      b.llegada < this.fechaOperativa ||
      !Number.isInteger(b.adultos) ||
      b.adultos < 1 ||
      b.adultos > tipo.capacidad
    )
      return null;
    const r: Reserva = {
      id,
      codigo: "REL-2029-" + id.slice(0, 8).toUpperCase(),
      hotelId: b.hotelId,
      tipoHabitacionCodigo: b.tipo,
      habitacionId: null,
      reservanteId: h.id,
      pagadorId: h.id,
      huespedesIds: [h.id],
      llegada: b.llegada,
      salida: b.salida,
      adultos: b.adultos,
      estado: "confirmada",
      tarifaNocheClp: tipo.tarifaClp,
      totalAlojamientoClp: tipo.tarifaClp * dias,
      pagoReserva: "aprobado",
      registrosPrevios: [],
      creadaEn: "2029-01-18T10:24:00-03:00",
    };
    this.datos.update((d) => ({
      ...d,
      huespedes: [...d.huespedes, h],
      reservas: [...d.reservas, r],
    }));
    this.borrador.set(null);
    return r;
  }
}
