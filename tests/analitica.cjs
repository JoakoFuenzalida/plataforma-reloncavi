const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://127.0.0.1:4202/personal/tablero');
    await page.getByRole('heading', { name: 'Histórico de demostración', exact: true }).waitFor();
    for (const nombre of [
      'Ocupación diaria',
      'Ingresos de alojamiento',
      'Ocupación y ADR',
      'Ocupación por hotel y fecha',
    ])
      await page.getByRole('heading', { name: nombre, exact: true }).waitFor();
    console.log(
      await page.evaluate(() => {
        const a = ng.getComponent(document.querySelector('app-analitica'));
        const check = (v, m) => {
          if (!v) throw Error(m);
        };
        const filas = a.filas(),
          s = a.resumen();
        check(filas.length === 63, '7 días por 9 hoteles');
        const disp = filas.reduce((n, r) => n + r.disponibles, 0),
          occ = filas.reduce((n, r) => n + r.ocupadas, 0),
          ing = filas.reduce((n, r) => n + r.ingresoClp, 0);
        check(Math.abs(s.ocupacion - (100 * occ) / disp) < 1e-9, 'ocupación ponderada');
        check(s.adr === ing / occ, 'ADR ponderado');
        check(s.revpar === ing / disp, 'RevPAR ponderado');
        check(Math.abs(s.revpar - (s.adr * s.ocupacion) / 100) < 1e-8, 'identidad RevPAR');
        const llegadas = filas.reduce((n, r) => n + r.llegadas, 0);
        check(
          s.checkin === filas.reduce((n, r) => n + r.segundosCheckin, 0) / llegadas,
          'check-in ponderado',
        );
        check(a.diarios().length === 7 && a.porHotel().length === 9, 'series coherentes');
        check(!a.csv().includes('NaN'), 'CSV finito');
        return 'OK: agregación ponderada, identidad RevPAR y consistencia de series.';
      }),
    );
    const descarga = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar histórico CSV', exact: true }).click();
    const d = await descarga;
    assert.equal(d.suggestedFilename(), 'historico-demo-2029-01-12-2029-01-18.csv');
    const csv = await fs.readFile(await d.path(), 'utf8');
    assert.equal(csv.split('\r\n').length, 64);
    assert.ok(csv.includes('Serie ficticia independiente'));
    assert.ok(csv.includes('Ingreso alojamiento CLP'));
    await page.getByLabel('Desde', { exact: true }).fill('2029-01-18');
    await page.getByLabel('Hasta', { exact: true }).fill('2029-01-17');
    await page.getByRole('alert').filter({ hasText: 'posterior' }).waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Exportar histórico CSV' }).isDisabled(),
      true,
    );
    await page.getByLabel('Hasta', { exact: true }).fill('2029-01-18');
    assert.equal(
      await page.evaluate(
        () => ng.getComponent(document.querySelector('app-analitica')).filas().length,
      ),
      9,
    );
    assert.equal(
      await page.evaluate(() =>
        document.querySelector('app-analitica svg polyline').getAttribute('points').includes('NaN'),
      ),
      false,
    );
    await page.locator('app-tablero select').nth(0).selectOption('puerto-montt');
    assert.equal(
      await page.evaluate(
        () => ng.getComponent(document.querySelector('app-analitica')).filas().length,
      ),
      1,
    );
    await page.getByRole('button', { name: /2029-01-18:.*ver registro/ }).click();
    assert.equal(
      await page.evaluate(
        () => ng.getComponent(document.querySelector('app-analitica')).detalle().length,
      ),
      1,
    );
    await page.getByRole('button', { name: 'Últimos 7 días', exact: true }).click();
    await page.getByRole('button', { name: /Ver registros de/ }).click();
    assert.equal(
      await page.evaluate(
        () => ng.getComponent(document.querySelector('app-analitica')).detalle().length,
      ),
      7,
    );
    await page.locator('app-tablero select').nth(1).selectOption('lodge');
    await page
      .getByText('No hay registros históricos para estos filtros.', { exact: true })
      .waitFor();
    await page.locator('app-tablero select').nth(0).selectOption('');
    assert.ok(
      await page.evaluate(() =>
        ng
          .getComponent(document.querySelector('app-analitica'))
          .filas()
          .every((r) => r.hotelId.startsWith('lodge')),
      ),
    );
    await page.getByRole('button', { name: 'Ver todos los registros', exact: true }).click();
    await page.locator('app-tablero select').nth(1).selectOption('');
    for (const [width, height] of [
      [1920, 1080],
      [1366, 768],
      [768, 1024],
      [1024, 768],
      [375, 812],
    ]) {
      await page.setViewportSize({ width, height });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
        'desbordamiento ' + width,
      );
    }
    await page.getByLabel('Desde', { exact: true }).fill('2029-01-01');
    await page.getByLabel('Hasta', { exact: true }).fill('2029-01-18');
    assert.equal(
      await page.evaluate(
        () => ng.getComponent(document.querySelector('app-analitica')).filas().length,
      ),
      162,
    );
    const descarga2 = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar histórico CSV' }).click();
    const d2 = await descarga2;
    const csv2 = await fs.readFile(await d2.path(), 'utf8');
    assert.equal(csv2.split('\r\n').length, 163);
    assert.deepEqual(errors, []);
    console.log(
      'OK: filtros, fechas inválidas, día único, detalle por hotel/celda, CSV real y cinco tamaños.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
