import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OperacionState } from '../../core/operacion-state';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DemoState } from '../../core/demo-state';
import {
  hotelPorId,
  SIN_CUPO_DEMO,
} from '../../core/hoteles';
import { HOY_ISO, noches } from './buscador';

@Component({
  selector: 'app-datos-reserva',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  styles: `
    :host {
      display: block;
      padding-block: var(--s-6);
    }

    .distribucion {
      display: grid;
      gap: var(--s-5);
      align-items: start;
    }

    .formulario {
      display: grid;
      gap: var(--s-4);
    }

    .resumen dl {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--s-3);
    }

    .resumen dt,
    .resumen dd {
      margin: 0;
    }

    .resumen dd {
      text-align: right;
      font-weight: 600;
    }

    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-3);
    }

    @media (min-width: 900px) {
      .distribucion {
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      }
    }
  `,
  template: `
    <div class="contenedor">
      <nav
        class="rastro"
        [attr.aria-label]="tr('Ruta de navegación', 'Breadcrumb')"
      >
        <ol>
          <li>
            <a routerLink="/inicio">{{ tr('Inicio', 'Home') }}</a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page">
              {{ tr('Tus datos', 'Your details') }}
            </span>
          </li>
        </ol>
      </nav>

      <h1 style="margin-top: var(--s-5)">
        {{ tr('Tus datos', 'Your details') }}
      </h1>

      @if (seleccionValida && hotel && tipo) {
        <p class="texto-2">
          {{
            tr(
              'Paso 2 de 4 · Datos de la persona que realiza la reserva.',
              'Step 2 of 4 · Details of the person making the booking.'
            )
          }}
        </p>

        <div class="distribucion">
          <form
            class="tarjeta formulario"
            [formGroup]="form"
            (ngSubmit)="guardar()"
            novalidate
          >
            @for (campo of campos; track campo.id) {
              <div class="campo">
                <label [for]="campo.id">
                  {{ tr(campo.es, campo.en) }}
                </label>

                <input
                  class="control"
                  [id]="campo.id"
                  [type]="campo.tipo"
                  [autocomplete]="campo.autocompletar"
                  [formControlName]="campo.id"
                  [attr.aria-invalid]="
                    tieneError(campo.id) ? 'true' : null
                  "
                  [attr.aria-describedby]="
                    tieneError(campo.id) ? campo.id + '-error' : null
                  "
                />

                @if (tieneError(campo.id)) {
                  <span
                    class="error-campo"
                    [id]="campo.id + '-error'"
                  >
                    {{
                      tr(
                        'Revisa este campo e ingresa un valor válido.',
                        'Check this field and enter a valid value.'
                      )
                    }}
                  </span>
                }
              </div>
            }

            <p class="texto-sm texto-2">
              {{
                tr(
                  'Ingresa datos ficticios para esta demostración.',
                  'Enter fictional details for this demonstration.'
                )
              }}
            </p>

            <div class="acciones">
              <a
                class="btn btn-secundario"
                routerLink="/reservar/disponibilidad"
                [queryParams]="parametrosBusqueda"
              >
                {{ tr('Volver', 'Back') }}
              </a>

              <button class="btn btn-primario" type="submit">
                {{ tr('Continuar al pago', 'Continue to payment') }}
              </button>
            </div>

            @if (validado()) {
              <div class="mensaje mensaje-exito" role="status">
                <p>
                  {{
                    tr(
                      'Los datos son válidos. Aún no se ha realizado ningún pago ni confirmado la reserva.',
                      'The details are valid. No payment has been made and the booking is not yet confirmed.'
                    )
                  }}
                </p>
              </div>
            }
          </form>

          <aside class="tarjeta resumen">
            <h2>{{ tr('Tu estadía', 'Your stay') }}</h2>
            <h3>{{ hotel.nombre }}</h3>

            <p>{{ tipo.nombre[estado.idioma()] }}</p>

            <dl>
              <dt>{{ tr('Llegada', 'Check-in') }}</dt>
              <dd>{{ llegada }}</dd>

              <dt>{{ tr('Salida', 'Check-out') }}</dt>
              <dd>{{ salida }}</dd>

              <dt>{{ tr('Noches', 'Nights') }}</dt>
              <dd>{{ cantidadNoches }}</dd>

              <dt>{{ tr('Adultos', 'Adults') }}</dt>
              <dd>{{ adultos }}</dd>

              <dt>{{ tr('Total alojamiento', 'Accommodation total') }}</dt>
              <dd>
                {{ estado.precio(tipo.tarifaClp * cantidadNoches) }}
              </dd>
            </dl>
          </aside>
        </div>
      } @else {
        <div class="tarjeta pila" role="alert">
          <h2>
            {{ tr('Revisa tu selección', 'Check your selection') }}
          </h2>

          <p>
            {{
              tr(
                'La selección no es válida o no tiene disponibilidad. Vuelve a buscar una habitación.',
                'The selection is invalid or unavailable. Please search for a room again.'
              )
            }}
          </p>

          <a class="btn btn-primario" routerLink="/inicio">
            {{ tr('Buscar habitación', 'Find a room') }}
          </a>
        </div>
      }
    </div>
  `,
})
export class DatosReserva {
  protected readonly estado = inject(DemoState);
  private readonly ruta = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly operacion = inject(OperacionState);
  private readonly router = inject(Router);

