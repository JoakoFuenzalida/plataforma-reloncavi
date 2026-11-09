import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DemoState, PERFILES, PerfilInfo } from '../core/demo-state';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

/** Perfiles cuyo recorrido ya está publicado en esta versión del prototipo. */
const PUBLICADOS = new Set(['huesped', 'recepcion', 'housekeeping']);

/**
 * Portada de acceso al prototipo: permite a la comisión evaluadora recorrer la solución
 * desde la perspectiva de cada perfil de usuario (BTT, numeral 25.1).
 */
@Component({
  selector: 'app-portada',
  imports: [Icon, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './portada.scss',
  template: `
    <a class="saltar-contenido" href="#perfiles">Saltar a la selección de perfil</a>
    <header class="cabecera">
      <div class="contenedor fila-entre">
        <app-logo [tam]="44" [claro]="true" />
        <span class="propuesta">
          Propuesta de
          <img src="marca/vora.png" alt="VORA" width="54" height="40" />
        </span>
      </div>
      <div class="contenedor intro">
        <p class="sobre">Licitación TFEP-01/2026 · Plataforma digital de misión crítica</p>
        <h1>Prototipo interactivo de la plataforma de Hoteles Reloncaví</h1>
        <p>
          Recorra la solución como la usará cada persona: el huésped que reserva desde el extranjero,
          la recepcionista del turno de noche, la camarera con su lista priorizada y la gerencia que
          necesita una sola cifra. Los datos son ficticios y la fecha de operación simulada es el
          <strong>jueves 18 de enero de 2029</strong>, en temporada alta, con la solución completa en producción.
        </p>
      </div>
    </header>

    <main id="perfiles" class="contenedor" tabindex="-1">
      <h2>Elija un perfil para comenzar</h2>
      <ul class="perfiles" role="list">
        @for (p of perfiles; track p.id) {
          <li>
            <button type="button" class="perfil tarjeta" (click)="entrar(p)">
              <span class="icono"><app-icon [nombre]="p.icono" [tam]="28" /></span>
              <span class="textos">
                <span class="nombre">{{ p.nombre }}</span>
                <span class="persona">{{ p.persona }} · {{ p.cargo }}</span>
                <span class="hotel"><app-icon nombre="map-pin" [tam]="14" />{{ p.hotel }}</span>
                <span class="desc">{{ p.descripcion }}</span>
              </span>
              <app-icon class="flecha" nombre="arrow-right" [tam]="22" />
            </button>
          </li>
        }
      </ul>

      <section class="tarjeta tarjeta-plana notas" aria-labelledby="t-notas">
        <h2 id="t-notas" class="h-chica">Cómo recorrer el prototipo</h2>
        <ul>
          <li><app-icon nombre="keyboard" [tam]="18" />Todo el prototipo se puede recorrer con el teclado: Tab, Mayús+Tab, Enter y Escape.</li>
          <li><app-icon nombre="smartphone" [tam]="18" />Las vistas del huésped y de terreno están diseñadas primero para el teléfono; pruebe a reducir el ancho de la ventana.</li>
          <li><app-icon nombre="languages" [tam]="18" />Las interfaces del huésped están disponibles en español e inglés y en cuatro monedas.</li>
          <li><app-icon nombre="info" [tam]="18" />Ninguna acción envía datos: la información ingresada se simula y no se conserva.</li>
        </ul>
      </section>
    </main>

    <footer class="contenedor pie texto-xs texto-2">
      Prototipo de alta fidelidad elaborado por VORA para Hoteles Reloncaví S.A. Datos ficticios.
    </footer>
  `,
})
export class Portada {
  private readonly router = inject(Router);
  private readonly estado = inject(DemoState);
  protected readonly perfiles = PERFILES.filter((p) => PUBLICADOS.has(p.id));

  entrar(p: PerfilInfo) {
    this.estado.perfil.set(p.id);
    this.router.navigateByUrl(p.ruta);
  }
}
