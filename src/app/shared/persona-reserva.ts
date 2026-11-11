import { Component, inject, input, output, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DemoState } from "../core/demo-state";
import { OperacionState } from "../core/operacion-state";
import { PersonaReserva } from "../core/operacion.modelos";

@Component({
  selector: "app-persona-reserva",
  imports: [ReactiveFormsModule, FormsModule],
  styles:
    ":host{display:block}fieldset{border:1px solid var(--c-borde);border-radius:var(--r-md);padding:16px;min-width:0}legend{font-weight:700}",
  template: `<fieldset class="pila" [formGroup]="form">
    <legend>{{ titulo() }}</legend>
    <label class="campo" [for]="prefijo() + '-existente'">{{
      tr("Usar ficha de demostración", "Use a demo profile")
    }}</label
    ><select
      class="control"
      [id]="prefijo() + '-existente'"
      [ngModel]="id"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="elegir($event)"
    >
      <option value="">{{ tr("Persona nueva", "New person") }}</option>
      @for (h of op.huespedes(); track h.id) {
        <option [value]="h.id">
          {{ h.nombres }} {{ h.apellidos }} · {{ h.correo }}
        </option>
      }
    </select>
    @for (c of campos; track c.id) {
      <label class="campo" [for]="prefijo() + '-' + c.id">{{
        tr(c.es, c.en)
      }}</label
      ><input
        class="control"
        [id]="prefijo() + '-' + c.id"
        [type]="c.id === 'correo' ? 'email' : 'text'"
        [formControlName]="c.id"
        [readOnly]="!!id"
        [attr.aria-invalid]="
          form.get(c.id)?.invalid && form.get(c.id)?.touched ? 'true' : null
        "
      />
    }
    @if (id) {
      <p class="texto-sm">
        {{
          tr(
            "Se reutiliza la ficha existente. Los cambios de contacto se realizan en el directorio.",
            "The existing profile is reused. Contact details are edited in the directory."
          )
        }}
      </p>
    }
  </fieldset>`,
})
export class PersonaReservaEditor implements OnInit {
  readonly op = inject(OperacionState);
  readonly demo = inject(DemoState);
  private readonly fb = inject(FormBuilder);
  readonly titulo = input.required<string>();
  readonly prefijo = input.required<string>();
  readonly inicial = input<PersonaReserva | null>(null);
  readonly cambio = output<PersonaReserva | null>();
  id = "";
  readonly campos = [
    { id: "nombres", es: "Nombres", en: "First name" },
    { id: "apellidos", es: "Apellidos", en: "Last name" },
    { id: "correo", es: "Correo electrónico", en: "Email" },
    { id: "telefono", es: "Teléfono", en: "Phone" },
  ];
  readonly form = this.fb.nonNullable.group({
    nombres: [
      "",
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)],
    ],
    apellidos: [
      "",
      [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)],
    ],
    correo: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(150)],
    ],
    telefono: [
      "",
      [Validators.required, Validators.pattern(/^\+?[0-9 ()-]{7,25}$/)],
    ],
  });
  ngOnInit() {
    const p = this.inicial();
    if (p) {
      this.id = p.id ?? "";
      this.form.patchValue(p, { emitEvent: false });
    }
    this.form.valueChanges.subscribe(() => this.emitir());
    this.emitir();
  }
  elegir(id: string) {
    this.id = id;
    const h = this.op.huespedPorId(id);
    if (h) this.form.patchValue(h, { emitEvent: false });
    else this.form.reset({}, { emitEvent: false });
    this.emitir();
  }
  emitir() {
    this.cambio.emit(
      this.form.valid
        ? this.id
          ? (this.op.huespedPorId(this.id) ?? null)
          : {
              ...this.form.getRawValue(),
              nacionalidad: "",
              idioma: this.demo.idioma(),
              preferencias: [],
            }
        : null,
    );
  }
  tr(es: string, en: string) {
    return this.demo.idioma() === "es" ? es : en;
  }
}
