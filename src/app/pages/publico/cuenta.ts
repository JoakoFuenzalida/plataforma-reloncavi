import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoState } from '../../core/demo-state';
import { hotelPorId } from '../../core/hoteles';
import { OperacionState } from '../../core/operacion-state';
import { Reserva } from '../../core/operacion.modelos';
import { Icon } from '../../shared/icon';

/** Portal autenticado del huésped: reservas, registro previo y datos (RT-16.30). */
@Component({
  selector: 'app-cuenta',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding-top: var(--s-5); }
    .cabeza { align-items: flex-end; margin-bottom: var(--s-4); }
    .cabeza p { margin: 0; }
    .reservas { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-3); }
    .reserva { display: grid; gap: var(--s-3); grid-template-columns: 1fr; align-items: center; }
    @media (min-width: 768px) { .reserva { grid-template-columns: 1fr auto; } }
    .reserva h3 { margin: 0 0 4px; }
    .reserva p { margin: 0; }
    .roles { display: flex; gap: 6px; flex-wrap: wrap; margin-top: var(--s-2); }
    dl { display: grid; gap: var(--s-2) var(--s-5); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin: 0; }
    dt { font-size: var(--t-xs); color: var(--c-texto-2); }
    dd { margin: 0; font-weight: 600; }
  `,
  template: `
    <div class="contenedor">
      @if (persona(); as p) {
        <div class="fila-entre cabeza">
          <div>
            <p class="texto-2">{{ L('Mi cuenta', 'My account') }}</p>
            <h1>{{ L('Hola, ', 'Hello, ') }}{{ p.nombres }}</h1>
          </div>
          <button type="button" class="btn btn-secundario" (click)="salir()"><app-icon nombre="log-out" [tam]="18" />{{ L('Cerrar sesión', 'Sign out') }}</button>
        </div>

        <section aria-labelledby="t-reservas" class="pila">
          <h2 id="t-reservas">{{ L('Mis reservas', 'My bookings') }}</h2>
          @if (reservas().length) {
            <ul class="reservas" role="list">
              @for (r of reservas(); track r.id) {
                <li class="tarjeta reserva">
                  <div>
                    <h3>{{ hotel(r) }}</h3>
                    <p class="texto-sm texto-2">{{ r.codigo }} · {{ fecha(r.llegada) }} – {{ fecha(r.salida) }} · {{ r.adultos }} {{ L('adultos', 'adults') }}</p>
                    <div class="roles">
                      <span class="distintivo" [class.distintivo-exito]="r.estado === 'alojado'" [class.distintivo-neutro]="r.estado === 'finalizada'">{{ estadoTexto(r) }}</span>
                      @for (rol of roles(r, p.id); track rol) { <span class="distintivo distintivo-neutro">{{ rol }}</span> }
                    </div>
                  </div>
                  @if (r.estado === 'confirmada' && r.huespedesIds.includes(p.id)) {
                    @if (registrado(r, p.id)) {
                      <span class="distintivo distintivo-exito"><app-icon nombre="check" [tam]="14" />{{ L('Registro previo enviado', 'Pre-registration sent') }}</span>
                    } @else {
                      <a class="btn btn-acento" [routerLink]="['/registro', r.id]" [queryParams]="{ huesped: p.id }">
                        <app-icon nombre="smartphone" [tam]="18" />{{ L('Completar registro previo', 'Complete pre-registration') }}
                      </a>
                    }
                  }
                </li>
              }
            </ul>
          } @else {
            <div class="tarjeta vacio">
              <svg viewBox="0 0 160 110" aria-hidden="true"><rect x="20" y="25" width="120" height="75" rx="10" fill="#eaf1f4" /><rect x="20" y="25" width="120" height="20" rx="10" fill="#c9dce3" /><circle cx="55" cy="70" r="10" fill="#12384a" /><rect x="75" y="62" width="45" height="6" rx="3" fill="#9aa8ae" /><rect x="75" y="74" width="30" height="6" rx="3" fill="#9aa8ae" /></svg>
              <h3>{{ L('Aún no tienes reservas', 'You have no bookings yet') }}</h3>
              <p>{{ L('Cuando reserves, aquí verás tu estadía y podrás completar el registro antes de llegar.', 'Once you book, your stay will show here and you can pre-register before arriving.') }}</p>
              <a class="btn btn-primario" routerLink="/inicio">{{ L('Buscar hoteles', 'Find hotels') }}</a>
            </div>
          }
        </section>

        <section aria-labelledby="t-datos" class="tarjeta" style="margin-top:24px">
          <h2 id="t-datos">{{ L('Mis datos', 'My details') }}</h2>
          <dl>
            <div><dt>{{ L('Correo', 'Email') }}</dt><dd>{{ p.correo }}</dd></div>
            <div><dt>{{ L('Teléfono', 'Phone') }}</dt><dd>{{ p.telefono }}</dd></div>
            <div><dt>{{ L('País', 'Country') }}</dt><dd>{{ p.nacionalidad || '—' }}</dd></div>
            <div><dt>{{ L('Idioma', 'Language') }}</dt><dd>{{ p.idioma === 'es' ? 'Español' : 'English' }}</dd></div>
            <div><dt>{{ L('Preferencias', 'Preferences') }}</dt><dd>{{ p.preferencias.join(', ') || L('Sin preferencias', 'None') }}</dd></div>
          </dl>
        </section>
      } @else {
        <div class="tarjeta vacio">
          <app-icon nombre="lock" [tam]="40" />
          <h1>{{ L('Inicia sesión para ver tu cuenta', 'Sign in to see your account') }}</h1>
          <p>{{ L('Te enviaremos un código al correo de tu reserva.', 'We will email a code to the address on your booking.') }}</p>
          <a class="btn btn-primario" routerLink="/acceso" [queryParams]="{ modo: 'huesped' }">{{ L('Iniciar sesión', 'Sign in') }}</a>
        </div>
      }
    </div>
  `,
})
export class Cuenta {
  private readonly estado = inject(DemoState);
  private readonly op = inject(OperacionState);
  private readonly router = inject(Router);

  protected readonly persona = computed(() => {
    const c = this.estado.sesionHuesped();
    return c ? this.op.huespedes().find((h) => h.correo.toLowerCase() === c) ?? null : null;
  });
  protected readonly reservas = computed(() => {
    const p = this.persona();
    return p ? this.op.reservasDePersona(p.id) : [];
  });

  protected L(es: string, en: string) {
    return this.estado.idioma() === 'en' ? en : es;
  }
  protected hotel(r: Reserva) {
    return hotelPorId(r.hotelId)?.nombre ?? r.hotelId;
  }
  protected fecha(iso: string) {
    return new Date(iso + 'T12:00:00').toLocaleDateString(this.estado.idioma() === 'en' ? 'en-GB' : 'es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  protected estadoTexto(r: Reserva) {
    const t = { confirmada: ['Confirmada', 'Confirmed'], alojado: ['En curso', 'In progress'], finalizada: ['Finalizada', 'Completed'], cancelada: ['Cancelada', 'Cancelled'] }[r.estado];
    return this.L(t[0], t[1]);
  }
  protected roles(r: Reserva, id: string) {
    const out: string[] = [];
    if (r.reservanteId === id) out.push(this.L('Reservante', 'Booker'));
    if (r.pagadorId === id) out.push(this.L('Pagador', 'Payer'));
    if (r.huespedesIds.includes(id)) out.push(this.L('Huésped', 'Guest'));
    return out;
  }
  protected registrado(r: Reserva, id: string) {
    return r.registrosPrevios.some((x) => x.huespedId === id && x.estado !== 'borrador');
  }
  protected salir() {
    this.estado.sesionHuesped.set(null);
    this.router.navigateByUrl('/inicio');
  }
}
