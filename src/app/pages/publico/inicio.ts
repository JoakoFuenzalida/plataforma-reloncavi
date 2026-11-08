import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoState } from '../../core/demo-state';
import { HOTELES, TipoHotel } from '../../core/hoteles';
import { TPipe } from '../../core/i18n';
import { Escena } from '../../shared/escena';
import { Icon } from '../../shared/icon';
import { Buscador } from './buscador';

/** Página de inicio pública de Hoteles Reloncaví (25.2, Portal principal; RT-16.30). */
@Component({
  selector: 'app-inicio',
  imports: [Buscador, Escena, Icon, TPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inicio.scss',
  template: `
    <section class="portada">
      <app-escena class="fondo" tipo="torres" [descripcion]="estado.idioma() === 'es' ? 'Ilustración del macizo del Paine al atardecer' : 'Illustration of the Paine massif at sunset'" />
      <div class="contenedor portada-contenido">
        <h1>{{ 'hero.titulo' | t }}</h1>
        <p class="bajada">{{ 'hero.sub' | t }}</p>
        <div class="tarjeta buscador">
          <h2 class="sr-only">{{ 'buscar.titulo' | t }}</h2>
          <app-buscador />
        </div>
      </div>
    </section>

    <section id="ventajas" class="contenedor seccion" aria-labelledby="t-ventajas">
      <h2 id="t-ventajas">{{ 'beneficios.titulo' | t }}</h2>
      <div class="rejilla-3">
        @for (b of beneficios; track b.i) {
          <article class="ventaja">
            <span class="ventaja-icono"><app-icon [nombre]="b.icono" [tam]="26" /></span>
            <h3>{{ ('beneficios.' + b.i + '.t') | t }}</h3>
            <p class="texto-2">{{ ('beneficios.' + b.i + '.d') | t }}</p>
          </article>
        }
      </div>
    </section>

    <section id="hoteles" class="contenedor seccion" aria-labelledby="t-hoteles">
      <div class="fila-entre encabezado">
        <div>
          <h2 id="t-hoteles">{{ 'hoteles.titulo' | t }}</h2>
          <p class="texto-2">{{ 'hoteles.sub' | t }}</p>
        </div>
        <div class="pestanas" role="tablist" [attr.aria-label]="'hoteles.titulo' | t">
          @for (f of filtros; track f.id) {
            <button type="button" role="tab" [attr.aria-selected]="filtro() === f.id" [class.activa]="filtro() === f.id"
              (click)="filtro.set(f.id)">{{ f.clave | t }}</button>
          }
        </div>
      </div>

      <ul class="hoteles" role="list">
        @for (h of hotelesFiltrados(); track h.id) {
          <li class="hotel tarjeta">
            <div class="imagen">
              <app-escena [tipo]="h.escena" [descripcion]="h.nombre" />
              <span class="distintivo" [class.distintivo-acento]="h.tipo === 'lodge'">
                {{ h.tipo === 'lodge' ? ('hoteles.lodge' | t) : ('hoteles.urbano' | t) }}
              </span>
            </div>
            <div class="cuerpo">
              <h3>{{ h.nombreCorto }}</h3>
              <p class="lugar texto-sm"><app-icon nombre="map-pin" [tam]="16" />{{ h.ciudad }}, {{ h.region }}</p>
              <p class="texto-sm texto-2 desc">{{ h.descripcion[estado.idioma()] }}</p>
              <ul class="etiquetas" role="list">
                @for (d of h.destacados[estado.idioma()]; track d) { <li class="distintivo distintivo-neutro">{{ d }}</li> }
              </ul>
              <div class="fila-entre pie-hotel">
                <p class="precio">
                  <span class="texto-xs texto-2">{{ 'hoteles.desde' | t }}</span>
                  <strong>{{ estado.precio(minimo(h.id)) }}</strong>
                  <span class="texto-xs texto-2">{{ 'hoteles.por-noche' | t }}</span>
                </p>
                <a class="btn btn-secundario btn-sm" [routerLink]="['/reservar/disponibilidad']"
                  [queryParams]="{ destino: h.id, llegada: '2029-02-02', salida: '2029-02-05', adultos: 2 }">
                  {{ 'hoteles.ver' | t }}<span class="sr-only">: {{ h.nombre }}</span>
                </a>
              </div>
            </div>
          </li>
        }
      </ul>
    </section>

    <section id="sostenibilidad" class="sostenibilidad" aria-labelledby="t-sost">
      <div class="contenedor sost-rejilla">
        <div>
          <h2 id="t-sost">{{ 'sost.titulo' | t }}</h2>
          <p>{{ 'sost.texto' | t }}</p>
        </div>
        <div class="folio tarjeta" aria-hidden="true">
          <p class="texto-xs negrita">FOLIO VERDE · 3 {{ 'buscar.noches' | t }}</p>
          <div class="folio-fila"><app-icon nombre="droplets" /><span>{{ estado.idioma() === 'es' ? 'Agua' : 'Water' }}</span><strong>0,61 m³</strong></div>
          <div class="folio-fila"><app-icon nombre="zap" /><span>{{ estado.idioma() === 'es' ? 'Energía' : 'Energy' }}</span><strong>38,4 kWh</strong></div>
          <span class="distintivo distintivo-exito">{{ estado.idioma() === 'es' ? 'Medido por zona · metodología publicada' : 'Measured by zone · published methodology' }}</span>
        </div>
      </div>
    </section>
  `,
})
export class Inicio {
  protected readonly estado = inject(DemoState);
  protected readonly filtro = signal<'todos' | TipoHotel>('todos');
  protected readonly filtros = [
    { id: 'todos' as const, clave: 'hoteles.filtro.todos' },
    { id: 'urbano' as const, clave: 'hoteles.filtro.urbanos' },
    { id: 'lodge' as const, clave: 'hoteles.filtro.lodges' },
  ];
  protected readonly beneficios = [
    { i: 1, icono: 'smartphone' },
    { i: 2, icono: 'badge-check' },
    { i: 3, icono: 'leaf' },
  ];
  protected readonly hotelesFiltrados = computed(() =>
    this.filtro() === 'todos' ? HOTELES : HOTELES.filter((h) => h.tipo === this.filtro()),
  );

  minimo(id: string) {
    const h = HOTELES.find((x) => x.id === id)!;
    return Math.min(...h.tipos.map((t) => t.tarifaClp));
  }
}
