import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { DemoState } from '../../core/demo-state';
import { HOTELES, Hotel, SIN_CUPO_DEMO, TipoHabitacion } from '../../core/hoteles';
import { TPipe } from '../../core/i18n';
import { Escena } from '../../shared/escena';
import { Icon } from '../../shared/icon';
import { Buscador, noches } from './buscador';

type Orden = 'relevancia' | 'precio' | 'norte';

/** Paso 1 del proceso principal: disponibilidad en tiempo real (RF-06, RF-02, RF-46). */
@Component({
  selector: 'app-disponibilidad',
  imports: [Buscador, Escena, Icon, TPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './disponibilidad.scss',
  template: `
    <div class="contenedor">
      <nav class="rastro" [attr.aria-label]="estado.idioma() === 'es' ? 'Ruta de navegación' : 'Breadcrumb'">
        <ol>
          <li><a routerLink="/inicio">{{ estado.idioma() === 'es' ? 'Inicio' : 'Home' }}</a></li>
          <li aria-hidden="true"><app-icon nombre="chevron-right" [tam]="14" /></li>
          <li><span aria-current="page">{{ 'res.titulo' | t }}</span></li>
        </ol>
      </nav>

      <nav class="pasos" [attr.aria-label]="estado.idioma() === 'es' ? 'Pasos de la reserva' : 'Booking steps'">
        <ol>
          <li class="actual" aria-current="step">1. {{ estado.idioma() === 'es' ? 'Habitación' : 'Room' }}</li>
          <li>2. {{ estado.idioma() === 'es' ? 'Tus datos' : 'Your details' }}</li>
          <li>3. {{ estado.idioma() === 'es' ? 'Pago' : 'Payment' }}</li>
          <li>4. {{ estado.idioma() === 'es' ? 'Confirmación' : 'Confirmation' }}</li>
        </ol>
      </nav>

      <div class="fila-entre cabeza">
        <div>
          <h1>{{ 'res.titulo' | t }}</h1>
          <p class="texto-2">
            {{ fechaLarga(q().llegada) }} – {{ fechaLarga(q().salida) }} · {{ q().noches }}
            {{ q().noches === 1 ? ('buscar.noche' | t) : ('buscar.noches' | t) }} · {{ q().adultos }} {{ 'buscar.adultos' | t }}
          </p>
        </div>
        <div class="fila">
          <button type="button" class="btn btn-secundario" [attr.aria-expanded]="modificar()" aria-controls="panel-modificar"
            (click)="modificar.set(!modificar())">
            <app-icon nombre="filter" [tam]="18" />{{ 'res.modificar' | t }}
            <app-icon [nombre]="modificar() ? 'chevron-down' : 'chevron-right'" [tam]="16" />
          </button>
          <div class="campo orden">
            <label for="orden" class="sr-only">{{ 'res.ordenar' | t }}</label>
            <select id="orden" class="control" [value]="orden()" (change)="orden.set($any($event.target).value)">
              <option value="relevancia">{{ 'res.ordenar' | t }}: {{ 'res.orden.relevancia' | t }}</option>
              <option value="precio">{{ 'res.ordenar' | t }}: {{ 'res.orden.precio' | t }}</option>
              <option value="norte">{{ 'res.ordenar' | t }}: {{ 'res.orden.norte' | t }}</option>
            </select>
          </div>
        </div>
      </div>

      @if (modificar()) {
        <div id="panel-modificar" class="tarjeta panel-modificar">
          <app-buscador [destino]="q().destino" [llegada]="q().llegada" [salida]="q().salida" [adultos]="q().adultos" />
        </div>
      }

      <div class="mensaje mensaje-info nota-iva">
        <app-icon nombre="info" />
        <p>{{ 'res.impuestos' | t }}</p>
      </div>

      @if (cargando()) {
        <p class="sr-only" role="status">{{ 'res.cargando' | t }}</p>
        <div class="lista" aria-hidden="true">
          @for (i of [1, 2, 3]; track i) {
            <div class="resultado tarjeta">
              <div class="esqueleto img-esq"></div>
              <div class="pila" style="flex:1">
                <div class="esqueleto" style="height:28px;width:45%"></div>
                <div class="esqueleto" style="height:16px;width:70%"></div>
                <div class="esqueleto" style="height:64px;width:100%"></div>
                <div class="esqueleto" style="height:64px;width:100%"></div>
              </div>
            </div>
          }
        </div>
      } @else if (resultados().length === 0) {
        <div class="vacio tarjeta">
          <svg viewBox="0 0 160 110" aria-hidden="true">
            <rect x="10" y="30" width="140" height="70" rx="10" fill="#eaf1f4" />
            <path d="M30 80 L60 45 L80 65 L95 52 L130 80Z" fill="#c9dce3" />
            <circle cx="120" cy="20" r="14" fill="none" stroke="#12384a" stroke-width="5" />
            <line x1="130" y1="30" x2="146" y2="46" stroke="#12384a" stroke-width="6" stroke-linecap="round" />
          </svg>
          <h3>{{ 'res.vacio.t' | t }}</h3>
          <p>{{ 'res.vacio.d' | t }}</p>
          <a class="btn btn-secundario" routerLink="/reservar/disponibilidad"
            [queryParams]="{ llegada: q().llegada, salida: q().salida, adultos: q().adultos }">{{ 'hoteles.filtro.todos' | t }}</a>
        </div>
      } @else {
        <ul class="lista" role="list">
          @for (h of resultados(); track h.id) {
            <li class="resultado tarjeta">
              <div class="img">
                <app-escena [tipo]="h.escena" [descripcion]="h.nombre" />
              </div>
              <div class="info">
                <div class="fila-entre">
                  <h2>{{ h.nombre }}</h2>
                  <span class="distintivo" [class.distintivo-acento]="h.tipo === 'lodge'">
                    {{ h.tipo === 'lodge' ? ('hoteles.lodge' | t) : ('hoteles.urbano' | t) }}
                  </span>
                </div>
                <p class="lugar texto-sm"><app-icon nombre="map-pin" [tam]="16" />{{ h.ciudad }}, {{ h.region }}</p>

                @if (sinCupo(h)) {
                  <div class="mensaje mensaje-adv">
                    <app-icon nombre="triangle-alert" />
                    <div><strong>{{ 'res.sin-cupo' | t }}</strong><p>{{ 'res.sin-cupo.d' | t }}</p></div>
                  </div>
                } @else {
                  <ul class="tipos" role="list">
                    @for (t of h.tipos; track t.codigo; let i = $index) {
                      <li class="tipo">
                        <div class="tipo-info">
                          <h3>{{ t.nombre[estado.idioma()] }}</h3>
                          <p class="texto-sm texto-2">
                            {{ t.detalle[estado.idioma()] }} ·
                            <app-icon nombre="users" [tam]="14" /> {{ t.capacidad }}
                          </p>
                          @if (quedan(h, i); as n) {
                            <span class="distintivo distintivo-acento">{{ 'res.quedan' | t }} {{ n }} {{ 'res.quedan2' | t }}</span>
                          }
                        </div>
                        <div class="tipo-precio">
                          <span class="texto-xs texto-2">{{ 'res.total' | t }}</span>
                          <strong>{{ estado.precio(t.tarifaClp * q().noches) }}</strong>
                          <span class="texto-xs texto-2">{{ estado.precio(t.tarifaClp) }} {{ 'hoteles.por-noche' | t }}</span>
                        </div>
                        <button type="button" class="btn btn-primario" [disabled]="t.capacidad < q().adultos"
                          (click)="elegir(h, t)">
                          {{ 'res.elegir' | t }}<span class="sr-only">: {{ t.nombre[estado.idioma()] }}, {{ h.nombreCorto }}</span>
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class Disponibilidad {
  protected readonly estado = inject(DemoState);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly modificar = signal(false);
  protected readonly orden = signal<Orden>('relevancia');
  protected readonly cargando = signal(true);

  protected readonly q = toSignal(
    this.ruta.queryParamMap.pipe(
      map((p) => {
        const llegada = p.get('llegada') ?? '2029-02-02';
        const salida = p.get('salida') ?? '2029-02-05';
        return {
          destino: p.get('destino') ?? '',
          llegada,
          salida,
          adultos: Number(p.get('adultos') ?? 2),
          noches: Math.max(1, noches(llegada, salida)),
        };
      }),
    ),
    { requireSync: true },
  );

  protected readonly resultados = computed(() => {
    const { destino } = this.q();
    let lista = destino ? HOTELES.filter((h) => h.id === destino) : [...HOTELES];
    const minimo = (h: Hotel) => Math.min(...h.tipos.map((t) => t.tarifaClp));
    if (this.orden() === 'precio') lista = [...lista].sort((a, b) => minimo(a) - minimo(b));
    if (this.orden() === 'norte') lista = [...lista]; // el portafolio ya está ordenado de norte a sur
    if (this.orden() === 'relevancia') lista = [...lista].sort((a, b) => Number(this.sinCupo(a)) - Number(this.sinCupo(b)));
    return lista;
  });

  constructor() {
    // Simula la consulta a la capa de disponibilidad (S2) con esqueleto de carga.
    this.ruta.queryParamMap.subscribe(() => {
      this.cargando.set(true);
      this.modificar.set(false);
      setTimeout(() => this.cargando.set(false), 850);
    });
  }

  protected sinCupo(h: Hotel) {
    return SIN_CUPO_DEMO.has(h.id);
  }

  protected quedan(h: Hotel, i: number): number | null {
    // Inventario ficticio: algunos tipos muestran disponibilidad baja.
    const semilla = (h.habitaciones + i * 7) % 5;
    return h.tipo === 'lodge' || semilla === 0 ? 2 + (semilla % 3) : null;
  }

  protected fechaLarga(iso: string) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(this.estado.idioma() === 'es' ? 'es-CL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected elegir(h: Hotel, t: TipoHabitacion) {
    const q = this.q();
    this.router.navigate(['/reservar/datos'], {
      queryParams: { hotel: h.id, tipo: t.codigo, llegada: q.llegada, salida: q.salida, adultos: q.adultos },
    });
  }
}
