import { Perfil } from './demo-state';

export interface ItemMenu {
  id: string;
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Perfiles que ven la opción en su menú. */
  perfiles: Perfil[];
  /** Rutas hijas que se muestran como pestañas del mismo módulo. */
  subrutas?: { ruta: string; etiqueta: string }[];
}

export interface GrupoMenu {
  titulo: string;
  items: ItemMenu[];
}

const OPERACION: Perfil[] = ['recepcion', 'gerencia-hotel'];
const TODOS_INTERNOS: Perfil[] = ['recepcion', 'housekeeping', 'mantenimiento', 'gerencia-hotel', 'comercial', 'administracion'];

/**
 * Menú principal del personal. Cada perfil ve solo las opciones de su función,
 * de modo que toda función principal queda a un máximo de tres interacciones (RT-25.01).
 */
export const MENU_PERSONAL: GrupoMenu[] = [
  {
    titulo: 'Mi turno',
    items: [{ id: 'inicio', etiqueta: 'Inicio', ruta: '/personal/inicio', icono: 'house', perfiles: TODOS_INTERNOS }],
  },
  {
    titulo: 'Operación del hotel',
    items: [
      { id: 'recepcion', etiqueta: 'Recepción', ruta: '/personal/recepcion', icono: 'concierge-bell', perfiles: OPERACION },
      { id: 'terreno', etiqueta: 'Housekeeping', ruta: '/terreno', icono: 'sparkles', perfiles: ['housekeeping', 'gerencia-hotel'] },
      { id: 'mantenimiento', etiqueta: 'Mantenimiento', ruta: '/personal/mantenimiento', icono: 'wrench', perfiles: ['mantenimiento', 'recepcion', 'gerencia-hotel'] },
    ],
  },
  {
    titulo: 'Huéspedes y comercial',
    items: [
      {
        id: 'huespedes', etiqueta: 'Directorio de huéspedes', ruta: '/personal/huespedes', icono: 'users', perfiles: ['recepcion', 'gerencia-hotel', 'comercial'],
        subrutas: [
          { ruta: '/personal/agencias', etiqueta: 'Agencias y turoperadores' },
          { ruta: '/personal/empresas', etiqueta: 'Empresas con convenio' },
        ],
      },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { id: 'tablero', etiqueta: 'Tablero', ruta: '/personal/tablero', icono: 'chart-column', perfiles: ['gerencia-hotel', 'comercial', 'administracion'] },
    ],
  },
];

export function menuPara(perfil: Perfil | null): GrupoMenu[] {
  return MENU_PERSONAL.map((g) => ({
    ...g,
    items: g.items.filter((i) => perfil === null || i.perfiles.includes(perfil)),
  })).filter((g) => g.items.length > 0);
}

/** Rastro de navegación a partir de la ruta actual. */
export function itemPorRuta(url: string): { grupo: string; item: ItemMenu; sub: string | null } | null {
  const ruta = url.split('?')[0].split('#')[0];
  for (const g of MENU_PERSONAL) {
    for (const i of g.items) {
      if (ruta === i.ruta || ruta.startsWith(i.ruta + '/')) return { grupo: g.titulo, item: i, sub: null };
      const sub = i.subrutas?.find((s) => ruta === s.ruta);
      if (sub) return { grupo: g.titulo, item: i, sub: sub.etiqueta };
    }
  }
  return null;
}

/** Indica si una ruta pertenece a un ítem del menú, incluidas sus pestañas. */
export function rutaActiva(url: string, item: ItemMenu): boolean {
  const ruta = url.split('?')[0].split('#')[0];
  return ruta === item.ruta || ruta.startsWith(item.ruta + '/') || !!item.subrutas?.some((s) => s.ruta === ruta);
}
