import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HOTELES } from '../core/hoteles';
import { HISTORICO_DEMO, resumirAnalitica, csvAnalitica } from '../core/analitica.datos';

@Component({
  selector: 'app-analitica',
  imports: [FormsModule],
  styleUrl: './operacion.scss',
  styles: `
    :host {
      display: block;
    }
    .grafico {
      width: 100%;
      height: auto;
    }
    .valor {
      font-weight: 700;
      font-size: 1.6rem;
    }
    .tabla-envoltura {
      overflow-x: auto;
    }
    .calor {
      border-collapse: separate;
      border-spacing: 4px;
    }
    .calor th {
      font-size: 0.85rem;
      text-align: left;
    }
    .calor button {
      border: 1px solid #647781;
      border-radius: 5px;
      min-width: 62px;
      min-height: 44px;
      color: #12384a;
      font: inherit;
      cursor: pointer;
    }
    .calor button[aria-pressed='true'] {
      outline: 3px solid #12384a;
    }
    .detalle {
      overflow-wrap: anywhere;
    }
    svg text {
      font-size: 12px;
      fill: #12384a;
    }
  `,
  template: `<section class="pila" aria-labelledby="historico-titulo">
    <h2 id="historico-titulo">Histórico de demostración</h2>
    <p class="mensaje mensaje-info">
      Serie ficticia independiente del estado operativo y de las reservas. Incluye registros diarios
      del 1 al 18 de enero de 2029 para los nueve hoteles. Los filtros de hotel y categoría del
      tablero también se aplican aquí.
    </p>
    <div class="tarjeta fila">
      <label class="campo"
        >Desde<input
          class="control"
          type="date"
          min="2029-01-01"
          max="2029-01-18"
          [ngModel]="desde()"
          (ngModelChange)="desde.set($event); limpiarDetalle()"
      /></label>
      <label class="campo"
        >Hasta<input
          class="control"
          type="date"
          min="2029-01-01"
          max="2029-01-18"
          [ngModel]="hasta()"
          (ngModelChange)="hasta.set($event); limpiarDetalle()"
      /></label>
      <button class="btn btn-secundario" (click)="semana()">Últimos 7 días</button>
      <button class="btn btn-primario" [disabled]="!filas().length" (click)="exportar()">
        Exportar histórico CSV
      </button>
    </div>
    @if (errorPeriodo()) {
      <p class="mensaje mensaje-error" role="alert">{{ errorPeriodo() }}</p>
    }
    @if (exportado()) {
      <p role="status">{{ exportado() }}</p>
    }
    @if (filas().length) {
      <div class="rejilla-3" aria-label="Indicadores del período">
        <article class="tarjeta">
          <h3>Ocupación del período</h3>
          <p class="valor" data-testid="historico-ocupacion">{{ numero(resumen().ocupacion) }} %</p>
          <p>{{ resumen().ocupadas }} / {{ resumen().disponibles }} habitaciones-noche.</p>
        </article>
        <article class="tarjeta">
          <h3>ADR del período</h3>
          <p class="valor">{{ clp(resumen().adr) }}</p>
          <p>Ingreso de alojamiento ÷ habitaciones-noche ocupadas.</p>
        </article>
        <article class="tarjeta">
          <h3>RevPAR del período</h3>
          <p class="valor">{{ clp(resumen().revpar) }}</p>
          <p>Ingreso de alojamiento ÷ habitaciones-noche disponibles.</p>
        </article>
        <article class="tarjeta">
          <h3>Tiempo de check-in</h3>
          <p class="valor">{{ numero(resumen().checkin) }} s</p>
          <p>Promedio ponderado por llegadas.</p>
        </article>
        <article class="tarjeta">
          <h3>Salida a habitación vendible</h3>
          <p class="valor">{{ numero(resumen().limpieza) }} min</p>
          <p>Promedio ponderado por ciclos de limpieza e inspección.</p>
        </article>
        <article class="tarjeta">
          <h3>NPS de llegada</h3>
          <p class="valor">{{ numero(resumen().nps) }}</p>
          <p>% promotores − % detractores · {{ resumen().respuestas }} respuestas ficticias.</p>
        </article>
      </div>
      <details class="tarjeta">
        <summary>Definiciones y origen del histórico</summary>
        <p>
          Los totales suman registros de hotel y día; los promedios se ponderan por sus
          denominadores, no se promedian porcentajes. RevPAR = ADR × ocupación expresada como
          fracción. Los ingresos están en CLP y excluyen extras. El inventario diario de referencia
          usa la capacidad del portafolio, sin simular cierres ni bloqueos históricos. No equivale a
          la muestra operativa de arriba.
        </p>
      </details>
      <div class="rejilla-3">
        <section class="tarjeta">
          <h3>Ocupación diaria</h3>
          <p>Línea · porcentaje por fecha</p>
          <svg
            class="grafico"
            viewBox="0 0 340 210"
            role="img"
            aria-label="Línea de ocupación diaria; valores en la tabla diaria"
          >
            <path d="M40 20V170H320" fill="none" stroke="#647781" />
            <text x="3" y="25">100%</text>
            <text x="18" y="175">0%</text>
            <polyline
              [attr.points]="puntosOcupacion()"
              fill="none"
              stroke="#12384a"
              stroke-width="3"
            />
            @for (d of diarios(); track d.fecha; let i = $index) {
              <circle [attr.cx]="x(i)" [attr.cy]="170 - d.ocupacion * 1.5" r="4" fill="#12384a" />
            }
            <text x="40" y="200">{{ desde().slice(5) }}</text>
            <text x="280" y="200">{{ hasta().slice(5) }}</text>
          </svg>
        </section>
        <section class="tarjeta">
          <h3>Ingresos de alojamiento</h3>
          <p>Área · CLP por fecha; máximo {{ clp(maxIngreso()) }}</p>
          <svg
            class="grafico"
            viewBox="0 0 340 210"
            role="img"
            aria-label="Área de ingresos diarios; valores en la tabla diaria"
          >
            <path d="M40 20V170H320" fill="none" stroke="#647781" />
            <polygon [attr.points]="area()" fill="#dce6ea" stroke="#12384a" stroke-width="2" />
            @for (d of diarios(); track d.fecha; let i = $index) {
              <circle
                [attr.cx]="x(i)"
                [attr.cy]="170 - (150 * d.ingreso) / maxIngreso()"
                r="4"
                fill="#12384a"
              />
            }
            <text x="15" y="175">0</text>
            <text x="40" y="200">{{ desde().slice(5) }}</text>
            <text x="280" y="200">{{ hasta().slice(5) }}</text>
          </svg>
        </section>
        <section class="tarjeta">
          <h3>Ocupación y ADR</h3>
          <p>
            Dispersión · un punto por hotel; eje horizontal: ocupación, vertical: ADR hasta
            {{ clp(maxAdr()) }}
          </p>
          <svg
            class="grafico"
            viewBox="0 0 340 210"
            role="img"
            aria-label="Dispersión de ocupación y ADR por hotel; valores y detalle en la tabla de hoteles"
          >
            <path d="M40 20V170H320" fill="none" stroke="#647781" />
            <text x="20" y="175">0</text>
            <text x="40" y="200">0%</text>
            <text x="280" y="200">100%</text>
            @for (h of porHotel(); track h.id) {
              <circle
                [attr.cx]="40 + h.ocupacion * 2.8"
                [attr.cy]="170 - (150 * h.adr) / maxAdr()"
                r="6"
                fill="#12384a"
              >
                <title>{{ h.nombre }}: {{ numero(h.ocupacion) }} %, {{ clp(h.adr) }}</title>
              </circle>
            }
          </svg>
        </section>
      </div>
      <section class="tarjeta pila">
        <h3>Ocupación por hotel y fecha</h3>
        <p>
          Mapa de calor · cada celda muestra el porcentaje. Selecciona una celda para consultar su
          registro diario.
        </p>
        <div
          class="tabla-envoltura"
          tabindex="0"
          role="region"
          aria-label="Mapa de calor con desplazamiento horizontal"
        >
          <table class="calor">
            <caption>
              Ocupación ficticia; tono más oscuro indica mayor porcentaje
            </caption>
            <thead>
              <tr>
                <th scope="col">Hotel</th>
                @for (d of diarios(); track d.fecha) {
                  <th scope="col">{{ d.fecha.slice(5) }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (h of porHotel(); track h.id) {
                <tr>
                  <th scope="row">{{ h.nombre }}</th>
                  @for (d of diarios(); track d.fecha) {
                    <td>
                      <button
                        [style.background]="color(celda(h.id, d.fecha))"
                        [attr.aria-label]="
                          h.nombre +
                          ' · ' +
                          d.fecha +
                          ': ' +
                          numero(celda(h.id, d.fecha)) +
                          ' %; ver registro'
                        "
                        [attr.aria-pressed]="detalleHotel() === h.id && detalleFecha() === d.fecha"
                        (click)="ver(h.id, d.fecha)"
                      >
                        {{ numero(celda(h.id, d.fecha)) }}%
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <details class="tarjeta">
        <summary>Valores diarios de los gráficos</summary>
        <div
          class="tabla-envoltura"
          tabindex="0"
          role="region"
          aria-label="Tabla de valores diarios"
        >
          <table class="tabla">
            <caption>
              Agregados de los hoteles seleccionados
            </caption>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ocupación %</th>
                <th>Ingresos CLP</th>
                <th>ADR CLP</th>
                <th>RevPAR CLP</th>
              </tr>
            </thead>
            <tbody>
              @for (d of diarios(); track d.fecha) {
                <tr>
                  <td>{{ d.fecha }}</td>
                  <td>{{ numero(d.ocupacion) }}</td>
                  <td>{{ clp(d.ingreso) }}</td>
                  <td>{{ clp(d.adr) }}</td>
                  <td>{{ clp(d.revpar) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </details>
      <section class="tarjeta pila">
        <h3>Detalle por hotel</h3>
        <div
          class="tabla-envoltura"
          tabindex="0"
          role="region"
          aria-label="Tabla de indicadores por hotel"
        >
          <table class="tabla">
            <caption>
              Selecciona un hotel para ver sus registros del período
            </caption>
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Ocupación</th>
                <th>ADR</th>
                <th>RevPAR</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              @for (h of porHotel(); track h.id) {
                <tr>
                  <td>{{ h.nombre }}</td>
                  <td>{{ numero(h.ocupacion) }}%</td>
                  <td>{{ clp(h.adr) }}</td>
                  <td>{{ clp(h.revpar) }}</td>
                  <td>
                    <button
                      class="btn btn-secundario"
                      (click)="ver(h.id, '')"
                      [attr.aria-label]="'Ver registros de ' + h.nombre"
                    >
                      Ver registros
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <section class="tarjeta pila detalle" aria-labelledby="registros-titulo">
        <div class="fila-entre">
          <h3 id="registros-titulo">Registros diarios de respaldo</h3>
          <button class="btn btn-secundario" (click)="limpiarDetalle()">
            Ver todos los registros
          </button>
        </div>
        <p role="status">
          {{ detalle().length }} registros visibles{{
            detalleHotel() ? ' · Hotel: ' + nombre(detalleHotel()) : ''
          }}{{ detalleFecha() ? ' · Fecha: ' + detalleFecha() : '' }}. El CSV exporta todo el
          período y los hoteles filtrados, sin limitarse al detalle seleccionado.
        </p>
        <div
          class="tabla-envoltura"
          tabindex="0"
          role="region"
          aria-label="Registros de respaldo con desplazamiento horizontal"
        >
          <table class="tabla">
            <caption>
              Origen: serie ficticia independiente · importes CLP
            </caption>
            <thead>
              <tr>
                <th>Registro</th>
                <th>Fecha</th>
                <th>Hotel</th>
                <th>Ocupadas / disponibles</th>
                <th>Ingreso</th>
                <th>Llegadas</th>
                <th>Segundos check-in</th>
                <th>Limpiezas</th>
                <th>Minutos limpieza</th>
                <th>NPS: promotores / detractores / respuestas</th>
              </tr>
            </thead>
            <tbody>
              @for (r of detalle(); track r.id) {
                <tr>
                  <td>{{ r.id }}</td>
                  <td>{{ r.fecha }}</td>
                  <td>{{ nombre(r.hotelId) }}</td>
                  <td>{{ r.ocupadas }} / {{ r.disponibles }}</td>
                  <td>{{ clp(r.ingresoClp) }}</td>
                  <td>{{ r.llegadas }}</td>
                  <td>{{ r.segundosCheckin }}</td>
                  <td>{{ r.limpiezas }}</td>
                  <td>{{ r.minutosLimpieza }}</td>
                  <td>{{ r.promotores }} / {{ r.detractores }} / {{ r.respuestas }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10">
                    La selección de detalle no coincide con los filtros actuales. Usa Ver todos los
                    registros.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    } @else if (!errorPeriodo()) {
      <p class="tarjeta">No hay registros históricos para estos filtros.</p>
    }
  </section>`,
})
export class Analitica {
  readonly hotelesIds = input.required<string[]>();
  readonly desde = signal('2029-01-12');
  readonly hasta = signal('2029-01-18');
  readonly detalleHotel = signal('');
  readonly detalleFecha = signal('');
  readonly exportado = signal('');
  readonly errorPeriodo = computed(() => {
    const valida = (v: string) =>
      /^2029-01-\d{2}$/.test(v) && v >= '2029-01-01' && v <= '2029-01-18';
    if (!valida(this.desde()) || !valida(this.hasta()))
      return 'Selecciona fechas entre el 1 y el 18 de enero de 2029.';
    return this.desde() > this.hasta() ? 'La fecha inicial no puede ser posterior a la final.' : '';
  });
  readonly filas = computed(() =>
    this.errorPeriodo()
      ? []
      : HISTORICO_DEMO.filter(
          (r) =>
            this.hotelesIds().includes(r.hotelId) &&
            r.fecha >= this.desde() &&
            r.fecha <= this.hasta(),
        ),
  );
  readonly resumen = computed(() => resumirAnalitica(this.filas()));
  readonly diarios = computed(() =>
    [...new Set(this.filas().map((r) => r.fecha))]
      .sort()
      .map((fecha) => ({
        fecha,
        ...resumirAnalitica(this.filas().filter((r) => r.fecha === fecha)),
      })),
  );
  readonly porHotel = computed(() =>
    HOTELES.filter((h) => this.filas().some((r) => r.hotelId === h.id)).map((h) => ({
      id: h.id,
      nombre: h.nombreCorto,
      ...resumirAnalitica(this.filas().filter((r) => r.hotelId === h.id)),
    })),
  );
  readonly maxIngreso = computed(() => Math.max(1, ...this.diarios().map((d) => d.ingreso)));
  readonly maxAdr = computed(() => Math.max(1, ...this.porHotel().map((h) => h.adr)));
  readonly puntosOcupacion = computed(() =>
    this.diarios()
      .map((d, i) => `${this.x(i)},${170 - d.ocupacion * 1.5}`)
      .join(' '),
  );
  readonly area = computed(
    () =>
      `${this.x(0)},170 ` +
      this.diarios()
        .map((d, i) => `${this.x(i)},${170 - (150 * d.ingreso) / this.maxIngreso()}`)
        .join(' ') +
      ` ${this.x(this.diarios().length - 1)},170`,
  );
  readonly detalle = computed(() =>
    this.filas().filter(
      (r) =>
        (!this.detalleHotel() || r.hotelId === this.detalleHotel()) &&
        (!this.detalleFecha() || r.fecha === this.detalleFecha()),
    ),
  );
  x(i: number) {
    return this.diarios().length > 1 ? 40 + (i * 280) / (this.diarios().length - 1) : 180;
  }
  celda(id: string, fecha: string) {
    const r = this.filas().find((r) => r.hotelId === id && r.fecha === fecha);
    return r ? (100 * r.ocupadas) / r.disponibles : 0;
  }
  color(v: number) {
    return `hsl(198 30% ${98 - v * 0.3}%)`;
  }
  numero(v: number) {
    return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(v);
  }
  clp(v: number) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(v);
  }
  nombre(id: string) {
    return HOTELES.find((h) => h.id === id)?.nombreCorto ?? id;
  }
  limpiarDetalle() {
    this.detalleHotel.set('');
    this.detalleFecha.set('');
    this.exportado.set('');
  }
  ver(id: string, fecha: string) {
    this.detalleHotel.set(id);
    this.detalleFecha.set(fecha);
    document.getElementById('registros-titulo')?.scrollIntoView({ block: 'start' });
  }
  semana() {
    this.desde.set('2029-01-12');
    this.hasta.set('2029-01-18');
    this.limpiarDetalle();
  }
  csv() {
    return csvAnalitica(this.filas());
  }
  exportar() {
    if (!this.filas().length) return;
    const url = URL.createObjectURL(new Blob([this.csv()], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-demo-${this.desde()}-${this.hasta()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.exportado.set(
      `CSV generado con ${this.filas().length} registros ficticios del período filtrado, en CLP.`,
    );
  }
}
