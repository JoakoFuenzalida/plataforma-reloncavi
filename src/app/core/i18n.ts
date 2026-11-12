import { Pipe, PipeTransform, inject } from '@angular/core';
import { DemoState } from './demo-state';

/**
 * Textos de las interfaces destinadas al huésped en español e inglés
 * (Caso 05, Cap. 10, Restricción 13; RT-13.12).
 */
const TEXTOS: Record<string, { es: string; en: string }> = {
  'nav.hoteles': { es: 'Hoteles', en: 'Hotels' },
  'nav.experiencias': { es: 'Experiencias', en: 'Experiences' },
  'nav.eventos': { es: 'Eventos', en: 'Events' },
  'nav.sostenibilidad': { es: 'Sostenibilidad', en: 'Sustainability' },
  'nav.mi-reserva': { es: 'Mi reserva', en: 'My booking' },
  'nav.ingresar': { es: 'Ingresar', en: 'Sign in' },
  'nav.mi-cuenta': { es: 'Mi cuenta', en: 'My account' },
  'nav.idioma': { es: 'Idioma', en: 'Language' },
  'nav.moneda': { es: 'Moneda', en: 'Currency' },
  'nav.menu': { es: 'Menú', en: 'Menu' },

  'hero.titulo': { es: 'Del centro de Santiago a los fiordos de la Patagonia', en: 'From downtown Santiago to the Patagonian fjords' },
  'hero.sub': {
    es: 'Nueve hoteles y lodges en cinco regiones de Chile. Disponibilidad en tiempo real y el mejor precio, siempre en nuestro sitio.',
    en: 'Nine hotels and lodges across five regions of Chile. Real-time availability and our best rate, always on our website.',
  },

  'buscar.titulo': { es: 'Buscar disponibilidad', en: 'Check availability' },
  'buscar.destino': { es: 'Hotel o destino', en: 'Hotel or destination' },
  'buscar.destino.todos': { es: 'Todos los hoteles', en: 'All hotels' },
  'buscar.llegada': { es: 'Llegada', en: 'Check-in' },
  'buscar.salida': { es: 'Salida', en: 'Check-out' },
  'buscar.huespedes': { es: 'Huéspedes', en: 'Guests' },
  'buscar.adultos': { es: 'adultos', en: 'adults' },
  'buscar.boton': { es: 'Buscar', en: 'Search' },
  'buscar.error.fechas': { es: 'La salida debe ser posterior a la llegada.', en: 'Check-out must be after check-in.' },
  'buscar.error.pasado': { es: 'La llegada no puede ser anterior a hoy.', en: 'Check-in cannot be in the past.' },
  'buscar.error.requerido': { es: 'Indica la fecha.', en: 'Enter a date.' },
  'buscar.noches': { es: 'noches', en: 'nights' },
  'buscar.noche': { es: 'noche', en: 'night' },

  'beneficios.titulo': { es: 'Reservar directo tiene ventajas', en: 'Booking direct pays off' },
  'beneficios.1.t': { es: 'Registro previo desde tu teléfono', en: 'Pre-check-in from your phone' },
  'beneficios.1.d': { es: 'Completa tu ficha antes de llegar y retira tu llave en minutos.', en: 'Complete your registration before arriving and pick up your key in minutes.' },
  'beneficios.2.t': { es: 'Disponibilidad real', en: 'Real availability' },
  'beneficios.2.d': { es: 'Lo que ves es lo que hay: la habitación que reservas te espera.', en: 'What you see is what we have: the room you book is waiting for you.' },
  'beneficios.3.t': { es: 'Tu Folio Verde', en: 'Your Green Folio' },
  'beneficios.3.d': { es: 'Al salir recibes el consumo de agua y energía de tu estadía.', en: 'At check-out you receive the water and energy use of your stay.' },

  'hoteles.titulo': { es: 'Nuestros hoteles', en: 'Our hotels' },
  'hoteles.sub': { es: 'Seis hoteles urbanos y tres lodges, de la Región Metropolitana a Magallanes.', en: 'Six city hotels and three lodges, from Santiago to Magallanes.' },
  'hoteles.urbano': { es: 'Hotel urbano', en: 'City hotel' },
  'hoteles.lodge': { es: 'Lodge', en: 'Lodge' },
  'hoteles.habitaciones': { es: 'habitaciones', en: 'rooms' },
  'hoteles.desde': { es: 'Desde', en: 'From' },
  'hoteles.por-noche': { es: 'por noche', en: 'per night' },
  'hoteles.ver': { es: 'Ver disponibilidad', en: 'See availability' },
  'hoteles.filtro.todos': { es: 'Todos', en: 'All' },
  'hoteles.filtro.urbanos': { es: 'Urbanos', en: 'City' },
  'hoteles.filtro.lodges': { es: 'Lodges', en: 'Lodges' },

  'sost.titulo': { es: 'Sostenibilidad que se puede medir', en: 'Sustainability you can measure' },
  'sost.texto': {
    es: 'Medimos el agua y la energía de cada hotel por zona y te entregamos, al salir, lo que corresponde a tu estadía, con la metodología publicada.',
    en: 'We measure water and energy by zone in every hotel and, at check-out, give you the share of your stay, with our published methodology.',
  },
  'sost.boton': { es: 'Conocer la metodología', en: 'Read the methodology' },

  'pie.empresa': { es: 'Hoteles Reloncaví S.A. · Casa matriz: Santiago, Chile', en: 'Hoteles Reloncaví S.A. · Head office: Santiago, Chile' },
  'pie.contacto': { es: 'Reservas', en: 'Reservations' },
  'pie.privacidad': { es: 'Privacidad y datos personales', en: 'Privacy and personal data' },
  'pie.accesibilidad': { es: 'Accesibilidad', en: 'Accessibility' },
  'pie.terminos': { es: 'Condiciones de reserva', en: 'Booking terms' },

  'res.titulo': { es: 'Disponibilidad', en: 'Availability' },
  'res.para': { es: 'para', en: 'for' },
  'res.modificar': { es: 'Modificar búsqueda', en: 'Change search' },
  'res.ordenar': { es: 'Ordenar por', en: 'Sort by' },
  'res.orden.relevancia': { es: 'Recomendados', en: 'Recommended' },
  'res.orden.precio': { es: 'Precio más bajo', en: 'Lowest price' },
  'res.orden.norte': { es: 'De norte a sur', en: 'North to south' },
  'res.sin-cupo': { es: 'Sin disponibilidad para estas fechas', en: 'No availability for these dates' },
  'res.sin-cupo.d': {
    es: 'En nuestros lodges no vendemos más habitaciones de las que existen. Prueba otras fechas o un lodge cercano.',
    en: 'At our lodges we never sell more rooms than we have. Try other dates or a nearby lodge.',
  },
  'res.elegir': { es: 'Elegir', en: 'Select' },
  'res.total': { es: 'Total estadía', en: 'Total stay' },
  'res.impuestos': {
    es: 'IVA incluido. Huéspedes extranjeros no residentes que paguen en moneda extranjera quedan exentos de IVA, con verificación en el registro.',
    en: 'VAT included. Non-resident foreign guests paying in foreign currency are VAT-exempt, verified at registration.',
  },
  'res.quedan': { es: 'Quedan', en: 'Only' },
  'res.quedan2': { es: 'habitaciones', en: 'rooms left' },
  'res.vacio.t': { es: 'No encontramos hoteles con ese filtro', en: 'No hotels match this filter' },
  'res.vacio.d': { es: 'Quita el filtro para ver los nueve hoteles.', en: 'Clear the filter to see all nine hotels.' },
  'res.cargando': { es: 'Consultando disponibilidad en tiempo real', en: 'Checking real-time availability' },
};

@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private readonly estado = inject(DemoState);
  transform(clave: string): string {
    const t = TEXTOS[clave];
    if (!t) return clave;
    return t[this.estado.idioma()];
  }
}

export function texto(clave: string, idioma: 'es' | 'en'): string {
  return TEXTOS[clave]?.[idioma] ?? clave;
}
