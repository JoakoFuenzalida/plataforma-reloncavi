import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Escena } from '../../shared/escena';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';

/** Recuperación de acceso del personal en tres pasos (25.2, Autenticación e incorporación). */
@Component({
  selector: 'app-recuperar',
  imports: [FormsModule, RouterLink, Icon, Logo, Escena],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './acceso.scss',
  template: `
    <aside class="lado-marca" aria-hidden="true">
      <app-escena tipo="fiordo" />
      <div class="texto-marca">
        <app-logo [claro]="true" [tam]="44" />
        <h2>Recupera tu acceso en minutos</h2>
        <p>Por seguridad, el código llega al correo corporativo registrado y la nueva contraseña debe cumplir la política de la cadena.</p>
      </div>
    </aside>

    <main class="lado-form">
      <div class="arriba"><a routerLink="/acceso" class="texto-sm"><app-icon nombre="arrow-left" [tam]="16" /> Volver a iniciar sesión</a></div>
      <div class="caja">
        <h1>Recuperar acceso</h1>
        <nav class="pasos" aria-label="Pasos de la recuperación" style="margin-bottom:24px">
          <ol>
            @for (t of titulos; track t; let i = $index) {
              <li [class.hecho]="i < paso()" [class.actual]="i === paso()" [attr.aria-current]="i === paso() ? 'step' : null">{{ i + 1 }}. {{ t }}</li>
            }
          </ol>
        </nav>

        @if (error()) {
          <div class="mensaje mensaje-error" role="alert" style="margin-bottom:16px"><app-icon nombre="circle-alert" /><p>{{ error() }}</p></div>
        }

        @switch (paso()) {
          @case (0) {
            <form (ngSubmit)="enviar()" novalidate>
              <div class="campo">
                <label for="rec-correo">Correo corporativo</label>
                <input id="rec-correo" class="control" type="email" name="correo" autocomplete="username" [(ngModel)]="correo" />
                <span class="ayuda">Si no tienes correo corporativo, pide a tu supervisora que restablezca tu PIN de terreno.</span>
              </div>
              <button type="submit" class="btn btn-primario btn-bloque">Enviar código</button>
            </form>
          }
          @case (1) {
            <form (ngSubmit)="validarCodigo()" novalidate>
              <p>Enviamos un código a <strong>{{ correo }}</strong>. Vence en 10 minutos.</p>
              <div class="campo">
                <label for="rec-codigo">Código</label>
                <input id="rec-codigo" class="control codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" name="codigo" [(ngModel)]="codigo" />
              </div>
              <p class="pista"><app-icon nombre="info" [tam]="16" />Código de demostración: <strong>205 117</strong></p>
              <button type="submit" class="btn btn-primario btn-bloque">Continuar</button>
            </form>
          }
          @case (2) {
            <form (ngSubmit)="guardar()" novalidate>
              <div class="campo">
                <label for="rec-nueva">Nueva contraseña</label>
                <input id="rec-nueva" class="control" type="password" name="nueva" autocomplete="new-password" [ngModel]="nueva()" (ngModelChange)="nueva.set($event)" aria-describedby="rec-reglas" />
              </div>
              <ul class="requisitos" id="rec-reglas" aria-live="polite">
                @for (r of reglas(); track r.texto) {
                  <li [class.ok]="r.ok"><app-icon [nombre]="r.ok ? 'check-circle-2' : 'x'" [tam]="16" />{{ r.texto }}<span class="sr-only">{{ r.ok ? ': cumple' : ': no cumple' }}</span></li>
                }
              </ul>
              <div class="campo">
                <label for="rec-repetir">Repite la contraseña</label>
                <input id="rec-repetir" class="control" type="password" name="repetir" autocomplete="new-password" [ngModel]="repetir()" (ngModelChange)="repetir.set($event)"
                  [class.invalido]="repetir() && repetir() !== nueva()" />
                @if (repetir() && repetir() !== nueva()) { <span class="error-campo"><app-icon nombre="circle-alert" [tam]="14" />Las contraseñas no coinciden.</span> }
              </div>
              <button type="submit" class="btn btn-primario btn-bloque">Guardar contraseña</button>
            </form>
          }
          @case (3) {
            <div class="exito-centro">
              <span class="circulo-exito"><app-icon nombre="check" [tam]="36" /></span>
              <h2>Contraseña actualizada</h2>
              <p class="texto-2">Cerramos las sesiones abiertas en otros dispositivos y registramos el cambio en la auditoría.</p>
              <a class="btn btn-primario" routerLink="/acceso">Iniciar sesión</a>
            </div>
          }
        }
      </div>
    </main>
  `,
})
export class Recuperar {
  protected readonly titulos = ['Correo', 'Código', 'Contraseña'];
  protected readonly paso = signal(0);
  protected readonly error = signal('');
  protected readonly nueva = signal('');
  protected readonly repetir = signal('');
  protected correo = 'camila.oyarzun@reloncavi.cl';
  protected codigo = '';

  protected readonly reglas = computed(() => {
    const v = this.nueva();
    return [
      { texto: 'Al menos 12 caracteres', ok: v.length >= 12 },
      { texto: 'Una mayúscula y una minúscula', ok: /[A-Z]/.test(v) && /[a-z]/.test(v) },
      { texto: 'Al menos un número', ok: /\d/.test(v) },
      { texto: 'No contiene tu nombre ni el de la empresa', ok: !!v && !/camila|oyarz|reloncav/i.test(v) },
    ];
  });

  protected enviar() {
    this.error.set('');
    if (!/^[^\s@]+@reloncavi\.cl$/i.test(this.correo.trim())) return this.error.set('Usa tu correo corporativo terminado en @reloncavi.cl.');
    this.paso.set(1);
  }
  protected validarCodigo() {
    this.error.set('');
    if (this.codigo.replace(/\s/g, '') !== '205117') return this.error.set('El código no es válido o ya venció. Revisa tu correo.');
    this.paso.set(2);
  }
  protected guardar() {
    this.error.set('');
    if (!this.reglas().every((r) => r.ok)) return this.error.set('La contraseña aún no cumple todos los requisitos.');
    if (this.nueva() !== this.repetir()) return this.error.set('Las contraseñas no coinciden.');
    this.paso.set(3);
  }
}
