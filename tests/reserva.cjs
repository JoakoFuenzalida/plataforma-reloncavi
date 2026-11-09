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
    await page.goto(
      "http://127.0.0.1:4202/reservar/datos?hotel=puerto-montt&tipo=STD&llegada=2029-01-18&salida=2029-01-21&adultos=1",
    );
    await page
      .getByRole("button", { name: "Continuar al pago", exact: true })
      .click();
    assert.equal(await page.locator('input[aria-invalid="true"]').count(), 4);
    for (const [label, value] of [
      ["Nombres", "Ana"],
      ["Apellidos", "Prueba"],
      ["Correo electrónico", "ana@example.com"],
      ["Teléfono", "+56912345678"],
    ])
      await page.getByLabel(label, { exact: true }).fill(value);
    await page
      .getByRole("button", { name: "Continuar al pago", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Pago simulado", exact: true })
      .waitFor();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Simular rechazo", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Pago rechazado" })
      .waitFor();
    await page
      .getByRole("button", { name: "Simular aprobación", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Reserva confirmada", exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Completar registro previo" }).click();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel("Número de documento ficticio").fill("DEMO123");
    await page
      .getByRole("button", { name: "Enviar registro", exact: true })
      .click();
    await page.getByRole("alert").waitFor();
    await page
      .getByRole("button", { name: "Simular cámara", exact: true })
      .click();
    await page.getByLabel("Firmo esta ficha").check();
    await page.getByLabel("Consiento el uso").check();
    await page
      .getByRole("button", { name: "Enviar registro", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Registro enviado" })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "OK: validación, rechazo, aprobación, confirmación, registro móvil y ausencia de errores runtime.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
