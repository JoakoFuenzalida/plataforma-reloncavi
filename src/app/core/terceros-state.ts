import { Injectable, computed, inject, signal } from '@angular/core';
import { OperacionState } from './operacion-state';
import { hotelPorId } from './hoteles';

export interface Tercero {
  id: string;
  tipo: 'agencia' | 'turoperador' | 'empresa';
  nombre: string;
  correo: string;
  contrato: string;
  hotelId: string;
  categoria: string;
  desde: string;
  hasta: string; // Último día de salida admitido.
  cupo: number; // Habitaciones por noche, no personas.
  comision: number;
  tarifa: number;
  condiciones: string;
}
export interface VinculoComercial {
  reservaId: string;
  terceroId: string;
  acuerdo: Tercero; // Condiciones pactadas en el momento de vincular.
  aplicada: number;
  tarifaAplicada: number;
  motivo: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class TercerosState {
  readonly op = inject(OperacionState);
  readonly terceros = signal<Tercero[]>([
    {
      id: 'agencia-sur',
      tipo: 'agencia',
      nombre: 'Viajes del Sur · Demo',
      correo: 'reservas@viajessur.example',
      contrato: 'AG-2029-01',
      hotelId: 'puerto-montt',
      categoria: 'STD',
      desde: '2029-01-01',
      hasta: '2029-12-31',
      cupo: 2,
      comision: 12,
      tarifa: 0,
      condiciones: 'Pago a 30 días. Cancelación sin cargo hasta 72 horas antes de la llegada.',
    },
    {
      id: 'operador-patagonia',
      tipo: 'turoperador',
      nombre: 'Patagonia Senderos · Demo',
      correo: 'grupos@senderos.example',
      contrato: 'TO-2029-01',
      hotelId: 'lodge-aysen',
      categoria: 'LDG',
      desde: '2029-01-01',
      hasta: '2029-04-30',
      cupo: 1,
      comision: 15,
      tarifa: 0,
      condiciones:
        'Confirmación de pasajeros siete días antes. Cupo comercial sujeto a inventario; no permite sobreventa.',
    },
    {
      id: 'empresa-austral',
      tipo: 'empresa',
      nombre: 'Austral Servicios · Demo',
      correo: 'viajes@austral.example',
      contrato: 'EM-2029-01',
      hotelId: 'puerto-montt',
      categoria: 'STD',
      desde: '2029-01-01',
      hasta: '2029-12-31',
      cupo: 2,
      comision: 0,
      tarifa: 89000,
      condiciones:
        'Tarifa por habitación/noche. Desayuno incluido. Orden de compra y pago a 30 días.',
    },
  ]);
  readonly vinculos = signal<VinculoComercial[]>([]);
  readonly historial = signal<{ terceroId: string; fecha: string; detalle: string }[]>([]);
  readonly total = computed(() => this.terceros().length);

  guardar(t: Tercero): string {
    const fecha = (v: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v;
    if (
      !['agencia', 'turoperador', 'empresa'].includes(t.tipo) ||
      t.nombre.trim().length < 3 ||
      t.nombre.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.correo) ||
      t.correo.length > 150
    )
      return 'Revisa el tipo, el nombre y el correo de contacto.';
    if (
      !t.contrato.trim() ||
      t.contrato.length > 60 ||
      !t.condiciones.trim() ||
      t.condiciones.length > 1000
    )
      return 'Indica el código y las condiciones del acuerdo.';
    if (!hotelPorId(t.hotelId)?.tipos.some((c) => c.codigo === t.categoria))
      return 'Selecciona un hotel y una categoría válidos.';
    if (!fecha(t.desde) || !fecha(t.hasta) || t.desde >= t.hasta)
      return 'La vigencia debe tener fechas válidas y terminar después de su inicio.';
    if (!Number.isInteger(t.cupo) || t.cupo < 1 || t.cupo > 100)
      return 'El cupo debe ser de 1 a 100 habitaciones por noche.';
    if (
      t.tipo === 'empresa'
        ? !Number.isSafeInteger(t.tarifa) || t.tarifa <= 0 || t.tarifa > 10000000
        : !Number.isFinite(t.comision) || t.comision < 0 || t.comision > 100
    )
      return 'Revisa la tarifa negociada o la comisión entre 0 y 100 %.';
    if (t.id && !this.terceros().some((v) => v.id === t.id)) return 'El acuerdo ya no existe.';
    if (
      this.terceros().some(
        (v) => v.id !== t.id && v.contrato.toLowerCase() === t.contrato.trim().toLowerCase(),
      )
    )
      return 'Ese código de acuerdo ya está registrado.';
    const anterior = this.terceros().find((v) => v.id === t.id);
    if (anterior && this.vinculos().some((v) => v.terceroId === t.id))
      return 'Este acuerdo tiene reservas vinculadas. Crea un nuevo acuerdo para cambiar sus condiciones.';
    const copia = {
      ...t,
      id: t.id || crypto.randomUUID(),
      nombre: t.nombre.trim(),
      correo: t.correo.trim(),
      contrato: t.contrato.trim(),
      condiciones: t.condiciones.trim(),
      comision: t.tipo === 'empresa' ? 0 : t.comision,
      tarifa: t.tipo === 'empresa' ? t.tarifa : 0,
    };
    this.terceros.update((lista) =>
      anterior ? lista.map((v) => (v.id === t.id ? copia : v)) : [...lista, copia],
    );
    this.historial.update((h) => [
      ...h,
      {
        terceroId: copia.id,
        fecha: this.op.fechaOperativa,
        detalle: anterior ? 'Acuerdo actualizado.' : 'Acuerdo creado.',
      },
    ]);
    return '';
  }

  uso(id: string, noche: string): number {
    const ids = new Set(
      this.vinculos()
        .filter((v) => v.terceroId === id)
        .map((v) => v.reservaId),
    );
    return this.op
      .reservas()
      .filter(
        (r) =>
          ids.has(r.id) &&
          r.estado !== 'cancelada' &&
          r.llegada <= noche &&
          noche < (r.salidaReal ?? r.salida),
      ).length;
  }

  vincular(terceroId: string, reservaId: string, aplicada: number, motivo: string): string {
    const t = this.terceros().find((t) => t.id === terceroId),
      r = this.op.reservaPorId(reservaId);
    if (!t || !r || !['confirmada', 'alojado'].includes(r.estado))
      return 'Selecciona un acuerdo y una reserva confirmada o alojada.';
    if (this.vinculos().some((v) => v.reservaId === r.id))
      return 'La reserva ya tiene un acuerdo comercial vinculado.';
    if (
      r.hotelId !== t.hotelId ||
      r.tipoHabitacionCodigo !== t.categoria ||
      r.llegada < t.desde ||
      r.salida > t.hasta
    )
      return 'El hotel, la categoría o las fechas de la reserva no están cubiertos por el acuerdo.';
    if (!Number.isFinite(aplicada) || aplicada < 0 || aplicada > 100)
      return 'La comisión aplicada debe estar entre 0 y 100 %.';
    if (motivo.trim().length < 10 || motivo.trim().length > 500)
      return 'Registra un fundamento de 10 a 500 caracteres para la vinculación.';
    for (
      let noche = r.llegada;
      noche < r.salida;
      noche = new Date(Date.parse(noche) + 86400000).toISOString().slice(0, 10)
    ) {
      if (this.uso(t.id, noche) >= t.cupo)
        return `Cupo comercial agotado el ${noche}. No se vinculó la reserva.`;
    }
    const vinculo: VinculoComercial = {
      reservaId: r.id,
      terceroId: t.id,
      acuerdo: structuredClone(t),
      aplicada: t.tipo === 'empresa' ? 0 : aplicada,
      tarifaAplicada: r.tarifaNocheClp,
      motivo: motivo.trim(),
      fecha: this.op.fechaOperativa,
    };
    this.vinculos.update((v) => [...v, vinculo]);
    this.historial.update((h) => [
      ...h,
      {
        terceroId: t.id,
        fecha: this.op.fechaOperativa,
        detalle: `Reserva ${r.codigo} vinculada. ${motivo.trim()}`,
      },
    ]);
    return '';
  }
  diferencia(v: VinculoComercial): number {
    return v.acuerdo.tipo === 'empresa'
      ? v.tarifaAplicada - v.acuerdo.tarifa
      : Math.round((v.aplicada - v.acuerdo.comision) * 100) / 100;
  }
}
