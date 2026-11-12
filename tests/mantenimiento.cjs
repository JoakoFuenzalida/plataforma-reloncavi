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
    await page.goto("http://127.0.0.1:4202/terreno");
    const room = page
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Habitación 202", exact: true }),
      });
    await room.getByRole("button", { name: "Reportar incidencia" }).click();
    await room.getByRole("button", { name: "Crear orden y bloquear" }).click();
    await room
      .getByRole("alert")
      .filter({ hasText: "Describe la causa" })
      .waitFor();
    await room.getByLabel("Causa del bloqueo").fill("Fuga de agua en el baño");
    await room
      .getByLabel("Foto de la incidencia (opcional)", { exact: true })
      .setInputFiles({
        name: "no-es-imagen.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("invalido"),
      });
    await room
      .getByRole("alert")
      .filter({ hasText: "Usa una imagen" })
      .waitFor();
    await room
      .getByLabel("Foto de la incidencia (opcional)", { exact: true })
      .setInputFiles({
        name: "incidencia.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH1cAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await room.getByAltText("Vista previa de la incidencia").waitFor();
    await room.getByRole("button", { name: "Crear orden y bloquear" }).click();
    await room
      .getByText("Bloqueada por mantenimiento", { exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Recepción", exact: true }).click();
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    await page
      .getByRole("button", { name: "Confirmar check-in y entregar llave" })
      .waitFor();
    assert.equal(await page.locator('option[value="pm-202"]').count(), 0);
    await page.getByRole("link", { name: "Tablero", exact: true }).click();
    assert.equal(
      await page.locator('[data-testid="bloqueos"]').innerText(),
      "1",
    );
    await page
      .getByRole("link", { name: "Mantenimiento", exact: true })
      .click();
    await page
      .getByRole("button", { name: /OT-0001 · Habitación 202/ })
      .click();
    await page
      .getByAltText("Foto de incidencia: Fuga de agua en el baño")
      .waitFor();
    await page
      .getByRole("button", { name: "Tomar orden e iniciar trabajo" })
      .click();
    await page.getByRole("button", { name: "Enviar a aprobación" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Describe el trabajo" })
      .waitFor();
    await page
      .getByLabel("Trabajo realizado")
      .fill("Reemplazo de sello y prueba de estanqueidad.");
    await page.getByLabel("Reparación completada y probada").check();
    await page.getByLabel("Área y equipos seguros").check();
    await page.getByRole("button", { name: "Enviar a aprobación" }).click();
    assert.equal(
      await page.getByRole("button", { name: "Revisar liberación" }).count(),
      0,
    );
    await page.getByRole("button", { name: "Cambiar a supervisor" }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Revisar liberación" })
        .isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "Devolver al técnico" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Indica por qué" })
      .waitFor();
    await page
      .getByLabel("Motivo de devolución")
      .fill("Repetir prueba con agua caliente.");
    await page.getByRole("button", { name: "Devolver al técnico" }).click();
    await page.getByRole("button", { name: "Cambiar a técnico" }).click();
    await page
      .getByLabel("Trabajo realizado")
      .fill("Prueba en frío y caliente completada.");
    await page.getByLabel("Reparación completada y probada").check();
    await page.getByLabel("Área y equipos seguros").check();
    await page.getByRole("button", { name: "Enviar a aprobación" }).click();
    await page.getByRole("button", { name: "Cambiar a supervisor" }).click();
    await page.getByLabel("Funcionamiento verificado presencialmente").check();
    await page.getByLabel("Seguridad y equipamiento revisados").check();
    await page
      .getByLabel("Limpieza y preparación para el huésped verificadas")
      .check();
    await page.getByRole("button", { name: "Revisar liberación" }).click();
    await page.getByRole("button", { name: "Cancelar liberación" }).click();
    await page.getByRole("button", { name: "Revisar liberación" }).click();
    await page.getByRole("button", { name: "Confirmar liberación" }).click();
    await page
      .getByText(
        "Orden cerrada. Liberación aprobada por Supervisora de mantenimiento.",
        { exact: true },
      )
      .waitFor();
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
        `Desbordamiento mantenimiento ${width}`,
      );
    }
    await page.getByLabel("Buscar orden o habitación").fill("INEXISTENTE");
    await page
      .getByRole("heading", { name: "No hay órdenes para este filtro" })
      .waitFor();
    await page.getByLabel("Buscar orden o habitación").fill("");
    // En pantallas angostas el menú principal se abre con el botón de menú.
    if (await page.getByRole("button", { name: "Abrir menú principal" }).isVisible()) await page.getByRole("button", { name: "Abrir menú principal" }).click();
    await page.getByRole("link", { name: "Recepción", exact: true }).click();
    await page.getByRole("button", { name: /Emily Carter/ }).click();
    await page.locator('option[value="pm-202"]').waitFor({ state: "attached" });
    assert.equal(await page.locator('option[value="pm-202"]').count(), 1);
    const resultado = await page.evaluate(() => {
      const op = window.ng.getComponent(
        document.querySelector("app-operacion"),
      ).op;
      const check = (ok, msg) => {
        if (!ok) throw Error(msg);
      };
      const crear = (id) => {
        const error = op.reportarIncidencia(
          id,
          "Falla de prueba",
          null,
          "Marta Huenchullán",
        );
        check(!error, error);
        return op.ordenActiva(id);
      };
      op.reiniciarDemostracion();
      const cupos = op.cupos("puerto-montt", "STD", "2029-02-01", "2029-02-03");
      const o = crear("pm-202");
      check(
        op.cupos("puerto-montt", "STD", "2029-02-01", "2029-02-03") ===
          cupos - 1,
        "Bloqueo reduce cupos",
      );
      check(
        !!op.reportarIncidencia(
          "pm-202",
          "Duplicada",
          null,
          "Marta Huenchullán",
        ),
        "Evita órdenes activas duplicadas",
      );
      check(op.ordenes().length === 1, "Sin duplicación");
      check(!op.limpiar("pm-202", true), "Housekeeping no salta bloqueo");
      check(
        !!op.checkin("reserva-demo-001", "pm-202", "DEMO", true, true),
        "Check-in bloqueado",
      );
      check(
        !!op.revisarMantenimiento(o.id, true, true, true, true),
        "No aprueba orden reportada",
      );
      check(!op.iniciarMantenimiento(o.id), "Inicia orden");
      check(
        !op.solicitarAprobacion(o.id, "Reparado", true, true),
        "Envía orden",
      );
      check(
        !!op.revisarMantenimiento(o.id, true, true, true, true),
        "Técnico no aprueba",
      );
      op.operadorMantenimiento.set("supervisor");
      check(
        !!op.revisarMantenimiento(o.id, true, true, false, true),
        "Checklist incompleto bloquea liberación",
      );
      check(
        !op.revisarMantenimiento(o.id, true, true, true, true),
        "Supervisor libera",
      );
      check(
        !!op.revisarMantenimiento(o.id, true, true, true, true),
        "No libera dos veces",
      );
      op.reiniciarDemostracion();
      const ocupada = crear("pm-204");
      check(
        op.habitacionPorId("pm-204").estado === "ocupada",
        "Conserva ocupación",
      );
      check(
        !!op.extenderEstadia("reserva-alojada", "2029-01-22"),
        "No extiende con incidencia",
      );
      op.iniciarMantenimiento(ocupada.id);
      op.solicitarAprobacion(ocupada.id, "Reparado", true, true);
      op.operadorMantenimiento.set("supervisor");
      check(
        !!op.revisarMantenimiento(ocupada.id, true, true, true, true),
        "No libera ocupada",
      );
      check(
        !op.checkout("reserva-alojada", true),
        "Permite salida del huésped",
      );
      check(
        op.habitacionPorId("pm-204").estado === "bloqueada",
        "Salida conserva bloqueo",
      );
      check(!op.limpiar("pm-204", true), "Limpieza no libera orden activa");
      check(
        !op.revisarMantenimiento(ocupada.id, true, true, true, true),
        "Libera después de salida e inspección",
      );
      op.reiniciarDemostracion();
      op.desconectar("puerto-montt");
      const offline = crear("pm-202");
      op.iniciarMantenimiento(offline.id);
      check(op.cola().length === 2, "Cola offline registra bloqueo y trabajo");
      op.reconectar("puerto-montt");
      op.reconectar("puerto-montt");
      check(
        op.cola().length === 2 &&
          op.cola().every((e) => e.estado === "sincronizado"),
        "Sincroniza sin duplicados",
      );
      op.reiniciarDemostracion();
      op.desconectar("puerto-montt");
      op.avanzarHora("puerto-montt");
      op.avanzarHora("puerto-montt");
      check(
        !!op.reportarIncidencia("pm-202", "Falla", null, "Marta Huenchullán"),
        "Respeta límite offline",
      );
      op.reiniciarDemostracion();
      return "OK: invariantes de bloqueo, roles, ocupación, cupos, checkout y sincronización.";
    });
    console.log(resultado);
    assert.deepEqual(errors, []);
    console.log(
      "OK: foto, reporte, reparación, devolución, aprobación, liberación, filtros y cinco tamaños.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
