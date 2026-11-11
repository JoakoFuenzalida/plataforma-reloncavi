import { HOTELES } from './hoteles';

export interface RegistroAnalitico {
  id: string;
  fecha: string;
  hotelId: string;
  disponibles: number;
  ocupadas: number;
  ingresoClp: number;
  llegadas: number;
  segundosCheckin: number;
  limpiezas: number;
  minutosLimpieza: number;
  respuestas: number;
  promotores: number;
  detractores: number;
}

// Serie reproducible exclusivamente ficticia: no deriva de reservas ni de mediciones.
export const HISTORICO_DEMO: readonly RegistroAnalitico[] = HOTELES.flatMap((h, i) =>
  Array.from({ length: 18 }, (_, d) => {
    const ocupadas = Math.round(h.habitaciones * (0.5 + ((d * 7 + i * 3) % 40) / 100));
    const llegadas = 8 + ((d + i) % 15),
      limpiezas = 10 + ((d * 2 + i) % 20);
    const tarifa = 85000 + i * 22000 + (d % 5) * 4000;
    return {
      id: `DEMO-${h.id}-${d + 1}`,
      fecha: `2029-01-${String(d + 1).padStart(2, '0')}`,
      hotelId: h.id,
      disponibles: h.habitaciones,
      ocupadas,
      ingresoClp: ocupadas * tarifa,
      llegadas,
      segundosCheckin: llegadas * (65 + ((d * 3 + i * 5) % 70)),
      limpiezas,
      minutosLimpieza: limpiezas * (100 + ((d * 7 + i * 11) % 180)),
      respuestas: 20,
      promotores: 10 + ((d + i) % 8),
      detractores: 1 + ((d + i) % 3),
    };
  }),
);

export function resumirAnalitica(filas: readonly RegistroAnalitico[]) {
  const suma = (campo: keyof RegistroAnalitico) => filas.reduce((s, r) => s + Number(r[campo]), 0);
  const disponibles = suma('disponibles'),
    ocupadas = suma('ocupadas'),
    ingreso = suma('ingresoClp');
  const llegadas = suma('llegadas'),
    limpiezas = suma('limpiezas'),
    respuestas = suma('respuestas');
  return {
    disponibles,
    ocupadas,
    ingreso,
    ocupacion: disponibles ? (100 * ocupadas) / disponibles : 0,
    adr: ocupadas ? ingreso / ocupadas : 0,
    revpar: disponibles ? ingreso / disponibles : 0,
    checkin: llegadas ? suma('segundosCheckin') / llegadas : 0,
    limpieza: limpiezas ? suma('minutosLimpieza') / limpiezas : 0,
    nps: respuestas ? (100 * (suma('promotores') - suma('detractores'))) / respuestas : 0,
    respuestas,
  };
}

export function csvAnalitica(filas: readonly RegistroAnalitico[]): string {
  const celda = (v: string | number) =>
    `"${String(v)
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""')}"`;
  const cabecera = [
    'Origen',
    'Registro',
    'Fecha',
    'Hotel',
    'Categoría',
    'Habitaciones noche disponibles',
    'Habitaciones noche ocupadas',
    'Ingreso alojamiento CLP',
    'Llegadas',
    'Segundos check-in acumulados',
    'Limpiezas',
    'Minutos limpieza acumulados',
    'Respuestas NPS',
    'Promotores',
    'Detractores',
  ];
  return (
    '\uFEFF' +
    [
      cabecera,
      ...filas.map((r) => {
        const h = HOTELES.find((h) => h.id === r.hotelId)!;
        return [
          'Serie ficticia independiente',
          r.id,
          r.fecha,
          h.nombre,
          h.tipo,
          r.disponibles,
          r.ocupadas,
          r.ingresoClp,
          r.llegadas,
          r.segundosCheckin,
          r.limpiezas,
          r.minutosLimpieza,
          r.respuestas,
          r.promotores,
          r.detractores,
        ];
      }),
    ]
      .map((f) => f.map(celda).join(';'))
      .join('\r\n')
  );
}
