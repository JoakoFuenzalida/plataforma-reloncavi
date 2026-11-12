import { Injectable, computed, signal } from '@angular/core';

export type Idioma = 'es' | 'en';
export type Moneda = 'CLP' | 'USD' | 'EUR' | 'BRL';
export type Perfil =
  | 'huesped'
  | 'recepcion'
  | 'housekeeping'
  | 'mantenimiento'
  | 'gerencia-hotel'
  | 'comercial'
  | 'administracion';

export interface PerfilInfo {
  id: Perfil;
  nombre: string;
  persona: string;
  cargo: string;
  hotel: string;
  icono: string;
  descripcion: string;
  ruta: string;
  acceso: 'huesped' | 'corporativo' | 'terreno';
}

/** Personas ficticias de demostración. */
export const PERFILES: PerfilInfo[] = [
  {
    id: 'huesped',
    nombre: 'Huésped',
    persona: 'Emily Carter',
    cargo: 'Huésped, Reino Unido',
    hotel: 'Reloncaví Puerto Varas',
    icono: 'user-round',
    descripcion: 'Busca y reserva en el sitio, completa su registro desde el teléfono y recibe su Folio Verde.',
    ruta: '/inicio',
    acceso: 'huesped',
  },
  {
    id: 'recepcion',
    nombre: 'Recepción',
    persona: 'Camila Oyarzún',
    cargo: 'Recepcionista',
    hotel: 'Reloncaví Puerto Montt',
    icono: 'concierge-bell',
    descripcion: 'Llegadas del día, check-in con registro previo, cargos, salidas y operación sin enlace.',
    ruta: '/personal/recepcion',
    acceso: 'corporativo',
  },
  {
    id: 'housekeeping',
    nombre: 'Housekeeping',
    persona: 'Marta Huenchullán',
    cargo: 'Camarera de pisos',
    hotel: 'Reloncaví Puerto Montt',
    icono: 'sparkles',
    descripcion: 'App de terreno en dispositivo compartido: habitaciones priorizadas, estados e incidencias.',
    ruta: '/terreno',
    acceso: 'terreno',
  },
  {
    id: 'mantenimiento',
    nombre: 'Mantenimiento',
    persona: 'Jorge Barría',
    cargo: 'Técnico de mantenimiento',
    hotel: 'Reloncaví Puerto Montt',
    icono: 'wrench',
    descripcion: 'Órdenes de trabajo, bloqueos con causa obligatoria y liberación con lista de chequeo.',
    ruta: '/personal/mantenimiento',
    acceso: 'terreno',
  },
  {
    id: 'gerencia-hotel',
    nombre: 'Gerencia de hotel',
    persona: 'Andrés Vidal',
    cargo: 'Gerente de hotel',
    hotel: 'Reloncaví Puerto Montt',
    icono: 'building-2',
    descripcion: 'Tablero del hotel: ocupación, tiempos operacionales, incidencias y sostenibilidad.',
    ruta: '/personal/tablero',
    acceso: 'corporativo',
  },
  {
    id: 'comercial',
    nombre: 'Gerencia comercial',
    persona: 'Paula Riquelme',
    cargo: 'Gerenta comercial',
    hotel: 'Casa matriz, Santiago',
    icono: 'chart-column',
    descripcion: 'Indicadores de la cadena, canales, agencias, turoperadores y padrón de huéspedes.',
    ruta: '/personal/tablero',
    acceso: 'corporativo',
  },
  {
    id: 'administracion',
    nombre: 'Administración de TI',
    persona: 'Felipe Soto',
    cargo: 'Administrador de plataforma',
    hotel: 'Casa matriz, Santiago',
    icono: 'shield-check',
    descripcion: 'Usuarios, roles, alta masiva de temporada, reglas con aprobación dual y auditoría.',
    ruta: '/personal/administracion',
    acceso: 'corporativo',
  },
];

/** Tipo de cambio referencial ficticio para la presentación multimoneda. */
const CAMBIO: Record<Moneda, number> = { CLP: 1, USD: 935, EUR: 1010, BRL: 172 };

@Injectable({ providedIn: 'root' })
export class DemoState {
  /** Fecha simulada: jueves 18 de enero de 2029, temporada alta, solución completa en operación. */
  readonly hoy = new Date(2029, 0, 18, 10, 24);

  readonly idioma = signal<Idioma>('es');
  readonly moneda = signal<Moneda>('CLP');
  readonly perfil = signal<Perfil | null>(null);

  readonly perfilInfo = computed(() => PERFILES.find((p) => p.id === this.perfil()) ?? null);

  /** Muestra el recorrido guiado de primer ingreso al entrar a la vista del personal. */
  readonly recorridoPendiente = signal(false);
  /** Correo del huésped con sesión simulada en el portal autenticado. */
  readonly sesionHuesped = signal<string | null>(null);

  elegirPerfil(p: Perfil | null) {
    this.perfil.set(p);
    try { p ? sessionStorage.setItem('rel-perfil', p) : sessionStorage.removeItem('rel-perfil'); } catch { /* sin almacenamiento */ }
  }

  constructor() {
    try {
      const i = localStorage.getItem('rel-idioma') as Idioma | null;
      if (i === 'es' || i === 'en') this.idioma.set(i);
      const m = localStorage.getItem('rel-moneda') as Moneda | null;
      if (m && m in CAMBIO) this.moneda.set(m);
      const p = sessionStorage.getItem('rel-perfil') as Perfil | null;
      if (p && PERFILES.some((x) => x.id === p)) this.perfil.set(p);
    } catch {
      /* almacenamiento no disponible: se usan los valores por omisión */
    }
  }

  cambiarIdioma(i: Idioma) {
    this.idioma.set(i);
    document.documentElement.lang = i === 'es' ? 'es-CL' : 'en';
    try { localStorage.setItem('rel-idioma', i); } catch { /* sin almacenamiento */ }
  }

  cambiarMoneda(m: Moneda) {
    this.moneda.set(m);
    try { localStorage.setItem('rel-moneda', m); } catch { /* sin almacenamiento */ }
  }

  precio(clp: number, moneda: Moneda = this.moneda()): string {
    const valor = clp / CAMBIO[moneda];
    const locale = this.idioma() === 'es' ? 'es-CL' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: moneda === 'CLP' ? 0 : 0,
    }).format(valor);
  }
}
