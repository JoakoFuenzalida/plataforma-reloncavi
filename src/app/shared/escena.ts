import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Escena as TipoEscena } from '../core/hoteles';

/**
 * Ilustraciones originales de cada destino, construidas con la paleta del sistema de diseño.
 * Reemplazan fotografías: no dependen de licencias de terceros y pesan pocos kilobytes.
 */
@Component({
  selector: 'app-escena',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:block' },
  styles: `svg { display:block; width:100%; height:100%; }`,
  template: `
    <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="img" [attr.aria-label]="descripcion()">
      <defs>
        <linearGradient [attr.id]="'cielo-' + uid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" [attr.stop-color]="tipo() === 'torres' || tipo() === 'estrecho' ? '#b9d0da' : '#cfe1e8'" />
          <stop offset="1" stop-color="#f3f5f4" />
        </linearGradient>
        <linearGradient [attr.id]="'agua-' + uid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2b5f74" />
          <stop offset="1" stop-color="#12384a" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" [attr.fill]="'url(#cielo-' + uid + ')'" />
      <circle cx="320" cy="52" r="20" fill="#f8ece6" opacity="0.9" />

      @switch (tipo()) {
        @case ('ciudad') {
          <path d="M0 170 L60 120 L110 150 L170 95 L240 145 L300 110 L400 160 V225 H0Z" fill="#9fb9c4" opacity="0.6" />
          <g fill="#12384a">
            <rect x="40" y="110" width="34" height="115" /><rect x="80" y="80" width="40" height="145" />
            <rect x="128" y="125" width="30" height="100" /><rect x="166" y="60" width="26" height="165" />
            <rect x="200" y="100" width="44" height="125" /><rect x="252" y="130" width="36" height="95" />
            <rect x="296" y="90" width="40" height="135" /><rect x="344" y="140" width="40" height="85" />
          </g>
          <g fill="#c9dce3" opacity="0.85">
            @for (y of [95, 115, 135, 155, 175, 195]; track y) {
              <rect x="88" [attr.y]="y" width="8" height="8" /><rect x="104" [attr.y]="y" width="8" height="8" />
              <rect x="208" [attr.y]="y + 15" width="8" height="8" /><rect x="226" [attr.y]="y + 15" width="8" height="8" />
              <rect x="304" [attr.y]="y + 10" width="8" height="8" /><rect x="320" [attr.y]="y + 10" width="8" height="8" />
            }
          </g>
          <rect y="212" width="400" height="13" fill="#2e6b53" />
        }
        @case ('aeropuerto') {
          <path d="M0 175 L80 140 L170 160 L260 130 L400 165 V225 H0Z" fill="#9fb9c4" opacity="0.55" />
          <rect x="0" y="185" width="400" height="40" fill="#55636a" />
          <g stroke="#f3f5f4" stroke-width="3" stroke-dasharray="18 14"><line x1="0" y1="205" x2="400" y2="205" /></g>
          <rect x="40" y="140" width="190" height="45" rx="4" fill="#12384a" />
          <rect x="52" y="150" width="166" height="14" fill="#c9dce3" opacity="0.85" />
          <rect x="250" y="120" width="10" height="65" fill="#12384a" /><rect x="240" y="108" width="30" height="16" rx="3" fill="#12384a" />
          <g transform="translate(250 60) rotate(-12)" fill="#ffffff">
            <path d="M0 10 L70 8 L84 0 L88 4 L78 12 L90 14 L90 18 L74 18 L50 34 L42 34 L54 18 L0 16Z" />
          </g>
        }
        @case ('costa') {
          <path d="M0 140 L70 100 L130 125 L210 85 L290 120 L400 95 V225 H0Z" fill="#2e6b53" opacity="0.75" />
          <path d="M0 165 L90 130 L180 150 L260 128 L400 150 V225 H0Z" fill="#1f5a45" />
          <rect y="168" width="400" height="57" [attr.fill]="'url(#agua-' + uid + ')'" />
          <g stroke="#c9dce3" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round">
            <path d="M30 188 q12 -6 24 0" /><path d="M140 200 q12 -6 24 0" /><path d="M260 186 q12 -6 24 0" /><path d="M330 206 q12 -6 24 0" />
          </g>
          <g fill="#12384a"><rect x="300" y="128" width="50" height="40" /><rect x="316" y="112" width="18" height="16" /></g>
          <g fill="#c9dce3"><rect x="306" y="136" width="8" height="8" /><rect x="320" y="136" width="8" height="8" /><rect x="334" y="136" width="8" height="8" /></g>
        }
        @case ('lago') {
          <path d="M150 140 L215 48 a6 6 0 0 1 10 0 L290 140Z" fill="#55636a" />
          <path d="M193 80 L215 48 a6 6 0 0 1 10 0 L247 80 L234 74 L222 84 L210 74Z" fill="#ffffff" />
          <path d="M0 150 L60 128 L120 142 L170 130 L240 145 L320 125 L400 140 V225 H0Z" fill="#2e6b53" />
          <rect y="160" width="400" height="65" [attr.fill]="'url(#agua-' + uid + ')'" />
          <path d="M175 160 L220 196 L265 160Z" fill="#55636a" opacity="0.25" />
          <g stroke="#c9dce3" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round">
            <path d="M40 182 q12 -6 24 0" /><path d="M300 194 q12 -6 24 0" /><path d="M110 206 q12 -6 24 0" />
          </g>
        }
        @case ('bosque') {
          <path d="M0 120 L50 70 L95 110 L150 50 L210 105 L260 60 L320 100 L400 65 V225 H0Z" fill="#9fb9c4" opacity="0.6" />
          <path d="M0 150 L80 115 L160 140 L250 110 L330 135 L400 120 V225 H0Z" fill="#2e6b53" opacity="0.8" />
          <g fill="#1d4a3a">
            @for (x of [10, 45, 80, 115, 150, 255, 290, 325, 360, 392]; track x) {
              <path [attr.d]="'M' + x + ' 205 l18 -62 l18 62Z'" />
            }
          </g>
          <rect y="200" width="400" height="25" fill="#1d4a3a" />
          <g fill="#12384a"><path d="M185 200 V170 L215 150 L245 170 V200Z" /></g>
          <rect x="205" y="178" width="20" height="22" fill="#c9dce3" />
        }
        @case ('fiordo') {
          <path d="M0 60 L70 150 L0 225Z" fill="#2e6b53" />
          <path d="M0 40 L60 110 L120 160 L150 225 H0Z" fill="#1d4a3a" />
          <path d="M400 50 L320 150 L400 225Z" fill="#2e6b53" />
          <path d="M400 30 L340 120 L280 170 L250 225 H400Z" fill="#1d4a3a" />
          <path d="M120 165 L200 120 L280 165Z" fill="#9fb9c4" opacity="0.8" />
          <rect x="100" y="165" width="200" height="60" [attr.fill]="'url(#agua-' + uid + ')'" />
          <g fill="#ffffff"><path d="M180 190 h44 l-6 9 h-34Z" /><rect x="194" y="180" width="14" height="10" /></g>
        }
        @case ('torres') {
          <path d="M60 150 L110 70 L130 95 L150 40 L170 85 L185 30 L205 80 L225 45 L250 110 L300 150Z" fill="#55636a" />
          <path d="M140 60 L150 40 L160 62Z M178 48 L185 30 L193 52Z M218 58 L225 45 L232 62Z" fill="#ffffff" />
          <path d="M0 160 L90 130 L180 150 L270 128 L400 155 V225 H0Z" fill="#a9461f" opacity="0.55" />
          <rect y="168" width="400" height="30" fill="#2b5f74" />
          <path d="M0 198 L120 185 L260 196 L400 186 V225 H0Z" fill="#7f8f63" />
          <g fill="#12384a"><rect x="300" y="168" width="70" height="26" /><path d="M296 168 L335 150 L374 168Z" /></g>
          <g fill="#c9dce3"><rect x="308" y="175" width="10" height="9" /><rect x="326" y="175" width="10" height="9" /><rect x="344" y="175" width="10" height="9" /></g>
        }
        @case ('estrecho') {
          <path d="M0 130 L120 115 L220 125 L400 110 V225 H0Z" fill="#9fb9c4" opacity="0.6" />
          <rect y="135" width="400" height="90" [attr.fill]="'url(#agua-' + uid + ')'" />
          <g fill="#ffffff">
            <path d="M210 150 h120 l-12 16 h-100Z" /><rect x="230" y="134" width="74" height="16" />
            <rect x="248" y="122" width="34" height="12" /><rect x="282" y="108" width="8" height="14" fill="#a9461f" />
          </g>
          <g fill="#12384a"><rect x="20" y="96" width="70" height="44" /><rect x="40" y="80" width="30" height="16" /></g>
          <g fill="#c9dce3"><rect x="28" y="106" width="9" height="9" /><rect x="44" y="106" width="9" height="9" /><rect x="60" y="106" width="9" height="9" /><rect x="76" y="106" width="9" height="9" /></g>
        }
      }
    </svg>
  `,
})
export class Escena {
  private static n = 0;
  protected readonly uid = `e${++Escena.n}`;
  readonly tipo = input.required<TipoEscena>();
  readonly descripcion = input('');
}
