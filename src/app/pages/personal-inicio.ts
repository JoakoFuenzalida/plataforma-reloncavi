import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoState, Perfil } from '../core/demo-state';
import { menuPara } from '../core/menu-personal';
import { OperacionState } from '../core/operacion-state';
import { Avisos } from '../shared/toast';
import { Icon } from '../shared/icon';

type IdTarjeta = 'tareas' | 'llegadas' | 'habitaciones' | 'ordenes' | 'enlace' | 'huespedes' | 'accesos';

const TITULOS: Record<IdTarjeta, string> = {
  tareas: 'Tareas del turno',
  llegadas: 'Llegadas de hoy',
  habitaciones: 'Estado de habitaciones',
  ordenes: 'Órdenes de mantenimiento',
  enlace: 'Enlace de los hoteles',
  huespedes: 'Huéspedes',
  accesos: 'Accesos rápidos',
};

/** Tarjetas iniciales según el cargo. Cada perfil puede reordenarlas u ocultarlas. */
const POR_PERFIL: Record<Perfil, IdTarjeta[]> = {
  huesped: ['accesos'],
  recepcion: ['tareas', 'llegadas', 'habitaciones', 'enlace', 'huespedes', 'accesos'],
  housekeeping: ['tareas', 'habitaciones', 'accesos'],
  mantenimiento: ['tareas', 'ordenes', 'habitaciones', 'accesos'],
  'gerencia-hotel': ['llegadas', 'habitaciones', 'ordenes', 'enlace', 'tareas', 'accesos'],
  comercial: ['huespedes', 'llegadas', 'tareas', 'accesos'],
  administracion: ['tareas', 'enlace', 'accesos'],
};

const TAREAS: Record<Perfil, string[]> = {
  huesped: [],
  recepcion: ['Revisar registros previos de las llegadas de la tarde', 'Confirmar llegada del grupo del bus de las 18:40', 'Cuadrar caja del turno antes de las 23:00'],
  housekeeping: ['Empezar por las habitaciones marcadas con prioridad alta', 'Reportar con foto cualquier falla que encuentres', 'Avisar al terminar cada habitación'],
  mantenimiento: ['Atender las órdenes con habitación bloqueada', 'Registrar el trabajo realizado antes de enviar a revisión', 'Revisar el generador del ala norte (preventivo)'],
  'gerencia-hotel': ['Revisar órdenes que esperan aprobación', 'Validar la ocupación proyectada del fin de semana', 'Aprobar turnos de temporada de febrero'],
  comercial: ['Revisar diferencias de comisión de agencias', 'Actualizar condiciones de convenios que vencen en febrero', 'Preparar el informe de canales del mes'],
  administracion: ['Procesar altas del personal de temporada de febrero', 'Revisar solicitudes de cambio con aprobación dual', 'Revisar la auditoría de accesos de la semana'],
};