  private readonly parametros = this.ruta.snapshot.queryParamMap;

  protected readonly hotel = hotelPorId(
    this.parametros.get('hotel') ?? '',
  );

  protected readonly tipo = this.hotel?.tipos.find(
    (tipo) => tipo.codigo === this.parametros.get('tipo'),
  );

  protected readonly llegada = this.parametros.get('llegada') ?? '';
  protected readonly salida = this.parametros.get('salida') ?? '';
  protected readonly adultos = Number(this.parametros.get('adultos'));
  protected readonly cantidadNoches = noches(this.llegada, this.salida);

  protected readonly seleccionValida = Boolean(
    this.hotel &&
    this.tipo &&
    !SIN_CUPO_DEMO.has(this.hotel.id) &&
    this.fechaValida(this.llegada) &&
    this.fechaValida(this.salida) &&
    this.llegada >= HOY_ISO &&
    this.cantidadNoches >= 1 &&
    Number.isInteger(this.adultos) &&
    this.adultos >= 1 &&
    this.adultos <= this.tipo.capacidad
  );

  protected readonly parametrosBusqueda = {
    destino: this.hotel?.id,
    llegada: this.llegada,
    salida: this.salida,
    adultos: this.adultos,
  };

  protected readonly campos = [
    {
      id: 'nombres',
      es: 'Nombres',
      en: 'First name',
      tipo: 'text',
      autocompletar: 'given-name',
    },
    {
      id: 'apellidos',
      es: 'Apellidos',
      en: 'Last name',
      tipo: 'text',
      autocompletar: 'family-name',
    },
    {
      id: 'correo',
      es: 'Correo electrónico',
      en: 'Email',
      tipo: 'email',
      autocompletar: 'email',
    },
    {
      id: 'telefono',
      es: 'Teléfono',
      en: 'Phone',
      tipo: 'tel',
      autocompletar: 'tel',
    },
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombres: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(80),
      ],
    ],
    apellidos: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(80),
      ],
    ],
    correo: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ],
    ],
    telefono: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\+?[0-9 ()-]{7,25}$/),
      ],
    ],
  });

  protected readonly validado = signal(false);

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.validado.set(false);
    });
  }

  protected tr(es: string, en: string): string {
    return this.estado.idioma() === 'es' ? es : en;
  }

  protected tieneError(nombre: string): boolean {
    const control = this.form.get(nombre);
    return Boolean(control?.invalid && (control.touched || control.dirty));
  }

  protected guardar(): void {
    this.form.markAllAsTouched();
    this.validado.set(this.seleccionValida && this.form.valid);
    if (!this.validado() || !this.hotel || !this.tipo) return;
    this.operacion.borrador.set({ hotelId: this.hotel.id, tipo: this.tipo.codigo, llegada: this.llegada, salida: this.salida, adultos: this.adultos, huesped: { ...this.form.getRawValue(), nacionalidad: '', idioma: this.estado.idioma(), preferencias: [] } });
    this.router.navigateByUrl('/reservar/pago');
  }

  private fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const fecha = new Date(valor + 'T12:00:00Z');

    return (
      !Number.isNaN(fecha.getTime()) &&
      fecha.toISOString().slice(0, 10) === valor
    );
  }
}
