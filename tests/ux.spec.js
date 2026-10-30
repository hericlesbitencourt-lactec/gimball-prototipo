const { test, expect } = require('@playwright/test');
const active = page => page.locator('.layer[aria-hidden="false"]');

test.beforeEach(async ({ page }) => {
  page._errors = [];
  page.on('pageerror', error => page._errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') page._errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) page._errors.push(response.status() + ' ' + response.url()); });
  page.on('requestfailed', request => page._errors.push(request.url()));
  page.on('dialog', dialog => { page._errors.push('Diálogo do navegador: ' + dialog.message()); dialog.dismiss(); });
});
test.afterEach(async ({ page }) => { expect(page._errors).toEqual([]); });

test('plantas: nome integral em 320 px e edição com erros junto aos campos', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/admin.html');
  await expect(active(page).getByText('Gestão', { exact: true })).toBeVisible();
  const name = 'Hidrossanitário · Distribuição de água fria e quente do pavimento tipo';
  await page.evaluate(name => window.Demo.save('ADM_PLANTAS', window.ADM_PLANTAS[0], { name }), name);
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  const title = active(page).getByText(name, { exact: true });
  await expect(title).toBeVisible();
  const metrics = await title.evaluate(node => ({
    height: node.clientHeight, line: parseFloat(getComputedStyle(node).lineHeight),
    width: node.clientWidth, scrollWidth: node.scrollWidth,
  }));
  expect(metrics.height).toBeGreaterThan(metrics.line * 1.8);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width);
  const card = active(page).getByRole('button').filter({ hasText: name });
  await expect(card).toContainText('As-built');
  await expect(card).toContainText('v2.1');
  await expect(card).toContainText('Torre B · Apto 1204');
  await page.screenshot({ path: 'test-results/ux-plantas-320.png' });
  await title.click();
  await active(page).getByLabel('Nome', { exact: true }).fill('');
  await active(page).getByLabel('Versão', { exact: true }).fill('');
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(active(page).getByLabel('Nome', { exact: true })).toBeFocused();
  await expect(active(page).getByLabel('Nome', { exact: true })).toHaveAccessibleDescription('Informe o nome da planta.');
  await active(page).getByLabel('Nome', { exact: true }).fill(name);
  await expect(active(page).getByText('Informe o nome da planta.', { exact: true })).toHaveCount(0);
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(active(page).getByLabel('Versão', { exact: true })).toBeFocused();
  await active(page).getByLabel('Versão', { exact: true }).fill('v3.0');
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(active(page).getByRole('button').filter({ hasText: name })).toContainText('v3.0');
});

for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`AR ${size.width}: localização, referência e ações acessíveis antes da prévia`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/admin.html');
    await expect(active(page).getByText('Gestão', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Plantas', exact: true }).click();
    await active(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true }).click();
    await active(page).getByRole('button', { name: /^Visualizar em AR/ }).click();
    await expect(active(page).getByText('Hall hidráulico, parede norte', { exact: true })).toBeVisible();
    await expect(active(page).getByText('tag36h11 · id 21 · 16,0 cm', { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    const surface = await page.locator('.app-surface').boundingBox();
    for (const name of ['Abrir prévia', 'Não consigo ler o marcador']) {
      const button = active(page).getByRole('button', { name, exact: true });
      const box = await button.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(surface.y + surface.height - 24);
      expect(box.x + box.width).toBeLessThanOrEqual(surface.x + surface.width);
    }
    await page.screenshot({ path: `test-results/ux-ar-${size.width}.png` });
    await active(page).getByRole('button', { name: 'Abrir prévia', exact: true }).click();
    await expect(active(page).getByText('Prévia AR · Modelo ilustrativo', { exact: true })).toBeVisible();
  });
}
