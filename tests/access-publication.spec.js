const { test, expect } = require('@playwright/test');
const active = page => page.locator('.layer[aria-hidden="false"]');
const modal = (page, name) => page.getByRole('dialog', { name, exact: true });
async function login(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(active(page).getByText('Meus imóveis', { exact: true })).toBeVisible();
}
async function pendingPlant(page) {
  await page.goto('/admin.html');
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByRole('button', { name: 'Pendentes', exact: true }).click();
  await active(page).getByText('Estrutural · Pavimento tipo', { exact: true }).click();
}
async function residentPlant(page) {
  await login(page);
  await active(page).getByRole('button').filter({ hasText: 'Edifício Pátio Cabral' }).click();
  await active(page).getByRole('button').filter({ hasText: 'Estrutural' }).click();
}
test.beforeEach(async ({ page }) => {
  page._errors = [];
  page.on('pageerror', error => page._errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') page._errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) page._errors.push(response.status() + ' ' + response.url()); });
  page.on('requestfailed', request => page._errors.push(request.url()));
  page.on('dialog', dialog => { page._errors.push('Diálogo nativo: ' + dialog.message()); dialog.dismiss(); });
});
test.afterEach(async ({ page }) => { expect(page._errors).toEqual([]); });

test('acesso: credenciais inválidas, conta desativada e identidade do morador autenticado', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Criar conta|Cadastrar-se/ })).toHaveCount(0);
  await page.getByLabel('Senha', { exact: true }).fill('incorreta123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => window.Demo.session())).toBeNull();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('nao-cadastrado@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('diego.prestes@email.com');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Conta desativada', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.Demo.session())).toBeNull();
  await page.screenshot({ path: 'test-results/conta-desativada-320.png' });
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('bruno.tavares@email.com');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(active(page).getByText('Olá, Bruno', { exact: true })).toBeVisible();
  await expect(active(page).getByText('Nenhum imóvel vinculado', { exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'Meus dados', exact: true }).click();
  await expect(active(page).getByText('bruno.tavares@email.com', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.Demo.session().userId)).toBe('u8');
});

for (const role of ['morador', 'admin', 'engenheiro']) {
  test(`sessão ${role}: expiração preserva dados e exige novo acesso`, async ({ page }) => {
    const id = { morador: 'u1', admin: 'u3', engenheiro: 'u2' }[role];
    if (role === 'morador') await login(page);
    else {
      await page.goto(role === 'admin' ? '/admin.html' : '/admin.html?perfil=engenheiro');
      await expect(active(page).getByText(role === 'admin' ? 'Gestão' : 'Área técnica', { exact: true })).toBeVisible();
    }
    await page.evaluate(id => {
      window.Demo.save('ADM_USERS', window.ADM_USERS.find(u => u.id === id), { phone: '(41) 99999-4567' });
      const session = window.Demo.session();
      session.expiresAt = Date.now() - 1;
      sessionStorage.setItem('gimball-session-v1', JSON.stringify(session));
      window.dispatchEvent(new Event('focus'));
    }, id);
    await expect(page.getByText('Sessão expirada', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.Demo.session())).toBeNull();
    await page.getByRole('button', { name: { morador: 'Morador', admin: 'Administrador', engenheiro: 'Engenheiro' }[role], exact: true }).click();
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    if (role !== 'morador') await page.waitForURL(role === 'admin' ? '**/admin.html' : '**/admin.html?perfil=engenheiro');
    await expect(active(page).getByText(role === 'morador' ? 'Meus imóveis' : role === 'admin' ? 'Gestão' : 'Área técnica', { exact: true })).toBeVisible();
    expect(await page.evaluate(id => window.ADM_USERS.find(u => u.id === id).phone, id)).toBe('(41) 99999-4567');
    expect(await page.evaluate(() => window.Demo.sessionIssue())).toBeNull();
  });
}

test('sessão expirada ao reabrir apresenta o motivo antes do novo acesso', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor();
  await page.evaluate(() => sessionStorage.setItem('gimball-session-v1', JSON.stringify({ userId: 'u1', role: 'morador', expiresAt: Date.now() - 1 })));
  await page.reload();
  await expect(page.getByText('Sessão expirada', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.Demo.session())).toBeNull();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(active(page).getByText('Meus imóveis', { exact: true })).toBeVisible();
});

