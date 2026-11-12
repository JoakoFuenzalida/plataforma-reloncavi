import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DemoState, PERFILES, Perfil } from '../../core/demo-state';
import { OperacionState } from '../../core/operacion-state';
import { Escena } from '../../shared/escena';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { Avisos } from '../../shared/toast';

type Modo = 'corporativo' | 'terreno' | 'huesped';
type Paso = 'credenciales' | 'segundo-factor' | 'pin' | 'crear-pin' | 'codigo';

const CORPORATIVOS: { perfil: Perfil; correo: string }[] = [
  { perfil: 'recepcion', correo: 'camila.oyarzun@reloncavi.cl' },
  { perfil: 'gerencia-hotel', correo: 'andres.vidal@reloncavi.cl' },
  { perfil: 'comercial', correo: 'paula.riquelme@reloncavi.cl' },
];
const TERRENO: { perfil: Perfil; credencial: string }[] = [
  { perfil: 'housekeeping', credencial: '0472' },
  { perfil: 'mantenimiento', credencial: '0118' },
];

const CODIGO_DEMO = '482913';
const PIN_DEMO = '2468';
const CODIGO_HUESPED = '731905';

/**
 * Inicio de sesión unificado con tres modalidades según el perfil (Subdocumento 4, D28):
 * correo corporativo con segundo factor, credencial física con PIN corto en dispositivo
 * compartido, y correo con código de un solo uso para el huésped (25.2, Autenticación).
 */
