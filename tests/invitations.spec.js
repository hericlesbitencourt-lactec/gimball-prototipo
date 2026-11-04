const { test, expect } = require('@playwright/test');
const active = page => page.locator('.layer[aria-hidden="false"]');
const modal = (page, name) => page.getByRole('dialog', { name, exact: true });
async function createUser(page, { name = 'Ana Convidada', email = 'ana.convite@example.com', role = 'morador', link = false } = {}) {
  await page.goto('/admin.html');
  await active(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await active(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await active(page).getByLabel('Nome', { exact: true }).fill(name);
  await active(page).getByLabel('E-mail', { exact: true }).fill(email);
  if (role !== 'morador') {
    await active(page).getByRole('button', { name: 'Papel', exact: true }).click();
    await modal(page, 'Papel de acesso').getByText(role === 'admin' ? 'Administrador' : 'Engenheiro', { exact: true }).click();
  }
  if (link) {
    await active(page).getByRole('button', { name: /^Vincular imóvel/ }).click();
    await modal(page, 'Vincular imóvel').getByRole('textbox').fill('1204');
    await modal(page, 'Vincular imóvel').getByRole('button').filter({ hasText: 'Torre B · Apto 1204' }).click();
    await modal(page, 'Vincular imóvel').getByRole('button', { name: 'Concluir', exact: true }).click();
  }
  await active(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Convite enviado', exact: true })).toBeVisible();
  await expect(active(page).getByRole('heading', { name: 'Convite enviado', exact: true })).toBeInViewport();
  return page.evaluate(email => window.ADM_USERS.find(u => u.email === email), email);
}
async function openUser(page, name = 'Ana Convidada') {
  await page.goto('/admin.html');
  await active(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await active(page).getByText(name, { exact: true }).click();
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

test('primeiro acesso: cadastro interno, clique no e-mail, senha, ativação e imóveis vinculados', async ({ page }) => {
  test.setTimeout(75000);
  await page.setViewportSize({ width: 320, height: 568 });
  const user = await createUser(page, { link: true });
  expect(user.status).toBe('invited');
  expect(user.emailConfirmed).toBe(false);
  expect(await page.evaluate(email => window.Demo.signIn(email, 'demo1234', 'morador').field, user.email)).toBe('invitation');
  await page.screenshot({ path: 'test-results/convite-enviado-320.png' });
  await active(page).getByRole('button', { name: 'Simular clique no e-mail', exact: true }).click();
  await page.waitForURL('**/index.html?convite=*');
  await expect(active(page).getByRole('heading', { name: 'Defina sua senha', exact: true })).toBeVisible();
  await expect(active(page).getByText(user.email, { exact: true })).toBeVisible();
  await expect(active(page).getByRole('textbox', { name: 'E-mail', exact: true })).toHaveCount(0);
  await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
  await expect(active(page).getByLabel('Senha', { exact: true })).toBeFocused();
  await active(page).getByRole('checkbox', { name: 'Aceito a Política de privacidade e os Termos de uso', exact: true }).check();
  await active(page).getByLabel('Senha', { exact: true }).fill('MinhaSenha123');
  await active(page).getByRole('button', { name: 'Mostrar senha', exact: true }).click();
  await expect(active(page).getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await expect(active(page).getByLabel('Confirmar senha', { exact: true })).toHaveAttribute('type', 'password');
  await active(page).getByRole('button', { name: 'Ocultar senha', exact: true }).click();
  await active(page).getByLabel('Confirmar senha', { exact: true }).fill('diferente123');
  await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
  await expect(active(page).getByRole('alert')).toHaveText('As senhas não coincidem.');
  await active(page).getByLabel('Confirmar senha', { exact: true }).fill('MinhaSenha123');
  await active(page).getByRole('button', { name: 'Política de privacidade', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(active(page).getByLabel('Senha', { exact: true })).toHaveValue('MinhaSenha123');
  await page.screenshot({ path: 'test-results/definir-primeira-senha-320.png' });
  await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Senha definida com sucesso', exact: true })).toBeVisible();
  await expect(active(page).getByRole('heading', { name: 'Senha definida com sucesso', exact: true })).toBeInViewport();
  const activated = await page.evaluate(id => window.ADM_USERS.find(u => u.id === id), user.id);
  expect(activated.status).toBe('active');
  expect(activated.emailConfirmed).toBe(true);
  expect(activated.invitation.usedAt).toBeTruthy();
  expect(activated.legalAcceptance.privacy.version).toBe('ilustrativo-v1');
  expect(activated.legalAcceptance.terms.acceptedAt).toBe(activated.invitation.usedAt);
  await active(page).getByRole('button', { name: 'Ir para login', exact: true }).click();
  await page.waitForURL('**/index.html?perfil=morador&email=*');
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue(user.email);
  await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('');
  expect(page.url()).not.toContain('MinhaSenha123');
  await page.getByLabel('Senha', { exact: true }).fill('MinhaSenha123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(active(page).getByText('Olá, Ana', { exact: true })).toBeVisible();
  await expect(active(page).getByText('Residencial Aurora', { exact: true })).toBeVisible();
  await page.goto('/index.html?convite=' + user.invitation.token);
  await expect(active(page).getByRole('heading', { name: 'Convite já utilizado', exact: true })).toBeVisible();
  await expect(active(page).getByLabel('Senha', { exact: true })).toHaveCount(0);
});

for (const role of ['engenheiro', 'admin']) {
  test(`convite ${role}: ativa o perfil cadastrado e mantém a identidade no login`, async ({ page }) => {
    test.setTimeout(60000);
    const user = await createUser(page, { name: 'Pessoa Convidada', email: role + '.convite@example.com', role });
    await active(page).getByRole('button', { name: 'Simular clique no e-mail', exact: true }).click();
    await active(page).getByLabel('Senha', { exact: true }).fill('Convite12345');
    await active(page).getByLabel('Confirmar senha', { exact: true }).fill('Convite12345');
    await active(page).getByRole('checkbox', { name: 'Aceito a Política de privacidade e os Termos de uso', exact: true }).check();
    await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
    await active(page).getByRole('button', { name: 'Ir para login', exact: true }).click();
    await page.waitForURL('**/index.html?perfil=' + role + '&email=*');
    await expect(page.getByRole('button', { name: role === 'admin' ? 'Administrador' : 'Engenheiro', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('Senha', { exact: true }).fill('Convite12345');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.waitForURL(role === 'admin' ? '**/admin.html' : '**/admin.html?perfil=engenheiro');
    await page.getByRole('button', { name: 'Mais', exact: true }).click();
    await active(page).getByRole('button', { name: /Meus dados/ }).click();
    await expect(active(page).getByText(user.email, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.Demo.session().userId)).toBe(user.id);
  });
}

test('primeiro acesso exige aceite dos dois documentos e preserva o formulário durante a leitura', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 568 });
  const user = await createUser(page);
  await active(page).getByRole('button', { name: 'Simular clique no e-mail', exact: true }).click();
  await active(page).getByLabel('Senha', { exact: true }).fill('Aceite12345');
  await active(page).getByLabel('Confirmar senha', { exact: true }).fill('Aceite12345');
  await active(page).getByRole('button', { name: 'Mostrar confirmação de senha', exact: true }).click();
  await expect(active(page).getByLabel('Confirmar senha', { exact: true })).toHaveAttribute('type', 'text');
  await expect(active(page).getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'password');
  await expect(active(page).getByRole('checkbox', { name: 'Mostrar senhas', exact: true })).toHaveCount(0);
  await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
  const acceptance = active(page).getByRole('checkbox', { name: 'Aceito a Política de privacidade e os Termos de uso', exact: true });
  await expect(acceptance).not.toBeChecked();
  await expect(acceptance).toBeFocused();
  await expect(active(page).getByRole('alert')).toHaveText('Aceite a Política de privacidade e os Termos de uso para ativar a conta.');
  const invalid = await page.evaluate(token => {
    const partial = window.Demo.acceptInvitation(token, 'Aceite12345', { privacy: true, terms: false, privacyVersion: 'ilustrativo-v1', termsVersion: 'ilustrativo-v1' });
    const stale = window.Demo.acceptInvitation(token, 'Aceite12345', { privacy: true, terms: true, privacyVersion: 'antiga', termsVersion: 'ilustrativo-v1' });
    return { partial: partial.error, stale: stale.error, state: window.Demo.inspectInvitation(token).state };
  }, user.invitation.token);
  expect(invalid.partial).toContain('Aceite a Política');
  expect(invalid.stale).toContain('documentos foram atualizados');
  expect(invalid.state).toBe('valid');
  await active(page).getByRole('button', { name: 'Termos de uso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Termos de uso', exact: true })).toBeVisible();
  await expect(page.locator('article')).toContainText('Lorem ipsum');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(active(page).getByLabel('Senha', { exact: true })).toHaveValue('Aceite12345');
  await expect(acceptance).not.toBeChecked();
  await acceptance.check();
  await active(page).getByRole('button', { name: 'Política de privacidade', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(acceptance).toBeChecked();
  await acceptance.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/aceite-primeiro-acesso-320.png' });
  await active(page).getByRole('button', { name: 'Definir senha e ativar conta', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Senha definida com sucesso', exact: true })).toBeVisible();
  const record = await page.evaluate(id => window.ADM_USERS.find(u => u.id === id), user.id);
  expect(record.status).toBe('active');
  expect(record.legalAcceptance.privacy.version).toBe('ilustrativo-v1');
  expect(record.legalAcceptance.terms.version).toBe('ilustrativo-v1');
  expect(record.legalAcceptance.privacy.acceptedAt).toBe(record.invitation.usedAt);
});

test('convite expirado e reenvio: cancelar preserva o link; reenviar invalida o anterior', async ({ page }) => {
  test.setTimeout(60000);
  const user = await createUser(page);
  await page.evaluate(id => { window.ADM_USERS.find(u => u.id === id).invitation.expiresAt = Date.now() - 1; window.Demo.notify(); }, user.id);
  await active(page).getByRole('button', { name: 'Simular clique no e-mail', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Convite expirado', exact: true })).toBeVisible();
  await openUser(page);
  await active(page).getByRole('button', { name: /^Reenviar convite/ }).click();
  await modal(page, 'Reenviar convite?').getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(await page.evaluate(id => window.ADM_USERS.find(u => u.id === id).invitation.token, user.id)).toBe(user.invitation.token);
  await active(page).getByRole('button', { name: /^Reenviar convite/ }).click();
  await modal(page, 'Reenviar convite?').getByRole('button', { name: 'Reenviar', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Convite enviado', exact: true })).toBeVisible();
  const updated = await page.evaluate(id => window.ADM_USERS.find(u => u.id === id), user.id);
  expect(updated.invitation.token).not.toBe(user.invitation.token);
  expect(updated.invitation.expiresAt).toBeGreaterThan(Date.now());
  await page.goto('/index.html?convite=' + user.invitation.token);
  await expect(active(page).getByRole('heading', { name: 'Convite inválido', exact: true })).toBeVisible();
  await page.goto('/index.html?convite=' + updated.invitation.token);
  await expect(active(page).getByRole('heading', { name: 'Defina sua senha', exact: true })).toBeVisible();
});

test('desativar uma conta pendente bloqueia o convite; reativar preserva a ativação pendente', async ({ page }) => {
  const user = await createUser(page);
  await openUser(page);
  await active(page).getByRole('button', { name: 'Desativar usuário', exact: true }).click();
  await modal(page, 'Desativar usuário?').getByRole('button', { name: 'Desativar', exact: true }).click();
  await page.goto('/index.html?convite=' + user.invitation.token);
  await expect(active(page).getByRole('heading', { name: 'Convite indisponível', exact: true })).toBeVisible();
  await openUser(page);
  await active(page).getByRole('button', { name: 'Reativar usuário', exact: true }).click();
  await modal(page, 'Reativar usuário?').getByRole('button', { name: 'Reativar', exact: true }).click();
  await expect(active(page).getByText('Aguardando ativação', { exact: true })).toBeVisible();
  expect(await page.evaluate(id => window.Demo.signIn(window.ADM_USERS.find(u => u.id === id).email, 'demo1234', 'morador').field, user.id)).toBe('invitation');
  await page.goto('/index.html?convite=' + user.invitation.token);
  await expect(active(page).getByRole('heading', { name: 'Defina sua senha', exact: true })).toBeVisible();
});

test('editar e-mail antes da ativação renova o convite para o endereço correto', async ({ page }) => {
  const user = await createUser(page);
  await openUser(page);
  await active(page).getByLabel('E-mail', { exact: true }).fill('ana.corrigida@example.com');
  await active(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(active(page).getByRole('heading', { name: 'Convite enviado', exact: true })).toBeVisible();
  await expect(active(page).getByText('ana.corrigida@example.com', { exact: true })).toBeVisible();
  expect(await page.evaluate(token => window.Demo.inspectInvitation(token).state, user.invitation.token)).toBe('invalid');
  await active(page).getByRole('button', { name: 'Simular clique no e-mail', exact: true }).click();
  await expect(active(page).getByText('ana.corrigida@example.com', { exact: true })).toBeVisible();
});

for (const width of [320, 390]) {
  test(`empreendimentos ${width}: lista, busca e acesso aos imóveis`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
    await page.goto('/admin.html');
    await page.getByRole('button', { name: 'Mais', exact: true }).click();
    await active(page).getByRole('button', { name: 'Empreendimentos', exact: true }).click();
    await expect(active(page).getByText('Empreendimentos', { exact: true })).toBeVisible();
    await expect(page.locator('.lyr-in, .lyr-fade')).toHaveCount(0);
    await page.screenshot({ path: `test-results/empreendimentos-lista-${width}.png` });
    await active(page).getByRole('textbox', { name: 'Buscar empreendimento', exact: true }).fill('lume');
    await expect(active(page).getByRole('button', { name: 'Editar Condomínio Vista Verde', exact: true })).toBeVisible();
    await expect(active(page).getByRole('button', { name: 'Editar Residencial Aurora', exact: true })).toHaveCount(0);
    await active(page).getByRole('textbox', { name: 'Buscar empreendimento', exact: true }).fill('nao-existe');
    await expect(active(page).getByText('Nenhum empreendimento', { exact: true })).toBeVisible();
    await active(page).getByRole('button', { name: 'Limpar busca', exact: true }).click();
    await active(page).getByRole('button', { name: 'Ver imóveis de Residencial Aurora', exact: true }).click();
    await expect(active(page).getByText('Torre B · Apto 1204', { exact: true })).toBeVisible();
    await expect(active(page).getByText('Torre A · Apto 0703', { exact: true })).toBeVisible();
    await expect(active(page).getByText('Unidade 802', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