test('conta desativada durante o uso encerra o acesso sem apagar os vínculos', async ({ page }) => {
  await login(page);
  await page.evaluate(() => window.Demo.save('ADM_USERS', window.ADM_USERS.find(u => u.id === 'u1'), { status: 'inactive' }));
  await expect(page.getByText('Acesso indisponível', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.ADM_USERS.find(u => u.id === 'u1').linked)).toEqual(['i1', 'i3', 'i5']);
  expect(await page.evaluate(() => window.Demo.session())).toBeNull();
});

test('liberação: valida modelo e marcador, confirma, persiste e permite retirada', async ({ page }) => {
  test.setTimeout(75000);
  await page.setViewportSize({ width: 320, height: 568 });
  await pendingPlant(page);
  await active(page).getByRole('button', { name: /^Liberar planta/ }).click();
  await expect(active(page).getByRole('alert')).toHaveText('Carregue um modelo antes de liberar a planta.');
  await active(page).getByRole('button', { name: /^Carregar modelo/ }).click();
  await modal(page, 'Carregar modelo').getByText('Usar modelo de exemplo', { exact: true }).click();
  await modal(page, 'Carregar modelo').getByRole('button', { name: 'Carregar', exact: true }).click();
  await expect(active(page).getByLabel('Versão', { exact: true })).toHaveValue('v1.0');
  await active(page).getByRole('button', { name: /^Liberar planta/ }).click();
  await expect(active(page).getByRole('alert')).toContainText('Gere um marcador');
  await active(page).getByRole('button', { name: 'Gerar marcador', exact: true }).click();
  await active(page).getByRole('button', { name: /^Liberar planta/ }).click();
  await expect(active(page).getByLabel('Localização', { exact: true })).toBeFocused();
  await active(page).getByLabel('Localização', { exact: true }).fill('Pilar P2, sala');
  await active(page).getByRole('button', { name: /^Liberar planta/ }).click();
  await modal(page, 'Liberar planta?').getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(await page.evaluate(() => window.ADM_PLANTAS.find(p => p.id === 'p5').status)).toBe('pending');
  await active(page).getByRole('button', { name: /^Liberar planta/ }).click();
  await page.screenshot({ path: 'test-results/liberar-planta-modal-320.png' });
  await modal(page, 'Liberar planta?').getByRole('button', { name: 'Liberar', exact: true }).click();
  await expect(active(page).getByText('Disponível', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.ADM_PLANTAS.find(p => p.id === 'p5').availabilityBy)).toBe('u3');
  await residentPlant(page);
  await expect(active(page).getByRole('button', { name: 'Visualizar planta', exact: true })).toBeEnabled();
  await page.goto('/admin.html');
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByRole('button', { name: 'Disponíveis', exact: true }).click();
  await active(page).getByRole('button').filter({ hasText: 'Unidade 802' }).filter({ hasText: 'Estrutural · Pavimento tipo' }).click();
  await active(page).getByRole('button', { name: /^Retirar de disponibilidade/ }).click();
  await modal(page, 'Retirar disponibilidade?').getByRole('button', { name: 'Retirar', exact: true }).click();
  await residentPlant(page);
  await expect(active(page).getByRole('button', { name: 'Aguardando liberação', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => window.ADM_PLANTAS.find(p => p.id === 'p5').marker.location)).toBe('Pilar P2, sala');
});

test('engenheiro prepara plantas pendentes e não pode liberá-las', async ({ page }) => {
  await page.goto('/admin.html?perfil=engenheiro');
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByRole('button', { name: 'Pendentes', exact: true }).click();
  await active(page).getByText('Estrutural · Térreo', { exact: true }).click();
  await expect(active(page).getByRole('button', { name: /^Liberar planta/ })).toHaveCount(0);
  await active(page).getByRole('button', { name: /^Carregar modelo/ }).click();
  await modal(page, 'Carregar modelo').getByText('Usar modelo de exemplo', { exact: true }).click();
  await modal(page, 'Carregar modelo').getByRole('button', { name: 'Carregar', exact: true }).click();
  await active(page).getByRole('button', { name: 'Gerar marcador', exact: true }).click();
  await active(page).getByLabel('Localização', { exact: true }).fill('Pilar do térreo');
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  const result = await page.evaluate(() => ({
    error: window.Demo.setPlantAvailability('p7', 'available', 'u2').error,
    plant: window.ADM_PLANTAS.find(p => p.id === 'p7'),
  }));
  expect(result.error).toContain('exclusiva do Administrador');
  expect(result.plant.status).toBe('pending');
  expect(result.plant.marker.location).toBe('Pilar do térreo');
});

test('substituir modelo disponível exige nova liberação e mantém o mesmo cadastro', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true }).click();
  await active(page).getByRole('button', { name: /^Carregar modelo/ }).click();
  await modal(page, 'Carregar modelo').getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(await page.evaluate(() => window.ADM_PLANTAS.find(p => p.id === 'p1').status)).toBe('available');
  await active(page).getByRole('button', { name: /^Carregar modelo/ }).click();
  await modal(page, 'Carregar modelo').getByText('Usar modelo de exemplo', { exact: true }).click();
  await modal(page, 'Carregar modelo').getByRole('button', { name: 'Carregar', exact: true }).click();
  await expect(active(page).getByText('Pendente', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({ count: window.ADM_PLANTAS.length, code: window.ADM_PLANTAS.find(p => p.id === 'p1').marker.code }))).toEqual({ count: 7, code: 21 });
});