@Component({
  selector: 'app-acceso',
  imports: [FormsModule, RouterLink, Icon, Logo, Escena],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './acceso.scss',
  template: `
    <aside class="lado-marca" aria-hidden="true">
      <app-escena tipo="lago" />
      <div class="texto-marca">
        <app-logo [claro]="true" [tam]="44" />
        <h2>Un solo acceso para toda la cadena</h2>
        <p>Nueve hoteles, una plataforma. Cada persona entra con el medio que corresponde a su puesto: correo corporativo, credencial en el dispositivo compartido o código al correo.</p>
      </div>
    </aside>

    <main class="lado-form" id="contenido-acceso">
      <div class="arriba">
        <a routerLink="/" class="texto-sm"><app-icon nombre="arrow-left" [tam]="16" /> Portada del prototipo</a>
        <div class="fila">
          <label class="sr-only" for="acc-idioma">Idioma</label>
          <select id="acc-idioma" class="control" style="min-width:120px" [value]="estado.idioma()" (change)="estado.cambiarIdioma($any($event.target).value)">
            <option value="es">Español</option><option value="en">English</option>
          </select>
        </div>
      </div>

      <div class="caja">
        <h1>{{ en() && modo() === 'huesped' ? 'Sign in' : 'Iniciar sesión' }}</h1>

        <div class="modos" role="tablist" aria-label="Tipo de acceso">
          <button type="button" role="tab" [attr.aria-selected]="modo() === 'corporativo'" aria-controls="panel-acceso" (click)="cambiarModo('corporativo')">Personal</button>
          <button type="button" role="tab" [attr.aria-selected]="modo() === 'terreno'" aria-controls="panel-acceso" (click)="cambiarModo('terreno')">Terreno</button>
          <button type="button" role="tab" [attr.aria-selected]="modo() === 'huesped'" aria-controls="panel-acceso" (click)="cambiarModo('huesped')">{{ en() ? 'Guest' : 'Huésped' }}</button>
        </div>

        <div id="panel-acceso" role="tabpanel">
          @if (error()) {
            <div class="mensaje mensaje-error" role="alert" style="margin-bottom:16px">
              <app-icon nombre="circle-alert" /><p>{{ error() }}</p>
            </div>
          }

          @switch (modo()) {
            @case ('corporativo') {
              @if (paso() === 'credenciales') {
                <form (ngSubmit)="ingresarCorporativo()" novalidate>
                  <div class="campo">
                    <label for="acc-como">Perfil de demostración</label>
                    <select id="acc-como" class="control" [(ngModel)]="perfilCorp" name="como" (ngModelChange)="prellenar()">
                      @for (c of corporativos; track c.perfil) { <option [value]="c.perfil">{{ nombrePerfil(c.perfil) }}</option> }
                    </select>
                    <span class="ayuda">Completa automáticamente el correo de la persona ficticia.</span>
                  </div>
                  <div class="campo">
                    <label for="acc-correo">Correo corporativo</label>
                    <input id="acc-correo" class="control" type="email" name="correo" autocomplete="username" [(ngModel)]="correo"
                      [class.invalido]="errorCorreo()" [attr.aria-invalid]="errorCorreo() ? 'true' : null" aria-describedby="acc-correo-err" />
                    @if (errorCorreo()) { <span class="error-campo" id="acc-correo-err"><app-icon nombre="circle-alert" [tam]="14" />{{ errorCorreo() }}</span> }
                  </div>
                  <div class="campo">
                    <label for="acc-clave">Contraseña</label>
                    <div class="contrasena">
                      <input id="acc-clave" class="control" [type]="verClave() ? 'text' : 'password'" name="clave" autocomplete="current-password" [(ngModel)]="clave" />
                      <button type="button" class="btn btn-icono" (click)="verClave.set(!verClave())" [attr.aria-label]="verClave() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="verClave()">
                        <app-icon [nombre]="verClave() ? 'eye-off' : 'eye'" />
                      </button>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primario btn-bloque" [disabled]="cargando()">
                    @if (cargando()) { Verificando… } @else { <app-icon nombre="log-in" [tam]="18" />Continuar }
                  </button>
                  <div class="enlaces"><a routerLink="/acceso/recuperar">¿Olvidaste tu contraseña?</a></div>
                </form>
              } @else {
                <form (ngSubmit)="verificarCodigo()" novalidate>
                  <div class="mensaje mensaje-info"><app-icon nombre="shield-check" /><div><strong>Segundo factor de autenticación</strong><p>Ingresa el código de 6 dígitos de tu aplicación de autenticación.</p></div></div>
                  <div class="campo">
                    <label for="acc-codigo">Código de verificación</label>
                    <input id="acc-codigo" class="control codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" name="codigo" [(ngModel)]="codigo" />
                  </div>
                  <p class="pista"><app-icon nombre="info" [tam]="16" />Código de demostración: <strong>482 913</strong></p>
                  <button type="submit" class="btn btn-primario btn-bloque">Verificar e ingresar</button>
                  <div class="enlaces">
                    <button type="button" class="btn btn-terciario btn-sm" (click)="volver()">Volver</button>
                    <span class="texto-2">Intentos restantes: {{ intentos() }}</span>
                  </div>
                </form>
              }
            }

            @case ('terreno') {
              @if (paso() === 'credenciales') {
                <div class="pila-form">
                  <div class="campo">
                    <label for="acc-terreno">Perfil de demostración</label>
                    <select id="acc-terreno" class="control" [(ngModel)]="perfilTerreno" name="terreno">
                      @for (c of terreno; track c.perfil) { <option [value]="c.perfil">{{ nombrePerfil(c.perfil) }}</option> }
                    </select>
                  </div>
                  <div class="credencial">
                    <app-icon nombre="id-card" [tam]="40" />
                    <div>
                      <strong>Acerca tu credencial al lector</strong>
                      <p class="texto-sm texto-2" style="margin:0">El dispositivo es compartido: cada persona entra con su credencial y un PIN de 4 dígitos.</p>
                    </div>
                  </div>
                  <button type="button" class="btn btn-primario btn-bloque" (click)="leerCredencial()" [disabled]="cargando()">
                    @if (cargando()) { Leyendo credencial… } @else { <app-icon nombre="scan-line" [tam]="18" />Simular lectura de credencial }
                  </button>
                  <label class="casilla"><input type="checkbox" [(ngModel)]="primerDia" name="primerDia" />Es mi primer día de temporada (activar credencial)</label>
                </div>
              } @else {
                <div class="pila-form">
                  <div class="mensaje mensaje-exito"><app-icon nombre="badge-check" /><div><strong>Credencial {{ credencial() }}</strong><p>{{ persona(perfilTerreno) }}</p></div></div>
                  <p class="negrita" id="pin-titulo" style="margin:0;text-align:center">
                    {{ paso() === 'crear-pin' ? (pinNuevo ? 'Repite tu nuevo PIN' : 'Crea tu PIN de 4 dígitos') : 'Ingresa tu PIN' }}
                  </p>
                  <div class="puntos-pin" role="img" [attr.aria-label]="pin().length + ' de 4 dígitos ingresados'">
                    @for (i of [0, 1, 2, 3]; track i) { <span [class.lleno]="pin().length > i"></span> }
                  </div>
                  <div class="teclado" role="group" aria-labelledby="pin-titulo">
                    @for (n of ['1','2','3','4','5','6','7','8','9']; track n) {
                      <button type="button" (click)="digito(n)" [attr.aria-label]="'Dígito ' + n">{{ n }}</button>
                    }
                    <button type="button" (click)="borrar()" aria-label="Borrar último dígito"><app-icon nombre="arrow-left" [tam]="24" /></button>
                    <button type="button" (click)="digito('0')" aria-label="Dígito 0">0</button>
                    <button type="button" (click)="volver()" aria-label="Cancelar"><app-icon nombre="x" [tam]="24" /></button>
                  </div>
                  @if (paso() === 'pin') { <p class="pista"><app-icon nombre="info" [tam]="16" />PIN de demostración: <strong>2468</strong></p> }
                </div>
              }
            }

            @case ('huesped') {
              @if (paso() === 'credenciales') {
                <form (ngSubmit)="enviarCodigoHuesped()" novalidate>
                  <div class="campo">
                    <label for="acc-hcorreo">{{ en() ? 'Email used for your booking' : 'Correo de tu reserva' }}</label>
                    <input id="acc-hcorreo" class="control" type="email" name="hcorreo" autocomplete="email" [(ngModel)]="correoHuesped" />
                    <span class="ayuda">{{ en() ? 'We will email you a one-time code. No password needed.' : 'Te enviaremos un código de un solo uso. No necesitas contraseña.' }}</span>
                  </div>
                  <button type="submit" class="btn btn-primario btn-bloque" [disabled]="cargando()">
                    @if (cargando()) { {{ en() ? 'Sending…' : 'Enviando…' }} } @else { <app-icon nombre="mail" [tam]="18" />{{ en() ? 'Email me a code' : 'Enviarme un código' }} }
                  </button>
                  <div class="enlaces">
                    <a routerLink="/cuenta/registro">{{ en() ? 'Create an account' : 'Crear una cuenta' }}</a>
                    <a routerLink="/inicio">{{ en() ? 'Back to the website' : 'Volver al sitio' }}</a>
                  </div>
                </form>
              } @else {
                <form (ngSubmit)="verificarHuesped()" novalidate>
                  <p>{{ en() ? 'We sent a 6-digit code to' : 'Enviamos un código de 6 dígitos a' }} <strong>{{ correoHuesped }}</strong>.</p>
                  <div class="campo">
                    <label for="acc-hcodigo">{{ en() ? 'Code' : 'Código' }}</label>
                    <input id="acc-hcodigo" class="control codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" name="hcodigo" [(ngModel)]="codigo" />
                  </div>
                  <p class="pista"><app-icon nombre="info" [tam]="16" />{{ en() ? 'Demo code:' : 'Código de demostración:' }} <strong>731 905</strong></p>
                  <button type="submit" class="btn btn-primario btn-bloque">{{ en() ? 'Sign in' : 'Ingresar' }}</button>
                  <div class="enlaces">
                    <button type="button" class="btn btn-terciario btn-sm" (click)="volver()">{{ en() ? 'Use another email' : 'Usar otro correo' }}</button>
                    <button type="button" class="btn btn-terciario btn-sm" [disabled]="espera() > 0" (click)="reenviar()">
                      {{ espera() > 0 ? (en() ? 'Resend in ' : 'Reenviar en ') + espera() + ' s' : (en() ? 'Resend code' : 'Reenviar código') }}
                    </button>
                  </div>
                </form>
              }
            }
          }
        </div>
      </div>
    </main>
  `,
})
export class Acceso {
  protected readonly estado = inject(DemoState);
  private readonly op = inject(OperacionState);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly avisos = inject(Avisos);
  private readonly destruir = inject(DestroyRef);

