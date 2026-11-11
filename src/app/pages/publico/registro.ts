import { Component, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DemoState } from "../../core/demo-state";
import { OperacionState } from "../../core/operacion-state";
import { RegistroPrevio } from "../../core/operacion.modelos";

@Component({
  selector: "app-registro",
  imports: [FormsModule, RouterLink],
  styles:
    ":host{display:block;padding:var(--s-6) 0}.tarjeta{max-width:640px;margin:auto}.archivo{border:2px dashed var(--c-borde-fuerte);padding:var(--s-4);border-radius:var(--r-md)}.btn{white-space:normal}",
  template: `<div class="contenedor">
    <section class="tarjeta pila">
      <a routerLink="/inicio">{{ tr("Inicio", "Home") }}</a>
      <h1>{{ tr("Registro previo", "Pre-arrival registration") }}</h1>
      @if (reserva(); as r) {
        <p>{{ r.codigo }} · {{ r.llegada }} → {{ r.salida }}</p>
        <p>
          {{
            tr(
              "Completa una ficha por cada persona alojada.",
              "Complete one registration for each guest."
            )
          }}
        </p>
        <label class="campo" for="registro-huesped">{{tr('Huésped del registro','Registration guest')}}</label>
        <select class="control" id="registro-huesped" [ngModel]="huespedId()" (ngModelChange)="cambiarHuesped($event)">@for(id of r.huespedesIds;track id){<option [value]="id">{{op.huespedPorId(id)?.nombres}} {{op.huespedPorId(id)?.apellidos}}</option>}</select>
        <p>{{r.registrosPrevios.length}} / {{r.huespedesIds.length}} {{tr('fichas enviadas','registrations sent')}}</p>
        @if(r.estado!=='confirmada' && r.estado!=='alojado'){<p>{{tr('Esta reserva está cerrada. El registro ya no admite cambios.','This booking is closed. Registration can no longer be changed.')}}</p>}
        @else if (enviado()) {
          <div class="mensaje mensaje-exito" role="status">
            {{
              tr(
                "Registro enviado. Recepción revisará tu documento y la evidencia de exención, si corresponde.",
                "Registration sent. Reception will review your document and exemption evidence, if applicable."
              )
            }}
          </div>
          <a class="btn btn-secundario" routerLink="/">{{
            tr("Cambiar perfil", "Switch profile")
          }}</a>
        } @else {
          <form class="pila" (ngSubmit)="enviar()" #f="ngForm">
            <label class="campo"
              >{{ tr("Tipo de documento", "Document type")
              }}<select class="control" name="tipo" [(ngModel)]="tipo">
                <option value="cedula">
                  {{ tr("Cédula", "Identity card") }}
                </option>
                <option value="pasaporte">
                  {{ tr("Pasaporte", "Passport") }}
                </option>
              </select></label
            >
            <label class="campo"
              >{{
                tr("Número de documento ficticio", "Fictional document number")
              }}<input
                class="control"
                name="numero"
                [(ngModel)]="numero"
                required
                maxlength="30"
            /></label>
            <div
              class="archivo pila"
              (dragover)="$event.preventDefault()"
              (drop)="soltar($event, false)"
            >
              <label class="campo"
                >{{
                  tr(
                    "Documento ficticio (PDF o imagen, máximo 5 MB)",
                    "Fictional document (PDF or image, up to 5 MB)"
                  )
                }}<input
                  class="control"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  (change)="archivo($any($event.target).files?.[0], false)"
              /></label>
              <p>
                {{
                  tr(
                    "Arrastra un archivo o utiliza la captura simulada. Solo se guarda su nombre.",
                    "Drop a file or use simulated capture. Only its name is stored."
                  )
                }}
              </p>
              <button
                class="btn btn-secundario"
                type="button"
                (click)="documento = 'documento-demo.jpg'"
              >
                {{ tr("Simular cámara", "Simulate camera") }}</button
              ><span>{{ documento }}</span>
            </div>
            <label class="campo"
              >{{ tr("Idioma preferido", "Preferred language")
              }}<select class="control" name="idioma" [(ngModel)]="idioma">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select></label
            >
            <label class="campo"
              >{{ tr("Preferencias de estadía", "Stay preferences")
              }}<input
                class="control"
                name="preferencias"
                [(ngModel)]="preferencias"
                maxlength="150"
            /></label>
            <label class="casilla"
              ><input
                type="checkbox"
                name="exencion"
                [(ngModel)]="exencion"
              />{{
                tr(
                  "Solicito revisión de exención de IVA",
                  "Request VAT exemption review"
                )
              }}</label
            >
            @if (exencion) {
              <div
                class="archivo"
                (dragover)="$event.preventDefault()"
                (drop)="soltar($event, true)"
              >
                <label class="campo"
                  >{{
                    tr(
                      "Evidencia ficticia de exención",
                      "Fictional exemption evidence"
                    )
                  }}<input
                    class="control"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    (change)="archivo($any($event.target).files?.[0], true)"
                /></label>
                <p>{{ evidencia }}</p>
              </div>
              <p>
                {{
                  tr(
                    "Sujeta a verificación en recepción; no cambia el total automáticamente.",
                    "Subject to reception verification; the total does not change automatically."
                  )
                }}
              </p>
            }
            <label class="casilla"
              ><input type="checkbox" name="firma" [(ngModel)]="firma" />{{
                tr(
                  "Firmo esta ficha de registro simulada",
                  "I sign this simulated registration form"
                )
              }}</label
            >
            <label class="casilla"
              ><input
                type="checkbox"
                name="consentimiento"
                [(ngModel)]="consentimiento"
              />{{
                tr(
                  "Consiento el uso de los datos ficticios durante esta demostración",
                  "I consent to using fictional data during this demo"
                )
              }}</label
            >
            <button class="btn btn-primario" [disabled]="f.invalid">
              {{ tr("Enviar registro", "Submit registration") }}
            </button>
            @if (error()) {
              <p class="mensaje mensaje-error" role="alert">{{ error() }}</p>
            }
          </form>
        }
      } @else {
        <p role="alert">
          {{
            tr(
              "La reserva no existe en esta sesión. Vuelve a reservar.",
              "The booking does not exist in this session. Please book again."
            )
          }}
        </p>
      }
    </section>
  </div>`,
})
export class Registro {
  readonly op = inject(OperacionState);
  readonly demo = inject(DemoState);
  readonly ruta = inject(ActivatedRoute);
  readonly id = this.ruta.snapshot.paramMap.get("id") ?? "";
  readonly huespedId = signal(this.op.reservaPorId(this.id)?.huespedesIds.includes(this.ruta.snapshot.queryParamMap.get('huesped')??'') ? this.ruta.snapshot.queryParamMap.get('huesped')! : this.op.reservaPorId(this.id)?.huespedesIds[0]??'');
  readonly enviado = computed(()=>!!this.reserva()?.registrosPrevios.some(p=>p.huespedId===this.huespedId()));
  readonly error = signal("");
  tipo: RegistroPrevio["tipoDocumento"] = "pasaporte";
  numero = "";
  documento = "";
  evidencia = "";
  exencion = false;
  firma = false;
  consentimiento = false;
  idioma: "es" | "en" = this.demo.idioma();
  preferencias = "";
  constructor(){this.cambiarHuesped(this.huespedId());}
  cambiarHuesped(id:string){if(!this.reserva()?.huespedesIds.includes(id))return;this.huespedId.set(id);this.numero='';this.documento='';this.evidencia='';this.exencion=false;this.firma=false;this.consentimiento=false;this.error.set('');const h=this.op.huespedPorId(id);this.idioma=h?.idioma??this.demo.idioma();this.preferencias=h?.preferencias.join(', ')??'';}
  reserva() {
    return this.op.reservaPorId(this.id);
  }
  tr(es: string, en: string) {
    return this.demo.idioma() === "es" ? es : en;
  }
  soltar(e: DragEvent, evidencia: boolean) {
    e.preventDefault();
    this.archivo(e.dataTransfer?.files[0], evidencia);
  }
  archivo(f: File | undefined, evidencia: boolean) {
    if (!f) return;
    if (!/\.(pdf|png|jpe?g)$/i.test(f.name) || f.size > 5 * 1024 * 1024) {
      this.error.set(
        this.tr(
          "Usa un PDF o imagen de hasta 5 MB.",
          "Use a PDF or image up to 5 MB.",
        ),
      );
      return;
    }
    if (evidencia) this.evidencia = f.name;
    else this.documento = f.name;
    this.error.set("");
  }
  enviar() {
    const r = this.reserva();
    if (
      !r ||
      !this.numero.trim() ||
      !this.documento ||
      !this.firma ||
      !this.consentimiento ||
      (this.exencion && !this.evidencia)
    ) {
      this.error.set(
        this.tr(
          "Completa el documento, la firma, el consentimiento y la evidencia solicitada.",
          "Complete the document, signature, consent and requested evidence.",
        ),
      );
      return;
    }
    this.op.guardarRegistro(
      r.id,
      {
        huespedId: this.huespedId(),
        tipoDocumento: this.tipo,
        numeroDocumento: this.numero.trim(),
        archivoDocumentoNombre: this.documento,
        firmaAceptada: true,
        consentimientoDatos: true,
        solicitaExencionIva: this.exencion,
        evidenciaExencionNombre: this.exencion ? this.evidencia : null,
        estado: "enviado",
      },
      this.idioma,
      this.preferencias,
    );

  }
}
