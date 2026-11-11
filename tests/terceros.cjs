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
    await page.goto('http://127.0.0.1:4202/personal/huespedes');
    await page.getByRole('link', { name: 'Agencias y turoperadores', exact: true }).click();
    await page.getByRole('button', { name: /Viajes del Sur/ }).click();
    await page.getByRole('button', { name: 'Vincular reserva', exact: true }).click();
    await page.getByRole('alert').waitFor();
    await page.locator('#reserva-comercial').selectOption({ index: 1 });
    await page.getByLabel('Comisión aplicada (%)', { exact: true }).fill('15');
    await page
      .getByLabel('Fundamento de vinculación', { exact: true })
      .fill('Comisión recibida del canal para revisión comercial.');
    await page.getByRole('button', { name: 'Vincular reserva', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Reserva vinculada' }).waitFor();
    await page.getByText('Diferencia: 3 puntos porcentuales.', { exact: true }).waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Editar acuerdo', exact: true }).isDisabled(),
      true,
    );
    await page.getByLabel('Noche consultada', { exact: true }).fill('2028-01-01');
    await page.getByText('La noche consultada está fuera de vigencia.', { exact: true }).waitFor();
    await page.getByLabel('Buscar por nombre o contrato', { exact: true }).fill('inexistente');
    await page
      .getByText('No hay acuerdos que coincidan con la búsqueda.', { exact: true })
      .waitFor();
    await page.getByRole('button', { name: 'Nuevo acuerdo', exact: true }).click();
    await page.getByRole('button', { name: 'Guardar acuerdo', exact: true }).click();
    await page.getByRole('alert').waitFor();
    for (const [label, value] of [
      ['Nombre', 'Agencia Prueba'],
      ['Correo de contacto', 'prueba@example.com'],
      ['Código de contrato o convenio', 'AG-TEST'],
      ['Condiciones', 'Pago ficticio a treinta días.'],
    ])
      await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole('button', { name: 'Guardar acuerdo', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Acuerdo guardado' }).waitFor();
    await page.getByRole('button', { name: 'Editar acuerdo', exact: true }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('Agencia Editada');
    await page.getByRole('button', { name: 'Guardar acuerdo', exact: true }).click();
    await page.getByRole('heading', { name: 'Agencia Editada', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Empresas con convenio', exact: true }).click();
    await page.getByRole('button', { name: /Austral Servicios/ }).click();
    await page.locator('#reserva-comercial').selectOption({ index: 1 });
    await page
      .getByLabel('Fundamento de vinculación', { exact: true })
      .fill('Orden de compra de demostración revisada.');
    await page.getByRole('button', { name: 'Vincular reserva', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Reserva vinculada' }).waitFor();
    await page.getByText('Diferencia por revisar', { exact: true }).waitFor();
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
    console.log(
      await page.evaluate(() => {
        const s = ng.getComponent(document.querySelector('app-terceros')).comercial,
          op = s.op;
        const check = (v, m) => {
          if (!v) throw Error(m);
        };
        const t = s.terceros().find((t) => t.id === 'agencia-sur');
        check(!!s.guardar({ ...t, cupo: 3 }), 'No alterar condiciones vinculadas');
        check(
          !!s.guardar({ ...t, id: '', contrato: 'INVALIDO', desde: '2029-02-30' }),
          'Fecha inexistente',
        );
        check(
          !!s.guardar({ ...t, id: '', contrato: 'INVALIDO', comision: NaN }),
          'Comisión no numérica',
        );
        check(!!s.guardar({ ...t, id: '', contrato: 'INVALIDO', cupo: 1.5 }), 'Cupo fraccionario');
        check(!!s.guardar({ ...t, id: '', contrato: 'ag-2029-01' }), 'Contrato duplicado');
        const contrato = {
          ...t,
          id: '',
          nombre: 'Cupo de prueba',
          contrato: 'CUPO-TEST',
          hotelId: 'puerto-varas',
          cupo: 1,
        };
        check(!s.guardar(contrato), 'Crear acuerdo');
        const nuevo = s.terceros().find((t) => t.contrato === 'CUPO-TEST');
        const reservar = (llegada, salida) => {
          op.borrador.set({
            hotelId: 'puerto-varas',
            tipo: 'STD',
            llegada,
            salida,
            adultos: 1,
            huesped: op.huespedPorId('huesped-emily'),
          });
          return op.confirmarReserva();
        };
        const a = reservar('2029-03-01', '2029-03-03'),
          b = reservar('2029-03-02', '2029-03-04'),
          c = reservar('2029-03-03', '2029-03-04');
        check(a && b && c, 'Crear reservas prueba');
        const total = a.totalAlojamientoClp;
        check(
          !s.vincular(nuevo.id, a.id, 12, 'Asignación comercial de prueba.'),
          'Vincular primera',
        );
        check(
          s.vincular(nuevo.id, b.id, 12, 'Asignación comercial de prueba.').includes('agotado'),
          'Bloqueo noche intermedia',
        );
        check(
          !s.vincular(nuevo.id, c.id, 12, 'Asignación comercial de prueba.'),
          'Salida no ocupa la noche siguiente',
        );
        check(
          s.uso(nuevo.id, '2029-03-02') === 1 && s.uso(nuevo.id, '2029-03-03') === 1,
          'Cupo por noche',
        );
        check(
          !!s.vincular(nuevo.id, a.id, 12, 'Asignación comercial de prueba.'),
          'No duplicar vínculo',
        );
        check(op.reservaPorId(a.id).totalAlojamientoClp === total, 'No modifica pagos ni tarifas');
        check(
          s.diferencia(s.vinculos().find((v) => v.reservaId === a.id)) === 0,
          'Acuerdo conforme',
        );
        const otro = { ...contrato, contrato: 'OTRO', categoria: 'SUP' };
        check(!s.guardar(otro), 'Otro contrato');
        check(
          !!s.vincular(
            s.terceros().find((t) => t.contrato === 'OTRO').id,
            b.id,
            12,
            'Asignación comercial de prueba.',
          ),
          'Categoría incompatible',
        );
        return 'OK: validaciones, contratos inmutables, cupos por noche, solapamientos, límites de salida, vínculos únicos y conservación de pagos.';
      }),
    );
    assert.deepEqual(errors, []);
    console.log('OK: agencias, empresas, creación/edición, filtros, comparación y cinco tamaños.');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
