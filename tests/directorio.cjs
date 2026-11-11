const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4202/personal/huespedes");
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    await page.getByText("REL-2029-0001", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Editar ficha", exact: true })
      .click();
    await page.getByLabel("Teléfono", { exact: true }).fill("+44 7700 900999");
    await page
      .getByLabel("Preferencias", { exact: true })
      .fill("Piso alto, Habitación tranquila");
    await page.getByRole("button", { name: "Guardar ficha" }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Ficha guardada" })
      .waitFor();
    await page.getByRole("button", { name: "Nueva ficha" }).click();
    await page.getByRole("button", { name: "Guardar ficha" }).click();
    await page.getByRole("alert").waitFor();
    for (const [label, value] of [
      ["Nombres", "Ana"],
      ["Apellidos", "Prueba"],
      ["Correo electrónico", "ana@example.com"],
      ["Teléfono", "+56911112222"],
    ])
      await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Guardar ficha" }).click();
    await page
      .getByRole("heading", { name: "Ana Prueba", exact: true })
      .waitFor();
    await page.getByLabel("Buscar por nombre o correo").fill("inexistente");
    await page
      .getByText("No hay personas que coincidan con la búsqueda.", {
        exact: true,
      })
      .waitFor();
    await page.getByLabel("Buscar por nombre o correo").fill("");
    // Navegación SPA: conservar el directorio en memoria durante la reserva.
    await page.getByRole("link", { name: "Cambiar perfil" }).click();
    await page.getByRole("button", { name: /Huésped Emily/ }).click();
    // El buscador público conduce a la selección por controles reales.
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    await page
      .getByRole("button", { name: /^Elegir/ })
      .first()
      .click();
    await page
      .getByRole("heading", { name: "Tus datos", exact: true })
      .waitFor();
    await page.locator("#reservante-existente").selectOption("huesped-james");
    await page
      .getByLabel("El reservante también paga", { exact: true })
      .uncheck();
    await page
      .getByLabel("El reservante también se aloja", { exact: true })
      .uncheck();
    await page.locator("#pagador-existente").selectOption("huesped-camilo");
    await page.locator("#alojado-0-existente").selectOption("huesped-emily");
    const guest2 = page.locator("#alojado-1-existente");
    await guest2.selectOption({ label: "Ana Prueba · ana@example.com" });
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await page
      .getByRole("heading", { name: "Pago simulado", exact: true })
      .waitFor();
    await page.getByText("Reservante: James Wilson", { exact: true }).waitFor();
    await page.getByText("Pagador: Camilo Soto", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Editar datos", exact: true }).click();
    await page.locator("#reservante-existente").waitFor();
    assert.equal(
      await page.locator("#reservante-existente").inputValue(),
      "huesped-james",
    );
    assert.equal(
      await page.locator("#pagador-existente").inputValue(),
      "huesped-camilo",
    );
    assert.equal(
      await page.locator("#alojado-0-existente").inputValue(),
      "huesped-emily",
    );
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Simular aprobación" }).click();
    await page.getByRole("heading", { name: "Reserva confirmada" }).waitFor();
    await page.getByRole("link", { name: "Completar registro previo" }).click();
    for (const [label, documento] of [
      ["Emily Carter", "EMILY123"],
      ["Ana Prueba", "ANA456"],
    ]) {
      await page.locator("#registro-huesped").selectOption({ label });
      await page.getByLabel("Número de documento ficticio").fill(documento);
      await page.getByRole("button", { name: "Simular cámara" }).click();
      await page.getByLabel("Firmo esta ficha").check();
      await page.getByLabel("Consiento el uso").check();
      await page
        .getByRole("button", { name: "Enviar registro", exact: true })
        .click();
      await page
        .getByRole("status")
        .filter({ hasText: "Registro enviado" })
        .waitFor();
    }
    await page.getByText("2 / 2 fichas enviadas", { exact: true }).waitFor();
    await page
      .getByRole("link", { name: "Cambiar perfil", exact: true })
      .click();
    await page.getByRole("button", { name: /Recepción Camila/ }).click();
    await page
      .getByRole("link", { name: "Directorio de huéspedes", exact: true })
      .click();
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    assert.equal(
      await page.getByRole("button", { name: /Emily Carter/ }).count(),
      1,
    );
    const domain = await page.evaluate(() => {
      const op = window.ng.getComponent(
        document.querySelector("app-directorio"),
      ).op;
      const check = (ok, msg) => {
        if (!ok) throw Error(msg);
      };
      check(op.huespedes().length === 4, "Reutiliza identidades sin duplicar");
      const reserva = op.reservas().at(-1);
      check(
        reserva.reservanteId === "huesped-james" &&
          reserva.pagadorId === "huesped-camilo",
        "Conserva roles distintos",
      );
      check(
        reserva.huespedesIds.length === 2 &&
          reserva.registrosPrevios.length === 2,
        "Registra cada acompañante",
      );
      check(
        op.huespedPorId("huesped-emily").telefono === "+44 7700 900999",
        "Conserva edición de contacto",
      );
      check(
        op.reservasDePersona("huesped-emily").length === 2,
        "Historial de varias reservas",
      );
      const antes = op.huespedes().length;
      const p = op.huespedPorId("huesped-emily");
      op.borrador.set({
        hotelId: "puerto-varas",
        tipo: "STD",
        llegada: "2029-03-01",
        salida: "2029-03-03",
        adultos: 2,
        huesped: p,
        pagador: p,
        alojados: [p, p],
      });
      check(op.confirmarReserva() === null, "No admite mismo ID dos veces");
      check(
        op.huespedes().length === antes,
        "Reserva inválida no crea personas",
      );
      const prev = reserva.registrosPrevios.length;
      op.guardarRegistro(
        reserva.id,
        { ...reserva.registrosPrevios[0], huespedId: "huesped-james" },
        "es",
        "",
      );
      check(
        op.reservaPorId(reserva.id).registrosPrevios.length === prev,
        "No registra a un reservante que no se aloja",
      );
      return "OK: identidades, roles, acompañantes, historial y validaciones del dominio.";
    });
    console.log(domain);
    for (const [width, height] of [
      [1920, 1080],
      [1366, 768],
      [768, 1024],
      [1024, 768],
      [375, 812],
    ]) {
      await page.setViewportSize({ width, height });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `Directorio desborda ${width}`,
      );
    }

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(
      "http://127.0.0.1:4202/reservar/datos?hotel=puerto-varas&tipo=STD&llegada=2029-02-01&salida=2029-02-03&adultos=2",
    );
    await page.locator("#sel-idioma").selectOption("en");
    for (const [selector, value] of [
      ["#nombres", "Booker"],
      ["#apellidos", "Demo"],
      ["#correo", "booker@example.com"],
      ["#telefono", "+56912345678"],
    ])
      await page.locator(selector).fill(value);
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Complete the payer" })
      .waitFor();
    for (const [field, value] of [
      ["nombres", "New"],
      ["apellidos", "Companion"],
      ["correo", "companion@example.com"],
      ["telefono", "+56987654321"],
    ])
      await page.locator("#alojado-0-" + field).fill(value);
    for (const [width, height] of [
      [1920, 1080],
      [1366, 768],
      [768, 1024],
      [1024, 768],
      [375, 812],
    ]) {
      await page.setViewportSize({ width, height });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `Reserva con acompañante desborda ${width}`,
      );
    }
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await page
      .getByRole("heading", { name: "Simulated payment", exact: true })
      .waitFor();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Simulate approval" }).click();
    await page.getByRole("heading", { name: "Booking confirmed" }).waitFor();
    await page
      .getByRole("link", { name: "Complete pre-arrival registration" })
      .click();
    await page
      .locator("#registro-huesped")
      .selectOption({ label: "New Companion" });
    await page.getByLabel("Fictional document number").fill("NEW123");
    await page.getByRole("button", { name: "Simulate camera" }).click();
    await page.getByLabel("I sign this simulated").check();
    await page.getByLabel("I consent to using fictional").check();
    await page.getByRole("button", { name: "Submit registration" }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Registration sent" })
      .waitFor();
    await page.getByText("1 / 2 registrations sent", { exact: true }).waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      "Registro individual móvil",
    );
    assert.deepEqual(errors, []);
    console.log(
      "OK: directorio, edición, roles distintos, acompañante nuevo, ES/EN, vuelta al formulario y registro individual.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
