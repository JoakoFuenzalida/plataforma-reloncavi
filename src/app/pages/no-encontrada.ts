import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `:host { display:flex; min-height:100vh; align-items:center; justify-content:center; padding: var(--s-5); }
    .tarjeta { max-width: 520px; text-align:center; display:flex; flex-direction:column; align-items:center; gap: var(--s-3); }`,
  template: `
    <main class="tarjeta">
      <app-logo />
      <h1>No encontramos esta página</h1>
      <p class="texto-2">La dirección no existe o cambió. Puede volver al inicio y continuar desde ahí.</p>
      <div class="fila">
        <a class="btn btn-primario" routerLink="/">Ir a la portada del prototipo</a>
        <a class="btn btn-secundario" routerLink="/inicio">Ir al sitio de Reloncaví</a>
      </div>
    </main>
  `,
})
export class NoEncontrada {}
