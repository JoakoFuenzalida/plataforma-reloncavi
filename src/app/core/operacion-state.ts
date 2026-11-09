import { computed, Injectable, signal } from '@angular/core';
import { DemoState } from './demo-state';
import { inject } from '@angular/core';
import { hotelPorId, SIN_CUPO_DEMO } from './hoteles';

import type {
  Cargo,
  Habitacion,
  Huesped,
  Reserva,
  RegistroPrevio,
} from './operacion.modelos';

import {
  HABITACIONES_INICIALES,
  HUESPEDES_INICIALES,
  RESERVAS_INICIALES,
} from './operacion.datos';

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
    habitaciones: structuredClone(HABITACIONES_INICIALES),
    reservas: structuredClone(RESERVAS_INICIALES),
    cargos: [],
  };
}

@Injectable({ providedIn: 'root' })
export class OperacionState {
  private readonly demo = inject(DemoState);

  private readonly datos = signal<DatosOperacion>(
    crearDatosIniciales(),
  );

  readonly huespedes = computed(() => this.datos().huespedes);
  readonly habitaciones = computed(() => this.datos().habitaciones);
  readonly reservas = computed(() => this.datos().reservas);
  readonly cargos = computed(() => this.datos().cargos);

  // Usa la misma fecha simulada que el resto del prototipo.
  readonly fechaOperativa = [
    this.demo.hoy.getFullYear(),
    String(this.demo.hoy.getMonth() + 1).padStart(2, '0'),
    String(this.demo.hoy.getDate()).padStart(2, '0'),
  ].join('-');

  readonly llegadasHoy = computed(() =>
    this.reservas().filter(
      (reserva) =>
        reserva.llegada === this.fechaOperativa &&
        reserva.estado === 'confirmada',
    ),
  );

  readonly huespedesAlojados = computed(() =>
    this.reservas().filter(
      (reserva) => reserva.estado === 'alojado',
    ),
  );

  huespedPorId(id: string): Huesped | undefined {
    return this.huespedes().find((huesped) => huesped.id === id);
  }

  reservaPorId(id: string): Reserva | undefined {
    return this.reservas().find((reserva) => reserva.id === id);
  }

  habitacionPorId(id: string): Habitacion | undefined {
    return this.habitaciones().find(
      (habitacion) => habitacion.id === id,
    );
  }

  habitacionesPorHotel(hotelId: string): Habitacion[] {
    return this.habitaciones().filter(
      (habitacion) => habitacion.hotelId === hotelId,
    );
  }

  cargosPorReserva(reservaId: string): Cargo[] {
    return this.cargos().filter(
      (cargo) => cargo.reservaId === reservaId,
    );
  }

  reiniciarDemostracion(): void {
    this.datos.set(crearDatosIniciales());
  }

  guardarRegistro(id: string, registro: RegistroPrevio, idioma: 'es' | 'en', preferencias: string): void {
    if (!registro.numeroDocumento.trim() || !registro.archivoDocumentoNombre || !registro.firmaAceptada || !registro.consentimientoDatos || (registro.solicitaExencionIva && !registro.evidenciaExencionNombre)) return;
    this.datos.update(d => ({ ...d, reservas: d.reservas.map(r => r.id === id ? { ...r, registrosPrevios: [...r.registrosPrevios.filter(p => p.huespedId !== registro.huespedId), registro] } : r), huespedes: d.huespedes.map(h => h.id === registro.huespedId ? { ...h, idioma, preferencias: preferencias.trim() ? [preferencias.trim()] : [] } : h) }));
  }

  readonly borrador = signal<{ hotelId: string; tipo: string; llegada: string; salida: string; adultos: number; huesped: Omit<Huesped, 'id'> } | null>(null);

  cupos(hotelId: string, tipo: string, llegada: string, salida: string): number {
    if (SIN_CUPO_DEMO.has(hotelId)) return 0;
    // Partición de venta directa ficticia: tres unidades por categoría y noche.
    const ocupadas = this.reservas().filter(r => r.hotelId === hotelId && r.tipoHabitacionCodigo === tipo && r.estado !== 'cancelada' && r.llegada < salida && r.salida > llegada).length;
    return Math.max(0, 3 - ocupadas);
  }

  confirmarReserva(): Reserva | null {
    const b = this.borrador();
    const tipo = hotelPorId(b?.hotelId ?? '')?.tipos.find(t => t.codigo === b?.tipo);
    if (!b || !tipo || !this.cupos(b.hotelId, b.tipo, b.llegada, b.salida)) return null;
    const id = crypto.randomUUID();
    // No se fusionan identidades automáticamente por coincidencia de correo.
    const h: Huesped = { ...b.huesped, id: 'h-' + id };
    const dias = (Date.parse(b.salida) - Date.parse(b.llegada)) / 86400000;
    if (!Number.isInteger(dias) || dias < 1 || b.llegada < this.fechaOperativa || !Number.isInteger(b.adultos) || b.adultos < 1 || b.adultos > tipo.capacidad) return null;
    const r: Reserva = { id, codigo: 'REL-2029-' + id.slice(0, 8).toUpperCase(), hotelId: b.hotelId, tipoHabitacionCodigo: b.tipo, habitacionId: null, reservanteId: h.id, pagadorId: h.id, huespedesIds: [h.id], llegada: b.llegada, salida: b.salida, adultos: b.adultos, estado: 'confirmada', tarifaNocheClp: tipo.tarifaClp, totalAlojamientoClp: tipo.tarifaClp * dias, pagoReserva: 'aprobado', registrosPrevios: [], creadaEn: '2029-01-18T10:24:00-03:00' };
    this.datos.update(d => ({ ...d, huespedes: [...d.huespedes, h], reservas: [...d.reservas, r] }));
    this.borrador.set(null);
    return r;
  }
}
