import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DemoState } from '../../core/demo-state';
import { OperacionState } from '../../core/operacion-state';
import { Icon } from '../../shared/icon';

const PAISES = ['Alemania', 'Argentina', 'Australia', 'Brasil', 'Canadá', 'Chile', 'China', 'Colombia', 'España', 'Estados Unidos', 'Francia', 'Israel', 'Italia', 'Japón', 'México', 'Países Bajos', 'Perú', 'Reino Unido', 'Suiza', 'Uruguay'];
const PREFERENCIAS = [
  { es: 'Piso alto', en: 'High floor' },
  { es: 'Cama king', en: 'King bed' },
  { es: 'Almohada hipoalergénica', en: 'Hypoallergenic pillow' },
  { es: 'Alimentación sin gluten', en: 'Gluten-free meals' },
  { es: 'Alimentación vegetariana', en: 'Vegetarian meals' },
  { es: 'Habitación accesible', en: 'Accessible room' },
];

/**
 * Registro de una nueva persona usuaria externa en cinco pasos (25.2, Autenticación e incorporación).
 * Al terminar, la ficha queda en el padrón único de huéspedes.
 */
@Component({
  selector: 'app-registro-cuenta',
  imports: [FormsModule, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding-top: var(--s-5); }
    .caja { max-width: 720px; margin: 0 auto; }
    .pasos { margin: var(--s-4) 0 var(--s-5); }
    form { display: flex; flex-direction: column; gap: var(--s-4); }
    .dos { display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); }
    .opciones { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); border: 0; padding: 0; margin: 0; }
    .opciones legend { font-size: var(--t-sm); font-weight: 600; margin-bottom: var(--s-2); }
    .zona { display: flex; flex-direction: column; align-items: center; gap: var(--s-2); padding: var(--s-5); border: 2px dashed var(--c-borde-fuerte); border-radius: var(--r-lg); background: var(--c-niebla); text-align: center; cursor: pointer; }
    .zona.encima { border-color: var(--c-fiordo); background: var(--c-fiordo-50); }
    .zona input { position: absolute; width: 1px; height: 1px; opacity: 0; }
    .zona:focus-within { box-shadow: var(--foco); }
    .acciones { display: flex; justify-content: space-between; gap: var(--s-3); flex-wrap: wrap; }
    .resumen dt { font-size: var(--t-xs); color: var(--c-texto-2); }
    .resumen dd { margin: 0 0 var(--s-2); font-weight: 600; }
    .exito { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--s-3); }
    .circulo { display: inline-grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: var(--c-exito-fondo); color: var(--c-exito); }
  `,
  template: `
    <div class="contenedor caja">
      <nav class="rastro" [attr.aria-label]="L('Ruta de navegación', 'Breadcrumb')">
        <ol>
          <li><a routerLink="/inicio">{{ L('Inicio', 'Home') }}</a></li>
          <li aria-hidden="true"><app-icon nombre="chevron-right" [tam]="14" /></li>
          <li><span aria-current="page">{{ L('Crear cuenta', 'Create account') }}</span></li>
        </ol>
      </nav>

      @if (paso() < 5) {
        <h1>{{ L('Crea tu cuenta Reloncaví', 'Create your Reloncaví account') }}</h1>
        <p class="texto-2">{{ L('Con tu cuenta ves tus reservas, completas el registro antes de llegar y recibes tu Folio Verde.', 'With an account you can see your bookings, pre-register before arriving and receive your Green Folio.') }}</p>

        <nav class="pasos" [attr.aria-label]="L('Pasos del registro', 'Sign-up steps')">
          <ol>
            @for (t of titulos(); track $index; let i = $index) {
              <li [class.hecho]="i < paso()" [class.actual]="i === paso()" [attr.aria-current]="i === paso() ? 'step' : null">{{ i + 1 }}. {{ t }}</li>
            }
          </ol>
        </nav>

        <div class="tarjeta">
          @if (errores().length) {
            <div class="mensaje mensaje-error" role="alert" style="margin-bottom:16px">
              <app-icon nombre="circle-alert" />
              <div><strong>{{ L('Revisa estos datos', 'Please check') }}</strong>
                <p>@for (e of errores(); track e) { {{ e }}<br /> }</p></div>
            </div>
          }

          <form (ngSubmit)="siguiente()" novalidate>
            @switch (paso()) {
              @case (0) {
                <h2>{{ titulos()[0] }}</h2>
                <div class="dos">
                  <div class="campo"><label for="rc-nombres">{{ L('Nombres', 'First name(s)') }}</label>
                    <input id="rc-nombres" class="control" name="nombres" autocomplete="given-name" [(ngModel)]="f.nombres" /></div>
                  <div class="campo"><label for="rc-apellidos">{{ L('Apellidos', 'Last name(s)') }}</label>
                    <input id="rc-apellidos" class="control" name="apellidos" autocomplete="family-name" [(ngModel)]="f.apellidos" /></div>
                  <div class="campo"><label for="rc-correo">{{ L('Correo electrónico', 'Email') }}</label>
                    <input id="rc-correo" class="control" type="email" name="correo" autocomplete="email" [(ngModel)]="f.correo"
                      [class.invalido]="tocado() && !correoOk()" [class.valido]="correoOk()" /></div>
                  <div class="campo"><label for="rc-telefono">{{ L('Teléfono móvil', 'Mobile phone') }}</label>
                    <input id="rc-telefono" class="control" type="tel" name="telefono" autocomplete="tel" placeholder="+56 9 1234 5678" [(ngModel)]="f.telefono" /></div>
                  <div class="campo"><label for="rc-pais">{{ L('País de residencia', 'Country of residence') }}</label>
                    <input id="rc-pais" class="control" name="pais" list="rc-paises" autocomplete="country-name" [(ngModel)]="f.pais" />
                    <datalist id="rc-paises">@for (p of paises; track p) { <option [value]="p"></option> }</datalist>
                    <span class="ayuda">{{ L('Escribe para ver sugerencias.', 'Start typing to see suggestions.') }}</span></div>
                </div>
              }
              @case (1) {
                <h2>{{ titulos()[1] }}</h2>
                <fieldset class="opciones">
                  <legend>{{ L('Tipo de documento', 'Document type') }}</legend>
                  <label class="casilla"><input type="radio" name="tipo" value="pasaporte" [(ngModel)]="f.tipo" />{{ L('Pasaporte', 'Passport') }}</label>
                  <label class="casilla"><input type="radio" name="tipo" value="cedula" [(ngModel)]="f.tipo" />{{ L('Cédula de identidad chilena', 'Chilean ID card') }}</label>
                </fieldset>
                <div class="dos">
                  <div class="campo"><label for="rc-num">{{ L('Número de documento', 'Document number') }}</label>
                    <input id="rc-num" class="control" name="numero" [(ngModel)]="f.numero" /></div>
                  <div class="campo"><label for="rc-emisor">{{ L('País emisor', 'Issuing country') }}</label>
                    <input id="rc-emisor" class="control" name="emisor" list="rc-paises" [(ngModel)]="f.emisor" /></div>
                </div>
                <label class="zona" [class.encima]="encima()" (dragover)="$event.preventDefault(); encima.set(true)" (dragleave)="encima.set(false)" (drop)="soltar($event)">
                  <app-icon nombre="upload" [tam]="32" />
                  <strong>{{ archivo() || L('Arrastra aquí una foto del documento', 'Drag a photo of your document here') }}</strong>
                  <span class="texto-sm texto-2">{{ L('o haz clic para elegir · JPG, PNG o PDF, hasta 5 MB', 'or click to choose · JPG, PNG or PDF, up to 5 MB') }}</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" (change)="elegir($event)" />
                </label>
                <p class="texto-xs texto-2">{{ L('El documento se usa solo para la ficha de registro que exige la normativa y queda cifrado.', 'Your document is used only for the legally required registration form and is stored encrypted.') }}</p>
              }
              @case (2) {
                <h2>{{ titulos()[2] }}</h2>
                <fieldset class="opciones">
                  <legend>{{ L('Idioma de las comunicaciones', 'Language for communications') }}</legend>
                  <label class="casilla"><input type="radio" name="idioma" value="es" [(ngModel)]="f.idioma" />Español</label>
                  <label class="casilla"><input type="radio" name="idioma" value="en" [(ngModel)]="f.idioma" />English</label>
                </fieldset>
                <fieldset class="opciones">
                  <legend>{{ L('Preferencias de estadía (opcional)', 'Stay preferences (optional)') }}</legend>
                  @for (p of preferencias; track p.es) {
                    <label class="casilla"><input type="checkbox" [checked]="f.preferencias.includes(p.es)" (change)="alternar(p.es)" />{{ L(p.es, p.en) }}</label>
                  }
                </fieldset>
              }
              @case (3) {
                <h2>{{ titulos()[3] }}</h2>
                <label class="casilla"><input type="checkbox" name="datos" [(ngModel)]="f.datos" />
                  {{ L('Autorizo el tratamiento de mis datos personales para gestionar mis reservas y estadías, conforme a la política de privacidad de Hoteles Reloncaví. (Obligatorio)', 'I consent to the processing of my personal data to manage my bookings and stays, under the Hoteles Reloncaví privacy policy. (Required)') }}</label>
                <label class="casilla"><input type="checkbox" name="ofertas" [(ngModel)]="f.ofertas" />
                  {{ L('Quiero recibir ofertas y novedades por correo. (Opcional)', 'I would like to receive offers and news by email. (Optional)') }}</label>
                <details class="tarjeta tarjeta-plana">
                  <summary class="negrita">{{ L('Cómo usamos tus datos', 'How we use your data') }}</summary>
                  <p class="texto-sm">{{ L('Usamos tus datos para tus reservas, la ficha de registro que exige la ley y, si lo autorizas, para enviarte ofertas. Puedes revisar, corregir o eliminar tus datos desde tu cuenta.', 'We use your data for your bookings, the legally required registration form and, if you agree, to send you offers. You can review, correct or delete your data from your account.') }}</p>
                </details>
              }
              @case (4) {
                <h2>{{ titulos()[4] }}</h2>
                <dl class="resumen dos">
                  <div><dt>{{ L('Nombre', 'Name') }}</dt><dd>{{ f.nombres }} {{ f.apellidos }}</dd></div>
                  <div><dt>{{ L('Correo', 'Email') }}</dt><dd>{{ f.correo }}</dd></div>
                  <div><dt>{{ L('Documento', 'Document') }}</dt><dd>{{ f.tipo === 'pasaporte' ? L('Pasaporte', 'Passport') : L('Cédula', 'ID card') }} · {{ f.numero }}</dd></div>
                  <div><dt>{{ L('Idioma', 'Language') }}</dt><dd>{{ f.idioma === 'es' ? 'Español' : 'English' }}</dd></div>
                </dl>
                <div class="campo">
                  <label for="rc-codigo">{{ L('Código enviado a tu correo', 'Code sent to your email') }}</label>
                  <input id="rc-codigo" class="control" inputmode="numeric" autocomplete="one-time-code" maxlength="6" name="codigo" [(ngModel)]="f.codigo" style="max-width:220px;letter-spacing:.3em" />
                </div>
                <p class="texto-xs texto-2">{{ L('Código de demostración: 560 284', 'Demo code: 560 284') }}</p>
              }
            }

            <div class="acciones">
              @if (paso() > 0) {
                <button type="button" class="btn btn-secundario" (click)="atras()"><app-icon nombre="arrow-left" [tam]="18" />{{ L('Anterior', 'Back') }}</button>
              } @else {
                <a class="btn btn-terciario" routerLink="/acceso" [queryParams]="{ modo: 'huesped' }">{{ L('Ya tengo cuenta', 'I already have an account') }}</a>
              }
              <button type="submit" class="btn btn-primario">
                {{ paso() === 4 ? L('Crear cuenta', 'Create account') : L('Siguiente', 'Next') }}<app-icon nombre="arrow-right" [tam]="18" />
              </button>
            </div>
          </form>
        </div>
      } @else {
        <div class="tarjeta exito" role="status">
          <span class="circulo"><app-icon nombre="check" [tam]="36" /></span>
          <h1>{{ L('Tu cuenta está lista', 'Your account is ready') }}</h1>
          <p class="texto-2">{{ L('Te damos la bienvenida, ', 'Welcome, ') }}{{ f.nombres }}. {{ L('Ya puedes reservar y completar tu registro antes de llegar.', 'You can now book and pre-register before you arrive.') }}</p>
          <div class="fila">
            <a class="btn btn-primario" routerLink="/cuenta">{{ L('Ir a mi cuenta', 'Go to my account') }}</a>
            <a class="btn btn-secundario" routerLink="/inicio">{{ L('Buscar hoteles', 'Find hotels') }}</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class RegistroCuenta {
  private readonly estado = inject(DemoState);
  private readonly op = inject(OperacionState);
  private readonly router = inject(Router);

  protected readonly paises = PAISES;
  protected readonly preferencias = PREFERENCIAS;
  protected readonly paso = signal(0);
  protected readonly errores = signal<string[]>([]);
  protected readonly tocado = signal(false);
  protected readonly encima = signal(false);
  protected readonly archivo = signal('');
  private readonly en = computed(() => this.estado.idioma() === 'en');

  protected f = {
    nombres: '', apellidos: '', correo: '', telefono: '', pais: '',
    tipo: 'pasaporte' as 'pasaporte' | 'cedula', numero: '', emisor: '',
    idioma: this.estado.idioma(), preferencias: [] as string[],
    datos: false, ofertas: false, codigo: '',
  };

  protected readonly titulos = computed(() =>
    this.en()
      ? ['Your details', 'Identity document', 'Language and preferences', 'Privacy', 'Verification']
      : ['Tus datos', 'Documento de identidad', 'Idioma y preferencias', 'Privacidad', 'Verificación'],
  );

  protected L(es: string, en: string) {
    return this.en() ? en : es;
  }
  protected correoOk() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.f.correo.trim());
  }
  protected alternar(p: string) {
    this.f.preferencias = this.f.preferencias.includes(p) ? this.f.preferencias.filter((x) => x !== p) : [...this.f.preferencias, p];
  }
  protected soltar(e: DragEvent) {
    e.preventDefault();
    this.encima.set(false);
    this.validarArchivo(e.dataTransfer?.files?.[0]);
  }
  protected elegir(e: Event) {
    this.validarArchivo((e.target as HTMLInputElement).files?.[0]);
  }
  private validarArchivo(a?: File) {
    if (!a) return;
    if (!/\.(jpe?g|png|pdf)$/i.test(a.name)) return this.errores.set([this.L('El archivo debe ser JPG, PNG o PDF.', 'The file must be JPG, PNG or PDF.')]);
    if (a.size > 5 * 1024 * 1024) return this.errores.set([this.L('El archivo supera los 5 MB.', 'The file is larger than 5 MB.')]);
    this.errores.set([]);
    this.archivo.set(a.name);
  }

  private validar(): string[] {
    const f = this.f, e: string[] = [];
    switch (this.paso()) {
      case 0:
        this.tocado.set(true);
        if (!f.nombres.trim()) e.push(this.L('Ingresa tus nombres.', 'Enter your first name.'));
        if (!f.apellidos.trim()) e.push(this.L('Ingresa tus apellidos.', 'Enter your last name.'));
        if (!this.correoOk()) e.push(this.L('El correo no es válido.', 'The email address is not valid.'));
        else if (this.op.huespedes().some((h) => h.correo.toLowerCase() === f.correo.trim().toLowerCase()))
          e.push(this.L('Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.', 'An account with that email already exists. Sign in or use another email.'));
        if (!/^\+?[0-9 ()-]{7,25}$/.test(f.telefono.trim())) e.push(this.L('Ingresa un teléfono con código de país, por ejemplo +56 9 1234 5678.', 'Enter a phone number with country code, e.g. +44 7700 900123.'));
        if (!f.pais.trim()) e.push(this.L('Indica tu país de residencia.', 'Enter your country of residence.'));
        break;
      case 1:
        if (f.numero.trim().length < 5) e.push(this.L('Ingresa el número de documento.', 'Enter the document number.'));
        if (!f.emisor.trim()) e.push(this.L('Indica el país emisor.', 'Enter the issuing country.'));
        if (!this.archivo()) e.push(this.L('Adjunta una foto del documento.', 'Attach a photo of the document.'));
        break;
      case 3:
        if (!f.datos) e.push(this.L('Para crear la cuenta necesitamos tu autorización de tratamiento de datos.', 'We need your consent to process your data to create the account.'));
        break;
      case 4:
        if (f.codigo.replace(/\s/g, '') !== '560284') e.push(this.L('El código no es válido. Revisa tu correo.', 'The code is not valid. Check your email.'));
        break;
    }
    return e;
  }

  protected siguiente() {
    const e = this.validar();
    this.errores.set(e);
    if (e.length) return;
    if (this.paso() === 4) {
      const r = this.op.guardarHuesped({
        nombres: this.f.nombres, apellidos: this.f.apellidos, correo: this.f.correo, telefono: this.f.telefono,
        nacionalidad: this.f.pais, idioma: this.f.idioma, preferencias: this.f.preferencias,
      });
      if (r.error) return this.errores.set([r.error]);
      this.estado.sesionHuesped.set(this.f.correo.trim().toLowerCase());
      this.estado.elegirPerfil('huesped');
    }
    this.paso.update((p) => p + 1);
    window.scrollTo({ top: 0 });
  }
  protected atras() {
    this.errores.set([]);
    this.paso.update((p) => Math.max(0, p - 1));
  }
}