  protected readonly corporativos = CORPORATIVOS;
  protected readonly terreno = TERRENO;

  protected readonly modo = signal<Modo>('corporativo');
  protected readonly paso = signal<Paso>('credenciales');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly verClave = signal(false);
  protected readonly intentos = signal(3);
  protected readonly pin = signal('');
  protected readonly credencial = signal('');
  protected readonly espera = signal(0);
  protected readonly enviadoCorreo = signal(false);
  protected readonly en = computed(() => this.estado.idioma() === 'en');

  protected perfilCorp: Perfil = 'recepcion';
  protected perfilTerreno: Perfil = 'housekeeping';
  protected correo = CORPORATIVOS[0].correo;
  protected clave = 'Reloncavi-2029';
  protected codigo = '';
  protected primerDia = false;
  protected pinNuevo = '';
  protected correoHuesped = 'emily.carter@example.com';
  private temporizador: ReturnType<typeof setInterval> | null = null;

  protected errorCorreo() {
    return this.enviadoCorreo() && !/^[^\s@]+@reloncavi\.cl$/i.test(this.correo.trim()) ? 'Usa tu correo corporativo terminado en @reloncavi.cl.' : '';
  }

  constructor() {
    const q = this.ruta.snapshot.queryParamMap;
    const m = q.get('modo') as Modo | null;
    if (m === 'corporativo' || m === 'terreno' || m === 'huesped') this.modo.set(m);
    const p = q.get('perfil') as Perfil | null;
    if (p && CORPORATIVOS.some((c) => c.perfil === p)) { this.perfilCorp = p; this.prellenar(); this.modo.set('corporativo'); }
    if (p && TERRENO.some((c) => c.perfil === p)) { this.perfilTerreno = p; this.modo.set('terreno'); }
    this.destruir.onDestroy(() => this.temporizador && clearInterval(this.temporizador));
  }