test('carregar modelo preserva nome, versão e localização editados antes do envio', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true }).click();
  await active(page).getByLabel('Nome', { exact: true }).fill('Hidrossanitário revisado');
  await active(page).getByLabel('Versão', { exact: true }).fill('v3.0');
  await active(page).getByLabel('Localização', { exact: true }).fill('Hall revisado, parede sul');
  await active(page).getByRole('button', { name: /^Carregar modelo/ }).click();
  await modal(page, 'Carregar modelo').getByText('Usar modelo de exemplo', { exact: true }).click();
  await modal(page, 'Carregar modelo').getByRole('button', { name: 'Carregar', exact: true }).click();
  await expect(active(page).getByLabel('Nome', { exact: true })).toHaveValue('Hidrossanitário revisado');
  await expect(active(page).getByLabel('Versão', { exact: true })).toHaveValue('v3.0');
  await expect(active(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall revisado, parede sul');
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(active(page).getByText('Hidrossanitário revisado', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await active(page).getByText('Hidrossanitário revisado', { exact: true }).click();
  await expect(active(page).getByLabel('Versão', { exact: true })).toHaveValue('v3.0');
  await expect(active(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall revisado, parede sul');
  await expect(active(page).getByText('Pendente', { exact: true })).toBeVisible();
});

test('câmera: indisponibilidade, recusa, revisão da permissão e retorno à prévia', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page);
  await active(page).getByRole('button').filter({ hasText: 'Residencial Aurora' }).click();
  await active(page).getByRole('button').filter({ hasText: 'Hidrossanitário' }).click();
  await active(page).getByRole('button', { name: 'Visualizar planta', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Permita o acesso à câmera', exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'A câmera não abre', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Câmera indisponível', exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await active(page).getByRole('button', { name: 'Permitir câmera', exact: true }).click();
  await modal(page, 'Permitir acesso à câmera?').getByRole('button', { name: 'Agora não', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Acesso à câmera não permitido', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/camera-permissao-negada-320.png' });
  await active(page).getByRole('button', { name: 'Voltar às plantas', exact: true }).click();
  await active(page).getByRole('button', { name: 'Visualizar planta', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Acesso à câmera não permitido', exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'Revisar permissão', exact: true }).click();
  await modal(page, 'Permitir acesso à câmera?').getByRole('button', { name: 'Permitir', exact: true }).click();
  await expect(active(page).getByText('Enquadre o marcador', { exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'Ajuda', exact: true }).click();
  await active(page).getByRole('button', { name: 'A câmera não abre', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Câmera indisponível', exact: true })).toBeVisible();
  await active(page).getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(active(page).getByText('Enquadre o marcador', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('gimball-camera-permission'))).toBe('granted');
});
