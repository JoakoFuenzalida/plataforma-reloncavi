/**
 * Portafolio de Hoteles Reloncaví (Bases Técnicas del Caso 05, Cap. 2.3 y Cap. 6).
 * Habitaciones, tipo de llave y enlace son los del caso. Las tarifas son ficticias,
 * referenciales para el prototipo, y no representan valores de la oferta de VORA.
 */
export type TipoHotel = 'urbano' | 'lodge';
export type TipoLlave = 'electronica' | 'magnetica' | 'mecanica';
export type Escena = 'ciudad' | 'aeropuerto' | 'costa' | 'lago' | 'bosque' | 'fiordo' | 'torres' | 'estrecho';

export interface TipoHabitacion {
  codigo: string;
  nombre: { es: string; en: string };
  capacidad: number;
  tarifaClp: number;
  detalle: { es: string; en: string };
}

export interface Hotel {
  id: string;
  nombre: string;
  nombreCorto: string;
  ciudad: string;
  region: string;
  tipo: TipoHotel;
  habitaciones: number;
  llave: TipoLlave;
  enlace: string;
  escena: Escena;
  descripcion: { es: string; en: string };
  destacados: { es: string[]; en: string[] };
  temporada?: { es: string; en: string };
  tipos: TipoHabitacion[];
}

const STD = (t: number): TipoHabitacion => ({
  codigo: 'STD',
  nombre: { es: 'Habitación Estándar', en: 'Standard Room' },
  capacidad: 2,
  tarifaClp: t,
  detalle: { es: 'Cama king o dos camas, 24 m²', en: 'King bed or two twin beds, 24 m²' },
});
const SUP = (t: number): TipoHabitacion => ({
  codigo: 'SUP',
  nombre: { es: 'Habitación Superior', en: 'Superior Room' },
  capacidad: 3,
  tarifaClp: t,
  detalle: { es: 'Cama king, vista despejada, 30 m²', en: 'King bed, open view, 30 m²' },
});
const STE = (t: number): TipoHabitacion => ({
  codigo: 'STE',
  nombre: { es: 'Suite', en: 'Suite' },
  capacidad: 4,
  tarifaClp: t,
  detalle: { es: 'Dormitorio y sala de estar, 48 m²', en: 'Bedroom and living room, 48 m²' },
});
const LDG = (t: number): TipoHabitacion => ({
  codigo: 'LDG',
  nombre: { es: 'Habitación Lodge, todo incluido', en: 'Lodge Room, all inclusive' },
  capacidad: 2,
  tarifaClp: t,
  detalle: {
    es: 'Pensión completa, traslados y una excursión diaria',
    en: 'Full board, transfers and one daily excursion',
  },
});
const LDS = (t: number): TipoHabitacion => ({
  codigo: 'LDS',
  nombre: { es: 'Suite Lodge, todo incluido', en: 'Lodge Suite, all inclusive' },
  capacidad: 3,
  tarifaClp: t,
  detalle: {
    es: 'Ventanal panorámico, pensión completa y excursiones guiadas',
    en: 'Panoramic window, full board and guided excursions',
  },
});

