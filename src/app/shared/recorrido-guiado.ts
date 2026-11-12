import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, input, output, signal, viewChild } from '@angular/core';
import { Perfil } from '../core/demo-state';
import { Icon } from './icon';

interface Paso { icono: string; titulo: string; texto: string; }

const COMUNES: Paso[] = [
  {
    icono: 'menu',
    titulo: 'Tu menú tiene solo lo que usas',
    texto: 'A la izquierda (o en el botón de menú del teléfono) ves las funciones de tu cargo. Cualquiera de ellas está a no más de tres toques.',
  },
  {
    icono: 'bell',
    titulo: 'Los avisos llegan solos',
    texto: 'La campana muestra lo que necesita tu atención: habitaciones listas, órdenes por aprobar o huéspedes en espera. Ya no hace falta la radio.',
  },
  {
    icono: 'circle-help',
    titulo: 'Si tienes dudas',
    texto: 'Puedes volver a ver este recorrido desde tu nombre, arriba a la derecha. La mesa de ayuda atiende 24 horas en español e inglés.',
  },
];

const PRIMERO: Partial<Record<Perfil, Paso>> = {
  housekeeping: {
    icono: 'sparkles',
    titulo: 'Bienvenida a tu primer día, Marta',
    texto: 'Tu lista de habitaciones ya viene ordenada por prioridad: arriba están las que un huésped necesita primero. Solo marcas cuando empiezas y cuando terminas.',
  },
  recepcion: {
    icono: 'concierge-bell',
    titulo: 'Bienvenida a tu turno, Camila',
    texto: 'En Recepción ves las llegadas del día con su registro previo. Si el huésped ya completó su ficha, solo verificas el documento y entregas la llave.',
  },
  mantenimiento: {
    icono: 'wrench',
    titulo: 'Bienvenido, Jorge',
    texto: 'Las incidencias que reporta housekeeping te llegan como órdenes de trabajo, con la foto y la causa. La habitación queda bloqueada hasta que se aprueba la reparación.',
  },
};

/** Recorrido guiado de primer ingreso (25.2, Autenticación e incorporación; RT-22.04 del caso). */
@Component({
  selector: 'app-recorrido-guiado',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown.escape)': 'cerrar.emit()', '(keydown.tab)': 'atrapar($event)', '(keydown.shift.tab)': 'atrapar($event)' },
  styles: `
    .fondo { position: fixed; inset: 0; z-index: 800; background: rgba(11,39,53,.55); display: grid; place-items: center; padding: 16px; }
    .dialogo { width: min(480px, 100%); background: #fff; border-radius: var(--r-lg); box-shadow: var(--sombra-3); padding: var(--s-5); outline: none; }
    .icono { display: inline-flex; padding: 14px; border-radius: var(--r-md); background: var(--c-fiordo-50); color: var(--c-fiordo); }
    .puntos { display: flex; gap: 6px; margin: var(--s-4) 0; }
    .puntos span { height: 6px; flex: 1; border-radius: 99px; background: var(--c-borde); }
    .puntos span.hecho { background: var(--c-fiordo); }
    h2 { margin-top: var(--s-3); }
  `,
  template: `
    <div class="fondo">
      <div #dialogo class="dialogo" role="dialog" aria-modal="true" aria-labelledby="rg-titulo" aria-describedby="rg-texto" tabindex="-1">
        <span class="icono"><app-icon [nombre]="paso().icono" [tam]="28" /></span>
        <h2 id="rg-titulo">{{ paso().titulo }}</h2>
        <p id="rg-texto">{{ paso().texto }}</p>
        <div class="puntos" aria-hidden="true">
          @for (p of pasos(); track $index) { <span [class.hecho]="$index <= i()"></span> }
        </div>
        <p class="texto-xs texto-2" aria-live="polite">Paso {{ i() + 1 }} de {{ pasos().length }}</p>
        <div class="fila-entre">
          <button type="button" class="btn btn-terciario" (click)="cerrar.emit()">Omitir recorrido</button>
          <div class="fila">
            @if (i() > 0) { <button type="button" class="btn btn-secundario" (click)="i.set(i() - 1)">Anterior</button> }
            @if (i() < pasos().length - 1) {
              <button type="button" class="btn btn-primario" (click)="i.set(i() + 1)">Siguiente<app-icon nombre="arrow-right" [tam]="18" /></button>
            } @else {
              <button type="button" class="btn btn-primario" (click)="cerrar.emit()">Comenzar</button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RecorridoGuiado {
  readonly perfil = input<Perfil | null>(null);
  readonly cerrar = output<void>();
  protected readonly i = signal(0);
  private readonly dialogo = viewChild.required<ElementRef<HTMLElement>>('dialogo');
  private readonly previo = document.activeElement as HTMLElement | null;

  protected readonly pasos = computed(() => {
    const p = this.perfil();
    const primero = (p && PRIMERO[p]) || {
      icono: 'house',
      titulo: 'Bienvenido a la plataforma',
      texto: 'Tu inicio reúne las tareas e indicadores de tu cargo. Puedes ordenar y ocultar las tarjetas con el botón Personalizar.',
    };
    return [primero, ...COMUNES];
  });
  protected readonly paso = computed(() => this.pasos()[this.i()]);

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.focus());
  }

  /** Mantiene el foco dentro del diálogo modal mientras está abierto. */
  protected atrapar(e: Event) {
    const k = e as KeyboardEvent;
    const focos = Array.from(this.dialogo().nativeElement.querySelectorAll<HTMLElement>('button, [href], input, select, textarea'));
    if (!focos.length) return;
    const primero = focos[0], ultimo = focos[focos.length - 1];
    if (k.shiftKey && (document.activeElement === primero || document.activeElement === this.dialogo().nativeElement)) { ultimo.focus(); k.preventDefault(); }
    else if (!k.shiftKey && document.activeElement === ultimo) { primero.focus(); k.preventDefault(); }
  }

  ngOnDestroy() {
    this.previo?.focus?.();
  }
}
