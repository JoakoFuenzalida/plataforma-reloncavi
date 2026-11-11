import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { HOTELES } from "../core/hoteles";
import { OperacionState } from "../core/operacion-state";
import { DemoState } from "../core/demo-state";

@Component({
  selector: "app-tablero",
  imports: [FormsModule, RouterLink],
  styleUrl: "./operacion.scss",
  styles: `
    .metrica {
      font-size: 2rem;
      font-weight: 700;
      color: var(--c-fiordo);
    }
    .barra {
      height: 18px;
      background: var(--c-fiordo);
      border-radius: 4px;
    }
    .grafico {
      width: 100%;
      height: auto;
      max-height: 240px;
    }
    .anillo {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      margin: 16px auto;
    }
    .anillo span {
      background: white;
      border-radius: 50%;
      width: 110px;
      height: 110px;
      display: grid;
      place-items: center;
      font-weight: 700;
    }
    .tabla-envoltura {
      max-width: 100%;
    }
  `,
  template: `<header class="cabecera">
      <div class="contenedor fila-entre">
        <strong>Hoteles Reloncaví</strong
        ><span>Prototipo con datos ficticios · 18 ene 2029</span
        ><a routerLink="/">Cambiar perfil</a>
      </div>
    </header>
    <main class="contenedor pila cuerpo">
      <nav class="fila" aria-label="Operación">
        <a class="btn btn-secundario" routerLink="/personal/recepcion"
          >Recepción</a
        ><a class="btn btn-secundario" routerLink="/terreno">Housekeeping</a>
        <a class="btn btn-secundario" routerLink="/personal/mantenimiento">Mantenimiento</a>
      <a class="btn btn-secundario" routerLink="/personal/huespedes">Directorio de huéspedes</a></nav>
      <h1>Tablero gerencial</h1>
      <div class="tarjeta fila">
        <label class="campo"
          >Hotel<select
            class="control"
            [ngModel]="filtro()"
            (ngModelChange)="filtro.set($event)"
          >
            <option value="">Toda la cadena</option>
            @for (h of hoteles; track h.id) {
              <option [value]="h.id">{{ h.nombre }}</option>
            }
          </select></label
        ><label class="campo"
          >Categoría<select
            class="control"
            [ngModel]="categoria()"
            (ngModelChange)="categoria.set($event)"
          >
            <option value="">Todas</option>
            <option value="urbano">Urbano</option>
            <option value="lodge">Lodge</option>
          </select></label
        ><span>Período: 18 enero 2029</span>
      </div>
      <p class="mensaje mensaje-info">
        Indicadores de la muestra operativa, no del inventario completo de 820
        habitaciones. Los check-in, check-out y cambios de limpieza actualizan este
        tablero.
      </p>
      <section class="rejilla-3" aria-label="Indicadores">
        <article class="tarjeta">
          <h2>Ocupación</h2>
          <p class="metrica">{{ ocupacion() }}%</p>
          <p>
            {{ ocupadas() }} / {{ inventario().length }} habitaciones de la
            muestra.
          </p>
        </article>
        <article class="tarjeta">
          <h2>ADR</h2>
          <p class="metrica">{{ demo.precio(adr()) }}</p>
          <p>Ingreso de alojamiento por habitación ocupada, por noche.</p>
        </article>
        <article class="tarjeta">
          <h2>RevPAR</h2>
          <p class="metrica">{{ demo.precio(revpar()) }}</p>
          <details>
            <summary>¿Cómo se calcula?</summary>
            <p>
              Ingreso de alojamiento de la noche ÷ habitaciones de la muestra.
              Equivale a ADR × ocupación. No incluye cargos de extras.
            </p>
          </details>
        </article>
      </section>
      <section class="rejilla-3" aria-label="Estado operativo">
        <article class="tarjeta"><h2>Bloqueos de mantenimiento</h2><p class="metrica" data-testid="bloqueos">{{bloqueadas()}}</p><p>Habitaciones con incidencia activa, incluidas las que aún están ocupadas.</p></article>
        <article class="tarjeta"><h2>Salidas realizadas</h2><p class="metrica" data-testid="salidas">{{salidas()}}</p><p>Check-out registrados en la fecha operativa.</p></article>
        <article class="tarjeta"><h2>Por limpiar o inspeccionar</h2><p class="metrica" data-testid="limpieza">{{porLimpiar()}}</p><p>No disponibles para nuevas asignaciones.</p></article>
        <article class="tarjeta"><h2>Habitaciones listas</h2><p class="metrica">{{listas()}}</p><p>Limpias e inspeccionadas; asignación sujeta a reservas.</p></article>
      </section>
      @if (!inventario().length) {
        <p class="tarjeta">No hay hoteles para esta combinación de filtros.</p>
      }
      <div class="rejilla-3">
        <section class="tarjeta pila">
          <h2>Ocupación por hotel</h2>
          <p class="texto-sm">Barras · muestra operativa actual</p>
          @for (h of seleccionados(); track h.id) {
            <div>
              <span>{{ h.nombreCorto }} · {{ porHotel(h.id) }}%</span>
              <div
                class="barra"
                [style.width.%]="porHotel(h.id)"
                role="img"
                [attr.aria-label]="
                  h.nombreCorto + ': ' + porHotel(h.id) + ' por ciento'
                "
              ></div>
            </div>
          }
        </section>
        <section class="tarjeta">
          <h2>Estado de habitaciones</h2>
          <p class="texto-sm">Anillo · ocupadas frente al resto</p>
          <div
            class="anillo"
            [style.background]="
              'conic-gradient(var(--c-fiordo) ' + ocupacion() + '%, #dce6ea 0)'
            "
            role="img"
            [attr.aria-label]="ocupacion() + ' por ciento ocupado'"
          >
            <span>{{ ocupacion() }}%</span>
          </div>
          <p>
            Ocupadas: {{ ocupadas() }} · Otras:
            {{ inventario().length - ocupadas() }}
          </p>
        </section>
        <section class="tarjeta">
          <h2>Ocupación histórica</h2>
          <p class="texto-sm">
            Línea · serie ficticia de referencia, 12–18 enero. Independiente de
            la muestra operativa.
          </p>
          <svg
            class="grafico"
            viewBox="0 0 300 180"
            role="img"
            aria-label="Serie histórica ficticia de ocupación"
          >
            <path d="M20 10V150H290" fill="none" stroke="#647781" />
            <polyline
              [attr.points]="puntos()"
              fill="none"
              stroke="#12384a"
              stroke-width="4"
            />
          </svg>
          <p>{{ serie().join("%, ") }}%</p>
        </section>
      </div>
      <section class="tarjeta pila">
        <h2>Detalle de huéspedes alojados</h2>
        <div class="tabla-envoltura">
          <table class="tabla">
            <caption>
              Registros que sustentan ADR y RevPAR
            </caption>
            <thead>
              <tr>
                <th>Código</th>
                <th>Hotel</th>
                <th>Tarifa por noche</th>
              </tr>
            </thead>
            <tbody>
              @for (r of alojados(); track r.id) {
                <tr>
                  <td>{{ r.codigo }}</td>
                  <td>{{ nombreHotel(r.hotelId) }}</td>
                  <td>{{ demo.precio(r.tarifaNocheClp) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3">
                    No hay check-in registrados para este filtro.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <footer class="texto-sm texto-2">Plataforma operada por VORA</footer>
    </main>`,
})
export class Tablero {
  readonly op = inject(OperacionState);
  readonly demo = inject(DemoState);
  readonly hoteles = HOTELES;
  readonly filtro = signal("");
  readonly categoria = signal("");
  readonly seleccionados = computed(() =>
    HOTELES.filter(
      (h) =>
        (!this.filtro() || h.id === this.filtro()) &&
        (!this.categoria() || h.tipo === this.categoria()),
    ),
  );
  readonly inventario = computed(() =>
    this.op
      .habitaciones()
      .filter((h) => this.seleccionados().some((s) => s.id === h.hotelId)),
  );
  readonly alojados = computed(() =>
    this.op
      .huespedesAlojados()
      .filter((r) => this.seleccionados().some((h) => h.id === r.hotelId)),
  );
  readonly ocupadas = computed(
    () => this.inventario().filter((h) => h.estado === "ocupada").length,
  );
  readonly bloqueadas = computed(() => this.inventario().filter(h=>h.estado==='bloqueada' || !!h.motivoBloqueo).length);
  readonly salidas = computed(() => this.op.reservas().filter(r => r.estado === 'finalizada' && r.salidaReal === this.op.fechaOperativa && this.seleccionados().some(h=>h.id===r.hotelId)).length);
  readonly porLimpiar = computed(() => this.inventario().filter(h=>['pendiente-limpieza','en-limpieza','pendiente-inspeccion'].includes(h.estado)).length);
  readonly listas = computed(() => this.inventario().filter(h=>h.estado==='disponible').length);
  readonly ingresos = computed(() =>
    this.alojados().reduce((s, r) => s + r.tarifaNocheClp, 0),
  );
  readonly ocupacion = computed(() =>
    this.inventario().length
      ? Math.round((100 * this.ocupadas()) / this.inventario().length)
      : 0,
  );
  readonly adr = computed(() =>
    this.ocupadas() ? this.ingresos() / this.ocupadas() : 0,
  );
  readonly revpar = computed(() =>
    this.inventario().length ? this.ingresos() / this.inventario().length : 0,
  );
  readonly serie = computed(() =>
    this.seleccionados().length
      ? [64, 68, 72, 69, 76, 81, 78].map((v) =>
          Math.min(100, v + (this.categoria() === "lodge" ? 8 : 0)),
        )
      : [],
  );
  readonly puntos = computed(() =>
    this.serie()
      .map((v, i) => `${20 + i * 44},${150 - v * 1.3}`)
      .join(" "),
  );
  porHotel(id: string) {
    const h = this.op.habitacionesPorHotel(id);
    return h.length
      ? Math.round(
          (100 * h.filter((v) => v.estado === "ocupada").length) / h.length,
        )
      : 0;
  }
  nombreHotel(id: string) {
    return HOTELES.find((h) => h.id === id)?.nombreCorto;
  }
}
