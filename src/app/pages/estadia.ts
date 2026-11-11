import { Component, computed, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { OperacionState } from "../core/operacion-state";
import { DemoState } from "../core/demo-state";

@Component({
  selector: "app-estadia",
  imports: [FormsModule],
  styles: `
    :host {
      display: block;
    }
    dl {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      margin: 0;
    }
    dt,
    dd {
      margin: 0;
    }
    dd {
      text-align: right;
      font-weight: 600;
    }
    .saldo {
      border-top: 1px solid var(--c-borde);
      padding-top: 12px;
    }
    .btn {
      white-space: normal;
      line-height: 1.4;
      padding-block: 8px;
    }
    fieldset {
      min-width: 0;
      border: 1px solid var(--c-borde);
      border-radius: var(--r-md);
      padding: 16px;
    }
    legend {
      font-weight: 700;
    }
    .control {
      max-width: 100%;
    }
  `,
  template: `@if (reserva(); as r) {
    <div class="pila">
      @if (r.estado === "finalizada") {
        <p class="mensaje mensaje-exito" role="status">
          Check-out completado · salida registrada el {{ r.salidaReal }}. La
          habitación debe pasar por limpieza e inspección antes de estar
          disponible.
        </p>
      }
        @if(r.habitacionId && op.habitacionPorId(r.habitacionId)?.motivoBloqueo){<p class="mensaje mensaje-adv">Bloqueo de mantenimiento activo. La salida no libera esta habitación.</p>}
    <h3>Folio de la estadía</h3>
      <dl aria-label="Resumen del folio">
        <dt>Alojamiento · {{ r.llegada }} → {{ r.salida }}</dt>
        <dd data-testid="alojamiento">
          {{ demo.precio(folio().alojamiento) }}
        </dd>
        <dt>Extras</dt>
        <dd>{{ demo.precio(folio().extras) }}</dd>
        <dt>Total de la estadía</dt>
        <dd>{{ demo.precio(folio().total) }}</dd>
        <dt>Abono de la reserva</dt>
        <dd>{{ demo.precio(folio().abono) }}</dd>
        <dt>Extras ya cobrados</dt>
        <dd>{{ demo.precio(folio().extrasPagados) }}</dd>
        <dt>Pago de salida aprobado</dt>
        <dd>{{ demo.precio(folio().pagosFinales) }}</dd>
        <dt class="saldo">Saldo pendiente</dt>
        <dd class="saldo" data-testid="saldo">
          {{ demo.precio(folio().saldo) }}
        </dd>
      </dl>
      <details>
        <summary>Detalle de cargos y pagos</summary>
        <ul>
          @for (c of op.cargosPorReserva(r.id); track c.id) {
            <li>
              {{ c.concepto }} · {{ demo.precio(c.montoClp) }} ·
              {{ c.sincronizacion }}
            </li>
          } @empty {
            <li>No hay cargos adicionales.</li>
          }
          @for (p of pagos(); track p.id) {
            <li>
              Pago de salida {{ p.estado }} · {{ demo.precio(p.montoClp) }} ·
              DEMO •••• 4242
            </li>
          }
        </ul>
      </details>
      @if (r.estado === "alojado") {
        <form class="pila" (ngSubmit)="agregarCargo()" #form="ngForm">
          <label class="campo"
            >Concepto<input
              class="control"
              name="concepto"
              [(ngModel)]="concepto"
              required
              maxlength="100"
          /></label>
          <label class="campo"
            >Monto CLP<input
              class="control"
              name="monto"
              type="number"
              [(ngModel)]="monto"
              required
              min="1"
              max="1000000"
              step="1"
          /></label>
          <button
            class="btn btn-primario"
            [disabled]="form.invalid || ocupado()"
          >
            Agregar cargo
          </button>
        </form>
        <p>
          Preautorización ficticia: CLP 200.000 para cobros adicionales sin
          enlace.
        </p>
        <button
          class="btn btn-secundario"
          [disabled]="ocupado()"
          (click)="cobrarExtras()"
        >
          Cobrar extras contra preautorización
        </button>
        <fieldset class="pila">
          <legend>Extender estadía</legend>
          <p>
            Se mantiene la tarifa pactada:
            {{ demo.precio(r.tarifaNocheClp) }} por noche. La extensión requiere
            cupo y habitación sin otra asignación.
          </p>
          <label class="campo"
            >Nueva fecha de salida<input
              class="control"
              type="date"
              [min]="r.salida"
              [ngModel]="salida()"
              (ngModelChange)="salida.set($event); cerrando.set(false)"
              [disabled]="ocupado()"
          /></label>
          @if (salida()) {
            @if (extension().error) {
              <p class="mensaje mensaje-adv" role="alert">
                {{ extension().error }}
              </p>
            } @else {
              <p>
                {{ extension().noches }} noche(s) adicional(es) ·
                {{ demo.precio(extension().adicional) }}. Nuevo total de
                alojamiento:
                {{ demo.precio(folio().alojamiento + extension().adicional) }}.
              </p>
            }
          }
          <button
            class="btn btn-secundario"
            [disabled]="!salida() || !!extension().error || ocupado()"
            (click)="extender()"
          >
            Confirmar extensión
          </button>
        </fieldset>
        @if (!cerrando()) {
          <button
            class="btn btn-primario"
            [disabled]="ocupado()"
            (click)="cerrando.set(true); mensaje.set('')"
          >
            Revisar check-out
          </button>
        } @else {
          <fieldset class="pila">
            <legend>Confirmar check-out</legend>
            <p>
              Salida efectiva: {{ op.fechaOperativa }}. Se conserva el importe
              contratado aunque la salida sea anticipada; esta simulación no
              genera reembolsos.
            </p>
            <p>
              Se cobrará únicamente el saldo pendiente:
              <strong>{{ demo.precio(folio().saldo) }}</strong
              >. La habitación pasará a limpieza.
            </p>
            <p>
              Medio ficticio DEMO •••• 4242. No se solicitan datos bancarios ni
              se realizan cobros reales.
            </p>
            @if (op.sinEnlace(r.hotelId)) {
              <p class="mensaje mensaje-adv">
                El cobro utilizará la preautorización disponible y quedará en
                cola, sujeto a validación central.
              </p>
            }
            <div class="fila">
              <button
                class="btn btn-primario"
                [disabled]="ocupado()"
                (click)="finalizar(true)"
              >
                {{
                  folio().saldo > 0
                    ? "Simular pago aprobado y finalizar"
                    : "Confirmar salida sin cobro"
                }}
              </button>
              @if (folio().saldo > 0) {
                <button
                  class="btn btn-secundario"
                  [disabled]="ocupado()"
                  (click)="finalizar(false)"
                >
                  Simular pago rechazado
                </button>
              }
              <button
                class="btn btn-secundario"
                [disabled]="ocupado()"
                (click)="cerrando.set(false)"
              >
                Cancelar salida
              </button>
            </div>
          </fieldset>
        }
      }
      @if (ocupado()) {
        <p role="status">Procesando salida…</p>
      }
      @if (mensaje()) {
        <p
          class="mensaje"
          [class.mensaje-error]="error()"
          [class.mensaje-exito]="!error()"
          [attr.role]="error() ? 'alert' : 'status'"
        >
          {{ mensaje() }}
        </p>
      }
    </div>
  }`,
})
export class Estadia {
  readonly reservaId = input.required<string>();
  readonly op = inject(OperacionState);
  readonly demo = inject(DemoState);
  readonly reserva = computed(() => this.op.reservaPorId(this.reservaId()));
  readonly folio = computed(() => this.op.folio(this.reservaId()));
  readonly pagos = computed(() =>
    this.op.pagosSalida().filter((p) => p.reservaId === this.reservaId()),
  );
  readonly salida = signal("");
  readonly extension = computed(() =>
    this.op.evaluarExtension(this.reservaId(), this.salida()),
  );
  readonly cerrando = signal(false);
  readonly ocupado = signal(false);
  readonly mensaje = signal("");
  readonly error = signal(false);
  concepto = "";
  monto: number | null = null;
  informar(error: string, exito: string) {
    this.error.set(!!error);
    this.mensaje.set(error || exito);
  }
  agregarCargo() {
    if (this.ocupado()) return;
    const ok = this.op.agregarCargo(
      this.reservaId(),
      this.concepto,
      this.monto ?? 0,
    );
    this.informar(
      ok ? "" : "Revisa concepto, monto y conexión.",
      "Cargo registrado.",
    );
    if (ok) {
      this.concepto = "";
      this.monto = null;
      this.cerrando.set(false);
    }
  }
  cobrarExtras() {
    if (this.ocupado()) return;
    this.informar(
      this.op.cobrar(this.reservaId())
        ? ""
        : "No hay extras pendientes, superan la preautorización o se alcanzó el límite sin enlace.",
      "Cobro simulado registrado. Sin enlace, la aceptación central queda por verificar.",
    );
  }
  extender() {
    if (this.ocupado()) return;
    const error = this.op.extenderEstadia(this.reservaId(), this.salida());
    this.informar(error, "Estadía extendida. El folio muestra el nuevo saldo.");
    if (!error) {
      this.salida.set("");
      this.cerrando.set(false);
    }
  }
  async finalizar(aprobado: boolean) {
    if (this.ocupado() || !this.cerrando()) return;
    const id = this.reservaId();
    this.ocupado.set(true);
    this.mensaje.set("");
    await new Promise((resolve) => setTimeout(resolve, 450));
    const error = this.op.checkout(id, aprobado);
    this.informar(
      error,
      "Folio liquidado. Salida registrada sin duplicar cobros.",
    );
    this.ocupado.set(false);
    if (!error) this.cerrando.set(false);
  }
}
