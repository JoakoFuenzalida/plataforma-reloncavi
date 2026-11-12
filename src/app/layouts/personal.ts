import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ItemMenu } from '../core/menu-personal';
import { filter, map } from 'rxjs';
import { DemoState } from '../core/demo-state';
import { itemPorRuta, menuPara, rutaActiva } from '../core/menu-personal';
import { OperacionState } from '../core/operacion-state';
import { Icon } from '../shared/icon';
import { Isotipo } from '../shared/logo';
import { RecorridoGuiado } from '../shared/recorrido-guiado';

/**
 * Disposición común de las vistas del personal: menú principal por perfil, rastro de navegación,
 * notificaciones y acceso al perfil (25.2, Portal principal; 25.4, Navegación).
 */
@Component({
  selector: 'app-personal',
  imports: [RouterOutlet, RouterLink, Icon, Isotipo, RecorridoGuiado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './personal.scss',
  host: { '(document:keydown.escape)': 'cerrarTodo()' },
  template: `
    <a class="saltar-contenido" href="#contenido-personal">Saltar al contenido</a>

    <header class="barra-superior">
      <button type="button" class="btn btn-icono solo-movil claro" (click)="menuMovil.set(!menuMovil())"
        [attr.aria-expanded]="menuMovil()" aria-controls="menu-personal" aria-label="Abrir menú principal">
        <app-icon [nombre]="menuMovil() ? 'x' : 'menu'" />
      </button>
      <a class="marca" routerLink="/personal/inicio" aria-label="Reloncaví Plataforma de operación, ir al inicio del turno">
        <app-isotipo [tam]="34" [invertido]="true" />
        <span class="marca-texto"><strong>Reloncaví</strong><span>Plataforma de operación</span></span>
      </a>

      <span class="fecha"><app-icon nombre="calendar-days" [tam]="16" />Jue 18 ene 2029 · temporada alta</span>

      <div class="acciones">
        <a class="btn btn-sm cambiar claro" routerLink="/"><app-icon nombre="users" [tam]="18" /><span class="cambiar-texto">Cambiar perfil</span></a>
        <div class="desplegable">
          <button type="button" class="btn btn-icono claro campana" (click)="alternar('avisos')"
            [attr.aria-expanded]="abierto() === 'avisos'" aria-controls="panel-avisos"
            [attr.aria-label]="'Notificaciones: ' + notificaciones().length + ' nuevas'">
            <app-icon nombre="bell" />
            @if (notificaciones().length) { <span class="contador" aria-hidden="true">{{ notificaciones().length }}</span> }
          </button>
          @if (abierto() === 'avisos') {
            <div id="panel-avisos" class="panel" role="region" aria-label="Notificaciones">
              <p class="panel-titulo">Notificaciones</p>
              @for (n of notificaciones(); track $index) {
                <div class="aviso-item"><app-icon [nombre]="n.icono" [tam]="18" /><span>{{ n.texto }}</span></div>
              } @empty {
                <p class="texto-sm texto-2">No hay notificaciones nuevas.</p>
              }
            </div>
          }
        </div>

        <div class="desplegable">
          <button type="button" class="perfil-boton" (click)="alternar('perfil')"
            [attr.aria-expanded]="abierto() === 'perfil'" aria-controls="panel-perfil">
            <span class="avatar" aria-hidden="true">{{ iniciales() }}</span>
            <span class="perfil-texto">
              <strong>{{ info()?.persona ?? 'Personal' }}</strong>
              <span>{{ info()?.cargo ?? 'Vista general' }}</span>
            </span>
            <app-icon nombre="chevron-down" [tam]="16" />
          </button>
          @if (abierto() === 'perfil') {
            <div id="panel-perfil" class="panel panel-perfil">
              <p class="texto-sm"><strong>{{ info()?.persona ?? 'Personal' }}</strong><br />
                <span class="texto-2">{{ info()?.hotel ?? 'Todos los hoteles' }}</span></p>
              <button type="button" class="item-panel" (click)="recorrido.set(true); cerrarTodo()"><app-icon nombre="circle-help" [tam]="18" />Ver recorrido guiado</button>
              <a class="item-panel" routerLink="/acceso" (click)="cerrarTodo()"><app-icon nombre="log-out" [tam]="18" />Cerrar sesión</a>
            </div>
          }
        </div>
      </div>
    </header>

    <div class="cuerpo-personal">
      @if (menuMovil()) { <div class="velo" (click)="menuMovil.set(false)" aria-hidden="true"></div> }
      <nav id="menu-personal" class="menu" [class.abierto]="menuMovil()" aria-label="Menú principal">
        @for (g of menu(); track g.titulo) {
          <p class="grupo">{{ g.titulo }}</p>
          <ul role="list">
            @for (i of g.items; track i.id) {
              <li>
                <a [routerLink]="i.ruta" [class.activo]="activa(i)" [attr.aria-current]="activa(i) ? 'page' : null" (click)="menuMovil.set(false)">
                  <app-icon [nombre]="i.icono" [tam]="20" />{{ i.etiqueta }}
                </a>
              </li>
            }
          </ul>
        }
        <p class="vora-menu">Plataforma operada por <img src="marca/vora.png" alt="VORA" width="44" height="36" /></p>
      </nav>

      <main id="contenido-personal" class="contenido" tabindex="-1">
        <nav class="rastro" aria-label="Ruta de navegación">
          <ol>
            <li><a routerLink="/personal/inicio">Inicio</a></li>
            @if (actual(); as a) {
              @if (a.item.id !== 'inicio') {
                <li aria-hidden="true"><app-icon nombre="chevron-right" [tam]="14" /></li>
                <li><span>{{ a.grupo }}</span></li>
                <li aria-hidden="true"><app-icon nombre="chevron-right" [tam]="14" /></li>
                @if (a.sub) {
                  <li><a [routerLink]="a.item.ruta">{{ a.item.etiqueta }}</a></li>
                  <li aria-hidden="true"><app-icon nombre="chevron-right" [tam]="14" /></li>
                  <li><span aria-current="page">{{ a.sub }}</span></li>
                } @else {
                  <li><span aria-current="page">{{ a.item.etiqueta }}</span></li>
                }
              }
            }
          </ol>
        </nav>
        <router-outlet />
        <footer class="pie-personal texto-xs texto-2">
          Hoteles Reloncaví S.A. · Prototipo con datos ficticios · Plataforma desarrollada y operada por VORA
        </footer>
      </main>
    </div>

    @if (recorrido()) { <app-recorrido-guiado [perfil]="estado.perfil()" (cerrar)="recorrido.set(false)" /> }
  `,
})
export class Personal {
  protected readonly estado = inject(DemoState);
  private readonly op = inject(OperacionState);
  private readonly router = inject(Router);

  protected readonly menuMovil = signal(false);
  protected readonly abierto = signal<'avisos' | 'perfil' | null>(null);
  protected readonly recorrido = this.estado.recorridoPendiente;

  protected readonly info = this.estado.perfilInfo;
  protected readonly menu = computed(() => menuPara(this.estado.perfil()));
  protected readonly iniciales = computed(() =>
    (this.info()?.persona ?? 'Personal Reloncaví').split(' ').map((p) => p[0]).slice(0, 2).join(''),
  );

  private readonly url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );
  protected readonly actual = computed(() => itemPorRuta(this.url()));

  protected readonly notificaciones = computed(() => {
    const lista = this.op.avisos().map((t) => ({ icono: 'check-circle-2', texto: t }));
    const pendientesLimpieza = this.op.habitaciones().filter((h) => h.estado === 'pendiente-limpieza').length;
    const ordenes = this.op.ordenes().filter((o) => o.estado === 'por-aprobar').length;
    if (pendientesLimpieza) lista.push({ icono: 'sparkles', texto: `${pendientesLimpieza} habitación(es) esperan limpieza.` });
    if (ordenes) lista.push({ icono: 'wrench', texto: `${ordenes} orden(es) de mantenimiento esperan aprobación.` });
    return lista;
  });

  protected activa(i: ItemMenu) {
    return rutaActiva(this.url(), i);
  }

  alternar(p: 'avisos' | 'perfil') {
    this.abierto.set(this.abierto() === p ? null : p);
  }

  cerrarTodo() {
    this.abierto.set(null);
    this.menuMovil.set(false);
  }
}
