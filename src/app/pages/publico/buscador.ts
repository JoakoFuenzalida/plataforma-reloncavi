import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemoState } from '../../core/demo-state';
import { HOTELES } from '../../core/hoteles';
import { TPipe, texto } from '../../core/i18n';
import { Icon } from '../../shared/icon';

export const HOY_ISO = '2029-01-18';

export function noches(llegada: string, salida: string): number {
  const a = Date.parse(llegada + 'T12:00:00');
  const b = Date.parse(salida + 'T12:00:00');
  return Math.round((b - a) / 86400000);
}

function validarFechas(g: AbstractControl): ValidationErrors | null {
  const ll = g.get('llegada')?.value as string;
  const sa = g.get('salida')?.value as string;
  if (!ll || !sa) return null;
  return noches(ll, sa) >= 1 ? null : { fechas: true };
}

/** Buscador de disponibilidad (RF-06). Validación en tiempo real y mensajes en el idioma del huésped. */
@Component({
  selector: 'app-buscador',
  imports: [ReactiveFormsModule, Icon, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form { display: grid; gap: var(--s-3); grid-template-columns: 1fr; align-items: start; }
    @media (min-width: 600px) { form { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { form.horizontal { grid-template-columns: 2fr 1.2fr 1.2fr 1fr auto; } }
    .accion { align-self: end; }
    @media (min-width: 1024px) { form.horizontal .accion { padding-top: 26px; } }
    .resumen { grid-column: 1 / -1; display: flex; gap: var(--s-2); align-items: center; font-size: var(--t-sm); color: var(--c-texto-2); min-height: 20px; }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="buscar()" [class.horizontal]="horizontal()" novalidate
      [attr.aria-label]="'buscar.titulo' | t">
      <div class="campo">
        <label for="b-destino">{{ 'buscar.destino' | t }}</label>
        <select id="b-destino" class="control" formControlName="destino">
          <option value="">{{ 'buscar.destino.todos' | t }}</option>
          <optgroup [label]="estado.idioma() === 'es' ? 'Hoteles urbanos' : 'City hotels'">
            @for (h of urbanos; track h.id) { <option [value]="h.id">{{ h.nombreCorto }} · {{ h.ciudad }}</option> }
          </optgroup>
          <optgroup label="Lodges">
            @for (h of lodges; track h.id) { <option [value]="h.id">{{ h.nombreCorto }}</option> }
          </optgroup>
        </select>
      </div>

      <div class="campo">
        <label for="b-llegada">{{ 'buscar.llegada' | t }}</label>
        <input id="b-llegada" type="date" class="control" formControlName="llegada" [min]="hoy"
          [class.invalido]="errLlegada()" [attr.aria-invalid]="errLlegada() ? 'true' : null"
          [attr.aria-describedby]="errLlegada() ? 'b-llegada-err' : null" />
        @if (errLlegada(); as e) {
          <span class="error-campo" id="b-llegada-err"><app-icon nombre="circle-alert" [tam]="14" />{{ e }}</span>
        }
      </div>

      <div class="campo">
        <label for="b-salida">{{ 'buscar.salida' | t }}</label>
        <input id="b-salida" type="date" class="control" formControlName="salida" [min]="form.value.llegada || hoy"
          [class.invalido]="errSalida()" [attr.aria-invalid]="errSalida() ? 'true' : null"
          [attr.aria-describedby]="errSalida() ? 'b-salida-err' : null" />
        @if (errSalida(); as e) {
          <span class="error-campo" id="b-salida-err"><app-icon nombre="circle-alert" [tam]="14" />{{ e }}</span>
        }
      </div>

      <div class="campo">
        <label for="b-adultos">{{ 'buscar.huespedes' | t }}</label>
        <select id="b-adultos" class="control" formControlName="adultos">
          @for (n of [1, 2, 3, 4]; track n) { <option [value]="n">{{ n }} {{ 'buscar.adultos' | t }}</option> }
        </select>
      </div>

      <div class="accion">
        <button type="submit" class="btn btn-acento btn-bloque">
          <app-icon nombre="search" [tam]="18" />{{ 'buscar.boton' | t }}
        </button>
      </div>

      <p class="resumen" aria-live="polite">
        @if (nNoches() > 0) {
          <app-icon nombre="calendar-days" [tam]="16" />
          {{ nNoches() }} {{ nNoches() === 1 ? ('buscar.noche' | t) : ('buscar.noches' | t) }}
        }
      </p>
    </form>
  `,
})
export class Buscador {
  protected readonly estado = inject(DemoState);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly horizontal = input(true);
  readonly destino = input('');
  readonly llegada = input('2029-02-02');
  readonly salida = input('2029-02-05');
  readonly adultos = input(2);

  protected readonly hoy = HOY_ISO;
  protected readonly urbanos = HOTELES.filter((h) => h.tipo === 'urbano');
  protected readonly lodges = HOTELES.filter((h) => h.tipo === 'lodge');

  protected readonly form = this.fb.nonNullable.group(
    {
      destino: [''],
      llegada: ['', [Validators.required]],
      salida: ['', [Validators.required]],
      adultos: [2],
    },
    { validators: validarFechas },
  );

  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private readonly enviado = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  protected readonly nNoches = computed(() => {
    const v = this.valor();
    return v.llegada && v.salida ? Math.max(0, noches(v.llegada, v.salida)) : 0;
  });

  protected readonly errLlegada = computed(() => {
    this.enviado();
    const v = this.valor();
    const c = this.form.controls.llegada;
    if (!c.touched && !c.dirty) return null;
    const i = this.estado.idioma();
    if (!v.llegada) return texto('buscar.error.requerido', i);
    if (v.llegada < HOY_ISO) return texto('buscar.error.pasado', i);
    return null;
  });

  protected readonly errSalida = computed(() => {
    this.enviado();
    const v = this.valor();
    const c = this.form.controls.salida;
    if (!c.touched && !c.dirty) return null;
    const i = this.estado.idioma();
    if (!v.salida) return texto('buscar.error.requerido', i);
    if (v.llegada && noches(v.llegada, v.salida) < 1) return texto('buscar.error.fechas', i);
    return null;
  });

  ngOnInit() {
    this.form.setValue({
      destino: this.destino(),
      llegada: this.llegada(),
      salida: this.salida(),
      adultos: Number(this.adultos()),
    });
  }

  buscar() {
    this.form.markAllAsTouched();
    this.form.controls.llegada.markAsDirty();
    this.form.controls.salida.markAsDirty();
    this.form.updateValueAndValidity();
    const v = this.form.getRawValue();
    if (this.form.invalid || v.llegada < HOY_ISO) {
      const primero = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      primero?.focus();
      return;
    }
    this.router.navigate(['/reservar/disponibilidad'], {
      queryParams: { destino: v.destino || null, llegada: v.llegada, salida: v.salida, adultos: v.adultos },
    });
  }
}
