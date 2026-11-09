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
    await page.goto("http://127.0.0.1:4202/personal/recepcion");
    await page.getByRole("button", { name: /Camilo Soto/ }).click();
    await page
      .locator('[data-testid="saldo"]')
      .filter({ hasText: "$0" })
      .waitFor();
    await page.getByLabel("Concepto", { exact: true }).fill("Cena");
    await page.getByLabel("Monto CLP", { exact: true }).fill("35000");
    await page
      .getByRole("button", { name: "Agregar cargo", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cobrar extras contra preautorización" })
      .click();
    await page
      .locator('[data-testid="saldo"]')
      .filter({ hasText: "$0" })
      .waitFor();
    await page.getByLabel("Nueva fecha de salida").fill("2029-01-22");
    await page.getByRole("button", { name: "Confirmar extensión" }).click();
    await page
      .locator('[data-testid="alojamiento"]')
      .filter({ hasText: "$420.000" })
      .waitFor();
    await page
      .locator('[data-testid="saldo"]')
      .filter({ hasText: "$168.000" })
      .waitFor();
    await page.getByLabel("Nueva fecha de salida").fill("2029-01-21");
    assert.equal(
      await page
        .getByRole("button", { name: "Confirmar extensión" })
        .isDisabled(),
      true,
    );
    await page.getByLabel("Nueva fecha de salida").fill("");
    await page.getByRole("button", { name: "Revisar check-out" }).click();
    await page.getByRole("button", { name: "Cancelar salida" }).click();
    await page.getByRole("button", { name: "Revisar check-out" }).click();
    await page
      .getByRole("button", { name: "Simular pago rechazado", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Pago rechazado" })
      .waitFor();
    assert.match(
      await page.locator('[data-testid="saldo"]').innerText(),
      /168.000/,
    );
    await page
      .getByRole("button", { name: "Simular pago aprobado y finalizar" })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Check-out completado" })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Agregar cargo", exact: true })
        .count(),
      0,
    );
    assert.match(
      await page.locator('[data-testid="saldo"]').innerText(),
      /\$0/,
    );
    await page.getByRole("link", { name: "Tablero", exact: true }).click();
    assert.equal(
      await page.locator('[data-testid="salidas"]').innerText(),
      "1",
    );
    assert.equal(
      await page.locator('[data-testid="limpieza"]').innerText(),
      "3",
    );
    await page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Ocupación", exact: true }),
      })
      .getByText("0%", { exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Housekeeping", exact: true }).click();
    const room = page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Habitación 204", exact: true }),
      });
    await room.getByText("Por limpiar", { exact: true }).waitFor();
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
    await page.getByRole("button", { name: /Camilo Soto/ }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "Check-out completado" })
      .waitFor();
    assert.match(
      await page.locator('[data-testid="saldo"]').innerText(),
      /\$0/,
    );
    // Casos límite del dominio en el mismo servicio que utiliza la interfaz.
    const resultado = await page.evaluate(() => {
      const op = window.ng.getComponent(
        document.querySelector("app-operacion"),
      ).op;
      const id = "reserva-alojada";
      const assert = (ok, msg) => {
        if (!ok) throw new Error(msg);
      };
      const pagos = op.pagosSalida().length;
      assert(!!op.checkout(id, true), "No permite segunda salida");
      assert(op.pagosSalida().length === pagos, "No duplica pagos");
      assert(
        !op.agregarCargo(id, "Después del cierre", 10),
        "No acepta cargos en folio cerrado",
      );
      assert(
        !!op.extenderEstadia(id, "2029-01-25"),
        "No extiende reserva cerrada",
      );
      op.reiniciarDemostracion();
      const base = op.reservaPorId(id);
      // Asignación futura a la misma habitación: bloquea extensión sin mutar fechas ni total.
      op.datos.update((d) => ({
        ...d,
        reservas: [
          ...d.reservas,
          {
            ...base,
            id: "conflicto",
            codigo: "CONFLICTO",
            estado: "confirmada",
            llegada: "2029-01-20",
            salida: "2029-01-23",
          },
        ],
      }));
      assert(
        !!op.extenderEstadia(id, "2029-01-22"),
        "Detecta asignación incompatible",
      );
      assert(
        op.reservaPorId(id).salida === "2029-01-20",
        "Conserva salida ante conflicto",
      );
      op.reiniciarDemostracion();
      op.datos.update((d) => ({
        ...d,
        reservas: [
          ...d.reservas,
          ...[1, 2, 3].map((n) => ({
            ...base,
            id: "cupo" + n,
            estado: "confirmada",
            habitacionId: null,
            llegada: "2029-01-20",
            salida: "2029-01-22",
          })),
        ],
      }));
      assert(
        !!op.extenderEstadia(id, "2029-01-22"),
        "Detecta agotamiento de cupo",
      );
      op.reiniciarDemostracion();
      assert(
        !!op.extenderEstadia(id, "2029-02-30"),
        "Rechaza fecha inexistente",
      );
      assert(!op.checkout(id, true), "Cierra sin saldo");
      assert(op.pagosSalida().length === 0, "No crea pago de monto cero");
      op.reiniciarDemostracion();
      op.desconectar("puerto-montt");
      op.agregarCargo(id, "Extra", 200001);
      assert(!!op.checkout(id, true), "No supera preautorización offline");
      assert(op.pagosSalida().length === 0, "No registra pago sobre límite");
      op.reconectar("puerto-montt");
      assert(
        !op.checkout(id, true),
        "Permite pago online sobre preautorización",
      );
      assert(op.folio(id).saldo === 0, "Liquida saldo");
      op.reiniciarDemostracion();
      op.desconectar("puerto-montt");
      op.agregarCargo(id, "Extra", 10000);
      assert(!op.checkout(id, true), "Permite salida offline cubierta");
      const cola = op.cola().length;
      op.reconectar("puerto-montt");
      op.reconectar("puerto-montt");
      assert(op.cola().length === cola, "No duplica cola");
      assert(op.folio(id).saldo === 0, "Conserva pago offline");
      op.reiniciarDemostracion();
      op.desconectar("puerto-montt");
      op.avanzarHora("puerto-montt");
      op.avanzarHora("puerto-montt");
      assert(!!op.checkout(id, true), "Respeta 24 h incluso sin saldo");
      op.reiniciarDemostracion();
      return "Reglas de extensión, cierre, preautorización e idempotencia correctas";
    });
    console.log(resultado);
    await page.getByRole("button", { name: /Camilo Soto/ }).click();
    await page.getByRole("button", { name: "Revisar check-out" }).click();
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
        `Desbordamiento en ${width}`,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      "OK: folio, abonos, extensión, rechazo/reintento, checkout, limpieza, tablero y cinco tamaños.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
