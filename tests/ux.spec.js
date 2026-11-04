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

async function expectWhiteAction(button) {
  const colors = await button.evaluate(node => { const style = getComputedStyle(node); return { color: style.color, bg: style.backgroundColor }; });
  expect(colors.color).toBe('rgb(255, 255, 255)');
  const luminance = color => {
    const c = color.match(/[\d.]+/g).slice(0, 3).map(v => { v = Number(v) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  expect(1.05 / (luminance(colors.bg) + .05)).toBeGreaterThanOrEqual(4.5);
}

test('privacidade no login: leitura, rolagem, retorno e botão com texto branco', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('politica@example.com');
  await expectWhiteAction(page.getByRole('button', { name: 'Entrar', exact: true }));
  await page.getByRole('button', { name: 'Política de privacidade', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible();
  await expect(page.getByText('Conteúdo ilustrativo', { exact: true })).toBeVisible();
  await expect(page.locator('article')).toContainText('Lorem ipsum');
  await page.getByRole('heading', { name: '4. Contato e direitos', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: '4. Contato e direitos', exact: true })).toBeInViewport();
  await page.screenshot({ path: 'test-results/privacidade-320.png' });
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('politica@example.com');
});

for (const role of ['morador', 'admin', 'engenheiro']) {
  test(`privacidade ${role}: navegação autenticada e controles de ação claros`, async ({ page }) => {
    if (role === 'morador') {
      await page.goto('/');
      await page.getByRole('button', { name: 'Entrar', exact: true }).click();
      await active(page).getByRole('button', { name: 'Meus dados', exact: true }).click();
    } else {
      await page.goto(role === 'admin' ? '/admin.html' : '/admin.html?perfil=engenheiro');
      await page.getByRole('button', { name: 'Mais', exact: true }).click();
      if (role === 'engenheiro') await active(page).getByRole('button', { name: /Meus dados/ }).click();
    }
    await active(page).getByRole('button', { name: 'Política de privacidade', exact: true }).click();
    await expect(active(page).getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible();
    await active(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(page.locator('.lyr-out')).toHaveCount(0);
    await expect(active(page).getByRole('button', { name: 'Política de privacidade', exact: true })).toBeVisible();
    await active(page).getByRole('button', { name: 'Termos de uso', exact: true }).click();
    await expect(active(page).getByRole('heading', { name: 'Termos de uso', exact: true })).toBeVisible();
    await active(page).getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(page.locator('.lyr-out')).toHaveCount(0);
    if (role === 'admin') {
      await page.getByRole('button', { name: 'Plantas', exact: true }).click();
      const send = active(page).getByRole('button', { name: 'Enviar', exact: true });
      await expectWhiteAction(send);
      expect(await send.locator('svg').evaluate(node => getComputedStyle(node).color)).toBe('rgb(255, 255, 255)');
      await send.click();
      const sheet = page.getByRole('dialog', { name: 'Enviar planta', exact: true });
      await sheet.getByText('Usar modelo de exemplo', { exact: true }).click();
      await expectWhiteAction(sheet.getByRole('button', { name: 'Enviar', exact: true }));
      await sheet.getByRole('button', { name: 'Cancelar', exact: true }).click();
    }
  });
}

test('termos no login: leitura e retorno preservam os dados de acesso', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('termos@example.com');
  await page.getByRole('button', { name: 'Termos de uso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Termos de uso', exact: true })).toBeVisible();
  await expect(page.getByText('Conteúdo ilustrativo', { exact: true })).toBeVisible();
  await page.getByRole('heading', { name: '4. Disposições gerais', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: '4. Disposições gerais', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('termos@example.com');
});

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
    await active(page).getByRole('button', { name: 'Permitir câmera', exact: true }).click();
    await page.getByRole('dialog', { name: 'Permitir acesso à câmera?', exact: true }).getByRole('button', { name: 'Permitir', exact: true }).click();
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