  protected nombrePerfil(p: Perfil) {
    const i = PERFILES.find((x) => x.id === p)!;
    return `${i.nombre} · ${i.persona}`;
  }
  protected persona(p: Perfil) {
    const i = PERFILES.find((x) => x.id === p)!;
    return `${i.persona} · ${i.cargo} · ${i.hotel}`;
  }

  protected cambiarModo(m: Modo) {
    this.modo.set(m);
    this.volver();
  }
  protected volver() {
    this.paso.set('credenciales');
    this.error.set('');
    this.codigo = '';
    this.pin.set('');
    this.pinNuevo = '';
    this.intentos.set(3);
  }
  protected prellenar() {
    this.correo = CORPORATIVOS.find((c) => c.perfil === this.perfilCorp)!.correo;
  }

  private simular(fn: () => void, ms = 700) {
    this.cargando.set(true);
    setTimeout(() => { this.cargando.set(false); fn(); }, ms);
  }

  // --- Personal con correo corporativo y segundo factor ---
  protected ingresarCorporativo() {
    this.enviadoCorreo.set(true);
    this.error.set('');
    if (this.errorCorreo()) { document.getElementById('acc-correo')?.focus(); return; }
    if (!this.clave) { this.error.set('Ingresa tu contraseña.'); return; }
    this.simular(() => this.paso.set('segundo-factor'));
  }
  protected verificarCodigo() {
    if (this.codigo.replace(/\s/g, '') === CODIGO_DEMO) return this.entrar(this.perfilCorp);
    this.intentos.update((n) => n - 1);
    if (this.intentos() <= 0) {
      this.volver();
      this.error.set('Se agotaron los intentos. Por seguridad, vuelve a ingresar tu correo y contraseña.');
    } else {
      this.error.set('El código no coincide. Revisa tu aplicación de autenticación e inténtalo de nuevo.');
    }
  }

