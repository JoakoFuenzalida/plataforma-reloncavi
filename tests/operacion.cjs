const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4202/personal/recepcion");
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    await page
      .getByRole("button", {
        name: "Confirmar check-in y entregar llave",
        exact: true,
      })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Verifica el documento" })
      .waitFor();
    await page
      .getByRole("button", { name: "Solicitar prioridad", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Esperar y avisar", exact: true })
      .click();
    await page.getByRole("link", { name: "Housekeeping", exact: true }).click();
    const room = page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Habitación 201", exact: true }),
      });
    await room.getByText("Prioridad alta", { exact: true }).waitFor();
    await room.getByRole("button", { name: "Iniciar limpieza" }).click();
    await room.getByRole("button", { name: "Finalizar limpieza" }).click();
    await room
      .getByRole("button", { name: "Inspeccionar", exact: true })
      .click();
    assert.equal(
      await room
        .getByRole("button", { name: "Confirmar liberación" })
        .isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "Cambiar operador" }).click();
    await room.getByLabel("Limpieza y baño revisados").check();
    await room.getByLabel("Equipamiento y seguridad revisados").check();
    await room.getByRole("button", { name: "Confirmar liberación" }).click();
    await room
      .getByText("Lista para recibir huéspedes", { exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Recepción", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "habitación 201 lista" })
      .waitFor();
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    await page
      .getByLabel("Documento verificado (ficticio)", { exact: true })
      .fill("DEMO123");
    await page.getByLabel("Verifiqué identidad").check();
    await page
      .getByRole("button", { name: "Confirmar check-in y entregar llave" })
      .click();
    await page
      .getByText(
        "Check-in completado · Llave electrónica entregada en simulación.",
        { exact: true },
      )
      .waitFor();
    await page.getByRole("combobox").first().selectOption("lodge-aysen");
    await page
      .getByRole("button", { name: "Simular pérdida de enlace" })
      .click();
    await page.getByRole("button", { name: /James Wilson/ }).click();
    await page
      .getByLabel("Documento verificado (ficticio)", { exact: true })
      .fill("DEMO456");
    await page.getByLabel("Verifiqué identidad").check();
    await page
      .getByRole("button", { name: "Confirmar check-in y entregar llave" })
      .click();
    await page
      .getByText(
        "Check-in completado · Llave mecánica entregada en simulación.",
        { exact: true },
      )
      .waitFor();
    await page.getByLabel("Concepto", { exact: true }).fill("Excursión");
    await page.getByLabel("Monto CLP").fill("35000");
    await page.getByRole("button", { name: "Agregar cargo" }).click();
    await page
      .getByRole("button", { name: "Cobrar extras contra preautorización" })
      .click();
    await page.getByText("Cola de operaciones (3)", { exact: true }).click();
    await page.getByText(/Riesgo de rechazo diferido/).waitFor();
    for (let i = 0; i < 8; i++)
      await page.getByRole("button", { name: "Simular 12 horas" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Límite de autonomía" })
      .waitFor();
    await page.getByRole("button", { name: "Reconectar", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Sincronización completada" })
      .waitFor();
    assert.equal(
      await page
        .locator("li")
        .filter({ hasText: /Excursión.*sincronizado/ })
        .count(),
      2,
    ); // un cargo del folio y su evento de cola
    await page
      .getByRole("button", { name: "Simular pérdida de enlace" })
      .click();
    await page.getByRole("button", { name: "Reconectar", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Sincronización completada" })
      .waitFor();
    assert.equal(
      await page
        .locator("li")
        .filter({ hasText: /Excursión.*sincronizado/ })
        .count(),
      2,
    );
    assert.deepEqual(errors, []);
    console.log(
      "OK: prioridad, espera, limpieza, inspección, aviso, check-in urbano/lodge, cola, cobro, límite 96 h y reconexión idempotente.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
