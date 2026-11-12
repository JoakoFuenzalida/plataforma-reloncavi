const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:4202';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const errores = [];
    const nueva = async () => { const p = await browser.newPage(); p.on('pageerror', (e) => errores.push(e.message)); return p; };

    // 1. Personal: correo corporativo, validación de dominio y segundo factor.
    let page = await nueva();
    await page.goto(base + '/acceso?modo=corporativo');
    await page.getByLabel('Correo corporativo').fill('camila@gmail.com');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByText('Usa tu correo corporativo terminado en @reloncavi.cl.').waitFor();
    await page.getByLabel('Perfil de demostración').selectOption('gerencia-hotel');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Código de verificación').fill('111111');
    await page.getByRole('button', { name: 'Verificar e ingresar' }).click();
    await page.getByRole('alert').filter({ hasText: 'no coincide' }).waitFor();
    await page.getByLabel('Código de verificación').fill('482913');
    await page.getByRole('button', { name: 'Verificar e ingresar' }).click();
    await page.waitForURL('**/personal/inicio');
    await page.getByRole('heading', { name: 'Buenos días, Andrés' }).waitFor();
    assert.ok(await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('link', { name: 'Tablero' }).isVisible());
    await page.close();

    // 2. Terreno: primer día de temporada, creación de PIN y recorrido guiado.
    page = await nueva();
    await page.goto(base + '/acceso?modo=terreno');
    await page.getByLabel('Es mi primer día de temporada (activar credencial)').check();
    await page.getByRole('button', { name: 'Simular lectura de credencial' }).click();
    await page.getByText('Crea tu PIN de 4 dígitos').waitFor();
    for (const d of '1357') await page.getByRole('button', { name: 'Dígito ' + d, exact: true }).click();
    await page.getByText('Repite tu nuevo PIN').waitFor();
    for (const d of '1357') await page.getByRole('button', { name: 'Dígito ' + d, exact: true }).click();
    await page.waitForURL('**/personal/inicio');
    const dialogo = page.getByRole('dialog');
    await dialogo.getByText('Bienvenida a tu primer día, Marta').waitFor();
    for (let i = 0; i < 3; i++) await dialogo.getByRole('button', { name: 'Siguiente' }).click();
    await dialogo.getByRole('button', { name: 'Comenzar' }).click();
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    assert.equal(await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('link', { name: 'Tablero' }).count(), 0, 'Housekeeping no ve el tablero');
    await page.close();

    // 3. Huésped: correo, código y portal autenticado.
    page = await nueva();
    await page.goto(base + '/acceso?modo=huesped');
    await page.getByRole('button', { name: 'Enviarme un código' }).click();
    await page.getByLabel('Código', { exact: true }).fill('731905');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/cuenta');
    await page.getByRole('heading', { name: 'Hola, Emily' }).waitFor();
    await page.getByRole('heading', { name: 'Mis reservas' }).waitFor();
    await page.close();

    // 4. Registro de huésped en cinco pasos; la ficha queda en el padrón.
    page = await nueva();
    await page.goto(base + '/cuenta/registro');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('alert').filter({ hasText: 'Ingresa tus nombres.' }).waitFor();
    await page.getByLabel('Nombres').fill('Lucía');
    await page.getByLabel('Apellidos').fill('Ferrari');
    await page.getByLabel('Correo electrónico').fill('lucia.ferrari@example.com');
    await page.getByLabel('Teléfono móvil').fill('+39 333 123 4567');
    await page.getByLabel('País de residencia').fill('Italia');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByLabel('Número de documento').fill('YA1234567');
    await page.getByLabel('País emisor').fill('Italia');
    await page.locator('input[type=file]').setInputFiles({ name: 'pasaporte.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('ficticio') });
    await page.getByText('pasaporte.jpg').waitFor();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByLabel('Piso alto').check();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('alert').filter({ hasText: 'autorización' }).waitFor();
    await page.getByLabel(/Autorizo el tratamiento/).check();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByLabel('Código enviado a tu correo').fill('560284');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await page.getByRole('heading', { name: 'Tu cuenta está lista' }).waitFor();
    await page.getByRole('link', { name: 'Ir a mi cuenta' }).click();
    await page.getByRole('heading', { name: 'Hola, Lucía' }).waitFor();
    await page.getByText('Aún no tienes reservas').waitFor();
    await page.close();

    // 5. Recuperación de acceso con requisitos de contraseña en tiempo real.
    page = await nueva();
    await page.goto(base + '/acceso/recuperar');
    await page.getByRole('button', { name: 'Enviar código' }).click();
    await page.getByLabel('Código').fill('205117');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Nueva contraseña').fill('corta');
    await page.getByLabel('Repite la contraseña').fill('corta');
    await page.getByRole('button', { name: 'Guardar contraseña' }).click();
    await page.getByRole('alert').filter({ hasText: 'requisitos' }).waitFor();
    await page.getByLabel('Nueva contraseña').fill('Patagonia-Sur-2029');
    await page.getByLabel('Repite la contraseña').fill('Patagonia-Sur-2029');
    await page.getByRole('button', { name: 'Guardar contraseña' }).click();
    await page.getByRole('heading', { name: 'Contraseña actualizada' }).waitFor();
    await page.close();

    assert.deepEqual(errores, []);
    console.log('accesos: ok');
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
