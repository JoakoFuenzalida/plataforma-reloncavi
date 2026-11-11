import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { OperacionState } from "../core/operacion-state";
import { Huesped, PersonaReserva, Reserva } from "../core/operacion.modelos";
import { hotelPorId } from "../core/hoteles";

@Component({
  selector: "app-directorio",
  imports: [FormsModule, RouterLink],
  styleUrl: "./operacion.scss",
  styles:
    ".detalle{overflow-wrap:anywhere}.historial{padding-left:20px}.historial li{margin-block:16px}",
  template: `<a class="saltar-contenido" href="#directorio"
      >Saltar al contenido</a
    >
    <header class="cabecera">
      <div class="contenedor fila-entre">
        <strong>Hoteles Reloncaví</strong
        ><span>Prototipo con datos ficticios · 18 ene 2029</span
        ><a routerLink="/">Cambiar perfil</a>
      </div>
    </header>
    <main id="directorio" tabindex="-1" class="contenedor pila cuerpo">
      <nav class="fila" aria-label="Operación">
        <a class="btn btn-secundario" routerLink="/personal/recepcion"
          >Recepción</a
        ><a class="btn btn-secundario" routerLink="/personal/tablero">Tablero</a
        ><a class="btn btn-secundario" routerLink="/personal/mantenimiento"
          >Mantenimiento</a
        >
      </nav>
      <div class="fila-entre">
        <div>
          <p class="texto-2">Personas de toda la cadena</p>
          <h1>Directorio de huéspedes</h1>
        </div>
        <button class="btn btn-primario" (click)="nueva()">Nueva ficha</button>
      </div>
      <div class="dos-columnas">
        <section class="pila" aria-label="Listado de personas">
          <label class="campo"
            >Buscar por nombre o correo<input
              class="control"
              [ngModel]="busqueda()"
              (ngModelChange)="busqueda.set($event)"
          /></label>
          <p>{{ personas().length }} ficha(s)</p>
          @for (h of personas(); track h.id) {
            <button
              class="tarjeta reserva"
              [attr.aria-pressed]="seleccion() === h.id"
              [class.activa]="seleccion() === h.id"
              (click)="abrir(h)"
            >
              <strong>{{ h.nombres }} {{ h.apellidos }}</strong
              ><span>{{ h.correo }}</span
              ><span
                >{{ op.reservasDePersona(h.id).length }} reserva(s)
                vinculadas</span
              >
            </button>
          } @empty {
            <p class="tarjeta">
              No hay personas que coincidan con la búsqueda.
            </p>
          }
        </section>
        <section class="tarjeta pila detalle" aria-label="Ficha de la persona">
          @if (editando()) {
            <h2>{{ seleccion() ? "Editar ficha" : "Nueva ficha" }}</h2>
            <form class="pila" (ngSubmit)="guardar()" novalidate>
              @for (c of campos; track c.id) {
                <label class="campo" [for]="'ficha-' + c.id">{{
                  c.label
                }}</label
                ><input
                  class="control"
                  [id]="'ficha-' + c.id"
                  [name]="c.id"
                  [type]="c.id === 'correo' ? 'email' : 'text'"
                  [(ngModel)]="edicion[c.id]"
                  [maxlength]="c.id === 'correo' ? 150 : 80"
                />
              }
              <label class="campo"
                >Idioma preferido<select
                  class="control"
                  name="idioma"
                  [(ngModel)]="edicion.idioma"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select></label
              ><label class="campo"
                >Preferencias<textarea
                  class="control"
                  name="preferencias"
                  [(ngModel)]="preferencias"
                  maxlength="300"
                ></textarea>
              </label>
              <p>
                Los cambios se reflejan en las reservas vinculadas a esta
                identidad.
              </p>
              <div class="fila">
                <button class="btn btn-primario">Guardar ficha</button
                ><button
                  class="btn btn-secundario"
                  type="button"
                  (click)="editando.set(false)"
                >
                  Cancelar edición
                </button>
              </div>
            </form>
          } @else if (actual(); as h) {
            <div class="fila-entre">
              <h2>{{ h.nombres }} {{ h.apellidos }}</h2>
              <button class="btn btn-secundario" (click)="editar(h)">
                Editar ficha
              </button>
            </div>
            <p>{{ h.correo }} · {{ h.telefono }}</p>
            <p>
              Nacionalidad: {{ h.nacionalidad || "Sin especificar" }} · Idioma:
              {{ h.idioma === "es" ? "Español" : "English" }}
            </p>
            <p>
              Preferencias:
              {{ h.preferencias.join(", ") || "Sin preferencias registradas" }}
            </p>
            @if (coincidencias().length) {
              <div class="mensaje mensaje-adv">
                <p>
                  Hay otras fichas con el mismo correo. No se fusionan
                  automáticamente: verifica la identidad antes de reutilizarlas.
                </p>
              </div>
              <ul>
                @for (otra of coincidencias(); track otra.id) {
                  <li>
                    <button class="btn btn-terciario" (click)="abrir(otra)">
                      {{ otra.nombres }} {{ otra.apellidos }}
                    </button>
                  </li>
                }
              </ul>
            }
            <h3>Historial en la cadena</h3>
            <details>
              <summary>Solicitar fusión de esta ficha</summary>
              <div class="pila">
                <p>Esta ficha se retirará del directorio. Se conservarán los datos de contacto, nacionalidad e idioma de la ficha elegida; las preferencias se combinarán y las reservas y registros previos se vincularán a ella. La solicitud requiere revisión de supervisión.</p>
                <label class="campo" for="fusion-destino">Ficha que se conservará
                  <select id="fusion-destino" class="control" [ngModel]="destinoId()" (ngModelChange)="destinoId.set($event)">
                    <option value="">Seleccionar ficha</option>
                    @for (otra of op.huespedes(); track otra.id) {
                      @if (otra.id !== h.id) { <option [value]="otra.id">{{ otra.nombres }} {{ otra.apellidos }} · {{ otra.correo }}</option> }
                    }
                  </select>
                </label>
                @if (op.huespedPorId(destinoId()); as destino) {
                  <p>Se conservará: {{ destino.nombres }} {{ destino.apellidos }} · {{ destino.correo }} · {{ destino.telefono }} · {{ destino.nacionalidad || 'Sin nacionalidad' }} · {{ destino.idioma }}.</p>
                  <p>Preferencias actuales: {{ destino.preferencias.join(', ') || 'Sin preferencias' }}.</p>
                }
                <label class="campo">Verificación de identidad<textarea class="control" [(ngModel)]="motivoFusion" maxlength="500"></textarea></label>
                <button class="btn btn-secundario" [disabled]="op.operadorDirectorio() !== 'recepcion'" (click)="solicitar()">Enviar a supervisión</button>
              </div>
            </details>
            <ol class="historial">
              @for (r of historial(); track r.id) {
                <li>
                  <strong>{{ r.codigo }}</strong> ·
                  {{ hotel(r.hotelId)?.nombre }}
                  <p>{{ r.llegada }} → {{ r.salida }} · {{ r.estado }}</p>
                  <p>Roles: {{ roles(r, h.id) }}</p>
                  <p>Registro previo: {{ registro(r, h.id) }}</p>
                  @if (
                    r.huespedesIds.includes(h.id) && r.estado === "confirmada"
                  ) {
                    <a
                      [routerLink]="['/registro', r.id]"
                      [queryParams]="{ huesped: h.id }"
                      >Abrir registro previo</a
                    >
                  }
                </li>
              } @empty {
                <li>Esta persona aún no tiene reservas vinculadas.</li>
              }
            </ol>
          } @else {
            <h2>Selecciona una persona</h2>
            <p>
              Consulta su ficha, preferencias y las reservas en las que
              participa como reservante, pagador o huésped.
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
      <section class="tarjeta pila" aria-labelledby="fusiones-titulo">
        <h2 id="fusiones-titulo">Fusión supervisada</h2>
        <label class="campo">Perfil de demostración del directorio
          <select class="control" [ngModel]="op.operadorDirectorio()" (ngModelChange)="op.operadorDirectorio.set($event)">
            <option value="recepcion">Recepción</option><option value="supervisor">Supervisión</option>
          </select>
        </label>
        <p>Simulación de separación de funciones. Las decisiones quedan en el historial durante esta sesión.</p>
        @for (f of op.fusiones(); track f.id) {
          <article class="tarjeta pila" style="overflow-wrap:anywhere">
            <h3>{{ f.origen.nombres }} {{ f.origen.apellidos }} → {{ f.destino.nombres }} {{ f.destino.apellidos }}</h3>
            <p>Estado: {{ f.estado }} · {{ f.fecha }} · Solicitada por {{ f.solicitadaPor }}</p>
            <p>Verificación: {{ f.motivo }}</p>
            <p>Ficha de origen: {{ f.origen.correo }} · {{ f.origen.telefono }} · {{ f.origen.nacionalidad }} · {{ f.origen.idioma }}. Preferencias: {{ f.origen.preferencias.join(', ') || 'Sin preferencias' }}.</p>
            <p>Datos que se conservarán: {{ f.destino.correo }} · {{ f.destino.telefono }} · {{ f.destino.nacionalidad }} · {{ f.destino.idioma }}. Preferencias: {{ f.destino.preferencias.join(', ') || 'Sin preferencias' }}.</p>
            @if (f.estado === 'pendiente' && op.operadorDirectorio() === 'supervisor') {
              <label class="fila"><input type="checkbox" [(ngModel)]="revisiones[f.id].identidad" />Verifiqué la identidad y los datos que se conservarán</label>
              <label class="campo">Fundamento de la decisión<textarea class="control" [(ngModel)]="revisiones[f.id].observacion" maxlength="500"></textarea></label>
              <div class="fila"><button class="btn btn-primario" (click)="revisar(f.id, true)">Aprobar fusión</button><button class="btn btn-secundario" (click)="revisar(f.id, false)">Rechazar solicitud</button></div>
            }
            @if (f.revisadaPor) { <p>{{ f.revisadaPor }}: {{ f.observacion }}</p> }
          </article>
        } @empty { <p>No hay solicitudes de fusión.</p> }
        @if (mensajeFusion()) { <p class="mensaje" [class.mensaje-error]="errorFusion()" [class.mensaje-exito]="!errorFusion()" [attr.role]="errorFusion() ? 'alert' : 'status'">{{ mensajeFusion() }}</p> }
      </section>
      <footer class="texto-sm texto-2">
        Plataforma operada por VORA · Fichas ficticias compartidas en memoria.
      </footer>
    </main>`,
})
export class Directorio {
  readonly op = inject(OperacionState);
  readonly ruta = inject(ActivatedRoute);
  readonly hotel = hotelPorId;
  readonly seleccion = signal(
    this.ruta.snapshot.queryParamMap.get("huesped") ?? "",
  );
  readonly busqueda = signal("");
  readonly editando = signal(false);
  readonly mensaje = signal("");
  readonly error = signal(false);
  readonly destinoId = signal('');
  readonly mensajeFusion = signal('');
  readonly errorFusion = signal(false);
  motivoFusion = '';
  revisiones: Record<string, {identidad: boolean; observacion: string}> = {};
  constructor() {
    for (const f of this.op.fusiones()) this.revisiones[f.id] = {identidad: false, observacion: ''};
  }
  solicitar() {
    const error = this.op.solicitarFusion(this.seleccion(), this.destinoId(), this.motivoFusion);
    for (const f of this.op.fusiones()) this.revisiones[f.id] ??= {identidad: false, observacion: ''};
    this.errorFusion.set(!!error);
    this.mensajeFusion.set(error || 'Solicitud enviada. Cambia a Supervisión para revisar.');
  }
  revisar(id: string, aprobar: boolean) {
    const revision = this.revisiones[id];
    const error = this.op.revisarFusion(id, aprobar, revision.identidad, revision.observacion);
    this.errorFusion.set(!!error);
    this.mensajeFusion.set(error || (aprobar ? 'Fusión aprobada. Reservas y registros vinculados a la ficha conservada.' : 'Solicitud rechazada. Las fichas se mantienen separadas.'));
    if (!error && aprobar) {
      this.seleccion.set(this.op.fusiones().find(f => f.id === id)!.destino.id);
      this.destinoId.set(''); this.motivoFusion = ''; this.busqueda.set('');
    }
  }
  readonly actual = computed(() => this.op.huespedPorId(this.seleccion()));
  readonly personas = computed(() =>
    this.op
      .huespedes()
      .filter((h) =>
        `${h.nombres} ${h.apellidos} ${h.correo}`
          .toLocaleLowerCase()
          .includes(this.busqueda().trim().toLocaleLowerCase()),
      )
      .slice()
      .sort((a, b) => a.apellidos.localeCompare(b.apellidos)),
  );
  readonly historial = computed(() =>
    this.op
      .reservasDePersona(this.seleccion())
      .slice()
      .sort((a, b) => b.llegada.localeCompare(a.llegada)),
  );
  readonly coincidencias = computed(() => {
    const h = this.actual();
    return h
      ? this.op
          .huespedes()
          .filter(
            (o) =>
              o.id !== h.id &&
              o.correo.trim().toLowerCase() === h.correo.trim().toLowerCase(),
          )
      : [];
  });
  readonly campos: {
    id: "nombres" | "apellidos" | "correo" | "telefono" | "nacionalidad";
    label: string;
  }[] = [
    { id: "nombres", label: "Nombres" },
    { id: "apellidos", label: "Apellidos" },
    { id: "correo", label: "Correo electrónico" },
    { id: "telefono", label: "Teléfono" },
    { id: "nacionalidad", label: "Nacionalidad" },
  ];
  edicion: PersonaReserva = this.vacia();
  preferencias = "";
  vacia(): PersonaReserva {
    return {
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
      nacionalidad: "",
      idioma: "es",
      preferencias: [],
    };
  }
  abrir(h: Huesped) {
    this.destinoId.set(''); this.motivoFusion = '';
    this.seleccion.set(h.id);
    this.editando.set(false);
    this.mensaje.set("");
  }
  nueva() {
    this.seleccion.set("");
    this.edicion = this.vacia();
    this.preferencias = "";
    this.mensaje.set("");
    this.editando.set(true);
  }
  editar(h: Huesped) {
    this.edicion = { ...h, preferencias: [...h.preferencias] };
    this.preferencias = h.preferencias.join(", ");
    this.editando.set(true);
    this.mensaje.set("");
  }
  guardar() {
    const result = this.op.guardarHuesped({
      ...this.edicion,
      preferencias: this.preferencias
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    });
    this.error.set(!!result.error);
    this.mensaje.set(
      result.error ||
        "Ficha guardada. Las reservas mantienen la misma identidad.",
    );
    if (!result.error) {
      this.seleccion.set(result.id);
      this.editando.set(false);
    }
  }
  roles(r: Reserva, id: string) {
    return [
      r.reservanteId === id ? "Reservante" : "",
      r.pagadorId === id ? "Pagador" : "",
      r.huespedesIds.includes(id) ? "Huésped" : "",
    ]
      .filter(Boolean)
      .join(", ");
  }
  registro(r: Reserva, id: string) {
    const p = r.registrosPrevios.find((p) => p.huespedId === id);
    return (
      p?.estado ??
      (r.huespedesIds.includes(id) ? "Sin enviar" : "No corresponde a este rol")
    );
  }
}
