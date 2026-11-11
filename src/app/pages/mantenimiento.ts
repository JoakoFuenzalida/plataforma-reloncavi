import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { OperacionState } from "../core/operacion-state";
import { HOTELES } from "../core/hoteles";
import { EstadoOrden, OrdenMantenimiento } from "../core/operacion.modelos";

@Component({
  selector: "app-mantenimiento",
  imports: [FormsModule, RouterLink],
  styleUrl: "./operacion.scss",
  styles: `
    .foto {
      max-width: 100%;
      max-height: 280px;
      object-fit: contain;
      border-radius: var(--r-md);
    }
    textarea {
      min-height: 110px;
    }
    .historial {
      padding-left: 20px;
    }
    .historial li {
      margin-block: 12px;
    }
    fieldset {
      padding: 16px;
    }
    legend {
      font-weight: 700;
    }
    .detalle {
      overflow-wrap: anywhere;
    }
  `,
  template: `<a class="saltar-contenido" href="#mantenimiento"
      >Saltar al contenido</a
    >
    <header class="cabecera">
      <div class="contenedor fila-entre">
        <strong>Hoteles Reloncaví</strong
        ><span>Prototipo con datos ficticios · 18 ene 2029</span
        ><a routerLink="/">Cambiar perfil</a>
      </div>
    </header>
    <main id="mantenimiento" tabindex="-1" class="contenedor pila cuerpo">
      <nav class="fila" aria-label="Operación">
        <a class="btn btn-secundario" routerLink="/personal/recepcion"
          >Recepción</a
        ><a class="btn btn-secundario" routerLink="/terreno">Housekeeping</a
        ><a class="btn btn-secundario" routerLink="/personal/tablero"
          >Tablero</a
        >
      <a class="btn btn-secundario" routerLink="/personal/huespedes">Directorio de huéspedes</a></nav>
      <div class="fila-entre">
        <div>
          <p class="texto-2">Operación del hotel</p>
          <h1>Mantenimiento</h1>
        </div>
        <label class="campo"
          >Hotel<select
            aria-label="Hotel"
            class="control"
            [ngModel]="hotelId()"
            (ngModelChange)="cambiarHotel($event)"
          >
            @for (h of hoteles; track h.id) {
              <option [value]="h.id">{{ h.nombre }}</option>
            }
          </select></label
        >
      </div>
      <section class="tarjeta fila-entre" aria-label="Perfil de mantenimiento">
        <div>
          <strong>{{
            op.operadorMantenimiento() === "tecnico"
              ? "Jorge Barría · Técnico"
              : "Supervisora de mantenimiento"
          }}</strong>
          <p>
            Acceso de demostración. La aprobación la realiza un supervisor
            distinto del técnico.
          </p>
        </div>
        <button class="btn btn-secundario" (click)="cambiarOperador()">
          {{
            op.operadorMantenimiento() === "tecnico"
              ? "Cambiar a supervisor"
              : "Cambiar a técnico"
          }}
        </button>
      </section>
      @if (op.sinEnlace(hotelId())) {
        <p class="mensaje mensaje-adv">
          Sin enlace: {{ op.enlaces()[hotelId()] }} /
          {{ op.limite(hotelId()) }} h. Las operaciones se guardan en la cola
          local; reconecta desde recepción.
        </p>
      }
      @if (!op.operable(hotelId())) {
        <p class="mensaje mensaje-error" role="alert">
          Límite sin enlace alcanzado. Reconecta antes de modificar órdenes.
        </p>
      }
      <div class="dos-columnas">
        <section class="pila" aria-label="Órdenes de trabajo">
          <h2>Órdenes de trabajo</h2>
          <label class="campo"
            >Buscar orden o habitación<input
              class="control"
              [ngModel]="busqueda()"
              (ngModelChange)="busqueda.set($event)"
          /></label>
          <label class="campo"
            >Estado<select
              aria-label="Estado"
              class="control"
              [ngModel]="filtro()"
              (ngModelChange)="filtro.set($event)"
            >
              <option value="">Todos</option>
              @for (e of estados; track e) {
                <option [value]="e">{{ etiqueta(e) }}</option>
              }
            </select></label
          >
          @for (o of ordenes(); track o.id) {
            <button
              class="tarjeta reserva"
              [class.activa]="seleccion() === o.id"
              [attr.aria-pressed]="seleccion() === o.id"
              (click)="seleccionar(o)"
            >
              <strong
                >{{ o.codigo }} · Habitación
                {{ op.habitacionPorId(o.habitacionId)?.numero }}</strong
              ><span>{{ etiqueta(o.estado) }}</span
              ><span>{{ o.motivo }}</span>
            </button>
          } @empty {
            <div class="tarjeta pila">
              <h3>No hay órdenes para este filtro</h3>
              <p>
                Las incidencias se reportan desde la habitación en housekeeping.
              </p>
              <a routerLink="/terreno">Abrir housekeeping</a>
            </div>
          }
        </section>
        <section class="tarjeta pila detalle" aria-label="Detalle de la orden">
          @if (actual(); as o) {
            <div class="fila-entre">
              <h2>
                {{ o.codigo }} · Habitación
                {{ op.habitacionPorId(o.habitacionId)?.numero }}
              </h2>
              <span class="distintivo">{{ etiqueta(o.estado) }}</span>
            </div>
            <p><strong>Causa:</strong> {{ o.motivo }}</p>
            <p>
              Reportado por {{ o.reportadoPor }} · Responsable:
              {{ o.responsable || "Sin asignar" }}
            </p>
            @if (o.foto) {
              <figure>
                <img
                  class="foto"
                  [src]="o.foto.dataUrl"
                  [alt]="'Foto de incidencia: ' + o.motivo"
                />
                <figcaption>{{ o.foto.nombre }}</figcaption>
              </figure>
            }
            @if (o.estado !== "cerrada") {
              <p class="mensaje mensaje-adv">
                Bloqueo activo: no se permiten nuevas asignaciones ni
                extensiones de estadía en esta habitación.
              </p>
            }
            @if (op.habitacionPorId(o.habitacionId)?.estado === "ocupada") {
              <p class="mensaje mensaje-adv">
                Huésped alojado. Coordina con recepción; no se puede liberar una
                habitación ocupada.
              </p>
            }
            @if (o.estado === "reportada") {
              <button
                class="btn btn-primario"
                [disabled]="
                  op.operadorMantenimiento() !== 'tecnico' ||
                  !op.operable(o.hotelId)
                "
                (click)="iniciar(o)"
              >
                Tomar orden e iniciar trabajo
              </button>
            }
            @if (o.estado === "en-curso") {
              <form class="pila" (ngSubmit)="terminar(o)" novalidate>
                <label class="campo"
                  >Trabajo realizado<textarea
                    class="control"
                    name="trabajo"
                    [(ngModel)]="trabajo"
                    maxlength="1000"
                    [disabled]="op.operadorMantenimiento() !== 'tecnico'"
                  ></textarea>
                </label>
                <label class="casilla"
                  ><input
                    type="checkbox"
                    name="reparacion"
                    [(ngModel)]="reparacion"
                  />Reparación completada y probada</label
                ><label class="casilla"
                  ><input
                    type="checkbox"
                    name="seguridad"
                    [(ngModel)]="seguridad"
                  />Área y equipos seguros</label
                >
                <button
                  class="btn btn-primario"
                  [disabled]="
                    op.operadorMantenimiento() !== 'tecnico' ||
                    !op.operable(o.hotelId)
                  "
                >
                  Enviar a aprobación
                </button>
              </form>
            }
            @if (o.trabajo) {
              <p><strong>Informe técnico:</strong> {{ o.trabajo }}</p>
            }
            @if (o.estado === "por-aprobar") {
              @if (op.operadorMantenimiento() === "supervisor") {
                <fieldset class="pila">
                  <legend>Inspección para liberar</legend>
                  <label class="casilla"
                    ><input
                      type="checkbox"
                      [(ngModel)]="funcion"
                    />Funcionamiento verificado presencialmente</label
                  ><label class="casilla"
                    ><input type="checkbox" [(ngModel)]="segura" />Seguridad y
                    equipamiento revisados</label
                  ><label class="casilla"
                    ><input type="checkbox" [(ngModel)]="limpia" />Limpieza y
                    preparación para el huésped verificadas</label
                  >
                  @if (confirmando()) {
                    <p>
                      Confirmar cerrará la orden y devolverá la habitación a
                      disponible.
                    </p>
                    <div class="fila">
                      <button
                        class="btn btn-primario"
                        [disabled]="
                          !funcion ||
                          !segura ||
                          !limpia ||
                          !op.operable(o.hotelId)
                        "
                        (click)="aprobar(o)"
                      >
                        Confirmar liberación</button
                      ><button
                        class="btn btn-secundario"
                        (click)="confirmando.set(false)"
                      >
                        Cancelar liberación
                      </button>
                    </div>
                  } @else {
                    <button
                      class="btn btn-primario"
                      [disabled]="
                        !funcion ||
                        !segura ||
                        !limpia ||
                        !op.operable(o.hotelId)
                      "
                      (click)="confirmando.set(true)"
                    >
                      Revisar liberación
                    </button>
                  }
                </fieldset>
                <label class="campo"
                  >Motivo de devolución<textarea
                    class="control"
                    [(ngModel)]="observacion"
                    maxlength="500"
                  ></textarea></label
                ><button
                  class="btn btn-secundario"
                  [disabled]="!op.operable(o.hotelId)"
                  (click)="devolver(o)"
                >
                  Devolver al técnico
                </button>
              } @else {
                <p>
                  La reparación está enviada. Cambia al supervisor para
                  inspeccionar y aprobar o devolver el trabajo.
                </p>
              }
            }
            @if (o.estado === "cerrada") {
              <p class="mensaje mensaje-exito">
                Orden cerrada. Liberación aprobada por {{ o.aprobadoPor }}.
              </p>
            }
            <h3>Historial de la orden</h3>
            <ol class="historial">
              @for (evento of o.historial; track $index) {
                <li>
                  <strong>{{ evento.actor }}</strong> · {{ evento.fecha
                  }}<br />{{ evento.detalle }}
                </li>
              }
            </ol>
          } @else {
            <h2>Selecciona una orden</h2>
            <p>
              Revisa la causa, la foto y el trabajo antes de autorizar la
              liberación.
            </p>
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
        </section>
      </div>
      <footer class="texto-sm texto-2">
        Plataforma operada por VORA · Datos en memoria para demostración.
      </footer>
    </main>`,
})
export class Mantenimiento {
  readonly op = inject(OperacionState);
  private readonly ruta = inject(ActivatedRoute);
  readonly hoteles = HOTELES;
  readonly seleccion = signal(
    this.ruta.snapshot.queryParamMap.get("orden") ?? "",
  );
  readonly hotelId = signal(
    this.op.ordenes().find((o) => o.id === this.seleccion())?.hotelId ??
      "puerto-montt",
  );
  readonly busqueda = signal("");
  readonly filtro = signal("");
  readonly mensaje = signal("");
  readonly error = signal(false);
  readonly confirmando = signal(false);
  readonly estados: EstadoOrden[] = [
    "reportada",
    "en-curso",
    "por-aprobar",
    "cerrada",
  ];
  readonly actual = computed(() =>
    this.op
      .ordenes()
      .find((o) => o.id === this.seleccion() && o.hotelId === this.hotelId()),
  );
  readonly ordenes = computed(() =>
    this.op
      .ordenes()
      .filter(
        (o) =>
          o.hotelId === this.hotelId() &&
          (!this.filtro() || o.estado === this.filtro()) &&
          `${o.codigo} ${o.motivo} ${this.op.habitacionPorId(o.habitacionId)?.numero}`
            .toLowerCase()
            .includes(this.busqueda().toLowerCase()),
      )
      .slice()
      .reverse(),
  );
  trabajo = "";
  reparacion = false;
  seguridad = false;
  funcion = false;
  segura = false;
  limpia = false;
  observacion = "";
  etiqueta(e: EstadoOrden) {
    return {
      reportada: "Reportada",
      "en-curso": "En curso",
      "por-aprobar": "Por aprobar",
      cerrada: "Cerrada",
    }[e];
  }
  limpiarFormulario() {
    this.trabajo = this.actual()?.trabajo ?? "";
    this.reparacion = false;
    this.seguridad = false;
    this.funcion = false;
    this.segura = false;
    this.limpia = false;
    this.observacion = "";
    this.confirmando.set(false);
    this.mensaje.set("");
  }
  cambiarHotel(id: string) {
    this.hotelId.set(id);
    this.seleccion.set("");
    this.limpiarFormulario();
  }
  seleccionar(o: OrdenMantenimiento) {
    this.seleccion.set(o.id);
    this.limpiarFormulario();
  }
  cambiarOperador() {
    this.op.operadorMantenimiento.set(
      this.op.operadorMantenimiento() === "tecnico" ? "supervisor" : "tecnico",
    );
    this.limpiarFormulario();
  }
  informar(error: string, ok: string) {
    this.error.set(!!error);
    this.mensaje.set(error || ok);
  }
  iniciar(o: OrdenMantenimiento) {
    this.informar(
      this.op.iniciarMantenimiento(o.id),
      "Orden asignada. Trabajo en curso.",
    );
  }
  terminar(o: OrdenMantenimiento) {
    this.informar(
      this.op.solicitarAprobacion(
        o.id,
        this.trabajo,
        this.reparacion,
        this.seguridad,
      ),
      "Trabajo enviado a revisión. La habitación permanece bloqueada.",
    );
  }
  aprobar(o: OrdenMantenimiento) {
    const error = this.op.revisarMantenimiento(
      o.id,
      true,
      this.funcion,
      this.segura,
      this.limpia,
    );
    this.informar(error, "Habitación liberada y orden cerrada.");
    if (!error) this.confirmando.set(false);
  }
  devolver(o: OrdenMantenimiento) {
    const error = this.op.revisarMantenimiento(
      o.id,
      false,
      false,
      false,
      false,
      this.observacion,
    );
    this.informar(error, "Orden devuelta al técnico. El bloqueo se mantiene.");
    if (!error) this.confirmando.set(false);
  }
}
