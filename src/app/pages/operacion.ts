import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DemoState } from "../core/demo-state";
import { HOTELES, hotelPorId } from "../core/hoteles";
import { OperacionState } from "../core/operacion-state";
import { Reserva } from "../core/operacion.modelos";
import { Estadia } from "./estadia";
import { Incidencia } from "./incidencia";

@Component({
  selector: "app-operacion",
  imports: [FormsModule, RouterLink, Estadia, Incidencia],
  styleUrl: "./operacion.scss",
  template: ` 
    
    <div class="pila">
      
      <div id="operacion" tabindex="-1" class="pila">
        <div class="fila-entre">
          <div>
            <p class="texto-2">Operación del hotel</p>
            <h1>{{ terreno ? "Habitaciones y limpieza" : "Recepción" }}</h1>
          </div>
          <label class="campo"
            >Hotel<select
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
        @if (terreno) {
          <div class="tarjeta fila-entre">
            <div>
              <strong>{{ operador() }}</strong>
              <p>Dispositivo compartido · Acceso de demostración</p>
            </div>
            <button
              class="btn btn-secundario"
              (click)="
                operador.set(
                  operador() === 'Marta Huenchullán'
                    ? 'Supervisor de pisos'
                    : 'Marta Huenchullán'
                )
              "
            >
              Cambiar operador
            </button>
          </div>
          <p>
            Muestra operativa del hotel. Las prioridades de recepción aparecen
            primero.
          </p>
          @if(mensaje()){<p class="mensaje mensaje-exito" role="status">{{mensaje()}}</p>}
          <div class="rejilla-3">
            @for (h of habitaciones(); track h.id) {
              <article class="tarjeta pila">
                <div class="fila-entre">
                  <h2>Habitación {{ h.numero }}</h2>
                  <span
                    class="distintivo"
                    [class.distintivo-adv]="h.prioridadLimpieza === 'alta'"
                    >{{
                      h.prioridadLimpieza === "alta"
                        ? "Prioridad alta"
                        : h.tipoCodigo
                    }}</span
                  >
                </div>
                <p>{{ estadoHabitacion(h.estado) }}</p>
                @if(h.motivoBloqueo){<p class="mensaje mensaje-adv">Bloqueo: {{h.motivoBloqueo}}</p>}
                @if(op.ordenActiva(h.id);as orden){<a class="btn btn-secundario" routerLink="/personal/mantenimiento" [queryParams]="{orden:orden.id}">Ver orden {{orden.codigo}}</a>}
                @else if(reporte()===h.id){<app-incidencia [habitacionId]="h.id" [operador]="operador()" (cancelar)="reporte.set('')" (guardada)="incidenciaGuardada()" />}
                @else{<button class="btn btn-secundario" (click)="reporte.set(h.id)">Reportar incidencia</button>}

                @if (h.motivoPrioridad) {
                  <p>{{ h.motivoPrioridad }}</p>
                }
                @if (h.estado === "pendiente-limpieza") {
                  <button class="btn btn-primario" (click)="op.limpiar(h.id)">
                    Iniciar limpieza
                  </button>
                }
                @if (h.estado === "en-limpieza") {
                  <button class="btn btn-primario" (click)="op.limpiar(h.id)">
                    Finalizar limpieza
                  </button>
                }
                @if (h.estado === "pendiente-inspeccion") {
                  @if (inspeccion() === h.id) {
                    <fieldset class="pila">
                      <legend>Inspección de habitación {{ h.numero }}</legend>
                      <label class="casilla"
                        ><input type="checkbox" [(ngModel)]="limpia" />Limpieza
                        y baño revisados</label
                      ><label class="casilla"
                        ><input
                          type="checkbox"
                          [(ngModel)]="equipo"
                        />Equipamiento y seguridad revisados</label
                      >
                      <p>
                        Confirmar hará que la habitación vuelva a estar
                        disponible.
                      </p>
                      <button
                        class="btn btn-primario"
                        [disabled]="
                          !limpia ||
                          !equipo ||
                          operador() !== 'Supervisor de pisos'
                        "
                        (click)="liberar(h.id)"
                      >
                        Confirmar liberación</button
                      ><button
                        class="btn btn-secundario"
                        (click)="inspeccion.set('')"
                      >
                        Cancelar
                      </button>
                    </fieldset>
                  } @else {
                    <button
                      class="btn btn-secundario"
                      (click)="
                        inspeccion.set(h.id); limpia = false; equipo = false
                      "
                    >
                      Inspeccionar
                    </button>
                  }
                  <p class="texto-sm">
                    La liberación requiere al supervisor de pisos.
                  </p>
                }
              </article>
            } @empty {
              <p class="tarjeta">No hay habitaciones en esta muestra.</p>
            }
          </div>
        } @else {
          <section class="tarjeta pila" aria-label="Estado de conexión">
            <div class="fila-entre">
              <div>
                <strong>{{
                  op.sinEnlace(hotelId())
                    ? "Sin enlace · datos locales"
                    : "Conectado · información sincronizada"
                }}</strong>
                @if (op.sinEnlace(hotelId())) {
                  <p>
                    {{ op.enlaces()[hotelId()] }} /
                    {{ op.limite(hotelId()) }} horas · La información central
                    espera sincronización.
                  </p>
                }
              </div>
              <div class="fila">
                @if (op.sinEnlace(hotelId())) {
                  <button
                    class="btn btn-secundario"
                    (click)="op.avanzarHora(hotelId())"
                  >
                    Simular 12 horas</button
                  ><button
                    class="btn btn-primario"
                    [disabled]="sincronizando()"
                    (click)="reconectar()"
                  >
                    Reconectar
                  </button>
                } @else {
                  <button
                    class="btn btn-secundario"
                    (click)="op.desconectar(hotelId())"
                  >
                    Simular pérdida de enlace
                  </button>
                }
              </div>
            </div>
            @if (!op.operable(hotelId())) {
              <p class="mensaje mensaje-adv" role="alert">
                Límite de autonomía alcanzado. Reconecta antes de registrar
                nuevas operaciones.
              </p>
            }
            @if (sincronizando()) {
              <p role="status">Sincronizando operaciones…</p>
            }
            <details>
              <summary>Cola de operaciones ({{ cola().length }})</summary>
              <ul>
                @for (o of cola(); track o.id) {
                  <li>{{ o.descripcion }} · {{ o.estado }} · {{ o.riesgo }}</li>
                } @empty {
                  <li>No hay operaciones locales en cola.</li>
                }
              </ul>
            </details>
          </section>
          @for (aviso of op.avisos(); track $index) {
            <p class="mensaje mensaje-exito" role="status">{{ aviso }}</p>
          }
          <div class="dos-columnas">
            <section class="pila">
              <h2>Llegadas de hoy</h2>
              <label class="campo"
                >Buscar por código o huésped<input
                  class="control"
                  [ngModel]="busqueda()"
                  (ngModelChange)="busqueda.set($event)"
              /></label>
              @for (r of llegadas(); track r.id) {
                <button
                  class="tarjeta reserva"
                  [class.activa]="seleccion() === r.id"
                  (click)="seleccionar(r)"
                >
                  <strong>{{ nombre(r) }}</strong
                  ><span>{{ r.codigo }} · {{ r.adultos }} adulto(s)</span
                  ><span>{{
                    r.registrosPrevios.length
                      ? "Registro previo recibido"
                      : "Registro en recepción"
                  }}</span>
                </button>
              } @empty {
                <div class="tarjeta">
                  No hay llegadas que coincidan con la búsqueda.
                </div>
              }
              <h2>Huéspedes alojados</h2>
              @for (r of alojados(); track r.id) {
                <button class="tarjeta reserva" (click)="seleccionar(r)">
                  <strong>{{ nombre(r) }}</strong
                  ><span
                    >Habitación
                    {{ op.habitacionPorId(r.habitacionId ?? "")?.numero }} ·
                    {{ r.codigo }}</span
                  >
                </button>
              } @empty {
                <p>No hay huéspedes alojados en la muestra.</p>
              }
              <h2>Salidas realizadas</h2>
              @for(r of finalizadas();track r.id){
                <button class="tarjeta reserva" (click)="seleccionar(r)"><strong>{{nombre(r)}}</strong><span>{{r.codigo}} · Salida {{r.salidaReal}}</span></button>
              } @empty { <p>No hay salidas realizadas.</p> }
            </section>
            <section class="tarjeta pila">
              @if (actual(); as r) {
                <h2>{{ nombre(r) }}</h2>
                <p>{{ r.codigo }} · {{ r.llegada }} → {{ r.salida }}</p>
                <p>
                  Reservante: {{ op.huespedPorId(r.reservanteId)?.nombres }} ·
                  Pagador: {{ op.huespedPorId(r.pagadorId)?.nombres }} ·
                  Huésped: {{ nombre(r) }}
                </p>
                <p>Personas alojadas:</p><ul>@for(id of r.huespedesIds;track id){<li><a routerLink="/personal/huespedes" [queryParams]="{huesped:id}">{{op.huespedPorId(id)?.nombres}} {{op.huespedPorId(id)?.apellidos}}</a></li>}</ul>
                @if(r.habitacionId && op.habitacionPorId(r.habitacionId)?.motivoBloqueo){<p class="mensaje mensaje-adv">Incidencia activa: {{op.habitacionPorId(r.habitacionId)?.motivoBloqueo}}. Coordina con mantenimiento.</p>}
                @if (r.estado === "confirmada") {
                  <span class="distintivo">Objetivo de check-in: 90 s</span>
                  <a [routerLink]="['/registro', r.id]"
                    >Abrir registro previo del huésped</a
                  >
                  @if (
                    r.habitacionId &&
                    op.habitacionPorId(r.habitacionId)?.estado !== "disponible"
                  ) {
                    <div class="mensaje mensaje-adv">
                      <div>
                        <strong
                          >La habitación asignada
                          {{ op.habitacionPorId(r.habitacionId)?.numero }} aún
                          no está lista</strong
                        >
                        <p>
                          Elige otra lista del mismo tipo o superior, solicita
                          prioridad o registra la espera.
                        </p>
                      </div>
                    </div>
                    <div class="fila">
                      <button
                        class="btn btn-secundario"
                        (click)="
                          op.prioridad(r.id);
                          mensaje.set('Prioridad enviada a housekeeping.')
                        "
                      >
                        Solicitar prioridad</button
                      ><button
                        class="btn btn-secundario"
                        (click)="
                          op.esperar(r.id);
                          mensaje.set(
                            'Espera registrada; se avisará cuando esté lista.'
                          )
                        "
                      >
                        Esperar y avisar
                      </button>
                    </div>
                  }
                  @for (p of r.registrosPrevios; track p.huespedId) {
                    <p>
                      {{op.huespedPorId(p.huespedId)?.nombres}} {{op.huespedPorId(p.huespedId)?.apellidos}} · Documento: {{ p.tipoDocumento }} {{ p.numeroDocumento }} ·
                      {{ p.archivoDocumentoNombre }}
                    </p>
                    @if (p.solicitaExencionIva) {
                      <p>
                        Evidencia de exención: {{ p.evidenciaExencionNombre }}
                      </p>
                      <label class="casilla"
                        ><input
                          type="checkbox"
                          [(ngModel)]="evidencia"
                        />Evidencia de exención revisada</label
                      >
                    }
                  }
                  <label class="campo"
                    >Documento verificado (ficticio)<input
                      class="control"
                      [(ngModel)]="documento"
                      maxlength="30"
                  /></label>
                  <label class="casilla"
                    ><input type="checkbox" [(ngModel)]="verificado" />Verifiqué
                    identidad y documentos de todos los huéspedes</label
                  >
                  <label class="campo"
                    >Habitación lista<select
                      class="control"
                      [(ngModel)]="habitacion"
                    >
                      <option value="">Selecciona una habitación</option>
                      @for (h of op.habitacionesElegibles(r); track h.id) {
                        <option [value]="h.id">
                          {{ h.numero }} · {{ h.tipoCodigo }}
                        </option>
                      }
                    </select></label
                  >
                  <p>
                    Entrega: {{ llave() }}. Recomendación:
                    {{
                      op
                        .huespedPorId(r.huespedesIds[0])
                        ?.preferencias?.join(", ") ||
                        "Consultar preferencias de descanso y experiencias locales."
                    }}
                  </p>
                  <button class="btn btn-primario" (click)="checkin(r)">
                    Confirmar check-in y entregar llave
                  </button>
                } @else {
                  @if(r.estado === 'alojado') {
                    <p class="mensaje mensaje-exito">Check-in completado · {{ llave() }} entregada en simulación.</p>
                  }
                  @for(id of [r.id]; track id) { <app-estadia [reservaId]="id" /> }
                }
              } @else {
                <h2>Selecciona una reserva</h2>
                <p>
                  Revisa documentos, habitación y entrega de llave desde un solo
                  lugar.
                </p>
              }
              @if (mensaje()) {
                <p class="mensaje mensaje-info" role="status">
                  {{ mensaje() }}
                </p>
              }
            </section>
          </div>
        }
      </div>
      
    </div>`,
})
export class Operacion {
  readonly op = inject(OperacionState);
  readonly demo = inject(DemoState);
  readonly ruta = inject(ActivatedRoute);
  readonly terreno = this.ruta.snapshot.data["terreno"] === true;
  readonly hoteles = HOTELES;
  readonly hotelId = signal("puerto-montt");
  readonly seleccion = signal("");
  readonly busqueda = signal("");
  readonly mensaje = signal("");
  readonly sincronizando = signal(false);
  readonly operador = signal("Marta Huenchullán");
  readonly inspeccion = signal("");
  readonly reporte = signal("");
  incidenciaGuardada(){this.reporte.set("");this.inspeccion.set("");this.mensaje.set("Incidencia registrada. La habitación tiene un bloqueo activo y una orden de mantenimiento.");}
  limpia = false;
  equipo = false;
  documento = "";
  verificado = false;
  evidencia = false;
  habitacion = "";
  readonly habitaciones = computed(() =>
    this.op
      .habitacionesPorHotel(this.hotelId())
      .slice()
      .sort(
        (a, b) =>
          Number(b.prioridadLimpieza === "alta") -
          Number(a.prioridadLimpieza === "alta"),
      ),
  );
  readonly llegadas = computed(() =>
    this.op
      .llegadasHoy()
      .filter(
        (r) =>
          r.hotelId === this.hotelId() &&
          (this.nombre(r) + " " + r.codigo)
            .toLowerCase()
            .includes(this.busqueda().toLowerCase()),
      ),
  );
  readonly alojados = computed(() =>
    this.op.huespedesAlojados().filter((r) => r.hotelId === this.hotelId()),
  );
  readonly finalizadas = computed(() => this.op.reservas().filter(r => r.hotelId === this.hotelId() && r.estado === "finalizada"));
  readonly actual = computed(() => this.op.reservaPorId(this.seleccion()));
  readonly cola = computed(() =>
    this.op.cola().filter((o) => o.hotelId === this.hotelId()),
  );
  nombre(r: Reserva) {
    const h = this.op.huespedPorId(r.huespedesIds[0]);
    return h ? `${h.nombres} ${h.apellidos}` : "Huésped";
  }
  cambiarHotel(id: string) {
    this.hotelId.set(id);
    this.seleccion.set("");
    this.mensaje.set("");
    this.inspeccion.set("");
    this.reporte.set("");
  }
  seleccionar(r: Reserva) {
    this.seleccion.set(r.id);
    this.documento = r.registrosPrevios[0]?.numeroDocumento ?? "";
    this.verificado = false;
    this.evidencia = false;
    this.habitacion =
      this.op.habitacionesElegibles(r).find((h) => h.id === r.habitacionId)
        ?.id ?? "";
    this.mensaje.set("");
  }
  llave() {
    return {
      electronica: "Llave electrónica",
      magnetica: "Tarjeta magnética",
      mecanica: "Llave mecánica",
    }[hotelPorId(this.hotelId())!.llave];
  }
  estadoHabitacion(e: string) {
    return (
      {
        disponible: "Lista para recibir huéspedes",
        ocupada: "Ocupada",
        "pendiente-limpieza": "Por limpiar",
        "en-limpieza": "Limpieza en curso",
        "pendiente-inspeccion": "Requiere inspección",
        bloqueada: "Bloqueada por mantenimiento",
      } as Record<string, string>
    )[e];
  }
  checkin(r: Reserva) {
    this.mensaje.set(
      this.op.checkin(
        r.id,
        this.habitacion,
        this.documento,
        this.verificado,
        this.evidencia,
      ) || "Check-in completado. Llave entregada.",
    );
  }
  liberar(id: string) {
    if (
      this.limpia &&
      this.equipo &&
      this.operador() === "Supervisor de pisos"
    ) {
      this.op.limpiar(id, true);
      this.inspeccion.set("");
    }
  }
  async reconectar() {
    this.sincronizando.set(true);
    await new Promise((r) => setTimeout(r, 600));
    this.op.reconectar(this.hotelId());
    this.sincronizando.set(false);
    this.mensaje.set("Sincronización completada sin duplicar cargos.");
  }
}