  // --- Terreno: credencial física y PIN ---
  protected leerCredencial() {
    this.error.set('');
    this.simular(() => {
      this.credencial.set(TERRENO.find((t) => t.perfil === this.perfilTerreno)!.credencial);
      this.paso.set(this.primerDia ? 'crear-pin' : 'pin');
    }, 900);
  }
  protected digito(n: string) {
    if (this.pin().length >= 4) return;
    this.pin.update((p) => p + n);
    if (this.pin().length === 4) setTimeout(() => this.completarPin(), 150);
  }
  protected borrar() {
    this.pin.update((p) => p.slice(0, -1));
  }
  private completarPin() {
    const pin = this.pin();
    if (this.paso() === 'crear-pin') {
      if (!this.pinNuevo) { this.pinNuevo = pin; this.pin.set(''); this.error.set(''); return; }
      if (pin !== this.pinNuevo) { this.pinNuevo = ''; this.pin.set(''); this.error.set('Los PIN no coinciden. Créalo de nuevo.'); return; }
      this.estado.recorridoPendiente.set(true);
      this.avisos.mostrar('exito', 'Credencial activada', 'Tu acceso vence automáticamente al término de tu contrato de temporada.');
      return this.entrar(this.perfilTerreno, false);
    }
    if (pin === PIN_DEMO) return this.entrar(this.perfilTerreno);
    this.pin.set('');
    this.error.set('PIN incorrecto. Si lo olvidaste, pide a tu supervisora que lo restablezca.');
  }

  // --- Huésped: correo y código de un solo uso ---
  protected enviarCodigoHuesped() {
    this.error.set('');
    const c = this.correoHuesped.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) { this.error.set(this.en() ? 'Enter a valid email address.' : 'Ingresa un correo válido.'); return; }
    if (!this.op.huespedes().some((h) => h.correo.toLowerCase() === c)) {
      this.error.set(this.en() ? 'We could not find an account with that email. You can create one.' : 'No encontramos una cuenta con ese correo. Puedes crear una.');
      return;
    }
    this.simular(() => { this.paso.set('codigo'); this.reenviar(); });
  }
  protected reenviar() {
    this.espera.set(30);
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = setInterval(() => {
      this.espera.update((s) => s - 1);
      if (this.espera() <= 0 && this.temporizador) clearInterval(this.temporizador);
    }, 1000);
  }
  protected verificarHuesped() {
    if (this.codigo.replace(/\s/g, '') !== CODIGO_HUESPED) {
      this.error.set(this.en() ? 'That code is not valid. Check your email and try again.' : 'El código no es válido. Revisa tu correo e inténtalo de nuevo.');
      return;
    }
    this.estado.sesionHuesped.set(this.correoHuesped.trim().toLowerCase());
    this.estado.elegirPerfil('huesped');
    this.router.navigateByUrl('/cuenta');
  }

  private entrar(p: Perfil, aviso = true) {
    this.estado.elegirPerfil(p);
    if (aviso) this.avisos.mostrar('exito', 'Sesión iniciada', PERFILES.find((x) => x.id === p)!.persona);
    this.router.navigateByUrl('/personal/inicio');
  }
}
