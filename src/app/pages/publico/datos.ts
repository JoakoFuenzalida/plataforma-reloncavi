import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonaReserva } from '../../core/operacion.modelos';
import { PersonaReservaEditor } from '../../shared/persona-reserva';
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
  imports: [ReactiveFormsModule, FormsModule, RouterLink, PersonaReservaEditor],
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
            <label class="campo" for="reservante-existente">{{tr('Reservante de demostración','Demo booker')}}</label>
            <select id="reservante-existente" class="control" [ngModel]="reservanteId" [ngModelOptions]="{standalone:true}" (ngModelChange)="elegirReservante($event)"><option value="">{{tr('Persona nueva','New person')}}</option>@for(h of operacion.huespedes();track h.id){<option [value]="h.id">{{h.nombres}} {{h.apellidos}} · {{h.correo}}</option>}</select>
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
                  [readOnly]="!!reservanteId"
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

            <label class="casilla"><input type="checkbox" [checked]="soyPagador" (change)="soyPagador=$any($event.target).checked">{{tr('El reservante también paga','The booker also pays')}}</label>
            @if(!soyPagador){<app-persona-reserva [titulo]="tr('Pagador','Payer')" prefijo="pagador" [inicial]="pagador" (cambio)="pagador=$event" />}
            <label class="casilla"><input type="checkbox" [checked]="soyHuesped" (change)="cambiarAlojamiento($any($event.target).checked)">{{tr('El reservante también se aloja','The booker is also a guest')}}</label>
            @for(slot of acompanantes;track slot.indice){<app-persona-reserva [titulo]="tr('Huésped ','Guest ')+(slot.indice+(soyHuesped?2:1))" [prefijo]="'alojado-'+slot.indice" [inicial]="slot.persona" (cambio)="actualizarAcompanante(slot.indice,$event)" />}
            @if(errorParticipantes()){<p class="mensaje mensaje-error" role="alert">{{errorParticipantes()}}</p>}
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
  protected readonly operacion = inject(OperacionState);
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
  protected reservanteId='';protected soyPagador=true;protected soyHuesped=true;protected pagador:PersonaReserva|null=null;
  protected acompanantes:{indice:number;persona:PersonaReserva|null}[]=Array.from({length:Math.max(0,Math.min(4,this.adultos||1)-1)},(_,indice)=>({indice,persona:null}));
  protected readonly errorParticipantes=signal('');
  protected elegirReservante(id:string){this.reservanteId=id;const h=this.operacion.huespedPorId(id);if(h)this.form.patchValue(h);else this.form.reset();}
  protected cambiarAlojamiento(valor:boolean){this.soyHuesped=valor;this.acompanantes=Array.from({length:Math.max(0,Math.min(4,this.adultos||1)-(valor?1:0))},(_,indice)=>this.acompanantes[indice]??{indice,persona:null});}
  protected actualizarAcompanante(indice:number,persona:PersonaReserva|null){if(this.acompanantes[indice])this.acompanantes[indice].persona=persona;}


  constructor() {
    const b=this.operacion.borrador();
    if(b && b.hotelId===this.hotel?.id && b.tipo===this.tipo?.codigo && b.llegada===this.llegada && b.salida===this.salida && b.adultos===this.adultos){
      this.reservanteId=b.huesped.id??'';this.form.patchValue(b.huesped);
      this.soyPagador=!b.pagador || b.pagador===b.huesped || (!!b.huesped.id && b.pagador.id===b.huesped.id);this.pagador=b.pagador??null;
      const alojados=b.alojados??[b.huesped];this.soyHuesped=alojados[0]===b.huesped || (!!b.huesped.id && alojados[0]?.id===b.huesped.id);
      this.acompanantes=alojados.slice(this.soyHuesped?1:0).map((persona,indice)=>({indice,persona}));
    }
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
    const reservante:PersonaReserva=this.reservanteId ? this.operacion.huespedPorId(this.reservanteId)! : { ...this.form.getRawValue(), nacionalidad: '', idioma: this.estado.idioma(), preferencias: [] };
    const extras=this.acompanantes.map(s=>s.persona);
    if(extras.some(p=>!p) || (!this.soyPagador && !this.pagador)) {this.validado.set(false);this.errorParticipantes.set(this.tr('Completa los datos del pagador y de cada huésped.','Complete the payer and every guest’s details.'));return;}
    const alojados=[...(this.soyHuesped?[reservante]:[]),...extras as PersonaReserva[]];
    const ids=alojados.filter(p=>p.id).map(p=>p.id);
    if(new Set(ids).size!==ids.length){this.validado.set(false);this.errorParticipantes.set(this.tr('Cada adulto debe tener una ficha distinta.','Each adult must have a different profile.'));return;}
    this.errorParticipantes.set('');
    this.operacion.borrador.set({hotelId:this.hotel.id,tipo:this.tipo.codigo,llegada:this.llegada,salida:this.salida,adultos:this.adultos,huesped:reservante,pagador:this.soyPagador?reservante:this.pagador!,alojados});
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
