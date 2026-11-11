const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const base = 'http://127.0.0.1:4202';
    for (const [width, height] of [
      [1920, 1080],
      [1366, 768],
      [768, 1024],
      [1024, 768],
      [375, 812],
    ]) {
      await page.setViewportSize({ width, height });
      for (const route of [
        '/',
        '/personal/recepcion',
        '/terreno',
        '/personal/tablero',
        '/registro/reserva-demo-001',
        '/reservar/pago',
      ]) {
        await page.goto(base + route);
        await page.locator('h1').waitFor();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
          false,
          `${route} desborda en ${width}`,
        );
      }
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(base + '/personal/tablero');
    await page.getByText('Camilo', { exact: false }).count();
    assert.equal(
      await page
        .getByRole('table', { name: 'Registros que sustentan ADR y RevPAR' })
        .locator('tbody tr')
        .count(),
      1,
    );
    await page.getByRole('combobox').first().selectOption('puerto-montt');
    await page.getByText('REL-2029-ALOJADO', { exact: true }).waitFor();
    await page.getByRole('combobox').nth(1).selectOption('lodge');
    await page
      .getByText('No hay hoteles para esta combinación de filtros.', {
        exact: true,
      })
      .waitFor();
    await page.goto(base + '/registro/reserva-demo-001');
    await page.locator('#sel-idioma').selectOption('en');
    await page.getByRole('heading', { name: 'Pre-arrival registration' }).waitFor();
    await page.getByLabel('Fictional document number').fill('DEMO-EN');
    await page.getByRole('button', { name: 'Simulate camera' }).click();
    await page.getByLabel('Request VAT exemption review').check();
    await page.getByLabel('I sign this simulated').check();
    await page.getByLabel('I consent to using fictional').check();
    await page.getByRole('button', { name: 'Submit registration' }).click();
    await page.getByRole('alert').waitFor();
    await page.getByLabel('Fictional exemption evidence', { exact: true }).setInputFiles({
      name: 'evidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 ficticio'),
    });
    await page.getByRole('button', { name: 'Submit registration' }).click();
    await page.getByRole('status').filter({ hasText: 'Registration sent' }).waitFor();
    await page.getByRole('link', { name: 'Switch profile' }).click();
    await page.getByRole('button', { name: /Recepción/ }).click();
    await page.getByRole('button', { name: /Emily Carter/ }).click();
    await page.getByText('Evidencia de exención: evidence.pdf', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'OK: cinco tamaños, rutas sin desbordamiento, filtros del tablero, registro EN con evidencia compartida con recepción.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
