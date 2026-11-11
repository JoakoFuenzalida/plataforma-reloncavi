import {
  Component,
  inject,
  input,
  output,
  signal,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { OperacionState } from "../core/operacion-state";
import { FotoIncidencia } from "../core/operacion.modelos";

@Component({
  selector: "app-incidencia",
  imports: [FormsModule],
  styles: `
    :host {
      display: block;
    }
    form {
      border: 1px solid var(--c-borde);
      border-radius: var(--r-md);
      padding: 16px;
    }
    .archivo {
      border: 2px dashed var(--c-borde-fuerte);
      padding: 12px;
      border-radius: var(--r-md);
    }
    img {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
    }
    .btn {
      white-space: normal;
      line-height: 1.4;
      padding-block: 8px;
    }
    textarea {
      min-height: 100px;
    }
    input {
      max-width: 100%;
    }
  `,
  template: `<form
    class="pila"
    (ngSubmit)="reportar()"
    novalidate
    aria-label="Nueva incidencia"
  >
    <h3>
      Reportar habitación {{ op.habitacionPorId(habitacionId())?.numero }}
    </h3>
    <label class="campo"
      >Causa del bloqueo<textarea
        class="control"
        name="motivo"
        [(ngModel)]="motivo"
        required
        maxlength="500"
        [attr.aria-invalid]="error() && !motivo.trim() ? 'true' : null"
      ></textarea>
    </label>
    <div
      class="archivo pila"
      (dragover)="$event.preventDefault()"
      (drop)="soltar($event)"
    >
      <label class="campo"
        >Foto de la incidencia (opcional)<input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          (change)="cargar($any($event.target).files?.[0])"
      /></label>
      <p class="texto-sm">
        Arrastra una imagen PNG, JPG o WebP de hasta 5 MB. Se mantiene
        únicamente en esta demostración.
      </p>
      @if (foto(); as f) {
        <img [src]="f.dataUrl" alt="Vista previa de la incidencia" /><span>{{
          f.nombre
        }}</span
        ><button
          class="btn btn-secundario"
          type="button"
          (click)="quitarFoto()"
        >
          Quitar foto
        </button>
      }
    </div>
    <p>
      Se creará una orden y se bloquearán nuevas asignaciones. Si hay un huésped
      alojado, su estadía se conserva y recepción debe coordinar la salida.
    </p>
    <div class="fila">
      <button class="btn btn-primario" [disabled]="cargando()">
        Crear orden y bloquear</button
      ><button
        class="btn btn-secundario"
        type="button"
        (click)="cancelar.emit()"
      >
        Cancelar reporte
      </button>
    </div>
    @if (cargando()) {
      <p role="status">Leyendo imagen…</p>
    }
    @if (error()) {
      <p class="mensaje mensaje-error" role="alert">{{ error() }}</p>
    }
  </form>`,
})
export class Incidencia implements OnDestroy {
  readonly op = inject(OperacionState);
  readonly habitacionId = input.required<string>();
  readonly operador = input.required<string>();
  readonly guardada = output<void>();
  readonly cancelar = output<void>();
  motivo = "";
  readonly foto = signal<FotoIncidencia | null>(null);
  readonly cargando = signal(false);
  readonly error = signal("");
  private lectura = 0;
  ngOnDestroy() {
    this.lectura++;
  }
  quitarFoto() {
    this.lectura++;
    this.foto.set(null);
    this.cargando.set(false);
    this.error.set("");
  }
  soltar(event: DragEvent) {
    event.preventDefault();
    this.cargar(event.dataTransfer?.files[0]);
  }
  async cargar(file: File | undefined) {
    if (!file) return;
    const version = ++this.lectura;
    this.foto.set(null);
    this.error.set("");
    this.cargando.set(false);
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024 ||
      file.name.length > 255
    ) {
      this.error.set("Usa una imagen PNG, JPG o WebP de hasta 5 MB.");
      return;
    }
    this.cargando.set(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject();
        r.readAsDataURL(file);
      });
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      if (version === this.lectura)
        this.foto.set({ nombre: file.name, dataUrl });
    } catch {
      if (version === this.lectura)
        this.error.set("No se pudo leer la imagen. Selecciona otra foto.");
    } finally {
      if (version === this.lectura) this.cargando.set(false);
    }
  }
  reportar() {
    if (this.cargando()) return;
    const error = this.op.reportarIncidencia(
      this.habitacionId(),
      this.motivo,
      this.foto(),
      this.operador(),
    );
    this.error.set(error);
    if (!error) this.guardada.emit();
  }
}