export const HOTELES: Hotel[] = [
  {
    id: 'santiago-centro',
    nombre: 'Reloncaví Santiago Centro',
    nombreCorto: 'Santiago Centro',
    ciudad: 'Santiago',
    region: 'Región Metropolitana',
    tipo: 'urbano',
    habitaciones: 168,
    llave: 'electronica',
    enlace: 'Fibra óptica redundante',
    escena: 'ciudad',
    descripcion: {
      es: 'Hotel de negocios en el centro de Santiago, con salones para eventos de hasta 400 personas.',
      en: 'Business hotel in downtown Santiago, with event rooms for up to 400 guests.',
    },
    destacados: { es: ['Salones de eventos', 'Restaurante', 'Gimnasio'], en: ['Event rooms', 'Restaurant', 'Gym'] },
    tipos: [STD(98000), SUP(124000), STE(189000)],
  },
  {
    id: 'aeropuerto-santiago',
    nombre: 'Reloncaví Aeropuerto Santiago',
    nombreCorto: 'Aeropuerto Santiago',
    ciudad: 'Santiago',
    region: 'Región Metropolitana',
    tipo: 'urbano',
    habitaciones: 120,
    llave: 'electronica',
    enlace: 'Fibra óptica',
    escena: 'aeropuerto',
    descripcion: {
      es: 'A pasos del terminal, para llegadas nocturnas y salidas de madrugada.',
      en: 'Steps from the terminal, for late arrivals and early departures.',
    },
    destacados: { es: ['Recepción 24 horas', 'Traslado al terminal', 'Desayuno desde las 4:30'], en: ['24-hour front desk', 'Terminal shuttle', 'Breakfast from 4:30 am'] },
    tipos: [STD(89000), SUP(109000)],
  },
  {
    id: 'concepcion',
    nombre: 'Reloncaví Concepción',
    nombreCorto: 'Concepción',
    ciudad: 'Concepción',
    region: 'Región del Biobío',
    tipo: 'urbano',
    habitaciones: 96,
    llave: 'magnetica',
    enlace: 'Fibra óptica',
    escena: 'costa',
    descripcion: {
      es: 'Hotel de negocios en el centro de Concepción, con salón de eventos.',
      en: 'Business hotel in downtown Concepción, with an event room.',
    },
    destacados: { es: ['Salón de eventos', 'Cowork para huéspedes'], en: ['Event room', 'Guest cowork'] },
    tipos: [STD(79000), SUP(96000)],
  },
  {
    id: 'puerto-montt',
    nombre: 'Reloncaví Puerto Montt',
    nombreCorto: 'Puerto Montt',
    ciudad: 'Puerto Montt',
    region: 'Región de Los Lagos',
    tipo: 'urbano',
    habitaciones: 140,
    llave: 'electronica',
    enlace: 'Fibra óptica',
    escena: 'costa',
    descripcion: {
      es: 'El hotel fundador de la cadena, puerta de entrada a la Patagonia, con centro de convenciones para 600 personas.',
      en: 'The chain’s founding hotel, gateway to Patagonia, with a convention center for 600 guests.',
    },
    destacados: { es: ['Centro de convenciones', 'Vista al seno de Reloncaví'], en: ['Convention center', 'Reloncaví Sound views'] },
    tipos: [STD(84000), SUP(105000), STE(162000)],
  },
  {
    id: 'puerto-varas',
    nombre: 'Reloncaví Puerto Varas',
    nombreCorto: 'Puerto Varas',
    ciudad: 'Puerto Varas',
    region: 'Región de Los Lagos',
    tipo: 'urbano',
    habitaciones: 88,
    llave: 'magnetica',
    enlace: 'Fibra óptica con respaldo móvil',
    escena: 'lago',
    descripcion: {
      es: 'Frente al lago Llanquihue, con restaurante de autor y vista a los volcanes.',
      en: 'On the shore of Lake Llanquihue, with a signature restaurant and volcano views.',
    },
    destacados: { es: ['Restaurante de autor', 'Frente al lago'], en: ['Signature restaurant', 'Lakefront'] },
    tipos: [STD(92000), SUP(118000), STE(176000)],
  },
  {
    id: 'lodge-cochamo',
    nombre: 'Lodge Reloncaví Cochamó',
    nombreCorto: 'Lodge Cochamó',
    ciudad: 'Cochamó',
    region: 'Región de Los Lagos',
    tipo: 'lodge',
    habitaciones: 24,
    llave: 'mecanica',
    enlace: 'Satelital y radioenlace',
    escena: 'bosque',
    descripcion: {
      es: 'Lodge remoto en el valle de Cochamó, en régimen de todo incluido, rodeado de bosque nativo.',
      en: 'Remote all-inclusive lodge in the Cochamó valley, surrounded by native forest.',
    },
    destacados: { es: ['Todo incluido', 'Cabalgatas y trekking', 'Bosque nativo'], en: ['All inclusive', 'Horse riding and trekking', 'Native forest'] },
    tipos: [LDG(395000), LDS(498000)],
  },
  {
    id: 'lodge-aysen',
    nombre: 'Lodge Reloncaví Aysén',
    nombreCorto: 'Lodge Aysén',
    ciudad: 'Puerto Chacabuco',
    region: 'Región de Aysén',
    tipo: 'lodge',
    habitaciones: 32,
    llave: 'mecanica',
    enlace: 'Satelital',
    escena: 'fiordo',
    descripcion: {
      es: 'Base de expediciones a los fiordos de Aysén, en Puerto Chacabuco.',
      en: 'Base for expeditions to the Aysén fjords, in Puerto Chacabuco.',
    },
    destacados: { es: ['Navegación por fiordos', 'Pesca con mosca'], en: ['Fjord cruises', 'Fly fishing'] },
    tipos: [LDG(368000), LDS(462000)],
  },
  {
    id: 'lodge-torres-del-paine',
    nombre: 'Lodge Reloncaví Torres del Paine',
    nombreCorto: 'Lodge Torres del Paine',
    ciudad: 'Torres del Paine',
    region: 'Región de Magallanes',
    tipo: 'lodge',
    habitaciones: 42,
    llave: 'mecanica',
    enlace: 'Satelital de baja capacidad',
    escena: 'torres',
    descripcion: {
      es: 'Lodge de alta gama frente al macizo del Paine. Abierto de octubre a abril.',
      en: 'High-end lodge facing the Paine massif. Open from October to April.',
    },
    destacados: { es: ['Alta gama', 'Excursiones guiadas', 'Spa'], en: ['Luxury', 'Guided excursions', 'Spa'] },
    temporada: { es: 'Abierto de octubre a abril', en: 'Open October to April' },
    tipos: [LDG(612000), LDS(784000)],
  },
  {
    id: 'punta-arenas',
    nombre: 'Reloncaví Punta Arenas',
    nombreCorto: 'Punta Arenas',
    ciudad: 'Punta Arenas',
    region: 'Región de Magallanes',
    tipo: 'urbano',
    habitaciones: 110,
    llave: 'electronica',
    enlace: 'Fibra óptica',
    escena: 'estrecho',
    descripcion: {
      es: 'Frente al estrecho de Magallanes, para viajes de negocios y temporada de cruceros.',
      en: 'Facing the Strait of Magellan, for business travel and cruise season.',
    },
    destacados: { es: ['Vista al estrecho', 'Temporada de cruceros'], en: ['Strait views', 'Cruise season'] },
    tipos: [STD(87000), SUP(112000), STE(171000)],
  },
];

export const TOTAL_HABITACIONES = HOTELES.reduce((s, h) => s + h.habitaciones, 0); // 820

export function hotelPorId(id: string): Hotel | undefined {
  return HOTELES.find((h) => h.id === id);
}

/** Hoteles sin cupo para las fechas de demostración: muestra que en lodges no se sobrevende (Restricción 3). */
export const SIN_CUPO_DEMO = new Set(['lodge-cochamo']);
