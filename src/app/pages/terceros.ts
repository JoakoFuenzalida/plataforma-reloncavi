import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Tercero, TercerosState } from '../core/terceros-state';
import { HOTELES, hotelPorId } from '../core/hoteles';

@Component({
  selector: 'app-terceros',
  imports: [FormsModule, RouterLink],
  styleUrl: './operacion.scss',
  styles:
    '.detalle{overflow-wrap:anywhere}.comparacion{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}',
  template: `
    
    <div id="contenido-terceros" tabindex="-1" class="pila">
      
      <nav class="subnav" aria-label="Directorio">
        <a class="subnav-item" routerLink="/personal/huespedes">Huéspedes</a
        ><a
          class="subnav-item"
          routerLink="/personal/agencias"
          [attr.aria-current]="!empresas ? 'page' : null"
          >Agencias y turoperadores</a
        ><a
          class="subnav-item"
          routerLink="/personal/empresas"
          [attr.aria-current]="empresas ? 'page' : null"
          >Empresas con convenio</a
        >
      </nav>
      <div class="fila-entre">
        <h1>{{ empresas ? 'Empresas con convenio' : 'Agencias y turoperadores' }}</h1>
        <button class="btn btn-primario" (click)="nuevo()">Nuevo acuerdo</button>
      </div>
      <p>
        Acuerdos comerciales ficticios. Los cupos son límites por habitación y noche; no agregan
        inventario ni permiten sobreventa.
      </p>
      <div class="dos-columnas">
        <section class="pila" aria-label="Acuerdos comerciales">
          <label class="campo"
            >Buscar por nombre o contrato<input
              class="control"
              [ngModel]="busqueda()"
              (ngModelChange)="busqueda.set($event)"
          /></label>
          @for (t of lista(); track t.id) {
            <button
              class="tarjeta reserva"
              [class.activa]="seleccion() === t.id"
              [attr.aria-pressed]="seleccion() === t.id"
              (click)="abrir(t)"
            >
              <strong>{{ t.nombre }}</strong
              ><span>{{ t.contrato }} · {{ t.tipo }}</span
              ><span>{{ hotel(t.hotelId)?.nombre }}</span>
            </button>
          } @empty {
            <p>No hay acuerdos que coincidan con la búsqueda.</p>
          }
        </section>
        <section class="tarjeta pila detalle" aria-label="Detalle del acuerdo">
          @if (editando()) {
            <h2>{{ edicion.id ? 'Editar acuerdo' : 'Nuevo acuerdo' }}</h2>
            <form class="pila" (ngSubmit)="guardar()" novalidate>
              @if (!empresas) {
                <label class="campo" for="tercero-tipo">Tipo</label
                ><select id="tercero-tipo" name="tipo" class="control" [(ngModel)]="edicion.tipo">
                  <option value="agencia">Agencia</option>
                  <option value="turoperador">Turoperador</option>
                </select>
              }
              <label class="campo"
                >Nombre<input
                  class="control"
                  name="nombre"
                  [(ngModel)]="edicion.nombre"
                  maxlength="100"
              /></label>
              <label class="campo"
                >Correo de contacto<input
                  class="control"
                  name="correo"
                  type="email"
                  [(ngModel)]="edicion.correo"
                  maxlength="150"
              /></label>
              <label class="campo"
                >Código de contrato o convenio<input
                  class="control"
                  name="contrato"
                  [(ngModel)]="edicion.contrato"
                  maxlength="60"
              /></label>
              <label class="campo" for="tercero-hotel">Hotel del acuerdo</label
              ><select
                id="tercero-hotel"
                class="control"
                name="hotel"
                [ngModel]="edicion.hotelId"
                (ngModelChange)="cambiarHotel($event)"
              >
                @for (h of hoteles; track h.id) {
                  <option [value]="h.id">{{ h.nombre }}</option>
                }
              </select>
              <label class="campo" for="tercero-categoria">Categoría</label
              ><select
                id="tercero-categoria"
                class="control"
                name="categoria"
                [(ngModel)]="edicion.categoria"
              >
                @for (c of hotel(edicion.hotelId)?.tipos; track c.codigo) {
                  <option [value]="c.codigo">{{ c.nombre.es }}</option>
                }
              </select>
              <div class="comparacion">
                <label class="campo"
                  >Inicio de vigencia<input
                    class="control"
                    name="desde"
                    type="date"
                    [(ngModel)]="edicion.desde" /></label
                ><label class="campo"
                  >Última salida admitida<input
                    class="control"
                    name="hasta"
                    type="date"
                    [(ngModel)]="edicion.hasta"
                /></label>
              </div>
              <label class="campo"
                >Cupo por noche<input
                  class="control"
                  name="cupo"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  [(ngModel)]="edicion.cupo"
              /></label>
              @if (empresas) {
                <label class="campo"
                  >Tarifa negociada CLP por noche<input
                    class="control"
                    name="tarifa"
                    type="number"
                    min="1"
                    step="1"
                    [(ngModel)]="edicion.tarifa"
                /></label>
              } @else {
                <label class="campo"
                  >Comisión pactada (%)<input
                    class="control"
                    name="comision"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    [(ngModel)]="edicion.comision"
                /></label>
              }
              <label class="campo"
                >Condiciones<textarea
                  class="control"
                  name="condiciones"
                  maxlength="1000"
                  [(ngModel)]="edicion.condiciones"
                ></textarea>
              </label>
              <div class="fila">
                <button class="btn btn-primario">Guardar acuerdo</button
                ><button class="btn btn-secundario" type="button" (click)="editando.set(false)">
                  Cancelar edición
                </button>
              </div>
            </form>
          } @else if (actual(); as t) {
            <div class="fila-entre">
              <h2>{{ t.nombre }}</h2>
              <button
                class="btn btn-secundario"
                (click)="editar(t)"
                [disabled]="vinculos().length > 0"
              >
                Editar acuerdo
              </button>
            </div>
            <p>{{ t.contrato }} · {{ t.correo }} · {{ t.tipo }}</p>
            <p>
              {{ hotel(t.hotelId)?.nombre }} · {{ t.categoria }} · {{ t.desde }} → {{ t.hasta }}
            </p>
            <p>{{ t.condiciones }}</p>
            @if (t.tipo === 'empresa') {
              <p>Tarifa negociada: {{ clp(t.tarifa) }} por habitación/noche.</p>
            } @else {
              <p>Comisión pactada: {{ t.comision }} % del alojamiento.</p>
            }
            <p>
              Los acuerdos con reservas vinculadas conservan sus condiciones. Para modificarlas,
              crea un nuevo acuerdo.
            </p>
            <h3>Cupos comerciales</h3>
            <label class="campo"
              >Noche consultada<input
                class="control"
                type="date"
                [ngModel]="noche()"
                (ngModelChange)="noche.set($event)"
            /></label>
            @if (noche() >= t.desde && noche() < t.hasta) {
              <p>
                {{ comercial.uso(t.id, noche()) }} de {{ t.cupo }} habitaciones utilizadas.
                {{ libres() }} cupos restantes.
              </p>
              @if (comercial.uso(t.id, noche()) > t.cupo) {
                <p class="mensaje mensaje-adv">
                  El uso excede el cupo tras cambios de estadía. Revisa las reservas vinculadas.
                </p>
              }
            } @else {
              <p class="mensaje mensaje-adv">La noche consultada está fuera de vigencia.</p>
            }
            <h3>Vincular reserva existente</h3>
            <p>
              La vinculación registra el acuerdo para control comercial. Conserva el precio y el
              pago de la reserva; cualquier diferencia queda visible para revisión.
            </p>
            <label class="campo" for="reserva-comercial">Reserva</label
            ><select id="reserva-comercial" class="control" [(ngModel)]="reservaId">
              <option value="">Seleccionar reserva</option>
              @for (r of candidatas(); track r.id) {
                <option [value]="r.id">{{ r.codigo }} · {{ r.llegada }} → {{ r.salida }}</option>
              }
            </select>
            @if (!candidatas().length) {
              <p>No hay reservas elegibles sin acuerdo para este hotel, categoría y vigencia.</p>
            }
            @if (t.tipo !== 'empresa') {
              <label class="campo"
                >Comisión aplicada (%)<input
                  class="control"
                  type="number"
                  min="0"
                  max="100"
                  [(ngModel)]="aplicada"
              /></label>
            }
            <label class="campo"
              >Fundamento de vinculación<textarea
                class="control"
                maxlength="500"
                [(ngModel)]="motivo"
              ></textarea></label
            ><button class="btn btn-primario" (click)="vincular()">Vincular reserva</button>
            <h3>Evaluación e historial de reservas</h3>
            <p>
              {{ conformes() }} de {{ vinculos().length }} reservas sin diferencias de
              {{ t.tipo === 'empresa' ? 'tarifa' : 'comisión' }}. Las diferencias requieren revisión
              comercial.
            </p>
            @for (v of vinculos(); track v.reservaId) {
              <article class="tarjeta pila">
                <strong>{{ comercial.op.reservaPorId(v.reservaId)?.codigo }}</strong>
                <p>{{ comercial.op.reservaPorId(v.reservaId)?.estado }} · {{ v.fecha }}</p>
                @if (t.tipo === 'empresa') {
                  <p>
                    Pactada: {{ clp(v.acuerdo.tarifa) }} · Aplicada: {{ clp(v.tarifaAplicada) }} por
                    noche.
                  </p>
                  <p>Diferencia: {{ clp(comercial.diferencia(v)) }} por noche.</p>
                } @else {
                  <p>Pactada: {{ v.acuerdo.comision }} % · Aplicada: {{ v.aplicada }} %.</p>
                  <p>Diferencia: {{ comercial.diferencia(v) }} puntos porcentuales.</p>
                }
                <p [class.mensaje-adv]="comercial.diferencia(v) !== 0">
                  {{
                    comercial.diferencia(v) === 0 ? 'Conforme al acuerdo' : 'Diferencia por revisar'
                  }}
                </p>
                <p>{{ v.motivo }}</p>
              </article>
            } @empty {
              <p>Aún no hay reservas vinculadas a este acuerdo.</p>
            }
            <h3>Actividad del acuerdo</h3>
            <ul>
              @for (e of actividad(); track $index) {
                <li>{{ e.fecha }} · {{ e.detalle }}</li>
              } @empty {
                <li>Acuerdo ficticio inicial.</li>
              }
            </ul>
          } @else {
            <h2>Selecciona un acuerdo</h2>
            <p>
              Consulta las condiciones, los cupos por noche y el cumplimiento de tarifas o
              comisiones.
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
      
    </div>`,
})
export class Terceros {
  readonly comercial = inject(TercerosState);
  readonly empresas = inject(ActivatedRoute).snapshot.data['empresas'] === true;
  readonly hoteles = HOTELES;
  readonly hotel = hotelPorId;
  readonly seleccion = signal('');
  readonly busqueda = signal('');
  readonly editando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal(false);
  readonly noche = signal(this.comercial.op.fechaOperativa);
  readonly lista = computed(() =>
    this.comercial
      .terceros()
      .filter(
        (t) =>
          (t.tipo === 'empresa') === this.empresas &&
          `${t.nombre} ${t.contrato}`.toLowerCase().includes(this.busqueda().trim().toLowerCase()),
      ),
  );
  readonly actual = computed(() =>
    this.comercial.terceros().find((t) => t.id === this.seleccion()),
  );
  readonly vinculos = computed(() =>
    this.comercial.vinculos().filter((v) => v.terceroId === this.seleccion()),
  );
  readonly conformes = computed(
    () => this.vinculos().filter((v) => this.comercial.diferencia(v) === 0).length,
  );
  readonly actividad = computed(() =>
    this.comercial.historial().filter((e) => e.terceroId === this.seleccion()),
  );
  readonly libres = computed(() =>
    Math.max(0, (this.actual()?.cupo ?? 0) - this.comercial.uso(this.seleccion(), this.noche())),
  );
  readonly candidatas = computed(() => {
    const t = this.actual();
    return this.comercial.op
      .reservas()
      .filter(
        (r) =>
          t &&
          r.hotelId === t.hotelId &&
          r.tipoHabitacionCodigo === t.categoria &&
          r.llegada >= t.desde &&
          r.salida <= t.hasta &&
          ['confirmada', 'alojado'].includes(r.estado) &&
          !this.comercial.vinculos().some((v) => v.reservaId === r.id),
      );
  });
  edicion: Tercero = this.vacio();
  reservaId = '';
  aplicada = 0;
  motivo = '';
  vacio(): Tercero {
    return {
      id: '',
      tipo: this.empresas ? 'empresa' : 'agencia',
      nombre: '',
      correo: '',
      contrato: '',
      hotelId: 'puerto-montt',
      categoria: 'STD',
      desde: '2029-01-01',
      hasta: '2029-12-31',
      cupo: 1,
      comision: 0,
      tarifa: 0,
      condiciones: '',
    };
  }
  clp(n: number) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(n);
  }
  abrir(t: Tercero) {
    this.seleccion.set(t.id);
    this.editando.set(false);
    this.mensaje.set('');
    this.reservaId = '';
    this.motivo = '';
    this.aplicada = t.comision;
  }
  nuevo() {
    this.edicion = this.vacio();
    this.editando.set(true);
    this.mensaje.set('');
  }
  editar(t: Tercero) {
    this.edicion = { ...t };
    this.editando.set(true);
    this.mensaje.set('');
  }
  cambiarHotel(id: string) {
    this.edicion.hotelId = id;
    this.edicion.categoria = hotelPorId(id)?.tipos[0].codigo ?? '';
  }
  guardar() {
    const error = this.comercial.guardar(this.edicion);
    if (!error) {
      const t = this.comercial.terceros().find((t) => t.contrato === this.edicion.contrato.trim())!;
      this.abrir(t);
      this.busqueda.set('');
    }
    this.error.set(!!error);
    this.mensaje.set(error || 'Acuerdo guardado.');
  }
  vincular() {
    const error = this.comercial.vincular(
      this.seleccion(),
      this.reservaId,
      this.aplicada,
      this.motivo,
    );
    this.error.set(!!error);
    this.mensaje.set(
      error || 'Reserva vinculada. Revisa la comparación con las condiciones pactadas.',
    );
    if (!error) {
      this.reservaId = '';
      this.motivo = '';
    }
  }
}
