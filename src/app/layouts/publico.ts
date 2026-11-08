import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DemoState, Idioma, Moneda } from '../core/demo-state';
import { TPipe } from '../core/i18n';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

/** Disposición del sitio público de Hoteles Reloncaví (RT-16.30). */
@Component({
  selector: 'app-publico',
  imports: [RouterOutlet, RouterLink, Logo, Icon, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './publico.scss',
  template: `
    <a class="saltar-contenido" href="#contenido">{{ estado.idioma() === 'es' ? 'Saltar al contenido' : 'Skip to content' }}</a>
    <header class="cabecera">
      <div class="contenedor barra">
        <a routerLink="/inicio" class="enlace-logo" aria-label="Hoteles Reloncaví, inicio">
          <app-logo [tam]="40" />
        </a>

        <nav class="nav-principal" [attr.aria-label]="estado.idioma() === 'es' ? 'Principal' : 'Main'">
          <ul>
            <li><a routerLink="/inicio" fragment="hoteles">{{ 'nav.hoteles' | t }}</a></li>
            <li><a routerLink="/inicio" fragment="ventajas">{{ 'nav.experiencias' | t }}</a></li>
            <li><a routerLink="/inicio" fragment="sostenibilidad">{{ 'nav.sostenibilidad' | t }}</a></li>
          </ul>
        </nav>

        <div class="preferencias">
          <label class="sr-only" for="sel-idioma">{{ 'nav.idioma' | t }}</label>
          <div class="selector">
            <app-icon nombre="languages" [tam]="18" />
            <select id="sel-idioma" [value]="estado.idioma()" (change)="idioma($any($event.target).value)">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <label class="sr-only" for="sel-moneda">{{ 'nav.moneda' | t }}</label>
          <div class="selector">
            <select id="sel-moneda" [value]="estado.moneda()" (change)="moneda($any($event.target).value)">
              <option value="CLP">CLP $</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="BRL">BRL R$</option>
            </select>
          </div>
          <button type="button" class="btn btn-icono menu-movil" [attr.aria-expanded]="menuAbierto()" aria-controls="menu-movil"
            (click)="menuAbierto.set(!menuAbierto())" [attr.aria-label]="'nav.menu' | t">
            <app-icon [nombre]="menuAbierto() ? 'x' : 'menu'" />
          </button>
        </div>
      </div>
      @if (menuAbierto()) {
        <nav id="menu-movil" class="panel-movil" [attr.aria-label]="'nav.menu' | t">
          <a routerLink="/inicio" fragment="hoteles" (click)="menuAbierto.set(false)">{{ 'nav.hoteles' | t }}</a>
          <a routerLink="/inicio" fragment="ventajas" (click)="menuAbierto.set(false)">{{ 'nav.experiencias' | t }}</a>
          <a routerLink="/inicio" fragment="sostenibilidad" (click)="menuAbierto.set(false)">{{ 'nav.sostenibilidad' | t }}</a>
          <div class="prefs-movil">
            <div class="campo">
              <label for="sel-idioma-m">{{ 'nav.idioma' | t }}</label>
              <select id="sel-idioma-m" class="control" [value]="estado.idioma()" (change)="idioma($any($event.target).value)">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div class="campo">
              <label for="sel-moneda-m">{{ 'nav.moneda' | t }}</label>
              <select id="sel-moneda-m" class="control" [value]="estado.moneda()" (change)="moneda($any($event.target).value)">
                <option value="CLP">CLP $</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="BRL">BRL R$</option>
              </select>
            </div>
          </div>
        </nav>
      }
    </header>

    <main id="contenido" tabindex="-1">
      <router-outlet />
    </main>

    <footer class="pie">
      <div class="contenedor pie-rejilla">
        <div class="pila">
          <app-logo [tam]="36" [claro]="true" />
          <p class="texto-sm">{{ 'pie.empresa' | t }}</p>
        </div>
        <div class="pila texto-sm">
          <strong>{{ 'pie.contacto' | t }}</strong>
          <span>+56 2 2940 1991</span>
          <span>reservas&#64;reloncavi.cl</span>
        </div>
        <div class="pila texto-sm">
          <span>{{ 'pie.terminos' | t }}</span>
          <span>{{ 'pie.privacidad' | t }}</span>
          <span>{{ 'pie.accesibilidad' | t }}</span>
        </div>
      </div>
      <div class="contenedor sello">
        <span>© 2029 Hoteles Reloncaví S.A.</span>
        <span class="vora">
          {{ estado.idioma() === 'es' ? 'Plataforma desarrollada y operada por' : 'Platform developed and operated by' }}
          <img src="marca/vora.png" alt="VORA" width="56" height="45" />
        </span>
      </div>
    </footer>
  `,
})
export class Publico {
  protected readonly estado = inject(DemoState);
  protected readonly menuAbierto = signal(false);

  idioma(i: Idioma) { this.estado.cambiarIdioma(i); }
  moneda(m: Moneda) { this.estado.cambiarMoneda(m); }
}
