import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Isotipo de Hoteles Reloncaví: volcano sobre el seno de Reloncaví. Diseño original. */
@Component({
  selector: 'app-isotipo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:inline-flex' },
  template: `
    <svg [attr.width]="tam()" [attr.height]="tam()" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" [attr.fill]="invertido() ? '#ffffff' : '#12384A'" />
      <path d="M9 31 L21.2 13.4 a1.6 1.6 0 0 1 2.6 0 L36 31 Z" [attr.fill]="invertido() ? '#12384A' : '#ffffff'" />
      <path d="M17.6 18.6 L21.2 13.4 a1.6 1.6 0 0 1 2.6 0 L27.4 18.6 L25 17.2 L22.6 19.4 L20.2 17.2 Z" fill="#C9DCE3" />
      <path d="M7 36.2 q4.25 -3.2 8.5 0 t8.5 0 t8.5 0 t8.5 0" fill="none" [attr.stroke]="invertido() ? '#12384A' : '#ffffff'" stroke-width="2.6" stroke-linecap="round" />
      <path d="M11 41.4 q3.25 -2.4 6.5 0 t6.5 0 t6.5 0 t6.5 0" fill="none" stroke="#2E6B53" stroke-width="2.6" stroke-linecap="round" [attr.opacity]="invertido() ? 1 : 0.95" />
    </svg>
  `,
})
export class Isotipo {
  readonly tam = input(40);
  readonly invertido = input(false);
}

/** Logotipo completo: isotipo + nombre. */
@Component({
  selector: 'app-logo',
  imports: [Isotipo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
    app-isotipo { flex-shrink: 0; }
    .nombre { display: flex; flex-direction: column; line-height: 1; }
    .marca { font-family: var(--f-titulo); font-weight: 650; font-size: 1.45rem; letter-spacing: -0.01em; color: var(--c-fiordo); }
    .bajada { font-family: var(--f-texto); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.26em; color: var(--c-alerce); margin-top: 4px; white-space: nowrap; }
    :host(.claro) .marca { color: #fff; }
    :host(.claro) .bajada { color: #c9dce3; }
  `,
  host: { '[class.claro]': 'claro()' },
  template: `
    <app-isotipo [tam]="tam()" [invertido]="claro()" />
    <span class="nombre">
      <span class="marca">Reloncaví</span>
      <span class="bajada">HOTELES · LODGES</span>
    </span>
  `,
})
export class Logo {
  readonly tam = input(40);
  readonly claro = input(false);
}