/** Inicio con sesión personalizado por perfil, con tarjetas configurables (25.2, Portal principal). */
@Component({
  selector: 'app-personal-inicio',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .cabeza { align-items: flex-end; margin-bottom: var(--s-4); }
    .cabeza p { margin: 0; }
    .tablero { display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); list-style: none; margin: 0; padding: 0; }
    .tarjeta { display: flex; flex-direction: column; gap: var(--s-3); height: 100%; }
    .tarjeta h2 { font-size: var(--t-lg); margin: 0; }
    .cifra { font-family: var(--f-titulo); font-size: var(--t-3xl); color: var(--c-fiordo); line-height: 1; }
    .cifras { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-2); }
    .cifras div { display: flex; flex-direction: column; gap: 2px; padding: var(--s-2); background: var(--c-niebla); border-radius: var(--r-sm); }
    .cifras strong { font-size: var(--t-xl); color: var(--c-fiordo); }
    .lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-1); }
    .lista li { display: flex; align-items: center; gap: var(--s-2); justify-content: space-between; padding: var(--s-1) 0; border-bottom: 1px solid var(--c-borde); font-size: var(--t-sm); }
    .lista li:last-child { border-bottom: 0; }
    .accesos a { display: flex; align-items: center; gap: var(--s-2); min-height: 44px; padding: 0 var(--s-3); border-radius: var(--r-md); border: 1px solid var(--c-borde); text-decoration: none; font-weight: 600; }
    .accesos a:hover { background: var(--c-fiordo-50); }
    .edicion { display: flex; gap: var(--s-1); align-items: center; padding-top: var(--s-2); border-top: 1px dashed var(--c-borde-fuerte); }
    .personalizando .tarjeta { border-style: dashed; border-color: var(--c-fiordo); }
    .ocultas { margin-top: var(--s-4); }
    .mas { margin-top: auto; }
    .hecha { text-decoration: line-through; color: var(--c-texto-2); }
  `,
  template: `
    <div class="fila-entre cabeza">
      <div>
        <p class="texto-2">{{ info()?.hotel ?? 'Todos los hoteles' }} · jueves 18 de enero de 2029</p>
        <h1>{{ saludo() }}</h1>
      </div>
      <div class="fila">
        @if (personalizando()) {
          <button type="button" class="btn btn-terciario" (click)="restablecer()">Restablecer</button>
          <button type="button" class="btn btn-primario" (click)="terminar()"><app-icon nombre="check" [tam]="18" />Listo</button>
        } @else {
          <button type="button" class="btn btn-secundario" (click)="personalizando.set(true)" [attr.aria-pressed]="personalizando()">
            <app-icon nombre="settings" [tam]="18" />Personalizar inicio
          </button>
        }
      </div>
    </div>

    @if (personalizando()) {
      <div class="mensaje mensaje-info" role="status">
        <app-icon nombre="info" />
        <p>Mueve las tarjetas con las flechas u ocúltalas. El orden se guarda para tu perfil en este navegador.</p>
      </div>
      <br />
    }

    <ul class="tablero" [class.personalizando]="personalizando()" role="list">
      @for (id of visibles(); track id; let i = $index, ultimo = $last, primero = $first) {
        <li>
          <section class="tarjeta" [attr.aria-labelledby]="'t-' + id">
            <div class="fila-entre">
              <h2 [id]="'t-' + id">{{ titulos[id] }}</h2>
            </div>

            @switch (id) {
              @case ('tareas') {
                <ul class="lista" role="list">
                  @for (t of tareas(); track t) {
                    <li>
                      <label class="casilla">
                        <input type="checkbox" [checked]="hechas().has(t)" (change)="marcar(t)" />
                        <span [class.hecha]="hechas().has(t)">{{ t }}</span>
                      </label>
                    </li>
                  }
                </ul>
                <p class="texto-xs texto-2">{{ hechas().size }} de {{ tareas().length }} completadas</p>
              }
              @case ('llegadas') {
                <span class="cifra">{{ op.llegadasHoy().length }}</span>
                <p class="texto-sm texto-2">llegadas confirmadas para hoy · {{ conRegistro() }} con registro previo enviado</p>
                <a class="btn btn-secundario btn-sm mas" routerLink="/personal/recepcion">Ir a recepción</a>
              }
              @case ('habitaciones') {
                <div class="cifras">
                  <div><strong>{{ cuenta('disponible') }}</strong><span class="texto-xs">listas</span></div>
                  <div><strong>{{ cuenta('pendiente-limpieza') + cuenta('en-limpieza') }}</strong><span class="texto-xs">en limpieza</span></div>
                  <div><strong>{{ cuenta('bloqueada') }}</strong><span class="texto-xs">bloqueadas</span></div>
                </div>
                <a class="btn btn-secundario btn-sm mas" routerLink="/terreno">Ver habitaciones</a>
              }
              @case ('ordenes') {
                <div class="cifras">
                  <div><strong>{{ ordenes('reportada') }}</strong><span class="texto-xs">nuevas</span></div>
                  <div><strong>{{ ordenes('en-curso') }}</strong><span class="texto-xs">en curso</span></div>
                  <div><strong>{{ ordenes('por-aprobar') }}</strong><span class="texto-xs">por aprobar</span></div>
                </div>
                <a class="btn btn-secundario btn-sm mas" routerLink="/personal/mantenimiento">Ir a mantenimiento</a>
              }
              @case ('enlace') {
                <ul class="lista" role="list">
                  @for (h of hotelesEnlace; track h.id) {
                    <li>
                      <span>{{ h.nombre }}</span>
                      @if (op.sinEnlace(h.id)) { <span class="distintivo distintivo-adv"><app-icon nombre="wifi-off" [tam]="14" />Sin enlace</span> }
                      @else { <span class="distintivo distintivo-exito"><app-icon nombre="wifi" [tam]="14" />Conectado</span> }
                    </li>
                  }
                </ul>
              }
              @case ('huespedes') {
                <span class="cifra">{{ op.huespedes().length }}</span>
                <p class="texto-sm texto-2">fichas en el padrón único · {{ op.huespedesAlojados().length }} alojados hoy</p>
                <a class="btn btn-secundario btn-sm mas" routerLink="/personal/huespedes">Abrir directorio</a>
              }
              @case ('accesos') {
                <div class="pila accesos">
                  @for (a of accesos(); track a.id) {
                    <a [routerLink]="a.ruta"><app-icon [nombre]="a.icono" [tam]="18" />{{ a.etiqueta }}</a>
                  }
                </div>
              }
            }

            @if (personalizando()) {
              <div class="edicion">
                <button type="button" class="btn btn-icono" [disabled]="primero" (click)="mover(i, -1)" [attr.aria-label]="'Subir ' + titulos[id]"><app-icon nombre="arrow-left" /></button>
                <button type="button" class="btn btn-icono" [disabled]="ultimo" (click)="mover(i, 1)" [attr.aria-label]="'Bajar ' + titulos[id]"><app-icon nombre="arrow-right" /></button>
                <button type="button" class="btn btn-terciario btn-sm" (click)="ocultar(id)"><app-icon nombre="eye-off" [tam]="16" />Ocultar</button>
              </div>
            }
          </section>
        </li>
      }
    </ul>

    @if (personalizando() && ocultas().length) {
      <section class="tarjeta tarjeta-plana ocultas" aria-labelledby="t-ocultas">
        <h2 id="t-ocultas" class="texto-sm">Tarjetas ocultas</h2>
        <div class="fila">
          @for (id of ocultas(); track id) {
            <button type="button" class="btn btn-secundario btn-sm" (click)="mostrar(id)"><app-icon nombre="eye" [tam]="16" />{{ titulos[id] }}</button>
          }
        </div>
      </section>
    }
  `,
})
export class PersonalInicio {
  protected readonly op = inject(OperacionState);
  private readonly estado = inject(DemoState);
  private readonly avisos = inject(Avisos);

  protected readonly titulos = TITULOS;
  protected readonly info = this.estado.perfilInfo;
  private readonly perfil = computed<Perfil>(() => this.estado.perfil() ?? 'gerencia-hotel');

  protected readonly personalizando = signal(false);
  protected readonly orden = signal<IdTarjeta[]>([]);
  protected readonly escondidas = signal<Set<IdTarjeta>>(new Set());
  protected readonly hechas = signal<Set<string>>(new Set());

  protected readonly visibles = computed(() => this.orden().filter((id) => !this.escondidas().has(id)));
  protected readonly ocultas = computed(() => this.orden().filter((id) => this.escondidas().has(id)));
  protected readonly tareas = computed(() => TAREAS[this.perfil()]);
  protected readonly accesos = computed(() => menuPara(this.perfil()).flatMap((g) => g.items).filter((i) => i.id !== 'inicio'));
  protected readonly hotelesEnlace = [
    { id: 'puerto-montt', nombre: 'Puerto Montt' },
    { id: 'lodge-cochamo', nombre: 'Lodge Cochamó' },
    { id: 'lodge-aysen', nombre: 'Lodge Aysén' },
    { id: 'lodge-torres-del-paine', nombre: 'Lodge Torres del Paine' },
  ];

  protected readonly saludo = computed(() => {
    const nombre = this.info()?.persona.split(' ')[0];
    return nombre ? `Buenos días, ${nombre}` : 'Inicio del turno';
  });
  protected readonly conRegistro = computed(
    () => this.op.llegadasHoy().filter((r) => r.registrosPrevios.some((x) => x.estado !== 'borrador')).length,
  );

  constructor() {
    effect(() => {
      const p = this.perfil();
      let orden = POR_PERFIL[p];
      let ocultas: IdTarjeta[] = [];
      try {
        const g = JSON.parse(localStorage.getItem('rel-inicio-' + p) ?? 'null');
        if (g && Array.isArray(g.orden)) { orden = g.orden; ocultas = g.ocultas ?? []; }
      } catch { /* sin almacenamiento: se usa el orden por omisión */ }
      this.orden.set(orden);
      this.escondidas.set(new Set(ocultas));
    });
  }

  protected cuenta(estado: string) {
    return this.op.habitaciones().filter((h) => h.estado === estado).length;
  }
  protected ordenes(estado: string) {
    return this.op.ordenes().filter((o) => o.estado === estado).length;
  }
  protected marcar(t: string) {
    const s = new Set(this.hechas());
    s.has(t) ? s.delete(t) : s.add(t);
    this.hechas.set(s);
  }
  protected mover(i: number, d: number) {
    const v = this.visibles();
    const a = v[i], b = v[i + d];
    const o = [...this.orden()];
    const ia = o.indexOf(a), ib = o.indexOf(b);
    [o[ia], o[ib]] = [o[ib], o[ia]];
    this.orden.set(o);
  }
  protected ocultar(id: IdTarjeta) {
    this.escondidas.set(new Set([...this.escondidas(), id]));
  }
  protected mostrar(id: IdTarjeta) {
    const s = new Set(this.escondidas());
    s.delete(id);
    this.escondidas.set(s);
  }
  protected restablecer() {
    this.orden.set(POR_PERFIL[this.perfil()]);
    this.escondidas.set(new Set());
  }
  protected terminar() {
    try {
      localStorage.setItem('rel-inicio-' + this.perfil(), JSON.stringify({ orden: this.orden(), ocultas: [...this.escondidas()] }));
    } catch { /* sin almacenamiento */ }
    this.personalizando.set(false);
    this.avisos.mostrar('exito', 'Inicio personalizado', 'El nuevo orden de tarjetas quedó guardado para tu perfil.');
  }
}
