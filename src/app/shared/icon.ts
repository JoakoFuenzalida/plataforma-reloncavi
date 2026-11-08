import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONOS } from './icon-data';

/**
 * Ícono SVG del sistema de diseño. Decorativo por defecto (aria-hidden);
 * si se entrega `etiqueta`, se expone como imagen con nombre accesible.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"inline-flex"',
    '[style.width.px]': 'tam()',
    '[style.height.px]': 'tam()',
  },
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    [attr.width]="tam()"
    [attr.height]="tam()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="grosor()"
    stroke-linecap="round"
    stroke-linejoin="round"
    [attr.aria-hidden]="etiqueta() ? null : 'true'"
    [attr.role]="etiqueta() ? 'img' : null"
    [attr.aria-label]="etiqueta() || null"
    focusable="false"
    [innerHTML]="contenido()"
  ></svg>`,
})
export class Icon {
  private readonly san = inject(DomSanitizer);
  readonly nombre = input.required<string>();
  readonly tam = input(20);
  readonly grosor = input(2);
  readonly etiqueta = input<string>('');

  protected readonly contenido = computed(() => {
    const nodos = ICONOS[this.nombre()] ?? [];
    const html = nodos
      .map(([tag, attrs]) => {
        const a = Object.entries(attrs)
          .filter(([k]) => k !== 'key')
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return `<${tag} ${a}></${tag}>`;
      })
      .join('');
    return this.san.bypassSecurityTrustHtml(html);
  });
}
