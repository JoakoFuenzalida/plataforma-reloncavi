import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { DemoState } from "../../core/demo-state";
import { OperacionState } from "../../core/operacion-state";
import { hotelPorId } from "../../core/hoteles";

@Component({
  selector: "app-pago",
  imports: [RouterLink],
  styles:
    ":host{display:block;padding:var(--s-6) 0}.tarjeta{max-width:720px;margin:auto}.btn{white-space:normal}",
  template: `<div class="contenedor">
    <section class="tarjeta pila">
      <nav>
        <a routerLink="/inicio">{{ tr("Inicio", "Home") }}</a> /
        {{ tr("Reserva", "Booking") }}
      </nav>
      @if (confirmacion) {
        @if (reserva(); as r) {
          <span class="distintivo distintivo-exito">{{
            tr("Paso 4 de 4", "Step 4 of 4")
          }}</span>
          <h1>{{ tr("Reserva confirmada", "Booking confirmed") }}</h1>
          <p>
            {{ tr("Tu código", "Your code") }}: <strong>{{ r.codigo }}</strong>
          </p>
          <p>
            {{ hotel(r.hotelId)?.nombre }} · {{ r.llegada }} → {{ r.salida }}
          </p>
          <p>
            {{ tr("Pago simulado aprobado", "Simulated payment approved") }}:
            {{ demo.precio(r.totalAlojamientoClp) }}
          </p>
          <div class="mensaje mensaje-exito" role="status">
            <p>
              {{
                tr(
                  "Notificación simulada en español. No se ha enviado ningún correo ni realizado un cobro real.",
                  "Simulated notification in English. No email was sent and no real payment was made."
                )
              }}
            </p>
          </div>
          <a class="btn btn-primario" [routerLink]="['/registro', r.id]">{{
            tr("Completar registro previo", "Complete pre-arrival registration")
          }}</a>
          <a class="btn btn-secundario" routerLink="/">{{
            tr("Cambiar perfil", "Switch profile")
          }}</a>
        } @else {
          <h1>{{ tr("Reserva no disponible", "Booking unavailable") }}</h1>
          <p>
            {{
              tr(
                "La demostración se reinició o el código no existe.",
                "The demo was reset or the code does not exist."
              )
            }}
          </p>
          <a routerLink="/inicio">{{
            tr("Buscar habitación", "Find a room")
          }}</a>
        }
      } @else if (op.borrador(); as b) {
        <span class="distintivo">{{ tr("Paso 3 de 4", "Step 3 of 4") }}</span>
        <h1>{{ tr("Pago simulado", "Simulated payment") }}</h1>
        <p>{{ hotel(b.hotelId)?.nombre }} · {{ b.llegada }} → {{ b.salida }}</p>
        <p>
          {{ b.huesped.nombres }} {{ b.huesped.apellidos }} ·
          {{ b.huesped.correo }}
        </p>
        <p>
          {{
            tr(
              "Reservante, pagador y huésped titular: la misma persona en esta reserva directa.",
              "Booker, payer and lead guest: the same person for this direct booking."
            )
          }}
        </p>
        <h2>{{ demo.precio(total()) }}</h2>
        <p>
          {{
            tr(
              "Usa el medio ficticio DEMO •••• 4242. No ingreses datos bancarios.",
              "Use the fictional method DEMO •••• 4242. Do not enter bank details."
            )
          }}
        </p>
        <label class="casilla"
          ><input
            type="checkbox"
            [checked]="acepta()"
            (change)="acepta.set($any($event.target).checked)"
          />{{
            tr(
              "Acepto las condiciones de la reserva simulada.",
              "I accept the simulated booking conditions."
            )
          }}</label
        >
        <p>
          {{
            tr(
              "Demostración sin cobros, cancelación sin penalización y datos solo en memoria.",
              "Demo without charges, free cancellation and data held only in memory."
            )
          }}
        </p>
        <div class="fila">
          <button
            class="btn btn-primario"
            [disabled]="ocupado() || !acepta()"
            (click)="pagar(true)"
          >
            {{ tr("Simular aprobación", "Simulate approval") }}</button
          ><button
            class="btn btn-secundario"
            [disabled]="ocupado() || !acepta()"
            (click)="pagar(false)"
          >
            {{ tr("Simular rechazo", "Simulate decline") }}
          </button>
        </div>
        @if (ocupado()) {
          <p role="status">
            {{ tr("Procesando pago…", "Processing payment…") }}
          </p>
        }
        @if (error()) {
          <div class="mensaje mensaje-error" role="alert">{{ error() }}</div>
        }
        <a
          routerLink="/reservar/datos"
          [queryParams]="{
            hotel: b.hotelId,
            tipo: b.tipo,
            llegada: b.llegada,
            salida: b.salida,
            adultos: b.adultos,
          }"
          >{{ tr("Editar datos", "Edit details") }}</a
        >
      } @else {
        <h1>{{ tr("Selecciona tu estadía", "Select your stay") }}</h1>
        <a routerLink="/inicio">{{ tr("Buscar habitación", "Find a room") }}</a>
      }
    </section>
  </div>`,
})
export class Pago {
  readonly demo = inject(DemoState);
  readonly op = inject(OperacionState);
  readonly ruta = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly confirmacion = this.ruta.snapshot.data["confirmacion"] === true;
  readonly acepta = signal(false);
  readonly ocupado = signal(false);
  readonly error = signal("");
  readonly hotel = hotelPorId;
  reserva() {
    return this.op.reservaPorId(this.ruta.snapshot.paramMap.get("id") ?? "");
  }
  tr(es: string, en: string) {
    return this.demo.idioma() === "es" ? es : en;
  }
  total() {
    const b = this.op.borrador();
    if (!b) return 0;
    return (
      (hotelPorId(b.hotelId)?.tipos.find((t) => t.codigo === b.tipo)
        ?.tarifaClp ?? 0) *
      ((Date.parse(b.salida) - Date.parse(b.llegada)) / 86400000)
    );
  }
  async pagar(aprobado: boolean) {
    if (this.ocupado() || !this.acepta()) return;
    this.ocupado.set(true);
    this.error.set("");
    await new Promise((resolve) => setTimeout(resolve, 550));
    if (aprobado) {
      const r = this.op.confirmarReserva();
      if (r) await this.router.navigate(["/reservar/confirmacion", r.id]);
      else
        this.error.set(
          this.tr(
            "Ya no quedan cupos. Busca otra habitación.",
            "No availability remains. Find another room.",
          ),
        );
    } else
      this.error.set(
        this.tr(
          "Pago rechazado. Puedes reintentar con la aprobación simulada. No se creó una reserva.",
          "Payment declined. Retry with simulated approval. No booking was created.",
        ),
      );
    this.ocupado.set(false);
  }
}
