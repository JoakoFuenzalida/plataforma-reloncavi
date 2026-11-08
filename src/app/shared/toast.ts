import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from './icon';

export type TipoAviso = 'exito' | 'error' | 'adv' | 'info';
export interface Aviso {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  texto?: string;
}

/** Notificaciones emergentes (25.4, Retroalimentación). */
@Injectable({ providedIn: 'root' })
export class Avisos {
  private n = 0;
  readonly lista = signal<Aviso[]>([]);

  mostrar(tipo: TipoAviso, titulo: string, texto?: string, ms = 5000) {
    const id = ++this.n;
    this.lista.update((l) => [...l, { id, tipo, titulo, texto }]);
    if (ms > 0) setTimeout(() => this.cerrar(id), ms);
  }
  cerrar(id: number) {
    this.lista.update((l) => l.filter((a) => a.id !== id));
  }
}

const ICONO: Record<TipoAviso, string> = {
  exito: 'check-circle-2',
  error: 'circle-alert',
  adv: 'triangle-alert',
  info: 'info',
};

@Component({
  selector: 'app-avisos',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { position: fixed; z-index: 900; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; width: min(380px, calc(100vw - 32px)); }
    .aviso { display:flex; gap:12px; align-items:flex-start; padding:14px 12px 14px 16px; background:#fff; border-radius:10px; box-shadow: var(--sombra-3); border-left:5px solid currentColor; animation: entra .22s ease-out; }
    .aviso p { margin:0; color: var(--c-basalto); font-size: var(--t-sm); }
    .aviso strong { display:block; color: var(--c-basalto); }
    .cuerpo { flex:1; }
    .exito { color: var(--c-exito); } .error { color: var(--c-error); } .adv { color: var(--c-advertencia); } .info { color: var(--c-info); }
    @keyframes entra { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
  `,
  template: `
    <div aria-live="polite" aria-atomic="false" class="sr-only">
      @for (a of avisos.lista(); track a.id) { {{ a.titulo }}. {{ a.texto }} }
    </div>
    @for (a of avisos.lista(); track a.id) {
      <div class="aviso" [class]="a.tipo">
        <app-icon [nombre]="icono[a.tipo]" [tam]="22" />
        <div class="cuerpo">
          <strong>{{ a.titulo }}</strong>
          @if (a.texto) { <p>{{ a.texto }}</p> }
        </div>
        <button type="button" class="btn btn-icono btn-sm" (click)="avisos.cerrar(a.id)" aria-label="Cerrar notificación">
          <app-icon nombre="x" [tam]="18" />
        </button>
      </div>
    }
  `,
})
export class AvisosHost {
  protected readonly avisos = inject(Avisos);
  protected readonly icono = ICONO;
}
